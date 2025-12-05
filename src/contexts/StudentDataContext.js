/**
 * StudentDataContext.js
 * 
 * Context para manejar todos los datos del estudiante:
 * - Perfil de usuario
 * - Asignaturas
 * - Archivos/Materiales
 * - Libros guardados
 * - Progreso
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useRole } from './RoleContext';

const StudentDataContext = createContext();

export const useStudentData = () => {
    const context = useContext(StudentDataContext);
    if (!context) {
        throw new Error('useStudentData must be used within StudentDataProvider');
    }
    return context;
};

export const StudentDataProvider = ({ children }) => {
    const { session, userProfile: roleUserProfile } = useRole();

    // Subject State
    const [subjects, setSubjects] = useState([
        'Matemáticas',
        'Ciencias Naturales',
        'Ciencias Sociales',
        'Lengua Castellana',
        'Inglés'
    ]);
    const [selectedSubject, setSelectedSubject] = useState(subjects[0]);
    const [newSubject, setNewSubject] = useState('');
    const [isAddingSubject, setIsAddingSubject] = useState(false);

    // Material State
    const materialTypes = ['Libro', 'Apuntes', 'Trabajos', 'Exámenes'];
    const [selectedMaterialType, setSelectedMaterialType] = useState(materialTypes[0]);
    const [files, setFiles] = useState([]);
    const [pendingFiles, setPendingFiles] = useState([]);
    const [selectedFileIds, setSelectedFileIds] = useState([]);

    // Book State
    const [savedBooks, setSavedBooks] = useState([]);
    const [bookName, setBookName] = useState('');

    // Profile State (extended from RoleContext)
    const [userProfile, setUserProfile] = useState(roleUserProfile || {
        name: '',
        birth_date: '',
        level: '',
        grade: '',
        interests: '',
        observations: '',
        avatar_url: ''
    });

    // Progress State
    const [progress, setProgress] = useState({
        history: [],
        weaknesses: []
    });

    // Analytics State
    const [analytics, setAnalytics] = useState(null);

    // Practice Mode State
    const [practiceMode, setPracticeMode] = useState(null);
    const [currentPractice, setCurrentPractice] = useState(null);
    const [userAnswers, setUserAnswers] = useState({});
    const [correctionResult, setCorrectionResult] = useState(null);

    // Sync userProfile from RoleContext
    useEffect(() => {
        if (roleUserProfile) {
            setUserProfile(roleUserProfile);
        }
    }, [roleUserProfile]);

    // Load data when session changes
    useEffect(() => {
        if (session?.user?.id) {
            loadStudentData();
        }
    }, [session]);

    const loadStudentData = async () => {
        if (!session?.user?.id) return;

        try {
            const userId = session.user.id;

            // Fetch Subjects
            const { data: subjectsData, error: subjectsError } = await supabase
                .from('subjects')
                .select('name')
                .eq('user_id', userId);

            if (subjectsError) throw subjectsError;

            if (subjectsData && subjectsData.length > 0) {
                setSubjects(subjectsData.map(s => s.name));
                setSelectedSubject(subjectsData[0].name);
            } else {
                await createDefaultSubjects(userId);
            }

            // Fetch Materials
            const { data: materialsData, error: materialsError } = await supabase
                .from('materials')
                .select('*')
                .eq('user_id', userId)
                .order('date', { ascending: false });

            if (materialsError) throw materialsError;

            if (materialsData) {
                setFiles(materialsData);
                const books = materialsData.filter(f => f.type === 'Libro');
                setSavedBooks(books);
            }

            // Fetch Progress
            const { data: progressData } = await supabase
                .from('progress')
                .select('*')
                .eq('user_id', userId)
                .single();

            if (progressData) {
                setProgress(progressData);
            }

        } catch (error) {
            console.error('Error loading student data:', error);
        }
    };

    const createDefaultSubjects = async (userId) => {
        const defaultSubjects = [
            'Matemáticas',
            'Ciencias Naturales',
            'Ciencias Sociales',
            'Lengua Castellana',
            'Inglés'
        ];

        try {
            const subjectsToInsert = defaultSubjects.map(name => ({
                user_id: userId,
                name: name
            }));

            await supabase.from('subjects').insert(subjectsToInsert);

            // Reload subjects
            const { data: newSubjectsData } = await supabase
                .from('subjects')
                .select('name')
                .eq('user_id', userId);

            if (newSubjectsData) {
                setSubjects(newSubjectsData.map(s => s.name));
                setSelectedSubject(newSubjectsData[0].name);
            }
        } catch (error) {
            console.error('Error creating default subjects:', error);
        }
    };

    const handleAddSubject = async (subjectName) => {
        if (!subjectName.trim() || subjects.includes(subjectName.trim())) return;

        const name = subjectName.trim();
        const updatedSubjects = [...subjects, name];
        setSubjects(updatedSubjects);
        setSelectedSubject(name);
        setNewSubject('');
        setIsAddingSubject(false);

        try {
            await supabase.from('subjects').insert({
                user_id: session.user.id,
                name: name
            });
        } catch (error) {
            console.error('Error saving subject:', error);
        }
    };

    const handleDeleteSubject = async (subjectName) => {
        if (!window.confirm(`¿Eliminar "${subjectName}" y todos sus materiales?`)) return;

        try {
            await supabase
                .from('subjects')
                .delete()
                .eq('user_id', session.user.id)
                .eq('name', subjectName);

            await supabase
                .from('materials')
                .delete()
                .eq('user_id', session.user.id)
                .eq('subject', subjectName);

            const updatedSubjects = subjects.filter(s => s !== subjectName);
            setSubjects(updatedSubjects);

            if (selectedSubject === subjectName && updatedSubjects.length > 0) {
                setSelectedSubject(updatedSubjects[0]);
            }

            setFiles(files.filter(f => f.subject !== subjectName));
        } catch (error) {
            console.error('Error deleting subject:', error);
        }
    };

    const value = {
        // Subject data
        subjects,
        setSubjects,
        selectedSubject,
        setSelectedSubject,
        newSubject,
        setNewSubject,
        isAddingSubject,
        setIsAddingSubject,
        handleAddSubject,
        handleDeleteSubject,

        // Material data
        materialTypes,
        selectedMaterialType,
        setSelectedMaterialType,
        files,
        setFiles,
        pendingFiles,
        setPendingFiles,
        selectedFileIds,
        setSelectedFileIds,

        // Books
        savedBooks,
        setSavedBooks,
        bookName,
        setBookName,

        // Profile
        userProfile,
        setUserProfile,

        // Progress
        progress,
        setProgress,
        analytics,
        setAnalytics,

        // Practice
        practiceMode,
        setPracticeMode,
        currentPractice,
        setCurrentPractice,
        userAnswers,
        setUserAnswers,
        correctionResult,
        setCorrectionResult,

        // Methods
        loadStudentData,
        createDefaultSubjects
    };

    return (
        <StudentDataContext.Provider value={value}>
            {children}
        </StudentDataContext.Provider>
    );
};

export default StudentDataContext;
