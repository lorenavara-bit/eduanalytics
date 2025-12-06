# Applying Migration 013: Netflix-Style Family Profiles

This migration transforms the system to a "Family Account" model, where one Parent User manages multiple Student Profiles.

## 1. Run SQL in Supabase

Go to your Supabase Dashboard > SQL Editor > New Query, and paste the content of `database/migrations/013_family_profiles.sql`.

Alternatively, copy it from here:

```sql
-- =====================================================
-- MIGRATION 013: FAMILY PROFILES (NETFLIX MODEL)
-- =====================================================

-- 1. Create student_profiles table
CREATE TABLE IF NOT EXISTS public.student_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    nickname TEXT,
    avatar_url TEXT DEFAULT '/avatars/default.png',
    grade_level TEXT,
    school_system TEXT DEFAULT 'Spain',
    learning_style TEXT,
    interests TEXT[],
    weakness_areas TEXT[],
    strengths TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enable RLS
ALTER TABLE public.student_profiles ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies
CREATE POLICY "Parents can manage their student profiles"
    ON public.student_profiles
    USING (auth.uid() = parent_id)
    WITH CHECK (auth.uid() = parent_id);

-- 4. modify worksheets table to link to profiles
ALTER TABLE public.worksheets 
ADD COLUMN IF NOT EXISTS student_profile_id UUID REFERENCES public.student_profiles(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_student_profiles_parent ON public.student_profiles(parent_id);
CREATE INDEX IF NOT EXISTS idx_worksheets_student_profile ON public.worksheets(student_profile_id);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_student_profiles_updated_at
    BEFORE UPDATE ON public.student_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

## 2. Next Steps (Code)

Once this is applied, we will update the Frontend to:
1.  Allow creating profiles using the `student_profiles` table.
2.  Replace the "Link Account" screen with a "Who is watching?" screen.
