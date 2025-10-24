import { loadUserOrders } from '@/loaders/orders-loader'
import { OrdersListView } from '@/components/orders/orders-list-view'

/**
 * Orders page server component
 * Uses loader for data fetching and view component for presentation
 */
export default async function OrdersPage() {
  const orders = await loadUserOrders()

  return <OrdersListView orders={orders} />
}
