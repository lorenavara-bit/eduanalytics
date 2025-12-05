# 🔧 Apply Practice Streak Migration

## Quick Setup (2 minutes)

### Step 1: Open Supabase Dashboard
1. Go to https://app.supabase.com
2. Select your EduAnalytics project
3. Click **"SQL Editor"** in the left sidebar

### Step 2: Run Migration
1. Click **"New query"**
2. Copy the SQL below and paste it:

```sql
-- Migration 007: Add practice streak tracking

-- Add columns for tracking practice streak
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS last_practice_date DATE;

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS practice_streak INTEGER DEFAULT 0;

-- Add comments for documentation
COMMENT ON COLUMN profiles.last_practice_date IS 'Last date user completed a practice worksheet';
COMMENT ON COLUMN profiles.practice_streak IS 'Current consecutive days of practice';

-- Verify the columns were added (should show 2 rows)
SELECT column_name, data_type, column_default, is_nullable
FROM information_schema.columns
WHERE table_name = 'profiles' 
  AND column_name IN ('last_practice_date', 'practice_streak');
```

3. Click **"Run"** (or press F5)

### Step 3: Verify
You should see a result like this:
```
column_name          | data_type | column_default | is_nullable
---------------------+-----------+----------------+-------------
last_practice_date   | date      | NULL           | YES
practice_streak      | integer   | 0              | YES
```

**✅ If you see 2 rows, you're done!**

---

## What This Does

Adds two columns to the `profiles` table to enable the **Practice Streak Counter** feature:

1. **`last_practice_date`**: Stores the last date user practiced
2. **`practice_streak`**: Stores the number of consecutive days

---

## Troubleshooting

### Issue: "column already exists"
**Solution**: The migration is safe - it uses `IF NOT EXISTS`. Just continue.

### Issue: "table profiles does not exist"
**Problem**: You need to run earlier migrations first.  
**Solution**: Check `database/migrations/` folder and run migrations in order (001, 002, ..., 007)

### Issue: Different database/schema
**Problem**: Using a different Supabase project.  
**Solution**: Make sure you're in the correct project in Supabase dashboard.

---

## Done!

Once you see the 2 rows, the Practice Streak Counter will work automatically:
- ✅ Tracks when users complete worksheets
- ✅ Increments streak for consecutive days
- ✅ Shows motivational flame icon 🔥
- ✅ Displays days count and encouraging messages

**No additional setup needed - just generate and complete a worksheet to start your streak!**
