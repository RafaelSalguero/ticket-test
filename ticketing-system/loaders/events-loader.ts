import { getUpcomingEvents, getEventById } from '@/actions/event-actions'
import type { EventWithSections } from '@/types'

/**
 * Loads upcoming events for display
 * Server-side data loader
 */
export async function loadUpcomingEvents(): Promise<EventWithSections[]> {
  return await getUpcomingEvents()
}

/**
 * Loads a specific event by ID with its sections
 * Server-side data loader
 */
export async function loadEventById(id: string): Promise<EventWithSections | null> {
  return await getEventById(id)
}
