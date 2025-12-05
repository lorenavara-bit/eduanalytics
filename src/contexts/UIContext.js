/**
 * UIContext.js
 * 
 * Context para estados globales de UI:
 * - Loading states
 * - Save status
 * - Error messages
 * - Active tab/view
 * - Modals
 */

import React, { createContext, useContext, useState } from 'react';

const UIContext = createContext();

export const useUI = () => {
    const context = useContext(UIContext);
    if (!context) {
        throw new Error('useUI must be used within UIProvider');
    }
    return context;
};

export const UIProvider = ({ children }) => {
    // Loading states
    const [loading, setLoading] = useState(false);
    const [saveStatus, setSaveStatus] = useState('idle'); // 'idle', 'saving', 'success', 'error'

    // Messages
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    // Active view/tab (for student pages)
    const [activeTab, setActiveTab] = useState('upload');

    // Modals
    const [showBookModal, setShowBookModal] = useState(false);
    const [bookChoice, setBookChoice] = useState(null); // 'upload' or 'ai'
    const [aiBookName, setAiBookName] = useState('');
    const [aiBookQuestion, setAiBookQuestion] = useState('');
    const [aiResponse, setAiResponse] = useState(null);

    // Landing/Auth state
    const [showAuth, setShowAuth] = useState(false);
    const [authEmail, setAuthEmail] = useState('');
    const [authIsSignUp, setAuthIsSignUp] = useState(false);

    /**
     * Clear all messages
     */
    const clearMessages = () => {
        setErrorMessage('');
        setSuccessMessage('');
    };

    /**
     * Show error message with auto-clear
     */
    const showError = (message, duration = 5000) => {
        setErrorMessage(message);
        if (duration > 0) {
            setTimeout(() => setErrorMessage(''), duration);
        }
    };

    /**
     * Show success message with auto-clear
     */
    const showSuccess = (message, duration = 3000) => {
        setSuccessMessage(message);
        setSaveStatus('success');
        if (duration > 0) {
            setTimeout(() => {
                setSuccessMessage('');
                setSaveStatus('idle');
            }, duration);
        }
    };

    /**
     * Set saving state
     */
    const startSaving = () => {
        setSaveStatus('saving');
        clearMessages();
    };

    /**
     * Complete saving successfully
     */
    const completeSaving = (message = '¡Guardado correctamente!') => {
        setSaveStatus('success');
        showSuccess(message);
    };

    /**
     * Save failed
     */
    const failSaving = (message = 'Error al guardar') => {
        setSaveStatus('error');
        showError(message);
    };

    /**
     * Reset save status
     */
    const resetSaveStatus = () => {
        setSaveStatus('idle');
        clearMessages();
    };

    const value = {
        // Loading
        loading,
        setLoading,

        // Save status
        saveStatus,
        setSaveStatus,
        startSaving,
        completeSaving,
        failSaving,
        resetSaveStatus,

        // Messages
        errorMessage,
        setErrorMessage,
        successMessage,
        setSuccessMessage,
        clearMessages,
        showError,
        showSuccess,

        // Active views
        activeTab,
        setActiveTab,

        // Modals
        showBookModal,
        setShowBookModal,
        bookChoice,
        setBookChoice,
        aiBookName,
        setAiBookName,
        aiBookQuestion,
        setAiBookQuestion,
        aiResponse,
        setAiResponse,

        // Auth
        showAuth,
        setShowAuth,
        authEmail,
        setAuthEmail,
        authIsSignUp,
        setAuthIsSignUp
    };

    return (
        <UIContext.Provider value={value}>
            {children}
        </UIContext.Provider>
    );
};

export default UIContext;
