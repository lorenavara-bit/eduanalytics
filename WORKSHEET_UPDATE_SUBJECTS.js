import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabaseClient';
import {
    BookOpen, Brain, Download, CheckCircle, AlertCircle,
    Zap, Target, Eye, Lightbulb, Sparkles, Clock,
    TrendingUp, Award, Smile, Mic, StopCircle, Play, Pause, Trash2
} from 'lucide-react';
import { Card, CardContent, CardHeader, Button, Badge, Alert, Spinner, Textarea } from './DesignSystem';

const WorksheetGenerator = ({ session, userProfile, callGeminiAPI }) => {
    const [loading, setLoading] = useState(false);
    const [curriculumConcepts, setCurriculumConcepts] = useState([]);
    const [curriculumStandards, setCurriculumStandards] = useState([]);
    const [selectedSubject, setSelectedSubject] = useState('');
    const [selectedStandard, setSelectedStandard] = useState(null);
    const [numQuestions, setNumQuestions] = useState(10);
    const [difficultyLevel, setDifficultyLevel] = useState('intermedio');
    const [worksheetType, setWorksheetType] = useState('worksheet');
    const [generatedWorksheet, setGeneratedWorksheet] = useState(null);
    const [studentAnswers, setStudentAnswers] = useState({});
    const [correctionResult, setCorrectionResult] = useState(null);

    // Audio Recording States
    const [audioAnswers, setAudioAnswers] = useState({}); // {questionId: {blob, url, transcription}}
    const [recording, setRecording] = useState(null); // questionId currently being recorded
    const [mediaRecorder, setMediaRecorder] = useState(null);
    const [transcribing, setTranscribing] = useState(null); // questionId being transcribed
    const audioChunks = useRef([]);

    // Dynamic subjects loaded from database
    const [subjects, setSubjects] = useState([]);
    const [loadingSubjects, setLoadingSubjects] = useState(true);

    const difficultyLevels = [
        { value: 'básico', label: 'Básico', icon: '⭐', description: 'Conceptos fundamentales y refuerzo' },
        { value: 'intermedio', label: 'Intermedio', icon: '⭐⭐', description: 'Nivel estándar del curso' },
        { value: 'avanzado', label: 'Avanzado', icon: '⭐⭐⭐', description: 'Desafío y profundización' }
    ];

    const worksheetTypes = [
        { value: 'worksheet', label: 'Ficha de Ejercicios', icon: '📝', description: 'Práctica diaria' },
        { value: 'exam', label: 'Examen / Test', icon: '📊', description: 'Evaluación formal' }
    ];

    // Load available subjects from database on mount
    useEffect(() => {
        loadAvailableSubjects();
    }, []);

    // Load curriculum data when subject changes
    useEffect(() => {
        if (userProfile.grade && selectedSubject) {
            loadCurriculumData();
        }
    }, [userProfile.grade, selectedSubject]);

    const loadAvailableSubjects = async () => {
        setLoadingSubjects(true);
        try {
            // Get all unique subjects from curriculum_standards table
            const { data, error } = await supabase
                .from('curriculum_standards')
                .select('subject');

            if (error) throw error;

            if (data && data.length > 0) {
                // Extract unique subjects and sort alphabetically
                const uniqueSubjects = [...new Set(data.map(item => item.subject))].sort();
                setSubjects(uniqueSubjects);
            } else {
                // Fallback to default subjects if no data
                setSubjects(['Matemáticas', 'Lengua Castellana', 'Ciencias Naturales', 'Ciencias Sociales', 'Inglés']);
            }
        } catch (error) {
            console.error('Error loading subjects:', error);
            // Fallback to default subjects on error
            setSubjects(['Matemáticas', 'Lengua Castellana', 'Ciencias Naturales', 'Ciencias Sociales', 'Inglés']);
        } finally {
            setLoadingSubjects(false);
        }
    };

    const loadCurriculumData = async () => {
        try {
            // Load standards/competencies
            const { data: standards } = await supabase
                .from('curriculum_standards')
                .select('*')
                .eq('grade_level', userProfile.grade)
                .eq('subject', selectedSubject);

            if (standards && standards.length > 0) {
                setCurriculumStandards(standards);
            } else {
                // Fallback if no standards found
                setCurriculumStandards([]);
            }
        } catch (error) {
            console.error('Error loading curriculum:', error);
        }
    };
