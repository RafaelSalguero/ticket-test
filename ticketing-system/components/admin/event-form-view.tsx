'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { Event, EventFormData, EventEditFormData, ApiResponse } from '@/types'

interface EventFormViewProps {
  mode: 'create' | 'edit'
  event?: Event
  state: ApiResponse<Event> | null
  isPending: boolean
  formAction: (formData: FormData) => void
  onCancel: () => void
}

/**
 * Pure view component for event create/edit form
 * Used for both creating new events and editing existing ones
 */
export function EventFormView({ mode, event, state, isPending, formAction, onCancel }: EventFormViewProps) {
  // Convert date to YYYY-MM-DD format for input
  const formatDate = (date: Date | undefined) => {
    if (!date) return ''
    const d = new Date(date)
    return d.toISOString().split('T')[0]
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{mode === 'create' ? 'Create New Event' : 'Edit Event'}</CardTitle>
        <CardDescription>
          {mode === 'create' 
            ? 'Fill in the event details below' 
            : 'Update the event information'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Event Name *</Label>
            <Input
              id="name"
              name="name"
              type="text"
              placeholder="Championship Finals 2025"
              defaultValue={event?.name}
              required
              disabled={isPending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <textarea
              id="description"
              name="description"
              placeholder="An exciting championship event..."
              defaultValue={event?.description}
              required
              disabled={isPending}
              className="w-full min-h-[100px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="eventDate">Event Date *</Label>
              <Input
                id="eventDate"
                name="eventDate"
                type="date"
                defaultValue={formatDate(event?.event_date)}
                required
                disabled={isPending}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="eventTime">Event Time *</Label>
              <Input
                id="eventTime"
                name="eventTime"
                type="time"
                defaultValue={event?.event_time}
                required
                disabled={isPending}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="venue">Venue *</Label>
            <Input
              id="venue"
              name="venue"
              type="text"
              placeholder="Grand Stadium"
              defaultValue={event?.venue}
              required
              disabled={isPending}
            />
          </div>

          {state?.error && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
              {state.error}
            </div>
          )}

          {state?.success && (
            <div className="text-sm text-green-600 bg-green-50 p-3 rounded-md">
              Event {mode === 'create' ? 'created' : 'updated'} successfully!
            </div>
          )}

          <div className="flex gap-3">
            <Button type="submit" disabled={isPending}>
              {isPending 
                ? (mode === 'create' ? 'Creating...' : 'Updating...') 
                : (mode === 'create' ? 'Create Event' : 'Update Event')}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel} disabled={isPending}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
