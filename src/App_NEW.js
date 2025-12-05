/**
 * App.js (REFACTORIZADO)
 * 
 * Archivo principal con React Router y sistema multi-rol
 * 
 * Estructura:
 * - RoleProvider envuelve toda la app
 * - BrowserRouter para routing
 * - Rutas públicas: /, /login
 * - Rutas protegidas: /app/* (con subr utas por rol)
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { RoleProvider } from './contexts/RoleContext';

// Layouts
import AppLayout from './layouts/AppLayout';
import StudentLayout from './layouts/StudentLayout';
import ParentLayout from './layouts/ParentLayout';

// Public pages
import LandingPage from './LandingPage';
import Auth from './Auth';

// Protected Route wrapper
import ProtectedRoute from './components/ProtectedRoute';

// Common components
import RoleSelector from './components/RoleSelector';

// Student pages (importaremos el componente existente temporalmente)
import StudentApp from './StudentApp'; // TODO: Crear este archivo con lógica actual

// Parent pages
import ParentOverview from './pages/ParentOverview';
import ParentDashboard from './components/ParentDashboard';

// Utility pages
import Unauthorized from './pages/Unauthorized';

function App() {
    return (
        <RoleProvider>
            <BrowserRouter>
                <Routes>
                    {/* ============================================ */}
                    {/* PUBLIC ROUTES */}
                    {/* ============================================ */}

                    {/* Landing Page */}
                    <Route path="/" element={<LandingPage />} />

                    {/* Auth/Login */}
                    <Route path="/login" element={<Auth />} />
                    <Route path="/signup" element={<Auth />} />

                    {/* ============================================ */}
                    {/* PROTECTED ROUTES - Require Authentication */}
                    {/* ============================================ */}

                    <Route path="/app" element={
                        <ProtectedRoute>
                            <AppLayout />
                        </ProtectedRoute>
                    }>
                        {/* Role Selector (shown when user has multiple roles) */}
                        <Route path="select-role" element={<RoleSelector />} />

                        {/* Unauthorized page */}
                        <Route path="unauthorized" element={<Unauthorized />} />

                        {/* ============================================ */}
                        {/* STUDENT ROUTES */}
                        {/* ============================================ */}
                        <Route path="student" element={
                            <ProtectedRoute requireRole="student">
                                <StudentLayout />
                            </ProtectedRoute>
                        }>
                            {/* Default redirect */}
                            <Route index element={<Navigate to="/app/student/upload" replace />} />

                            {/* Student sub-routes - TODO: Create individual page components */}
                            <Route path="*" element={<StudentApp />} />
                        </Route>

                        {/* ============================================ */}
                        {/* PARENT ROUTES */}
                        {/* ============================================ */}
                        <Route path="parent" element={
                            <ProtectedRoute requireRole="parent">
                                <ParentLayout />
                            </ProtectedRoute>
                        }>
                            {/* Overview - List of all children */}
                            <Route path="overview" element={<ParentOverview />} />

                            {/* Specific child dashboard */}
                            <Route path="child/:childId" element={<ParentDashboard />} />

                            {/* Manage links */}
                            <Route path="links" element={<div>Parent Links Management (TODO)</div>} />

                            {/* Settings */}
                            <Route path="settings" element={<div>Parent Settings (TODO)</div>} />

                            {/* Default redirect */}
                            <Route index element={<Navigate to="/app/parent/overview" replace />} />
                        </Route>

                        {/* ============================================ */}
                        {/* TEACHER ROUTES (Future) */}
                        {/* ============================================ */}
                        <Route path="teacher" element={
                            <ProtectedRoute requireRole="teacher">
                                <div className="p-8 text-center">
                                    <h1 className="text-2xl font-bold text-gray-900 mb-4">
                                        Panel de Profesor
                                    </h1>
                                    <p className="text-gray-600">Próximamente...</p>
                                </div>
                            </ProtectedRoute>
                        } />

                        {/* ============================================ */}
                        {/* DEFAULT - Redirect based on role */}
                        {/* ============================================ */}
                        <Route index element={<Navigate to="/app/select-role" replace />} />
                    </Route>

                    {/* ============================================ */}
                    {/* 404 - Catch all */}
                    {/* ============================================ */}
                    <Route path="*" element={
                        <div className="min-h-screen flex items-center justify-center bg-gray-50">
                            <div className="text-center">
                                <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
                                <p className="text-gray-600 mb-6">Página no encontrada</p>
                                <a href="/" className="text-indigo-600 hover:text-indigo-700 font-medium">
                                    Volver al inicio
                                </a>
                            </div>
                        </div>
                    } />
                </Routes>
            </BrowserRouter>
        </RoleProvider>
    );
}

export default App;
