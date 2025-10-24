-- Create seating_sections table
-- Note: available_seats is calculated dynamically from the tickets table
CREATE TABLE IF NOT EXISTS seating_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  section_name VARCHAR(100) NOT NULL,
  price DOUBLE PRECISION NOT NULL CHECK (price >= 0),
  total_seats INTEGER NOT NULL CHECK (total_seats > 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index on event_id for fast section lookups by event
CREATE INDEX idx_seating_sections_event_id ON seating_sections(event_id);

-- Add comment
COMMENT ON TABLE seating_sections IS 'Seating sections for events. Available seats are calculated dynamically from tickets table based on ticket status.';
