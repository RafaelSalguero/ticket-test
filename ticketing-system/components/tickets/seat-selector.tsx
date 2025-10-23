'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getAvailableSeats, reserveTickets, purchaseTickets } from '@/actions/ticket-actions'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils'
import type { SeatingSection, Ticket } from '@/types'

interface SeatSelectorProps {
  eventId: string
  sections: SeatingSection[]
  userId: string
}

export function SeatSelector({ eventId, sections, userId }: SeatSelectorProps) {
  const router = useRouter()
  const [selectedSection, setSelectedSection] = useState<SeatingSection | null>(null)
  const [availableSeats, setAvailableSeats] = useState<Ticket[]>([])
  const [selectedSeats, setSelectedSeats] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [reserving, setReserving] = useState(false)
  const [purchasing, setPurchasing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [reservedTicketIds, setReservedTicketIds] = useState<string[]>([])

  // Load available seats when section is selected
  useEffect(() => {
    if (selectedSection) {
      loadAvailableSeats(selectedSection.id)
    }
  }, [selectedSection])

  const loadAvailableSeats = async (sectionId: string) => {
    setLoading(true)
    setError(null)
    try {
      const seats = await getAvailableSeats(eventId, sectionId)
      setAvailableSeats(seats)
    } catch (err) {
      setError('Failed to load available seats')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSeatToggle = (seatId: string) => {
    if (reservedTicketIds.length > 0) {
      setError('Please complete your current reservation or wait for it to expire')
      return
    }

    setSelectedSeats((prev) =>
      prev.includes(seatId)
        ? prev.filter((id) => id !== seatId)
        : [...prev, seatId]
    )
  }

  const handleReserve = async () => {
    if (selectedSeats.length === 0) {
      setError('Please select at least one seat')
      return
    }

    setReserving(true)
    setError(null)

    try {
      const result = await reserveTickets(selectedSeats, userId)

      if (result.success && result.data) {
        setReservedTicketIds(result.data)
        setSelectedSeats([])
        
        if (result.error) {
          setError(result.error)
        } else {
          // Start 5-minute countdown
          setTimeout(() => {
            setReservedTicketIds([])
            if (selectedSection) {
              loadAvailableSeats(selectedSection.id)
            }
          }, 5 * 60 * 1000)
        }

        // Refresh available seats
        if (selectedSection) {
          await loadAvailableSeats(selectedSection.id)
        }
      } else {
        setError(result.error || 'Failed to reserve seats')
      }
    } catch (err) {
      setError('An error occurred while reserving seats')
      console.error(err)
    } finally {
      setReserving(false)
    }
  }

  const handlePurchase = async () => {
    if (reservedTicketIds.length === 0) {
      setError('No reserved tickets to purchase')
      return
    }

    setPurchasing(true)
    setError(null)

    try {
      const result = await purchaseTickets(reservedTicketIds)

      if (result.success && result.data) {
        router.push(`/orders/${result.data.orderId}`)
      } else {
        setError(result.error || 'Failed to purchase tickets')
      }
    } catch (err) {
      setError('An error occurred while purchasing tickets')
      console.error(err)
    } finally {
      setPurchasing(false)
    }
  }

  const totalPrice = selectedSection
    ? selectedSeats.length * selectedSection.price
    : 0

  const reservedTotalPrice = selectedSection && reservedTicketIds.length > 0
    ? reservedTicketIds.length * selectedSection.price
    : 0

  return (
    <Card>
      <CardHeader>
        <CardTitle>Select Your Seats</CardTitle>
        <CardDescription>
          Choose a section, then select your seats
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Section Selection */}
        <div className="mb-6">
          <h3 className="font-semibold mb-3">Choose Section</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {sections.map((section) => (
              <Button
                key={section.id}
                variant={selectedSection?.id === section.id ? 'default' : 'outline'}
                onClick={() => {
                  setSelectedSection(section)
                  setSelectedSeats([])
                  setError(null)
                }}
                disabled={section.available_seats === 0}
              >
                {section.section_name}
              </Button>
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
                      onClick={() => handleSeatToggle(seat.id)}
                      disabled={reservedTicketIds.length > 0}
                      className={`
                        p-2 rounded text-sm font-medium transition-colors
                        ${
                          selectedSeats.includes(seat.id)
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                        }
                        ${reservedTicketIds.length > 0 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
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
                  Selected: {selectedSeats.length} seat(s)
                </p>
                <p className="text-2xl font-bold text-blue-600">
                  Total: {formatCurrency(totalPrice)}
                </p>
                <Button
                  onClick={handleReserve}
                  disabled={reserving}
                  className="w-full mt-4"
                >
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
                  onClick={handlePurchase}
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
