# Implementation Plan: Separate Data Loading from Presentation

## Overview

This refactoring separates presentation logic from API access across all components in the ticketing system. Each component that currently mixes concerns will be split into two parts: a loader/container that handles data fetching or provides action callbacks, and a view component that purely handles presentation.

## Types

Type definitions for the new loader/view component separation pattern.

### New Hook Return Types

```typescript
// For seat selection functionality
interface UseSeatSelectionReturn {
  selectedSection: SeatingSection | null
  availableSeats: Ticket[]
  selectedSeats: string[]
  loading: boolean
  reserving: boolean
  purchasing: boolean
  error: string | null
  reservedTicketIds: string[]
  totalPrice: number
  reservedTotalPrice: number
  setSelectedSection: (section: SeatingSection | null) => void
  handleSeatToggle: (seatId: string) => void
  handleReserve: () => Promise<void>
  handlePurchase: () => Promise<void>
}

// For authentication forms
interface UseAuthFormReturn {
  state: ApiResponse<any> | null
  isPending: boolean
  formAction: (formData: FormData) => void
}
```

### New Props Interfaces

```typescript
// View component props
interface SeatSelectorViewProps {
  eventId: string
  sections: SeatingSection[]
  selectedSection: SeatingSection | null
  availableSeats: Ticket[]
  selectedSeats: string[]
  loading: boolean
  reserving: boolean
  purchasing: boolean
  error: string | null
  reservedTicketIds: string[]
  totalPrice: number
  reservedTotalPrice: number
  onSectionSelect: (section: SeatingSection) => void
  onSeatToggle: (seatId: string) => void
  onReserve: () => void
  onPurchase: () => void
}

interface LoginFormViewProps {
  state: ApiResponse<{ userId: string }> | null
  isPending: boolean
  formAction: (formData: FormData) => void
}

interface RegisterFormViewProps {
  state: ApiResponse<{ userId: string }> | null
  isPending: boolean
  formAction: (formData: FormData) => void
}

interface EventsListViewProps {
  events: EventWithSections[]
}

interface EventDetailViewProps {
  event: EventWithSections
  user: User | null
}

interface OrdersListViewProps {
  orders: OrderWithDetails[]
}

interface OrderDetailViewProps {
  order: OrderWithDetails
}
```

## Files

File modifications required for the refactor.

### New Files to Create

- `ticketing-system/hooks/use-seat-selection.ts` - Custom hook managing seat selection state and actions
- `ticketing-system/hooks/use-auth-form.ts` - Custom hook for authentication form actions
- `ticketing-system/components/tickets/seat-selector-view.tsx` - Pure view component for seat selection
- `ticketing-system/components/auth/login-form-view.tsx` - Pure view component for login form
- `ticketing-system/components/auth/register-form-view.tsx` - Pure view component for registration form
- `ticketing-system/components/events/events-list-view.tsx` - Pure view component for events list
- `ticketing-system/components/events/event-detail-view.tsx` - Pure view component for event detail
- `ticketing-system/components/orders/orders-list-view.tsx` - Pure view component for orders list
- `ticketing-system/components/orders/order-detail-view.tsx` - Pure view component for order detail
- `ticketing-system/loaders/events-loader.ts` - Server-side data loader for events
- `ticketing-system/loaders/orders-loader.ts` - Server-side data loader for orders

### Files to Modify

- `ticketing-system/components/tickets/seat-selector.tsx` - Convert to container component using the hook
- `ticketing-system/app/login/page.tsx` - Simplify to use loader hook and view component
- `ticketing-system/app/register/page.tsx` - Simplify to use loader hook and view component
- `ticketing-system/app/events/page.tsx` - Simplify to use loader and view component
- `ticketing-system/app/events/[id]/page.tsx` - Simplify to use loader and view component
- `ticketing-system/app/orders/page.tsx` - Simplify to use loader and view component
- `ticketing-system/app/orders/[id]/page.tsx` - Simplify to use loader and view component

### Files to Delete

None - all existing files will be refactored rather than replaced.

## Functions

Function-level changes across the codebase.

### New Hook Functions

**ticketing-system/hooks/use-seat-selection.ts**
- `useSeatSelection(eventId: string, sections: SeatingSection[], userId: string): UseSeatSelectionReturn` - Manages all seat selection state, loads available seats, handles reservations and purchases

**ticketing-system/hooks/use-auth-form.ts**
- `useLoginForm(): UseAuthFormReturn` - Wraps login action with useActionState and router redirect
- `useRegisterForm(): UseAuthFormReturn` - Wraps register action with useActionState and router redirect

### New Loader Functions

