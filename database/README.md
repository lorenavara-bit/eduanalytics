# Feedback Analysis System - Setup Guide

This guide will help you set up the complete feedback analysis system with Spanish LOMLOE curriculum integration.

## 🗄️ Database Setup

### Step 1: Run the Migration

1. Open your Supabase Dashboard
2. Go to **SQL Editor**
3. Copy and paste the contents of `database/migrations/002_feedback_system.sql`
4. Click **Run** to execute the migration

This will create:
- ✅ 8 new tables for the feedback system
- ✅ Spanish LOMLOE curriculum standards (seed data)
- ✅ Row Level Security (RLS) policies
- ✅ Performance indexes
- ✅ Helper functions for analytics

### Step 2: Verify Tables

After running the migration, verify that these tables exist:

1. `curriculum_standards` - Spanish LOMLOE curriculum data
2. `learning_objectives` - Learning goals for each competency
3. `worksheets` - AI-generated practice worksheets
4. `worksheet_results` - Student answers and scores
5. `exam_results` - Exam performance data
6. `feedback_reports` - AI-generated feedback analysis
7. `student_profiles` - Extended student information
8. `learning_analytics` - Consolidated performance tracking

### Step 3: Check Seed Data

Run this query to verify curriculum data was inserted:

```sql
SELECT grade_level, subject, competency_code, competency_name 
FROM curriculum_standards 
ORDER BY grade_level, subject;
```

You should see entries for:
- 3º Primaria (Matemáticas, Lengua Castellana, Ciencias Naturales)
- 1º ESO (Matemáticas, Lengua Castellana)

## 📚 Features Overview

### 1. Worksheet Generator (Analyze Tab)
- Generates curriculum-aligned exercises based on LOMLOE standards
- Personalizes questions using student interests
- Adjusts difficulty for grade level
- Provides instant AI correction with detailed feedback
- Saves all results to database for analytics

### 2. Feedback Dashboard (Feedback Tab)
- **Real Data Analysis**: Uses actual worksheet and exam results
- **Performance Trends**: Charts showing progress over time
- **Subject Breakdown**: Performance by subject/competency
- **AI-Powered Insights**: Gemini analyzes all data to generate:
  - Personalized strengths (top 3)
  - Areas for improvement (top 3)
  - Actionable recommendations for parents
  - Comparison to Spanish curriculum standards
  - Next learning steps (short-term & long-term)
- **Downloadable Reports**: Export complete feedback as text file

### 3. Learning Analytics
- Automatic tracking of all student activities
- Performance calculated against curriculum standards
- Historical data for trend analysis
- Subject-wise competency tracking

## 🎯 How It Works

### Workflow:

1. **Student Profile** → Define grade level, interests, observations
2. **Upload Materials** → Add study materials (optional)
3. **Generate Worksheet** → AI creates curriculum-aligned exercises
4. **Complete Worksheet** → Student answers questions
5. **AI Correction** → Instant grading with detailed feedback
6. **Data Storage** → Results saved to `worksheet_results` and `learning_analytics`
7. **Generate Feedback** → AI analyzes all historical data to create comprehensive report
8. **Track Progress** → View trends, charts, and recommendations

## 🇪🇸 Spanish Curriculum (LOMLOE)

The system includes pre-loaded curriculum standards for:

### Primaria (Ages 6-12):
- **3º Primaria (8-9 años)**:
  - Matemáticas: Números hasta 1000, operaciones básicas, medida y geometría
  - Lengua: Comprensión lectora, ortografía y gramática
  - Ciencias Naturales: Seres vivos, cuerpo humano

### Secundaria (Ages 12-16):
- **1º ESO (12-13 años)**:
  - Matemáticas: Números enteros/racionales, álgebra básica
  - Lengua: Análisis de textos, tipología textual

### Adding More Standards:

To add curriculum standards for other grades:

```sql
INSERT INTO curriculum_standards 
  (grade_level, age_range, subject, competency_code, competency_name, description, learning_goals, evaluation_criteria) 
VALUES
  ('4º Primaria', '9-10', 'Matemáticas', 'MAT.4.1', 'Multiplicación y División', 
   'Dominio de multiplicación y división con números naturales...', 
   '["Objetivo 1", "Objetivo 2"]'::jsonb,
   '["Criterio 1", "Criterio 2"]'::jsonb);
```

## 🔧 Technical Details

### Database Functions

**`get_average_score(user_id, subject, days)`**
```sql
SELECT get_average_score(
  'user-uuid-here', 
  'Matemáticas', 
  30  -- last 30 days
);
```

