/**
 * ProtectedRoute.js
 * 
 * Higher Order Component para proteger rutas según autenticación y roles
 * 
 * Uso:
 * <ProtectedRoute requireRole="parent">
 *   <ParentDashboard />
 * </ProtectedRoute>
 */

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useRole } from '../contexts/RoleContext';

const ProtectedRoute = ({
    children,
    requireAuth = true,
    requireRole = null,
    requireAnyRole = null,
    redirectTo = '/login'
}) => {
    const { session, currentRole, availableRoles, loading } = useRole();
    const location = useLocation();

    // Show loading while checking auth
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
                    <p className="text-gray-600">Cargando...</p>
                </div>
            </div>
        );
    }

    // Check authentication
    if (requireAuth && !session) {
        return <Navigate to={redirectTo} state={{ from: location }} replace />;
    }

    // Check specific role
    if (requireRole && currentRole !== requireRole) {
        // If user doesn't have the required role, redirect to role selector or appropriate page
        if (availableRoles.includes(requireRole)) {
            // User has the role but needs to switch
            return <Navigate to="/app/select-role" state={{ requiredRole: requireRole }} replace />;
        } else {
            // User doesn't have this role at all
            return <Navigate to="/app/unauthorized" replace />;
        }
    }

    // Check if user has any of the required roles
    if (requireAnyRole && Array.isArray(requireAnyRole)) {
        const hasRequiredRole = requireAnyRole.some(role => currentRole === role);
        if (!hasRequiredRole) {
            // Check if user has any of these roles available
            const hasRoleAvailable = requireAnyRole.some(role => availableRoles.includes(role));
            if (hasRoleAvailable) {
                return <Navigate to="/app/select-role" state={{ requiredRoles: requireAnyRole }} replace />;
            } else {
                return <Navigate to="/app/unauthorized" replace />;
            }
        }
    }

    // All checks passed, render children
    return <>{children}</>;
};

export default ProtectedRoute;
