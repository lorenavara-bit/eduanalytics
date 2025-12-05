/**
 * AppLayout.js
 * 
 * Layout principal que envuelve TODAS las rutas autenticadas
 * Incluye navbar con logo, role switcher y logout
 */

import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useRole } from '../contexts/RoleContext';
import { supabase } from '../supabaseClient';
import {
    Camera, LogOut, ChevronDown, User, Users,
    BookOpen, GraduationCap, Settings
} from 'lucide-react';

const AppLayout = () => {
    const { currentRole, availableRoles, userProfile, switchRole } = useRole();
    const [showRoleMenu, setShowRoleMenu] = useState(false);
    const navigate = useNavigate();

    const handleLogout = async () => {
        if (window.confirm('¿Estás seguro de que quieres cerrar sesión?')) {
            await supabase.auth.signOut();
            navigate('/login');
        }
    };

    const handleRoleSwitch = async (role) => {
        const success = await switchRole(role);
        if (success) {
            setShowRoleMenu(false);
            // Redirect to appropriate dashboard
            const routes = {
                student: '/app/student',
                parent: '/app/parent/overview',
                teacher: '/app/teacher',
                admin: '/app/admin'
            };
            navigate(routes[role] || '/app/student');
        }
    };

    const getRoleConfig = (role) => {
        const configs = {
            student: { icon: GraduationCap, label: 'Alumno', color: 'text-blue-600' },
            parent: { icon: Users, label: 'Padre/Madre', color: 'text-purple-600' },
            teacher: { icon: BookOpen, label: 'Profesor', color: 'text-green-600' },
            admin: { icon: Settings, label: 'Admin', color: 'text-red-600' }
        };
        return configs[role] || configs.student;
    };

    const currentConfig = getRoleConfig(currentRole);
    const CurrentIcon = currentConfig.icon;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Navbar */}
            <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        {/* Logo */}
                        <div className="flex items-center">
                            <Camera className="h-8 w-8 text-indigo-600" />
                            <h1 className="ml-3 text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                EduAnalytics
                            </h1>
                        </div>

                        {/* Right side: Role switcher + Avatar + Logout */}
                        <div className="flex items-center gap-4">
                            {/* Role Switcher (if multiple roles) */}
                            {availableRoles.length > 1 && (
                                <div className="relative">
                                    <button
                                        onClick={() => setShowRoleMenu(!showRoleMenu)}
                                        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                                    >
                                        <CurrentIcon className={`h-5 w-5 ${currentConfig.color}`} />
                                        <span className="text-sm font-medium text-gray-700">
                                            {currentConfig.label}
                                        </span>
                                        <ChevronDown className="h-4 w-4 text-gray-400" />
                                    </button>

                                    {/* Dropdown Menu */}
                                    {showRoleMenu && (
                                        <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                                            <div className="px-4 py-2 border-b border-gray-100">
                                                <p className="text-xs text-gray-500">Cambiar rol</p>
                                            </div>
                                            {availableRoles.map(role => {
                                                const config = getRoleConfig(role);
                                                const RoleIcon = config.icon;
                                                const isCurrent = role === currentRole;

                                                return (
                                                    <button
                                                        key={role}
                                                        onClick={() => handleRoleSwitch(role)}
                                                        className={`w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition-colors ${isCurrent ? 'bg-indigo-50' : ''
                                                            }`}
                                                    >
                                                        <RoleIcon className={`h-5 w-5 ${config.color}`} />
                                                        <span className="text-sm font-medium text-gray-700">
                                                            {config.label}
                                                        </span>
                                                        {isCurrent && (
                                                            <span className="ml-auto text-xs text-indigo-600 font-semibold">
                                                                ✓
                                                            </span>
                                                        )}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* User Avatar */}
                            <div className="flex items-center gap-2">
                                {userProfile?.avatar_url ? (
                                    <img
                                        src={userProfile.avatar_url}
                                        alt="Avatar"
                                        className="h-8 w-8 rounded-full object-cover border-2 border-indigo-200"
                                    />
                                ) : (
                                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                                        <User className="h-4 w-4 text-white" />
                                    </div>
                                )}
                                <span className="text-sm font-medium text-gray-700 hidden sm:block">
                                    {userProfile?.name || 'Usuario'}
                                </span>
                            </div>

                            {/* Logout Button */}
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-2 px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                                title="Cerrar sesión"
                            >
                                <LogOut className="h-5 w-5" />
                                <span className="text-sm font-medium hidden sm:block">Salir</span>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="min-h-[calc(100vh-4rem)]">
                <Outlet />
            </main>

            {/* Click outside to close role menu */}
            {showRoleMenu && (
                <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowRoleMenu(false)}
                />
            )}
        </div>
    );
};

export default AppLayout;
