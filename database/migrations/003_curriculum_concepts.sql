-- ============================================
-- CURRICULUM CONCEPTS - Real Spanish School Patterns
-- ============================================

-- Essential concepts by grade/subject with real school question patterns
CREATE TABLE IF NOT EXISTS curriculum_concepts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  grade_level TEXT NOT NULL,
  subject TEXT NOT NULL,
  main_topic TEXT NOT NULL,
  essential_concepts TEXT[] NOT NULL,
  learning_objectives TEXT[],
  common_misconceptions TEXT[],
  example_questions JSONB DEFAULT '[]'::jsonb,
  assessment_criteria TEXT[],
  visual_aids_needed BOOLEAN DEFAULT false,
  practice_exercises_types TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Question patterns used in real Spanish schools
CREATE TABLE IF NOT EXISTS question_patterns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  pattern_type TEXT NOT NULL, -- 'definition', 'true_false', 'matching', 'application', 'multiple_choice', 'short_answer'
  subject TEXT NOT NULL,
  grade_range TEXT NOT NULL,
  pattern_template TEXT NOT NULL,
  difficulty_level TEXT,
  typical_points INTEGER,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Student observations tracking
ALTER TABLE student_profiles 
ADD COLUMN IF NOT EXISTS learning_notes TEXT[],
ADD COLUMN IF NOT EXISTS special_requirements TEXT[],
ADD COLUMN IF NOT EXISTS diagnosed_difficulties TEXT[],
ADD COLUMN IF NOT EXISTS learning_style TEXT; -- 'visual', 'auditivo', 'kinestésico', 'mixto'

-- Indexes
CREATE INDEX idx_curriculum_concepts_grade_subject ON curriculum_concepts(grade_level, subject);
CREATE INDEX idx_question_patterns_type ON question_patterns(pattern_type, subject);

-- RLS Policies
ALTER TABLE curriculum_concepts ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_patterns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Curriculum concepts are viewable by everyone"
  ON curriculum_concepts FOR SELECT
  USING (true);

CREATE POLICY "Question patterns are viewable by everyone"
  ON question_patterns FOR SELECT
  USING (true);

-- ============================================
-- SEED DATA: Essential Concepts by Grade
-- ============================================

-- MATEMÁTICAS - 1º y 2º PRIMARIA (6-8 años)
INSERT INTO curriculum_concepts 
  (grade_level, subject, main_topic, essential_concepts, learning_objectives, common_misconceptions, example_questions, visual_aids_needed, practice_exercises_types)
VALUES
  ('1º Primaria', 'Matemáticas', 'Números hasta 99', 
   ARRAY['número', 'suma', 'resta', 'unidad', 'decena', 'par', 'impar'],
   ARRAY['Contar hasta 99', 'Sumar y restar números de dos cifras', 'Identificar unidades y decenas'],
   ARRAY['Confunden el valor posicional', 'Piensan que el número mayor siempre tiene más cifras'],
   '[{"type": "definition", "text": "¿Qué es una decena?"}, {"type": "application", "text": "Si tienes 23 caramelos y te dan 15 más, ¿cuántos tienes?"}]'::jsonb,
   true,
   ARRAY['conteo', 'sumas con llevadas', 'restas sin llevar', 'ordenar números']),

  ('2º Primaria', 'Matemáticas', 'Números hasta 999',
   ARRAY['centena', 'número de tres cifras', 'suma con llevadas', 'resta con llevadas', 'doble', 'mitad'],
   ARRAY['Comprender las centenas', 'Sumar y restar con llevadas', 'Resolver problemas de dos pasos'],
   ARRAY['Confunden centenas con decenas', 'No entienden el concepto de llevar'],
   '[{"type": "definition", "text": "¿Qué es una centena? ¿Cuántas decenas tiene?"}, {"type": "problem", "text": "En una granja hay 235 animales. Si nacen 120 más, ¿cuántos hay ahora?"}]'::jsonb,
   true,
   ARRAY['valor posicional', 'sumas de 3 cifras', 'problemas con dibujos']);

