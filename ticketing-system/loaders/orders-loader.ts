import { getUserOrders, getOrderById } from '@/actions/order-actions'
import type { OrderWithDetails } from '@/types'

/**
 * Loads all orders for the authenticated user
 * Server-side data loader
 */
export async function loadUserOrders(): Promise<OrderWithDetails[]> {
  return await getUserOrders()
}

/**
 * Loads a specific order by ID for the authenticated user
 * Server-side data loader
 */
export async function loadOrderById(id: string): Promise<OrderWithDetails | null> {
  return await getOrderById(id)
}
