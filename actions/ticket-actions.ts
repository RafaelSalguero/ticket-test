'use server'

import { revalidatePath } from 'next/cache'
import { query, transaction } from '@/lib/db'
import { requireAuth } from '@/lib/auth'
import type { ApiResponse, Ticket } from '@/types'

interface TicketWithDetails extends Ticket {
  event_name?: string
  section_name?: string
  price?: number
}

export async function getAllSeats(
  eventId: string,
  sectionId: string
): Promise<Ticket[]> {
  try {
    // Get ALL tickets for a section, regardless of status
    // This includes available, reserved, and sold tickets
    const result = await query<Ticket>(
      `SELECT * FROM tickets 
       WHERE event_id = $1 
         AND section_id = $2 
       ORDER BY seat_number ASC`,
      [eventId, sectionId]
    )

    return result.rows
  } catch (error) {
    console.error('Error fetching all seats:', error)
    return []
  }
}

export async function reserveTickets(
  ticketIds: string[],
  userId: string
): Promise<ApiResponse<string[]>> {
  try {
    const user = await requireAuth()

    if (user.id !== userId) {
      return {
        success: false,
        error: 'Unauthorized',
      }
    }

    if (ticketIds.length === 0) {
      return {
        success: false,
        error: 'No tickets selected',
      }
    }

    // Use transaction for atomic reservation
    const reservedIds = await transaction(async (client) => {
      const reserved: string[] = []

      for (const ticketId of ticketIds) {
        // Get ticket details
        const ticketResult = await client.query<Ticket>(
          'SELECT * FROM tickets WHERE id = $1',
          [ticketId]
        )

        if (ticketResult.rows.length === 0) {
          continue
        }

        const ticket = ticketResult.rows[0]

        // CRITICAL: Atomic reservation using INSERT ON CONFLICT
        // This prevents double-booking by leveraging the unique constraint
        // on (event_id, section_id, seat_number)
        const reservationResult = await client.query<Ticket>(
          `INSERT INTO tickets (event_id, section_id, seat_number, user_id, status, reserved_at)
           VALUES ($1, $2, $3, $4, 'reserved', NOW())
           ON CONFLICT (event_id, section_id, seat_number) 
           DO UPDATE SET 
             user_id = $4,
             status = 'reserved',
             reserved_at = NOW()
           WHERE tickets.user_id IS NULL 
              OR tickets.reserved_at < NOW() - INTERVAL '10 seconds'
           RETURNING *`,
          [ticket.event_id, ticket.section_id, ticket.seat_number, userId]
        )

        // If the update returned a row, the reservation was successful
        if (reservationResult.rows.length > 0) {
          // Delete the old ticket record since we created a new one with INSERT
          await client.query(
            'DELETE FROM tickets WHERE id = $1 AND id != $2',
            [ticketId, reservationResult.rows[0].id]
          )
          reserved.push(reservationResult.rows[0].id)
        }
      }

      return reserved
    })

    if (reservedIds.length === 0) {
      return {
        success: false,
        error: 'Unable to reserve tickets. They may have been taken by another user.',
      }
    }

    if (reservedIds.length < ticketIds.length) {
      return {
        success: true,
        data: reservedIds,
        error: `Only ${reservedIds.length} of ${ticketIds.length} tickets were available`,
      }
    }

    revalidatePath(`/events/${ticketIds[0]}`)

    return {
      success: true,
      data: reservedIds,
    }
  } catch (error) {
    console.error('Error reserving tickets:', error)
    return {
      success: false,
      error: 'Failed to reserve tickets',
    }
  }
}

export async function purchaseTickets(
  ticketIds: string[]
): Promise<ApiResponse<{ orderId: string }>> {
  try {
    const user = await requireAuth()

    if (ticketIds.length === 0) {
      return {
        success: false,
        error: 'No tickets to purchase',
      }
    }

    const result = await transaction(async (client) => {
      // Verify all tickets are reserved by this user
      const ticketsResult = await client.query<TicketWithDetails>(
        `SELECT t.*, e.name as event_name, s.section_name, s.price
         FROM tickets t
         JOIN events e ON t.event_id = e.id
         JOIN seating_sections s ON t.section_id = s.id
         WHERE t.id = ANY($1)`,
        [ticketIds]
      )

      const tickets = ticketsResult.rows

      // Check ownership and reservation status
      for (const ticket of tickets) {
        if (ticket.user_id !== user.id) {
          throw new Error('You do not own all selected tickets')
        }
        if (ticket.status !== 'reserved') {
          throw new Error('Some tickets are no longer reserved')
        }
        if (ticket.reserved_at && ticket.reserved_at < new Date(Date.now() - 10 * 1000)) {
          throw new Error('Your reservation has expired')
        }
      }

      // Calculate total amount
      const totalAmount = tickets.reduce((sum, t) => sum + (t.price || 0), 0)

      // Create order
      const orderResult = await client.query<{ id: string }>(
        `INSERT INTO orders (user_id, total_amount, payment_status, payment_method)
         VALUES ($1, $2, 'completed', 'credit_card')
         RETURNING id`,
        [user.id, totalAmount]
      )

      const orderId = orderResult.rows[0].id

      // Update tickets to sold and link to order
      await client.query(
        `UPDATE tickets 
         SET status = 'sold', order_id = $1, reserved_at = NULL
         WHERE id = ANY($2)`,
        [orderId, ticketIds]
      )

      // Create order items
      for (const ticket of tickets) {
        await client.query(
          `INSERT INTO order_items (order_id, ticket_id, price)
           VALUES ($1, $2, $3)`,
          [orderId, ticket.id, ticket.price]
        )
      }

      return orderId
    })

    revalidatePath('/orders')

    return {
      success: true,
      data: { orderId: result },
    }
  } catch (error) {
    console.error('Error purchasing tickets:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to purchase tickets',
    }
  }
}

export async function cancelReservation(
  ticketIds: string[],
  userId: string
): Promise<ApiResponse<void>> {
  try {
    const user = await requireAuth()

    if (user.id !== userId) {
      return {
        success: false,
        error: 'Unauthorized',
      }
    }

    if (ticketIds.length === 0) {
      return {
        success: false,
        error: 'No tickets to cancel',
      }
    }

    await transaction(async (client) => {
      // Verify all tickets are owned by this user and are reserved
      const ticketsResult = await client.query<Ticket>(
        'SELECT * FROM tickets WHERE id = ANY($1)',
        [ticketIds]
      )

      const tickets = ticketsResult.rows

      for (const ticket of tickets) {
        if (ticket.user_id !== userId) {
          throw new Error('You do not own all selected tickets')
        }
        if (ticket.status !== 'reserved') {
          throw new Error('Some tickets are not reserved')
        }
      }

      // Release the tickets back to available status
      await client.query(
        `UPDATE tickets 
         SET user_id = NULL, status = 'available', reserved_at = NULL
         WHERE id = ANY($1)`,
        [ticketIds]
      )
    })

    revalidatePath(`/events`)

    return {
      success: true,
    }
  } catch (error) {
    console.error('Error canceling reservation:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to cancel reservation',
    }
  }
}
