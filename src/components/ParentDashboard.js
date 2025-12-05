import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import {
    TrendingUp, TrendingDown, Award, AlertCircle, Calendar as CalendarIcon,
    Clock, BookOpen, Target, Star, Activity, Brain, Zap, CheckCircle2,
    BarChart3, PieChart, LineChart, Users, FileText
} from 'lucide-react';
import { Card, CardContent, CardHeader, Button, Badge } from './DesignSystem';

const ParentDashboard = ({ session, userProfile, callGeminiAPI }) => {
    const [stats, setStats] = useState(null);
    const [recentActivity, setRecentActivity] = useState([]);
    const [upcomingEvents, setUpcomingEvents] = useState([]);
    const [subjectPerformance, setSubjectPerformance] = useState([]);
    const [loading, setLoading] = useState(true);
    const [aiInsights, setAiInsights] = useState(null);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Load worksheets (exams & homeworks)
            const { data: worksheets } = await supabase
                .from('worksheets')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .limit(20);

            // Load calendar events
            const today = new Date();
            const next30Days = new Date(today);
            next30Days.setDate(next30Days.getDate() + 30);

            const { data: events } = await supabase
                .from('calendar_events')
                .select('*')
                .eq('user_id', user.id)
                .gte('event_date', today.toISOString().split('T')[0])
                .lte('event_date', next30Days.toISOString().split('T')[0])
                .order('event_date', { ascending: true });

            // Process data
            processData(worksheets || [], events || []);
        } catch (error) {
            console.error('Error loading dashboard:', error);
        } finally {
            setLoading(false);
        }
    };

    const processData = (worksheets, events) => {
        // Calculate overall stats
        const completedWorksheets = worksheets.filter(w => w.status === 'completed');
        const avgScore = completedWorksheets.length > 0
            ? completedWorksheets.reduce((sum, w) => sum + (w.score || 0), 0) / completedWorksheets.length
            : 0;

        // Count by subject
        const subjectStats = {};
        worksheets.forEach(w => {
            if (!subjectStats[w.subject]) {
                subjectStats[w.subject] = { total: 0, completed: 0, totalScore: 0, count: 0 };
            }
            subjectStats[w.subject].total++;
            if (w.status === 'completed') {
                subjectStats[w.subject].completed++;
                if (w.score) {
                    subjectStats[w.subject].totalScore += w.score;
                    subjectStats[w.subject].count++;
                }
            }
        });

        const subjectPerf = Object.entries(subjectStats).map(([subject, data]) => ({
            subject,
            avgScore: data.count > 0 ? data.totalScore / data.count : 0,
            completed: data.completed,
            total: data.total,
            completionRate: (data.completed / data.total * 100).toFixed(0)
        })).sort((a, b) => b.avgScore - a.avgScore);

        // Recent activity (last 10 items)
        const activity = worksheets.slice(0, 10).map(w => ({
            id: w.id,
            type: w.type,
            subject: w.subject,
            title: w.title,
            score: w.score,
            status: w.status,
            date: w.created_at
        }));

        // Upcoming events (next 5)
        const upcoming = events.slice(0, 5);

        // Calculate stats
        const pendingEvents = events.filter(e => e.status === 'pending').length;
        const thisWeekEvents = events.filter(e => {
            const eventDate = new Date(e.event_date);
            const weekFromNow = new Date();
            weekFromNow.setDate(weekFromNow.getDate() + 7);
            return eventDate <= weekFromNow;
        }).length;

        setStats({
            totalWorksheets: worksheets.length,
            completedWorksheets: completedWorksheets.length,
            avgScore: Math.round(avgScore),
            pendingEvents,
            thisWeekEvents,
            studyStreak: calculateStreak(worksheets),
            totalStudyHours: estimateStudyHours(worksheets)
        });

        setSubjectPerformance(subjectPerf);
        setRecentActivity(activity);
        setUpcomingEvents(upcoming);

        // Generate AI insights
        generateAIInsights(subjectPerf, avgScore, worksheets);
    };

    const calculateStreak = (worksheets) => {
        // Simple calculation: consecutive days with activity
        const dates = worksheets
            .filter(w => w.status === 'completed')
            .map(w => new Date(w.created_at).toDateString());
        const uniqueDates = [...new Set(dates)].sort().reverse();

        let streak = 0;
        const today = new Date().toDateString();
        for (let i = 0; i < uniqueDates.length; i++) {
            const expectedDate = new Date();
            expectedDate.setDate(expectedDate.getDate() - i);
            if (uniqueDates[i] === expectedDate.toDateString()) {
                streak++;
            } else {
                break;
            }
        }
        return streak;
    };

    const estimateStudyHours = (worksheets) => {
        // Estimate 30 min per worksheet
        return Math.round(worksheets.filter(w => w.status === 'completed').length * 0.5);
    };

    const generateAIInsights = async (subjectPerf, avgScore, worksheets) => {
        const weakSubjects = subjectPerf.filter(s => s.avgScore < 70).map(s => s.subject);
        const strongSubjects = subjectPerf.filter(s => s.avgScore >= 85).map(s => s.subject);

        setAiInsights({
            summary: avgScore >= 80 ? '¡Excelente rendimiento!' : avgScore >= 70 ? 'Buen progreso general' : 'Necesita apoyo adicional',
            weakSubjects,
            strongSubjects,
            recommendation: weakSubjects.length > 0
                ? `Reforzar: ${weakSubjects.join(', ')}`
                : 'Mantener el ritmo actual'
        });
    };

    const getScoreColor = (score) => {
        if (score >= 90) return 'text-green-600 bg-green-100';
        if (score >= 75) return 'text-blue-600 bg-blue-100';
        if (score >= 60) return 'text-yellow-600 bg-yellow-100';
        return 'text-red-600 bg-red-100';
    };

    const getScoreTrend = (score) => {
        if (score >= 85) return <TrendingUp className="h-5 w-5 text-green-600" />;
        if (score >= 70) return <Activity className="h-5 w-5 text-blue-600" />;
        return <TrendingDown className="h-5 w-5 text-red-600" />;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-6">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                            Panel de Padres
                        </h1>
                        <p className="text-gray-600 mt-2">
                            Monitorea el progreso de {userProfile.name || 'tu hijo/a'}
                        </p>
                    </div>
                    <div className="flex items-center gap-4">
                        <Badge className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2">
                            <Users className="h-4 w-4 mr-2 inline" />
                            Vista Padres
                        </Badge>
                    </div>
                </div>
            </div>

            {/* Stats Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {/* Average Score */}
                <Card className="bg-white/80 backdrop-blur-lg border-2 border-indigo-200 shadow-xl hover:shadow-2xl transition-all">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 font-medium">Nota Media</p>
                                <p className="text-4xl font-bold text-indigo-600 mt-2">{stats?.avgScore || 0}</p>
                                <p className="text-xs text-gray-500 mt-1">sobre 100</p>
                            </div>
                            <div className="p-4 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl">
                                <Award className="h-8 w-8 text-white" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Completed Worksheets */}
                <Card className="bg-white/80 backdrop-blur-lg border-2 border-green-200 shadow-xl hover:shadow-2xl transition-all">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 font-medium">Fichas Completadas</p>
                                <p className="text-4xl font-bold text-green-600 mt-2">{stats?.completedWorksheets || 0}</p>
                                <p className="text-xs text-gray-500 mt-1">de {stats?.totalWorksheets || 0} total</p>
                            </div>
                            <div className="p-4 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl">
                                <CheckCircle2 className="h-8 w-8 text-white" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Study Streak */}
                <Card className="bg-white/80 backdrop-blur-lg border-2 border-orange-200 shadow-xl hover:shadow-2xl transition-all">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 font-medium">Racha de Estudio</p>
                                <p className="text-4xl font-bold text-orange-600 mt-2">{stats?.studyStreak || 0}</p>
                                <p className="text-xs text-gray-500 mt-1">días consecutivos</p>
                            </div>
                            <div className="p-4 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl">
                                <Zap className="h-8 w-8 text-white" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Upcoming Events */}
                <Card className="bg-white/80 backdrop-blur-lg border-2 border-blue-200 shadow-xl hover:shadow-2xl transition-all">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 font-medium">Esta Semana</p>
                                <p className="text-4xl font-bold text-blue-600 mt-2">{stats?.thisWeekEvents || 0}</p>
                                <p className="text-xs text-gray-500 mt-1">eventos próximos</p>
                            </div>
                            <div className="p-4 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl">
                                <CalendarIcon className="h-8 w-8 text-white" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - 2/3 width */}
                <div className="lg:col-span-2 space-y-6">
                    {/* AI Insights */}
                    {aiInsights && (
                        <Card className="bg-gradient-to-r from-purple-500 to-pink-500 border-0 shadow-2xl">
                            <CardContent className="p-6 text-white">
                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-white/20 backdrop-blur-lg rounded-xl">
                                        <Brain className="h-6 w-6" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-lg font-bold mb-2">Análisis Inteligente</h3>
                                        <p className="text-white/90 mb-3">{aiInsights.summary}</p>
                                        {aiInsights.strongSubjects.length > 0 && (
                                            <div className="mb-2">
                                                <span className="text-sm font-semibold">✨ Fortalezas: </span>
                                                <span className="text-sm">{aiInsights.strongSubjects.join(', ')}</span>
                                            </div>
                                        )}
                                        {aiInsights.weakSubjects.length > 0 && (
                                            <div className="mb-2">
                                                <span className="text-sm font-semibold">📚 A Mejorar: </span>
                                                <span className="text-sm">{aiInsights.weakSubjects.join(', ')}</span>
                                            </div>
                                        )}
                                        <div className="mt-3 p-3 bg-white/20 backdrop-blur-sm rounded-lg">
                                            <p className="text-sm font-medium">💡 Recomendación: {aiInsights.recommendation}</p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Subject Performance */}
                    <Card className="bg-white/80 backdrop-blur-lg shadow-xl">
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <BarChart3 className="h-6 w-6 text-indigo-600" />
                                <h2 className="text-xl font-bold text-gray-900">Rendimiento por Asignatura</h2>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {subjectPerformance.length === 0 ? (
                                <p className="text-gray-500 text-center py-8">No hay datos suficientes aún</p>
                            ) : (
                                <div className="space-y-4">
                                    {subjectPerformance.map((subject, idx) => (
                                        <div key={idx} className="group hover:bg-gray-50 p-4 rounded-lg transition-all">
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center gap-3">
                                                    {getScoreTrend(subject.avgScore)}
                                                    <span className="font-semibold text-gray-900">{subject.subject}</span>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <Badge className={getScoreColor(subject.avgScore)}>
                                                        {Math.round(subject.avgScore)} pts
                                                    </Badge>
                                                    <span className="text-sm text-gray-500">{subject.completed}/{subject.total}</span>
                                                </div>
                                            </div>
                                            {/* Progress bar */}
                                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                                                <div
                                                    className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2.5 rounded-full transition-all duration-500"
                                                    style={{ width: `${subject.avgScore}%` }}
                                                ></div>
                                            </div>
                                            <div className="mt-1 text-xs text-gray-500">
                                                {subject.completionRate}% completado
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Recent Activity */}
                    <Card className="bg-white/80 backdrop-blur-lg shadow-xl">
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <Activity className="h-6 w-6 text-indigo-600" />
                                <h2 className="text-xl font-bold text-gray-900">Actividad Reciente</h2>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {recentActivity.length === 0 ? (
                                <p className="text-gray-500 text-center py-8">Sin actividad reciente</p>
                            ) : (
                                <div className="space-y-3">
                                    {recentActivity.map((activity, idx) => (
                                        <div key={idx} className="flex items-start gap-4 p-3 hover:bg-gray-50 rounded-lg transition-all border-l-4 border-indigo-500">
                                            <div className="flex-shrink-0 mt-1">
                                                {activity.type === 'exam' ? (
                                                    <div className="p-2 bg-red-100 rounded-lg">
                                                        <FileText className="h-4 w-4 text-red-600" />
                                                    </div>
                                                ) : (
                                                    <div className="p-2 bg-blue-100 rounded-lg">
                                                        <BookOpen className="h-4 w-4 text-blue-600" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold text-gray-900">{activity.title}</p>
                                                <p className="text-xs text-gray-600 mt-0.5">{activity.subject}</p>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    {new Date(activity.date).toLocaleDateString('es-ES', {
                                                        day: 'numeric',
                                                        month: 'short',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </p>
                                            </div>
                                            {activity.score !== null && activity.score !== undefined && (
                                                <Badge className={getScoreColor(activity.score)}>
                                                    {activity.score} pts
                                                </Badge>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column - 1/3 width */}
                <div className="space-y-6">
                    {/* Study Stats */}
                    <Card className="bg-white/80 backdrop-blur-lg shadow-xl">
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <Clock className="h-6 w-6 text-indigo-600" />
                                <h2 className="text-lg font-bold text-gray-900">Estadísticas</h2>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
                                    <div>
                                        <p className="text-xs text-gray-600">Horas de Estudio</p>
                                        <p className="text-2xl font-bold text-indigo-600">{stats?.totalStudyHours || 0}h</p>
                                    </div>
                                    <BookOpen className="h-8 w-8 text-indigo-400" />
                                </div>
                                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
                                    <div>
                                        <p className="text-xs text-gray-600">Tasa de Completado</p>
                                        <p className="text-2xl font-bold text-green-600">
                                            {stats?.totalWorksheets > 0
                                                ? Math.round((stats.completedWorksheets / stats.totalWorksheets) * 100)
                                                : 0}%
                                        </p>
                                    </div>
                                    <Target className="h-8 w-8 text-green-400" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Upcoming Events */}
                    <Card className="bg-white/80 backdrop-blur-lg shadow-xl">
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <CalendarIcon className="h-6 w-6 text-indigo-600" />
                                <h2 className="text-lg font-bold text-gray-900">Próximos Eventos</h2>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {upcomingEvents.length === 0 ? (
                                <p className="text-gray-500 text-center py-4 text-sm">No hay eventos próximos</p>
                            ) : (
                                <div className="space-y-3">
                                    {upcomingEvents.map((event, idx) => {
                                        const daysUntil = Math.ceil((new Date(event.event_date) - new Date()) / (1000 * 60 * 60 * 24));
                                        const isUrgent = daysUntil <= 3;

                                        return (
                                            <div
                                                key={idx}
                                                className={`p-3 rounded-lg border-l-4 ${event.event_type === 'exam'
                                                    ? 'bg-red-50 border-red-500'
                                                    : 'bg-blue-50 border-blue-500'
                                                    }`}
                                            >
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <p className="text-sm font-semibold text-gray-900">{event.title}</p>
                                                        <p className="text-xs text-gray-600 mt-0.5">{event.subject}</p>
                                                        <div className="flex items-center gap-2 mt-2">
                                                            <Badge className={isUrgent ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-700'}>
                                                                {daysUntil === 0 ? '¡Hoy!' : daysUntil === 1 ? 'Mañana' : `${daysUntil}d`}
                                                            </Badge>
                                                            {event.priority === 'high' && (
                                                                <AlertCircle className="h-3 w-3 text-red-500" />
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Quick Actions */}
                    <Card className="bg-gradient-to-br from-indigo-600 to-purple-600 border-0 shadow-xl">
                        <CardContent className="p-6">
                            <h3 className="text-white font-bold mb-4">Acciones Rápidas</h3>
                            <div className="space-y-2">
                                <Button
                                    className="w-full bg-white/20 hover:bg-white/30 text-white border-white/40"
                                    variant="outline"
                                >
                                    📧 Contactar Profesor
                                </Button>
                                <Button
                                    className="w-full bg-white/20 hover:bg-white/30 text-white border-white/40"
                                    variant="outline"
                                >
                                    📊 Informe Completo
                                </Button>
                                <Button
                                    className="w-full bg-white/20 hover:bg-white/30 text-white border-white/40"
                                    variant="outline"
                                >
                                    ⚙️ Configuración
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default ParentDashboard;
