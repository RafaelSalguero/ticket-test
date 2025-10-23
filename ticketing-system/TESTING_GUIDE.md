# Testing Guide - Sports Venue Ticketing System

## 🚀 Quick Start

### 1. Start the Application

```bash
cd ticketing-system

# Verify PostgreSQL is running
docker-compose ps

# If not running, start it
docker-compose up -d postgres

# Start the Next.js development server
npm run dev
```

The application will be available at: **http://localhost:3000**

## 📝 Creating Test Data

Since the admin UI isn't implemented yet, we'll create test data directly in the database.

### Create a Test User and Event

```bash
# Connect to the database
docker-compose exec postgres psql -U ticketing_user -d ticketing_db
```

Then run these SQL commands:

```sql
-- 1. Create a test user (password: TestPass123)
INSERT INTO users (email, password_hash, first_name, last_name)
VALUES (
  'test@example.com',
  '$2b$10$YourHashHere', -- We'll create this properly below
  'Test',
  'User'
);

-- 2. Create a test event
INSERT INTO events (name, description, event_date, event_time, venue, created_by)
VALUES (
  'Championship Game 2025',
  'The biggest game of the season! Experience world-class sports action.',
  '2025-12-15',
  '19:00:00',
  'Sports Arena Stadium',
  (SELECT id FROM users WHERE email = 'test@example.com')
)
RETURNING id;

-- Note the event ID from the output above, you'll need it

-- 3. Create seating sections (use the event ID from above)
INSERT INTO seating_sections (event_id, section_name, price, total_seats, available_seats)
VALUES 
  ('YOUR-EVENT-ID-HERE', 'VIP Section', 150.00, 20, 20),
  ('YOUR-EVENT-ID-HERE', 'Premium', 100.00, 30, 30),
  ('YOUR-EVENT-ID-HERE', 'General Admission', 50.00, 50, 50);

-- Get section IDs
SELECT id, section_name FROM seating_sections WHERE event_id = 'YOUR-EVENT-ID-HERE';

-- 4. Generate tickets for each section
-- For VIP Section (20 seats):
INSERT INTO tickets (event_id, section_id, seat_number, status)
SELECT 
  'YOUR-EVENT-ID-HERE',
  'YOUR-VIP-SECTION-ID-HERE',
  'A' || generate_series(1, 10)::text,
  'available'
UNION ALL
SELECT 
  'YOUR-EVENT-ID-HERE',
  'YOUR-VIP-SECTION-ID-HERE',
  'B' || generate_series(1, 10)::text,
  'available';

-- For Premium Section (30 seats):
INSERT INTO tickets (event_id, section_id, seat_number, status)
SELECT 
  'YOUR-EVENT-ID-HERE',
  'YOUR-PREMIUM-SECTION-ID-HERE',
  'C' || generate_series(1, 10)::text,
  'available'
UNION ALL
SELECT 
  'YOUR-EVENT-ID-HERE',
  'YOUR-PREMIUM-SECTION-ID-HERE',
  'D' || generate_series(1, 10)::text,
  'available'
UNION ALL
SELECT 
  'YOUR-EVENT-ID-HERE',
  'YOUR-PREMIUM-SECTION-ID-HERE',
  'E' || generate_series(1, 10)::text,
  'available';

-- For General Admission (50 seats):
INSERT INTO tickets (event_id, section_id, seat_number, status)
SELECT 
  'YOUR-EVENT-ID-HERE',
  'YOUR-GA-SECTION-ID-HERE',
  'F' || generate_series(1, 10)::text,
  'available'
UNION ALL
SELECT 
  'YOUR-EVENT-ID-HERE',
  'YOUR-GA-SECTION-ID-HERE',
  'G' || generate_series(1, 10)::text,
  'available'
UNION ALL
SELECT 
  'YOUR-EVENT-ID-HERE',
  'YOUR-GA-SECTION-ID-HERE',
  'H' || generate_series(1, 10)::text,
  'available'
UNION ALL
SELECT 
  'YOUR-EVENT-ID-HERE',
  'YOUR-GA-SECTION-ID-HERE',
  'I' || generate_series(1, 10)::text,
  'available'
UNION ALL
SELECT 
  'YOUR-EVENT-ID-HERE',
  'YOUR-GA-SECTION-ID-HERE',
  'J' || generate_series(1, 10)::text,
  'available';

-- Exit psql
\q
```

## 🧪 Testing Scenarios

### Scenario 1: User Registration and Login

1. **Go to http://localhost:3000**
2. Click **"Register"**
3. Fill in the form:
   - First Name: John
   - Last Name: Doe
   - Email: john@example.com
   - Password: SecurePass123
   - Confirm Password: SecurePass123
4. Click **"Create Account"**
5. You should be redirected to the home page
6. Verify your name appears in the navigation bar

### Scenario 2: Browse and View Events

1. Click **"Browse Events"** or **"Events"** in navigation
2. You should see "Championship Game 2025"
3. Click **"View Details & Book"**
4. Event details page should show:
   - Event name, date, time, venue
   - Three seating sections with prices
   - Availability bars

### Scenario 3: Select and Reserve Seats

1. On the event detail page, click a section button (e.g., "General Admission")
2. Available seats should appear in a grid
3. Click on 2-3 seat numbers to select them
4. Selected seats turn blue
5. A summary shows selected count and total price
6. Click **"Reserve Seats"**
7. Seats should be reserved (green box appears)
8. You have 5 minutes to complete purchase

### Scenario 4: Complete Purchase

