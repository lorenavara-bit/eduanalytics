-- Migration: Add avatar_url column to profiles table
-- This allows users to upload and store profile pictures

-- Add avatar_url column to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Add comment for documentation
COMMENT ON COLUMN profiles.avatar_url IS 'URL to user avatar image stored in Supabase Storage (AVATARS bucket)';

-- Verify the column was added
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'profiles' 
  AND column_name = 'avatar_url';
