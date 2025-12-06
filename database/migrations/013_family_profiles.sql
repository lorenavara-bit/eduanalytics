-- =====================================================
-- MIGRATION 013: FAMILY PROFILES (NETFLIX MODEL)
-- Description: Transition from individual accounts to
--              Parent Account -> Multiple Student Profiles
-- =====================================================

-- 1. Create student_profiles table
CREATE TABLE IF NOT EXISTS public.student_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Profile Info
    name TEXT NOT NULL,
    nickname TEXT,
    avatar_url TEXT DEFAULT '/avatars/default.png',
    pin_code TEXT, -- Optional 4-digit pin for the child (future use)
    
    -- Educational Context
    grade_level TEXT, -- e.g. "3º Primaria"
    school_system TEXT DEFAULT 'Spain',
    
    -- AI Personalization
    learning_style TEXT, -- "Visual", "Kinesthetic", etc.
    interests TEXT[], -- ["Pokemon", "Football", "Space"]
    weakness_areas TEXT[], -- ["Fractions", "Reading"]
    strengths TEXT[],
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enable RLS
ALTER TABLE public.student_profiles ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies
-- Parents can full control their own student profiles
CREATE POLICY "Parents can manage their student profiles"
    ON public.student_profiles
    USING (auth.uid() = parent_id)
    WITH CHECK (auth.uid() = parent_id);

-- 4. modify worksheets table to link to profiles
ALTER TABLE public.worksheets 
ADD COLUMN IF NOT EXISTS student_profile_id UUID REFERENCES public.student_profiles(id) ON DELETE CASCADE;

-- Update RLS for worksheets: 
-- Before: Access if auth.uid() = user_id
-- Now: Access if auth.uid() = user_id (Parent created it) OR auth.uid() is the parent of the profile
-- Actually, user_id will still be the Parent's ID (the account holder), 
-- and student_profile_id will specify WHICH child it is for.
-- So the existing RLS "auth.uid() = user_id" is still valid! 
-- The parent owns the data.

-- 5. Indexes
CREATE INDEX IF NOT EXISTS idx_student_profiles_parent ON public.student_profiles(parent_id);
CREATE INDEX IF NOT EXISTS idx_worksheets_student_profile ON public.worksheets(student_profile_id);

-- 6. Trigger for updated_at
CREATE TRIGGER update_student_profiles_updated_at
    BEFORE UPDATE ON public.student_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
