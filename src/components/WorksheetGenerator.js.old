standard = {
    id: 'fallback',
    ...fallbackCurriculum[selectedSubject],
    grade_level: userProfile.grade || 'General',
    subject: selectedSubject
};
            } else {
    alert('No se pudo cargar información curricular para esta asignatura');
    setLoading(false);
    return;
}

const difficultyInfo = difficultyLevels.find(d => d.value === difficultyLevel);
const typeInfo = worksheetTypes.find(t => t.value === worksheetType);
const typeText = worksheetType === 'exam' ? 'EXAMEN' : 'FICHA DE EJERCICIOS';

const prompt = `
Eres un profesor experto del sistema educativo español (LOMLOE) con 20 años de experiencia. Genera un ${typeText} EXACTAMENTE como los que se usan en colegios españoles.

════════════════════════════════════════════════════════════════
📋 INFORMACIÓN DEL ESTUDIANTE
════════════════════════════════════════════════════════════════
- Nombre: ${userProfile.name || 'Estudiante'}
- Curso: ${userProfile.grade || 'No especificado'}
- Edad: ${userProfile.age || 'No especificada'} años
${userProfile.interests ? `- Intereses (SOLO para contextualizar problemas matemáticos): ${userProfile.interests}` : ''}
${userProfile.observations ? `- Observaciones del profesor: ${userProfile.observations}` : ''}

════════════════════════════════════════════════════════════════
🎯 COMPETENCIA CURRICULAR (LOMLOE)
════════════════════════════════════════════════════════════════
- Código: ${standard.competency_code}
- Competencia: ${standard.competency_name}
- Descripción: ${standard.description}
- Objetivos: ${JSON.stringify(standard.learning_goals)}

════════════════════════════════════════════════════════════════
⚙️ CONFIGURACIÓN DE LA ACTIVIDAD
════════════════════════════════════════════════════════════════
- Tipo: ${typeInfo.label}
- Dificultad: ${difficultyInfo.label} - ${difficultyInfo.description}
- Número de preguntas: ${numQuestions}

════════════════════════════════════════════════════════════════
📝 PATRONES DE PREGUNTAS DE COLEGIOS ESPAÑOLES (OBLIGATORIO)
════════════════════════════════════════════════════════════════

Debes usar una MEZCLA EQUILIBRADA de estos tipos de preguntas típicas de España:

${selectedSubject === 'Matemáticas' ? `
**MATEMÁTICAS - CONCEPTOS ESENCIALES PARA ${userProfile.grade}:**

${userProfile.grade?.includes('1º') || userProfile.grade?.includes('2º') ? `
- Conceptos clave: número, suma, resta, unidad, decena, centena, par, impar
- Errores comunes: confunden valor posicional, piensan que número mayor siempre tiene más cifras
` : ''}
${userProfile.grade?.includes('3º') || userProfile.grade?.includes('4º') ? `
- Conceptos clave: multiplicación, división, tabla de multiplicar, fracción, numerador, denominador, perímetro, área
- Errores comunes: confunden multiplicación con suma, olvidan el resto, confunden perímetro con área
` : ''}
${userProfile.grade?.includes('5º') || userProfile.grade?.includes('6º') ? `
- Conceptos clave: decimal, porcentaje, fracción equivalente, área, volumen, ecuación, variable
- Errores comunes: problemas con fracciones equivalentes, confunden área con perímetro
` : ''}

**TIPOS DE PREGUNTAS OBLIGATORIAS:**

1. DEFINICIONES (20-25%):
   ✓ "¿Qué es un/una [concepto]?" (ej: ¿Qué es una centena?)
   ✓ "¿Qué es [concepto]? ¿Cuántos/as [subconcepto] tiene?" (ej: ¿Qué es una decena? ¿Cuántas unidades tiene?)
   ✓ "Explica la diferencia entre [concepto1] y [concepto2]"

2. CÁLCULOS Y OPERACIONES (30-40%):
   ✓ Operaciones directas: "Resuelve: 234 + 156 ="
   ✓ Completa tablas de multiplicar: "7 x ___ = 56"
   ✓ Series numéricas: "Completa: 10, 20, ___, 40, ___"

3. PROBLEMAS PRÁCTICOS (25-30%):
   ✓ Problemas de 1 paso (1º-2º): "Juan tiene 23 caramelos y le dan 15 más. ¿Cuántos tiene ahora?"
   ✓ Problemas de 2 pasos (3º-4º): "En una granja hay 235 animales. Si nacen 120 más y venden 50, ¿cuántos quedan?"
   ${userProfile.interests ? `✓ PERSONALIZACIÓN: Usa contextos de "${userProfile.interests}" SOLO en problemas (ej: "Si tu equipo favorito...")` : '✓ Usa contextos cotidianos: colegio, parque, tienda, casa'}

