import { z } from 'zod'

/**
 * Validation schema for event creation/edit form
 */
export const eventFormSchema = z.object({
  name: z.string()
    .min(1, 'Event name is required')
    .min(3, 'Event name must be at least 3 characters')
    .max(200, 'Event name must not exceed 200 characters'),
  
  description: z.string()
    .min(1, 'Description is required')
    .min(10, 'Description must be at least 10 characters')
    .max(2000, 'Description must not exceed 2000 characters'),
  
  eventDate: z.string()
    .min(1, 'Event date is required')
    .refine((date) => {
      const selectedDate = new Date(date)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      return selectedDate >= today
    }, 'Event date cannot be in the past'),
  
  eventTime: z.string()
    .min(1, 'Event time is required')
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format'),
  
  venue: z.string()
    .min(1, 'Venue is required')
    .min(3, 'Venue must be at least 3 characters')
    .max(200, 'Venue must not exceed 200 characters'),
})

export type EventFormInput = z.infer<typeof eventFormSchema>

/**
 * Validation schema for seating section form
 */
export const sectionFormSchema = z.object({
  sectionName: z.string()
    .min(1, 'Section name is required')
    .min(2, 'Section name must be at least 2 characters')
    .max(100, 'Section name must not exceed 100 characters'),
  
  price: z.number()
    .positive('Price must be greater than 0')
    .max(10000, 'Price must not exceed $10,000'),
  
  totalSeats: z.number()
    .int('Total seats must be a whole number')
    .positive('Total seats must be greater than 0')
    .max(10000, 'Total seats must not exceed 10,000'),
})

export type SectionFormInput = z.infer<typeof sectionFormSchema>

/**
 * Validation schema for event creation with sections
 */
export const eventWithSectionsSchema = eventFormSchema.extend({
  sections: z.array(sectionFormSchema)
    .min(1, 'At least one seating section is required')
    .max(20, 'Cannot exceed 20 seating sections'),
})

export type EventWithSectionsInput = z.infer<typeof eventWithSectionsSchema>