-- MATEMÁTICAS - 3º y 4º PRIMARIA (8-10 años)
INSERT INTO curriculum_concepts 
  (grade_level, subject, main_topic, essential_concepts, learning_objectives, common_misconceptions, example_questions, visual_aids_needed)
VALUES
  ('3º Primaria', 'Matemáticas', 'Multiplicación y División',
   ARRAY['multiplicación', 'división', 'tabla de multiplicar', 'múltiplo', 'divisor', 'resto'],
   ARRAY['Memorizar tablas del 2 al 10', 'Resolver multiplicaciones de 2 cifras', 'Dividir con resto'],
   ARRAY['Confunden multiplicación con suma', 'Olvidan el resto en divisiones', 'No memorizan las tablas'],
   '[{"type": "definition", "text": "¿Qué es multiplicar?"}, {"type": "tables", "text": "Completa: 7 x 8 = ___"}, {"type": "problem", "text": "Si cada caja tiene 6 lápices y tienes 9 cajas, ¿cuántos lápices tienes en total?"}]'::jsonb,
   true),

  ('3º Primaria', 'Matemáticas', 'Geometría básica',
   ARRAY['línea', 'recta', 'ángulo', 'triángulo', 'cuadrado', 'círculo', 'perímetro'],
   ARRAY['Identificar figuras geométricas', 'Calcular perímetros simples', 'Reconocer tipos de ángulos'],
   ARRAY['Confunden perímetro con área', 'No saben usar la regla correctamente'],
   '[{"type": "identification", "text": "Dibuja un triángulo y señala sus lados"}, {"type": "calculation", "text": "Calcula el perímetro de un cuadrado de lado 5 cm"}]'::jsonb,
   true),

  ('4º Primaria', 'Matemáticas', 'Fracciones',
   ARRAY['fracción', 'numerador', 'denominador', 'fracción propia', 'fracción impropia', 'equivalente'],
   ARRAY['Comprender qué es una fracción', 'Identificar fracciones', 'Comparar fracciones simples'],
   ARRAY['Piensan que el denominador mayor significa fracción mayor', 'Confunden numerador y denominador'],
   '[{"type": "definition", "text": "¿Qué es una fracción? ¿Qué representa el numerador y el denominador?"}, {"type": "visual", "text": "Colorea 3/4 de este círculo"}, {"type": "comparison", "text": "¿Qué es mayor: 1/2 o 1/4? Explica por qué"}]'::jsonb,
   true);

-- LENGUA CASTELLANA
INSERT INTO curriculum_concepts 
  (grade_level, subject, main_topic, essential_concepts, learning_objectives, common_misconceptions, example_questions, visual_aids_needed)
VALUES
  ('2º Primaria', 'Lengua Castellana', 'Clases de palabras',
   ARRAY['sustantivo', 'verbo', 'adjetivo', 'artículo'],
   ARRAY['Identificar sustantivos', 'Reconocer verbos', 'Usar adjetivos'],
   ARRAY['Confunden sustantivo con adjetivo', 'No entienden que el verbo es acción'],
   '[{"type": "definition", "text": "¿Qué es un sustantivo? Da tres ejemplos"}, {"type": "identification", "text": "Subraya los verbos de esta frase: El perro corre en el parque"}, {"type": "application", "text": "Escribe 5 adjetivos que describan a tu animal favorito"}]'::jsonb,
   false),

  ('3º Primaria', 'Lengua Castellana', 'Análisis sintáctico básico',
   ARRAY['sujeto', 'predicado', 'oración', 'frase'],
   ARRAY['Identificar el sujeto', 'Identificar el predicado', 'Construir oraciones completas'],
   ARRAY['Confunden sujeto con la primera palabra', 'Piensan que el sujeto siempre es una persona'],
   '[{"type": "definition", "text": "¿Qué es el sujeto de una oración?"}, {"type": "identification", "text": "Señala el sujeto: Los niños juegan en el parque"}, {"type": "creation", "text": "Escribe tres oraciones con sujeto y predicado claros"}]'::jsonb,
   false),

  ('3º Primaria', 'Lengua Castellana', 'Ortografía',
   ARRAY['mayúscula', 'punto', 'coma', 'b/v', 'g/j', 'h'],
   ARRAY['Usar mayúsculas correctamente', 'Aplicar reglas de b/v', 'No olvidar la h'],
   ARRAY['Confunden b con d', 'Olvidan la h', 'No usan mayúscula después de punto'],
   '[{"type": "rule", "text": "Escribe la regla: ¿Cuándo se usa b?"}, {"type": "dictation", "text": "Dictado de 10 palabras con b/v"}, {"type": "correction", "text": "Corrige estas oraciones que tienen errores"}]'::jsonb,
   false);

