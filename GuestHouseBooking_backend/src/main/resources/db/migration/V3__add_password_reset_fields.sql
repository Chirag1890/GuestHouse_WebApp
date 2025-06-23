-- Add password reset fields to user table
ALTER TABLE user ADD COLUMN reset_token VARCHAR(255);
ALTER TABLE user ADD COLUMN reset_token_expiry TIMESTAMP; 