-- Migration 000: Initialize migration tracker
-- This table tracks whether all migrations completed successfully
-- If this table exists with a row, all migrations ran successfully

CREATE TABLE IF NOT EXISTS migrations_full_run (
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Table starts with 0 rows
-- Migration 999 will add a row when all migrations complete
