import { notFound } from 'next/navigation'
import { loadEventById } from '@/loaders/events-loader'
import { getUser } from '@/actions/auth-actions'
import { EventDetailView } from '@/components/events/event-detail-view'

interface EventDetailPageProps {
  params: Promise<{ id: string }>
}

/**
 * Event detail page server component
 * Uses loaders for data fetching and view component for presentation
 */
export default async function EventDetailPage({ params }: EventDetailPageProps) {
  const { id } = await params
  const event = await loadEventById(id)
  const user = await getUser()

  if (!event) {
    notFound()
  }

  return <EventDetailView event={event} user={user} />
}
