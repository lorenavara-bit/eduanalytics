/**
 * ParentOverview.js
 * 
 * Vista general del padre mostrando todos sus hijos vinculados
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useRole } from '../contexts/RoleContext';
import { Users, TrendingUp, Calendar, Award, ArrowRight, UserPlus } from 'lucide-react';

const ParentOverview = () => {
    const { session } = useRole();
    const navigate = useNavigate();
    const [children, setChildren] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadChildren();
    }, [session]);

    const loadChildren = async () => {
        if (!session?.user?.id) return;

        setLoading(true);
        try {
            // Load children from parent_dashboard_summary view
            const { data, error } = await supabase
                .from('parent_dashboard_summary')
                .select('*')
                .eq('parent_user_id', session.user.id);

            if (error) throw error;

            setChildren(data || []);
        } catch (error) {
            console.error('Error loading children:', error);
        } finally {
            setLoading(false);
        }
    };

    const getScoreColor = (score) => {
        if (score >= 85) return 'text-green-600 bg-green-100';
        if (score >= 70) return 'text-blue-600 bg-blue-100';
        if (score >= 60) return 'text-yellow-600 bg-yellow-100';
        return 'text-red-600 bg-red-100';
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
        );
    }

    if (children.length === 0) {
        return (
            <div className="max-w-2xl mx-auto text-center py-12">
                <div className="bg-white rounded-2xl shadow-xl p-12">
                    <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-purple-100 flex items-center justify-center">
                        <Users className="h-10 w-10 text-purple-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-3">
                        No tienes hijos vinculados
                    </h2>
                    <p className="text-gray-600 mb-8">
                        Para comenzar, vincula a tus hijos usando su email o código de invitación.
                    </p>
                    <button
                        onClick={() => navigate('/app/parent/links')}
                        className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all font-medium"
                    >
                        <UserPlus className="h-5 w-5" />
                        Vincular Hijo/a
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div>
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Panel General
                </h1>
                <p className="text-gray-600">
                    Vista general del progreso de tus hijos
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-xl p-6 shadow-md">
                    <div className="flex items-center gap-3 mb-2">
                        <Users className="h-6 w-6 text-purple-600" />
                        <h3 className="text-sm font-medium text-gray-600">Hijos Vinculados</h3>
                    </div>
                    <p className="text-3xl font-bold text-gray-900">{children.length}</p>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-md">
                    <div className="flex items-center gap-3 mb-2">
                        <Award className="h-6 w-6 text-green-600" />
                        <h3 className="text-sm font-medium text-gray-600">Nota Media Global</h3>
                    </div>
                    <p className="text-3xl font-bold text-gray-900">
                        {children.length > 0
                            ? Math.round(children.reduce((sum, c) => sum + (c.avg_score || 0), 0) / children.length)
                            : 0}
                    </p>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-md">
                    <div className="flex items-center gap-3 mb-2">
                        <Calendar className="h-6 w-6 text-blue-600" />
                        <h3 className="text-sm font-medium text-gray-600">Eventos Esta Semana</h3>
                    </div>
                    <p className="text-3xl font-bold text-gray-900">
                        {children.reduce((sum, c) => sum + (c.upcoming_events_week || 0), 0)}
                    </p>
                </div>
            </div>

            {/* Children Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {children.map(child => (
                    <div
                        key={child.child_user_id}
                        className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all cursor-pointer overflow-hidden"
                        onClick={() => navigate(`/app/parent/child/${child.child_user_id}`)}
                    >
                        <div className="p-6">
                            {/* Header */}
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    {child.child_avatar ? (
                                        <img
                                            src={child.child_avatar}
                                            alt={child.child_name}
                                            className="w-12 h-12 rounded-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg">
                                            {child.child_name?.charAt(0) || '?'}
                                        </div>
                                    )}
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900">
                                            {child.custom_child_name || child.child_name || 'Sin nombre'}
                                        </h3>
                                        <p className="text-sm text-gray-600">
                                            {child.child_level} - {child.child_grade}
                                        </p>
                                    </div>
                                </div>

                                {/* Score Badge */}
                                {child.avg_score !== null && (
                                    <div className={`px-3 py-1 rounded-full text-sm font-semibold ${getScoreColor(child.avg_score)}`}>
                                        {Math.round(child.avg_score)} pts
                                    </div>
                                )}
                            </div>

                            {/* Stats */}
                            <div className="grid grid-cols-3 gap-4 mb-4">
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-indigo-600">
                                        {child.completed_worksheets || 0}
                                    </p>
                                    <p className="text-xs text-gray-600">Completadas</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-purple-600">
                                        {child.total_worksheets || 0}
                                    </p>
                                    <p className="text-xs text-gray-600">Total Fichas</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-blue-600">
                                        {child.upcoming_events_week || 0}
                                    </p>
                                    <p className="text-xs text-gray-600">Eventos</p>
                                </div>
                            </div>

                            {/* Action Button */}
                            <button className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2 rounded-lg hover:shadow-lg transition-all">
                                Ver Detalle
                                <ArrowRight className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Add Child Button */}
            <div className="mt-8 text-center">
                <button
                    onClick={() => navigate('/app/parent/links')}
                    className="inline-flex items-center gap-2 bg-white text-purple-600 border-2 border-purple-600 px-6 py-3 rounded-lg hover:bg-purple-50 transition-all font-medium"
                >
                    <UserPlus className="h-5 w-5" />
                    Vincular Otro Hijo/a
                </button>
            </div>
        </div>
    );
};

export default ParentOverview;
