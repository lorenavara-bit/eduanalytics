-- =====================================================
-- MIGRATION 011: Multi-Role System
-- Description: Sistema completo de roles múltiples con
--              vinculación padre-hijo y permisos
-- Author: Antigravity AI
-- Date: 2025-12-05
-- =====================================================

-- =====================================================
-- STEP 1: Modify profiles table to support roles
-- =====================================================

-- Add role columns to existing profiles table (using DO blocks for safety)
DO $$ 
BEGIN
    -- Add role column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='role') THEN
        ALTER TABLE profiles ADD COLUMN role TEXT DEFAULT 'student' CHECK (role IN ('student', 'parent', 'teacher', 'admin'));
    END IF;
    
    -- Add available_roles column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='available_roles') THEN
        ALTER TABLE profiles ADD COLUMN available_roles TEXT[] DEFAULT ARRAY['student']::TEXT[];
    END IF;
    
    -- Add current_role column (escaped because it's a reserved word)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='current_role') THEN
        ALTER TABLE profiles ADD COLUMN "current_role" TEXT DEFAULT 'student';
    END IF;
    
    -- Add parent_email column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='parent_email') THEN
        ALTER TABLE profiles ADD COLUMN parent_email TEXT;
    END IF;
    
    -- Add is_parent_verified column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='is_parent_verified') THEN
        ALTER TABLE profiles ADD COLUMN is_parent_verified BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

-- Create indexes on role columns for faster queries
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_current_role ON profiles("current_role");

-- NOTE: Update statement moved to end of migration for safety

-- =====================================================
-- STEP 2: Create parent_child_links table
-- =====================================================

CREATE TABLE IF NOT EXISTS public.parent_child_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    child_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Status workflow: pending → active | rejected
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'rejected', 'blocked')),
    
    -- Invitation and acceptance tracking
    invited_at TIMESTAMPTZ DEFAULT NOW(),
    accepted_at TIMESTAMPTZ,
    rejected_at TIMESTAMPTZ,
    
    -- Optional: custom name for child (e.g., nickname)
    custom_child_name TEXT,
    
    -- Permissions: what can parent do
    can_view_progress BOOLEAN DEFAULT TRUE,
    can_generate_worksheets BOOLEAN DEFAULT TRUE,
    can_view_calendar BOOLEAN DEFAULT TRUE,
    can_edit_profile BOOLEAN DEFAULT FALSE,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    UNIQUE(parent_user_id, child_user_id),
    CHECK (parent_user_id != child_user_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_parent_child_links_parent ON parent_child_links(parent_user_id) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_parent_child_links_child ON parent_child_links(child_user_id) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_parent_child_links_status ON parent_child_links(status);

-- =====================================================
-- STEP 3: Create invitation_codes table (optional)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.invitation_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    child_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_by UUID NOT NULL REFERENCES auth.users(id),
    
    -- Code lifecycle
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
    used_at TIMESTAMPTZ,
    used_by UUID REFERENCES auth.users(id),
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE,
    
    CHECK (LENGTH(code) >= 6)
);

CREATE INDEX IF NOT EXISTS idx_invitation_codes_code ON invitation_codes(code) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_invitation_codes_child ON invitation_codes(child_user_id);

-- =====================================================
-- STEP 4: Row Level Security (RLS) Policies
-- =====================================================

-- Enable RLS
ALTER TABLE parent_child_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitation_codes ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- RLS: parent_child_links
-- =====================================================

-- Parents can view their active links
CREATE POLICY "Parents can view their links"
    ON parent_child_links FOR SELECT
    USING (
        auth.uid() = parent_user_id 
        OR auth.uid() = child_user_id
    );

-- Parents can create new link invitations
CREATE POLICY "Parents can create invitations"
    ON parent_child_links FOR INSERT
    WITH CHECK (
        auth.uid() = parent_user_id
        AND status = 'pending'
    );

-- Children can accept/reject invitations
CREATE POLICY "Children can respond to invitations"
    ON parent_child_links FOR UPDATE
    USING (auth.uid() = child_user_id)
    WITH CHECK (
        auth.uid() = child_user_id
        AND status IN ('active', 'rejected')
    );

-- Parents can update permissions (only for active links)
CREATE POLICY "Parents can update permissions"
    ON parent_child_links FOR UPDATE
    USING (
        auth.uid() = parent_user_id 
        AND status = 'active'
    );

-- Users can delete their links
CREATE POLICY "Users can delete their links"
    ON parent_child_links FOR DELETE
    USING (
        auth.uid() = parent_user_id 
        OR auth.uid() = child_user_id
    );

-- =====================================================
-- RLS: invitation_codes
-- =====================================================

-- Children can view their own codes
CREATE POLICY "Children can view their codes"
    ON invitation_codes FOR SELECT
    USING (auth.uid() = child_user_id);

-- Children can create codes
CREATE POLICY "Children can create codes"
    ON invitation_codes FOR INSERT
    WITH CHECK (auth.uid() = child_user_id);

