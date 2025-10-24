-- Create events table
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  event_date DATE NOT NULL,
  event_time TIME NOT NULL,
  venue VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE
);

-- Create index on event_date for filtering upcoming events
CREATE INDEX idx_events_event_date ON events(event_date);

-- Create index on created_by for user's events lookup
CREATE INDEX idx_events_created_by ON events(created_by);

-- Add comment
COMMENT ON TABLE events IS 'Stores sports venue events';
