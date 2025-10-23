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

        {/* Seating Sections */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Available Seating Sections</CardTitle>
            <CardDescription>
              Select your preferred section to view and reserve seats
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {event.sections.map((section) => (
                <div
                  key={section.id}
                  className="border rounded-lg p-4 hover:border-blue-500 transition-colors"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold text-lg">{section.section_name}</h3>
                      <p className="text-sm text-gray-600">
                        {section.available_seats} of {section.total_seats} seats available
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-blue-600">
                        {formatCurrency(section.price)}
                      </p>
                      <p className="text-sm text-gray-600">per seat</p>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{
                        width: `${(section.available_seats / section.total_seats) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
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
