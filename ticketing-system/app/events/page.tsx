import Link from 'next/link'
import { getUpcomingEvents } from '@/actions/event-actions'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatDate, formatTime, formatCurrency } from '@/lib/utils'

export default async function EventsPage() {
  const events = await getUpcomingEvents()

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Upcoming Events</h1>
      </div>

      {events.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-gray-600">No upcoming events at this time.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => {
            const minPrice = Math.min(...event.sections.map(s => s.price))
            const totalAvailable = event.sections.reduce((sum, s) => sum + s.available_seats, 0)

            return (
              <Card key={event.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle>{event.name}</CardTitle>
                  <CardDescription>
                    {formatDate(event.event_date)} at {formatTime(event.event_time)}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 mb-4">
                    <p className="text-sm text-gray-600">
                      <span className="font-semibold">Venue:</span> {event.venue}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-semibold">Starting at:</span> {formatCurrency(minPrice)}
                    </p>
                    <p className="text-sm">
                      <span className="font-semibold">{totalAvailable}</span> seats available
                    </p>
                  </div>
                  <p className="text-sm text-gray-700 mb-4 line-clamp-2">
                    {event.description}
                  </p>
                  <Link href={`/events/${event.id}`}>
                    <Button className="w-full">View Details & Book</Button>
                  </Link>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
