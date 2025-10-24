'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { EventWithSections } from '@/types'

interface EventsManagementViewProps {
  events: EventWithSections[]
  onDelete: (eventId: string) => Promise<void>
}

/**
 * Pure view component for managing events
 * Displays list of events with edit and delete actions
 */
export function EventsManagementView({ events, onDelete }: EventsManagementViewProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDelete = async (eventId: string, eventName: string) => {
    if (!confirm(`Are you sure you want to delete "${eventName}"? This will also delete all tickets and cannot be undone.`)) {
      return
    }

    setDeletingId(eventId)
    try {
      await onDelete(eventId)
    } catch (error) {
      alert('Failed to delete event')
    } finally {
      setDeletingId(null)
    }
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const getTotalSeats = (event: EventWithSections) => {
    return event.sections.reduce((sum, section) => sum + section.total_seats, 0)
  }

  const getAvailableSeats = (event: EventWithSections) => {
    return event.sections.reduce((sum, section) => sum + section.available_seats, 0)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Event Management</h2>
          <p className="text-gray-600">Manage all events in the system</p>
        </div>
        <Link href="/admin/events/create">
          <Button>Create New Event</Button>
        </Link>
      </div>

      {events.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-gray-500 mb-4">No events found</p>
            <Link href="/admin/events/create">
              <Button>Create Your First Event</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {events.map((event) => (
            <Card key={event.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{event.name}</CardTitle>
                    <CardDescription className="mt-2">
                      {event.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Date</p>
                      <p className="font-medium">{formatDate(event.event_date)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Time</p>
                      <p className="font-medium">{event.event_time}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Venue</p>
                      <p className="font-medium">{event.venue}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Sections</p>
                      <p className="font-medium">{event.sections.length}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Total Seats</p>
                      <p className="font-medium">{getTotalSeats(event)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Available Seats</p>
                      <p className="font-medium">{getAvailableSeats(event)}</p>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Link href={`/admin/events/${event.id}/edit`}>
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(event.id, event.name)}
                      disabled={deletingId === event.id}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      {deletingId === event.id ? 'Deleting...' : 'Delete'}
                    </Button>
                    <Link href={`/events/${event.id}`}>
                      <Button variant="outline" size="sm">
                        View Public Page
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
