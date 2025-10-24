'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getAvailableSeats, reserveTickets, purchaseTickets } from '@/actions/ticket-actions'
import type { SeatingSection, Ticket, UseSeatSelectionReturn } from '@/types'

/**
 * Hook for managing seat selection state and actions
 * Handles loading seats, reserving, and purchasing tickets
 */
export function useSeatSelection(
  eventId: string,
  sections: SeatingSection[],
  userId: string
): UseSeatSelectionReturn {
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
      loadAvailableSeatsAsync(selectedSection.id)
    }
  }, [selectedSection])

  const loadAvailableSeatsAsync = async (sectionId: string) => {
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
              loadAvailableSeatsAsync(selectedSection.id)
            }
          }, 5 * 60 * 1000)
        }

        // Refresh available seats
        if (selectedSection) {
          await loadAvailableSeatsAsync(selectedSection.id)
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

  const reservedTotalPrice =
    selectedSection && reservedTicketIds.length > 0
      ? reservedTicketIds.length * selectedSection.price
      : 0

  return {
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
    setSelectedSection,
    handleSeatToggle,
    handleReserve,
    handlePurchase,
  }
}