-- Anyone can use codes (read-only for validation)
CREATE POLICY "Anyone can read active codes"
    ON invitation_codes FOR SELECT
    USING (is_active = TRUE AND expires_at > NOW());

-- =====================================================
-- STEP 5: Create helper views
-- =====================================================

-- View: Parent dashboard data (optimized for queries)
CREATE OR REPLACE VIEW parent_dashboard_summary AS
SELECT 
    pcl.parent_user_id,
    pcl.child_user_id,
    pcl.status as link_status,
    pcl.can_view_progress,
    pcl.can_generate_worksheets,
    
    -- Child info
    p.name as child_name,
    p.grade as child_grade,
    p.level as child_level,
    p.avatar_url as child_avatar,
    pcl.custom_child_name,
    
    -- Stats
    COUNT(DISTINCT w.id) as total_worksheets,
    COUNT(DISTINCT CASE WHEN w.status = 'completed' THEN w.id END) as completed_worksheets,
    ROUND(AVG(CASE WHEN w.status = 'completed' AND w.score IS NOT NULL THEN w.score END)::numeric, 1) as avg_score,
    
    -- Calendar
    COUNT(DISTINCT CASE 
        WHEN ce.status = 'pending' 
        AND ce.event_date >= CURRENT_DATE 
        AND ce.event_date <= CURRENT_DATE + INTERVAL '7 days'
        THEN ce.id 
    END) as upcoming_events_week,
    
    -- Recent activity
    MAX(w.created_at) as last_activity_date,
    
    -- Metadata
    pcl.created_at as linked_since
    
FROM parent_child_links pcl
LEFT JOIN profiles p ON p.id = pcl.child_user_id
LEFT JOIN worksheets w ON w.user_id = pcl.child_user_id
LEFT JOIN calendar_events ce ON ce.user_id = pcl.child_user_id

WHERE pcl.status = 'active'

GROUP BY 
    pcl.parent_user_id, 
    pcl.child_user_id, 
    pcl.status,
    pcl.can_view_progress,
    pcl.can_generate_worksheets,
    p.name, 
    p.grade, 
    p.level,
    p.avatar_url,
    pcl.custom_child_name,
    pcl.created_at;

-- =====================================================
-- STEP 6: Triggers for updated_at
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_parent_child_links_updated_at
    BEFORE UPDATE ON parent_child_links
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- STEP 7: Helper functions
-- =====================================================

-- Function: Generate invitation code
CREATE OR REPLACE FUNCTION generate_invitation_code()
RETURNS TEXT AS $$
DECLARE
    code TEXT;
    exists BOOLEAN;
BEGIN
    LOOP
        -- Generate 8-character alphanumeric code
        code := UPPER(
            SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 8)
        );
        
        -- Check if code already exists
        SELECT EXISTS(
            SELECT 1 FROM invitation_codes 
            WHERE invitation_codes.code = code
        ) INTO exists;
        
        EXIT WHEN NOT exists;
    END LOOP;
    
    RETURN code;
END;
$$ LANGUAGE plpgsql;

-- Function: Check if parent can access child data
CREATE OR REPLACE FUNCTION can_parent_access_child(
    p_parent_id UUID,
    p_child_id UUID
)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM parent_child_links
        WHERE parent_user_id = p_parent_id
        AND child_user_id = p_child_id
        AND status = 'active'
        AND can_view_progress = TRUE
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- STEP 8: Sample data for testing (OPTIONAL - COMMENT OUT IN PRODUCTION)
-- =====================================================

-- Uncomment below to add test data
/*
-- Add parent role to a test user
UPDATE profiles 
SET role = 'parent',
    available_roles = ARRAY['parent', 'student']::TEXT[],
    current_role = 'parent'
WHERE email = 'test-parent@example.com';

-- Create a sample link (replace UUIDs with actual user IDs)
INSERT INTO parent_child_links (parent_user_id, child_user_id, status)
VALUES 
    ('parent-uuid-here', 'child-uuid-here', 'active')
ON CONFLICT (parent_user_id, child_user_id) DO NOTHING;
*/

-- =====================================================
-- STEP 9: Verification queries
-- =====================================================

-- Check if migration was successful
DO $$
BEGIN
    -- Check if columns were added
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'role'
    ) THEN
        RAISE EXCEPTION 'Migration failed: role column not added to profiles';
    END IF;
    
    -- Check if parent_child_links table exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'parent_child_links'
    ) THEN
        RAISE EXCEPTION 'Migration failed: parent_child_links table not created';
    END IF;
    
    RAISE NOTICE 'Migration 011 completed successfully!';
END $$;

-- =====================================================
-- STEP 10: Update existing users (after all columns exist)
-- =====================================================

-- Update existing users to have proper role structure
UPDATE profiles 
SET 
    available_roles = ARRAY['student']::TEXT[],
    "current_role" = 'student'
WHERE available_roles IS NULL OR available_roles = '{}';

-- =====================================================
-- END OF MIGRATION 011
-- =====================================================
