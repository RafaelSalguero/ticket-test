'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getAllSeats, reserveTickets, purchaseTickets, cancelReservation } from '@/actions/ticket-actions'
import type { SeatingSectionWithAvailability, Ticket, UseSeatSelectionReturn } from '@/types'

/**
 * Builds a map of seat ID to status for quick lookup
 */
function buildSeatStatusMap(seats: Ticket[]): Map<string, Ticket['status']> {
  const statusMap = new Map<string, Ticket['status']>()
  
  for (const seat of seats) {
    // Check if reservation has expired (>10 seconds old)
    const isExpiredReservation = 
      seat.status === 'reserved' && 
      seat.reserved_at && 
      new Date(seat.reserved_at).getTime() < Date.now() - 10 * 1000
    
    // Treat expired reservations as available
    statusMap.set(seat.id, isExpiredReservation ? 'available' : seat.status)
  }
  
  return statusMap
}

/**
 * Hook for managing seat selection state and actions
 * Handles loading seats, reserving, and purchasing tickets
 */
export function useSeatSelection(
  eventId: string,
  userId: string
): UseSeatSelectionReturn {
  const router = useRouter()
  const [selectedSection, setSelectedSection] = useState<SeatingSectionWithAvailability | null>(null)
  const [allSeats, setAllSeats] = useState<Ticket[]>([])
  const [seatStatusMap, setSeatStatusMap] = useState<Map<string, Ticket['status']>>(new Map())
  const [selectedSeats, setSelectedSeats] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [reserving, setReserving] = useState(false)
  const [purchasing, setPurchasing] = useState(false)
  const [canceling, setCanceling] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [reservedTicketIds, setReservedTicketIds] = useState<string[]>([])
  const [reservationExpiresAt, setReservationExpiresAt] = useState<Date | null>(null)
  const [partialReservation, setPartialReservation] = useState<{
    requested: number
    reserved: number
    failedSeats: string[]
  } | null>(null)

  // Load all seats when section is selected
  useEffect(() => {
    if (selectedSection) {
      loadAllSeatsAsync(selectedSection.id)
    }
  }, [selectedSection])

  const loadAllSeatsAsync = async (sectionId: string) => {
    setLoading(true)
    setError(null)
    try {
      const seats = await getAllSeats(eventId, sectionId)
      setAllSeats(seats)
      setSeatStatusMap(buildSeatStatusMap(seats))
    } catch (err) {
      setError('Failed to load seats')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSeatToggle = (seatId: string) => {
    // Prevent toggling if there are already reserved tickets
    if (reservedTicketIds.length > 0) {
      setError('Please complete your current reservation or wait for it to expire')
      return
    }

    // Prevent selection of non-available seats
    const seatStatus = seatStatusMap.get(seatId)
    if (seatStatus !== 'available') {
      setError('This seat is not available for selection')
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

    const requestedSeats = [...selectedSeats]
    setReserving(true)
    setError(null)
    setPartialReservation(null)

    try {
      const result = await reserveTickets(selectedSeats, userId)

      if (result.success && result.data) {
        const reservedIds = result.data
        setReservedTicketIds(reservedIds)
        
        // Set expiration time (10 seconds from now)
        const expiresAt = new Date(Date.now() + 10 * 1000)
        setReservationExpiresAt(expiresAt)

        // Check if partial reservation occurred
        if (reservedIds.length < requestedSeats.length) {
          // Find which seats failed to reserve
          const failedSeatIds = requestedSeats.filter(id => !reservedIds.includes(id))
          const failedSeatNumbers = failedSeatIds
            .map(id => allSeats.find(seat => seat.id === id)?.seat_number)
            .filter((num): num is string => num !== undefined)

          setPartialReservation({
            requested: requestedSeats.length,
            reserved: reservedIds.length,
            failedSeats: failedSeatNumbers,
          })

          // Unselect the failed seats
          setSelectedSeats([])
        } else {
          // Full success - clear selection
          setSelectedSeats([])
          setPartialReservation(null)
        }

        // Start 10-second countdown
        setTimeout(() => {
          setReservedTicketIds([])
          setReservationExpiresAt(null)
          setPartialReservation(null)
          if (selectedSection) {
            loadAllSeatsAsync(selectedSection.id)
          }
        }, 10 * 1000)

        // Refresh all seats to show updated status
        if (selectedSection) {
          await loadAllSeatsAsync(selectedSection.id)
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

  const handleCancelReservation = async () => {
    if (reservedTicketIds.length === 0) {
      setError('No reservation to cancel')
      return
    }

    setCanceling(true)
    setError(null)

    try {
      const result = await cancelReservation(reservedTicketIds, userId)

      if (result.success) {
        // Clear reservation state
        setReservedTicketIds([])
        setReservationExpiresAt(null)
        setPartialReservation(null)

        // Refresh seats to show updated availability
        if (selectedSection) {
          await loadAllSeatsAsync(selectedSection.id)
        }
      } else {
        setError(result.error || 'Failed to cancel reservation')
      }
    } catch (err) {
      setError('An error occurred while canceling reservation')
      console.error(err)
    } finally {
      setCanceling(false)
    }
  }

  const totalPrice = selectedSection
    ? selectedSeats.length * selectedSection.price
    : 0

  const reservedTotalPrice =
    selectedSection && reservedTicketIds.length > 0
      ? reservedTicketIds.length * selectedSection.price
      : 0

  return {
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
  }
}
