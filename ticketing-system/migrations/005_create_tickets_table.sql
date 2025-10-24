-- Create tickets table with atomic reservation support
CREATE TABLE IF NOT EXISTS tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  section_id UUID NOT NULL REFERENCES seating_sections(id) ON DELETE CASCADE,
  seat_number VARCHAR(10) NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  status VARCHAR(20) NOT NULL CHECK (status IN ('available', 'reserved', 'sold')) DEFAULT 'available',
  reserved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT unique_seat_per_event UNIQUE (event_id, section_id, seat_number)
);

-- Create index on event_id and section_id for fast ticket lookups
CREATE INDEX idx_tickets_event_section ON tickets(event_id, section_id);

-- Create index on user_id for user's ticket lookups
CREATE INDEX idx_tickets_user_id ON tickets(user_id);

-- Create index on order_id for order's ticket lookups
CREATE INDEX idx_tickets_order_id ON tickets(order_id);

-- Create index on status for filtering available tickets
CREATE INDEX idx_tickets_status ON tickets(status);

-- Create index on reserved_at for finding expired reservations
CREATE INDEX idx_tickets_reserved_at ON tickets(reserved_at) WHERE reserved_at IS NOT NULL;

-- Add comment
COMMENT ON TABLE tickets IS 'Stores individual tickets with atomic reservation support via user_id and reserved_at';
COMMENT ON COLUMN tickets.user_id IS 'User who has reserved this ticket (NULL if available)';
COMMENT ON COLUMN tickets.reserved_at IS 'Timestamp when ticket was reserved (NULL if not reserved)';
COMMENT ON CONSTRAINT unique_seat_per_event ON tickets IS 'Ensures seat uniqueness and enables INSERT ON CONFLICT for atomic reservation';