**`get_performance_trend(user_id, subject)`**
```sql
SELECT * FROM get_performance_trend(
  'user-uuid-here',
  'Lengua Castellana'  -- or NULL for all subjects
);
```

### Data Flow

```
User Input → Gemini API (Generation) → worksheets table
                                            ↓
Student Answers → Gemini API (Correction) → worksheet_results table
                                                    ↓
                                            learning_analytics table
                                                    ↓
                    Gemini API (Analysis) ← Aggregate Data
                            ↓
                    feedback_reports table
```

## 📊 Sample Queries

### Get student's recent performance:
```sql
SELECT 
  wr.completed_at,
  w.title,
  w.subject,
  wr.score,
  wr.correct_answers || '/' || wr.total_questions as results
FROM worksheet_results wr
JOIN worksheets w ON w.id = wr.worksheet_id
WHERE wr.user_id = 'your-user-id'
ORDER BY wr.completed_at DESC
LIMIT 10;
```

### Get subject averages:
```sql
SELECT 
  subject,
  AVG(score)::NUMERIC(5,2) as avg_score,
  COUNT(*) as activities
FROM learning_analytics
WHERE user_id = 'your-user-id'
  AND date >= CURRENT_DATE - 30
GROUP BY subject
ORDER BY avg_score DESC;
```

### Get latest feedback report:
```sql
SELECT 
  generated_at,
  overall_score,
  report_data->>'summary' as summary,
  jsonb_pretty(strengths) as strengths,
  jsonb_pretty(improvements) as improvements
FROM feedback_reports
WHERE user_id = 'your-user-id'
ORDER BY generated_at DESC
LIMIT 1;
```

## 🚀 Usage Tips

### For Best Results:

1. **Complete Profile**: Fill in student age, grade, interests, and observations
2. **Regular Practice**: Complete at least 3-5 worksheets before generating feedback
3. **Mix Subjects**: Practice different subjects for comprehensive analysis
4. **Review Feedback**: Check the feedback dashboard weekly
5. **Track Progress**: Use the 30/90/180-day views to see long-term trends

### Personalizing Worksheets:

The AI uses these fields to personalize content:
- **Interests**: Makes questions more engaging (e.g., "If Juan has 5 soccer balls...")
- **Observations**: Adjusts difficulty and style (e.g., "Needs visual aids" → more diagrams)
- **Grade Level**: Ensures curriculum alignment

## 🔐 Security Notes

- All tables have Row Level Security (RLS) enabled
- Users can only access their own data
- Curriculum standards are publicly readable
- API keys stored securely in user profiles

## 📝 Troubleshooting

### Issue: "No curriculum standards found"
**Solution**: Re-run the migration script to insert seed data

### Issue: "Cannot generate worksheet"
**Solution**: Ensure your profile has `grade` field set to match curriculum grades

### Issue: "Charts not displaying"
**Solution**: Complete at least 2-3 worksheets to have data points

### Issue: "Feedback report empty"
**Solution**: Complete more activities - AI needs data to analyze

## 🎨 Customization

### Adding New Competencies:

Edit `002_feedback_system.sql` and add curriculum entries:

```sql
INSERT INTO curriculum_standards 
  (grade_level, age_range, subject, competency_code, competency_name, description, learning_goals, evaluation_criteria) 
VALUES
  ('Your Grade', 'Age Range', 'Subject', 'CODE', 'Name', 
   'Description', 
   '["Goal 1", "Goal 2"]'::jsonb,
   '["Criteria 1"]'::jsonb);
```

### Modifying AI Prompts:

Edit the component files:
- `WorksheetGenerator.js` → Line ~80 (Generation prompt)
- `WorksheetGenerator.js` → Line ~140 (Correction prompt)
- `FeedbackDashboard.js` → Line ~170 (Analysis prompt)

## 📖 Resources

- [LOMLOE Official Curriculum](https://www.educacionyfp.gob.es/)
- [Supabase Documentation](https://supabase.com/docs)
- [Chart.js Documentation](https://www.chartjs.org/)
- [Gemini API Reference](https://ai.google.dev/docs)

## 🆘 Support

If you encounter issues:
1. Check browser console for errors
2. Verify Supabase tables were created correctly
3. Ensure Gemini API key is configured in Profile tab
4. Check that RLS policies allow your queries

---

**Built with ❤️ for Spanish education | Sistema alineado con LOMLOE**
