'use server'

import { query } from '@/lib/db'
import { requireAdmin } from '@/lib/admin-auth'
import type { SalesReport, AttendanceReport, RevenueData, OrderWithDetails, Order, OrderItem, Ticket, Event, SeatingSection, User } from '@/types'

/**
 * Get overall sales report with total revenue, tickets sold, and recent orders
 */
export async function getSalesReport(): Promise<SalesReport> {
  try {
    await requireAdmin()

    // Get total revenue and ticket count
    const statsResult = await query<{
      total_revenue: string
      total_tickets: string
      event_count: string
    }>(
      `SELECT 
        COALESCE(SUM(o.total_amount), 0) as total_revenue,
        COALESCE(COUNT(oi.id), 0) as total_tickets,
        COUNT(DISTINCT e.id) as event_count
       FROM orders o
       LEFT JOIN order_items oi ON o.id = oi.order_id
       LEFT JOIN tickets t ON oi.ticket_id = t.id
       LEFT JOIN events e ON t.event_id = e.id
       WHERE o.payment_status = 'completed'`
    )

    const stats = statsResult.rows[0]

    // Get recent orders with details
    const ordersResult = await query<Order & { 
      user_email: string
      user_first_name: string
      user_last_name: string
    }>(
      `SELECT 
        o.*,
        u.email as user_email,
        u.first_name as user_first_name,
        u.last_name as user_last_name
       FROM orders o
       JOIN users u ON o.user_id = u.id
       WHERE o.payment_status = 'completed'
       ORDER BY o.created_at DESC
       LIMIT 10`
    )

    // Fetch order items with ticket details for each order
    const recentOrders: OrderWithDetails[] = []

    for (const order of ordersResult.rows) {
      const itemsResult = await query<OrderItem & {
        ticket_id: string
        ticket_seat_number: string
        ticket_status: string
        event_id: string
        event_name: string
        event_date: Date
        event_time: string
        event_venue: string
        section_id: string
        section_name: string
        section_price: number
      }>(
        `SELECT 
          oi.*,
          t.id as ticket_id,
          t.seat_number as ticket_seat_number,
          t.status as ticket_status,
          e.id as event_id,
          e.name as event_name,
          e.event_date,
          e.event_time,
          e.venue as event_venue,
          s.id as section_id,
          s.section_name,
          s.price as section_price
         FROM order_items oi
         JOIN tickets t ON oi.ticket_id = t.id
         JOIN events e ON t.event_id = e.id
         JOIN seating_sections s ON t.section_id = s.id
         WHERE oi.order_id = $1`,
        [order.id]
      )

      const items = itemsResult.rows.map(item => ({
        id: item.id,
        order_id: item.order_id,
        ticket_id: item.ticket_id,
        price: item.price,
        created_at: item.created_at,
        ticket: {
          id: item.ticket_id,
          event_id: item.event_id,
          section_id: item.section_id,
          seat_number: item.ticket_seat_number,
          user_id: null,
          order_id: order.id,
          status: item.ticket_status as 'available' | 'reserved' | 'sold',
          reserved_at: null,
          created_at: item.created_at,
          event: {
            id: item.event_id,
            name: item.event_name,
            description: '',
            event_date: item.event_date,
            event_time: item.event_time,
            venue: item.event_venue,
            created_at: item.created_at,
            updated_at: item.created_at,
            created_by: '',
          },
          section: {
            id: item.section_id,
            event_id: item.event_id,
            section_name: item.section_name,
            price: item.section_price,
            total_seats: 0,
            created_at: item.created_at,
          },
        },
      }))

      recentOrders.push({
        ...order,
        items,
        user: {
          id: order.user_id,
          email: order.user_email,
          password_hash: '',
          first_name: order.user_first_name,
          last_name: order.user_last_name,
          role: 'customer',
          created_at: order.created_at,
          updated_at: order.updated_at,
        },
      })
    }

    return {
      totalRevenue: parseFloat(stats.total_revenue),
      totalTicketsSold: parseInt(stats.total_tickets),
      eventCount: parseInt(stats.event_count),
      recentOrders,
    }
  } catch (error) {
    console.error('Error generating sales report:', error)
    throw new Error('Failed to generate sales report')
  }
}

/**
 * Get attendance report for all events or a specific event
 */
export async function getEventAttendanceReport(eventId?: string): Promise<AttendanceReport[]> {
  try {
    await requireAdmin()

    const whereClause = eventId ? 'WHERE e.id = $1' : ''
    const params = eventId ? [eventId] : []

    const result = await query<{
      event_id: string
      event_name: string
      total_seats: string
      sold_seats: string
      available_seats: string
      revenue: string
    }>(
      `SELECT 
        e.id as event_id,
        e.name as event_name,
        COUNT(t.id) as total_seats,
        COUNT(t.id) FILTER (WHERE t.status = 'sold') as sold_seats,
        COUNT(t.id) FILTER (WHERE t.status = 'available') as available_seats,
        COALESCE(SUM(oi.price) FILTER (WHERE t.status = 'sold'), 0) as revenue
       FROM events e
       JOIN tickets t ON e.id = t.event_id
       LEFT JOIN order_items oi ON t.id = oi.ticket_id
       ${whereClause}
       GROUP BY e.id, e.name
       ORDER BY e.event_date DESC`,
      params
    )

    return result.rows.map(row => ({
      eventId: row.event_id,
      eventName: row.event_name,
      totalSeats: parseInt(row.total_seats),
      soldSeats: parseInt(row.sold_seats),
      availableSeats: parseInt(row.available_seats),
      revenue: parseFloat(row.revenue),
    }))
  } catch (error) {
    console.error('Error generating attendance report:', error)
    throw new Error('Failed to generate attendance report')
  }
}

/**
 * Get revenue breakdown by event
 */
export async function getRevenueByEvent(): Promise<RevenueData[]> {
  try {
    await requireAdmin()

    const result = await query<{
      event_id: string
      event_name: string
      revenue: string
      tickets_sold: string
    }>(
      `SELECT 
        e.id as event_id,
        e.name as event_name,
        COALESCE(SUM(oi.price), 0) as revenue,
        COUNT(oi.id) as tickets_sold
       FROM events e
       LEFT JOIN tickets t ON e.id = t.event_id
       LEFT JOIN order_items oi ON t.id = oi.ticket_id
       LEFT JOIN orders o ON oi.order_id = o.id
       WHERE o.payment_status = 'completed' OR o.payment_status IS NULL
       GROUP BY e.id, e.name
       ORDER BY revenue DESC`
    )

    return result.rows.map(row => ({
      eventId: row.event_id,
      eventName: row.event_name,
      revenue: parseFloat(row.revenue),
      ticketsSold: parseInt(row.tickets_sold),
    }))
  } catch (error) {
    console.error('Error generating revenue report:', error)
    throw new Error('Failed to generate revenue report')
  }
}
