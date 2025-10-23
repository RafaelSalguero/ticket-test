import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(d)
}

export function formatTime(time: string): string {
  // Assuming time is in HH:MM format
  const [hours, minutes] = time.split(':')
  const hour = parseInt(hours)
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const displayHour = hour % 12 || 12
  return `${displayHour}:${minutes} ${ampm}`
}

export function generateSeatNumbers(totalSeats: number): string[] {
  const seats: string[] = []
  const rows = Math.ceil(totalSeats / 10)
  
  for (let row = 0; row < rows; row++) {
    const rowLetter = String.fromCharCode(65 + row) // A, B, C, etc.
    const seatsInRow = Math.min(10, totalSeats - row * 10)
    
    for (let seat = 1; seat <= seatsInRow; seat++) {
      seats.push(`${rowLetter}${seat}`)
    }
  }
  
  return seats
}