1. After reserving, click **"Complete Purchase"**
2. You should be redirected to order confirmation page
3. Verify:
   - Order number
   - Event details
   - Ticket breakdown
   - Payment status: "completed"

### Scenario 5: View Order History

1. Click **"My Orders"** in navigation
2. Your order should appear in the list
3. Click **"View Details"**
4. Verify all order and ticket information

### Scenario 6: Test Atomic Reservation (Critical!)

This tests that double-booking is prevented.

1. **Open TWO different browsers** (e.g., Chrome and Firefox)
2. **Browser 1:** Register as user1@example.com
3. **Browser 2:** Register as user2@example.com
4. **Both browsers:** Navigate to the same event
5. **Both browsers:** Select the SAME section
6. **Both browsers:** Click on the SAME seat (e.g., "A1")
7. **Both browsers:** Click "Reserve Seats" at the SAME time
8. **Expected Result:** 
   - One browser: Success message "Reserved: 1 seat(s)"
   - Other browser: Error message "Unable to reserve tickets. They may have been taken by another user."
9. This proves the atomic reservation works!

### Scenario 7: Test Reservation Expiration

1. Reserve some seats
2. **Wait 5 minutes** without purchasing
3. Refresh the event page
4. The seats should be available again

### Scenario 8: Logout and Login

1. Click the **"Logout"** button in navigation
2. You should be redirected to the login page
3. Log in again with your credentials
4. You should be back at the home page
5. Your order history should still be accessible

## 🔍 Database Verification

You can verify data at any point:

```bash
# Connect to database
docker-compose exec postgres psql -U ticketing_user -d ticketing_db

# View all users
SELECT id, email, first_name, last_name FROM users;

# View all events
SELECT id, name, event_date, venue FROM events;

# View tickets for an event (replace EVENT_ID)
SELECT 
  section_name, 
  seat_number, 
  status, 
  user_id,
  reserved_at
FROM tickets t
JOIN seating_sections s ON t.section_id = s.id
WHERE t.event_id = 'YOUR-EVENT-ID'
ORDER BY section_name, seat_number;

# View orders
SELECT 
  o.id,
  u.email,
  o.total_amount,
  o.payment_status,
  COUNT(oi.id) as ticket_count
FROM orders o
JOIN users u ON o.user_id = u.id
LEFT JOIN order_items oi ON o.id = oi.order_id
GROUP BY o.id, u.email;
```

## 🐛 Troubleshooting

### Issue: "Database connection failed"
```bash
# Check if PostgreSQL is running
docker-compose ps

# Restart PostgreSQL
docker-compose restart postgres

# Check logs
docker-compose logs postgres
```

### Issue: "Cannot find module errors"
```bash
# Reinstall dependencies
cd ticketing-system
npm install --legacy-peer-deps
```

### Issue: "Port 3000 already in use"
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use a different port
PORT=3001 npm run dev
```

### Issue: "No events showing"
- Verify you created test data in the database
- Check event_date is in the future
- Check browser console for errors

## 📊 Expected Behavior

### ✅ What Should Work
- User registration and login
- Password validation (minimum 8 characters)
- Event browsing and detail viewing
- Seat selection (visual feedback)
- Atomic reservation (one user per seat)
- Reservation expiration (5 minutes)
- Purchase completion
- Order history viewing
- Logout functionality

### 🚧 What's Not Implemented
- Admin event creation UI (must use SQL)
- Admin dashboard
- Sales reports
- Password reset
- Email notifications
- Payment processing (mock only)

## 🎯 Success Criteria

The system is working correctly if:
1. ✅ You can register and login
2. ✅ Events appear on the events page
3. ✅ You can select and reserve seats
4. ✅ Two users CANNOT reserve the same seat
5. ✅ Reservations expire after 5 minutes
6. ✅ You can complete a purchase
7. ✅ Orders appear in order history
8. ✅ Order details display correctly

## 📝 Test Checklist

Use this checklist to verify all functionality:

- [ ] User can register with valid information
- [ ] User cannot register with duplicate email
- [ ] User can login with correct credentials
- [ ] User cannot login with wrong password
- [ ] Events list shows upcoming events
- [ ] Event detail page displays correctly
- [ ] Seat selector shows available seats
- [ ] Selected seats highlight in blue
- [ ] Reserve button creates reservation
- [ ] Reserved seats show in green box
- [ ] Two users cannot reserve same seat (CRITICAL!)
- [ ] Reservations expire after 5 minutes
- [ ] Purchase completes successfully
- [ ] Order appears in order history
- [ ] Order detail shows all information
- [ ] User can logout
- [ ] Navigation updates based on auth state

## 🚀 Advanced Testing

### Load Testing (Future)
To test with many concurrent users, you could use tools like:
- Apache JMeter
- k6
- Artillery

### Concurrent Reservation Test Script
```bash
# Create a simple test script
# test-concurrent.sh

#!/bin/bash
EVENT_ID="your-event-id"
SECTION_ID="your-section-id"
SEAT="A1"

# Simulate two users trying to reserve the same seat
curl -X POST http://localhost:3000/api/reserve \
  -H "Cookie: session_user_id=user1" \
  -d "eventId=$EVENT_ID&sectionId=$SECTION_ID&seat=$SEAT" &

curl -X POST http://localhost:3000/api/reserve \
  -H "Cookie: session_user_id=user2" \
  -d "eventId=$EVENT_ID&sectionId=$SECTION_ID&seat=$SEAT" &

wait
```

---

**Happy Testing! 🎉**

If you encounter any issues, check:
1. PostgreSQL is running
2. Database has test data
3. Next.js dev server is running
4. Browser console for errors
