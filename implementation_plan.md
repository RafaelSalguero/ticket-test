# Implementation Plan

## Overview
Build a complete sports venue ticketing system using Next.js 14+ with TypeScript, PostgreSQL, Docker Compose, and shadcn/ui components.

This implementation creates a full-stack web application for a sports venue to manage events and sell tickets. The system will support event creation/management, customer registration/authentication, ticket purchasing with seat selection, order history tracking, and basic reporting. The application uses Next.js server components and server actions for optimal performance, PostgreSQL with node-postgres for reliable data persistence, and Docker Compose for easy deployment and development. The architecture ensures data integrity through PostgreSQL upsert operations and unique indices to prevent double-booking of seats.

## Types
Define comprehensive TypeScript interfaces and types for all data models and API responses.

```typescript
// Database Models
interface User {
  id: string;
  email: string;
  password_hash: string;
  first_name: string;
  last_name: string;
  created_at: Date;
  updated_at: Date;
}

interface Event {
  id: string;
  name: string;
  description: string;
  event_date: Date;
  event_time: string;
  venue: string;
  created_at: Date;
  updated_at: Date;
  created_by: string;
}

interface SeatingSection {
  id: string;
  event_id: string;
  section_name: string;
  price: number;
  total_seats: number;
  available_seats: number;
  created_at: Date;
}

interface Ticket {
  id: string;
  event_id: string;
  section_id: string;
  seat_number: string;
  user_id: string | null;
  order_id: string | null;
  status: 'available' | 'reserved' | 'sold';
  reserved_at: Date | null;
  created_at: Date;
}

interface Order {
  id: string;
  user_id: string;
  total_amount: number;
  payment_status: 'pending' | 'completed' | 'failed';
  payment_method: string;
  created_at: Date;
  updated_at: Date;
}

interface OrderItem {
  id: string;
  order_id: string;
  ticket_id: string;
  price: number;
  created_at: Date;
}

// Form Types
interface LoginFormData {
  email: string;
  password: string;
}

interface RegisterFormData {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
}

interface EventFormData {
  name: string;
  description: string;
  eventDate: string;
  eventTime: string;
  venue: string;
  sections: SectionFormData[];
}

interface SectionFormData {
  sectionName: string;
  price: number;
  totalSeats: number;
}

interface CheckoutFormData {
  cardNumber: string;
  cardHolder: string;
  expiryDate: string;
  cvv: string;
}

// API Response Types
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

interface EventWithSections extends Event {
  sections: SeatingSection[];
}

interface OrderWithDetails extends Order {
  items: (OrderItem & {
    ticket: Ticket & {
      event: Event;
      section: SeatingSection;
    };
  })[];
}

// Component Props Types
interface EventCardProps {
  event: EventWithSections;
}

interface TicketSelectionProps {
  eventId: string;
  sections: SeatingSection[];
  onSelectionChange: (tickets: SelectedTicket[]) => void;
}

interface SelectedTicket {
  sectionId: string;
  sectionName: string;
  seatNumber: string;
  price: number;
}
```

## Files
Create a complete Next.js application structure with Docker configuration and database setup.

**New Files to Create:**

