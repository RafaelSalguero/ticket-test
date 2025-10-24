import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ReservationTimer } from '@/components/ui/reservation-timer'
import { formatCurrency } from '@/lib/utils'
import type { SeatSelectorViewProps, Ticket } from '@/types'


/**
 * Pure view component for seat selection
 * Displays sections, all seats with status indicators, and handles user interactions via callbacks
 */
export function SeatSelectorView({
  eventId,
  sections,
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
  onSectionSelect,
  onSeatToggle,
  onReserve,
  onPurchase,
  onCancelReservation,
}: SeatSelectorViewProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Select Your Seats</CardTitle>
        <CardDescription>Choose a section, then select your seats</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Section Selection with Details */}
        <div className="mb-6">
          <h3 className="font-semibold mb-4">Choose Your Section</h3>
          <div className="grid gap-4">
            {sections.map((section) => (
              <div
                key={section.id}
                onClick={() => {
                  if (section.available_seats > 0) {
                    onSectionSelect(section)
                  }
                }}
                className={`
                  border-2 rounded-lg p-4 transition-all cursor-pointer
                  ${
                    selectedSection?.id === section.id
                      ? 'border-blue-500 bg-blue-50'
                      : section.available_seats === 0
                      ? 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-60'
                      : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                  }
                `}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-semibold text-lg">{section.section_name}</h4>
                    <p className="text-sm text-gray-600">
                      {section.available_seats} of {section.total_seats} seats available
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-blue-600">
                      {formatCurrency(section.price)}
                    </p>
                    <p className="text-xs text-gray-600">per seat</p>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{
                      width: `${(section.available_seats / section.total_seats) * 100}%`,
                    }}
                  />
                </div>
                {selectedSection?.id === section.id && (
                  <div className="mt-2 text-sm text-blue-600 font-medium">
                    ✓ Selected
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Seat Selection */}
        {selectedSection && (
          <>
            <div className="mb-6">
              <h3 className="font-semibold mb-3">
                Seats in {selectedSection.section_name}
              </h3>
              {loading ? (
                <p className="text-gray-600">Loading seats...</p>
              ) : allSeats.length === 0 ? (
                <p className="text-gray-600">No seats in this section</p>
              ) : (
                <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
                  {allSeats.map((seat) => {
                    const status = seatStatusMap.get(seat.id) || seat.status
                    const isAvailable = status === 'available'
                    const isSelected = selectedSeats.includes(seat.id)
                    const isDisabled = !isAvailable || reservedTicketIds.length > 0
                    
                    return (
                      <button
                        key={seat.id}
                        onClick={() => isAvailable && onSeatToggle(seat.id)}
                        disabled={isDisabled}
                        title={`Seat ${seat.seat_number} - ${status}`}
                        className={`
                          p-2 rounded text-sm font-medium transition-colors relative
                          ${
                            isSelected
                              ? 'bg-blue-600 text-white hover:bg-blue-700'
                              : status === 'available'
                              ? 'bg-green-100 text-green-800 hover:bg-green-200'
                              : status === 'reserved'
                              ? 'bg-orange-500 text-white cursor-not-allowed'
                              : 'bg-gray-400 text-gray-100 cursor-not-allowed'
                          }
                          ${
                            isDisabled && status === 'available'
                              ? 'opacity-50 cursor-not-allowed'
                              : ''
                          }
                        `}
                      >
                        {seat.seat_number}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Selection Summary */}
            {selectedSeats.length > 0 && (
              <div className="bg-blue-50 p-4 rounded-lg mb-4">
                <p className="font-semibold mb-2">
                  Selected: {selectedSeats.length} seat(s)
                </p>
                <p>
                  {
                    selectedSeats
                    .map(id => allSeats.find(x => x.id === id))
                    .filter((x): x is Ticket => x !== undefined)
                    .map(x => x.seat_number)
                    .sort()
                    .join(", ")
                  }
                </p>
                <p className="text-2xl font-bold text-blue-600">
                  Total: {formatCurrency(totalPrice)}
                </p>
                <Button onClick={onReserve} disabled={reserving} className="w-full mt-4">
                  {reserving ? 'Reserving...' : 'Reserve Seats'}
                </Button>
              </div>
            )}

            {/* Reserved Tickets - Partial Reservation Warning */}
            {reservedTicketIds.length > 0 && partialReservation && (
              <div className="bg-orange-50 p-4 rounded-lg border-2 border-orange-300 mb-4">
                <div className="flex items-start gap-2 mb-3">
                  <span className="text-2xl">⚠️</span>
                  <div className="flex-1">
                    <p className="font-bold text-orange-900 text-lg mb-1">
                      PARTIAL RESERVATION
                    </p>
                    <p className="text-orange-800 mb-2">
                      Requested: {partialReservation.requested} seats | 
                      Reserved: {partialReservation.reserved} seats
                    </p>
                  </div>
                </div>

                <div className="space-y-2 mb-3">
                  <div>
                    <p className="text-sm font-semibold text-green-800">
                      ✓ Successfully Reserved:
                    </p>
                    <p className="text-sm text-green-700">
                      Seats {
                        reservedTicketIds
                          .map(id => allSeats.find(seat => seat.id === id)?.seat_number)
                          .filter((num): num is string => num !== undefined)
                          .sort((a, b) => parseInt(a) - parseInt(b))
                          .join(', ')
                      }
                    </p>
                  </div>

                  {partialReservation.failedSeats.length > 0 && (
                    <div>
                      <p className="text-sm font-semibold text-red-800">
                        ✗ Unable to Reserve:
                      </p>
                      <p className="text-sm text-red-700">
                        Seats {partialReservation.failedSeats.sort((a, b) => parseInt(a) - parseInt(b)).join(', ')} (already taken)
                      </p>
                    </div>
                  )}
                </div>

                {reservationExpiresAt && (
                  <div className="mb-3">
                    <ReservationTimer expiresAt={reservationExpiresAt} />
                  </div>
                )}

                <p className="text-2xl font-bold text-orange-900 mb-4">
                  Total: {formatCurrency(reservedTotalPrice)}
                </p>

                <div className="grid grid-cols-2 gap-2">
                  <Button
                    onClick={onCancelReservation}
                    disabled={canceling}
                    variant="outline"
                    className="border-orange-300 text-orange-700 hover:bg-orange-100"
                  >
                    {canceling ? 'Canceling...' : 'Cancel'}
                  </Button>
                  <Button
                    onClick={onPurchase}
                    disabled={purchasing}
                    className="bg-orange-600 hover:bg-orange-700"
                  >
                    {purchasing ? 'Processing...' : `Purchase (${formatCurrency(reservedTotalPrice)})`}
                  </Button>
                </div>
              </div>
            )}

            {/* Reserved Tickets - Full Success */}
            {reservedTicketIds.length > 0 && !partialReservation && (
              <div className="bg-green-50 p-4 rounded-lg border-2 border-green-200 mb-4">
                <p className="font-bold text-green-800 text-lg mb-2">
                  ✓ RESERVATION CONFIRMED
                </p>
                <p className="text-sm text-green-700 mb-2">
                  Reserved: {reservedTicketIds.length} seats
                </p>
                <p className="text-sm text-green-700 mb-3">
                  Seats {
                    reservedTicketIds
                      .map(id => allSeats.find(seat => seat.id === id)?.seat_number)
                      .filter((num): num is string => num !== undefined)
                      .sort((a, b) => parseInt(a) - parseInt(b))
                      .join(', ')
                  }
                </p>

                {reservationExpiresAt && (
                  <div className="mb-3">
                    <ReservationTimer expiresAt={reservationExpiresAt} />
                  </div>
                )}

                <p className="text-2xl font-bold text-green-800 mb-4">
                  Total: {formatCurrency(reservedTotalPrice)}
                </p>

                <div className="grid grid-cols-2 gap-2">
                  <Button
                    onClick={onCancelReservation}
                    disabled={canceling}
                    variant="outline"
                    className="border-green-300 text-green-700 hover:bg-green-100"
                  >
                    {canceling ? 'Canceling...' : 'Cancel'}
                  </Button>
                  <Button
                    onClick={onPurchase}
                    disabled={purchasing}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {purchasing ? 'Processing...' : `Purchase (${formatCurrency(reservedTotalPrice)})`}
                  </Button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Error Message */}
        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Legend */}
        <div className="mt-6 pt-6 border-t">
          <h4 className="font-semibold mb-2 text-sm">Legend</h4>
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-green-100 rounded border border-green-200"></div>
              <span>Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded"></div>
              <span>Selected</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-orange-500 rounded"></div>
              <span>Reserved</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gray-400 rounded"></div>
              <span>Sold</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
