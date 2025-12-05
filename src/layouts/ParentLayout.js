/**
 * ParentLayout.js
 * 
 * Layout específico para las rutas de PADRES
 * Incluye sidebar con lista de hijos (futuro) y navegación
 */

import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Users, LayoutDashboard, Settings, UserPlus } from 'lucide-react';

const ParentLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const isActive = (path) => location.pathname.startsWith(path);

    const menuItems = [
        {
            id: 'overview',
            name: 'Vista General',
            icon: LayoutDashboard,
            path: '/app/parent/overview'
        },
        {
            id: 'links',
            name: 'Gestionar Vínculos',
            icon: UserPlus,
            path: '/app/parent/links'
        },
        {
            id: 'settings',
            name: 'Configuración',
            icon: Settings,
            path: '/app/parent/settings'
        }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
            {/* Optional: Top bar for breadcrumbs or quick actions */}
            <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
                    <div className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-purple-600" />
                        <span className="text-sm font-semibold text-gray-700">
                            Panel de Padres
                        </span>
                    </div>
                </div>
            </div>

            {/* Main Content with optional sidebar (for future) */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {/* Quick Navigation Pills */}
                <div className="mb-6 flex gap-3 flex-wrap">
                    {menuItems.map(item => {
                        const Icon = item.icon;
                        const active = isActive(item.path);

                        return (
                            <button
                                key={item.id}
                                onClick={() => navigate(item.path)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${active
                                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                                        : 'bg-white/80 text-gray-700 hover:bg-white hover:shadow-md'
                                    }`}
                            >
                                <Icon className="h-4 w-4" />
                                <span className="text-sm">{item.name}</span>
                            </button>
                        );
                    })}
                </div>

                {/* Content */}
                <Outlet />
            </div>
        </div>
    );
};

export default ParentLayout;