```
/
├── .env.example                          # Environment variables template
├── .env.local                            # Local environment variables (gitignored)
├── .gitignore                            # Git ignore file
├── docker-compose.yml                    # Docker Compose configuration
├── Dockerfile                            # Next.js application Dockerfile
├── package.json                          # Node.js dependencies
├── tsconfig.json                         # TypeScript configuration
├── next.config.js                        # Next.js configuration
├── tailwind.config.ts                    # Tailwind CSS configuration
├── components.json                       # shadcn/ui configuration
├── postcss.config.js                     # PostCSS configuration
│
├── migrations/                           # Database migrations
│   ├── 001_create_users_table.sql
│   ├── 002_create_events_table.sql
│   ├── 003_create_seating_sections_table.sql
│   ├── 004_create_tickets_table.sql
│   ├── 005_create_orders_table.sql
│   ├── 006_create_order_items_table.sql
│   └── 007_create_indices.sql
│
├── src/
│   ├── app/                              # Next.js App Router
│   │   ├── layout.tsx                    # Root layout
│   │   ├── page.tsx                      # Home page (event listing)
│   │   ├── globals.css                   # Global styles
│   │   ├── login/
│   │   │   └── page.tsx                  # Login page
│   │   ├── register/
│   │   │   └── page.tsx                  # Register page
│   │   ├── events/
│   │   │   ├── page.tsx                  # Events listing
│   │   │   ├── [id]/
│   │   │   │   └── page.tsx              # Event detail page
│   │   │   └── create/
│   │   │       └── page.tsx              # Create event page (admin)
│   │   ├── checkout/
│   │   │   └── page.tsx                  # Checkout page
│   │   ├── orders/
│   │   │   ├── page.tsx                  # Order history
│   │   │   └── [id]/
│   │   │       └── page.tsx              # Order detail
│   │   ├── admin/
│   │   │   ├── page.tsx                  # Admin dashboard
│   │   │   ├── events/
│   │   │   │   ├── page.tsx              # Event management
│   │   │   │   └── [id]/
│   │   │   │       └── edit/
│   │   │   │           └── page.tsx      # Edit event
│   │   │   └── reports/
│   │   │       └── page.tsx              # Sales reports
│   │   └── api/                          # API routes (if needed)
│   │
│   ├── components/                       # React components
│   │   ├── ui/                           # shadcn/ui components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── input.tsx
│   │   │   ├── label.tsx
│   │   │   ├── select.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── table.tsx
│   │   │   ├── badge.tsx
│   │   │   └── toast.tsx
│   │   ├── navigation/
│   │   │   ├── navbar.tsx                # Main navigation bar
│   │   │   └── user-menu.tsx             # User dropdown menu
│   │   ├── events/
│   │   │   ├── event-card.tsx            # Event display card
│   │   │   ├── event-form.tsx            # Event creation/edit form
│   │   │   └── event-list.tsx            # Event listing component
│   │   ├── tickets/
│   │   │   ├── seat-selector.tsx         # Seat selection component
│   │   │   ├── ticket-card.tsx           # Ticket display card
│   │   │   └── section-selector.tsx      # Section selection
│   │   ├── orders/
│   │   │   ├── order-summary.tsx         # Order summary display
│   │   │   └── order-list.tsx            # Order history list
│   │   └── forms/
│   │       ├── login-form.tsx            # Login form
│   │       ├── register-form.tsx         # Registration form
│   │       └── checkout-form.tsx         # Checkout form
│   │
│   ├── lib/                              # Utility libraries
│   │   ├── db.ts                         # Database connection
│   │   ├── auth.ts                       # Authentication utilities
│   │   ├── utils.ts                      # General utilities
│   │   └── validations.ts                # Form validations
│   │
│   ├── actions/                          # Server actions
│   │   ├── auth-actions.ts               # Login, register, logout
│   │   ├── event-actions.ts              # Event CRUD operations
│   │   ├── ticket-actions.ts             # Ticket operations
│   │   ├── order-actions.ts              # Order operations
│   │   └── admin-actions.ts              # Admin operations
│   │
│   └── types/                            # TypeScript type definitions
│       ├── index.ts                      # Main type exports
│       └── database.ts                   # Database types
│
└── public/                               # Static assets
    ├── favicon.ico
    └── images/
```

**Configuration Files Details:**

- `.env.example`: Template with POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB, DATABASE_URL, JWT_SECRET
- `docker-compose.yml`: Services for PostgreSQL (port 5432) and Next.js app (port 3000)
- `Dockerfile`: Multi-stage build for Next.js with node:22-alpine
- `package.json`: Dependencies including next, react, typescript, node-postgres, bcrypt, shadcn/ui, tailwindcss
- `tsconfig.json`: Strict TypeScript configuration for Next.js
- `next.config.js`: Next.js configuration with experimental features enabled

## Functions
Define all server actions and utility functions needed for the application.

**Authentication Functions (src/actions/auth-actions.ts):**
- `login(formData: FormData): Promise<ApiResponse<{ userId: string }>>` - Validates credentials, returns session
- `register(formData: FormData): Promise<ApiResponse<{ userId: string }>>` - Creates user with hashed password
- `logout(): Promise<void>` - Clears session
- `getCurrentUser(): Promise<User | null>` - Gets current authenticated user
- `hashPassword(password: string): Promise<string>` - Bcrypt password hashing
- `verifyPassword(password: string, hash: string): Promise<boolean>` - Bcrypt verification

**Event Functions (src/actions/event-actions.ts):**
- `getEvents(): Promise<EventWithSections[]>` - Fetches all events with sections
- `getEventById(id: string): Promise<EventWithSections | null>` - Fetches single event
- `createEvent(formData: FormData): Promise<ApiResponse<Event>>` - Creates event with sections and tickets
- `updateEvent(id: string, formData: FormData): Promise<ApiResponse<Event>>` - Updates event details
- `deleteEvent(id: string): Promise<ApiResponse<void>>` - Soft deletes event
- `getUpcomingEvents(): Promise<EventWithSections[]>` - Fetches events where event_date >= today

