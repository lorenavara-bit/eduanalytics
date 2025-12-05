-- Migration: Create saved_resources table
-- Enables users to save AI-generated study guides and other resources

CREATE TABLE IF NOT EXISTS saved_resources (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL, -- Stores the Markdown/HTML content
  type TEXT DEFAULT 'guide', -- 'guide', 'video', 'article'
  category TEXT DEFAULT 'General',
  level TEXT,
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE saved_resources ENABLE ROW LEVEL SECURITY;

-- Policies
-- Users can view their own resources
CREATE POLICY "Users can view own resources" 
  ON saved_resources FOR SELECT 
  USING (auth.uid() = user_id);

-- Users can insert their own resources
CREATE POLICY "Users can insert own resources" 
  ON saved_resources FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own resources
CREATE POLICY "Users can delete own resources" 
  ON saved_resources FOR DELETE 
  USING (auth.uid() = user_id);

-- Add comments
COMMENT ON TABLE saved_resources IS 'Stores user-generated or saved educational resources';
