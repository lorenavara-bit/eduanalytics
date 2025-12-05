# 🔧 Apply Saved Resources Migration

## Quick Setup (1 minute)

### Step 1: Open Supabase Dashboard
1. Go to https://app.supabase.com
2. Select your EduAnalytics project
3. Click **"SQL Editor"** in the left sidebar

### Step 2: Run Migration
1. Click **"New query"**
2. Copy the SQL below and paste it:

```sql
-- Migration 008: Create saved_resources table

CREATE TABLE IF NOT EXISTS saved_resources (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  type TEXT DEFAULT 'guide',
  category TEXT DEFAULT 'General',
  level TEXT,
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE saved_resources ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own resources" ON saved_resources FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own resources" ON saved_resources FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own resources" ON saved_resources FOR DELETE USING (auth.uid() = user_id);
```

3. Click **"Run"** (or press F5)

### Step 3: Verify
You should see "Success. No rows returned."

---

## Done!
Now the "Guardar" button in the Resources Library will work perfectly! 🚀