**Ticket Functions (src/actions/ticket-actions.ts):**
- `getAvailableSeats(eventId: string, sectionId: string): Promise<Ticket[]>` - Fetches available tickets (status = 'available' OR (status = 'reserved' AND reserved_at < NOW() - INTERVAL '5 minutes'))
- `reserveTickets(tickets: {eventId: string, sectionId: string, seatNumber: string}[], userId: string): Promise<ApiResponse<string[]>>` - Atomically reserves tickets using INSERT ON CONFLICT (event_id, section_id, seat_number) DO UPDATE SET user_id = userId, status = 'reserved', reserved_at = NOW() WHERE tickets.user_id IS NULL OR tickets.reserved_at < NOW() - INTERVAL '5 minutes'
- `purchaseTickets(orderId: string, userId: string): Promise<ApiResponse<Order>>` - Completes ticket purchase, updates tickets to status = 'sold' and sets order_id, validates user_id matches
- `releaseExpiredReservations(): Promise<void>` - Background job to release tickets where status = 'reserved' AND reserved_at < NOW() - INTERVAL '5 minutes'

**Order Functions (src/actions/order-actions.ts):**
- `createOrder(userId: string, ticketIds: string[]): Promise<ApiResponse<Order>>` - Creates order with items
- `getOrderById(id: string): Promise<OrderWithDetails | null>` - Fetches order with full details
- `getUserOrders(userId: string): Promise<OrderWithDetails[]>` - Fetches user's order history
- `processPayment(orderId: string, paymentData: CheckoutFormData): Promise<ApiResponse<Order>>` - Mock payment processing
- `cancelOrder(orderId: string): Promise<ApiResponse<void>>` - Cancels order and releases tickets

**Admin Functions (src/actions/admin-actions.ts):**
- `getSalesReport(eventId?: string): Promise<SalesReport>` - Generates sales statistics
- `getEventAttendanceReport(eventId: string): Promise<AttendanceReport>` - Event attendance data
- `getAllUsers(): Promise<User[]>` - Admin user listing
- `getRevenueByEvent(): Promise<RevenueData[]>` - Revenue breakdown by event

**Database Functions (src/lib/db.ts):**
- `query<T>(text: string, params?: any[]): Promise<T[]>` - Execute SQL query
- `getClient(): Promise<PoolClient>` - Get connection pool client
- `transaction<T>(callback: (client: PoolClient) => Promise<T>): Promise<T>` - Execute transaction

**Utility Functions (src/lib/utils.ts):**
- `cn(...inputs: ClassValue[]): string` - Tailwind class merger (shadcn/ui)
- `formatCurrency(amount: number): string` - Format price display
- `formatDate(date: Date): string` - Format date for display
- `formatTime(time: string): string` - Format time for display
- `generateSeatNumbers(totalSeats: number): string[]` - Generate seat number array

**Validation Functions (src/lib/validations.ts):**
- `validateEmail(email: string): boolean` - Email format validation
- `validatePassword(password: string): { valid: boolean; message?: string }` - Password strength check
- `validateEventForm(data: EventFormData): { valid: boolean; errors: Record<string, string> }` - Event form validation
- `validateCheckoutForm(data: CheckoutFormData): { valid: boolean; errors: Record<string, string> }` - Checkout validation

## Classes
No traditional classes needed; using functional components and server actions pattern.

This application follows Next.js 14+ best practices using functional components with hooks and server actions rather than class-based components. All data access and business logic is handled through server actions (async functions marked with 'use server'). Component state management uses React hooks (useState, useEffect, useContext). Database operations use the node-postgres connection pool pattern rather than ORM classes.

## Dependencies
Install all required packages for Next.js, database, UI, and utilities.

**package.json dependencies:**
```json
{
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "typescript": "^5.0.0",
    "@types/node": "^20.0.0",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "pg": "^8.11.0",
    "@types/pg": "^8.10.0",
    "node-pg-migrate": "^6.2.2",
    "bcrypt": "^5.1.1",
    "@types/bcrypt": "^5.0.2",
    "tailwindcss": "^3.3.0",
    "postcss": "^8.4.0",
    "autoprefixer": "^10.4.0",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.0.0",
    "tailwind-merge": "^2.0.0",
    "lucide-react": "^0.294.0",
    "@radix-ui/react-dialog": "^1.0.5",
    "@radix-ui/react-select": "^2.0.0",
    "@radix-ui/react-label": "^2.0.2",
    "@radix-ui/react-slot": "^1.0.2",
    "sonner": "^1.2.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "eslint": "^8.0.0",
    "eslint-config-next": "^14.0.0"
  }
}
```

**Docker Compose services:**
- PostgreSQL 15 with persistent volume
- Next.js app with hot reload volume mounting
- Network configuration for service communication

**shadcn/ui components to install:**
```bash
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
npx shadcn-ui@latest add input
npx shadcn-ui@latest add label
npx shadcn-ui@latest add select
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add table
npx shadcn-ui@latest add badge
npx shadcn-ui@latest add toast
```

## Testing
Implement testing strategy for database operations and server actions.

