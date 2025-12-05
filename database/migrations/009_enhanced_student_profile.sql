-- Migration 009: Enhanced Student Profile for AI Personalization
-- This migration adds new columns to the profiles table to support better AI personalization

-- Add new columns to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS learning_style VARCHAR(50);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS favorite_subjects TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS difficult_subjects TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS strengths TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS weaknesses TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS learning_goals TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS best_study_time VARCHAR(20);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS preferred_session_length INTEGER DEFAULT 30;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS current_mood VARCHAR(20);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS total_xp INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS current_level INTEGER DEFAULT 1;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS total_worksheets_completed INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS achievements JSONB DEFAULT '[]'::jsonb;

-- Add comments for documentation
COMMENT ON COLUMN profiles.learning_style IS 'Student learning style: visual, auditivo, kinestesico, lectoescritor';
COMMENT ON COLUMN profiles.favorite_subjects IS 'Comma-separated list of subjects student enjoys';
COMMENT ON COLUMN profiles.difficult_subjects IS 'Comma-separated list of subjects student finds challenging';
COMMENT ON COLUMN profiles.strengths IS 'Student reported strengths and skills';
COMMENT ON COLUMN profiles.weaknesses IS 'Areas where student needs improvement';
COMMENT ON COLUMN profiles.learning_goals IS 'Student learning objectives and goals';
COMMENT ON COLUMN profiles.best_study_time IS 'Preferred time for studying: manana, tarde, noche';
COMMENT ON COLUMN profiles.preferred_session_length IS 'Preferred study session length in minutes';
COMMENT ON COLUMN profiles.current_mood IS 'Current mood about learning: motivado, neutral, frustrado';
COMMENT ON COLUMN profiles.total_xp IS 'Total experience points earned';
COMMENT ON COLUMN profiles.current_level IS 'Current student level based on XP';
COMMENT ON COLUMN profiles.total_worksheets_completed IS 'Total number of worksheets completed';
COMMENT ON COLUMN profiles.achievements IS 'Array of unlocked achievements';

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_profiles_level ON profiles(current_level);
CREATE INDEX IF NOT EXISTS idx_profiles_xp ON profiles(total_xp);
