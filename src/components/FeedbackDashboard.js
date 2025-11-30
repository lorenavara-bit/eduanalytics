import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import {
    TrendingUp,
    Award,
    Target,
    AlertCircle,
    BookOpen,
    Brain,
    CheckCircle,
    Download,
    Calendar,
    BarChart3
} from 'lucide-react';
import { Line, Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    RadialLinearScale,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    RadialLinearScale,
    Title,
    Tooltip,
    Legend,
    Filler
);

const FeedbackDashboard = ({ session, userProfile, callGeminiAPI }) => {
    const [loading, setLoading] = useState(true);
    const [generatingReport, setGeneratingReport] = useState(false);
    const [studentProfile, setStudentProfile] = useState(null);
    const [worksheetResults, setWorksheetResults] = useState([]);
    const [examResults, setExamResults] = useState([]);
    const [learningAnalytics, setLearningAnalytics] = useState([]);
    const [feedbackReport, setFeedbackReport] = useState(null);
    const [curriculumStandards, setCurriculumStandards] = useState([]);
    const [performanceTrends, setPerformanceTrends] = useState([]);
    const [timeRange, setTimeRange] = useState('30'); // days

    useEffect(() => {
        if (session?.user?.id) {
            loadAllData();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [session, timeRange]);

    const loadAllData = async () => {
        setLoading(true);
        try {
            await Promise.all([
                loadStudentProfile(),
                loadWorksheetResults(),
                loadExamResults(),
                loadLearningAnalytics(),
                loadCurriculumStandards(),
                loadLatestFeedbackReport()
            ]);
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadStudentProfile = async () => {
        const { data, error } = await supabase
            .from('student_profiles')
            .select('*')
            .eq('user_id', session.user.id)
            .single();

        if (data) {
            setStudentProfile(data);
        } else if (!error || error.code === 'PGRST116') {
            // Create profile if it doesn't exist
            const newProfile = {
                user_id: session.user.id,
                name: userProfile.name || 'Estudiante',
                age: userProfile.age || calculateAge(userProfile.birth_date),
                grade_level: userProfile.grade || '',
                interests: userProfile.interests ? [userProfile.interests] : [],
                observations: userProfile.observations || ''
            };

            const { data: created } = await supabase
                .from('student_profiles')
                .insert(newProfile)
                .select()
                .single();

            if (created) setStudentProfile(created);
        }
    };

    const loadWorksheetResults = async () => {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - parseInt(timeRange));

        const { data } = await supabase
            .from('worksheet_results')
            .select(`
        *,
        worksheets (
          title,
          subject,
          grade_level
        )
      `)
            .eq('user_id', session.user.id)
            .gte('completed_at', cutoffDate.toISOString())
            .order('completed_at', { ascending: false });

        if (data) setWorksheetResults(data);
    };

    const loadExamResults = async () => {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - parseInt(timeRange));

        const { data } = await supabase
            .from('exam_results')
            .select('*')
            .eq('user_id', session.user.id)
            .gte('completed_at', cutoffDate.toISOString())
            .order('completed_at', { ascending: false });

        if (data) setExamResults(data);
    };

    const loadLearningAnalytics = async () => {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - parseInt(timeRange));

        const { data } = await supabase
            .from('learning_analytics')
            .select('*')
            .eq('user_id', session.user.id)
            .gte('date', cutoffDate.toISOString().split('T')[0])
            .order('date', { ascending: true });

        if (data) {
            setLearningAnalytics(data);
            calculatePerformanceTrends(data);
        }
    };

    const loadCurriculumStandards = async () => {
        if (!studentProfile?.grade_level) return;

        const { data } = await supabase
            .from('curriculum_standards')
            .select('*')
            .eq('grade_level', studentProfile.grade_level);

        if (data) setCurriculumStandards(data);
    };

    const loadLatestFeedbackReport = async () => {
        const { data } = await supabase
            .from('feedback_reports')
            .select('*')
            .eq('user_id', session.user.id)
            .order('generated_at', { ascending: false })
            .limit(1)
            .single();

        if (data) setFeedbackReport(data);
    };

    const calculateAge = (birthDate) => {
        if (!birthDate) return null;
        const today = new Date();
        const birth = new Date(birthDate);
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        return age;
    };

    const calculatePerformanceTrends = (analytics) => {
        // Group by date and calculate average
        const trendMap = {};
        analytics.forEach(item => {
            if (!trendMap[item.date]) {
                trendMap[item.date] = { scores: [], count: 0 };
            }
            trendMap[item.date].scores.push(item.score);
            trendMap[item.date].count++;
        });

        const trends = Object.entries(trendMap).map(([date, data]) => ({
            date,
            avgScore: data.scores.reduce((a, b) => a + b, 0) / data.count
        }));

        setPerformanceTrends(trends);
    };

    const generateAIFeedbackReport = async () => {
        setGeneratingReport(true);
        try {
            // Gather all performance data
            const allActivities = [
                ...worksheetResults.map(w => ({
                    type: 'worksheet',
                    subject: w.worksheets?.subject || 'General',
                    score: w.score,
                    date: w.completed_at,
                    details: `${w.correct_answers}/${w.total_questions} correctas`
                })),
                ...examResults.map(e => ({
                    type: 'exam',
                    subject: e.subject,
                    score: e.total_score,
                    date: e.completed_at,
                    details: e.corrections_notes
                }))
            ];

            // Calculate statistics by subject
            const subjectStats = {};
            allActivities.forEach(activity => {
                if (!subjectStats[activity.subject]) {
                    subjectStats[activity.subject] = { scores: [], count: 0 };
                }
                subjectStats[activity.subject].scores.push(activity.score);
                subjectStats[activity.subject].count++;
            });

            const subjectAverages = Object.entries(subjectStats).map(([subject, data]) => ({
                subject,
                average: (data.scores.reduce((a, b) => a + b, 0) / data.count).toFixed(2),
                count: data.count
            }));

            // Overall average
            const allScores = allActivities.map(a => a.score);
            const overallAverage = allScores.length > 0
                ? (allScores.reduce((a, b) => a + b, 0) / allScores.length).toFixed(2)
                : 0;

            // Prepare curriculum context
            const curriculumContext = curriculumStandards
                .map(std => `${std.competency_code}: ${std.competency_name} - ${std.description}`)
                .join('\n');

            // Create AI prompt
            const prompt = `
Eres un pedagogo experto en el sistema educativo español (LOMLOE). Analiza los datos de aprendizaje de este estudiante y genera un informe detallado.

INFORMACIÓN DEL ESTUDIANTE:
- Nombre: ${studentProfile?.name || 'Estudiante'}
- Edad: ${studentProfile?.age || userProfile.age} años
- Curso: ${studentProfile?.grade_level || userProfile.grade}
- Intereses: ${studentProfile?.interests?.join(', ') || userProfile.interests || 'No especificados'}
- Observaciones: ${studentProfile?.observations || userProfile.observations || 'Ninguna'}

CURRÍCULO ESPAÑOL (LOMLOE) CORRESPONDIENTE:
${curriculumContext || 'Estándares curriculares no disponibles'}

RENDIMIENTO RECIENTE (últimos ${timeRange} días):
- Actividades completadas: ${allActivities.length} (${worksheetResults.length} fichas, ${examResults.length} exámenes)
- Nota media global: ${overallAverage}/100
- Desglose por asignatura:
${subjectAverages.map(s => `  • ${s.subject}: ${s.average}/100 (${s.count} actividades)`).join('\n')}

TENDENCIA DE RENDIMIENTO:
${performanceTrends.length > 0 ?
                    `Evolución: ${performanceTrends[0].avgScore.toFixed(1)} → ${performanceTrends[performanceTrends.length - 1].avgScore.toFixed(1)}` :
                    'Datos insuficientes'}

TAREAS RECIENTES:
${allActivities.slice(0, 10).map(a =>
                        `- ${a.type.toUpperCase()} de ${a.subject}: ${a.score}/100 (${a.details})`
                    ).join('\n')}

GENERA UN INFORME DE FEEDBACK QUE INCLUYA:

1. **Resumen General del Rendimiento** (2-3 frases)
   - Evaluación global del estudiante
   - Comparación con estándares del curso según LOMLOE

2. **Top 3 Fortalezas** (puntos fuertes identificados)
   - Para cada fortaleza incluye:
     * Nombre del área/competencia
     * Puntuación estimada (0-100)
     * Potencial máximo estimado
     * Ejemplo concreto de las actividades realizadas

3. **Top 3 Áreas de Mejora** (puntos débiles o necesidades)
   - Para cada área incluye:
     * Descripción específica del área
     * Motivo por el que necesita refuerzo
     * Sugerencia concreta de mejora

4. **Recomendaciones para Padres** (5-8 recomendaciones agrupadas por categoría)
   Agrupa en categorías como:
   - Reforzar Conocimientos
   - Desarrollar Habilidades
   - Motivación y Hábitos
   - Recursos Sugeridos
   
   Para cada categoría:
   - Nombre de la categoría
   - Icono sugerido (Target, BookOpen, Brain, Award, etc.)
   - Color de tema (texto y fondo)
   - Lista de acciones específicas y prácticas

5. **Próximos Pasos de Aprendizaje**
   - Objetivos a corto plazo (1-2 semanas)
   - Objetivos a medio plazo (1 mes)
   - Competencias del currículo a trabajar

Responde ÚNICAMENTE con un JSON válido con esta estructura EXACTA:

{
  "summary": "Texto del resumen general...",
  "overall_score": 85,
  "grade_comparison": "Por encima/En línea/Por debajo del nivel esperado para 3º de Primaria",
  "strengths": [
    {
      "subject": "Nombre del área fuerte",
      "score": 90,
      "potential": 95,
      "example": "Ejemplo concreto observado"
    }
  ],
  "weaknesses": [
    {
      "area": "Área que necesita mejora",
      "reason": "Por qué necesita trabajo",
      "suggestion": "Cómo mejorarla"
    }
  ],
  "recommendations": [
    {
      "category": "Reforzar Conocimientos",
      "icon": "Target",
      "color": "text-blue-600",
      "bgColor": "bg-blue-50",
      "items": ["Acción específica 1", "Acción específica 2"]
    }
  ],
  "next_steps": {
    "short_term": ["Objetivo 1", "Objetivo 2"],
    "medium_term": ["Objetivo 1", "Objetivo 2"],
    "curriculum_focus": ["Competencia 1", "Competencia 2"]
  },
  "feedback_text": "Mensaje alentador y personalizado para el estudiante y sus padres..."
}
      `.trim();

            // Call Gemini API
            const resultText = await callGeminiAPI(prompt);

            // Parse JSON response
            const jsonString = resultText.replace(/```json/g, '').replace(/```/g, '').trim();
            const aiReport = JSON.parse(jsonString);

            // Save to database
            const reportData = {
                user_id: session.user.id,
                student_name: studentProfile?.name || userProfile.name,
                period_start: new Date(Date.now() - parseInt(timeRange) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                period_end: new Date().toISOString().split('T')[0],
                report_data: aiReport,
                overall_score: aiReport.overall_score,
                strengths: aiReport.strengths,
                improvements: aiReport.weaknesses,
                recommendations: aiReport.recommendations,
                progress_trends: performanceTrends,
                curriculum_comparison: {
                    grade_level: studentProfile?.grade_level,
                    comparison: aiReport.grade_comparison,
                    standards_assessed: curriculumStandards.length
                }
            };

            const { data: savedReport, error } = await supabase
                .from('feedback_reports')
                .insert(reportData)
                .select()
                .single();

            if (error) throw error;

            setFeedbackReport(savedReport);
            alert('¡Informe de feedback generado con éxito!');

        } catch (error) {
            console.error('Error generating feedback:', error);
            alert(`Error al generar el informe: ${error.message}`);
        } finally {
            setGeneratingReport(false);
        }
    };

    const downloadReport = () => {
        if (!feedbackReport) return;

        const reportText = `
INFORME DE FEEDBACK EDUCATIVO
==============================

Estudiante: ${feedbackReport.student_name}
Período: ${new Date(feedbackReport.period_start).toLocaleDateString('es-ES')} - ${new Date(feedbackReport.period_end).toLocaleDateString('es-ES')}
Generado: ${new Date(feedbackReport.generated_at).toLocaleDateString('es-ES')}

RESUMEN GENERAL
---------------
${feedbackReport.report_data.summary}

Nota Media: ${feedbackReport.overall_score}/100
Comparación Curricular: ${feedbackReport.report_data.grade_comparison}

FORTALEZAS IDENTIFICADAS
-------------------------
${feedbackReport.report_data.strengths?.map((s, i) =>
            `${i + 1}. ${s.subject} (${s.score}/100)
   Potencial: ${s.potential}/100
   Ejemplo: ${s.example}`
        ).join('\n\n')}

ÁREAS DE MEJORA
----------------
${feedbackReport.report_data.weaknesses?.map((w, i) =>
            `${i + 1}. ${w.area}
   Motivo: ${w.reason}
   Sugerencia: ${w.suggestion}`
        ).join('\n\n')}

RECOMENDACIONES PARA PADRES
----------------------------
${feedbackReport.report_data.recommendations?.map(r =>
            `${r.category}:
${r.items.map(item => `  • ${item}`).join('\n')}`
        ).join('\n\n')}

PRÓXIMOS PASOS
--------------
Corto Plazo:
${feedbackReport.report_data.next_steps?.short_term?.map(s => `  • ${s}`).join('\n')}

Medio Plazo:
${feedbackReport.report_data.next_steps?.medium_term?.map(s => `  • ${s}`).join('\n')}

Competencias a Trabajar:
${feedbackReport.report_data.next_steps?.curriculum_focus?.map(s => `  • ${s}`).join('\n')}

MENSAJE FINAL
-------------
${feedbackReport.report_data.feedback_text}
    `.trim();

        const blob = new Blob([reportText], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Informe_Feedback_${feedbackReport.student_name}_${new Date().toISOString().split('T')[0]}.txt`;
        link.click();
        URL.revokeObjectURL(url);
    };

    // Chart data preparation
    const getTrendChartData = () => {
        if (performanceTrends.length === 0) return null;

        return {
            labels: performanceTrends.map(t => new Date(t.date).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })),
            datasets: [{
                label: 'Rendimiento Promedio',
                data: performanceTrends.map(t => t.avgScore),
                borderColor: 'rgb(99, 102, 241)',
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                tension: 0.4,
                fill: true
            }]
        };
    };

    const getSubjectChartData = () => {
        const subjectScores = {};

        [...worksheetResults, ...examResults].forEach(item => {
            const subject = item.subject || item.worksheets?.subject || 'General';
            if (!subjectScores[subject]) subjectScores[subject] = [];
            subjectScores[subject].push(item.score || item.total_score);
        });

        const subjects = Object.keys(subjectScores);
        const averages = subjects.map(s =>
            subjectScores[s].reduce((a, b) => a + b, 0) / subjectScores[s].length
        );

        return {
            labels: subjects,
            datasets: [{
                label: 'Nota Media por Asignatura',
                data: averages,
                backgroundColor: [
                    'rgba(59, 130, 246, 0.7)',
                    'rgba(16, 185, 129, 0.7)',
                    'rgba(245, 158, 11, 0.7)',
                    'rgba(239, 68, 68, 0.7)',
                    'rgba(139, 92, 246, 0.7)'
                ]
            }]
        };
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Cargando datos de aprendizaje...</p>
                </div>
            </div>
        );
    }

    const totalActivities = worksheetResults.length + examResults.length;
    const allScores = [
        ...worksheetResults.map(w => w.score),
        ...examResults.map(e => e.total_score)
    ].filter(s => s != null);
    const overallAverage = allScores.length > 0
        ? (allScores.reduce((a, b) => a + b, 0) / allScores.length).toFixed(1)
        : 0;

    return (
        <div className="px-4 py-6 sm:px-0">
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg shadow-lg p-8 text-white mb-8">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">Panel de Feedback Personalizado</h1>
                        <p className="text-indigo-100 text-lg">
                            {studentProfile?.name || userProfile.name} - {studentProfile?.grade_level || userProfile.grade}
                        </p>
                        <p className="text-indigo-200 text-sm mt-1">
                            Análisis basado en datos reales del sistema educativo español (LOMLOE)
                        </p>
                    </div>
                    <div className="text-right">
                        <div className="text-4xl font-bold">{overallAverage}</div>
                        <div className="text-sm text-indigo-200">Nota Media</div>
                    </div>
                </div>
            </div>

            {/* Time Range Selector */}
            <div className="mb-6 flex items-center gap-4">
                <Calendar className="h-5 w-5 text-gray-500" />
                <label className="text-sm font-medium text-gray-700">Período de análisis:</label>
                <select
                    value={timeRange}
                    onChange={(e) => setTimeRange(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                >
                    <option value="7">Últimos 7 días</option>
                    <option value="30">Últimos 30 días</option>
                    <option value="90">Últimos 3 meses</option>
                    <option value="180">Últimos 6 meses</option>
                </select>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Actividades Completadas</p>
                            <p className="text-3xl font-bold text-gray-900 mt-2">{totalActivities}</p>
                        </div>
                        <CheckCircle className="h-12 w-12 text-green-500" />
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Fichas Realizadas</p>
                            <p className="text-3xl font-bold text-gray-900 mt-2">{worksheetResults.length}</p>
                        </div>
                        <BookOpen className="h-12 w-12 text-blue-500" />
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Exámenes Corregidos</p>
                            <p className="text-3xl font-bold text-gray-900 mt-2">{examResults.length}</p>
                        </div>
                        <Award className="h-12 w-12 text-yellow-500" />
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Estándares Curriculares</p>
                            <p className="text-3xl font-bold text-gray-900 mt-2">{curriculumStandards.length}</p>
                        </div>
                        <Target className="h-12 w-12 text-purple-500" />
                    </div>
                </div>
            </div>

            {/* Charts */}
            {performanceTrends.length > 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                            <TrendingUp className="h-5 w-5 mr-2 text-indigo-600" />
                            Evolución del Rendimiento
                        </h3>
                        <Line
                            data={getTrendChartData()}
                            options={{
                                responsive: true,
                                plugins: {
                                    legend: { display: false },
                                    tooltip: {
                                        callbacks: {
                                            label: (context) => `Nota: ${context.parsed.y.toFixed(1)}/100`
                                        }
                                    }
                                },
                                scales: {
                                    y: {
                                        min: 0,
                                        max: 100,
                                        ticks: {
                                            callback: (value) => `${value}`
                                        }
                                    }
                                }
                            }}
                        />
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                            <BarChart3 className="h-5 w-5 mr-2 text-indigo-600" />
                            Rendimiento por Asignatura
                        </h3>
                        <Bar
                            data={getSubjectChartData()}
                            options={{
                                responsive: true,
                                plugins: {
                                    legend: { display: false }
                                },
                                scales: {
                                    y: {
                                        min: 0,
                                        max: 100,
                                        ticks: {
                                            callback: (value) => `${value}`
                                        }
                                    }
                                }
                            }}
                        />
                    </div>
                </div>
            )}

            {/* Generate Report Button */}
            {totalActivities > 0 && (
                <div className="mb-8">
                    <button
                        onClick={generateAIFeedbackReport}
                        disabled={generatingReport}
                        className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-lg hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 font-semibold text-lg flex items-center justify-center shadow-lg"
                    >
                        <Brain className="h-6 w-6 mr-3" />
                        {generatingReport ? 'Generando Informe con IA...' : 'Generar Informe de Feedback con IA'}
                    </button>
                    <p className="text-sm text-gray-500 text-center mt-2">
                        La IA analizará todos los datos y generará recomendaciones personalizadas basadas en el currículo español
                    </p>
                </div>
            )}

            {/* Feedback Report Display */}
            {feedbackReport && feedbackReport.report_data && (
                <div className="space-y-6">
                    {/* Download Button */}
                    <div className="flex justify-end">
                        <button
                            onClick={downloadReport}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                        >
                            <Download className="h-4 w-4" />
                            Descargar Informe
                        </button>
                    </div>

                    {/* Summary */}
                    <div className="bg-white rounded-lg shadow-lg p-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Resumen General</h2>
                        <p className="text-gray-700 text-lg leading-relaxed mb-4">
                            {feedbackReport.report_data.summary}
                        </p>
                        <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-2">
                                <Award className="h-5 w-5 text-yellow-500" />
                                <span className="font-medium">Nota Global: {feedbackReport.overall_score}/100</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Target className="h-5 w-5 text-indigo-600" />
                                <span>{feedbackReport.report_data.grade_comparison}</span>
                            </div>
                        </div>
                    </div>

                    {/* Strengths */}
                    <div className="bg-white rounded-lg shadow-lg p-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                            <TrendingUp className="h-6 w-6 mr-2 text-green-600" />
                            Fortalezas Identificadas
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {feedbackReport.report_data.strengths?.map((strength, idx) => (
                                <div key={idx} className="bg-green-50 border border-green-200 rounded-lg p-4">
                                    <h3 className="font-semibold text-green-900 mb-2">{strength.subject}</h3>
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="flex-1 bg-green-200 rounded-full h-2">
                                            <div
                                                className="bg-green-600 h-2 rounded-full"
                                                style={{ width: `${strength.score}%` }}
                                            ></div>
                                        </div>
                                        <span className="text-sm font-medium text-green-700">{strength.score}/100</span>
                                    </div>
                                    <p className="text-sm text-gray-600 mb-2">{strength.example}</p>
                                    <p className="text-xs text-green-700">Potencial: {strength.potential}/100</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Weaknesses */}
                    <div className="bg-white rounded-lg shadow-lg p-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                            <AlertCircle className="h-6 w-6 mr-2 text-orange-600" />
                            Áreas de Mejora
                        </h2>
                        <div className="space-y-4">
                            {feedbackReport.report_data.weaknesses?.map((weakness, idx) => (
                                <div key={idx} className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                                    <h3 className="font-semibold text-orange-900 mb-2">{weakness.area}</h3>
                                    <p className="text-sm text-gray-700 mb-2">
                                        <strong>Motivo:</strong> {weakness.reason}
                                    </p>
                                    <p className="text-sm text-indigo-700">
                                        <strong>Sugerencia:</strong> {weakness.suggestion}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Recommendations */}
                    <div className="bg-white rounded-lg shadow-lg p-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                            <Brain className="h-6 w-6 mr-2 text-purple-600" />
                            Recomendaciones para Padres
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {feedbackReport.report_data.recommendations?.map((rec, idx) => {
                                const Icon = {
                                    Target,
                                    BookOpen,
                                    Brain,
                                    Award,
                                    TrendingUp
                                }[rec.icon] || Target;

                                return (
                                    <div key={idx} className={`${rec.bgColor} border-2 rounded-lg p-5`}>
                                        <div className="flex items-center gap-2 mb-3">
                                            <Icon className={`h-5 w-5 ${rec.color}`} />
                                            <h3 className={`font-semibold ${rec.color}`}>{rec.category}</h3>
                                        </div>
                                        <ul className="space-y-2">
                                            {rec.items?.map((item, itemIdx) => (
                                                <li key={itemIdx} className="flex items-start gap-2 text-sm text-gray-700">
                                                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                                    <span>{item}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Next Steps */}
                    {feedbackReport.report_data.next_steps && (
                        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg shadow-lg p-6 border-2 border-indigo-200">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">Próximos Pasos de Aprendizaje</h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div>
                                    <h3 className="font-semibold text-indigo-900 mb-3 flex items-center">
                                        <Calendar className="h-5 w-5 mr-2" />
                                        Objetivos a Corto Plazo (1-2 semanas)
                                    </h3>
                                    <ul className="space-y-2">
                                        {feedbackReport.report_data.next_steps.short_term?.map((step, idx) => (
                                            <li key={idx} className="flex items-start gap-2 text-sm">
                                                <CheckCircle className="h-4 w-4 text-indigo-600 mt-0.5" />
                                                <span>{step}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div>
                                    <h3 className="font-semibold text-purple-900 mb-3 flex items-center">
                                        <Target className="h-5 w-5 mr-2" />
                                        Objetivos a Medio Plazo (1 mes)
                                    </h3>
                                    <ul className="space-y-2">
                                        {feedbackReport.report_data.next_steps.medium_term?.map((step, idx) => (
                                            <li key={idx} className="flex items-start gap-2 text-sm">
                                                <CheckCircle className="h-4 w-4 text-purple-600 mt-0.5" />
                                                <span>{step}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            <div>
                                <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                                    <BookOpen className="h-5 w-5 mr-2" />
                                    Competencias Curriculares a Trabajar (LOMLOE)
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {feedbackReport.report_data.next_steps.curriculum_focus?.map((comp, idx) => (
                                        <span key={idx} className="px-3 py-1 bg-white border border-indigo-300 rounded-full text-sm text-indigo-700">
                                            {comp}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Final Message */}
                    <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg shadow p-6 border-l-4 border-green-500">
                        <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                            <Award className="h-5 w-5 mr-2 text-green-600" />
                            Mensaje Motivacional
                        </h3>
                        <p className="text-gray-700 leading-relaxed">{feedbackReport.report_data.feedback_text}</p>
                    </div>
                </div>
            )}

            {/* No Data Message */}
            {totalActivities === 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 text-center">
                    <AlertCircle className="h-12 w-12 text-yellow-600 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        No hay datos suficientes para generar feedback
                    </h3>
                    <p className="text-gray-600 mb-4">
                        Completa algunas fichas o exámenes en la pestaña "Analizar" para comenzar a recibir feedback personalizado.
                    </p>
                    <button
                        onClick={() => window.location.hash = '#analyze'}
                        className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                    >
                        Ir a Generar Actividades
                    </button>
                </div>
            )}
        </div>
    );
};

export default FeedbackDashboard;