4. VERDADERO/FALSO con justificación (10-15%):
   ✓ "Verdadero o Falso: Todos los números pares terminan en 2, 4, 6, 8 o 0. Justifica tu respuesta."

5. COMPLETAR (10%):
   ✓ "Completa: 3 decenas y 5 unidades = ___"
   ✓ "Ordena de menor a mayor: 450, 235, 540, 120"

` : ''}
${selectedSubject === 'Lengua Castellana' ? `
**LENGUA - CONCEPTOS ESENCIALES PARA ${userProfile.grade}:**

${userProfile.grade?.includes('1º') || userProfile.grade?.includes('2º') ? `
- Conceptos clave: mayúscula, punto, coma, sustantivo, verbo básico, sílaba
- Errores comunes: no usan mayúscula después de punto, confunden letra b con d
` : ''}
${userProfile.grade?.includes('3º') || userProfile.grade?.includes('4º') ? `
- Conceptos clave: sustantivo, verbo, adjetivo, sujeto, predicado, sinónimo, antónimo, b/v, g/j, h
- Errores comunes: confunden sujeto con primera palabra, olvidan la h, confunden b/v
` : ''}

**TIPOS DE PREGUNTAS OBLIGATORIAS:**

1. DEFINICIONES (25%):
   ✓ "¿Qué es un sustantivo? Da tres ejemplos"
   ✓ "¿Qué es el sujeto de una oración?"

2. IDENTIFICACIÓN (30%):
   ✓ "Subraya los verbos de esta frase: El perro corre en el parque"
   ✓ "Señala el sujeto: Los niños juegan en el parque"

3. APLICACIÓN (25%):
   ✓ "Escribe 5 adjetivos que describan [algo]"
   ✓ "Escribe tres oraciones con sujeto y predicado claros"

4. ORTOGRAFÍA (20%):
   ✓ "Completa con b o v: _urro, _aca, ca_allo"
   ✓ "Corrige los errores de esta frase: [frase con errores]"

` : ''}
${selectedSubject === 'Ciencias Naturales' ? `
**CIENCIAS - CONCEPTOS ESENCIALES PARA ${userProfile.grade}:**

${userProfile.grade?.includes('3º') || userProfile.grade?.includes('4º') ? `
- Conceptos clave: ser vivo, animal, planta, función vital, nutrición, reproducción, relación, sólido, líquido, gas
- Errores comunes: piensan que solo los que se mueven son seres vivos, confunden gas con aire
` : ''}

**TIPOS DE PREGUNTAS OBLIGATORIAS:**

1. DEFINICIONES (30%):
   ✓ "¿Qué es un ser vivo? ¿Qué lo diferencia de un objeto?"
   ✓ "¿Qué es un líquido? ¿Qué características tiene?"

2. CLASIFICACIÓN (30%):
   ✓ "Clasifica estos en vivos/inertes: perro, piedra, árbol, agua"
   ✓ "Clasifica según su estado: hielo, vapor, agua del grifo"

3. FUNCIONES Y PROCESOS (25%):
   ✓ "Nombra las tres funciones vitales y explica cada una"
   ✓ "¿Qué pasa cuando calentamos hielo? ¿Cómo se llama ese proceso?"

4. EJEMPLOS (15%):
   ✓ "Da 5 ejemplos de sólidos que encuentres en tu casa"

` : ''}

════════════════════════════════════════════════════════════════
📊 ESTRUCTURA OBLIGATORIA ${worksheetType === 'exam' ? 'DEL EXAMEN' : 'DE LA FICHA'}
════════════════════════════════════════════════════════════════

${worksheetType === 'exam' ? `
**ESTRUCTURA DE EXAMEN (típica de colegios españoles):**

PARTE 1: TEORÍA (30% de puntos)
- Definiciones de conceptos clave
- Verdadero/Falso con justificación

PARTE 2: PRÁCTICA (40% de puntos)
- Ejercicios de aplicación
- Cálculos/identificación/clasificación según asignatura

PARTE 3: PROBLEMAS/APLICACIÓN (30% de puntos)
- Problemas de razonamiento
- Preguntas de desarrollo corto

` : `
**ESTRUCTURA DE FICHA (típica de colegios españoles):**

- Enfoque en PRÁCTICA y REFUERZO
- Ejercicios agrupados por tipo
- Graduación de dificultad dentro de cada tipo
- Puede incluir REPETICIÓN para memorización (ej: tablas de multiplicar)
- Instrucciones claras y directas

