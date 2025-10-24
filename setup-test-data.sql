-- Setup Test Data for Sports Venue Ticketing System
-- Run this script to create a sample event with tickets

-- 1. Create a test admin user (you can also register through the UI)
-- Password will be: TestPass123 (hashed with bcrypt)
INSERT INTO users (email, password_hash, first_name, last_name)
VALUES (
  'admin@venue.com',
  '$2b$10$rBV2kYQqBw8WvL5U6Y7g3OwQ8YkVjZxVkGEHvS0EYzqZqY5c3vxay',
  'Admin',
  'User'
)
ON CONFLICT (email) DO NOTHING;

-- 2. Create a sample event
WITH new_event AS (
  INSERT INTO events (name, description, event_date, event_time, venue, created_by)
  VALUES (
    'Championship Finals 2025',
    'The ultimate showdown! Watch the season''s best teams compete for the championship title. An unforgettable night of sports action awaits!',
    '2025-12-15',
    '19:30:00',
    'Grand Sports Arena',
    (SELECT id FROM users WHERE email = 'admin@venue.com' LIMIT 1)
  )
  RETURNING id
),
-- 3. Create seating sections
vip_section AS (
  INSERT INTO seating_sections (event_id, section_name, price, total_seats)
  SELECT id, 'VIP Premium', 199.99, 20 FROM new_event
  RETURNING id, event_id
),
premium_section AS (
  INSERT INTO seating_sections (event_id, section_name, price, total_seats)
  SELECT id, 'Premium Seating', 129.99, 40 FROM new_event
  RETURNING id, event_id
),
standard_section AS (
  INSERT INTO seating_sections (event_id, section_name, price, total_seats)
  SELECT id, 'Standard View', 79.99, 60 FROM new_event
  RETURNING id, event_id
),
economy_section AS (
  INSERT INTO seating_sections (event_id, section_name, price, total_seats)
  SELECT id, 'Economy', 49.99, 80 FROM new_event
  RETURNING id, event_id
),
-- 4. Generate tickets for VIP section (rows A-B, 10 seats each)
vip_tickets AS (
  INSERT INTO tickets (event_id, section_id, seat_number, status)
  SELECT 
    event_id,
    id,
    'A' || generate_series(1, 10)::text,
    'available'
  FROM vip_section
  UNION ALL
  SELECT 
    event_id,
    id,
    'B' || generate_series(1, 10)::text,
    'available'
  FROM vip_section
  RETURNING id
),
-- 5. Generate tickets for Premium section (rows C-F, 10 seats each)
premium_tickets AS (
  INSERT INTO tickets (event_id, section_id, seat_number, status)
  SELECT 
    event_id,
    id,
    'C' || generate_series(1, 10)::text,
    'available'
  FROM premium_section
  UNION ALL
  SELECT 
    event_id,
    id,
    'D' || generate_series(1, 10)::text,
    'available'
  FROM premium_section
  UNION ALL
  SELECT 
    event_id,
    id,
    'E' || generate_series(1, 10)::text,
    'available'
  FROM premium_section
  UNION ALL
  SELECT 
    event_id,
    id,
    'F' || generate_series(1, 10)::text,
    'available'
  FROM premium_section
  RETURNING id
),
-- 6. Generate tickets for Standard section (rows G-L, 10 seats each)
standard_tickets AS (
  INSERT INTO tickets (event_id, section_id, seat_number, status)
  SELECT 
    event_id,
    id,
    chr(71 + (n / 10)) || (n % 10 + 1)::text,
    'available'
  FROM standard_section, generate_series(0, 59) n
  RETURNING id
),
-- 7. Generate tickets for Economy section (rows M-T, 10 seats each)
economy_tickets AS (
  INSERT INTO tickets (event_id, section_id, seat_number, status)
  SELECT 
    event_id,
    id,
    chr(77 + (n / 10)) || (n % 10 + 1)::text,
    'available'
  FROM economy_section, generate_series(0, 79) n
  RETURNING id
)
-- Return summary
SELECT 
  e.id as event_id,
  e.name as event_name,
  e.event_date,
  COUNT(DISTINCT s.id) as sections_count,
  SUM(s.total_seats) as total_seats
FROM events e
JOIN seating_sections s ON e.id = s.event_id
WHERE e.name = 'Championship Finals 2025'
GROUP BY e.id, e.name, e.event_date;

-- Display what was created
\echo '\n=== Test Data Created Successfully! ===\n'
\echo 'Admin User:'
\echo '  Email: admin@venue.com'
\echo '  Password: TestPass123'
\echo ''
\echo 'Event: Championship Finals 2025'
\echo '  Date: December 15, 2025'
\echo '  Time: 7:30 PM'
\echo '  Venue: Grand Sports Arena'
\echo ''
\echo 'Seating Sections:'
\echo '  - VIP Premium: 20 seats @ $199.99'
\echo '  - Premium Seating: 40 seats @ $129.99'
\echo '  - Standard View: 60 seats @ $79.99'
\echo '  - Economy: 80 seats @ $49.99'
\echo ''
\echo 'Total: 200 tickets created'
\echo ''
\echo 'Next steps:'
\echo '  1. Start the dev server: npm run dev'
\echo '  2. Visit: http://localhost:3000'
\echo '  3. Register a new user or login with admin@venue.com'
\echo '  4. Browse events and test ticket booking!'
\echo ''
