# 🚀 Deployment Instructions for EduAnalytics v2.0

## 📦 Package Info
- **File:** `eduanalytics-deploy-package.zip`
- **Contains:** Full production build with Intelligent Resources Library & Enhanced Worksheet System.
- **Date:** 2025-12-02

---

## 🌐 Hostinger Deployment Steps

1.  **Login to Hostinger** and open the **File Manager**.
2.  Navigate to the **`public_html`** folder.
3.  **Delete** the old content inside `public_html` (Select all -> Delete).
    *   *Caution: Do not delete your `.env` file if you created one manually on the server.*
4.  **Upload** the `eduanalytics-deploy-package.zip` file.
5.  **Right-click** the zip file and select **Extract**.
    *   Destination should be `.` (current directory) or ensure files end up directly in `public_html`.
6.  **Delete** the zip file after extraction.

---

## 🗄️ Database Update (Crucial!)

For the **"Save Resource"** feature to work, you MUST run the latest migration in Supabase:

1.  Go to **Supabase Dashboard** -> **SQL Editor**.
2.  Open `database/migrations/008_saved_resources.sql` (from your local project) or copy the code below:

```sql
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

ALTER TABLE saved_resources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own resources" ON saved_resources FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own resources" ON saved_resources FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own resources" ON saved_resources FOR DELETE USING (auth.uid() = user_id);
```

3.  Click **Run**.

---

## ✅ Verification
- Go to your website URL.
- Check the "Recursos" tab.
- Try generating a guide and clicking "Guardar".
- If you see the success notification, everything is perfect!