**ticketing-system/loaders/events-loader.ts**
- `loadUpcomingEvents(): Promise<EventWithSections[]>` - Server function to load upcoming events
- `loadEventById(id: string): Promise<EventWithSections | null>` - Server function to load event by ID

**ticketing-system/loaders/orders-loader.ts**
- `loadUserOrders(): Promise<OrderWithDetails[]>` - Server function to load user's orders
- `loadOrderById(id: string): Promise<OrderWithDetails | null>` - Server function to load order by ID

### Modified Functions

**ticketing-system/components/tickets/seat-selector.tsx**
- `SeatSelector()` - Becomes a simple container that uses the hook and renders the view component

**ticketing-system/app/login/page.tsx**
- `LoginPage()` - Becomes a simple container using the hook and view component

**ticketing-system/app/register/page.tsx**
- `RegisterPage()` - Becomes a simple container using the hook and view component

**ticketing-system/app/events/page.tsx**
- `EventsPage()` - Becomes a simple server component using loader and view

**ticketing-system/app/events/[id]/page.tsx**
- `EventDetailPage()` - Becomes a simple server component using loader and view

**ticketing-system/app/orders/page.tsx**
- `OrdersPage()` - Becomes a simple server component using loader and view

**ticketing-system/app/orders/[id]/page.tsx**
- `OrderDetailPage()` - Becomes a simple server component using loader and view

## Classes

No class-level changes required - this is a functional component refactor.

## Dependencies

No new external dependencies required. The refactor uses existing Next.js and React patterns:
- React hooks (useState, useEffect, useActionState)
- Next.js server components and actions
- Existing action functions remain unchanged

## Testing

Testing approach for the refactored components.

### Hook Testing
- Test `useSeatSelection` hook with React Testing Library
- Test `useAuthForm` hooks with various action states
- Verify state management and callback behavior

### View Component Testing
- Test all view components render correctly with mock props
- Test user interactions call provided callbacks
- Test conditional rendering based on props
- Verify no direct API calls in view components

### Integration Testing
- Test container components properly wire up loaders and views
- Test data flow from server components through loaders to views
- Verify client component containers properly use hooks and views

### Manual Testing
- Test complete user flows (browse events, select seats, purchase)
- Verify authentication flows work correctly
- Test order viewing and details
- Ensure all error states display properly

## Implementation Order

Step-by-step implementation sequence to minimize conflicts.

1. **Create type definitions**
   - Add new interfaces to `ticketing-system/types/index.ts`
   - Define all hook return types and view component props

2. **Create server-side loaders**
   - Create `loaders/events-loader.ts` with event loading functions
   - Create `loaders/orders-loader.ts` with order loading functions
   - Extract data fetching logic from page components

3. **Create authentication hooks**
   - Create `hooks/use-auth-form.ts`
   - Implement `useLoginForm` hook
   - Implement `useRegisterForm` hook

4. **Create authentication view components**
   - Create `components/auth/login-form-view.tsx`
   - Create `components/auth/register-form-view.tsx`
   - Extract pure presentation logic from auth pages

5. **Refactor authentication pages**
   - Update `app/login/page.tsx` to use hook and view
   - Update `app/register/page.tsx` to use hook and view
   - Test authentication flows

6. **Create events view components**
   - Create `components/events/events-list-view.tsx`
   - Create `components/events/event-detail-view.tsx`
   - Extract presentation logic from events pages

7. **Refactor events pages**
   - Update `app/events/page.tsx` to use loader and view
   - Update `app/events/[id]/page.tsx` to use loader and view
   - Test events browsing and detail viewing

8. **Create orders view components**
   - Create `components/orders/orders-list-view.tsx`
   - Create `components/orders/order-detail-view.tsx`
   - Extract presentation logic from orders pages

9. **Refactor orders pages**
   - Update `app/orders/page.tsx` to use loader and view
   - Update `app/orders/[id]/page.tsx` to use loader and view
   - Test orders viewing

10. **Create seat selection hook**
    - Create `hooks/use-seat-selection.ts`
    - Implement all state management and action handlers
    - Test hook in isolation

11. **Create seat selector view component**
    - Create `components/tickets/seat-selector-view.tsx`
    - Extract all presentation logic from seat-selector
    - Ensure no API calls in view

12. **Refactor seat selector container**
    - Update `components/tickets/seat-selector.tsx` to use hook and view
    - Wire up all callbacks properly
    - Test complete seat selection flow

13. **Final integration testing**
    - Test all user flows end-to-end
    - Verify no regressions in functionality
    - Ensure all error states work correctly
    - Verify loading states display properly
