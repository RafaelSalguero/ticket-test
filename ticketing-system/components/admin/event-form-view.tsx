'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { eventFormSchema, type EventFormInput } from '@/lib/admin-validations'
import type { Event, ApiResponse } from '@/types'

interface EventFormViewProps {
  mode: 'create' | 'edit'
  event?: Event
  state: ApiResponse<Event> | null
  isPending: boolean
  formAction: (formData: FormData) => void
  onCancel: () => void
}

/**
 * Pure view component for event create/edit form with react-hook-form validation
 * Used for both creating new events and editing existing ones
 */
export function EventFormView({ mode, event, state, isPending, formAction, onCancel }: EventFormViewProps) {
  // Convert date to YYYY-MM-DD format for input
  const formatDate = (date: Date | undefined) => {
    if (!date) return ''
    const d = new Date(date)
    return d.toISOString().split('T')[0]
  }

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EventFormInput>({
    resolver: zodResolver(eventFormSchema),
    mode: 'onBlur',
    defaultValues: {
      name: event?.name || '',
      description: event?.description || '',
      eventDate: formatDate(event?.event_date) || '',
      eventTime: event?.event_time || '',
      venue: event?.venue || '',
    },
  })

  const onSubmit = (data: EventFormInput) => {
    const formData = new FormData()
    formData.append('name', data.name)
    formData.append('description', data.description)
    formData.append('eventDate', data.eventDate)
    formData.append('eventTime', data.eventTime)
    formData.append('venue', data.venue)
    formAction(formData)
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
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Event Name *</Label>
            <Input
              id="name"
              type="text"
              placeholder="Championship Finals 2025"
              disabled={isPending}
              {...register('name')}
            />
            {errors.name && (
              <p className="text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <textarea
              id="description"
              placeholder="An exciting championship event..."
              disabled={isPending}
              className="w-full min-h-[100px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              {...register('description')}
            />
            {errors.description && (
              <p className="text-sm text-red-600">{errors.description.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="eventDate">Event Date *</Label>
              <Input
                id="eventDate"
                type="date"
                disabled={isPending}
                {...register('eventDate')}
              />
              {errors.eventDate && (
                <p className="text-sm text-red-600">{errors.eventDate.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="eventTime">Event Time *</Label>
              <Input
                id="eventTime"
                type="time"
                disabled={isPending}
                {...register('eventTime')}
              />
              {errors.eventTime && (
                <p className="text-sm text-red-600">{errors.eventTime.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="venue">Venue *</Label>
            <Input
              id="venue"
              type="text"
              placeholder="Grand Stadium"
              disabled={isPending}
              {...register('venue')}
            />
            {errors.venue && (
              <p className="text-sm text-red-600">{errors.venue.message}</p>
            )}
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
