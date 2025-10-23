import { notFound } from 'next/navigation'
import { getEventById } from '@/actions/event-actions'
import { getUser } from '@/actions/auth-actions'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { formatDate, formatTime, formatCurrency } from '@/lib/utils'
import { SeatSelector } from '@/components/tickets/seat-selector'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface EventDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function EventDetailPage({ params }: EventDetailPageProps) {
  const { id } = await params
  const event = await getEventById(id)
  const user = await getUser()

  if (!event) {
    notFound()
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Event Details */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-3xl">{event.name}</CardTitle>
            <CardDescription className="text-lg">
              {formatDate(event.event_date)} at {formatTime(event.event_time)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg mb-2">Venue</h3>
                <p className="text-gray-700">{event.venue}</p>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Description</h3>
                <p className="text-gray-700">{event.description}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Seat Selection */}
        {user ? (
          <SeatSelector eventId={event.id} sections={event.sections} userId={user.id} />
        ) : (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-gray-600 mb-4">Please log in to book tickets</p>
              <Link href="/login">
                <Button>Login</Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
