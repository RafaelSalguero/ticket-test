-- Seed Data Migration
-- This creates demo data for immediate testing

-- 1. Create demo users with plain text passwords (will be verified by auth logic)
INSERT INTO users (email, password_hash, first_name, last_name)
VALUES 
  ('admin@venue.com', 'Admin123!', 'Admin', 'User'),
  ('demo@example.com', 'Demo123!', 'Demo', 'Customer'),
  ('test@example.com', 'Test123!', 'Test', 'User')
ON CONFLICT (email) DO NOTHING;

-- 2. Create demo events
INSERT INTO events (name, description, event_date, event_time, venue, created_by)
VALUES 
  (
    'Championship Finals 2025',
    'The ultimate showdown! Watch the season''s best teams compete for the championship title. An unforgettable night of sports action awaits!',
    '2025-12-15',
    '19:30:00',
    'Grand Sports Arena',
    (SELECT id FROM users WHERE email = 'admin@venue.com' LIMIT 1)
  ),
  (
    'Spring Tournament 2025',
    'Exciting spring tournament featuring top teams from around the region. Don''t miss this spectacular sporting event!',
    '2025-04-20',
    '18:00:00',
    'City Stadium',
    (SELECT id FROM users WHERE email = 'admin@venue.com' LIMIT 1)
  ),
  (
    'Summer Classic 2025',
    'The biggest summer event of the year! Experience the thrill of world-class competition in this must-see event.',
    '2025-07-10',
    '20:00:00',
    'Metropolitan Arena',
    (SELECT id FROM users WHERE email = 'admin@venue.com' LIMIT 1)
  )
ON CONFLICT DO NOTHING;

-- 3. Create seating sections for Championship Finals
WITH event_1 AS (
  SELECT id FROM events WHERE name = 'Championship Finals 2025' LIMIT 1
)
INSERT INTO seating_sections (event_id, section_name, price, total_seats, available_seats)
SELECT 
  id,
  section_name,
  price::numeric,
  total_seats::integer,
  total_seats::integer
FROM event_1
CROSS JOIN (VALUES
  ('VIP Premium', 199.99, 20),
  ('Premium Seating', 129.99, 40),
  ('Standard View', 79.99, 60),
  ('Economy', 49.99, 80)
) AS sections(section_name, price, total_seats)
ON CONFLICT DO NOTHING;

-- 4. Create seating sections for Spring Tournament
WITH event_2 AS (
  SELECT id FROM events WHERE name = 'Spring Tournament 2025' LIMIT 1
)
INSERT INTO seating_sections (event_id, section_name, price, total_seats, available_seats)
SELECT 
  id,
  section_name,
  price::numeric,
  total_seats::integer,
  total_seats::integer
FROM event_2
CROSS JOIN (VALUES
  ('VIP', 150.00, 30),
  ('Premium', 100.00, 50),
  ('General', 60.00, 100)
) AS sections(section_name, price, total_seats)
ON CONFLICT DO NOTHING;

-- 5. Create seating sections for Summer Classic
WITH event_3 AS (
  SELECT id FROM events WHERE name = 'Summer Classic 2025' LIMIT 1
)
INSERT INTO seating_sections (event_id, section_name, price, total_seats, available_seats)
SELECT 
  id,
  section_name,
  price::numeric,
  total_seats::integer,
  total_seats::integer
FROM event_3
CROSS JOIN (VALUES
  ('Platinum', 249.99, 15),
  ('Gold', 179.99, 35),
  ('Silver', 99.99, 70),
  ('Bronze', 59.99, 100)
) AS sections(section_name, price, total_seats)
ON CONFLICT DO NOTHING;

-- 6. Generate tickets for all events
-- This uses a function to generate tickets for each section

-- Championship Finals tickets
WITH event_sections AS (
  SELECT s.id as section_id, s.event_id, s.total_seats
  FROM seating_sections s
  JOIN events e ON s.event_id = e.id
  WHERE e.name = 'Championship Finals 2025'
)
INSERT INTO tickets (event_id, section_id, seat_number, status)
SELECT 
  event_id,
  section_id,
  chr(65 + (n / 10)) || ((n % 10) + 1)::text as seat_number,
  'available'::text
FROM event_sections
CROSS JOIN LATERAL generate_series(0, total_seats - 1) AS n
ON CONFLICT (event_id, section_id, seat_number) DO NOTHING;

-- Spring Tournament tickets
WITH event_sections AS (
  SELECT s.id as section_id, s.event_id, s.total_seats
  FROM seating_sections s
  JOIN events e ON s.event_id = e.id
  WHERE e.name = 'Spring Tournament 2025'
)
INSERT INTO tickets (event_id, section_id, seat_number, status)
SELECT 
  event_id,
  section_id,
  chr(65 + (n / 10)) || ((n % 10) + 1)::text as seat_number,
  'available'::text
FROM event_sections
CROSS JOIN LATERAL generate_series(0, total_seats - 1) AS n
ON CONFLICT (event_id, section_id, seat_number) DO NOTHING;

-- Summer Classic tickets
WITH event_sections AS (
  SELECT s.id as section_id, s.event_id, s.total_seats
  FROM seating_sections s
  JOIN events e ON s.event_id = e.id
  WHERE e.name = 'Summer Classic 2025'
)
INSERT INTO tickets (event_id, section_id, seat_number, status)
SELECT 
  event_id,
  section_id,
  chr(65 + (n / 10)) || ((n % 10) + 1)::text as seat_number,
  'available'::text
FROM event_sections
CROSS JOIN LATERAL generate_series(0, total_seats - 1) AS n
ON CONFLICT (event_id, section_id, seat_number) DO NOTHING;

-- Summary
SELECT 
  'Seed data created successfully!' as message,
  (SELECT COUNT(*) FROM users) as users,
  (SELECT COUNT(*) FROM events) as events,
  (SELECT COUNT(*) FROM seating_sections) as sections,
  (SELECT COUNT(*) FROM tickets) as tickets;
