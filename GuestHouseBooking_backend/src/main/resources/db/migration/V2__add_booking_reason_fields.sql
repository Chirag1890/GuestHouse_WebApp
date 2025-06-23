-- Add rejection and cancellation reason fields to booking table
ALTER TABLE booking ADD COLUMN rejection_reason TEXT;
ALTER TABLE booking ADD COLUMN cancellation_reason TEXT; 