`}

════════════════════════════════════════════════════════════════
⚠️ REGLAS ESTRICTAS - NO NEGOCIABLES
════════════════════════════════════════════════════════════════

1. ✅ PRIORIDAD ABSOLUTA: Rigor académico y curriculum LOMLOE
2. ✅ Usa CONCEPTOS ESENCIALES del curso especificado
3. ✅ Usa PATRONES DE PREGUNTAS reales de colegios españoles
4. ✅ Estructura IDÉNTICA a fichas/exámenes de colegios
5. ${userProfile.interests ? `✅ Intereses "${userProfile.interests}" SOLO en contextos de problemas matemáticos, NO en toda la ficha` : '✅ Usa contextos cotidianos estándar'}
6. ✅ Lenguaje formal pero apropiado para la edad
7. ✅ Instrucciones como las escribiría un profesor español
8. ❌ NO inventes formatos raros o modernos
9. ❌ NO personalices TODO - personaliza SOLO contextos específicos
10. ❌ NO uses lenguaje infantil exagerado

${userProfile.observations ? `
════════════════════════════════════════════════════════════════
🎯 APLICACIÓN DE OBSERVACIONES DEL PERFIL
════════════════════════════════════════════════════════════════

OBSERVACIONES REPORTADAS: "${userProfile.observations}"

INSTRUCCIONES ESPECÍFICAS según observaciones:

${userProfile.observations.toLowerCase().includes('confunde centenas') || userProfile.observations.toLowerCase().includes('confunde decenas') ? `
✓ PRIORIDAD: Incluir ejercicios de VALOR POSICIONAL
  - Preguntas del tipo: "¿Qué es una centena? ¿Cuántas decenas tiene?"
  - Tablas de descomposición: Número | Centenas | Decenas | Unidades
  - Comparación directa: "¿Qué vale más: 3 centenas o 30 decenas?"
` : ''}

${userProfile.observations.toLowerCase().includes('confunde b') || userProfile.observations.toLowerCase().includes('confunde d') || userProfile.observations.toLowerCase().includes('b/d') ? `
✓ PRIORIDAD: Incluir ejercicios de DISCRIMINACIÓN VISUAL b/d
  - Completar palabras: "_urro, _ato, ca_allo"
  - Señalar la letra correcta en palabras
  - Dictado de palabras con b/d
` : ''}

${userProfile.observations.toLowerCase().includes('tablas') || userProfile.observations.toLowerCase().includes('multiplicar') ? `
✓ PRIORIDAD: REFUERZO de TABLAS DE MULTIPLICAR
  - Incluir ejercicios de completar: "7 x ___ = 56"
  - Series de multiplicaciones de la misma tabla
  - Problemas que requieran multiplicación
` : ''}

${userProfile.observations.toLowerCase().includes('fracciones') || userProfile.observations.toLowerCase().includes('fracción') ? `
✓ PRIORIDAD: PRÁCTICA GRADUAL con FRACCIONES
  - Empezar con fracciones simples (1/2, 1/4, 3/4)
  - Incluir representación visual (círculos, barras)
  - Comparación de fracciones con mismo denominador
` : ''}

${userProfile.observations.toLowerCase().includes('visual') || userProfile.observations.toLowerCase().includes('aprende mejor con') ? `
✓ ESTILO VISUAL: Incluir más componentes visuales
  - Diagramas y esquemas donde sea posible
  - Tablas para organizar información
  - Mencionar en instrucciones: "Puedes hacer un dibujo para ayudarte"
` : ''}

${userProfile.observations.toLowerCase().includes('se distrae') || userProfile.observations.toLowerCase().includes('atención') ? `
✓ ATENCIÓN: Ejercicios más cortos y variados
  - Cambiar de tipo de pregunta frecuentemente
  - Instrucciones claras y concisas
  - Evitar bloques largos del mismo tipo
` : ''}

${userProfile.observations.toLowerCase().includes('ortografía') || userProfile.observations.toLowerCase().includes('b/v') || userProfile.observations.toLowerCase().includes('h') ? `
✓ ORTOGRAFÍA: Incluir práctica específica
  - Completar con la letra correcta
  - Dictado de palabras con reglas específicas
  - Identificar y corregir errores
` : ''}

${userProfile.observations.toLowerCase().includes('vocabulario') || userProfile.observations.toLowerCase().includes('léxico') ? `
✓ VOCABULARIO: Reforzar con definiciones
  - Incluir más preguntas de "¿Qué es...?"
  - Pedir sinónimos y antónimos
  - Dar ejemplos de uso de palabras
` : ''}

