-- Create seating_sections table
CREATE TABLE IF NOT EXISTS seating_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  section_name VARCHAR(100) NOT NULL,
  price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
  total_seats INTEGER NOT NULL CHECK (total_seats > 0),
  available_seats INTEGER NOT NULL CHECK (available_seats >= 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT chk_available_seats CHECK (available_seats <= total_seats)
);

-- Create index on event_id for fast section lookups by event
CREATE INDEX idx_seating_sections_event_id ON seating_sections(event_id);

-- Add comment
COMMENT ON TABLE seating_sections IS 'Stores seating sections for each event';
