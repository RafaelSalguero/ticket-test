import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils'
import type { SeatSelectorViewProps } from '@/types'

/**
 * Pure view component for seat selection
 * Displays sections, available seats, and handles user interactions via callbacks
 */
export function SeatSelectorView({
  eventId,
  sections,
  selectedSection,
  availableSeats,
  selectedSeats,
  loading,
  reserving,
  purchasing,
  error,
  reservedTicketIds,
  totalPrice,
  reservedTotalPrice,
  onSectionSelect,
  onSeatToggle,
  onReserve,
  onPurchase,
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
                Available Seats in {selectedSection.section_name}
              </h3>
              {loading ? (
                <p className="text-gray-600">Loading seats...</p>
              ) : availableSeats.length === 0 ? (
                <p className="text-gray-600">No seats available in this section</p>
              ) : (
                <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
                  {availableSeats.map((seat) => (
                    <button
                      key={seat.id}
                      onClick={() => onSeatToggle(seat.id)}
                      disabled={reservedTicketIds.length > 0}
                      className={`
                        p-2 rounded text-sm font-medium transition-colors
                        ${
                          selectedSeats.includes(seat.id)
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                        }
                        ${
                          reservedTicketIds.length > 0
                            ? 'opacity-50 cursor-not-allowed'
                            : 'cursor-pointer'
                        }
                      `}
                    >
                      {seat.seat_number}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Selection Summary */}
            {selectedSeats.length > 0 && (
              <div className="bg-blue-50 p-4 rounded-lg mb-4">
                <p className="font-semibold mb-2">
                  Selected: {selectedSeats.length} seat(s):
                </p>
                <p>
                  {
                    selectedSeats
                    .map(id => availableSeats.find(x => x.id == id)).filter(Boolean)
                    .map(x => x?.seat_number)
                    .toSorted()
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

            {/* Reserved Tickets */}
            {reservedTicketIds.length > 0 && (
              <div className="bg-green-50 p-4 rounded-lg border-2 border-green-200">
                <p className="font-semibold text-green-800 mb-2">
                  ✓ Reserved: {reservedTicketIds.length} seat(s)
                </p>
                <p className="text-sm text-green-700 mb-2">
                  Your reservation will expire in 5 minutes
                </p>
                <p className="text-2xl font-bold text-green-800 mb-4">
                  Total: {formatCurrency(reservedTotalPrice)}
                </p>
                <Button
                  onClick={onPurchase}
                  disabled={purchasing}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  {purchasing ? 'Processing...' : 'Complete Purchase'}
                </Button>
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
          <div className="flex gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gray-100 rounded"></div>
              <span>Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded"></div>
              <span>Selected</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