${userProfile.observations.toLowerCase().includes('comprensión') || userProfile.observations.toLowerCase().includes('lectura') ? `
✓ COMPRENSIÓN: Textos claros y preguntas explícitas
  - Textos cortos y bien estructurados
  - Preguntas directas sobre el texto
  - Subrayar o señalar información clave
` : ''}

${userProfile.observations.toLowerCase().includes('razonamiento') || userProfile.observations.toLowerCase().includes('lógica') ? `
✓ RAZONAMIENTO: Más problemas de aplicación
  - Problemas de varios pasos
  - Preguntas de "¿Por qué?"
  - Situaciones que requieran pensar
` : ''}

${userProfile.observations.toLowerCase().includes('autoestima') || userProfile.observations.toLowerCase().includes('confianza') ? `
✓ AUTOESTIMA: Graduación cuidadosa de dificultad
  - Empezar con preguntas más fáciles
  - Aumentar dificultad gradualmente
  - Incluir pistas de apoyo
` : ''}

⚠️ IMPORTANTE: Las observaciones deben GUIAR el contenido, pero SIN cambiar el formato escolar estándar.
` : ''}

════════════════════════════════════════════════════════════════
📋 NIVEL DE DIFICULTAD: ${difficultyInfo.label}
════════════════════════════════════════════════════════════════
${difficultyLevel === 'básico' ? `
- Conceptos fundamentales del curso
- Ejemplos simples y directos
- Lenguaje claro, pistas cuando sea necesario
- Enfoque en comprensión básica
` : ''}${difficultyLevel === 'intermedio' ? `
- Nivel estándar esperado del curso
- Combina comprensión y aplicación
- Algunos desafíos moderados
- Requiere razonamiento, no solo memorización
` : ''}${difficultyLevel === 'avanzado' ? `
- Pensamiento crítico y razonamiento complejo
- Problemas multi-paso
- Aplicación en situaciones nuevas
- Síntesis de varios conceptos
` : ''}

════════════════════════════════════════════════════════════════
📤 FORMATO DE SALIDA - JSON VÁLIDO
════════════════════════════════════════════════════════════════

Responde ÚNICAMENTE con JSON válido (sin markdown, sin explicaciones):

{
  "title": "Título profesional del ${typeText} (ej: Ficha de Matemáticas - Operaciones hasta 1000)",
  "subject": "${selectedSubject}",
  "grade_level": "${userProfile.grade || 'General'}",
  "competency_code": "${standard.competency_code}",
  "difficulty": "${difficultyLevel}",
  "type": "${worksheetType}",
  "time_estimate": ${worksheetType === 'exam' ? (userProfile.grade?.includes('1º') || userProfile.grade?.includes('2º') ? 35 : userProfile.grade?.includes('3º') || userProfile.grade?.includes('4º') ? 50 : 60) : 35},
  "instructions": "Instrucciones claras y profesionales estilo profesor español (ej: 'Lee atentamente cada pregunta. Escribe con letra clara. Muestra tu trabajo en los problemas.')",
  "questions": [
    {
      "id": 1,
      "type": "definition | true_false | problem | calculation | identification | classification | fill_blank | short_essay",
      "question": "Pregunta completa y clara, SIN usar emojis, profesional",
      "hint": "Pista opcional solo si nivel es básico",
      "points": 10
    }
  ],
  "answer_key": [
    {
      "question_id": 1,
      "correct_answer": "Respuesta correcta completa o criterios de evaluación detallados",
      "explanation": "Explicación conceptual de por qué esta es la respuesta correcta"
    }
  ],
  "learning_objectives": ["Objetivo específico del curriculum LOMLOE", "Otro objetivo"]
}

IMPORTANTE: Genera EXACTAMENTE ${numQuestions} preguntas con DISTRIBUCIÓN EQUILIBRADA de tipos.
      `.trim();

const resultText = await callGeminiAPI(prompt);
const jsonString = resultText.replace(/```json/g, '').replace(/```/g, '').trim();
const worksheetData = JSON.parse(jsonString);

// Preparar datos para guardar
const worksheetToSave = {
    title: worksheetData.title,
    subject: selectedSubject,
    grade_level: userProfile.grade || 'General',
    questions: worksheetData.questions,
    answer_key: worksheetData.answer_key,
    time_estimate: worksheetData.time_estimate,
    metadata: {
        instructions: worksheetData.instructions,
        learning_objectives: worksheetData.learning_objectives,
        competency_code: standard.competency_code,
        difficulty: difficultyLevel,
        type: worksheetType
    }
};

