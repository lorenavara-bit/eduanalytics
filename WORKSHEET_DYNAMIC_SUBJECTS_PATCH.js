// ESTE ARCHIVO CONTIENE LAS MODIFICACIONES NECESARIAS PARA WorksheetGenerator.js
// BUSCAR LA SECCIÓN "START OF COMPONENT" Y REEMPLAZAR HASTA "END OF INITIAL STATE"

// ===== INICIO DE LA MODIFICACIÓN =====
import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabaseClient';
import {
    BookOpen, Brain, Download, CheckCircle, AlertCircle,
    Zap, Target, Eye, Lightbulb, Sparkles, Clock,
    TrendingUp, Award, Smile, Mic, StopCircle, Play, Pause, Trash2
} from 'lucide-react';
import { Card, CardContent, CardHeader, Button, Badge, Alert, Spinner, Textarea } from './DesignSystem';

const WorksheetGenerator = ({ session, userProfile, callGeminiAPI, selectedFiles, savedBooks, allFiles, initialTopic }) => {
    const [loading, setLoading] = useState(false);
    const [generatingWorksheet, setGeneratingWorksheet] = useState(false);
    const [generatedWorksheet, setGeneratedWorksheet] = useState(null);
    const [studentAnswers, setStudentAnswers] = useState({});
    const [correctionResult, setCorrectionResult] = useState(null);
    const [correcting, setCorrecting] = useState(false);

    // Audio Recording States
    const [audioAnswers, setAudioAnswers] = useState({});
    const [recording, setRecording] = useState(null);
    const [mediaRecorder, setMediaRecorder] = useState(null);
    const [transcribing, setTranscribing] = useState(null);
    const audioChunks = useRef([]);

    // Worksheet Configuration
    const [selectedSubject, setSelectedSubject] = useState('');
    const [difficultyLevel, setDifficultyLevel] = useState('intermedio');
    const [worksheetType, setWorksheetType] = useState('worksheet');
    const [numQuestions, setNumQuestions] = useState(10);
    const [topic, setTopic] = useState(initialTopic || '');
    const [curriculumStandards, setCurriculumStandards] = useState([]);
    const [selectedStandard, setSelectedStandard] = useState(null);

    // === NUEVA FUNCIONALIDAD: CARGAR ASIGNATURAS DINÁMICAMENTE ===
    const [availableSubjects, setAvailableSubjects] = useState([]);
    const [loadingSubjects, setLoadingSubjects] = useState(true);

    // Cargar asignaturas únicas desde curriculum_standards al montar el componente
    useEffect(() => {
        loadAvailableSubjects();
    }, []);

    const loadAvailableSubjects = async () => {
        setLoadingSubjects(true);
        try {
            // Obtener todas las asignaturas únicas de curriculum_standards
            const { data, error } = await supabase
                .from('curriculum_standards')
                .select('subject');

            if (error) throw error;

            if (data && data.length > 0) {
                // Extraer asignaturas únicas y ordenar alfabéticamente
                const uniqueSubjects = [...new Set(data.map(item => item.subject))].sort();
                setAvailableSubjects(uniqueSubjects);
                console.log('✅ Asignaturas cargadas desde DB:', uniqueSubjects);
            } else {
                // Si no hay datos, usar asignaturas por defecto
                console.warn('⚠️ No se encontraron asignaturas en curriculum_standards, usando valores por defecto');
                setAvailableSubjects(['Matemáticas', 'Lengua Castellana', 'Ciencias Naturales', 'Ciencias Sociales', 'Inglés']);
            }
        } catch (error) {
            console.error('❌ Error al cargar asignaturas:', error);
            // En caso de error, usar asignaturas por defecto
            setAvailableSubjects(['Matemáticas', 'Lengua Castellana', 'Ciencias Naturales', 'Ciencias Sociales', 'Inglés']);
        } finally {
            setLoadingSubjects(false);
        }
    };
    // === FIN DE LA MODIFICACIÓN ===

    // Cargar estándares del currículo cuando cambia la asignatura o el grado
    useEffect(() => {
        if (userProfile.grade && selectedSubject) {
            loadCurriculumData();
        }
    }, [userProfile.grade, selectedSubject]);

    const loadCurriculumData = async () => {
        try {
            const { data: standards } = await supabase
                .from('curriculum_standards')
                .select('*')
                .eq('grade_level', userProfile.grade)
                .eq('subject', selectedSubject);

            if (standards && standards.length > 0) {
                setCurriculumStandards(standards);
                console.log(`✅ Cargados ${standards.length} estándares para ${selectedSubject} - ${userProfile.grade}`);
            } else {
                setCurriculumStandards([]);
                console.log(`⚠️ No se encontraron estándares para ${selectedSubject} - ${userProfile.grade}`);
            }
        } catch (error) {
            console.error('Error loading curriculum:', error);
        }
    };

    const difficultyLevels = [
        { value: 'básico', label: 'Básico', icon: '⭐', description: 'Conceptos fundamentales y refuerzo' },
        { value: 'intermedio', label: 'Intermedio', icon: '⭐⭐', description: 'Nivel estándar del curso' },
        { value: 'avanzado', label: 'Avanzado', icon: '⭐⭐⭐', description: 'Desafío y profundización' }
    ];

    const worksheetTypes = [
        { value: 'worksheet', label: 'Ficha de Ejercicios', icon: '📝', description: 'Práctica diaria' },
        { value: 'exam', label: 'Examen / Test', icon: '📊', description: 'Evaluación formal' }
    ];

// ===== FIN DE LA MODIFICACIÓN =====

// El resto del componente sigue igual...
