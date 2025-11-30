-- Add new columns to student_profiles table for enhanced personalization
-- These fields match the ones used in the WorksheetGenerator prompt

ALTER TABLE student_profiles 
ADD COLUMN IF NOT EXISTS learning_notes TEXT,
ADD COLUMN IF NOT EXISTS special_requirements TEXT,
ADD COLUMN IF NOT EXISTS diagnosed_difficulties TEXT[],
ADD COLUMN IF NOT EXISTS learning_style TEXT;

-- Add comments for documentation
COMMENT ON COLUMN student_profiles.learning_notes IS 'General notes about the student''s learning progress';
COMMENT ON COLUMN student_profiles.special_requirements IS 'Specific requirements or accommodations needed';
COMMENT ON COLUMN student_profiles.diagnosed_difficulties IS 'Array of diagnosed learning difficulties (e.g., Dyslexia, ADHD)';
COMMENT ON COLUMN student_profiles.learning_style IS 'Preferred learning style (e.g., Visual, Kinesthetic)';