// Intentar guardar en base de datos
try {
    const { data: savedWorksheet, error } = await supabase
        .from('worksheets')
        .insert({
            user_id: session.user.id,
            curriculum_standard_id: standard.id !== 'fallback' ? standard.id : null,
            ...worksheetToSave
        })
        .select()
        .single();

    if (error) {
        console.warn('No se pudo guardar en base de datos, usando modo local:', error);
        // Modo local sin base de datos
        setGeneratedWorksheet({
            id: 'local-' + Date.now(),
            ...worksheetToSave
        });
    } else {
        setGeneratedWorksheet(savedWorksheet);
    }
} catch (dbError) {
    console.warn('Base de datos no disponible, usando modo local');
    setGeneratedWorksheet({
        id: 'local-' + Date.now(),
        ...worksheetToSave
    });
}

setStudentAnswers({});
setCorrectionResult(null);

        } catch (error) {
    console.error('Error generando ficha:', error);
    alert(`Error al generar ficha: ${error.message}`);
} finally {
    setLoading(false);
}
    };

const correctWorksheet = async () => {
    setLoading(true);
    try {
        const questionsWithAnswers = generatedWorksheet.questions.map(q => ({
            ...q,
            student_answer: studentAnswers[q.id] || 'Sin respuesta',
            correct_answer: generatedWorksheet.answer_key.find(a => a.question_id === q.id)?.correct_answer
        }));

        const totalQuestions = generatedWorksheet.questions.length;

        const prompt = `
Eres un profesor experto. Corrige este ${generatedWorksheet.metadata?.type === 'exam' ? 'examen' : 'ejercicio'} de ${generatedWorksheet.subject} para ${userProfile.grade || 'el estudiante'}.

NIVEL DE DIFICULTAD: ${generatedWorksheet.metadata?.difficulty || 'intermedio'}

PREGUNTAS Y RESPUESTAS:
${questionsWithAnswers.map(q => `
Pregunta ${q.id} (${q.points} puntos): ${q.question}
Respuesta del estudiante: ${q.student_answer}
Respuesta correcta esperada: ${q.correct_answer}
`).join('\n')}

CRITERIOS:
- Valora el razonamiento aunque haya errores menores
- Sé constructivo y alentador
- Da feedback específico por pregunta
- Calcula la puntuación total (máximo 100 puntos)
- Considera el nivel de dificultad (${generatedWorksheet.metadata?.difficulty})

Responde con JSON:
{
  "total_score": 85,
  "correct_answers": 8,
  "total_questions": ${totalQuestions},
  "question_breakdown": [
    {
      "question_id": 1,
      "points_earned": 10,
      "max_points": 10,
      "is_correct": true,
      "feedback": "Excelente respuesta. Demuestra comprensión..."
    }
  ],
  "overall_feedback": "Comentario general motivador",
  "strengths": ["Fortaleza 1", "Fortaleza 2"],
  "improvements": ["Área de mejora 1"]
}
      `.trim();

        const resultText = await callGeminiAPI(prompt);
        const jsonString = resultText.replace(/```json/g, '').replace(/```/g, '').trim();
        const correction = JSON.parse(jsonString);

        // Intentar guardar resultados
        try {
            if (generatedWorksheet.id && !generatedWorksheet.id.includes('local-')) {
                const { data: result, error } = await supabase
                    .from('worksheet_results')
                    .insert({
                        worksheet_id: generatedWorksheet.id,
                        user_id: session.user.id,
                        student_name: userProfile.name || 'Estudiante',
                        answers: studentAnswers,
                        score: correction.total_score,
                        total_questions: totalQuestions,
                        correct_answers: correction.correct_answers,
                        time_spent: 0,
                        question_breakdown: correction.question_breakdown
                    })
                    .select()
                    .single();

                if (!error) {
                    // También guardar en learning_analytics
                    await supabase.from('learning_analytics').insert({
                        user_id: session.user.id,
                        date: new Date().toISOString().split('T')[0],
                        subject: generatedWorksheet.subject,
                        activity_type: generatedWorksheet.metadata?.type || 'worksheet',
                        score: correction.total_score,
                        topics_covered: generatedWorksheet.metadata?.learning_objectives || [],
                        competencies_addressed: [generatedWorksheet.metadata?.competency_code]
                    });
                }
            }
        } catch (dbError) {
            console.warn('No se pudo guardar en base de datos:', dbError);
        }

        setCorrectionResult(correction);
        alert('¡Ficha corregida! ' + (generatedWorksheet.id.includes('local-') ? '(Modo local - ejecuta la migración para guardar resultados)' : 'Resultados guardados en tu perfil.'));

    } catch (error) {
        console.error('Error corrigiendo:', error);
        alert(`Error al corregir: ${error.message}`);
    } finally {
        setLoading(false);
    }
};

