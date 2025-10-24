'use client'

import { useSeatSelection } from '@/hooks/use-seat-selection'
import { SeatSelectorView } from '@/components/tickets/seat-selector-view'
import type { SeatingSection } from '@/types'

interface SeatSelectorProps {
  eventId: string
  sections: SeatingSection[]
  userId: string
}

/**
 * Seat selector container component
 * Uses hook for state management and view component for presentation
 */
export function SeatSelector({ eventId, sections, userId }: SeatSelectorProps) {
  const {
    selectedSection,
    allSeats,
    seatStatusMap,
    selectedSeats,
    loading,
    reserving,
    purchasing,
    error,
    reservedTicketIds,
    totalPrice,
    reservedTotalPrice,
    setSelectedSection,
    handleSeatToggle,
    handleReserve,
    handlePurchase,
  } = useSeatSelection(eventId, sections, userId)

  return (
    <SeatSelectorView
      eventId={eventId}
      sections={sections}
      selectedSection={selectedSection}
      allSeats={allSeats}
      seatStatusMap={seatStatusMap}
      selectedSeats={selectedSeats}
      loading={loading}
      reserving={reserving}
      purchasing={purchasing}
      error={error}
      reservedTicketIds={reservedTicketIds}
      totalPrice={totalPrice}
      reservedTotalPrice={reservedTotalPrice}
      onSectionSelect={setSelectedSection}
      onSeatToggle={handleSeatToggle}
      onReserve={handleReserve}
      onPurchase={handlePurchase}
    />
  )
}
