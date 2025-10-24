-- Migration: Add role column to users table
-- This migration adds a role column to distinguish between admin and customer users

-- Add role column with default value of 'customer'
ALTER TABLE users 
ADD COLUMN role VARCHAR(20) NOT NULL DEFAULT 'customer';

-- Add check constraint to ensure only valid roles
ALTER TABLE users
ADD CONSTRAINT users_role_check CHECK (role IN ('customer', 'admin'));

-- Set admin role for the admin user (admin@venue.com)
-- This user was created in the seed data migration
UPDATE users 
SET role = 'admin' 
WHERE email = 'admin@venue.com';

-- Create index on role column for faster queries
CREATE INDEX idx_users_role ON users(role);

-- Add comment to document the role column
COMMENT ON COLUMN users.role IS 'User role: customer (default) or admin';