const downloadWorksheet = () => {
    if (!generatedWorksheet) return;

    const worksheet = `
${generatedWorksheet.title}
${'='.repeat(generatedWorksheet.title.length)}

Asignatura: ${generatedWorksheet.subject}
Curso: ${generatedWorksheet.grade_level}
Tipo: ${generatedWorksheet.metadata?.type === 'exam' ? 'Examen' : 'Ficha de Ejercicios'}
Dificultad: ${generatedWorksheet.metadata?.difficulty || 'Intermedio'}
Competencia: ${generatedWorksheet.metadata?.competency_code}
Tiempo estimado: ${generatedWorksheet.time_estimate} minutos

INSTRUCCIONES:
${generatedWorksheet.metadata?.instructions}

EJERCICIOS:
${generatedWorksheet.questions.map((q, idx) => `
${idx + 1}. ${q.question} (${q.points} puntos)
${q.hint ? `   💡 Pista: ${q.hint}` : ''}

   Respuesta:
   _________________________________________
   _________________________________________
   _________________________________________

`).join('\n')}

OBJETIVOS DE APRENDIZAJE:
${generatedWorksheet.metadata?.learning_objectives?.map(obj => `• ${obj}`).join('\n')}
    `.trim();

    const blob = new Blob([worksheet], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${generatedWorksheet.title.replace(/\s+/g, '_')}.txt`;
    link.click();
    URL.revokeObjectURL(url);
};

return (
    <div className="space-y-6 px-4 py-6">
        {/* Generator Form */}
        {!generatedWorksheet && (
            <Card>
                <CardHeader>
                    <h2 className="text-3xl font-bold flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                            <BookOpen className="h-6 w-6 text-white" />
                        </div>
                        Generador de Fichas y Exámenes
                    </h2>
                    <p className="text-gray-600 mt-2">Crea fichas personalizadas con patrones reales de colegios españoles</p>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        {/* Worksheet Type Selection */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-3">
                                Tipo de Actividad
                            </label>
                            <div className="grid grid-cols-2 gap-4">
                                {worksheetTypes.map(type => (
                                    <button
                                        key={type.value}
                                        onClick={() => setWorksheetType(type.value)}
                                        className={`p-4 border-2 rounded-xl text-left transition-all hover-scale-105 ${worksheetType === type.value
                                            ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-purple-50 shadow-md'
                                            : 'border-gray-300 hover:border-blue-400'
                                            }`}
                                    >
                                        <div className="text-2xl mb-2">{type.icon}</div>
                                        <div className="font-semibold text-gray-900">{type.label}</div>
                                        <div className="text-sm text-gray-600">{type.description}</div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Subject Selection */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Asignatura
                            </label>
                            <select
                                value={selectedSubject}
                                onChange={(e) => {
                                    setSelectedSubject(e.target.value);
                                    setSelectedStandard(null);
                                }}
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                            >
                                <option value="">Selecciona una asignatura...</option>
                                {subjects.map(subject => (
                                    <option key={subject} value={subject}>{subject}</option>
                                ))}
                            </select>
                        </div>

                        {/* Difficulty Level Selection */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-3">
                                Nivel de Dificultad
                            </label>
                            <div className="grid grid-cols-3 gap-3">
                                {difficultyLevels.map(level => (
                                    <button
                                        key={level.value}
                                        onClick={() => setDifficultyLevel(level.value)}
                                        className={`p-3 border-2 rounded-xl text-center transition-all hover-scale-105 ${difficultyLevel === level.value
                                            ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-purple-50 shadow-md'
                                            : 'border-gray-300 hover:border-blue-400'
                                            }`}
                                    >
                                        <div className="text-lg mb-1">{level.icon}</div>
                                        <div className="font-semibold text-sm text-gray-900">{level.label}</div>
                                        <div className="text-xs text-gray-600 mt-1">{level.description}</div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Curriculum Standard (Optional) */}
                        {curriculumStandards.length > 0 && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Competencia Curricular (Opcional)
                                </label>
                                <select
                                    value={selectedStandard?.id || ''}
                                    onChange={(e) => {
                                        const std = curriculumStandards.find(s => s.id === e.target.value);
                                        setSelectedStandard(std);
                                    }}
                                    className="w-full px-6 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                >
                                    <option value="">Selección automática...</option>
                                    {curriculumStandards.map(std => (
                                        <option key={std.id} value={std.id}>
                                            {std.competency_code}: {std.competency_name}
                                        </option>
                                    ))}
                                </select>
                                {selectedStandard && (
                                    <p className="mt-2 text-sm text-gray-600">
                                        {selectedStandard.description}
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Number of Questions */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Número de Preguntas: <Badge variant="gradient" size="lg">{numQuestions}</Badge>
                            </label>
                            <input
                                type="range"
                                min="5"
                                max="20"
                                value={numQuestions}
                                onChange={(e) => setNumQuestions(parseInt(e.target.value))}
                                className="w-full"
                            />
                            <div className="flex justify-between text-xs text-gray-500 mt-1">
                                <span>5 (Rápido)</span>
                                <span>20 (Completo)</span>
                            </div>
                        </div>

                        {/* Info Box */}
                        <div className="bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200 rounded-xl p-5">
                            <h3 className="font-semibold text-blue-900 mb-3 flex items-center">
                                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mr-2">
                                    <Target className="h-4 w-4 text-white" />
                                </div>
                                Personalización Inteligente
                            </h3>
                            <div className="text-sm text-blue-700 space-y-1">
                                <p>📌 Estudiante: {userProfile.name || 'No configurado'}</p>
                                <p>🎓 Curso: {userProfile.grade || 'No configurado'}</p>
                                {userProfile.interests && (
                                    <p>💡 Intereses: {userProfile.interests}</p>
                                )}
                                <p className="text-xs mt-2 text-indigo-600">
                                    {!userProfile.grade && '⚠️ Configura tu perfil para mejor personalización'}
                                </p>
                            </div>
                        </div>

                        {/* Generate Button */}
                        <Button
                            onClick={generateWorksheet}
                            disabled={loading || !selectedSubject}
                            variant="primary"
                            size="lg"
                            fullWidth
                        >
                            {loading ? (
                                <>
                                    <Spinner size="sm" className="mr-2" />
                                    Generando con IA...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="h-6 w-6 mr-2" />
                                    Generar ${worksheetTypes.find(t => t.value === worksheetType)?.label}
                                </>
                            )}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        )}

        {/* Generated Worksheet Display */}
        {
            generatedWorksheet && !correctionResult && (
                <Card className="overflow-visible">
                    <CardHeader>
                        <div className="flex justify-between items-start">
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <h2 className="text-3xl font-bold text-gray-900">
                                        {generatedWorksheet.title}
                                    </h2>
                                    <Badge
                                        variant={
                                            generatedWorksheet.metadata?.difficulty === 'básico' ? 'success' :
                                                generatedWorksheet.metadata?.difficulty === 'avanzado' ? 'danger' :
                                                    'primary'
                                        }
                                    >
                                        {generatedWorksheet.metadata?.difficulty || 'Intermedio'}
                                    </Badge>
                                </div>
                                <div className="flex items-center gap-4 text-sm text-gray-600 flex-wrap">
                                    <span className="flex items-center gap-1">📚 {generatedWorksheet.subject}</span>
                                    <span className="flex items-center gap-1">🎓 {generatedWorksheet.grade_level}</span>
                                    <span className="flex items-center gap-1">⏱️ {generatedWorksheet.time_estimate} min</span>
                                    <span className="flex items-center gap-1">📋 {generatedWorksheet.metadata?.competency_code}</span>
                                    <Badge variant="gradient">
                                        {generatedWorksheet.metadata?.type === 'exam' ? '📊 EXAMEN' : '📝 FICHA'}
                                    </Badge>
                                </div>
                            </div>
                            <Button
                                onClick={downloadWorksheet}
                                variant="secondary"
                                size="sm"
                            >
                                <Download className="h-4 w-4 mr-2" />
                                Descargar
                            </Button>
                        </div>
                    </CardHeader>

                    <CardContent>
                        <Alert variant="info" className="mb-8">
                            <strong>Instrucciones:</strong> {generatedWorksheet.metadata?.instructions}
                        </Alert>

                        <div className="space-y-8">
                            {generatedWorksheet.questions.map((question, idx) => (
                                <div key={question.id} className="bg-gray-50 rounded-xl p-6 border border-gray-200 hover:border-blue-300 transition-colors">
                                    <div className="flex justify-between items-start mb-4">
                                        <h3 className="font-semibold text-lg text-gray-900">
                                            <span className="text-blue-600 font-bold mr-2">{idx + 1}.</span>
                                            {question.question}
                                        </h3>
                                        <Badge variant="default">{question.points} pts</Badge>
                                    </div>
                                    {question.hint && (
                                        <p className="text-sm text-blue-600 italic mb-3 flex items-center">
                                            <Sparkles className="w-3 h-3 mr-1" /> Pista: {question.hint}
                                        </p>
                                    )}
                                    <Textarea
                                        value={studentAnswers[question.id] || ''}
                                        onChange={(e) => setStudentAnswers(prev => ({
                                            ...prev,
                                            [question.id]: e.target.value
                                        }))}
                                        placeholder="Escribe tu respuesta aquí..."
                                        rows={3}
                                        className="bg-white"
                                    />
                                </div>
                            ))}
                        </div>

                        <div className="mt-8 pt-6 border-t border-gray-200 flex gap-4">
                            <Button
                                onClick={() => {
                                    setGeneratedWorksheet(null);
                                    setStudentAnswers({});
                                }}
                                variant="secondary"
                            >
                                Generar Nuevo
                            </Button>
                            <Button
                                onClick={correctWorksheet}
                                disabled={loading || Object.keys(studentAnswers).length === 0}
                                variant="success"
                                className="flex-1"
                            >
                                <CheckCircle className="h-5 w-5 mr-2" />
                                {loading ? 'Corrigiendo...' : `Corregir ${worksheetTypes.find(t => t.value === generatedWorksheet.metadata?.type)?.label || 'Ficha'}`}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )
        }

        {/* Correction Results */}
        {
            correctionResult && (
                <div className="space-y-6">
                    {/* Score Card */}
                    <Card variant="gradient" className="text-white">
                        <CardContent>
                            <div className="flex justify-between items-center">
                                <div>
                                    <h2 className="text-3xl font-bold mb-2">
                                        ¡{generatedWorksheet.metadata?.type === 'exam' ? 'Examen' : 'Ficha'} Corregid{generatedWorksheet.metadata?.type === 'exam' ? 'o' : 'a'}!
                                    </h2>
                                    <p className="text-blue-100">
                                        {correctionResult.correct_answers} de {correctionResult.total_questions} preguntas correctas
                                    </p>
                                </div>
                                <div className="text-center">
                                    <div className="text-6xl font-bold">{correctionResult.total_score}</div>
                                    <div className="text-xl text-blue-100">puntos</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Question by Question */}
                    <Card>
                        <CardHeader>
                            <h3 className="text-xl font-bold text-gray-900">Corrección Detallada</h3>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {correctionResult.question_breakdown?.map((result, idx) => {
                                    const question = generatedWorksheet.questions.find(q => q.id === result.question_id);
                                    return (
                                        <div
                                            key={result.question_id}
                                            className={`border-l-4 ${result.is_correct ? 'border-green-500 bg-green-50' : 'border-orange-500 bg-orange-50'} p-4 rounded-r-lg`}
                                        >
                                            <div className="flex items-start justify-between mb-2">
                                                <h4 className="font-semibold text-gray-900">
                                                    {idx + 1}. {question?.question}
                                                </h4>
                                                <Badge variant={result.is_correct ? 'success' : 'warning'}>
                                                    {result.points_earned}/{result.max_points} pts
                                                </Badge>
                                            </div>
                                            <p className="text-sm text-gray-700 mb-2">
                                                <strong>Tu respuesta:</strong> {studentAnswers[result.question_id]}
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                <strong>Feedback:</strong> {result.feedback}
                                            </p>
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Feedback Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card className="border-green-200 bg-green-50">
                            <CardContent>
                                <h3 className="font-semibold text-green-900 mb-3 flex items-center">
                                    <CheckCircle className="h-5 w-5 mr-2" />
                                    Fortalezas
                                </h3>
                                <ul className="space-y-2">
                                    {correctionResult.strengths?.map((strength, idx) => (
                                        <li key={idx} className="text-sm text-gray-700 flex items-start">
                                            <span className="text-green-600 mr-2">✓</span>
                                            {strength}
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>

                        <Card className="border-orange-200 bg-orange-50">
                            <CardContent>
                                <h3 className="font-semibold text-orange-900 mb-3 flex items-center">
                                    <AlertCircle className="h-5 w-5 mr-2" />
                                    Áreas de Mejora
                                </h3>
                                <ul className="space-y-2">
                                    {correctionResult.improvements?.map((improvement, idx) => (
                                        <li key={idx} className="text-sm text-gray-700 flex items-start">
                                            <span className="text-orange-600 mr-2">→</span>
                                            {improvement}
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Overall Feedback */}
                    <Card className="border-indigo-200 bg-indigo-50">
                        <CardContent>
                            <h3 className="font-semibold text-indigo-900 mb-2">Comentario General</h3>
                            <p className="text-gray-700 leading-relaxed">{correctionResult.overall_feedback}</p>
                        </CardContent>
                    </Card>

                    <Button
                        onClick={() => {
                            setGeneratedWorksheet(null);
                            setCorrectionResult(null);
                            setStudentAnswers({});
                        }}
                        variant="primary"
                        fullWidth
                        size="lg"
                    >
                        Generar Nuevo {worksheetTypes.find(t => t.value === worksheetType)?.label}
                    </Button>
                </div>
            )
        }
    </div >
);
};

export default WorksheetGenerator;
