import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { OrdersListViewProps } from '@/types'

/**
 * Pure view component for orders list
 * Displays user's orders with status and details
 */
export function OrdersListView({ orders }: OrdersListViewProps) {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">My Orders</h1>

      {orders.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-gray-600 mb-4">You haven&apos;t made any orders yet.</p>
            <Link href="/events">
              <Button>Browse Events</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const firstTicket = order.items[0]?.ticket
            const eventName = firstTicket?.event?.name || 'Unknown Event'
            const eventDate = firstTicket?.event?.event_date

            return (
              <Card key={order.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{eventName}</CardTitle>
                      <CardDescription>
                        Order #{order.id.slice(0, 8)} • {formatDate(order.created_at)}
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-blue-600">
                        {formatCurrency(order.total_amount)}
                      </p>
                      <span
                        className={`inline-block px-2 py-1 text-xs font-semibold rounded ${
                          order.payment_status === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : order.payment_status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {order.payment_status}
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">
                        {order.items.length} ticket(s)
                      </p>
                      {eventDate && (
                        <p className="text-sm text-gray-600">
                          Event Date: {formatDate(eventDate)}
                        </p>
                      )}
                    </div>
                    <Link href={`/orders/${order.id}`}>
                      <Button variant="outline">View Details</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
