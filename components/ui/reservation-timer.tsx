'use client'

import { useState, useEffect } from 'react'

interface ReservationTimerProps {
  expiresAt: Date
  onExpire?: () => void
}

/**
 * Real-time countdown timer for reservations
 * Shows remaining time in mm:ss format with color-coded urgency
 */
export function ReservationTimer({ expiresAt, onExpire }: ReservationTimerProps) {
  const calculateTimeLeft = () => {
    const now = Date.now()
    const expires = new Date(expiresAt).getTime()
    const remaining = Math.max(0, expires - now)
    return Math.floor(remaining / 1000) // Convert to seconds
  }

  const [timeLeft, setTimeLeft] = useState<number>(() => calculateTimeLeft())

  useEffect(() => {

    // Update every second
    const interval = setInterval(() => {
      const remaining = calculateTimeLeft()
      setTimeLeft(remaining)

      if (remaining === 0) {
        clearInterval(interval)
        onExpire?.()
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [expiresAt, onExpire])

  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60

  // Color coding based on time remaining
  const getColorClass = () => {
    if (timeLeft <= 3) return 'text-red-600 font-bold'
    if (timeLeft <= 6) return 'text-orange-600 font-semibold'
    return 'text-green-600 font-semibold'
  }

  return (
    <div className={`text-sm ${getColorClass()}`}>
      Expires in: {minutes}:{seconds.toString().padStart(2, '0')}
    </div>
  )
}
