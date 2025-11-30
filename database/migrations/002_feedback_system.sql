-- ============================================
-- FEEDBACK ANALYSIS SYSTEM - SUPABASE MIGRATION
-- Spanish LOMLOE Curriculum Integration
-- ============================================

-- 1. CURRICULUM STANDARDS TABLE (Spanish LOMLOE)
CREATE TABLE IF NOT EXISTS curriculum_standards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  grade_level TEXT NOT NULL, -- e.g., "3º Primaria", "1º ESO"
  age_range TEXT NOT NULL, -- e.g., "8-9", "12-13"
  subject TEXT NOT NULL, -- Matemáticas, Lengua, Ciencias, etc.
  competency_code TEXT NOT NULL, -- e.g., "MAT.3.1.1"
  competency_name TEXT NOT NULL,
  description TEXT NOT NULL,
  learning_goals JSONB DEFAULT '[]'::jsonb,
  evaluation_criteria JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. LEARNING OBJECTIVES TABLE
CREATE TABLE IF NOT EXISTS learning_objectives (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  curriculum_standard_id UUID REFERENCES curriculum_standards(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  difficulty_level TEXT CHECK (difficulty_level IN ('básico', 'intermedio', 'avanzado')),
  keywords TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. WORKSHEETS TABLE (for generated practice)
CREATE TABLE IF NOT EXISTS worksheets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  subject TEXT NOT NULL,
  grade_level TEXT NOT NULL,
  curriculum_standard_id UUID REFERENCES curriculum_standards(id),
  questions JSONB NOT NULL, -- Array of question objects
  answer_key JSONB, -- Array of correct answers
  time_estimate INTEGER, -- in minutes
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- 4. WORKSHEET RESULTS TABLE
CREATE TABLE IF NOT EXISTS worksheet_results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  worksheet_id UUID REFERENCES worksheets(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  student_name TEXT,
  answers JSONB NOT NULL, -- Student's answers
  score NUMERIC(5,2), -- e.g., 85.50
  total_questions INTEGER,
  correct_answers INTEGER,
  time_spent INTEGER, -- in seconds
  question_breakdown JSONB, -- Detailed per-question analysis
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- 5. EXAM RESULTS TABLE
CREATE TABLE IF NOT EXISTS exam_results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  exam_title TEXT NOT NULL,
  subject TEXT NOT NULL,
  grade_level TEXT NOT NULL,
  total_score NUMERIC(5,2),
  subject_scores JSONB, -- Breakdown by topic
  corrections_notes TEXT,
  teacher_feedback TEXT,
  strengths TEXT[],
  weaknesses TEXT[],
  exam_data JSONB, -- Full exam content
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- 6. FEEDBACK REPORTS TABLE
CREATE TABLE IF NOT EXISTS feedback_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  student_name TEXT,
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  period_start DATE,
  period_end DATE,
  report_data JSONB NOT NULL, -- Complete feedback analysis
  overall_score NUMERIC(5,2),
  strengths JSONB, -- Top 3 strengths with examples
  improvements JSONB, -- Top 3 areas for improvement
  recommendations JSONB, -- Actionable recommendations
  progress_trends JSONB, -- Performance over time
  curriculum_comparison JSONB, -- Comparison to grade level
  metadata JSONB DEFAULT '{}'::jsonb
);

-- 7. STUDENT PROFILES TABLE (extended)
CREATE TABLE IF NOT EXISTS student_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  name TEXT NOT NULL,
  birth_date DATE,
  age INTEGER,
  grade_level TEXT NOT NULL,
  interests TEXT[],
  learning_style TEXT,
  special_needs TEXT,
  observations TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. LEARNING ANALYTICS TABLE (consolidated performance data)
CREATE TABLE IF NOT EXISTS learning_analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE DEFAULT CURRENT_DATE,
  subject TEXT NOT NULL,
  activity_type TEXT CHECK (activity_type IN ('worksheet', 'exam', 'practice', 'review')),
  score NUMERIC(5,2),
  time_spent INTEGER, -- in seconds
  topics_covered TEXT[],
  competencies_addressed TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX idx_curriculum_grade_subject ON curriculum_standards(grade_level, subject);
CREATE INDEX idx_worksheets_user ON worksheets(user_id, generated_at DESC);
CREATE INDEX idx_worksheet_results_user ON worksheet_results(user_id, completed_at DESC);
CREATE INDEX idx_exam_results_user ON exam_results(user_id, completed_at DESC);
CREATE INDEX idx_feedback_reports_user ON feedback_reports(user_id, generated_at DESC);
CREATE INDEX idx_learning_analytics_user_date ON learning_analytics(user_id, date DESC);
CREATE INDEX idx_student_profiles_user ON student_profiles(user_id);

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE curriculum_standards ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_objectives ENABLE ROW LEVEL SECURITY;
ALTER TABLE worksheets ENABLE ROW LEVEL SECURITY;
ALTER TABLE worksheet_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_analytics ENABLE ROW LEVEL SECURITY;

-- Curriculum Standards: Public read access
CREATE POLICY "Curriculum standards are viewable by everyone"
  ON curriculum_standards FOR SELECT
  USING (true);

-- Learning Objectives: Public read access
CREATE POLICY "Learning objectives are viewable by everyone"
  ON learning_objectives FOR SELECT
  USING (true);

-- Worksheets: Users can view and manage their own
CREATE POLICY "Users can view their own worksheets"
  ON worksheets FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own worksheets"
  ON worksheets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own worksheets"
  ON worksheets FOR DELETE
  USING (auth.uid() = user_id);

-- Worksheet Results: Users can view and manage their own
CREATE POLICY "Users can view their own worksheet results"
  ON worksheet_results FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own worksheet results"
  ON worksheet_results FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own worksheet results"
  ON worksheet_results FOR UPDATE
  USING (auth.uid() = user_id);

-- Exam Results: Users can view and manage their own
CREATE POLICY "Users can view their own exam results"
  ON exam_results FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own exam results"
  ON exam_results FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own exam results"
  ON exam_results FOR UPDATE
  USING (auth.uid() = user_id);

-- Feedback Reports: Users can view and manage their own
CREATE POLICY "Users can view their own feedback reports"
  ON feedback_reports FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own feedback reports"
  ON feedback_reports FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Student Profiles: Users can view and manage their own
CREATE POLICY "Users can view their own student profile"
  ON student_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own student profile"
  ON student_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own student profile"
  ON student_profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- Learning Analytics: Users can view and manage their own
CREATE POLICY "Users can view their own learning analytics"
  ON learning_analytics FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own learning analytics"
  ON learning_analytics FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- FUNCTIONS FOR ANALYTICS
-- ============================================

-- Function to calculate average score for a user in a subject
CREATE OR REPLACE FUNCTION get_average_score(
  p_user_id UUID,
  p_subject TEXT,
  p_days INTEGER DEFAULT 30
)
RETURNS NUMERIC AS $$
BEGIN
  RETURN (
    SELECT COALESCE(AVG(score), 0)
    FROM learning_analytics
    WHERE user_id = p_user_id
      AND subject = p_subject
      AND date >= CURRENT_DATE - p_days
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get performance trend
CREATE OR REPLACE FUNCTION get_performance_trend(
  p_user_id UUID,
  p_subject TEXT DEFAULT NULL
)
RETURNS TABLE(date DATE, avg_score NUMERIC) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    la.date,
    AVG(la.score) as avg_score
  FROM learning_analytics la
  WHERE la.user_id = p_user_id
    AND (p_subject IS NULL OR la.subject = p_subject)
    AND la.date >= CURRENT_DATE - 90
  GROUP BY la.date
  ORDER BY la.date ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- SEED DATA: Spanish LOMLOE Curriculum
-- ============================================

-- Matemáticas - 3º Primaria (8-9 years)
INSERT INTO curriculum_standards (grade_level, age_range, subject, competency_code, competency_name, description, learning_goals, evaluation_criteria) VALUES
('3º Primaria', '8-9', 'Matemáticas', 'MAT.3.1', 'Números y operaciones', 'Comprensión y uso de números naturales hasta el 1000, operaciones básicas con sumas, restas y multiplicaciones.', 
  '["Leer y escribir números hasta 1000", "Realizar sumas y restas con llevadas", "Comprender tablas de multiplicar (2, 3, 4, 5, 10)", "Resolver problemas de la vida cotidiana"]'::jsonb,
  '["Identifica números hasta 1000", "Realiza cálculos mentales", "Resuelve problemas con operaciones combinadas"]'::jsonb),

('3º Primaria', '8-9', 'Matemáticas', 'MAT.3.2', 'Medida y geometría', 'Unidades de medida: longitud, masa, capacidad. Figuras geométricas básicas.',
  '["Medir longitudes, pesos y capacidades", "Reconocer y dibujar figuras geométricas", "Comprender el concepto de perímetro"]'::jsonb,
  '["Utiliza unidades de medida correctamente", "Identifica figuras geométricas", "Calcula perímetros simples"]'::jsonb);

-- Lengua - 3º Primaria
INSERT INTO curriculum_standards (grade_level, age_range, subject, competency_code, competency_name, description, learning_goals, evaluation_criteria) VALUES
('3º Primaria', '8-9', 'Lengua Castellana', 'LEN.3.1', 'Comprensión lectora', 'Lectura y comprensión de textos narrativos, descriptivos e informativos.',
  '["Leer textos con fluidez", "Comprender ideas principales", "Responder preguntas sobre el texto", "Ampliar vocabulario"]'::jsonb,
  '["Lee con entonación adecuada", "Identifica personajes y acciones", "Resume textos breves"]'::jsonb),

('3º Primaria', '8-9', 'Lengua Castellana', 'LEN.3.2', 'Ortografía y gramática', 'Reglas ortográficas básicas: uso de mayúsculas, signos de puntuación, palabras con b/v, g/j.',
  '["Aplicar reglas ortográficas básicas", "Usar mayúsculas correctamente", "Identificar sustantivos, adjetivos y verbos"]'::jsonb,
  '["Escribe con correcta ortografía", "Usa signos de puntuación", "Clasifica palabras por categorías gramaticales"]'::jsonb);

-- Ciencias Naturales - 3º Primaria
INSERT INTO curriculum_standards (grade_level, age_range, subject, competency_code, competency_name, description, learning_goals, evaluation_criteria) VALUES
('3º Primaria', '8-9', 'Ciencias Naturales', 'CN.3.1', 'Los seres vivos', 'Características de los seres vivos: animales, plantas. Clasificación y hábitats.',
  '["Clasificar animales vertebrados e invertebrados", "Comprender las funciones vitales", "Conocer hábitats naturales"]'::jsonb,
  '["Identifica tipos de animales", "Explica funciones vitales", "Describe hábitats"]'::jsonb),

('3º Primaria', '8-9', 'Ciencias Naturales', 'CN.3.2', 'El cuerpo humano', 'Partes del cuerpo, órganos principales, hábitos saludables.',
  '["Conocer órganos y sistemas principales", "Practicar hábitos de higiene", "Comprender la importancia de la alimentación"]'::jsonb,
  '["Identifica órganos principales", "Explica hábitos saludables", "Reconoce alimentos nutritivos"]'::jsonb);

-- Matemáticas - 1º ESO (12-13 years)
INSERT INTO curriculum_standards (grade_level, age_range, subject, competency_code, competency_name, description, learning_goals, evaluation_criteria) VALUES
('1º ESO', '12-13', 'Matemáticas', 'MAT.ESO1.1', 'Números enteros y racionales', 'Operaciones con números enteros, fracciones y decimales. Proporcionalidad.',
  '["Realizar operaciones con enteros", "Simplificar y operar con fracciones", "Resolver problemas de proporcionalidad", "Trabajar con porcentajes"]'::jsonb,
  '["Opera correctamente con enteros y fracciones", "Resuelve problemas de proporcionalidad", "Calcula porcentajes"]'::jsonb),

('1º ESO', '12-13', 'Matemáticas', 'MAT.ESO1.2', 'Álgebra básica', 'Introducción al álgebra: expresiones algebraicas, ecuaciones de primer grado.',
  '["Comprender el concepto de variable", "Simplificar expresiones algebraicas", "Resolver ecuaciones de primer grado"]'::jsonb,
  '["Trabaja con expresiones algebraicas", "Resuelve ecuaciones sencillas", "Aplica álgebra a problemas"]'::jsonb);

-- Lengua - 1º ESO
INSERT INTO curriculum_standards (grade_level, age_range, subject, competency_code, competency_name, description, learning_goals, evaluation_criteria) VALUES
('1º ESO', '12-13', 'Lengua Castellana', 'LEN.ESO1.1', 'Análisis de textos', 'Análisis de textos literarios y no literarios. Tipología textual.',
  '["Identificar tipos de textos", "Analizar estructura textual", "Comprender recursos literarios", "Producir textos coherentes"]'::jsonb,
  '["Distingue tipos de textos", "Identifica figuras literarias", "Redacta textos bien estructurados"]'::jsonb);

COMMIT;
