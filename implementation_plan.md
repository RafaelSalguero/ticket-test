# Implementation Plan: Show All Seats with Status Indicators

## [Overview]

Modify the seat selector component to display all seats (both available and reserved) with visual status indicators, disabling unavailable seats while showing their status with distinct coloring.

The current implementation uses `getAvailableSeats()` which queries ONLY available seats from the database (filtering at the query level). This plan will:
- Create a new query function to fetch ALL seats regardless of status
- Display all seats in the grid layout
- Show status badges/labels for each seat (Available, Reserved, Sold)
- Apply distinct red/orange styling to reserved/sold seats
- Disable interaction on reserved/sold seats while keeping available seats selectable
- Maintain the current seat selection functionality for available seats

This improves user experience by showing the complete seating layout, giving users context about seat availability and the overall venue structure.

## [Types]

Extend and clarify seat-related type definitions to explicitly include seat status information.

### Type System Enhancements

1. **Seat Status Type** (in `types/index.ts`)
   - Currently Ticket type has `status` field
   - Ensure consistent handling of status values: 'available', 'reserved', 'sold', 'pending'

2. **Seat Selection Hook Return Type** (in `hooks/use-seat-selection.ts`)
   - Add `allSeats` property to return ALL seat objects (not just available)
   - Add `seatStatusMap` property: `Record<string, Ticket>` to track seat status by seat number
   - Maintain `availableSeats` for backward compatibility
   - Maintain `selectedSeats` for current selection state

## [Files]

Create new query function and modify existing component files to support the new seat display functionality.

### New Files
- `ticketing-system/components/tickets/seat-status-badge.tsx` - New component to display seat status labels with appropriate styling

### Modified Files

1. **ticketing-system/actions/ticket-actions.ts**
   - **CRITICAL**: Add new function `getAllSeats(eventId: string, sectionId: string)` that queries ALL tickets regardless of status
   - Query: `SELECT * FROM tickets WHERE event_id = $1 AND section_id = $2 ORDER BY seat_number ASC`
   - This is the KEY change - fetching all seats at the data layer

2. **ticketing-system/components/tickets/seat-selector-view.tsx**
   - Change from calling `getAvailableSeats()` to calling `getAllSeats()`
   - Pass all seats to the SeatSelector component
   - Update to handle complete seat inventory data

3. **ticketing-system/hooks/use-seat-selection.ts**
   - Receive all seats (not filtered)
   - Create `seatStatusMap` from all seats for quick lookup
   - Filter `availableSeats` from all seats for selection logic
   - Return both `allSeats` and `seatStatusMap` in addition to existing return values
   - Update selection logic to prevent selection of non-available seats

4. **ticketing-system/components/tickets/seat-selector.tsx**
   - Modify to iterate over ALL seats instead of just available ones
   - Remove any filtering logic
   - Add status badge rendering for each seat
   - Apply conditional styling based on seat status (red/orange for reserved/sold)
   - Add disabled attribute to reserved/sold seats
   - Prevent click handlers from firing on non-available seats

5. **ticketing-system/app/globals.css**
   - Add CSS classes for reserved seat styling (red/orange background or border)
   - Add CSS classes for sold seat styling (darker red or different indicator)
   - Add CSS classes for disabled seat appearance (cursor: not-allowed, reduced opacity)
   - Add CSS classes for available seat styling (highlight on hover, blue when selected)

### No Deletion
- All existing files remain; only modifications and additions occur
- Keep `getAvailableSeats()` function for backward compatibility if needed elsewhere

## [Functions]

Create new data fetching functions and modify existing functions to support displaying all seats.

### New Functions

1. **getAllSeats()** (in `actions/ticket-actions.ts`)
   - **Purpose**: Fetch ALL tickets for a section regardless of status
   - **Signature**: `async getAllSeats(eventId: string, sectionId: string): Promise<Ticket[]>`
   - **Query**: 
     ```sql
     SELECT * FROM tickets 
     WHERE event_id = $1 AND section_id = $2 
     ORDER BY seat_number ASC
     ```
   - **Returns**: Array of all Ticket objects with their current status

2. **buildSeatStatusMap()** (in `hooks/use-seat-selection.ts`)
   - **Purpose**: Create a lookup map of seat number to ticket object
   - **Signature**: `(tickets: Ticket[]) => Record<string, Ticket>`
   - **Logic**: Reduce tickets array into object keyed by seat_number
   - **Returns**: Object mapping seat numbers to their ticket objects

3. **SeatStatusBadge Component** (in `components/tickets/seat-status-badge.tsx`)
   - **Purpose**: Display status label for each seat
   - **Props**: `{ status: 'available' | 'reserved' | 'sold' | 'pending' }`
   - **Renders**: Small badge/label with appropriate styling and text

### Modified Functions

1. **useSeatSelection()** (in `hooks/use-seat-selection.ts`)
   - **Current behavior**: Receives availableSeats only
   - **New behavior**: Receives allSeats, builds seatStatusMap
   - **New return values**: 
     - `allSeats: Ticket[]` - All seats for rendering
     - `seatStatusMap: Record<string, Ticket>` - Quick status lookup
     - `availableSeats: Ticket[]` - Filtered available seats (derived from allSeats)
     - `selectedSeats: string[]` - Currently selected seat numbers (existing)
     - `toggleSeat: (seatNumber: string) => void` - Selection handler (existing)
   - **Updated logic**: Filter availableSeats from allSeats where status === 'available'

2. **toggleSeat handler** (in `hooks/use-seat-selection.ts`)
   - Add validation: Check if seat is available before allowing selection
   - Prevent selection of reserved/sold seats

