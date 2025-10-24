'use client'

import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { createEvent } from '@/actions/event-actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { eventWithSectionsSchema, type EventWithSectionsInput } from '@/lib/admin-validations'
import { useState, useTransition } from 'react'
import type { ApiResponse, Event } from '@/types'

/**
 * Admin Create Event Page
 * Form for creating new events with seating sections using react-hook-form validation
 */
export default function AdminCreateEventPage() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [apiError, setApiError] = useState<string | null>(null)

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<EventWithSectionsInput>({
    resolver: zodResolver(eventWithSectionsSchema),
    mode: 'onBlur',
    defaultValues: {
      name: '',
      description: '',
      eventDate: '',
      eventTime: '',
      venue: '',
      sections: [
        { sectionName: 'VIP', price: 150, totalSeats: 50 },
        { sectionName: 'Premium', price: 100, totalSeats: 100 },
        { sectionName: 'Economy', price: 50, totalSeats: 200 },
      ],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'sections',
  })

  const onSubmit = async (data: EventWithSectionsInput) => {
    setApiError(null)
    
    const formData = new FormData()
    formData.append('name', data.name)
    formData.append('description', data.description)
    formData.append('eventDate', data.eventDate)
    formData.append('eventTime', data.eventTime)
    formData.append('venue', data.venue)
    formData.append('sections', JSON.stringify(data.sections))

    startTransition(async () => {
      const result = await createEvent(null, formData)
      
      if (result.success) {
        router.push('/admin/events')
      } else {
        setApiError(result.error || 'Failed to create event')
      }
    })
  }

  const handleAddSection = () => {
    append({ sectionName: '', price: 0, totalSeats: 0 })
  }

  const handleCancel = () => {
    router.push('/admin/events')
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Create New Event</CardTitle>
          <CardDescription>Fill in the event details and seating sections</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Event Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Event Information</h3>
              
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
            </div>

            {/* Seating Sections */}
            <div className="space-y-4 border-t pt-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Seating Sections</h3>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleAddSection}
                  disabled={isPending}
                >
                  Add Section
                </Button>
              </div>

              {errors.sections?.root && (
                <p className="text-sm text-red-600">{errors.sections.root.message}</p>
              )}

              {fields.map((field, index) => (
                <div key={field.id} className="border p-4 rounded-md space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">Section {index + 1}</h4>
                    {fields.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => remove(index)}
                        disabled={isPending}
                        className="text-red-600"
                      >
                        Remove
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Section Name *</Label>
                      <Input
                        type="text"
                        placeholder="VIP"
                        disabled={isPending}
                        {...register(`sections.${index}.sectionName`)}
                      />
                      {errors.sections?.[index]?.sectionName && (
                        <p className="text-sm text-red-600">
                          {errors.sections[index]?.sectionName?.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>Price ($) *</Label>
                      <Input
                        type="number"
                        placeholder="100"
                        step="0.01"
                        disabled={isPending}
                        {...register(`sections.${index}.price`, { valueAsNumber: true })}
                      />
                      {errors.sections?.[index]?.price && (
                        <p className="text-sm text-red-600">
                          {errors.sections[index]?.price?.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>Total Seats *</Label>
                      <Input
                        type="number"
                        placeholder="100"
                        disabled={isPending}
                        {...register(`sections.${index}.totalSeats`, { valueAsNumber: true })}
                      />
                      {errors.sections?.[index]?.totalSeats && (
                        <p className="text-sm text-red-600">
                          {errors.sections[index]?.totalSeats?.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {apiError && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                {apiError}
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={isPending}>
                {isPending ? 'Creating...' : 'Create Event'}
              </Button>
              <Button type="button" variant="outline" onClick={handleCancel} disabled={isPending}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
