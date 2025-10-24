'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getEvents } from '@/actions/event-actions'
import { deleteEvent } from '@/actions/event-actions'
import { EventsManagementView } from '@/components/admin/events-management-view'
import type { EventWithSections } from '@/types'

/**
 * Admin Events Management Page
 * Lists all events with edit and delete actions
 */
export default function AdminEventsPage() {
  const router = useRouter()
  const [events, setEvents] = useState<EventWithSections[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadEvents()
  }, [])

  const loadEvents = async () => {
    try {
      const data = await getEvents()
      setEvents(data)
    } catch (error) {
      console.error('Failed to load events:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (eventId: string) => {
    const result = await deleteEvent(eventId)
    if (result.success) {
      // Reload events after successful deletion
      await loadEvents()
      router.refresh()
    } else {
      throw new Error(result.error || 'Failed to delete event')
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p>Loading events...</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <EventsManagementView events={events} onDelete={handleDelete} />
    </div>
  )
}
