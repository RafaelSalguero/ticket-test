-- Migration 008: Remove available_seats column from seating_sections table
-- This column is now calculated dynamically from the tickets table

-- Drop the check constraint first
ALTER TABLE seating_sections
DROP CONSTRAINT IF EXISTS chk_available_seats;

-- Drop the available_seats column
ALTER TABLE seating_sections
DROP COLUMN IF EXISTS available_seats;

-- Add comment explaining the change
COMMENT ON TABLE seating_sections IS 'Seating sections for events. Available seats are calculated dynamically from tickets table based on ticket status.';
