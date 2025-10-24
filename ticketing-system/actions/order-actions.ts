'use server'

import { query } from '@/lib/db'
import { requireAuth } from '@/lib/auth'
import type { OrderWithDetails, Order, OrderItem } from '@/types'

interface OrderItemQueryResult extends OrderItem {
  seat_number: string
  event_id: string
  section_id: string
  ticket_status: string
  event_name: string
  event_date: Date
  event_time: string
  venue: string
  section_name: string
  section_price: number
}

export async function getOrderById(orderId: string): Promise<OrderWithDetails | null> {
  try {
    const user = await requireAuth()

    // Get order
    const orderResult = await query<Order>(
      'SELECT * FROM orders WHERE id = $1 AND user_id = $2',
      [orderId, user.id]
    )

    if (orderResult.rows.length === 0) {
      return null
    }

    const order = orderResult.rows[0]

    // Get order items with ticket details
    const itemsResult = await query<OrderItemQueryResult>(
      `SELECT 
        oi.*,
        t.seat_number,
        t.event_id,
        t.section_id,
        t.status as ticket_status,
        e.name as event_name,
        e.event_date,
        e.event_time,
        e.venue,
        s.section_name,
        s.price as section_price
       FROM order_items oi
       JOIN tickets t ON oi.ticket_id = t.id
       JOIN events e ON t.event_id = e.id
       JOIN seating_sections s ON t.section_id = s.id
       WHERE oi.order_id = $1
       ORDER BY e.event_date, s.section_name, t.seat_number`,
      [orderId]
    )

    return {
      ...order,
      items: itemsResult.rows.map((item) => ({
        ...item,
        ticket: {
          id: item.ticket_id,
          event_id: item.event_id || '',
          section_id: item.section_id || '',
          seat_number: item.seat_number || '',
          user_id: user.id,
          order_id: orderId,
          status: (item.ticket_status as 'available' | 'reserved' | 'sold') || 'sold',
          reserved_at: null,
          created_at: new Date(),
          event: {
            id: item.event_id || '',
            name: item.event_name || '',
            description: '',
            event_date: item.event_date || new Date(),
            event_time: item.event_time || '',
            venue: item.venue || '',
            created_at: new Date(),
            updated_at: new Date(),
            created_by: '',
          },
          section: {
            id: item.section_id || '',
            event_id: item.event_id || '',
            section_name: item.section_name || '',
            price: item.section_price || 0,
            total_seats: 0,
            created_at: new Date(),
          },
        },
      })),
    }
  } catch (error) {
    console.error('Error fetching order:', error)
    return null
  }
}

export async function getUserOrders(): Promise<OrderWithDetails[]> {
  try {
    const user = await requireAuth()

    // Get all orders for user
    const ordersResult = await query<Order>(
      'SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC',
      [user.id]
    )

    const orders: OrderWithDetails[] = []

    for (const order of ordersResult.rows) {
      const orderWithDetails = await getOrderById(order.id)
      if (orderWithDetails) {
        orders.push(orderWithDetails)
      }
    }

    return orders
  } catch (error) {
    console.error('Error fetching user orders:', error)
    return []
  }
}
