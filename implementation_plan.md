# Implementation Plan: Remove Calculated Fields from Database

## [Overview]
Remove the `available_seats` column from the `seating_sections` table and replace all references with dynamic queries that calculate available seats from the `tickets` table based on ticket status.

This refactoring eliminates data redundancy and potential inconsistencies by making the tickets table the single source of truth for seat availability. The change affects database migrations, TypeScript types, server actions, and UI components that display or depend on available seat counts.

## [Types]
Modify TypeScript interfaces to reflect the removal of the calculated field from database models.

**Modifications to `ticketing-system/types/index.ts`:**

1. Remove `available_seats` from the `SeatingSection` interface:
   ```typescript
   export interface SeatingSection {
     id: string;
     event_id: string;
     section_name: string;
     price: number;
     total_seats: number;
     // REMOVE: available_seats: number;
     created_at: Date;
   }
   ```

2. Create a new interface for sections with calculated available seats (used in application code):
   ```typescript
   export interface SeatingSecti onWithAvailability extends SeatingSection {
     available_seats: number;
   }
   ```

3. Update `EventWithSections` to use the new interface:
   ```typescript
   export interface EventWithSections extends Event {
     sections: SeatingSectionWithAvailability[];
   }
   ```

## [Files]
Database migrations, seed data, type definitions, server actions, and UI components require updates to remove or calculate available_seats.

**Files to Modify:**

1. **ticketing-system/migrations/003_create_seating_sections_table.sql**
   - Remove `available_seats` column definition
   - Remove `chk_available_seats` constraint

2. **ticketing-system/migrations/007_seed_data.sql**
   - Remove `available_seats` from INSERT statements for seating sections

3. **ticketing-system/setup-test-data.sql**
   - Remove `available_seats` from INSERT statements for seating sections

4. **ticketing-system/types/index.ts**
   - Remove `available_seats` from `SeatingSection` interface
   - Add new `SeatingSectionWithAvailability` interface
   - Update `EventWithSections` to use new interface

5. **ticketing-system/actions/event-actions.ts**
   - Remove `available_seats` from section INSERT statements
   - Add helper function to calculate available seats
   - Update queries to calculate and include available_seats in results

6. **ticketing-system/actions/ticket-actions.ts**
   - Remove the UPDATE statement that decrements `available_seats`
   - Add logic to calculate available seats where needed

7. **ticketing-system/components/tickets/seat-selector-view.tsx**
   - No changes needed (receives calculated data from parent)

8. **ticketing-system/components/events/events-list-view.tsx**
   - No changes needed (receives calculated data from loader)

9. **ticketing-system/actions/order-actions.ts**
   - Remove hardcoded `available_seats: 0`
   - Add calculation for available seats if needed

**New Files to Create:**

1. **ticketing-system/migrations/008_remove_available_seats.sql**
   - Migration to drop the `available_seats` column
   - Drop the `chk_available_seats` constraint

2. **ticketing-system/lib/seat-calculations.ts**
   - Helper functions for calculating available seats
   - Centralized query logic for seat availability

## [Functions]
Create new helper functions for seat calculations and update existing functions to remove available_seats references.

**New Functions:**

1. **`calculateAvailableSeats(sectionId: string): Promise<number>`** in `lib/seat-calculations.ts`
   - Purpose: Query tickets table to count available seats for a section
   - Query: `SELECT COUNT(*) FROM tickets WHERE section_id = $1 AND status = 'available'`
   - Returns: Number of available seats

2. **`calculateAvailableSeatsBulk(sectionIds: string[]): Promise<Map<string, number>>`** in `lib/seat-calculations.ts`
   - Purpose: Efficiently calculate available seats for multiple sections
   - Query: `SELECT section_id, COUNT(*) FROM tickets WHERE section_id = ANY($1) AND status = 'available' GROUP BY section_id`
   - Returns: Map of section_id to available seat count

3. **`enrichSectionsWithAvailability(sections: SeatingSection[]): Promise<SeatingSectionWithAvailability[]>`** in `lib/seat-calculations.ts`
   - Purpose: Add available_seats to section objects
   - Uses `calculateAvailableSeatsBulk` for efficiency
   - Returns: Sections with calculated available_seats

**Modified Functions:**

1. **`createEvent`** in `actions/event-actions.ts`
   - File: ticketing-system/actions/event-actions.ts
   - Change: Remove `available_seats` from INSERT statement
   - Before: `INSERT INTO seating_sections (event_id, section_name, price, total_seats, available_seats) VALUES (..., $4, $4)`
   - After: `INSERT INTO seating_sections (event_id, section_name, price, total_seats) VALUES (..., $4)`

2. **`getEvents`** in `actions/event-actions.ts`
   - File: ticketing-system/actions/event-actions.ts
   - Change: Use `enrichSectionsWithAvailability` to calculate available seats
   - Add import: `import { enrichSectionsWithAvailability } from '@/lib/seat-calculations'`
   - After fetching sections: `sections: await enrichSectionsWithAvailability(sectionsResult.rows)`

3. **`getEventById`** in `actions/event-actions.ts`
   - File: ticketing-system/actions/event-actions.ts
   - Change: Use `enrichSectionsWithAvailability` to calculate available seats
   - After fetching sections: `sections: await enrichSectionsWithAvailability(sectionsResult.rows)`

4. **`getUpcomingEvents`** in `actions/event-actions.ts`
   - File: ticketing-system/actions/event-actions.ts
   - Change: Use `enrichSectionsWithAvailability` to calculate available seats
   - After fetching sections: `sections: await enrichSectionsWithAvailability(sectionsResult.rows)`

