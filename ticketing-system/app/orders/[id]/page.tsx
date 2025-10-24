import { notFound } from 'next/navigation'
import { loadOrderById } from '@/loaders/orders-loader'
import { OrderDetailView } from '@/components/orders/order-detail-view'

interface OrderDetailPageProps {
  params: Promise<{ id: string }>
}

/**
 * Order detail page server component
 * Uses loader for data fetching and view component for presentation
 */
export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const { id } = await params
  const order = await loadOrderById(id)

  if (!order) {
    notFound()
  }

  return <OrderDetailView order={order} />
}
