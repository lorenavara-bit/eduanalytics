-- Migration 005: Worksheets Table
-- Created: 2025-12-01
-- Purpose: Store generated worksheets/exams with student progress

-- Create worksheets table
CREATE TABLE IF NOT EXISTS public.worksheets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    subject TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('worksheet', 'exam')),
    title TEXT NOT NULL,
    worksheet_data JSONB NOT NULL,
    student_answers JSONB DEFAULT '{}'::jsonb,
    status TEXT NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed')),
    score INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_worksheets_user_id ON public.worksheets(user_id);
CREATE INDEX IF NOT EXISTS idx_worksheets_subject ON public.worksheets(subject);
CREATE INDEX IF NOT EXISTS idx_worksheets_status ON public.worksheets(status);
CREATE INDEX IF NOT EXISTS idx_worksheets_created_at ON public.worksheets(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.worksheets ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own worksheets
CREATE POLICY "Users can view their own worksheets"
    ON public.worksheets
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own worksheets"
    ON public.worksheets
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own worksheets"
    ON public.worksheets
    FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own worksheets"
    ON public.worksheets
    FOR DELETE
    USING (auth.uid() = user_id);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_worksheets_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER worksheets_updated_at
    BEFORE UPDATE ON public.worksheets
    FOR EACH ROW
    EXECUTE FUNCTION update_worksheets_updated_at();

-- Comments for documentation
COMMENT ON TABLE public.worksheets IS 'Stores AI-generated worksheets and exams with student progress';
COMMENT ON COLUMN public.worksheets.worksheet_data IS 'Generated worksheet content (questions, answer_key, etc.)';
COMMENT ON COLUMN public.worksheets.student_answers IS 'Student answers indexed by question ID';
COMMENT ON COLUMN public.worksheets.status IS 'Progress status: not_started, in_progress, completed';
COMMENT ON COLUMN public.worksheets.score IS 'Final score (0-100) after correction';
