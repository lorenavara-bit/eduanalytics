-- Migration 010: Calendar Events Table
-- Created: 2025-12-05
-- Purpose: Store student's homework, exams, and study sessions

-- Create calendar_events table
CREATE TABLE IF NOT EXISTS public.calendar_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    event_type TEXT NOT NULL CHECK (event_type IN ('homework', 'exam', 'study_session', 'project', 'other')),
    subject TEXT,
    event_date DATE NOT NULL,
    start_time TIME,
    end_time TIME,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    color TEXT DEFAULT '#4F46E5',
    reminder_days INTEGER DEFAULT 0,
    linked_worksheet_id UUID REFERENCES public.worksheets(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_calendar_events_user_id ON public.calendar_events(user_id);
CREATE INDEX IF NOT EXISTS idx_calendar_events_date ON public.calendar_events(event_date);
CREATE INDEX IF NOT EXISTS idx_calendar_events_status ON public.calendar_events(status);
CREATE INDEX IF NOT EXISTS idx_calendar_events_type ON public.calendar_events(event_type);

-- Enable Row Level Security
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own events
CREATE POLICY "Users can view their own calendar events"
    ON public.calendar_events
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own calendar events"
    ON public.calendar_events
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own calendar events"
    ON public.calendar_events
    FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own calendar events"
    ON public.calendar_events
    FOR DELETE
    USING (auth.uid() = user_id);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_calendar_events_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER calendar_events_updated_at
    BEFORE UPDATE ON public.calendar_events
    FOR EACH ROW
    EXECUTE FUNCTION update_calendar_events_updated_at();

-- Comments for documentation
COMMENT ON TABLE public.calendar_events IS 'Stores student calendar events: homework, exams, study sessions';
COMMENT ON COLUMN public.calendar_events.event_type IS 'Type of event: homework, exam, study_session, project, other';
COMMENT ON COLUMN public.calendar_events.status IS 'Event status: pending, in_progress, completed, cancelled';
COMMENT ON COLUMN public.calendar_events.priority IS 'Event priority: low, medium, high';
COMMENT ON COLUMN public.calendar_events.reminder_days IS 'Days before event to show reminder (0 = day of event)';
COMMENT ON COLUMN public.calendar_events.linked_worksheet_id IS 'Optional link to a saved worksheet';
