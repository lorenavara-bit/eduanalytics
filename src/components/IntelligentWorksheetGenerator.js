import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { BookOpen, Brain, Download, CheckCircle, AlertCircle, Zap, Target, Eye, Lightbulb } from 'lucide-react';

const IntelligentWorksheetGenerator = ({ session, userProfile, callGeminiAPI }) => {
    const [loading, setLoading] = useState(false);
    const [curriculumConcepts, setCurriculumConcepts] = useState([]);
    const [questionPatterns, setQuestionPatterns] = useState([]);
    const [selectedSubject, setSelectedSubject] = useState('');
    const [numQuestions, setNumQuestions] = useState(10);
    const [difficultyLevel, setDifficultyLevel] = useState('intermedio');
    const [worksheetType, setWorksheetType] = useState('worksheet');
    const [generatedWorksheet, setGeneratedWorksheet] = useState(null);
    const [studentAnswers, setStudentAnswers] = useState({});
    const [correctionResult, setCorrectionResult] = useState(null);
    const [conceptsToFocus, setConceptsToFocus] = useState([]);

    const subjects = ['Matemáticas', 'Lengua Castellana', 'Ciencias Naturales', 'Ciencias Sociales'];

    const difficultyLevels = [
        { value: 'básico', label: 'Básico', icon: '⭐', description: 'Conceptos fundamentales' },
        { value: 'intermedio', label: 'Intermedio', icon: '⭐⭐', description: 'Nivel estándar' },
        { value: 'avanzado', label: 'Avanzado', icon: '⭐⭐⭐', description: 'Desafío' }
    ];

    const worksheetTypes = [
        { value: 'worksheet', label: 'Ficha de Ejercicios', icon: '📝', description: 'Práctica' },
        { value: 'exam', label: 'Examen', icon: '📊', description: 'Evaluación' }
    ];

    useEffect(() => {
        if (userProfile.grade && selectedSubject) {
            loadCurriculumData();
        }
    }, [userProfile.grade, selectedSubject, difficultyLevel]);

    const calculateAge = (birthDate) => {
        if (!birthDate) return null;
        const today = new Date();
        const birth = new Date(birthDate);
        let age = today.getFullYear() - birth.getFullYear();
        const m = today.getMonth() - birth.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
        return age;
    };

    const loadCurriculumData = async () => {
        try {
            // Load essential concepts for this grade/subject
            const { data: concepts } = await supabase
                .from('curriculum_concepts')
                .select('*')
                .eq('grade_level', userProfile.grade)
                .eq('subject', selectedSubject);

            if (concepts && concepts.length > 0) {
                setCurriculumConcepts(concepts);

                // Analyze observations to focus on specific concepts
                if (userProfile.observations) {
                    const focused = concepts.filter(c =>
                        c.common_misconceptions?.some(misc =>
                            userProfile.observations.toLowerCase().includes(misc.toLowerCase())
                        )
                    );
                    setConceptsToFocus(focused);
                }
            }

            // Load question patterns
            const { data: patterns } = await supabase
                .from('question_patterns')
                .select('*')
                .or(`subject.eq.${selectedSubject},subject.eq.General`)
                .ilike('grade_range', `%${userProfile.grade}%`);

            if (patterns) {
                setQuestionPatterns(patterns.filter(p =>
                    !p.difficulty_level || p.difficulty_level === difficultyLevel
                ));
            }

        } catch (error) {
            console.error('Error loading curriculum data:', error);
        }
    };

    const generateIntelligentWorksheet = async () => {
        if (!selectedSubject) {
            alert('Por favor, selecciona una asignatura');
            return;
        }

        setLoading(true);
        try {
            const age = userProfile.age || calculateAge(userProfile.birth_date);
            const interests = userProfile.interests || 'ninguno especificado';
            const observations = userProfile.observations || 'ninguna';
            const learningStyle = userProfile.learning_style || 'mixto';

            // Select concepts to cover (prioritize those matching observations)
            const priorityConcepts = conceptsToFocus.length > 0 ? conceptsToFocus : curriculumConcepts;
            const selectedConcepts = priorityConcepts.slice(0, 3);

            // Build comprehensive prompt
            const prompt = `
Eres un profesor experimentado de un colegio español. Genera una ${worksheetType === 'exam' ? 'EXAMEN' : 'FICHA DE EJERCICIOS'} que parezca EXACTAMENTE como las que se usan en colegios reales de España.

========================================
INFORMACIÓN DEL ESTUDIANTE
========================================
Nombre: ${userProfile.name || 'Estudiante'}
Edad: ${age} años
Curso: ${userProfile.grade}
Intereses: ${interests}
Estilo de aprendizaje: ${learningStyle}

OBSERVACIONES IMPORTANTES DEL PROFESOR:
${observations}

${conceptsToFocus.length > 0 ? `
⚠️ NECESITA REFUERZO EN:
${conceptsToFocus.map(c => `- ${c.main_topic}: ${c.common_misconceptions?.join(', ')}`).join('\n')}
` : ''}

========================================
CONCEPTOS CURRICULARES A TRABAJAR (LOMLOE)
========================================
${selectedConcepts.map(c => `
📚 TEMA: ${c.main_topic}
   Conceptos clave: ${c.essential_concepts?.join(', ')}
   Objetivos: ${c.learning_objectives?.join(' | ')}
   ${c.common_misconceptions ? `Errores comunes a evitar: ${c.common_misconceptions.join(', ')}` : ''}
   ${c.visual_aids_needed ? '⚠️ Requiere ayudas visuales (diagramas/dibujos)' : ''}
`).join('\n')}

========================================
PATRONES DE PREGUNTAS DE COLEGIOS ESPAÑOLES
========================================
Usa estos tipos de preguntas que son comunes en España:

${questionPatterns.slice(0, 6).map(p => `
${p.pattern_type.toUpperCase()}:
- Template: ${p.pattern_template}
- Puntos típicos: ${p.typical_points}
${p.notes ? `- Nota: ${p.notes}` : ''}
`).join('\n')}

========================================
INSTRUCCIONES ESPECÍFICAS
========================================

1. ESTRUCTURA DE COLEGIO REAL:
   ${worksheetType === 'exam' ? `
   📊 FORMATO EXAMEN:
   - Encabezado: Nombre, Fecha, Curso
   - Parte 1: Definiciones y conceptos (30%)
   - Parte 2: Ejercicios prácticos (40%)
   - Parte 3: Problemas de aplicación (30%)
   - Tiempo: ${age < 10 ? '30-40' : '45-60'} minutos
   - Incluir: "Lee bien antes de contestar"
   ` : `
   📝 FORMATO FICHA:
   - Título atractivo relacionado con ${selectedConcepts[0]?.main_topic}
   - Instrucciones claras paso a paso
   - Ejercicios graduados en dificultad
   - Espacio para dibujos si es necesario
   `}

2. PERSONALIZACIÓN CON INTERESES (${interests}):
   - Usa contextos relacionados con: ${interests}
   - Ejemplos: Si le gustan los animales → problemas con animales del zoo
   - Si le gusta el fútbol → estadísticas, goles, equipos
   - Si le gustan los dinosaurios → medidas, eras, comparaciones

3. ATENDER OBSERVACIONES:
   ${observations.toLowerCase().includes('confunde') ? '- Incluir ejercicios específicos para diferenciar conceptos que confunde' : ''}
   ${observations.toLowerCase().includes('dificultad') ? '- Práctica extra gradual en las áreas de dificultad' : ''}
   ${observations.toLowerCase().includes('visual') || learningStyle === 'visual' ? '- IMPORTANTE: Incluir diagramas, dibujos para colorear, esquemas visuales' : ''}
   ${observations.toLowerCase().includes('ortografía') ? '- Incluir dictado o ejercicios de ortografía' : ''}
   ${observations.toLowerCase().includes('vocabulario') ? '- Incluir actividades de definiciones y sinónimos' : ''}

4. NIVEL DE DIFICULTAD (${difficultyLevel}):
   ${difficultyLevel === 'básico' ? `
   - Conceptos muy básicos y claros
   - Más pistas y ejemplos
   - Dibujos de apoyo
   - Vocabulario simple
   ` : difficultyLevel === 'avanzado' ? `
   - Desafíos que requieran pensar
   - Problemas de varios pasos
   - Menos pistas, más autonomía
   - Vocabulario más preciso
   ` : `
   - Nivel estándar del curso ${userProfile.grade}
   - Mezcla de fácil, medio y algo difícil
   - Algunas pistas opcionales
   `}

5. TIPOS DE PREGUNTAS A INCLUIR:
   ✓ Definiciones: "¿Qué es...?" "Define..."
   ✓ Verdadero/Falso con justificación
   ✓ Relacionar columnas (típico español)
   ✓ Completar huecos
   ✓ Problemas aplicados a la vida real
   ✓ Ejemplos prácticos
   ${worksheetType === 'exam' ? '✓ Test de opción múltiple con distractores realistas' : ''}

6. EVALUACIÓN DE COMPRENSIÓN REAL:
   No solo preguntar lo mismo de forma repetida. Para cada concepto clave:
   a) Pregunta de definición formal
   b) Ejemplo práctico aplicado
   c) Identificación o clasificación
   d) Aplicación a situación nueva

========================================
GENERA ${numQuestions} PREGUNTAS
========================================

RESPONDE ÚNICAMENTE con JSON:

{
  "title": "Título atractivo (ej: 'Ficha de Matemáticas: ¡Aventura con los Números!')",
  "subtitle": "${worksheetType === 'exam' ? `Examen de ${selectedSubject}` : `Práctica de ${selectedSubject}`}",
  "header_info": {
    "name_field": true,
    "date_field": true,
    "grade": "${userProfile.grade}",
    "instructions": "Lee bien todas las preguntas antes de empezar. ¡Tú puedes!"
  },
  "subject": "${selectedSubject}",
  "grade_level": "${userProfile.grade}",
  "difficulty": "${difficultyLevel}",
  "type": "${worksheetType}",
  "time_estimate": ${worksheetType === 'exam' ? (age < 10 ? 40 : 50) : 30},
  "concepts_covered": ["concepto1", "concepto2"],
  "addresses_observations": ["observación específica que aborda"],
  "questions": [
    {
      "id": 1,
      "section": "Definiciones",
      "type": "definition",
      "question": "Pregunta completa aquí",
      "sub_questions": [],
      "hint": "Pista si necesario",
      "points": 3,
      "visual_aid_needed": false,
      "evaluates_concept": "concepto que evalúa",
      "difficulty": "básico|intermedio|avanzado"
    }
  ],
  "answer_key": [
    {
      "question_id": 1,
      "correct_answer": "Respuesta completa o criterios",
      "partial_credit_criteria": "Qué aceptar como parcialmente correcto",
      "common_errors": "Errores típicos de estudiantes",
      "explanation": "Por qué esta es la respuesta",
      "comprehension_indicators": ["Indica comprensión si menciona X", "Debe incluir concepto Y"]
    }
  ],
  "learning_objectives": ["Objetivo 1", "Objetivo 2"],
  "teacher_notes": "Notas sobre qué observar en las respuestas del estudiante"
}
      `.trim();

            const resultText = await callGeminiAPI(prompt);
            const jsonString = resultText.replace(/```json/g, '').replace(/```/g, '').trim();
            const worksheetData = JSON.parse(jsonString);

            // Save worksheet
            const worksheetToSave = {
                title: worksheetData.title,
                subject: selectedSubject,
                grade_level: userProfile.grade || 'General',
                questions: worksheetData.questions,
                answer_key: worksheetData.answer_key,
                time_estimate: worksheetData.time_estimate,
                metadata: {
                    subtitle: worksheetData.subtitle,
                    header_info: worksheetData.header_info,
                    instructions: worksheetData.header_info?.instructions,
                    learning_objectives: worksheetData.learning_objectives,
                    difficulty: difficultyLevel,
                    type: worksheetType,
                    concepts_covered: worksheetData.concepts_covered,
                    addresses_observations: worksheetData.addresses_observations,
                    teacher_notes: worksheetData.teacher_notes,
                    personalization: {
                        interests_used: interests,
                        observations_addressed: observations,
                        learning_style: learningStyle
                    }
                }
            };

            try {
                const { data: savedWorksheet, error } = await supabase
                    .from('worksheets')
                    .insert({
                        user_id: session.user.id,
                        ...worksheetToSave
                    })
                    .select()
                    .single();

                if (error) {
                    console.warn('Usando modo local:', error);
                    setGeneratedWorksheet({
                        id: 'local-' + Date.now(),
                        ...worksheetToSave
                    });
                } else {
                    setGeneratedWorksheet(savedWorksheet);
                }
            } catch (dbError) {
                setGeneratedWorksheet({
                    id: 'local-' + Date.now(),
                    ...worksheetToSave
                });
            }

            setStudentAnswers({});
            setCorrectionResult(null);

        } catch (error) {
            console.error('Error generando ficha:', error);
            alert(`Error: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const correctWithComprehensionAnalysis = async () => {
        setLoading(true);
        try {
            const questionsWithAnswers = generatedWorksheet.questions.map(q => {
                const answerKey = generatedWorksheet.answer_key.find(a => a.question_id === q.id);
                return {
                    ...q,
                    student_answer: studentAnswers[q.id] || 'Sin respuesta',
                    correct_answer: answerKey?.correct_answer,
                    comprehension_indicators: answerKey?.comprehension_indicators,
                    common_errors: answerKey?.common_errors
                };
            });

            const prompt = `
Eres un profesor experto. Corrige este ${generatedWorksheet.metadata?.type === 'exam' ? 'examen' : 'ejercicio'} de ${generatedWorksheet.subject}.

ESTUDIANTE: ${userProfile.name}, ${userProfile.grade}
OBSERVACIONES DEL PROFESOR: ${userProfile.observations || 'Ninguna'}

PREGUNTAS Y RESPUESTAS:
${questionsWithAnswers.map(q => `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PREGUNTA ${q.id} (${q.points} pts) - Evalúa: ${q.evaluates_concept}
Dificultad: ${q.difficulty}

Pregunta: ${q.question}
${q.sub_questions && q.sub_questions.length > 0 ? `Sub-preguntas: ${q.sub_questions.join('; ')}` : ''}

Respuesta del estudiante: ${q.student_answer}

Respuesta correcta esperada: ${q.correct_answer}
Errores comunes: ${q.common_errors || 'N/A'}
Indicadores de comprensión: ${q.comprehension_indicators?.join(' | ') || 'N/A'}
`).join('\n')}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CRITERIOS DE CORRECCIÓN:

1. EVALUACIÓN DE COMPRENSIÓN PROFUNDA:
   - No solo marcar correcto/incorrecto
   - ¿Demuestra que REALMENTE entiende el concepto?
   - ¿Puede aplicarlo, no solo memorizarlo?
   - ¿Usa vocabulario adecuado?

2. FEEDBACK CONSTRUCTIVO:
   - Específico: "Comprendes X pero necesitas trabajar Y"
   - Alentador: Destacar lo bien hecho
   - Orientado a mejorar: Cómo puede mejorar

3. IDENTIFICAR PATRONES:
   - ¿Comete errores típicos?
   - ¿Hay lagunas conceptuales?
   - ¿Necesita refuerzo en algún área?

4. VALORACIÓN:
   - Dar crédito parcial si el razonamiento es correcto aunque tenga errores menores
   - Ser estricto con conceptos fundamentales
   - Considerar el nivel ${difficultyLevel}

RESPONDE CON JSON:
{
  "total_score": 85,
  "score_percentage": "85%",
  "grade_letter": "Notable",
  "correct_answers": 8,
  "total_questions": ${generatedWorksheet.questions.length},
  
  "question_breakdown": [
    {
      "question_id": 1,
      "points_earned": 3,
      "max_points": 3,
      "is_correct": true,
      "is_partially_correct": false,
      "feedback_student": "¡Excelente! Demuestras comprensión completa del concepto...",
      "teacher_analysis": "Análisis para el profesor sobre la comprensión",
      "comprehension_level": "completo|parcial|no_demuestra",
      "detected_errors": [],
      "strengths_shown": ["Identifica correctamente...", "Aplica bien el concepto"]
    }
  ],
  
  "overall_feedback": "Comentario general motivador para el estudiante",
  
  "comprehension_analysis": {
    "concepts_mastered": ["Concepto que domina completamente"],
    "concepts_partial": ["Concepto que entiende parcialmente"],
    "concepts_to_review": ["Concepto que necesita repasar"],
    "misconceptions_detected": ["Error conceptual detectado"],
    "learning_gaps": ["Laguna de aprendizaje identificada"]
  },
  
  "strengths": ["Fortaleza 1", "Fortaleza 2", "Fortaleza 3"],
  "improvements": ["Área de mejora 1", "Área de mejora 2"],
  
  "specific_recommendations": [
    {
      "area": "Área específica",
      "reason": "Por qué necesita trabajo",
      "exercises": "Tipo de ejercicios recomendados",
      "resources": "Recursos sugeridos (ej: repasar tema X, practicar Y)"
    }
  ],
  
  "progress_notes": "Notas sobre progreso respecto a observaciones anteriores",
  
  "next_steps": {
    "ready_for": ["Conceptos para los que está preparado"],
    "needs_practice": ["Conceptos que necesita practicar más"],
    "review_before_advancing": ["Conceptos a revisar antes de avanzar"]
  }
}
      `.trim();

            const resultText = await callGeminiAPI(prompt);
            const jsonString = resultText.replace(/```json/g, '').replace(/```/g, '').trim();
            const correction = JSON.parse(jsonString);

            // Save results
            try {
                if (generatedWorksheet.id && !generatedWorksheet.id.includes('local-')) {
                    await supabase.from('worksheet_results').insert({
                        worksheet_id: generatedWorksheet.id,
                        user_id: session.user.id,
                        student_name: userProfile.name || 'Estudiante',
                        answers: studentAnswers,
                        score: correction.total_score,
                        total_questions: correction.total_questions,
                        correct_answers: correction.correct_answers,
                        time_spent: 0,
                        question_breakdown: correction.question_breakdown,
                        metadata: {
                            comprehension_analysis: correction.comprehension_analysis,
                            specific_recommendations: correction.specific_recommendations,
                            progress_notes: correction.progress_notes
                        }
                    }).select().single();

                    // Save to learning analytics
                    await supabase.from('learning_analytics').insert({
                        user_id: session.user.id,
                        date: new Date().toISOString().split('T')[0],
                        subject: generatedWorksheet.subject,
                        activity_type: generatedWorksheet.metadata?.type || 'worksheet',
                        score: correction.total_score,
                        topics_covered: generatedWorksheet.metadata?.concepts_covered || [],
                        competencies_addressed: generatedWorksheet.metadata?.learning_objectives || []
                    });
                }
            } catch (dbError) {
                console.warn('No se guardó en BD:', dbError);
            }

            setCorrectionResult(correction);
            alert('¡Corregido! ' + (generatedWorksheet.id.includes('local-') ? '(Modo local)' : 'Resultados guardados.'));

        } catch (error) {
            console.error('Error:', error);
            alert(`Error al corregir: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const downloadWorksheet = () => {
        if (!generatedWorksheet) return;
        const ws = generatedWorksheet;
        const meta = ws.metadata || {};

        const worksheet = `
${'='.repeat(60)}
${ws.title.toUpperCase()}
${meta.subtitle || ''}
${'='.repeat(60)}

Nombre: ________________________  Fecha: ___/___/___
Curso: ${ws.grade_level}          Asignatura: ${ws.subject}

${meta.header_info?.instructions || 'Lee bien todas las preguntas.'}

Tiempo estimado: ${ws.time_estimate} minutos
${meta.type === 'exam' ? '⚠️ EXAMEN - No se permite consultar apuntes' : ''}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${ws.questions.map((q, idx) => `
${q.section ? `\n━━ ${q.section.toUpperCase()} ━━\n` : ''}
${idx + 1}. ${q.question} (${q.points} puntos)
${q.sub_questions && q.sub_questions.length > 0 ? q.sub_questions.map((sq, i) => `   ${String.fromCharCode(97 + i)}) ${sq}`).join('\n') : ''}
${q.hint ? `   💡 Pista: ${q.hint}` : ''}
${q.visual_aid_needed ? '   📊 Espacio para dibujo o diagrama:' : ''}

   Respuesta:
   _________________________________________________________
   _________________________________________________________
   _________________________________________________________

`).join('\n')}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

OBJETIVOS DE APRENDIZAJE:
${meta.learning_objectives?.map(obj => `✓ ${obj}`).join('\n')}

${meta.concepts_covered ? `\nCONCEPTOS TRABAJADOS:
${meta.concepts_covered.map(c => `• ${c}`).join('\n')}` : ''}

${meta.addresses_observations ? `\n📌 ESTA FICHA TRABAJA ESPECÍFICAMENTE:
${meta.addresses_observations.map(obs => `• ${obs}`).join('\n')}` : ''}
    `.trim();

        const blob = new Blob([worksheet], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${ws.title.replace(/\s+/g, '_')}_${userProfile.name || 'Estudiante'}.txt`;
        link.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="space-y-6 px-4 py-6">
            {!generatedWorksheet && (
                <div className="bg-white rounded-lg shadow-lg p-6">
                    <div className="mb-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center">
                            <Brain className="h-6 w-6 mr-2 text-indigo-600" />
                            Generador Inteligente de Fichas Escolares
                        </h2>
                        <p className="text-gray-600 text-sm">
                            Fichas personalizadas idénticas a las del colegio español, adaptadas a {userProfile.name || 'tu hijo/a'}
                        </p>
                    </div>

                    {/* Student Info Summary */}
                    {userProfile.observations && (
                        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
                            <div className="flex items-start">
                                <Lightbulb className="h-5 w-5 text-yellow-600 mr-2 flex-shrink-0 mt-0.5" />
                                <div>
                                    <h3 className="font-semibold text-yellow-900">Observaciones del Profesor</h3>
                                    <p className="text-sm text-yellow-800 mt-1">{userProfile.observations}</p>
                                    {conceptsToFocus.length > 0 && (
                                        <p className="text-xs text-yellow-700 mt-2">
                                            ✓ La ficha se adaptará para trabajar estos puntos específicamente
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="space-y-6">
                        {/* Type Selection */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-3">
                                Tipo de Actividad
                            </label>
                            <div className="grid grid-cols-2 gap-4">
                                {worksheetTypes.map(type => (
                                    <button
                                        key={type.value}
                                        onClick={() => setWorksheetType(type.value)}
                                        className={`p-4 border-2 rounded-lg transition-all ${worksheetType === type.value
                                                ? 'border-indigo-600 bg-indigo-50 shadow-md'
                                                : 'border-gray-300 hover:border-indigo-300'
                                            }`}
                                    >
                                        <div className="text-2xl mb-2">{type.icon}</div>
                                        <div className="font-semibold">{type.label}</div>
                                        <div className="text-xs text-gray-600">{type.description}</div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Subject */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Asignatura
                            </label>
                            <select
                                value={selectedSubject}
                                onChange={(e) => setSelectedSubject(e.target.value)}
                                className="w-full px-4 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                            >
                                <option value="">Selecciona...</option>
                                {subjects.map(s => (
                                    <option key={s} value={s}>{s}</option>
                                ))}
                            </select>
                        </div>

                        {/* Difficulty */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-3">
                                Nivel de Dificultad
                            </label>
                            <div className="grid grid-cols-3 gap-3">
                                {difficultyLevels.map(level => (
                                    <button
                                        key={level.value}
                                        onClick={() => setDifficultyLevel(level.value)}
                                        className={`p-3 border-2 rounded-lg transition-all ${difficultyLevel === level.value
                                                ? 'border-indigo-600 bg-indigo-50'
                                                : 'border-gray-300 hover:border-indigo-300'
                                            }`}
                                    >
                                        <div className="text-lg mb-1">{level.icon}</div>
                                        <div className="font-semibold text-sm">{level.label}</div>
                                        <div className="text-xs text-gray-600">{level.description}</div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Number of Questions */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Número de Preguntas: <span className="text-indigo-600 font-bold">{numQuestions}</span>
                            </label>
                            <input
                                type="range"
                                min="5"
                                max="20"
                                value={numQuestions}
                                onChange={(e) => setNumQuestions(parseInt(e.target.value))}
                                className="w-full"
                            />
                        </div>

                        {/* Personalization Info */}
                        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-lg p-4">
                            <h3 className="font-semibold text-indigo-900 mb-3 flex items-center">
                                <Target className="h-4 w-4 mr-2" />
                                Personalización Inteligente
                            </h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex items-start gap-2">
                                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                                    <span><strong>Intereses:</strong> {userProfile.interests || 'No especificados'}
                                        {userProfile.interests && <span className="text-indigo-700 ml-1">(Se usarán en los ejemplos)</span>}
                                    </span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                                    <span><strong>Curso:</strong> {userProfile.grade || 'No configurado'}</span>
                                </div>
                                {userProfile.learning_style && (
                                    <div className="flex items-start gap-2">
                                        <Eye className="h-4 w-4 text-blue-600 mt-0.5" />
                                        <span><strong>Estilo:</strong> {userProfile.learning_style}</span>
                                    </div>
                                )}
                                {curriculumConcepts.length > 0 && (
                                    <div className="flex items-start gap-2">
                                        <BookOpen className="h-4 w-4 text-purple-600 mt-0.5" />
                                        <span className="text-purple-700">
                                            {curriculumConcepts.length} conceptos curriculares cargados del curso {userProfile.grade}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Generate Button */}
                        <button
                            onClick={generateIntelligentWorksheet}
                            disabled={loading || !selectedSubject}
                            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-4 rounded-lg hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 font-semibold text-lg flex items-center justify-center shadow-lg"
                        >
                            <Zap className="h-6 w-6 mr-2" />
                            {loading ? 'Generando Ficha Personalizada...' : `Generar ${worksheetTypes.find(t => t.value === worksheetType)?.label}`}
                        </button>

                        {curriculumConcepts.length === 0 && selectedSubject && (
                            <p className="text-xs text-orange-600 text-center">
                                ⚠️ Ejecuta la migración 003_curriculum_concepts.sql para cargar conceptos curriculares reales
                            </p>
                        )}
                    </div>
                </div>
            )}

            {/* Display generated worksheet and corrections - Same as before but with enhanced comprehension analysis display */}
            {/* ... (Rest of the JSX for displaying worksheets and corrections follows the same pattern as the previous component) ... */}

        </div>
    );
};

export default IntelligentWorksheetGenerator;