3. **Seat rendering logic** (in `seat-selector.tsx`)
   - Change from mapping over `availableSeats` to mapping over `allSeats`
   - Add conditional checks for seat status to apply appropriate styling
   - Add disabled attribute based on seat status
   - Add onClick guard to prevent interaction with non-available seats

## [Classes]

Introduce new component class structures for modular seat rendering.

### New Components

1. **SeatStatusBadge** (in `seat-status-badge.tsx`)
   - **Props Interface**: 
     ```typescript
     interface SeatStatusBadgeProps {
       status: 'available' | 'reserved' | 'sold' | 'pending'
     }
     ```
   - **Styling**: Different colors/badges based on status
     - Available: Green or blue badge
     - Reserved: Orange/yellow badge (user preference: distinct color)
     - Sold: Red badge
     - Pending: Gray badge
   - **Text**: Display status as readable text

### Modified Components

1. **Seat Button Rendering** (in `seat-selector.tsx`)
   - Add conditional className based on seat status
   - Apply red/orange styling for reserved seats
   - Apply darker red for sold seats
   - Add disabled attribute for non-available seats
   - Include SeatStatusBadge component in rendering
   - Structure:
     ```tsx
     <button
       className={cn(
         "base-seat-styles",
         status === 'available' && "available-seat-styles",
         status === 'reserved' && "reserved-seat-styles",
         status === 'sold' && "sold-seat-styles",
         isSelected && "selected-seat-styles"
       )}
       disabled={status !== 'available'}
       onClick={() => status === 'available' && toggleSeat(seatNumber)}
     >
       {seatNumber}
       <SeatStatusBadge status={status} />
     </button>
     ```

## [Dependencies]

No new package dependencies are required. The implementation uses existing React, TypeScript, and styling capabilities already present in the project.

### Existing Dependencies Utilized
- React for component rendering
- TypeScript for type safety
- PostgreSQL for database queries
- CSS for styling
- Server Actions pattern for data fetching

## [Testing]

Verify the seat selector displays all seats with correct statuses and interactivity.

### Manual Testing Steps

1. **Data Verification**
   - Check that `getAllSeats()` returns all tickets including reserved and sold ones
   - Verify the query includes all statuses

2. **UI Display**
   - Navigate to event detail page with ticket selection
   - Verify all seats are visible in the grid (no hidden seats)
   - Count total seats displayed vs expected total

3. **Available Seat Interaction**
   - Verify available seats are clickable and selectable
   - Verify selection state toggles correctly
   - Verify selected seats show distinct styling

4. **Reserved/Sold Seat Display**
   - Verify reserved seats are displayed with red/orange styling (user preference)
   - Verify sold seats are displayed with appropriate styling
   - Verify status badges are visible and correct

5. **Disabled Seat Interaction**
   - Verify reserved seats cannot be clicked/selected
   - Verify sold seats cannot be clicked/selected
   - Verify cursor changes to "not-allowed" on hover

6. **Selection Logic**
   - Attempt to select reserved/sold seats - should not work
   - Verify only available seats can be added to selection
   - Verify selection state persists correctly

### Edge Cases to Test

- Event with all seats reserved/sold
- Event with all seats available
- Event with partial reservation (mix of statuses)
- Multi-section seating
- Events with large number of seats (performance)
- Expired reservations (status transitions)

### Database Testing

```sql
-- Verify query returns all seats
SELECT * FROM tickets 
WHERE event_id = 'test-event-id' AND section_id = 'test-section-id' 
ORDER BY seat_number ASC;

-- Check different statuses exist
SELECT status, COUNT(*) FROM tickets 
WHERE event_id = 'test-event-id' 
GROUP BY status;
```

## [Implementation Order]

Execute changes in this sequence to minimize conflicts and ensure proper integration.

1. **Add `getAllSeats()` function** in `actions/ticket-actions.ts`
   - This is the CRITICAL first step - changes data layer
   - Write query to fetch all tickets regardless of status
   - Export the new function

2. **Update `seat-selector-view.tsx`** to use new data function
   - Change from `getAvailableSeats()` to `getAllSeats()`
   - Pass all seats to child components

3. **Create helper function `buildSeatStatusMap()`** in `hooks/use-seat-selection.ts`
   - Maps seat numbers to ticket objects for quick lookup

4. **Update `useSeatSelection()` hook** in `hooks/use-seat-selection.ts`
   - Receive all seats instead of filtered seats
   - Build seatStatusMap
   - Filter availableSeats from allSeats
   - Return allSeats and seatStatusMap
   - Add guard in toggleSeat to prevent non-available selection

5. **Create `SeatStatusBadge` component** in `components/tickets/seat-status-badge.tsx`
   - Simple component to render status badges
   - Conditional styling based on status prop

6. **Add CSS styling** in `app/globals.css`
   - Reserved seat styles (red/orange per user preference)
   - Sold seat styles
   - Disabled seat styles (cursor, opacity)
   - Available seat styles (hover, selection)

7. **Modify `seat-selector.tsx`** component
   - Change from mapping over availableSeats to allSeats
   - Add conditional styling based on seat status
   - Include SeatStatusBadge in seat rendering
   - Add disabled attribute logic
   - Add onClick guard to prevent interaction with non-available seats

8. **Test complete flow**
   - Verify data fetching returns all seats
   - Verify UI displays all seats correctly
   - Verify status indicators are correct
   - Verify interaction is properly restricted

9. **Edge case testing**
   - Test with different event/section combinations
   - Verify expired reservations show correctly
   - Test performance with many seats

10. **Final styling adjustments**
    - Fine-tune colors and spacing
    - Ensure accessibility (contrast ratios, focus indicators)
    - Verify responsive behavior
