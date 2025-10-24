import { loadUpcomingEvents } from '@/loaders/events-loader'
import { EventsListView } from '@/components/events/events-list-view'

/**
 * Events page server component
 * Uses loader for data fetching and view component for presentation
 */
export default async function EventsPage() {
  const events = await loadUpcomingEvents()

  return <EventsListView events={events} />
}
