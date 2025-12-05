/**
 * RoleSelector.js
 * 
 * Componente para seleccionar rol después del login
 * Se muestra cuando el usuario tiene múltiples roles disponibles
 */

import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useRole } from '../contexts/RoleContext';
import { Users, GraduationCap, BookOpen, Shield } from 'lucide-react';

const RoleSelector = () => {
    const { availableRoles, currentRole, switchRole } = useRole();
    const navigate = useNavigate();
    const location = useLocation();

    // Route mapping per role
    const roleConfig = {
        student: {
            icon: GraduationCap,
            label: 'Alumno',
            description: 'Accede a tus ejercicios y progreso',
            color: 'from-blue-500 to-cyan-500',
            bgColor: 'bg-blue-50',
            textColor: 'text-blue-600',
            route: '/app/student'
        },
        parent: {
            icon: Users,
            label: 'Padre/Madre',
            description: 'Monitorea el progreso de tus hijos',
            color: 'from-purple-500 to-pink-500',
            bgColor: 'bg-purple-50',
            textColor: 'text-purple-600',
            route: '/app/parent/overview'
        },
        teacher: {
            icon: BookOpen,
            label: 'Profesor',
            description: 'Gestiona tus clases y alumnos',
            color: 'from-green-500 to-emerald-500',
            bgColor: 'bg-green-50',
            textColor: 'text-green-600',
            route: '/app/teacher'
        },
        admin: {
            icon: Shield,
            label: 'Administrador',
            description: 'Panel de administración',
            color: 'from-red-500 to-orange-500',
            bgColor: 'bg-red-50',
            textColor: 'text-red-600',
            route: '/app/admin'
        }
    };

    // If user has only one role, redirect automatically
    useEffect(() => {
        if (availableRoles.length === 1 && !location.state?.requiredRole) {
            const role = availableRoles[0];
            handleSelectRole(role);
        }
    }, [availableRoles]);

    const handleSelectRole = async (role) => {
        const success = await switchRole(role);
        if (success) {
            const config = roleConfig[role];
            navigate(config?.route || '/app/student', { replace: true });
        }
    };

    // If no roles available, show error
    if (availableRoles.length === 0) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center p-6">
                <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
                        <Shield className="h-8 w-8 text-red-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        Cuenta no configurada
                    </h2>
                    <p className="text-gray-600 mb-6">
                        Tu cuenta no tiene roles asignados. Por favor, contacta al administrador.
                    </p>
                    <button
                        onClick={() => navigate('/login')}
                        className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                        Volver al Login
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center p-6">
            <div className="max-w-5xl w-full">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-3">
                        ¿Cómo quieres acceder?
                    </h1>
                    <p className="text-gray-600 text-lg">
                        Selecciona tu rol para continuar
                    </p>
                </div>

                {/* Role Cards */}
                <div className={`grid grid-cols-1 ${availableRoles.length === 2 ? 'md:grid-cols-2' : availableRoles.length >= 3 ? 'md:grid-cols-3' : ''} gap-6 mb-8`}>
                    {availableRoles.map(role => {
                        const config = roleConfig[role];
                        if (!config) return null;

                        const Icon = config.icon;
                        const isCurrent = role === currentRole;

                        return (
                            <div
                                key={role}
                                onClick={() => handleSelectRole(role)}
                                className={`relative group cursor-pointer transition-all duration-300 ${isCurrent ? 'scale-105' : 'hover:scale-105'
                                    }`}
                            >
                                <div className={`bg-white rounded-2xl shadow-xl p-8 border-4 transition-all ${isCurrent
                                        ? 'border-indigo-500 shadow-2xl'
                                        : 'border-transparent hover:border-indigo-200 hover:shadow-2xl'
                                    }`}>
                                    {/* Current role badge */}
                                    {isCurrent && (
                                        <div className="absolute top-4 right-4">
                                            <span className="bg-indigo-100 text-indigo-800 text-xs font-semibold px-3 py-1 rounded-full">
                                                Actual
                                            </span>
                                        </div>
                                    )}

                                    {/* Icon */}
                                    <div className={`w-24 h-24 mx-auto mb-6 rounded-3xl bg-gradient-to-br ${config.color} flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg`}>
                                        <Icon className="h-12 w-12 text-white" />
                                    </div>

                                    {/* Title */}
                                    <h3 className="text-2xl font-bold text-gray-900 mb-3 text-center">
                                        {config.label}
                                    </h3>

                                    {/* Description */}
                                    <p className="text-gray-600 text-center text-sm leading-relaxed">
                                        {config.description}
                                    </p>

                                    {/* Action Button */}
                                    <div className="mt-6">
                                        <button
                                            className={`w-full py-3 rounded-xl font-semibold transition-all ${isCurrent
                                                    ? 'bg-indigo-600 text-white'
                                                    : `${config.bgColor} ${config.textColor} hover:bg-opacity-80`
                                                }`}
                                        >
                                            {isCurrent ? '✓ Seleccionado' : 'Seleccionar'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Footer hint */}
                <p className="text-center text-gray-500 text-sm">
                    💡 Podrás cambiar de rol en cualquier momento desde el menú superior
                </p>
            </div>
        </div>
    );
};

export default RoleSelector;
