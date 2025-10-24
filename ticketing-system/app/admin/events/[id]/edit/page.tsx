'use client'

import { useEffect, useState } from 'react'
import { useFormState } from 'react-dom'
import { useRouter, useParams } from 'next/navigation'
import { getEventById, updateEvent } from '@/actions/event-actions'
import { EventFormView } from '@/components/admin/event-form-view'
import type { Event, ApiResponse } from '@/types'

/**
 * Admin Edit Event Page
 * Form for editing existing event details (not sections)
 */
export default function AdminEditEventPage() {
  const router = useRouter()
  const params = useParams()
  const eventId = params.id as string
  
  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)

  // Create bound action with eventId
  const updateEventAction = updateEvent.bind(null, eventId)
  const [state, formAction] = useFormState(updateEventAction, null)

  useEffect(() => {
    loadEvent()
  }, [eventId])

  const loadEvent = async () => {
    try {
      const data = await getEventById(eventId)
      if (data) {
        setEvent(data)
      } else {
        router.push('/admin/events')
      }
    } catch (error) {
      console.error('Failed to load event:', error)
      router.push('/admin/events')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    router.push('/admin/events')
  }

  // Redirect on success
  if (state?.success) {
    router.push('/admin/events')
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p>Loading event...</p>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p>Event not found</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <EventFormView
        mode="edit"
        event={event}
        state={state}
        isPending={false}
        formAction={formAction}
        onCancel={handleCancel}
      />
    </div>
  )
}