5. **`purchaseTickets`** in `actions/ticket-actions.ts`
   - File: ticketing-system/actions/ticket-actions.ts
   - Change: Remove the UPDATE statement that decrements available_seats
   - Remove this block:
     ```typescript
     // Update available seats count
     for (const ticket of tickets) {
       await client.query(
         `UPDATE seating_sections 
          SET available_seats = available_seats - 1
          WHERE id = $1`,
         [ticket.section_id]
       )
     }
     ```

6. **`getOrderById`** in `actions/order-actions.ts`
   - File: ticketing-system/actions/order-actions.ts
   - Change: Remove hardcoded `available_seats: 0` from section object
   - Consider if available_seats is needed in order details (likely not needed)

## [Classes]
No class modifications required. This project uses functional components and server actions rather than class-based architecture.

## [Dependencies]
No new external dependencies required. All changes use existing PostgreSQL queries and TypeScript functionality.

## [Testing]
Ensure data integrity and correct calculation of available seats across all features.

**Test Modifications:**

1. **Migration Testing**
   - Run migration 008 on test database
   - Verify `available_seats` column is dropped
   - Verify existing data remains intact
   - Test rollback scenario if needed

2. **Unit Tests for Seat Calculations**
   - Test `calculateAvailableSeats` with various ticket statuses
   - Test `calculateAvailableSeatsBulk` with multiple sections
   - Test edge cases: no tickets, all sold, all reserved

3. **Integration Tests**
   - Test event creation without available_seats
   - Test ticket purchase flow calculates correctly
   - Test event listing shows correct availability
   - Test seat selector shows correct available seats
   - Test reservation expiration doesn't affect calculation

4. **Data Integrity Tests**
   - Compare old available_seats values with calculated values before migration
   - Verify counts match after migration
   - Test that multiple concurrent purchases don't cause issues

5. **Performance Testing**
   - Measure query performance for `enrichSectionsWithAvailability`
   - Test with large numbers of events and sections
   - Ensure bulk calculation is more efficient than individual queries

**Manual Testing Checklist:**
- [ ] View events list and verify seat counts
- [ ] Open event detail page and verify section availability
- [ ] Select seats and verify counts update correctly
- [ ] Reserve tickets and verify availability decreases
- [ ] Purchase tickets and verify availability decreases
- [ ] Let reservation expire and verify availability increases
- [ ] Create new event and verify initial availability equals total_seats
- [ ] Test concurrent purchases (open event in two browsers)

## [Implementation Order]
Follow this sequence to minimize breaking changes and ensure safe deployment.

1. **Create Helper Functions**
   - Create `ticketing-system/lib/seat-calculations.ts`
   - Implement `calculateAvailableSeats`
   - Implement `calculateAvailableSeatsBulk`
   - Implement `enrichSectionsWithAvailability`
   - Add unit tests for helper functions

2. **Update TypeScript Types**
   - Modify `ticketing-system/types/index.ts`
   - Add `SeatingSectionWithAvailability` interface
   - Update `EventWithSections` interface
   - Keep `SeatingSection` with `available_seats` temporarily for compatibility

3. **Update Event Actions**
   - Modify `ticketing-system/actions/event-actions.ts`
   - Update `getEvents` to use `enrichSectionsWithAvailability`
   - Update `getEventById` to use `enrichSectionsWithAvailability`
   - Update `getUpcomingEvents` to use `enrichSectionsWithAvailability`
   - Keep `createEvent` INSERT with available_seats for now

4. **Update Ticket Actions**
   - Modify `ticketing-system/actions/ticket-actions.ts`
   - Remove the UPDATE statement from `purchaseTickets` that decrements available_seats
   - Test purchase flow still works correctly

5. **Update Order Actions**
   - Modify `ticketing-system/actions/order-actions.ts`
   - Remove hardcoded `available_seats: 0`
   - Verify order details display correctly

6. **Test Application**
   - Run full integration tests
   - Verify all features work with calculated values
   - Check for any remaining errors or warnings

7. **Update Event Creation**
   - Modify `ticketing-system/actions/event-actions.ts`
   - Remove `available_seats` from `createEvent` INSERT statement
   - Test event creation works without available_seats

8. **Create Database Migration**
   - Create `ticketing-system/migrations/008_remove_available_seats.sql`
   - Add DROP CONSTRAINT and DROP COLUMN statements
   - Test migration on development database

9. **Update Seed Data**
   - Modify `ticketing-system/migrations/007_seed_data.sql`
   - Remove `available_seats` from INSERT statements
   - Modify `ticketing-system/setup-test-data.sql` similarly
   - Test seed data works correctly

10. **Update Table Schema Migration**
    - Modify `ticketing-system/migrations/003_create_seating_sections_table.sql`
    - Remove `available_seats` column definition
    - Remove constraint definition
    - Document this is for reference (old databases will use migration 008)

11. **Final Type Cleanup**
    - Update `ticketing-system/types/index.ts`
    - Remove `available_seats` from `SeatingSection` interface completely
    - Ensure all code uses `SeatingSectionWithAvailability` where needed

12. **Final Testing**
    - Run complete test suite
    - Verify no TypeScript errors
    - Test fresh database creation
    - Test existing database migration
    - Performance test with realistic data volumes

13. **Documentation**
    - Update README if needed
    - Document the change in IMPLEMENTATION_STATUS.md
    - Add comments explaining seat calculation approach
