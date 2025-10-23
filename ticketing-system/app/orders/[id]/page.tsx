import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getOrderById } from '@/actions/order-actions'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatCurrency, formatDate, formatTime } from '@/lib/utils'

interface OrderDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const { id } = await params
  const order = await getOrderById(id)

  if (!order) {
    notFound()
  }

  const firstTicket = order.items[0]?.ticket
  const event = firstTicket?.event

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        {/* Order Header */}
        <div className="mb-6">
          <Link href="/orders">
            <Button variant="outline" size="sm">← Back to Orders</Button>
          </Link>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl">Order Confirmation</CardTitle>
                <CardDescription>
                  Order #{order.id}
                </CardDescription>
              </div>
              <span
                className={`px-3 py-1 text-sm font-semibold rounded ${
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
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Order Date</p>
                <p className="font-semibold">{formatDate(order.created_at)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Payment Method</p>
                <p className="font-semibold capitalize">{order.payment_method.replace('_', ' ')}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Amount</p>
                <p className="text-2xl font-bold text-blue-600">
                  {formatCurrency(order.total_amount)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Event Details */}
        {event && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Event Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Event</p>
                  <p className="font-semibold text-lg">{event.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Date & Time</p>
                  <p className="font-semibold">
                    {formatDate(event.event_date)} at {formatTime(event.event_time)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Venue</p>
                  <p className="font-semibold">{event.venue}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tickets */}
        <Card>
          <CardHeader>
            <CardTitle>Your Tickets</CardTitle>
            <CardDescription>{order.items.length} ticket(s)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {order.items.map((item, index) => (
                <div
                  key={item.id}
                  className="border rounded-lg p-4 bg-gray-50"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold">
                        Ticket #{index + 1}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        Section: {item.ticket.section.section_name}
                      </p>
                      <p className="text-sm text-gray-600">
                        Seat: {item.ticket.seat_number}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-blue-600">
                        {formatCurrency(item.price)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-6 border-t">
              <div className="flex justify-between items-center">
                <p className="text-lg font-semibold">Total</p>
                <p className="text-2xl font-bold text-blue-600">
                  {formatCurrency(order.total_amount)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 text-center text-sm text-gray-600">
          <p>Save this confirmation for your records.</p>
          <p>Present your tickets at the venue entrance.</p>
        </div>
      </div>
    </div>
  )
}
