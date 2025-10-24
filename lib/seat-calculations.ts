import { query } from './db';
import type { SeatingSection } from '@/types';

/**
 * Interface for sections with calculated availability
 */
export interface SeatingSectionWithAvailability extends SeatingSection {
  available_seats: number;
}

/**
 * Calculate available seats for a single section
 * 
 * @param sectionId - The ID of the seating section
 * @returns Promise<number> - Count of available seats
 */
export async function calculateAvailableSeats(sectionId: string): Promise<number> {
  const result = await query(
    `SELECT COUNT(*) as count 
     FROM tickets 
     WHERE section_id = $1 AND status = 'available'`,
    [sectionId]
  );
  
  return parseInt(result.rows[0]?.count || '0', 10);
}

/**
 * Calculate available seats for multiple sections efficiently
 * 
 * @param sectionIds - Array of section IDs
 * @returns Promise<Map<string, number>> - Map of section_id to available seat count
 */
export async function calculateAvailableSeatsBulk(
  sectionIds: string[]
): Promise<Map<string, number>> {
  if (sectionIds.length === 0) {
    return new Map();
  }

  const result = await query(
    `SELECT section_id, COUNT(*) as count 
     FROM tickets 
     WHERE section_id = ANY($1) AND status = 'available'
     GROUP BY section_id`,
    [sectionIds]
  );

  const countMap = new Map<string, number>();
  
  for (const row of result.rows) {
    countMap.set(row.section_id, parseInt(row.count, 10));
  }

  // Fill in zeros for sections with no available seats
  for (const sectionId of sectionIds) {
    if (!countMap.has(sectionId)) {
      countMap.set(sectionId, 0);
    }
  }

  return countMap;
}

/**
 * Enrich section objects with calculated available_seats
 * 
 * @param sections - Array of SeatingSection objects
 * @returns Promise<SeatingSectionWithAvailability[]> - Sections with calculated available_seats
 */
export async function enrichSectionsWithAvailability(
  sections: SeatingSection[]
): Promise<SeatingSectionWithAvailability[]> {
  if (sections.length === 0) {
    return [];
  }

  const sectionIds = sections.map(section => section.id);
  const availabilityMap = await calculateAvailableSeatsBulk(sectionIds);

  return sections.map(section => ({
    ...section,
    available_seats: availabilityMap.get(section.id) || 0
  }));
}
