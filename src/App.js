import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { RoleProvider } from './contexts/RoleContext';
import { StudentDataProvider } from './contexts/StudentDataContext';
import { AIFunctionProvider } from './contexts/AIFunctionContext';
import { UIProvider } from './contexts/UIContext';

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
import ParentChildLinks from './components/ParentChildLinks';

// Student pages
import StudentApp from './StudentApp';

// Parent pages
import ParentOverview from './pages/ParentOverview';
import ParentDashboard from './components/ParentDashboard';

// Utility pages
import Unauthorized from './pages/Unauthorized';

function App() {
    return (
        <RoleProvider>
            <StudentDataProvider>
                <AIFunctionProvider>
                    <UIProvider>
                        <BrowserRouter>
                            <Routes>
                                {/* PUBLIC ROUTES */}
                                <Route path="/" element={<LandingPage />} />
                                <Route path="/login" element={<Auth />} />
                                <Route path="/signup" element={<Auth />} />

                                {/* PROTECTED ROUTES */}
                                <Route path="/app" element={
                                    <ProtectedRoute>
                                        <AppLayout />
                                    </ProtectedRoute>
                                }>
                                    <Route path="select-role" element={<RoleSelector />} />
                                    <Route path="unauthorized" element={<Unauthorized />} />

                                    {/* STUDENT ROUTES */}
                                    <Route path="student" element={
                                        <ProtectedRoute requireRole="student">
                                            <StudentLayout />
                                        </ProtectedRoute>
                                    }>
                                        <Route index element={<Navigate to="/app/student/upload" replace />} />
                                        <Route path="*" element={<StudentApp />} />
                                    </Route>

                                    {/* PARENT ROUTES */}
                                    <Route path="parent" element={
                                        <ProtectedRoute requireRole="parent">
                                            <ParentLayout />
                                        </ProtectedRoute>
                                    }>
                                        <Route path="overview" element={<ParentOverview />} />
                                        <Route path="child/:childId" element={<ParentDashboard />} />
                                        <Route path="links" element={<ParentChildLinks />} />
                                        <Route path="settings" element={<div className="p-8">Settings (TODO)</div>} />
                                        <Route index element={<Navigate to="/app/parent/overview" replace />} />
                                    </Route>

                                    {/* TEACHER ROUTES */}
                                    <Route path="teacher" element={
                                        <ProtectedRoute requireRole="teacher">
                                            <div className="p-8 text-center">
                                                <h1 className="text-2xl font-bold mb-4">Panel Profesor</h1>
                                                <p className="text-gray-600">Próximamente...</p>
                                            </div>
                                        </ProtectedRoute>
                                    } />

                                    <Route index element={<Navigate to="/app/select-role" replace />} />
                                </Route>

                                {/* 404 */}
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
                    </UIProvider>
                </AIFunctionProvider>
            </StudentDataProvider>
        </RoleProvider>
    );
}

export default App;