**Test Files to Create:**
- `src/__tests__/auth.test.ts` - Test login, register, password hashing
- `src/__tests__/events.test.ts` - Test event CRUD operations
- `src/__tests__/tickets.test.ts` - Test ticket reservation and purchase with concurrency
- `src/__tests__/orders.test.ts` - Test order creation and history
- `src/__tests__/db.test.ts` - Test database connection and transactions

**Testing Approach:**
1. Use Jest for unit testing server actions
2. Test database operations with a test database container
3. Test ticket uniqueness constraint with concurrent purchase attempts
4. Test bcrypt password hashing and verification
5. Test form validations with invalid data
6. Manual testing of UI workflows in browser
7. Test Docker Compose setup with `docker-compose up`

**Key Test Scenarios:**
- Two users attempting to purchase same seat simultaneously (should fail for one)
- Password validation strength requirements
- Order creation with multiple tickets from different sections
- Event creation with auto-generated tickets
- Expired reservation cleanup
- User authentication flow
- Admin report generation accuracy

## Implementation Order
Execute implementation in logical phases to minimize conflicts and ensure working state at each step.

**Phase 1: Project Setup and Infrastructure**
1. Initialize Next.js TypeScript project with `npx create-next-app@latest`
2. Create Docker Compose configuration with PostgreSQL and app services
3. Set up environment variables and configuration files
4. Configure Tailwind CSS and shadcn/ui
5. Create database connection module (src/lib/db.ts)
6. Test Docker Compose setup and database connectivity

**Phase 2: Database Schema**
7. Create migration files for all tables (users, events, seating_sections, tickets, orders, order_items)
8. Create unique index on tickets (event_id, section_id, seat_number) for INSERT ON CONFLICT reservation locking
9. Create indices for email uniqueness, user lookups, event lookups, and reservation queries
10. Run migrations using node-pg-migrate
11. Verify schema with `docker-compose exec postgres psql -U ticketing_user -d ticketing_db -c "\dt"`

**Phase 3: Authentication System**
11. Implement password hashing utilities (src/lib/auth.ts)
12. Create user authentication server actions (src/actions/auth-actions.ts)
13. Build login page and form component (src/app/login/page.tsx, src/components/forms/login-form.tsx)
14. Build register page and form component (src/app/register/page.tsx, src/components/forms/register-form.tsx)
15. Create navigation bar with user menu (src/components/navigation/navbar.tsx)
16. Test registration and login flow

**Phase 4: Event Management**
17. Create event server actions (src/actions/event-actions.ts)
18. Build event listing page (src/app/page.tsx or src/app/events/page.tsx)
19. Build event detail page (src/app/events/[id]/page.tsx)
20. Create event card component (src/components/events/event-card.tsx)
21. Build event creation form and page for admin (src/app/events/create/page.tsx, src/components/events/event-form.tsx)
22. Implement automatic ticket generation when creating event sections
23. Test event CRUD operations

**Phase 5: Ticket Sales System**
24. Create ticket server actions (src/actions/ticket-actions.ts)
25. Implement atomic ticket reservation using INSERT ON CONFLICT with user_id locking
26. Build seat selection component (src/components/tickets/seat-selector.tsx)
27. Create section selector component (src/components/tickets/section-selector.tsx)
28. Implement ticket purchase that validates user_id ownership before finalizing
29. Test concurrent reservation attempts for same seat (only one user should succeed)
30. Test expired reservation cleanup and re-availability

**Phase 6: Order and Checkout**
30. Create order server actions (src/actions/order-actions.ts)
31. Build checkout page (src/app/checkout/page.tsx)
32. Create checkout form with mock payment (src/components/forms/checkout-form.tsx)
33. Implement payment processing action (mock)
34. Build order summary component (src/components/orders/order-summary.tsx)
35. Test complete purchase flow

**Phase 7: Order History**
36. Build order history page (src/app/orders/page.tsx)
37. Build order detail page (src/app/orders/[id]/page.tsx)
38. Create order list component (src/components/orders/order-list.tsx)
39. Test order history retrieval and display

**Phase 8: Admin Features**
40. Create admin server actions (src/actions/admin-actions.ts)
41. Build admin dashboard page (src/app/admin/page.tsx)
42. Build event management page (src/app/admin/events/page.tsx)
43. Build event edit page (src/app/admin/events/[id]/edit/page.tsx)
44. Implement sales reports page (src/app/admin/reports/page.tsx)
45. Test admin functionality and reports

**Phase 9: Polish and Testing**
46. Add loading states and error handling
47. Implement toast notifications for user feedback
48. Add form validation and error messages
49. Style all pages with Tailwind CSS
50. Run full integration testing
51. Test Docker Compose deployment
52. Create README.md with setup instructions