-- CIENCIAS NATURALES
INSERT INTO curriculum_concepts 
  (grade_level, subject, main_topic, essential_concepts, learning_objectives, common_misconceptions, example_questions, visual_aids_needed)
VALUES
  ('3º Primaria', 'Ciencias Naturales', 'Los seres vivos',
   ARRAY['ser vivo', 'animal', 'planta', 'función vital', 'nutrición', 'reproducción', 'relación'],
   ARRAY['Diferenciar seres vivos de inertes', 'Conocer las funciones vitales', 'Clasificar animales'],
   ARRAY['Piensan que sólo los que se mueven son seres vivos', 'Confunden reproducción con crecimiento'],
   '[{"type": "definition", "text": "¿Qué es un ser vivo? ¿Qué lo diferencia de un objeto?"}, {"type": "classification", "text": "Clasifica estos en vivos/inertes: perro, piedra, árbol, agua"}, {"type": "functions", "text": "Nombra las tres funciones vitales y explica cada una"}]'::jsonb,
   true),

  ('3º Primaria', 'Ciencias Naturales', 'Estados de la materia',
   ARRAY['sólido', 'líquido', 'gas', 'materia', 'cambio de estado'],
   ARRAY['Identificar los tres estados', 'Dar ejemplos de cada estado', 'Entender los cambios de estado'],
   ARRAY['Confunden gas con aire', 'Piensan que el hielo no es agua'],
   '[{"type": "definition", "text": "¿Qué es un líquido? ¿Qué características tiene?"}, {"type": "examples", "text": "Da 5 ejemplos de sólidos que encuentres en tu casa"}, {"type": "changes", "text": "¿Qué pasa cuando calentamos hielo? ¿Cómo se llama ese proceso?"}]'::jsonb,
   true);

-- ============================================
-- SEED DATA: Question Patterns (Real Spanish Schools)
-- ============================================

