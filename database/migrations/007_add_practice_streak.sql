-- Migration: Add practice streak tracking columns to profiles table
-- This enables the daily practice streak counter feature

-- Add columns for tracking practice streak
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS last_practice_date DATE;

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS practice_streak INTEGER DEFAULT 0;

-- Add comments for documentation
COMMENT ON COLUMN profiles.last_practice_date IS 'Last date user completed a practice worksheet';
COMMENT ON COLUMN profiles.practice_streak IS 'Current consecutive days of practice';

-- Verify the columns were added
SELECT column_name, data_type, column_default, is_nullable
FROM information_schema.columns
WHERE table_name = 'profiles' 
  AND column_name IN ('last_practice_date', 'practice_streak');
