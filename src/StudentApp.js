/**
 * StudentApp.js
 * 
 * Wrapper TEMPORAL que contiene la app del estudiante
 * Pendiente de refactorizar en páginas individuales
 * 
 * Por ahora, renderiza el contenido del App.js anterior
 */

import React from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';

// Import student components
import StudentProfile from './components/StudentProfile';
import Calendar from './components/Calendar';
import ParentDashboard from './components/ParentDashboard';
import GeneratorTabs from './components/GeneratorTabs';
import ResourcesLibrary from './components/ResourcesLibrary';
import FeedbackDashboard from './components/FeedbackDashboard';

// Placeholder pages (will be implemented properly later)
const UploadPage = () => <div className="p-8">Upload Page - TODO: Implement</div>;
const AnalyzePage = () => <div className="p-8">Analyze Page - TODO: Implement</div>;
const FeedbackPage = () => <div className="p-8">Feedback Page - TODO: Implement</div>;

const StudentApp = () => {
    return (
        <Routes>
            <Route path="profile" element={<StudentProfile />} />
            <Route path="generator" element={<GeneratorTabs />} />
            <Route path="calendar" element={<Calendar />} />
            <Route path="feedback" element={<FeedbackDashboard />} />
            <Route path="resources" element={<ResourcesLibrary />} />

            {/* Default */}
            <Route path="*" element={<Navigate to="/app/student/generator" replace />} />
        </Routes>
    );
};

export default StudentApp;
