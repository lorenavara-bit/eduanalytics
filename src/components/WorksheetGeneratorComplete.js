import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabaseClient';
import {
    BookOpen, Brain, Download, CheckCircle, AlertCircle,
    Zap, Target, Mic, StopCircle, Trash2, Loader
} from 'lucide-react';
import { Card, CardContent, CardHeader, Button, Badge, Alert, Spinner, Textarea } from './DesignSystem';
import { useRole } from '../contexts/RoleContext';
import { useStudentData } from '../contexts/StudentDataContext';
import { useAIFunctions } from '../contexts/AIFunctionContext';
import { useUI } from '../contexts/UIContext';

const WorksheetGeneratorComplete = () => {
    // Get data from contexts
    const { session, userProfile } = useRole();
    const { subjects: availableSubjects } = useStudentData();
    const { callGeminiAPI, loading: aiLoading } = useAIFunctions();
    const { showSuccess, showError } = useUI();

    // ==================== ESTADOS ====================
    const [loading, setLoading] = useState(false);
    const [generatedWorksheet, setGeneratedWorksheet] = useState(null);
    const [studentAnswers, setStudentAnswers] = useState({});
    const [correctionResult, setCorrectionResult] = useState(null);

    // Audio Recording States
    const [audioAnswers, setAudioAnswers] = useState({});
    const [recording, setRecording] = useState(null);
    const [mediaRecorder, setMediaRecorder] = useState(null);
    const [transcribing, setTranscribing] = useState(null);
    const audioChunks = useRef([]);

    // Worksheet Configuration
    const [selectedSubject, setSelectedSubject] = useState('');
    const [difficultyLevel, setDifficultyLevel] = useState('intermedio');
    const [worksheetType, setWorksheetType] = useState('worksheet');
    const [numQuestions, setNumQuestions] = useState(10);

    // ✅ NUEVAS FUNCIONALIDADES
    const [availableMaterials, setAvailableMaterials] = useState([]);
    const [selectedMaterials, setSelectedMaterials] = useState([]);
    const [studentConsiderations, setStudentConsiderations] = useState('');
    const [recordingConsiderations, setRecordingConsiderations] = useState(false);
    const [transcribingConsiderations, setTranscribingConsiderations] = useState(false);

    // Set initial subject when availableSubjects loads
    useEffect(() => {
        if (availableSubjects.length > 0 && !selectedSubject) {
            setSelectedSubject(availableSubjects[0]);
        }
    }, [availableSubjects, selectedSubject]);

    const difficultyLevels = [
        { value: 'básico', label: 'Básico', icon: '⭐', description: 'Conceptos fundamentales' },
        { value: 'intermedio', label: 'Intermedio', icon: '⭐⭐', description: 'Nivel estándar' },
        { value: 'avanzado', label: 'Avanzado', icon: '⭐⭐⭐', description: 'Desafío' }
    ];

    const worksheetTypes = [
        { value: 'worksheet', label: 'Ficha de Ejercicios', icon: '📝' },
        { value: 'exam', label: 'Examen / Test', icon: '📊' }
    ];

    // ==================== LISTA MAESTRA DE TIPOS DE PREGUNTAS ====================
    const questionTypesMaster = {
        basicas: {
            label: '📌 Básicas',
            types: [
                {
                    id: 'multiple_choice',
                    label: 'Opción Múltiple (A/B/C/D)',
                    icon: '🔘',
                    description: 'Test con 4 opciones',
                    prompt_hint: 'Pregunta de opción múltiple con 4 alternativas (solo una correcta)'
                },
                {
                    id: 'true_false',
                    label: 'Verdadero/Falso',
                    icon: '✓✗',
                    description: 'Afirmaciones V/F',
                    prompt_hint: 'Afirmación para responder Verdadero o Falso'
                },
                {
                    id: 'short_answer',
                    label: 'Respuesta Corta',
                    icon: '✏️',
                    description: '1-2 palabras o número',
                    prompt_hint: 'Pregunta de respuesta muy corta (palabra, número, fecha)'
                },
                {
                    id: 'fill_blanks',
                    label: 'Rellenar Huecos',
                    icon: '⬜',
                    description: 'Completar texto con palabras',
                    prompt_hint: 'Texto incompleto con espacios ____ para rellenar'
                }
            ]
        },
        intermedias: {
            label: '📚 Intermedias',
            types: [
                {
                    id: 'match_pairs',
                    label: 'Emparejar/Unir',
                    icon: '🔗',
                    description: 'Relacionar columnas',
                    prompt_hint: 'Lista de términos y definiciones para emparejar'
                },
                {
                    id: 'order_elements',
                    label: 'Ordenar Elementos',
                    icon: '🔢',
                    description: 'Secuenciar correctamente',
                    prompt_hint: 'Lista desordenada para poner en orden correcto (cronológico, lógico...)'
                },
                {
                    id: 'classify_table',
                    label: 'Clasificar en Tabla',
                    icon: '📋',
                    description: 'Categorizar elementos',
                    prompt_hint: 'Elementos para clasificar en categorías (tabla de 2-3 columnas)'
                },
                {
                    id: 'complete_series',
                    label: 'Completar Series',
                    icon: '➡️',
                    description: 'Patrones y secuencias',
                    prompt_hint: 'Serie numérica o lógica con elementos faltantes'
                }
            ]
        },
        avanzadas: {
            label: '🎯 Avanzadas',
            types: [
                {
                    id: 'problem_solving',
                    label: 'Problema de Aplicación',
                    icon: '🧮',
                    description: 'Aplicar conocimientos',
                    prompt_hint: 'Problema práctico que requiere razonamiento y operaciones'
                },
                {
                    id: 'short_essay',
                    label: 'Desarrollo Corto (3-5 líneas)',
                    icon: '📖',
                    description: 'Explicar brevemente',
                    prompt_hint: 'Pregunta de desarrollo breve (3-5 líneas)'
                },
                {
                    id: 'label_diagram',
                    label: 'Etiquetar Diagrama',
                    icon: '🏷️',
                    description: 'Identificar partes (descripción textual)',
                    prompt_hint: 'Descripción de un diagrama/imagen con partes para identificar'
                },
                {
                    id: 'reading_comprehension',
                    label: 'Comprensión Lectora',
                    icon: '📚',
                    description: 'Texto + preguntas',
                    prompt_hint: 'Texto corto seguido de preguntas de comprensión'
                }
            ]
        }
    };

    // Estado para tipos de preguntas seleccionados
    const [selectedQuestionTypes, setSelectedQuestionTypes] = useState(['short_answer', 'multiple_choice']);

    // Función auxiliar para extraer JSON de la respuesta de la IA (ROBUSTA)
    const extractJSON = (text) => {
        // Función auxiliar para limpiar caracteres de control
        const cleanJSON = (jsonStr) => {
            // Reemplazar saltos de línea y tabs dentro de strings por espacios
            // Pero mantener la estructura del JSON
            return jsonStr
                .replace(/\r\n/g, ' ')  // Saltos de línea Windows
                .replace(/\n/g, ' ')    // Saltos de línea Unix
                .replace(/\r/g, ' ')    // Saltos de línea Mac
                .replace(/\t/g, ' ')    // Tabuladores
                .replace(/\s+/g, ' ');  // Múltiples espacios a uno solo
        };

        try {
            // 1. Intentar parsear directamente
            return JSON.parse(text);
        } catch (e) {
            // 2. Buscar bloques de código ```json ... ```
            const jsonMatch = text.match(/```json([\s\S]*?)```/);
            if (jsonMatch && jsonMatch[1]) {
                const cleaned = cleanJSON(jsonMatch[1].trim());
                return JSON.parse(cleaned);
            }
            // 3. Buscar bloques de código ``` ... ``` genéricos
            const codeMatch = text.match(/```([\s\S]*?)```/);
            if (codeMatch && codeMatch[1]) {
                const cleaned = cleanJSON(codeMatch[1].trim());
                return JSON.parse(cleaned);
            }
            // 4. Buscar el primer '{' y el último '}'
            const firstBrace = text.indexOf('{');
            const lastBrace = text.lastIndexOf('}');
            if (firstBrace !== -1 && lastBrace !== -1) {
                const jsonCandidate = text.substring(firstBrace, lastBrace + 1);
                const cleaned = cleanJSON(jsonCandidate);
                return JSON.parse(cleaned);
            }
            throw new Error("No se encontró JSON válido en la respuesta");
        }
    };

    // ==================== CARGAR MATERIALES DINÁMICAMENTE ====================
    useEffect(() => {
        // Subjects now come from StudentDataContext, no need to load
        loadAvailableMaterials();
    }, []);

    // Note: loadAvailableSubjects() removed - subjects now from StudentDataContext

    const loadAvailableMaterials = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (user) {
                const { data, error } = await supabase
                    .from('materials')
                    .select('id, name, subject, type') // ✅ Corregido: 'title' -> 'name'
                    .eq('user_id', user.id)
                    .order('date', { ascending: false }); // ✅ Corregido: 'created_at' -> 'date'

                if (error) throw error;

                if (data) {
                    setAvailableMaterials(data);
                    console.log('✅ Materiales cargados:', data.length);
                }
            }
        } catch (error) {
            console.error('❌ Error al cargar materiales:', error);
        }
    };

    // ==================== RECONOCIMIENTO DE VOZ (WEB SPEECH API) ====================
    const startListening = (questionId) => {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            alert('Tu navegador no soporta reconocimiento de voz. Prueba con Chrome.');
            return;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();

        recognition.lang = 'es-ES';
        recognition.continuous = false;
        recognition.interimResults = false;

        recognition.onstart = () => {
            setRecording(questionId);
            setTranscribing(questionId);
        };

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            console.log('✅ Transcripción:', transcript);

            setStudentAnswers(prev => ({
                ...prev,
                [questionId]: prev[questionId] ? `${prev[questionId]} ${transcript}` : transcript
            }));

            setAudioAnswers(prev => ({
                ...prev,
                [questionId]: {
                    transcription: transcript,
                    url: null
                }
            }));
        };

        recognition.onerror = (event) => {
            console.error('Error de reconocimiento:', event.error);
            setRecording(null);
            setTranscribing(null);
            if (event.error === 'not-allowed') {
                alert('Permiso de micrófono denegado.');
            }
        };

        recognition.onend = () => {
            setRecording(null);
            setTranscribing(null);
        };

        recognition.start();
        setMediaRecorder(recognition);
    };

    const stopListening = () => {
        if (mediaRecorder) {
            mediaRecorder.stop();
            setRecording(null);
            setTranscribing(null);
            setMediaRecorder(null);
        }
    };

    // ==================== RECONOCIMIENTO PARA CONSIDERACIONES ====================
    const startListeningConsiderations = () => {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            alert('Tu navegador no soporta reconocimiento de voz.');
            return;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();

        recognition.lang = 'es-ES';
        recognition.continuous = false;
        recognition.interimResults = false;

        recognition.onstart = () => {
            setRecordingConsiderations(true);
            setTranscribingConsiderations(true);
        };

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            setStudentConsiderations(prev => prev ? `${prev} ${transcript}` : transcript);
        };

        recognition.onerror = (event) => {
            console.error('Error:', event.error);
            setRecordingConsiderations(false);
            setTranscribingConsiderations(false);
        };

        recognition.onend = () => {
            setRecordingConsiderations(false);
            setTranscribingConsiderations(false);
        };

        recognition.start();
        setMediaRecorder(recognition);
    };

    const stopListeningConsiderations = () => {
        if (mediaRecorder) {
            mediaRecorder.stop();
            setRecordingConsiderations(false);
            setTranscribingConsiderations(false);
            setMediaRecorder(null);
        }
    };

    const deleteAudioAnswer = (questionId) => {
        setAudioAnswers(prev => {
            const newState = { ...prev };
            delete newState[questionId];
            return newState;
        });
    };

    // ==================== GENERAR FICHA ====================
    const generateWorksheet = async () => {
        if (!selectedSubject) {
            alert('Por favor, selecciona una asignatura');
            return;
        }

        setLoading(true);
        try {
            const typeText = worksheetType === 'exam' ? 'EXAMEN' : 'FICHA DE EJERCICIOS';

            // Preparar información de materiales seleccionados
            let materialsContext = '';
            if (selectedMaterials.length > 0) {
                const selectedMaterialsInfo = availableMaterials
                    .filter(m => selectedMaterials.includes(m.id))
                    .map(m => `- ${m.name} (${m.type})`)
                    .join('\n');

                materialsContext = `\n\nMATERIALES DE REFERENCIA QUE DEBES USAR:
El estudiante ha seleccionado estos materiales como referencia. Genera las preguntas basándote en el contenido de estos materiales:
${selectedMaterialsInfo}
`;
            }

            // Preparar consideraciones del estudiante
            let considerationsContext = '';
            if (studentConsiderations.trim()) {
                considerationsContext = `\n\nCONSIDERACIONES DEL ESTUDIANTE:
El estudiante ha añadido estas notas que debes tener en cuenta al generar las preguntas:
"${studentConsiderations}"
`;
            }

            // Preparar tipos de preguntas seleccionados
            const getAllTypes = () => {
                const types = [];
                Object.values(questionTypesMaster).forEach(cat => {
                    cat.types.forEach(t => types.push(t));
                });
                return types;
            };

            const selectedTypesDetails = getAllTypes()
                .filter(t => selectedQuestionTypes.includes(t.id))
                .map(t => `- ${t.label} (${t.id}): ${t.prompt_hint}`)
                .join('\n');

            const prompt = `
Eres un profesor experto del sistema educativo español (LOMLOE). Genera un ${typeText}.

ESTUDIANTE:
- Nombre: ${userProfile.name || 'Estudiante'}
- Curso: ${userProfile.grade || 'Primaria'}
- Edad: ${userProfile.age || 8} años${materialsContext}${considerationsContext}

CONFIGURACIÓN:
- Asignatura: ${selectedSubject}
- Dificultad: ${difficultyLevel}
- Número de preguntas: ${numQuestions}
- Tipo: ${worksheetType}

TIPOS DE PREGUNTAS A GENERAR (IMPORTANTE):
Debes generar ${numQuestions} preguntas MEZCLANDO los siguientes tipos:
${selectedTypesDetails}

DISTRIBUYE las preguntas entre estos tipos de forma equilibrada. Por ejemplo, si hay 10 preguntas y 2 tipos seleccionados, genera 5 de cada tipo.

IMPORTANTE: Responde ÚNICAMENTE con el JSON válido. No añadas texto antes ni después.
Estructura JSON requerida:
{
  "title": "Título del ${typeText}",
  "subject": "${selectedSubject}",
  "grade_level": "${userProfile.grade || 'Primaria'}",
  "questions": [
    {
      "id": 1,
      "type": "multiple_choice",
      "question": "Pregunta completa",
      "options": ["A) Opción 1", "B) Opción 2", "C) Opción 3", "D) Opción 4"],
      "points": 2
    },
    {
      "id": 2,
      "type": "fill_blanks",
      "question": "El agua hierve a ____ grados centígrados.",
      "points": 2
    },
    {
      "id": 3,
      "type": "match_pairs",
      "question": "Empareja cada órgano con su función",
      "pairs": [
        {"left": "Corazón", "right_correct": "Bombea la sangre"},
        {"left": "Pulmones", "right_correct": "Respiración"}
      ],
      "points": 3
    }
  ],
  "answer_key": [
    {
      "question_id": 1,
      "correct_answer": "A) Opción 1",
      "explanation": "Explicación de por qué es correcta"
    },
    {
      "question_id": 2,
      "correct_answer": "100",
      "explanation": "El agua hierve a 100°C a nivel del mar"
    },
    {
      "question_id": 3,
      "correct_answer": "Corazón-Bombea la sangre; Pulmones-Respiración",
      "explanation": "Correspondencias correctas"
    }
  ]
}

NOTAS:
- Para "multiple_choice": incluye array "options" con 4 opciones.
- Para "true_false": la pregunta debe ser una afirmación.
- Para "match_pairs": incluye array "pairs" con objetos {left, right_correct}.
- Para "order_elements": la pregunta debe ser una lista desordenada.
- Para otros tipos, usa el campo "question" con el formato apropiado.
            `.trim();

            const resultText = await callGeminiAPI(prompt);
            const worksheetData = extractJSON(resultText); // ✅ Usar extractor robusto

            setGeneratedWorksheet(worksheetData);
            setStudentAnswers({});
            setCorrectionResult(null);
            setAudioAnswers({});

        } catch (error) {
            console.error('Error generando ficha:', error);
            alert(`Error: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    // ==================== GESTIÓN DE FICHAS GUARDADAS ====================
    const [savedWorksheets, setSavedWorksheets] = useState([]);
    const [showSavedList, setShowSavedList] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (showSavedList) {
            loadSavedWorksheets();
        }
    }, [showSavedList]);

    const saveWorksheet = async () => {
        if (!generatedWorksheet) return;
        setSaving(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Usuario no autenticado');

            const worksheetDataToSave = {
                user_id: user.id,
                subject: generatedWorksheet.subject,
                type: worksheetType,
                title: generatedWorksheet.title || `${worksheetType === 'exam' ? 'Examen' : 'Ficha'} de ${generatedWorksheet.subject}`,
                worksheet_data: generatedWorksheet,
                student_answers: studentAnswers,
                status: correctionResult ? 'completed' : 'in_progress',
                score: correctionResult ? correctionResult.score : null,
                updated_at: new Date()
            };

            // Si ya tiene ID (es una ficha cargada), actualizamos. Si no, insertamos.
            if (generatedWorksheet.db_id) {
                const { error } = await supabase
                    .from('worksheets')
                    .update(worksheetDataToSave)
                    .eq('id', generatedWorksheet.db_id);
                if (error) throw error;
            } else {
                const { data, error } = await supabase
                    .from('worksheets')
                    .insert(worksheetDataToSave)
                    .select();
                if (error) throw error;
                // Actualizar el ID en el estado local para futuros guardados
                if (data && data[0]) {
                    setGeneratedWorksheet(prev => ({ ...prev, db_id: data[0].id }));
                }
            }

            alert('✅ Ficha guardada correctamente');
            loadSavedWorksheets(); // Refrescar lista si está abierta
        } catch (error) {
            console.error('Error al guardar:', error);
            alert('Error al guardar la ficha: ' + error.message);
        } finally {
            setSaving(false);
        }
    };

    const loadSavedWorksheets = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data, error } = await supabase
                .from('worksheets')
                .select('*')
                .eq('user_id', user.id)
                .order('updated_at', { ascending: false });

            if (error) throw error;
            setSavedWorksheets(data || []);
        } catch (error) {
            console.error('Error al cargar fichas:', error);
        }
    };

    const loadWorksheetFromSave = (saved) => {
        setGeneratedWorksheet({
            ...saved.worksheet_data,
            db_id: saved.id // Importante: mantenemos el ID de la BD
        });
        setStudentAnswers(saved.student_answers || {});
        setWorksheetType(saved.type);
        setSelectedSubject(saved.subject);

        // Si estaba corregida, podríamos intentar restaurar el resultado, 
        // pero por ahora lo dejamos en modo "revisión" o permitir recorregir.
        if (saved.status === 'completed' && saved.score !== null) {
            // Opcional: Podríamos guardar el resultado de corrección en la BD también para restaurarlo
            // Por ahora, permitimos ver las respuestas y volver a corregir si se desea
        }

        setShowSavedList(false);
    };

    const deleteWorksheet = async (id) => {
        if (!window.confirm('¿Estás seguro de querer borrar esta ficha?')) return;
        try {
            const { error } = await supabase.from('worksheets').delete().eq('id', id);
            if (error) throw error;
            loadSavedWorksheets();
        } catch (error) {
            console.error('Error al borrar:', error);
            alert('Error al borrar');
        }
    };

    // ==================== CORREGIR FICHA ====================
    const correctWorksheet = async () => {
        setLoading(true);
        try {
            const questionsWithAnswers = generatedWorksheet.questions.map(q => ({
                ...q,
                student_answer: studentAnswers[q.id] || 'Sin respuesta',
                correct_answer: generatedWorksheet.answer_key.find(a => a.question_id === q.id)?.correct_answer
            }));

            const prompt = `
Eres un profesor experto. Corrige este ${generatedWorksheet.subject} de ${userProfile.grade}.

PREGUNTAS Y RESPUESTAS:
${questionsWithAnswers.map(q => `
Pregunta ${q.id}: ${q.question}
Respuesta del estudiante: ${q.student_answer}
Respuesta correcta: ${q.correct_answer}
`).join('\n')}

IMPORTANTE: Responde ÚNICAMENTE con el JSON válido. No añadas texto antes ni después.
Estructura JSON requerida:
{
  "score": 85,
  "correct_answers": 8,
  "total_questions": ${generatedWorksheet.questions.length},
  "feedback": "Comentario general para el estudiante",
  "question_breakdown": [
    {
      "question_id": 1,
      "is_correct": true,
      "feedback": "¡Excelente! Muy bien explicado."
    }
  ]
}
            `.trim();

            const resultText = await callGeminiAPI(prompt);
            const correction = extractJSON(resultText); // ✅ Usar extractor robusto

            setCorrectionResult(correction);
            alert('¡Ficha corregida!');

        } catch (error) {
            console.error('Error corrigiendo:', error);
            alert(`Error al corregir: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    // ==================== RENDER ====================
    return (
        <div className="space-y-6 px-4 py-6">
            {!generatedWorksheet && (
                <Card>
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                                <Brain className="h-6 w-6 mr-2 text-indigo-600" />
                                Generador de Fichas
                            </h2>
                            <Button
                                onClick={() => setShowSavedList(!showSavedList)}
                                variant="outline"
                                size="sm"
                            >
                                {showSavedList ? 'Ocultar Fichas' : '📂 Mis Fichas'}
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* LISTA DE FICHAS GUARDADAS */}
                        {showSavedList && (
                            <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                                <h3 className="font-bold text-gray-700 mb-3">Fichas Guardadas</h3>
                                {savedWorksheets.length === 0 ? (
                                    <p className="text-sm text-gray-500">No tienes fichas guardadas.</p>
                                ) : (
                                    <div className="space-y-2 max-h-60 overflow-y-auto">
                                        {savedWorksheets.map(sheet => (
                                            <div key={sheet.id} className="flex justify-between items-center p-3 bg-white rounded border hover:shadow-sm">
                                                <div>
                                                    <p className="font-semibold text-sm">{sheet.title}</p>
                                                    <p className="text-xs text-gray-500">
                                                        {new Date(sheet.updated_at).toLocaleDateString()} - {sheet.status === 'completed' ? '✅ Completada' : '⏳ En progreso'}
                                                        {sheet.score !== null && ` - Nota: ${sheet.score}`}
                                                    </p>
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button size="sm" variant="ghost" onClick={() => loadWorksheetFromSave(sheet)}>
                                                        Cargar
                                                    </Button>
                                                    <Button size="sm" variant="ghost" className="text-red-500" onClick={() => deleteWorksheet(sheet.id)}>
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Tipo de Actividad */}
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
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Asignatura */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Asignatura
                            </label>
                            <select
                                value={selectedSubject}
                                onChange={(e) => setSelectedSubject(e.target.value)}
                                className="w-full px-4 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                            >
                                <option value="">Selecciona una asignatura...</option>
                                {availableSubjects.map(s => (
                                    <option key={s} value={s}>{s}</option>
                                ))}
                            </select>
                        </div>

                        {/* Dificultad */}
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

                        {/* Número de Preguntas */}
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

                        {/* ✅ NUEVO: Tipos de Preguntas */}
                        <div className="border-t pt-6">
                            <label className="block text-sm font-medium text-gray-700 mb-3">
                                🎲 Tipos de Preguntas a Generar
                            </label>
                            <p className="text-xs text-gray-600 mb-4">
                                Selecciona qué formatos de preguntas quieres incluir en la ficha. La IA mezclará los tipos seleccionados.
                            </p>

                            {Object.entries(questionTypesMaster).map(([category, categoryData]) => (
                                <div key={category} className="mb-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <h4 className="text-sm font-semibold text-gray-800">{categoryData.label}</h4>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const allTypeIds = categoryData.types.map(t => t.id);
                                                const allSelected = allTypeIds.every(id => selectedQuestionTypes.includes(id));
                                                if (allSelected) {
                                                    setSelectedQuestionTypes(selectedQuestionTypes.filter(id => !allTypeIds.includes(id)));
                                                } else {
                                                    setSelectedQuestionTypes([...new Set([...selectedQuestionTypes, ...allTypeIds])]);
                                                }
                                            }}
                                            className="text-xs text-indigo-600 hover:text-indigo-800 underline"
                                        >
                                            {categoryData.types.every(t => selectedQuestionTypes.includes(t.id)) ? 'Deseleccionar' : 'Seleccionar'} todas
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        {categoryData.types.map(type => (
                                            <label
                                                key={type.id}
                                                className={`flex items-start gap-2 p-3 border-2 rounded-lg cursor-pointer transition-all ${selectedQuestionTypes.includes(type.id)
                                                    ? 'border-indigo-600 bg-indigo-50'
                                                    : 'border-gray-200 hover:border-indigo-300 bg-white'
                                                    }`}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={selectedQuestionTypes.includes(type.id)}
                                                    onChange={(e) => {
                                                        if (e.target.checked) {
                                                            setSelectedQuestionTypes([...selectedQuestionTypes, type.id]);
                                                        } else {
                                                            setSelectedQuestionTypes(selectedQuestionTypes.filter(id => id !== type.id));
                                                        }
                                                    }}
                                                    className="mt-1 rounded text-indigo-600 focus:ring-indigo-500"
                                                />
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="text-base">{type.icon}</span>
                                                        <span className="text-sm font-medium text-gray-800">{type.label}</span>
                                                    </div>
                                                    <p className="text-xs text-gray-500">{type.description}</p>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            ))}

                            {selectedQuestionTypes.length === 0 && (
                                <p className="text-xs text-red-600 mt-2">⚠️ Debes seleccionar al menos un tipo de pregunta</p>
                            )}
                        </div>

                        {/* ✅ NUEVO: Seleccionar Materiales */}
                        <div className="border-t pt-6">
                            <div className="flex items-center justify-between mb-3">
                                <label className="block text-sm font-medium text-gray-700">
                                    📚 Materiales de Referencia (Opcional)
                                </label>
                                <Button
                                    onClick={loadAvailableMaterials}
                                    variant="ghost"
                                    size="sm"
                                    className="text-indigo-600 hover:bg-indigo-50 text-xs"
                                    type="button"
                                >
                                    🔄 Actualizar lista
                                </Button>
                            </div>
                            <p className="text-xs text-gray-600 mb-3">
                                Selecciona materiales que la IA debe usar como base para generar las preguntas
                            </p>
                            {availableMaterials.length > 0 ? (
                                <>
                                    <div className="max-h-40 overflow-y-auto border rounded-lg p-3 bg-gray-50">
                                        {availableMaterials.map(material => (
                                            <label key={material.id} className="flex items-center gap-2 p-2 hover:bg-white rounded cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedMaterials.includes(material.id)}
                                                    onChange={(e) => {
                                                        if (e.target.checked) {
                                                            setSelectedMaterials([...selectedMaterials, material.id]);
                                                        } else {
                                                            setSelectedMaterials(selectedMaterials.filter(id => id !== material.id));
                                                        }
                                                    }}
                                                    className="rounded text-indigo-600 focus:ring-indigo-500"
                                                />
                                                <span className="text-sm flex-1">
                                                    {material.name}
                                                    <span className="text-gray-500 text-xs ml-2">({material.type} - {material.subject})</span>
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                    {selectedMaterials.length > 0 && (
                                        <p className="text-xs text-green-600 mt-2">
                                            ✓ {selectedMaterials.length} material{selectedMaterials.length > 1 ? 'es' : ''} seleccionado{selectedMaterials.length > 1 ? 's' : ''}
                                        </p>
                                    )}
                                </>
                            ) : (
                                <div className="border rounded-lg p-4 bg-yellow-50 border-yellow-200">
                                    <p className="text-sm text-yellow-800">
                                        📁 No tienes materiales subidos. Ve a <strong>"Subir Material"</strong> para añadir libros o PDFs que la IA pueda usar.
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* ✅ NUEVO: Consideraciones del Estudiante */}
                        <div className="border-t pt-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                💭 Consideraciones Personales (Opcional)
                            </label>
                            <p className="text-xs text-gray-600 mb-3">
                                Añade notas que la IA debe tener en cuenta (ej: "Necesito practicar las tablas del 7", "Me cuesta la ortografía de la B y la V")
                            </p>
                            <Textarea
                                placeholder="Escribe aquí tus consideraciones o usa el micrófono..."
                                value={studentConsiderations}
                                onChange={(e) => setStudentConsiderations(e.target.value)}
                                rows={3}
                                className="mb-2"
                            />
                            <div className="flex items-center gap-2">
                                {!recordingConsiderations ? (
                                    <Button
                                        onClick={startListeningConsiderations}
                                        variant="outline"
                                        size="sm"
                                        className="border-indigo-200 text-indigo-700 hover:bg-indigo-50"
                                        type="button"
                                    >
                                        <Mic className="h-4 w-4 mr-2" /> Añadir con Voz
                                    </Button>
                                ) : (
                                    <Button
                                        onClick={stopListeningConsiderations}
                                        className="bg-red-500 hover:bg-red-600 text-white animate-pulse"
                                        size="sm"
                                        type="button"
                                    >
                                        <StopCircle className="h-4 w-4 mr-2" /> Detener
                                    </Button>
                                )}
                                {transcribingConsiderations && (
                                    <span className="text-xs text-indigo-600 flex items-center gap-1">
                                        <Loader className="h-3 w-3 animate-spin" /> Transcribiendo...
                                    </span>
                                )}
                                {studentConsiderations && (
                                    <Button
                                        onClick={() => setStudentConsiderations('')}
                                        variant="ghost"
                                        size="sm"
                                        className="text-red-500 hover:bg-red-50"
                                        type="button"
                                    >
                                        <Trash2 className="h-4 w-4 mr-1" /> Limpiar
                                    </Button>
                                )}
                            </div>
                        </div>

                        {/* Botón Generar */}
                        <Button
                            onClick={generateWorksheet}
                            disabled={loading || !selectedSubject}
                            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-4 rounded-lg hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 font-semibold text-lg flex items-center justify-center shadow-lg"
                        >
                            <Zap className="h-6 w-6 mr-2" />
                            {loading ? 'Generando Ficha...' : `Generar ${worksheetTypes.find(t => t.value === worksheetType)?.label}`}
                        </Button>
                    </CardContent>
                </Card>
            )}

            {/* FICHA GENERADA */}
            {generatedWorksheet && !correctionResult && (
                <Card>
                    <CardHeader>
                        <h2 className="text-2xl font-bold text-gray-900">{generatedWorksheet.title}</h2>
                        <p className="text-sm text-gray-600 mt-1">
                            {generatedWorksheet.subject} - {generatedWorksheet.grade_level}
                        </p>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {generatedWorksheet.questions.map((q, idx) => (
                            <div key={q.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                                <div className="flex justify-between items-start mb-3">
                                    <h3 className="font-semibold text-gray-900">
                                        {idx + 1}. {q.question}
                                    </h3>
                                    <Badge variant="blue">{q.points} pts</Badge>
                                </div>

                                {/* Campo de Respuesta según el tipo de pregunta */}
                                {q.type === 'multiple_choice' && q.options ? (
                                    <div className="space-y-2 mb-3">
                                        {q.options.map((option, optIdx) => (
                                            <label key={optIdx} className={`flex items-center gap-2 p-2 border-2 rounded ${studentAnswers[q.id] === option ? 'border-indigo-600 bg-indigo-50' : 'border-gray-200'
                                                } cursor-pointer hover:border-indigo-300`}>
                                                <input
                                                    type="radio"
                                                    name={`q-${q.id}`}
                                                    value={option}
                                                    checked={studentAnswers[q.id] === option}
                                                    onChange={(e) => setStudentAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
                                                    className="text-indigo-600"
                                                />
                                                <span className="text-sm">{option}</span>
                                            </label>
                                        ))}
                                    </div>
                                ) : q.type === 'true_false' ? (
                                    <div className="flex gap-3 mb-3">
                                        <Button
                                            onClick={() => setStudentAnswers(prev => ({ ...prev, [q.id]: 'Verdadero' }))}
                                            variant={studentAnswers[q.id] === 'Verdadero' ? 'primary' : 'outline'}
                                            className={studentAnswers[q.id] === 'Verdadero' ? 'bg-green-600' : ''}
                                        >
                                            ✓ Verdadero
                                        </Button>
                                        <Button
                                            onClick={() => setStudentAnswers(prev => ({ ...prev, [q.id]: 'Falso' }))}
                                            variant={studentAnswers[q.id] === 'Falso' ? 'primary' : 'outline'}
                                            className={studentAnswers[q.id] === 'Falso' ? 'bg-red-600' : ''}
                                        >
                                            ✗ Falso
                                        </Button>
                                    </div>
                                ) : (
                                    <Textarea
                                        placeholder="Escribe tu respuesta aquí..."
                                        value={studentAnswers[q.id] || ''}
                                        onChange={(e) => setStudentAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
                                        rows={3}
                                        className="mb-3"
                                    />
                                )}

                                {/* ✅ BOTONES DE VOZ */}
                                <div className="flex items-center gap-3">
                                    {!audioAnswers[q.id] ? (
                                        recording === q.id ? (
                                            <Button
                                                onClick={stopListening}
                                                className="bg-red-500 hover:bg-red-600 text-white animate-pulse"
                                                size="sm"
                                            >
                                                <StopCircle className="h-4 w-4 mr-2" /> Detener Grabación
                                            </Button>
                                        ) : (
                                            <Button
                                                onClick={() => startListening(q.id)}
                                                variant="outline"
                                                className="border-indigo-200 text-indigo-700 hover:bg-indigo-50"
                                                size="sm"
                                                disabled={recording !== null}
                                            >
                                                <Mic className="h-4 w-4 mr-2" /> Responder con Voz
                                            </Button>
                                        )
                                    ) : (
                                        <div className="flex items-center gap-3 bg-indigo-50 p-2 rounded-lg border border-indigo-100 w-full">
                                            <span className="text-sm text-indigo-800 flex-1 italic">
                                                Transcripción completada
                                            </span>

                                            {transcribing === q.id ? (
                                                <span className="text-xs text-indigo-600 flex items-center gap-1">
                                                    <Loader className="h-3 w-3 animate-spin" /> Transcribiendo...
                                                </span>
                                            ) : (
                                                <Button
                                                    onClick={() => deleteAudioAnswer(q.id)}
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-red-500 hover:bg-red-50 hover:text-red-700"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Mostrar Transcripción */}
                                {audioAnswers[q.id]?.transcription && (
                                    <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                                        <p className="text-xs font-semibold text-green-900 mb-1">✓ Texto transcrito (puedes editarlo arriba):</p>
                                        <p className="text-sm text-green-800">{audioAnswers[q.id].transcription}</p>
                                    </div>
                                )}
                            </div>
                        ))}

                        <div className="flex gap-3 flex-wrap">
                            <Button
                                onClick={saveWorksheet}
                                disabled={saving}
                                variant="outline"
                                className="flex-1 border-indigo-600 text-indigo-600 hover:bg-indigo-50"
                            >
                                {saving ? 'Guardando...' : '💾 Guardar Progreso'}
                            </Button>
                            <Button
                                onClick={correctWorksheet}
                                disabled={loading || saving}
                                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                            >
                                <CheckCircle className="h-5 w-5 mr-2" />
                                {loading ? 'Corrigiendo...' : 'Corregir Ficha'}
                            </Button>
                            <Button
                                onClick={() => setGeneratedWorksheet(null)}
                                variant="outline"
                            >
                                Nueva
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* RESULTADOS DE CORRECCIÓN */}
            {correctionResult && (
                <Card>
                    <CardHeader>
                        <h2 className="text-2xl font-bold text-gray-900">Resultados</h2>
                    </CardHeader>
                    <CardContent>
                        <div className="text-center mb-6">
                            <div className="text-6xl font-bold text-indigo-600 mb-2">
                                {correctionResult.score}%
                            </div>
                            <p className="text-lg text-gray-600">
                                {correctionResult.correct_answers} de {correctionResult.total_questions} correctas
                            </p>
                        </div>

                        <Alert variant="success" className="mb-6">
                            <p className="font-semibold mb-2">Comentario del Profesor:</p>
                            <p>{correctionResult.feedback}</p>
                        </Alert>

                        <div className="space-y-4">
                            {correctionResult.question_breakdown?.map((qb, idx) => {
                                const originalQuestion = generatedWorksheet.questions.find(q => q.id === qb.question_id);
                                const studentAnswer = studentAnswers[qb.question_id] || '(Sin respuesta)';
                                const correctAnswer = generatedWorksheet.answer_key.find(a => a.question_id === qb.question_id)?.correct_answer;

                                return (
                                    <div
                                        key={idx}
                                        className={`p-4 rounded-lg border-2 ${qb.is_correct
                                            ? 'bg-green-50 border-green-200'
                                            : 'bg-red-50 border-red-200'
                                            }`}
                                    >
                                        <div className="flex items-center mb-2">
                                            {qb.is_correct ? (
                                                <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                                            ) : (
                                                <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
                                            )}
                                            <span className="font-bold text-gray-800">
                                                Pregunta {qb.question_id}: {originalQuestion?.question}
                                            </span>
                                        </div>

                                        <div className="ml-7 space-y-2">
                                            <div>
                                                <span className="text-xs font-semibold text-gray-500 uppercase">Tu Respuesta:</span>
                                                <p className={`text-sm ${qb.is_correct ? 'text-green-800' : 'text-red-800 font-medium'}`}>
                                                    {studentAnswer}
                                                </p>
                                            </div>

                                            {!qb.is_correct && (
                                                <div>
                                                    <span className="text-xs font-semibold text-gray-500 uppercase">Respuesta Correcta:</span>
                                                    <p className="text-sm text-green-700 font-medium">
                                                        {correctAnswer}
                                                    </p>
                                                </div>
                                            )}

                                            <div className="mt-2 pt-2 border-t border-gray-200/50">
                                                <span className="text-xs font-semibold text-gray-500 uppercase">Feedback:</span>
                                                <p className="text-sm text-gray-700 italic">
                                                    {qb.feedback}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <Button
                            onClick={() => {
                                setGeneratedWorksheet(null);
                                setCorrectionResult(null);
                                setStudentAnswers({});
                                setAudioAnswers({});
                            }}
                            className="w-full mt-6 bg-indigo-600 hover:bg-indigo-700 text-white"
                        >
                            Generar Nueva Ficha
                        </Button>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default WorksheetGeneratorComplete;
