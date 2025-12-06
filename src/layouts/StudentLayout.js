/**
 * StudentLayout.js
 * 
 * Layout específico para las rutas del ALUMNO
 * Incluye navegación por tabs (actual sistema)
 */

import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
    User, Upload, Brain, Calendar as CalendarIcon,
    BarChart3, BookOpen
} from 'lucide-react';

const StudentLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Determinar tab activo basado en la ruta
    const getActiveTab = () => {
        const path = location.pathname;
        if (path.includes('/profile')) return 'profile';
        if (path.includes('/generator')) return 'generator';
        if (path.includes('/calendar')) return 'calendar';
        if (path.includes('/feedback')) return 'feedback';
        if (path.includes('/resources')) return 'resources';
        return 'generator'; // default
    };

    const activeTab = getActiveTab();

    const tabs = [
        { id: 'profile', name: 'Mi Perfil', icon: User, path: '/app/student/profile' },
        { id: 'generator', name: 'Generador IA', icon: Brain, path: '/app/student/generator' },
        { id: 'calendar', name: 'Mi Agenda', icon: CalendarIcon, path: '/app/student/calendar' },
        { id: 'feedback', name: 'Progreso', icon: BarChart3, path: '/app/student/feedback' },
        { id: 'resources', name: 'Biblioteca', icon: BookOpen, path: '/app/student/resources' }
    ];

    const handleTabClick = (tab) => {
        navigate(tab.path);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Tab Navigation */}
            <div className="bg-white border-b border-gray-200 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <nav className="flex space-x-8 overflow-x-auto py-4">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;

                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => handleTabClick(tab)}
                                    className={`flex items-center px-3 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-all ${isActive
                                        ? 'text-indigo-600 bg-indigo-50'
                                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                                        }`}
                                >
                                    <Icon className="h-4 w-4 mr-2" />
                                    {tab.name}
                                </button>
                            );
                        })}
                    </nav>
                </div>
            </div>

            {/* Content Area */}
            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <Outlet />
            </main>
        </div>
    );
};

export default StudentLayout;
