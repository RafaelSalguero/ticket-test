-- Create order_items table
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(ticket_id)
);

-- Create index on order_id for order's items lookup
CREATE INDEX idx_order_items_order_id ON order_items(order_id);

-- Create index on ticket_id for ticket's order lookup
CREATE INDEX idx_order_items_ticket_id ON order_items(ticket_id);

-- Add comment
COMMENT ON TABLE order_items IS 'Stores individual items (tickets) in each order';
