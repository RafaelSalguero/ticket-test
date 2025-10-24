export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function validatePassword(password: string): {
  valid: boolean
  message?: string
} {
  if (password.length < 8) {
    return {
      valid: false,
      message: 'Password must be at least 8 characters long',
    }
  }

  if (!/[A-Z]/.test(password)) {
    return {
      valid: false,
      message: 'Password must contain at least one uppercase letter',
    }
  }

  if (!/[a-z]/.test(password)) {
    return {
      valid: false,
      message: 'Password must contain at least one lowercase letter',
    }
  }

  if (!/[0-9]/.test(password)) {
    return {
      valid: false,
      message: 'Password must contain at least one number',
    }
  }

  return { valid: true }
}

export function validateEventForm(data: {
  name: string
  description: string
  eventDate: string
  eventTime: string
  venue: string
}): { valid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {}

  if (!data.name || data.name.trim().length === 0) {
    errors.name = 'Event name is required'
  }

  if (!data.description || data.description.trim().length === 0) {
    errors.description = 'Description is required'
  }

  if (!data.eventDate) {
    errors.eventDate = 'Event date is required'
  } else {
    const eventDate = new Date(data.eventDate)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    if (eventDate < today) {
      errors.eventDate = 'Event date cannot be in the past'
    }
  }

  if (!data.eventTime) {
    errors.eventTime = 'Event time is required'
  }

  if (!data.venue || data.venue.trim().length === 0) {
    errors.venue = 'Venue is required'
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  }
}

export function validateCheckoutForm(data: {
  cardNumber: string
  cardHolder: string
  expiryDate: string
  cvv: string
}): { valid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {}

  // Card number validation (simple 16-digit check)
  if (!data.cardNumber || !/^\d{16}$/.test(data.cardNumber.replace(/\s/g, ''))) {
    errors.cardNumber = 'Invalid card number'
  }

  if (!data.cardHolder || data.cardHolder.trim().length === 0) {
    errors.cardHolder = 'Card holder name is required'
  }

  // Expiry date validation (MM/YY format)
  if (!data.expiryDate || !/^\d{2}\/\d{2}$/.test(data.expiryDate)) {
    errors.expiryDate = 'Invalid expiry date (MM/YY)'
  } else {
    const [month, year] = data.expiryDate.split('/').map(Number)
    const currentYear = new Date().getFullYear() % 100
    const currentMonth = new Date().getMonth() + 1

    if (month < 1 || month > 12) {
      errors.expiryDate = 'Invalid month'
    } else if (year < currentYear || (year === currentYear && month < currentMonth)) {
      errors.expiryDate = 'Card has expired'
    }
  }

  // CVV validation (3-4 digits)
  if (!data.cvv || !/^\d{3,4}$/.test(data.cvv)) {
    errors.cvv = 'Invalid CVV'
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  }
}
