'use client'

import { useFormState } from 'react-dom'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createEvent } from '@/actions/event-actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { ApiResponse, Event } from '@/types'

/**
 * Admin Create Event Page
 * Form for creating new events with seating sections
 */
export default function AdminCreateEventPage() {
  const router = useRouter()
  const [state, formAction] = useFormState(createEvent, null)
  const [sections, setSections] = useState([
    { sectionName: 'VIP', price: 150, totalSeats: 50 },
    { sectionName: 'Premium', price: 100, totalSeats: 100 },
    { sectionName: 'Economy', price: 50, totalSeats: 200 },
  ])

  const handleAddSection = () => {
    setSections([...sections, { sectionName: '', price: 0, totalSeats: 0 }])
  }

  const handleRemoveSection = (index: number) => {
    setSections(sections.filter((_, i) => i !== index))
  }

  const handleSectionChange = (index: number, field: string, value: string | number) => {
    const newSections = [...sections]
    newSections[index] = { ...newSections[index], [field]: value }
    setSections(newSections)
  }

  const handleCancel = () => {
    router.push('/admin/events')
  }

  // Redirect on success
  if (state?.success) {
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
          <form action={formAction} className="space-y-6">
            {/* Event Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Event Information</h3>
              
              <div className="space-y-2">
                <Label htmlFor="name">Event Name *</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Championship Finals 2025"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <textarea
                  id="description"
                  name="description"
                  placeholder="An exciting championship event..."
                  required
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
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="eventTime">Event Time *</Label>
                  <Input
                    id="eventTime"
                    name="eventTime"
                    type="time"
                    required
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
                  required
                />
              </div>
            </div>

            {/* Seating Sections */}
            <div className="space-y-4 border-t pt-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Seating Sections</h3>
                <Button type="button" variant="outline" onClick={handleAddSection}>
                  Add Section
                </Button>
              </div>

              {sections.map((section, index) => (
                <div key={index} className="border p-4 rounded-md space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">Section {index + 1}</h4>
                    {sections.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemoveSection(index)}
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
                        value={section.sectionName}
                        onChange={(e) => handleSectionChange(index, 'sectionName', e.target.value)}
                        placeholder="VIP"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Price ($) *</Label>
                      <Input
                        type="number"
                        value={section.price}
                        onChange={(e) => handleSectionChange(index, 'price', parseFloat(e.target.value))}
                        placeholder="100"
                        min="0"
                        step="0.01"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Total Seats *</Label>
                      <Input
                        type="number"
                        value={section.totalSeats}
                        onChange={(e) => handleSectionChange(index, 'totalSeats', parseInt(e.target.value))}
                        placeholder="100"
                        min="1"
                        required
                      />
                    </div>
                  </div>
                </div>
              ))}

              {/* Hidden input to pass sections as JSON */}
              <input type="hidden" name="sections" value={JSON.stringify(sections)} />
            </div>

            {state?.error && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                {state.error}
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <Button type="submit">Create Event</Button>
              <Button type="button" variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
