# Implementation Plan: Admin Features and Reports

## [Overview]
Implement admin role system with event management capabilities and simple read-only reports for the ticketing system.

This implementation adds a role-based access control system to distinguish admin users from regular customers. Admin users will have access to event management features (create, edit, delete events) and view reports (sales, attendance, revenue). The reports will be simple list views without PDF generation. The implementation leverages existing server actions where possible and follows established patterns in the codebase.

## [Types]
Add role support and update existing admin types for proper implementation.

**Update User interface in `types/index.ts`:**
```typescript
export interface User {
  id: string;
  email: string;
  password_hash: string;
  first_name: string;
  last_name: string;
  role: 'customer' | 'admin';  // ADD THIS LINE
  created_at: Date;
  updated_at: Date;
}
```

**Admin report types already exist** and are well-defined:
- `SalesReport` - total revenue, tickets sold, event count, recent orders
- `AttendanceReport` - per-event stats with seats sold/available
- `RevenueData` - revenue and tickets sold per event

**Add new form type for event editing:**
```typescript
export interface EventEditFormData {
  name: string;
  description: string;
  eventDate: string;
  eventTime: string;
  venue: string;
}
```

## [Files]
Database migrations, new admin pages, components, and server actions.

**New Files to Create:**

1. **Database Migration:**
   - `ticketing-system/migrations/009_add_user_roles.sql` - Add role column to users table

2. **Server Actions:**
   - `ticketing-system/actions/admin-actions.ts` - Report generation actions

3. **Admin Pages:**
   - `ticketing-system/app/admin/page.tsx` - Admin dashboard
   - `ticketing-system/app/admin/events/page.tsx` - Event management
   - `ticketing-system/app/admin/events/create/page.tsx` - Create event form
   - `ticketing-system/app/admin/events/[id]/edit/page.tsx` - Edit event form
   - `ticketing-system/app/admin/reports/page.tsx` - Reports view

4. **Components:**
   - `ticketing-system/components/admin/admin-dashboard-view.tsx` - Dashboard UI
   - `ticketing-system/components/admin/event-form-view.tsx` - Event create/edit form
   - `ticketing-system/components/admin/events-management-view.tsx` - Events list with actions
   - `ticketing-system/components/admin/reports-view.tsx` - Reports display

5. **Library Utilities:**
   - `ticketing-system/lib/admin-auth.ts` - Admin authorization helpers

**Files to Modify:**

1. `ticketing-system/types/index.ts` - Add role to User interface, add EventEditFormData
2. `ticketing-system/components/navigation/navbar.tsx` - Add admin link
3. `ticketing-system/actions/event-actions.ts` - Add updateEvent action
4. `ticketing-system/migrations/007_seed_data.sql` - Update to set admin role for admin@venue.com

## [Functions]
New and modified functions for admin functionality.

**New Functions in `lib/admin-auth.ts`:**
- `requireAdmin()` - Verify user is logged in and has admin role, throw error if not
- `isAdmin(user: User | null)` - Check if user has admin role, return boolean

**New Functions in `actions/admin-actions.ts`:**
- `getSalesReport()` - Generate overall sales statistics
- `getEventAttendanceReport(eventId?: string)` - Get attendance stats for events
- `getRevenueByEvent()` - Calculate revenue per event

**New Function in `actions/event-actions.ts`:**
- `updateEvent(eventId, formData)` - Update existing event details (name, description, date, time, venue)

**Existing Functions (no changes needed):**
- `createEvent()` - Already exists and works
- `deleteEvent()` - Already exists and works
- `getEvents()` - Already exists and works
- `getEventById()` - Already exists and works

## [Classes]
No new classes required. Implementation uses React Server Components and functional patterns.

The codebase follows a functional programming approach with:
- React Server Components for pages
- Server Actions for data mutations
- Functional view components for UI
- No class-based components needed

## [Dependencies]
No new dependencies required. All functionality uses existing packages.

**Existing Dependencies Sufficient:**
- Next.js 16 - Server Actions and App Router
- React 19 - Server/Client Components
- PostgreSQL via `pg` - Database queries
- bcrypt - Already installed for auth
- Tailwind CSS + shadcn/ui - UI components
- TypeScript 5 - Type safety

The implementation leverages established patterns and libraries already in use throughout the project.

## [Testing]
Manual testing approach with specific test scenarios for admin features.

**Test Scenarios:**

1. **Admin Role Assignment:**
   - Run migration 009 to add role column
   - Verify admin@venue.com has 'admin' role
   - Verify demo@example.com has 'customer' role
   - Test login with both accounts

2. **Admin Authorization:**
   - Login as admin user - should see "Admin" link in navbar
   - Login as customer - should NOT see "Admin" link
   - Try accessing /admin as customer - should redirect or show error
   - Try accessing /admin as admin - should work

3. **Event Management:**
   - Create new event with sections
   - Verify tickets are auto-generated
   - Edit existing event details
   - Delete event (verify cascading deletes)

4. **Reports:**
   - Generate sales report - verify totals
   - View attendance report - verify calculations
   - Check revenue by event - verify amounts match orders

5. **Integration:**
   - Create event as admin
   - Purchase tickets as customer
   - View reports as admin - verify purchase appears
   - Verify navbar updates based on user role

**Manual Test Checklist:**
- [ ] Migration runs successfully
- [ ] Admin auth helpers work correctly
- [ ] Admin pages render without errors
- [ ] Event CRUD operations function properly
- [ ] Reports display accurate data
- [ ] Regular users cannot access admin pages
- [ ] Admin users can access all admin features

## [Implementation Order]
Sequential steps to minimize conflicts and ensure successful integration.

1. **Database & Type Updates** (Foundation)
   - Create and run migration 009_add_user_roles.sql
   - Update User interface in types/index.ts
   - Update seed data migration to set admin role
   - Test database changes

2. **Admin Authorization** (Security Layer)
   - Create lib/admin-auth.ts with requireAdmin() and isAdmin()
   - Test auth helpers with existing users

3. **Admin Server Actions** (Business Logic)
   - Add updateEvent() to actions/event-actions.ts
   - Create actions/admin-actions.ts with report functions
   - Test server actions in isolation

4. **Admin Components** (UI Layer)
   - Create components/admin/event-form-view.tsx (reusable for create/edit)
   - Create components/admin/events-management-view.tsx
   - Create components/admin/reports-view.tsx
   - Create components/admin/admin-dashboard-view.tsx

5. **Admin Pages** (Routes)
   - Create app/admin/page.tsx (dashboard)
   - Create app/admin/events/page.tsx (event list)
   - Create app/admin/events/create/page.tsx (create form)
   - Create app/admin/events/[id]/edit/page.tsx (edit form)
   - Create app/admin/reports/page.tsx (reports)

6. **Navigation Integration** (User Access)
   - Update components/navigation/navbar.tsx to show admin link
   - Test complete user flow: login → see admin link → access admin pages

7. **Testing & Validation** (Quality Assurance)
   - Test all CRUD operations
   - Verify report calculations
   - Test authorization (admin vs customer)
   - Verify UI/UX flows
   - Check error handling

**Critical Success Factors:**
- Complete steps 1-2 before starting step 3 (foundation must be solid)
- Test each action before creating UI (backend before frontend)
- Implement authorization checks early (security first)
- Use existing patterns and components (maintain consistency)