INSERT INTO question_patterns (pattern_type, subject, grade_range, pattern_template, difficulty_level, typical_points, notes)
VALUES
  -- Definiciones (común en todos los niveles)
  ('definition', 'General', '1º-6º Primaria', '¿Qué es {concept}?', 'básico', 2, 'Pedir definición simple'),
  ('definition', 'General', '1º-6º Primaria', 'Define con tus propias palabras qué es {concept}', 'intermedio', 3, 'Comprobar comprensión real'),
  ('definition', 'General', '3º-6º Primaria', 'Explica la diferencia entre {concept1} y {concept2}', 'intermedio', 4, 'Requiere comprensión comparativa'),

  -- Verdadero/Falso con justificación
  ('true_false', 'General', '2º-6º Primaria', 'Verdadero o Falso: {statement}. Justifica tu respuesta.', 'intermedio', 3, 'Deben explicar el por qué'),

  -- Relacionar columnas (muy común en España)
  ('matching', 'General', '2º-6º Primaria', 'Relaciona cada {item_type} de la columna A con su {property} en la columna B', 'básico', 5, 'Típico de colegios españoles'),

  -- Problemas aplicados (Matemáticas)
  ('application', 'Matemáticas', '1º-6º Primaria', 'En {context}, si {situation}, ¿{question}?', 'intermedio', 5, 'Problema de la vida real'),
  ('application', 'Matemáticas', '3º-6º Primaria', 'Resuelve este problema de dos pasos: {complex_situation}', 'avanzado', 8, 'Requiere planificación'),

  -- Completar huecos (fill in the blank)
  ('fill_blank', 'General', '1º-6º Primaria', 'Completa: {sentence_with_blanks}', 'básico', 2, 'Evalúa vocabulario'),

  -- Identificación en imágenes
  ('image_identification', 'Ciencias', '1º-6º Primaria', 'Observa la imagen y señala {elements_to_find}', 'básico', 3, 'Requiere material visual'),

  -- Test multiple choice (con distractores realistas)
  ('multiple_choice', 'General', '3º-6º Primaria', '{question} a) {option1} b) {option2} c) {option3} d) {option4}', 'intermedio', 2, 'Distractores deben ser plausibles'),

  -- Desarrollo corto
  ('short_essay', 'General', '4º-6º Primaria', 'Explica brevemente (3-5 líneas) {topic}', 'avanzado', 5, 'Evalúa comprensión profunda'),

  -- Ejemplos prácticos
  ('examples', 'General', '1º-6º Primaria', 'Da {number} ejemplos de {concept}', 'básico', 3, 'Verificar si reconoce el concepto'),

  -- Análisis (Lengua)
  ('analysis', 'Lengua Castellana', '3º-6º Primaria', 'Analiza esta frase: {sentence}. Indica {elements_to_analyze}', 'avanzado', 6, 'Análisis sintáctico/morfológico'),

  -- Ordenar/Secuenciar
  ('ordering', 'Ciencias', '2º-6º Primaria', 'Ordena estos pasos del proceso de {process}', 'intermedio', 4, 'Comprensión de secuencias'),

  -- Clasificación
  ('classification', 'Ciencias', '2º-6º Primaria', 'Clasifica estos {items} según {criteria}', 'intermedio', 5, 'Pensamiento categórico');

-- ============================================
-- FUNCTIONS FOR INTELLIGENT WORKSHEET GENERATION
-- ============================================

-- Function to get appropriate concepts for a student
CREATE OR REPLACE FUNCTION get_student_concepts(
  p_grade_level TEXT,
  p_subject TEXT,
  p_observations TEXT[] DEFAULT NULL
)
RETURNS TABLE(
  concept_id UUID,
  main_topic TEXT,
  essential_concepts TEXT[],
  needs_visual_aids BOOLEAN,
  addresses_misconception TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cc.id,
    cc.main_topic,
    cc.essential_concepts,
    cc.visual_aids_needed,
    CASE 
      WHEN p_observations IS NOT NULL AND 
           EXISTS (
             SELECT 1 FROM unnest(cc.common_misconceptions) AS misconception
             WHERE EXISTS (
               SELECT 1 FROM unnest(p_observations) AS obs
               WHERE obs ILIKE '%' || misconception || '%'
             )
           )
      THEN 'Addresses specific difficulty'
      ELSE NULL
    END AS addresses_misconception
  FROM curriculum_concepts cc
  WHERE cc.grade_level = p_grade_level
    AND cc.subject = p_subject
  ORDER BY 
    CASE WHEN addresses_misconception IS NOT NULL THEN 0 ELSE 1 END,
    RANDOM()
  LIMIT 5;
END;
$$ LANGUAGE plpgsql;

-- Function to get question patterns for a worksheet
CREATE OR REPLACE FUNCTION get_question_patterns_for_worksheet(
  p_subject TEXT,
  p_grade_level TEXT,
  p_difficulty TEXT DEFAULT 'intermedio',
  p_num_patterns INTEGER DEFAULT 5
)
RETURNS TABLE(
  pattern_type TEXT,
  pattern_template TEXT,
  typical_points INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    qp.pattern_type,
    qp.pattern_template,
    qp.typical_points
  FROM question_patterns qp
  WHERE (qp.subject = p_subject OR qp.subject = 'General')
    AND qp.grade_range LIKE '%' || p_grade_level || '%'
    AND (qp.difficulty_level = p_difficulty OR qp.difficulty_level IS NULL)
  ORDER BY RANDOM()
  LIMIT p_num_patterns;
END;
$$ LANGUAGE plpgsql;

COMMIT;
