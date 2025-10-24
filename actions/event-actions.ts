'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { query, transaction } from '@/lib/db'
import { requireAuth } from '@/lib/auth'
import { requireAdmin } from '@/lib/admin-auth'
import { generateSeatNumbers } from '@/lib/utils'
import { enrichSectionsWithAvailability } from '@/lib/seat-calculations'
import type { ApiResponse, Event, EventWithSections, SeatingSection } from '@/types'

export async function getEvents(): Promise<EventWithSections[]> {
  try {
    const eventsResult = await query<Event>(
      'SELECT * FROM events ORDER BY event_date ASC'
    )

    const events: EventWithSections[] = []

    for (const event of eventsResult.rows) {
      const sectionsResult = await query<SeatingSection>(
        'SELECT * FROM seating_sections WHERE event_id = $1',
        [event.id]
      )
      
      events.push({
        ...event,
        sections: await enrichSectionsWithAvailability(sectionsResult.rows),
      })
    }

    return events
  } catch (error) {
    console.error('Error fetching events:', error)
    return []
  }
}

export async function getEventById(id: string): Promise<EventWithSections | null> {
  try {
    const eventResult = await query<Event>(
      'SELECT * FROM events WHERE id = $1',
      [id]
    )

    if (eventResult.rows.length === 0) {
      return null
    }

    const event = eventResult.rows[0]

    const sectionsResult = await query<SeatingSection>(
      'SELECT * FROM seating_sections WHERE event_id = $1',
      [event.id]
    )

    return {
      ...event,
      sections: await enrichSectionsWithAvailability(sectionsResult.rows),
    }
  } catch (error) {
    console.error('Error fetching event:', error)
    return null
  }
}

export async function createEvent(
  prevState: ApiResponse<Event> | null,
  formData: FormData
): Promise<ApiResponse<Event>> {
  try {
    const user = await requireAuth()

    const name = formData.get('name') as string
    const description = formData.get('description') as string
    const eventDate = formData.get('eventDate') as string
    const eventTime = formData.get('eventTime') as string
    const venue = formData.get('venue') as string
    
    // Parse sections JSON from form
    const sectionsJson = formData.get('sections') as string
    const sections = JSON.parse(sectionsJson) as Array<{
      sectionName: string
      price: number
      totalSeats: number
    }>

    if (!name || !description || !eventDate || !eventTime || !venue) {
      return {
        success: false,
        error: 'All event fields are required',
      }
    }

    if (!sections || sections.length === 0) {
      return {
        success: false,
        error: 'At least one seating section is required',
      }
    }

    // Create event and sections with tickets in a transaction
    const event = await transaction(async (client) => {
      // Create event
      const eventResult = await client.query<Event>(
        `INSERT INTO events (name, description, event_date, event_time, venue, created_by)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [name, description, eventDate, eventTime, venue, user.id]
      )

      const newEvent = eventResult.rows[0]

      // Create sections and tickets
      for (const section of sections) {
        // Create section
        const sectionResult = await client.query<SeatingSection>(
          `INSERT INTO seating_sections (event_id, section_name, price, total_seats)
           VALUES ($1, $2, $3, $4)
           RETURNING *`,
          [newEvent.id, section.sectionName, section.price, section.totalSeats]
        )

        const newSection = sectionResult.rows[0]

        // Generate seat numbers and create tickets
        const seatNumbers = generateSeatNumbers(section.totalSeats)

        for (const seatNumber of seatNumbers) {
          await client.query(
            `INSERT INTO tickets (event_id, section_id, seat_number, status)
             VALUES ($1, $2, $3, 'available')`,
            [newEvent.id, newSection.id, seatNumber]
          )
        }
      }

      return newEvent
    })

    revalidatePath('/')
    revalidatePath('/events')

    return {
      success: true,
      data: event,
    }
  } catch (error) {
    console.error('Error creating event:', error)
    return {
      success: false,
      error: 'Failed to create event',
    }
  }
}

export async function updateEvent(
  eventId: string,
  prevState: ApiResponse<Event> | null,
  formData: FormData
): Promise<ApiResponse<Event>> {
  try {
    await requireAdmin()

    const name = formData.get('name') as string
    const description = formData.get('description') as string
    const eventDate = formData.get('eventDate') as string
    const eventTime = formData.get('eventTime') as string
    const venue = formData.get('venue') as string

    if (!name || !description || !eventDate || !eventTime || !venue) {
      return {
        success: false,
        error: 'All event fields are required',
      }
    }

    const result = await query<Event>(
      `UPDATE events 
       SET name = $1, description = $2, event_date = $3, event_time = $4, venue = $5, updated_at = CURRENT_TIMESTAMP
       WHERE id = $6
       RETURNING *`,
      [name, description, eventDate, eventTime, venue, eventId]
    )

    if (result.rows.length === 0) {
      return {
        success: false,
        error: 'Event not found',
      }
    }

    revalidatePath('/')
    revalidatePath('/events')
    revalidatePath(`/events/${eventId}`)

    return {
      success: true,
      data: result.rows[0],
    }
  } catch (error) {
    console.error('Error updating event:', error)
    return {
      success: false,
      error: 'Failed to update event',
    }
  }
}

export async function deleteEvent(eventId: string): Promise<ApiResponse<void>> {
  try {
    await requireAdmin()

    await query('DELETE FROM events WHERE id = $1', [eventId])

    revalidatePath('/')
    revalidatePath('/events')

    return {
      success: true,
    }
  } catch (error) {
    console.error('Error deleting event:', error)
    return {
      success: false,
      error: 'Failed to delete event',
    }
  }
}

export async function getUpcomingEvents(): Promise<EventWithSections[]> {
  try {
    const eventsResult = await query<Event>(
      'SELECT * FROM events WHERE event_date >= CURRENT_DATE ORDER BY event_date ASC LIMIT 10'
    )

    const events: EventWithSections[] = []

    for (const event of eventsResult.rows) {
      const sectionsResult = await query<SeatingSection>(
        'SELECT * FROM seating_sections WHERE event_id = $1',
        [event.id]
      )
      
      events.push({
        ...event,
        sections: await enrichSectionsWithAvailability(sectionsResult.rows),
      })
    }

    return events
  } catch (error) {
    console.error('Error fetching upcoming events:', error)
    return []
  }
}
