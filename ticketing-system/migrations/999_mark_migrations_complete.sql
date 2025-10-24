-- Migration 999: Mark all migrations as complete
-- This is the FINAL migration - if this runs, all previous migrations succeeded
-- Docker entrypoint runs migrations serially and stops on any error

INSERT INTO migrations_full_run (completed_at)
VALUES (CURRENT_TIMESTAMP);
