'use client'

import { useSeatSelection } from '@/hooks/use-seat-selection'
import { SeatSelectorView } from '@/components/tickets/seat-selector-view'
import { SeatingSectionWithAvailability } from '@/types'

interface SeatSelectorProps {
  eventId: string
  sections: SeatingSectionWithAvailability[]
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
    canceling,
    error,
    reservedTicketIds,
    reservationExpiresAt,
    partialReservation,
    totalPrice,
    reservedTotalPrice,
    setSelectedSection,
    handleSeatToggle,
    handleReserve,
    handlePurchase,
    handleCancelReservation,
  } = useSeatSelection(eventId, userId)

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
      canceling={canceling}
      error={error}
      reservedTicketIds={reservedTicketIds}
      reservationExpiresAt={reservationExpiresAt}
      partialReservation={partialReservation}
      totalPrice={totalPrice}
      reservedTotalPrice={reservedTotalPrice}
      onSectionSelect={setSelectedSection}
      onSeatToggle={handleSeatToggle}
      onReserve={handleReserve}
      onPurchase={handlePurchase}
      onCancelReservation={handleCancelReservation}
    />
  )
}
