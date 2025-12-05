-- =====================================================
-- MIGRATION 012: Fix RLS for Instant Linking
-- Description: Allow parents to create 'active' links directly
--              This enables the "Child Code -> Parent Link" flow
-- Author: Antigravity AI
-- Date: 2025-12-05
-- =====================================================

-- Drop the restrictive policy
DROP POLICY IF EXISTS "Parents can create invitations" ON parent_child_links;

-- Create a new permissive policy for INSERT
-- Allows parents to insert ANY status (including 'active')
CREATE POLICY "Parents can create links"
    ON parent_child_links FOR INSERT
    WITH CHECK (
        auth.uid() = parent_user_id
    );

-- Also allow parents to update their own links regardless of status
-- (Useful if we need to change permissions later)
DROP POLICY IF EXISTS "Parents can update permissions" ON parent_child_links;

CREATE POLICY "Parents can manage links"
    ON parent_child_links FOR UPDATE
    USING (auth.uid() = parent_user_id);
