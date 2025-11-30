import React, { useState } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { TrendingUp, TrendingDown, BookOpen, Brain, Target, Lightbulb, Award, AlertCircle, ChevronRight, Sparkles } from 'lucide-react';

const Feedback = ({ correctionResult }) => {
    const [activeTab, setActiveTab] = useState('overview');

    // Use correction data if available, otherwise use sample data
    const strengthsData = correctionResult?.strengths || [
        { subject: 'Matemáticas', score: 95, potential: 98 },
        { subject: 'Ciencias', score: 92, potential: 95 },
        { subject: 'Lógica', score: 98, potential: 99 },
        { subject: 'Lectura', score: 85, potential: 90 },
        { subject: 'Escritura', score: 78, potential: 85 },
        { subject: 'Social', score: 70, potential: 80 }
    ];

    const progressData = [
        { month: 'Sep', math: 88, science: 85, reading: 82, writing: 75 },
        { month: 'Oct', math: 90, science: 88, reading: 83, writing: 76 },
        { month: 'Nov', math: 93, science: 90, reading: 85, writing: 78 },
        { month: 'Dic', math: 95, science: 92, reading: 85, writing: 78 }
    ];

    const learningStyleData = [
        { trait: 'Visual', value: 85 },
        { trait: 'Lógico', value: 95 },
        { trait: 'Kinestésico', value: 60 },
        { trait: 'Verbal', value: 75 },
        { trait: 'Social', value: 55 },
        { trait: 'Independiente', value: 90 }
    ];

    // Map string icon names to components if coming from JSON
    const getIcon = (iconName) => {
        const icons = { Sparkles, Target, Brain, Lightbulb, Award, TrendingUp, BookOpen };
        return icons[iconName] || Sparkles;
    };

    const recommendations = correctionResult?.recommendations?.map(rec => ({
        ...rec,
        icon: typeof rec.icon === 'string' ? getIcon(rec.icon) : rec.icon
    })) || [
            {
                category: 'Acelerar Fortalezas',
                icon: Sparkles,
                color: 'text-green-600',
                bgColor: 'bg-green-50',
                items: [
                    'Programa Avanzado de Matemáticas: Contenido de Khan Academy Grado 6-7',
                    'Rompecabezas Lógicos: Club de ajedrez o bootcamp de programación para niños',
                    'Enriquecimiento Científico: Kit de experimentos caseros o membresía en museo de ciencias'
                ]
            },
            {
                category: 'Apoyar Áreas de Crecimiento',
                icon: Target,
                color: 'text-blue-600',
                bgColor: 'bg-blue-50',
                items: [
                    'Escritura Creativa: Comenzar un diario de historias con plantillas guiadas',
                    'Habilidades Sociales: Actividades en grupos pequeños o deportes de equipo',
                    'Variedad en Lectura: Explorar diferentes géneros más allá de la no ficción'
                ]
            },
            {
                category: 'Adaptación al Estilo de Aprendizaje',
                icon: Brain,
                color: 'text-purple-600',
                bgColor: 'bg-purple-50',
                items: [
                    'Usar ayudas visuales y diagramas para todas las materias',
                    'Manipulativos matemáticos prácticos para conceptos abstractos',
                    'Juegos educativos que combinen lógica y aprendizaje'
                ]
            }
        ];

    const alerts = correctionResult ? [
        { type: 'strength', text: `Puntuación obtenida: ${correctionResult.score}/100`, action: 'Ver detalles' },
        { type: 'insight', text: correctionResult.feedback_text || 'Buen trabajo', action: 'Leer más' },
        ...(correctionResult.weaknesses?.map(w => ({ type: 'opportunity', text: `Mejorar: ${w}`, action: 'Ver recursos' })) || [])
    ] : [
        { type: 'opportunity', text: 'Puntuaciones de escritura estables - considera un nuevo enfoque', action: 'Ver estrategias' },
        { type: 'strength', text: 'Rendimiento en matemáticas supera el nivel de grado por 2 años', action: 'Explorar recursos avanzados' },
        { type: 'insight', text: 'Mejor horario de aprendizaje: 9-11 AM (85% mejor concentración)', action: 'Programar materias clave' }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
            {/* Encabezado */}
            <div className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Viaje de Aprendizaje</h1>
                            <p className="text-sm text-gray-600 mt-1">Perspectivas personalizadas para el éxito de tu hijo</p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm font-semibold text-gray-900">Perfil de Alex</p>
                            <p className="text-xs text-gray-500">10 años • 4º Grado</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Alertas Rápidas */}
                <div className="mb-8 space-y-3">
                    {alerts.map((alert, idx) => (
                        <div key={idx} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 flex items-center justify-between hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-3">
                                <div className={`w-2 h-2 rounded-full ${alert.type === 'strength' ? 'bg-green-500' : alert.type === 'opportunity' ? 'bg-yellow-500' : 'bg-blue-500'}`} />
                                <p className="text-sm text-gray-700">{alert.text}</p>
                            </div>
                            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
                                {alert.action}
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                </div>

                {/* Cuadrícula de Contenido Principal */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    {/* Fortalezas vs Potencial */}
                    <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900">Fortalezas y Potencial de Crecimiento</h2>
                                <p className="text-sm text-gray-500 mt-1">Rendimiento actual vs capacidad estimada</p>
                            </div>
                        </div>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={strengthsData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis dataKey="subject" tick={{ fontSize: 12 }} />
                                <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="score" fill="#3b82f6" name="Puntuación Actual" radius={[8, 8, 0, 0]} />
                                <Bar dataKey="potential" fill="#d1d5db" name="Potencial" radius={[8, 8, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                            <p className="text-sm text-blue-900">
                                <strong>💡 Perspectiva para Padres:</strong> Alex muestra un pensamiento lógico y habilidades matemáticas excepcionales. La brecha en escritura sugiere que no es falta de capacidad, sino posiblemente de interés o enfoque pedagógico.
                            </p>
                        </div>
                    </div>

                    {/* Perfil de Estilo de Aprendizaje */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Estilo de Aprendizaje</h2>
                        <ResponsiveContainer width="100%" height={280}>
                            <RadarChart data={learningStyleData}>
                                <PolarGrid stroke="#e5e7eb" />
                                <PolarAngleAxis dataKey="trait" tick={{ fontSize: 11 }} />
                                <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
                                <Radar name="Fortaleza" dataKey="value" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} />
                            </RadarChart>
                        </ResponsiveContainer>
                        <div className="mt-4 space-y-2">
                            <div className="flex items-center gap-2">
                                <Brain className="w-4 h-4 text-purple-600" />
                                <span className="text-sm text-gray-700">Fuerte: Aprendizaje lógico y visual</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Target className="w-4 h-4 text-blue-600" />
                                <span className="text-sm text-gray-700">Desarrollar: Social y kinestésico</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Progreso en el Tiempo */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900">Seguimiento de Progreso</h2>
                            <p className="text-sm text-gray-500 mt-1">Mejora mes a mes en todas las materias</p>
                        </div>
                        <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option>Este Año Escolar</option>
                            <option>Últimos 6 Meses</option>
                            <option>Todo el Tiempo</option>
                        </select>
                    </div>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={progressData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                            <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="math" stroke="#10b981" strokeWidth={2} name="Matemáticas" />
                            <Line type="monotone" dataKey="science" stroke="#3b82f6" strokeWidth={2} name="Ciencias" />
                            <Line type="monotone" dataKey="reading" stroke="#f59e0b" strokeWidth={2} name="Lectura" />
                            <Line type="monotone" dataKey="writing" stroke="#ef4444" strokeWidth={2} name="Escritura" />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Recomendaciones Personalizadas */}
                <div className="space-y-6">
                    <h2 className="text-xl font-semibold text-gray-900">Plan de Acción Personalizado</h2>

                    {recommendations.map((rec, idx) => {
                        const Icon = rec.icon;
                        return (
                            <div key={idx} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className={`${rec.bgColor} p-3 rounded-lg`}>
                                        <Icon className={`w-6 h-6 ${rec.color}`} />
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900">{rec.category}</h3>
                                </div>
                                <div className="space-y-3">
                                    {rec.items.map((item, i) => (
                                        <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                            <div className="w-6 h-6 rounded-full bg-white border-2 border-gray-300 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                <div className="w-2 h-2 rounded-full bg-gray-400" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm text-gray-700">{item}</p>
                                            </div>
                                            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium whitespace-nowrap">
                                                Saber más
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Estadísticas Rápidas al Pie */}
                <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-5 text-white">
                        <Award className="w-8 h-8 mb-2 opacity-80" />
                        <p className="text-2xl font-bold">12</p>
                        <p className="text-sm opacity-90">Hitos Alcanzados</p>
                    </div>
                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-5 text-white">
                        <BookOpen className="w-8 h-8 mb-2 opacity-80" />
                        <p className="text-2xl font-bold">45</p>
                        <p className="text-sm opacity-90">Horas de Aprendizaje Este Mes</p>
                    </div>
                    <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-5 text-white">
                        <Lightbulb className="w-8 h-8 mb-2 opacity-80" />
                        <p className="text-2xl font-bold">8</p>
                        <p className="text-sm opacity-90">Nuevas Habilidades en Desarrollo</p>
                    </div>
                    <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-5 text-white">
                        <TrendingUp className="w-8 h-8 mb-2 opacity-80" />
                        <p className="text-2xl font-bold">+18%</p>
                        <p className="text-sm opacity-90">Mejora General</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Feedback;
