-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  total_amount DOUBLE PRECISION NOT NULL CHECK (total_amount >= 0),
  payment_status VARCHAR(20) NOT NULL CHECK (payment_status IN ('pending', 'completed', 'failed')) DEFAULT 'pending',
  payment_method VARCHAR(50) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index on user_id for user's order history lookups
CREATE INDEX idx_orders_user_id ON orders(user_id);

-- Create index on payment_status for filtering orders
CREATE INDEX idx_orders_payment_status ON orders(payment_status);

-- Create index on created_at for sorting orders by date
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);

-- Add comment
COMMENT ON TABLE orders IS 'Stores customer orders';
