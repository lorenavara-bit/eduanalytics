import React, { useState, useEffect } from 'react';
import { Camera, BookOpen, FileText, BarChart3, Brain, User, Upload, LogOut, Trash2, X, CheckCircle, Download, Calendar as CalendarIcon, Users } from 'lucide-react';
import { supabase } from './supabaseClient';
import Auth from './Auth';
import LandingPage from './LandingPage';
import Feedback from './Feedback';
import FeedbackDashboard from './components/FeedbackDashboard';
import WorksheetGenerator from './components/WorksheetGeneratorComplete';
import ResourcesLibrary from './components/ResourcesLibrary';
import StudentProfile from './components/StudentProfile';
import Calendar from './components/Calendar';
import ParentDashboard from './components/ParentDashboard';

const EduAnalyticsApp = () => {
  // System State
  const [session, setSession] = useState(null);
  const [pendingFiles, setPendingFiles] = useState([]); // files selected but not yet uploaded
  const [selectedFileIds, setSelectedFileIds] = useState([]); // files selected for analysis
  const [saveStatus, setSaveStatus] = useState('idle'); // 'idle', 'saving', 'success', 'error'
  const [errorMessage, setErrorMessage] = useState('');
  const [apiKey, setApiKey] = useState(process.env.REACT_APP_DEFAULT_GEMINI_KEY || '');

  const [activeTab, setActiveTab] = useState('upload');

  // Practice Mode State
  const [practiceMode, setPracticeMode] = useState(null); // 'exam' or 'assignment'
  const [currentPractice, setCurrentPractice] = useState(null);
  const [userAnswers, setUserAnswers] = useState({});
  const [correctionResult, setCorrectionResult] = useState(null);
  const [bookName, setBookName] = useState('');

  // Landing Page State
  const [showAuth, setShowAuth] = useState(false);
  const [authEmail, setAuthEmail] = useState('');
  const [authIsSignUp, setAuthIsSignUp] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch Data on Session Change
  useEffect(() => {
    const fetchData = async () => {
      if (!session) return;

      setLoading(true);
      try {
        const user = session.user;

        // Fetch Profile
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileError && profileError.code !== 'PGRST116') { // PGRST116 is "not found"
          throw profileError;
        }

        if (profile) {
          setUserProfile(profile);
          if (profile.gemini_api_key) {
            setApiKey(profile.gemini_api_key);
          } else {
            setApiKey(process.env.REACT_APP_DEFAULT_GEMINI_KEY || '');
          }
        }

        // Fetch Subjects
        const { data: subjectsData, error: subjectsError } = await supabase
          .from('subjects')
          .select('name')
          .eq('user_id', user.id);

        if (subjectsError) throw subjectsError;

        if (subjectsData && subjectsData.length > 0) {
          setSubjects(subjectsData.map(s => s.name));
        } else {
          await createDefaultSubjects(user.id);
          const { data: newSubjectsData } = await supabase
            .from('subjects')
            .select('name')
            .eq('user_id', user.id);
          if (newSubjectsData) {
            setSubjects(newSubjectsData.map(s => s.name));
          }
        }

        // Fetch Materials
        const { data: materialsData, error: materialsError } = await supabase
          .from('materials')
          .select('*')
          .eq('user_id', user.id);

        if (materialsError) throw materialsError;

        if (materialsData) {
          setFiles(materialsData);
          // Filter and set saved books
          const books = materialsData.filter(f => f.type === 'Libro');
          setSavedBooks(books);
        }

        // Fetch Progress
        const { data: progressData, error: progressError } = await supabase
          .from('progress')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (progressData) {
          setProgress(progressData);
        }

      } catch (error) {
        console.error('Error fetching data:', error);
        setErrorMessage('Error al cargar datos: ' + error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [session]);

  // Create default subjects for new users
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
    } catch (error) {
      console.error('Error creating default subjects:', error);
    }
  };


  // Subject State
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

  // Book Modal State
  const [showBookModal, setShowBookModal] = useState(false);
  const [bookChoice, setBookChoice] = useState(null); // 'upload' or 'ai'
  const [aiBookName, setAiBookName] = useState('');
  const [aiBookQuestion, setAiBookQuestion] = useState('');
  const [aiResponse, setAiResponse] = useState(null);
  const [savedBooks, setSavedBooks] = useState([]);

  // Profile State
  // Profile State
  const [userProfile, setUserProfile] = useState({
    name: '',
    birth_date: '',
    level: '',
    grade: '',
    interests: '',
    observations: '',
    avatar_url: ''
  });

  // Analysis & Progress State
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);

  const [progress, setProgress] = useState({
    strengths: [],
    weaknesses: [],
    history: []
  });

  // Save Data Helpers
  const saveToSupabase = async (table, data, matchColumn = 'user_id') => {
    setSaveStatus('saving');
    setErrorMessage('');
    try {
      const user = session.user;
      const payload = { ...data, user_id: user.id };

      // Check if exists to decide insert vs update (simplified upsert)
      // For profiles/progress which are 1:1
      if (table === 'profiles' || table === 'progress') {
        const { error } = await supabase
          .from(table)
          .upsert({ ...payload, id: user.id }); // Assuming id is PK and matches user_id for 1:1
        if (error) throw error;
      } else {
        // For subjects/materials which are 1:N
        const { error } = await supabase
          .from(table)
          .insert(payload);
        if (error) throw error;
      }

      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error) {
      console.error("Error saving data:", error);
      setSaveStatus('error');
      setErrorMessage(`No se pudo guardar: ${error.message}`);
    }
  };

  const saveProfile = async () => {
    setSaveStatus('saving');
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: session.user.id,
          ...userProfile,
          gemini_api_key: apiKey || null, // Save API key to profile
          updated_at: new Date()
        });
      if (error) throw error;
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error) {
      setSaveStatus('error');
      setErrorMessage(error.message);
    }
  };

  const handleAddSubject = async () => {
    if (newSubject.trim() && !subjects.includes(newSubject.trim())) {
      const subjectName = newSubject.trim();
      const updatedSubjects = [...subjects, subjectName];
      setSubjects(updatedSubjects);
      setSelectedSubject(subjectName);
      setNewSubject('');
      setIsAddingSubject(false);

      // Save to Supabase
      try {
        await supabase.from('subjects').insert({
          user_id: session.user.id,
          name: subjectName
        });
      } catch (error) {
        console.error('Error saving subject', error);
      }
    }
  };

  const handleDeleteSubject = async (subjectName) => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar la asignatura "${subjectName}"? Esto también eliminará todos los materiales asociados.`)) {
      try {
        // Delete subject from Supabase
        await supabase
          .from('subjects')
          .delete()
          .eq('user_id', session.user.id)
          .eq('name', subjectName);

        // Delete associated materials
        await supabase
          .from('materials')
          .delete()
          .eq('user_id', session.user.id)
          .eq('subject', subjectName);

        // Update local state
        const updatedSubjects = subjects.filter(s => s !== subjectName);
        setSubjects(updatedSubjects);

        // Update selected subject if deleted
        if (selectedSubject === subjectName && updatedSubjects.length > 0) {
          setSelectedSubject(updatedSubjects[0]);
        }

        // Update files state
        setFiles(files.filter(f => f.subject !== subjectName));
      } catch (error) {
        console.error('Error deleting subject:', error);
        setErrorMessage('Error al eliminar la asignatura');
      }
    }
  };

  const handleDeleteMaterial = async (materialId, materialName) => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar "${materialName}"?`)) {
      try {
        // Delete from Supabase
        await supabase
          .from('materials')
          .delete()
          .eq('id', materialId)
          .eq('user_id', session.user.id);

        // Update local state
        setFiles(files.filter(f => f.id !== materialId));
      } catch (error) {
        console.error('Error deleting material:', error);
        setErrorMessage('Error al eliminar el archivo');
      }
    }
  };

  const submitPractice = async (results) => {
    // Simular análisis de errores
    const newEntry = {
      date: new Date().toISOString(),
      subject: selectedSubject,
      type: practiceMode,
      score: results.score,
      errors: results.errors
    };

    const updatedProgress = (() => {
      const newHistory = [newEntry, ...(progress.history || [])];
      const allErrors = newHistory.flatMap(h => h.errors);
      const errorCounts = allErrors.reduce((acc, curr) => {
        acc[curr] = (acc[curr] || 0) + 1;
        return acc;
      }, {});

      const weaknesses = Object.entries(errorCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)
        .map(([topic]) => topic);

      return {
        ...progress,
        history: newHistory,
        weaknesses,
        strengths: ['Conceptos Básicos'] // Simulado
      };
    })();

    setProgress(updatedProgress);

    // Save to Supabase
    try {
      await supabase.from('progress').upsert({
        user_id: session.user.id, // Assuming we query by user_id, but upsert needs PK. 
        // My schema has 'id' as PK auto-increment. 
        // For 1:1 progress, we should probably use user_id as PK or fetch the ID first.
        // Let's assume we fetch the ID in fetchData and store it in progress state.
        // Or simpler: delete old and insert new? No.
        // Let's just update the row where user_id matches.
        ...updatedProgress,
        updated_at: new Date()
      }, { onConflict: 'user_id' }); // Requires unique constraint on user_id
    } catch (error) {
      // If onConflict fails (no unique constraint), we might need to handle it.
      // For now, let's assume the schema allows it or we fix schema.
      console.error('Error saving progress', error);
    }

    setPracticeMode(null);
    setCurrentPractice(null);
    setPracticeMode(null);
    setCurrentPractice(null);
    setActiveTab('feedback');
  };

  const [initialTopic, setInitialTopic] = useState('');

  const handleGenerateWorksheetFromResource = (topic) => {
    setInitialTopic(topic);
    setActiveTab('analyze');
  };

  const handleGetStarted = (email) => {
    setAuthEmail(email);
    setAuthIsSignUp(true);
    setShowAuth(true);
  };

  const handleLogin = () => {
    setAuthIsSignUp(false);
    setShowAuth(true);
  };

  const educationLevels = {
    'Primaria': ['1º', '2º', '3º', '4º', '5º', '6º'],
    'Secundaria': ['1º', '2º', '3º', '4º'],
    'Bachillerato': ['1º', '2º'],
    'Universidad': ['1º', '2º', '3º', '4º', '5º', '6º']
  };

  const calculateAge = (birthDate) => {
    if (!birthDate) return '';
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setUserProfile(prev => {
      const newProfile = { ...prev, [name]: value };
      if (name === 'level') {
        newProfile.grade = '';
      }
      return newProfile;
    });
  };

  const handleAvatarUpload = async (event) => {
    try {
      setSaveStatus('saving');
      setErrorMessage('');

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('Debes seleccionar una imagen para subir.');
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${session.user.id}/${fileName}`;

      let { error: uploadError } = await supabase.storage
        .from('AVATARS')
        .upload(filePath, file);

      if (uploadError) {
        // If avatars bucket doesn't exist, try creating it or fallback (handling via error message for now)
        // For this app, we assume 'avatars' bucket exists or user has permissions. 
        // If it fails, we might try 'public' or just show error.
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('AVATARS')
        .getPublicUrl(filePath);

      // Prepare the updated profile data with the new avatar URL
      const updatedProfileData = {
        ...userProfile,
        avatar_url: publicUrl
      };

      // Update state with new avatar
      setUserProfile(updatedProfileData);

      // Auto-save profile with new avatar to database
      const { error: updateError } = await supabase
        .from('profiles')
        .upsert({
          id: session.user.id,
          ...updatedProfileData,
          gemini_api_key: apiKey || null,
          updated_at: new Date()
        });

      if (updateError) throw updateError;

      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error) {
      console.error('Error uploading avatar:', error);
      setErrorMessage('Error al subir la imagen: ' + error.message);
      setSaveStatus('error');
    }
  };

  const tabs = [
    { id: 'profile', name: 'Perfil', icon: User },
    { id: 'upload', name: 'Subir Material', icon: Upload },
    { id: 'analyze', name: 'Analizar', icon: Brain },
    { id: 'feedback', name: 'Feedback', icon: BarChart3 },
    { id: 'resources', name: 'Recursos', icon: BookOpen }
  ];



  const handleFileUpload = async (filesToUpload) => {
    console.log('handleFileUpload called with:', filesToUpload);
    // If called from the file input change (event), use the event's files
    // If called from the save button (array), use the array
    let selectedFiles = [];
    if (filesToUpload && filesToUpload.target && filesToUpload.target.files) {
      selectedFiles = Array.from(filesToUpload.target.files);
    } else if (Array.isArray(filesToUpload)) {
      selectedFiles = filesToUpload;
    }

    console.log('Selected files:', selectedFiles);
    console.log('Selected subject:', selectedSubject);
    console.log('Selected material type:', selectedMaterialType);

    if (selectedFiles.length === 0) return;

    setSaveStatus('saving');
    setErrorMessage('');
    const newFiles = [];

    try {
      for (const file of selectedFiles) {
        let contentToSave = '';

        // Check if file is text-based or binary
        const isTextFile = file.type === 'text/plain' ||
          file.name.endsWith('.txt') ||
          file.name.endsWith('.md') ||
          file.name.endsWith('.csv');

        if (isTextFile) {
          // Read text content locally
          contentToSave = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = () => reject('Error reading file');
            reader.readAsText(file);
          });
        } else {
          // For binary files (PDF, Images, Word, ODT), upload to Storage
          const fileExt = file.name.split('.').pop();
          const fileName = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
          const filePath = `${session.user.id}/${fileName}`;

          try {
            const { error: uploadError } = await supabase.storage
              .from('materials')
              .upload(filePath, file);

            if (uploadError) {
              // If bucket doesn't exist, we can't upload. 
              // Fallback: Save a placeholder message so DB insert doesn't fail, 
              // but warn user.
              console.warn("Storage upload failed (bucket might be missing):", uploadError);
              contentToSave = `[Error: No se pudo subir el archivo binario. Asegúrate de crear el bucket 'materials' en Supabase.]`;
            } else {
              const { data: { publicUrl } } = supabase.storage
                .from('materials')
                .getPublicUrl(filePath);

              // Save the URL as the content
              contentToSave = `[ARCHIVO_ADJUNTO]: ${publicUrl}`;
            }
          } catch (storageErr) {
            console.error("Storage error:", storageErr);
            contentToSave = `[Error al subir archivo: ${storageErr.message}]`;
          }
        }

        const fileData = {
          name: file.name,
          subject: selectedSubject,
          type: selectedMaterialType,
          content: contentToSave,
          date: new Date().toISOString()
        };

        // Save to Supabase and get ID
        const { data, error } = await supabase
          .from('materials')
          .insert({
            user_id: session.user.id,
            ...fileData
          })
          .select();

        console.log('Database insert result:', { data, error });

        if (error) throw error;
        if (data && data.length > 0) {
          newFiles.push(data[0]);
        }
      }

      console.log('All files processed. New files:', newFiles);
      setFiles(prev => [...prev, ...newFiles]);
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
      // Clear pending files after successful upload
      setPendingFiles([]);
    } catch (error) {
      console.error('Error uploading file', error);
      setErrorMessage('Error al subir archivo: ' + error.message);
      setSaveStatus('error');
    }
  };


  // OPENROUTER CONFIGURATION
  const OPENROUTER_API_KEY = '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';

  const callAI = async (prompt, retries = 3) => {
    // Modelos a probar en orden de preferencia
    const models = [
      'google/gemini-flash-1.5', // Rápido y bueno
      'meta-llama/llama-3-70b-instruct', // Muy potente
      'mistralai/mistral-7b-instruct:free' // Opción gratuita/barata de respaldo
    ];

    let content = '';
    if (typeof prompt === 'string') {
      content = prompt;
    } else if (Array.isArray(prompt)) {
      // OpenRouter espera un string simple para el contenido en mensajes tipo 'user'
      content = prompt.map(p => p.text).join('\n');
    }

    for (let i = 0; i < retries; i++) {
      // Intentar con cada modelo en la lista si el anterior falla
      for (const model of models) {
        try {
          console.log(`🤖 Intentando con modelo: ${model} (Intento ${i + 1})`);

          const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
              "HTTP-Referer": "http://localhost:3000",
              "X-Title": "EduAnalytics App",
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              "model": model,
              "messages": [
                { "role": "user", "content": content }
              ]
            })
          });

          if (!response.ok) {
            const errorData = await response.json();
            console.warn(`⚠️ Falló modelo ${model}:`, errorData);
            continue; // Probar siguiente modelo
          }

          const data = await response.json();
          if (data.choices && data.choices.length > 0) {
            return data.choices[0].message.content;
          }

        } catch (error) {
          console.warn(`❌ Error de red con modelo ${model}:`, error);
        }
      }

      // Si probamos todos los modelos y ninguno funcionó, esperamos un poco antes del siguiente reintento global
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    throw new Error("No se pudo obtener respuesta de ningún modelo de IA.");
  };

  // Mantener compatibilidad con componentes que esperan callGeminiAPI
  const callGeminiAPI = callAI;

  const analyzeContent = async () => {
    setLoading(true);
    setErrorMessage('');

    try {
      // 1. Gather content from SELECTED files only
      const selectedFiles = files.filter(f => selectedFileIds.includes(f.id));
      if (selectedFiles.length === 0) {
        throw new Error("Por favor, selecciona al menos un archivo para analizar.");
      }

      const combinedContent = selectedFiles.map(f => `--- Archivo: ${f.name} ---\n${f.content}`).join('\n\n');

      // 2. Construct Prompt
      const prompt = `
        Actúa como un profesor experto. Analiza el siguiente material de estudio para un estudiante de ${userProfile.level} (${userProfile.grade}).
        
        Perfil del estudiante:
        - Intereses: ${userProfile.interests}
        - Observaciones: ${userProfile.observations}

        Material:
        ${combinedContent.substring(0, 30000)} // Limit content to avoid token limits

        Genera un análisis en formato JSON con la siguiente estructura:
        {
          "totalPages": "estimado basado en longitud",
          "complexity": "Baja/Media/Alta",
          "keywords": ["palabra1", "palabra2", "palabra3", "palabra4", "palabra5"],
          "recommendations": ["recomendación 1", "recomendación 2", "recomendación 3"]
        }
        SOLO responde con el JSON válido, sin markdown.
      `;

      // 3. Call API
      const resultText = await callGeminiAPI(prompt);

      // 4. Parse JSON (handle potential markdown code blocks)
      const jsonString = resultText.replace(/```json/g, '').replace(/```/g, '').trim();
      const analysisResult = JSON.parse(jsonString);

      setAnalytics(analysisResult);
      setAnalytics(analysisResult);
      setActiveTab('feedback');

    } catch (error) {
      console.error("Error analyzing content:", error);
      setErrorMessage(`Error en el análisis: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const generatePractice = async (type) => {
    setLoading(true);
    setErrorMessage('');

    try {
      // 1. Gather content from SELECTED files only
      const selectedFiles = files.filter(f => selectedFileIds.includes(f.id));
      if (selectedFiles.length === 0) {
        throw new Error(`Por favor, selecciona al menos un archivo para generar el ${type === 'exam' ? 'examen' : 'trabajo'}.`);
      }

      const combinedContent = selectedFiles.map(f => `--- Archivo: ${f.name} ---\n${f.content}`).join('\n\n');

      // 2. Construct Prompt
      const prompt = `
        Actúa como un profesor experto. Crea un ${type === 'exam' ? 'Examen' : 'Trabajo Práctico'} para un estudiante de ${userProfile.level} (${userProfile.grade}).
        
        Perfil del estudiante:
        - Intereses: ${userProfile.interests} (Usa esto para hacer las preguntas más interesantes si es posible)
        - Observaciones: ${userProfile.observations}

        Material de base:
        ${combinedContent.substring(0, 30000)}

        Genera 5 preguntas en formato JSON con la siguiente estructura:
        {
          "title": "Título del Examen/Trabajo",
          "questions": [
            { "id": 1, "text": "Pregunta 1", "topic": "Tema relacionado", "type": "short_answer" },
            { "id": 2, "text": "Pregunta 2", "topic": "Tema relacionado", "type": "short_answer" }
          ]
        }
        SOLO responde con el JSON válido, sin markdown.
      `;

      // 3. Call API
      const resultText = await callGeminiAPI(prompt);

      // 4. Parse JSON
      const jsonString = resultText.replace(/```json/g, '').replace(/```/g, '').trim();
      const practiceData = JSON.parse(jsonString);

      setCurrentPractice({
        type,
        title: practiceData.title,
        questions: practiceData.questions
      });
      setPracticeMode(type);
      setUserAnswers({}); // Reset answers
      setCorrectionResult(null); // Reset previous correction

    } catch (error) {
      console.error("Error generating practice:", error);
      setErrorMessage(`Error al generar práctica: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCorrectPractice = async () => {
    setLoading(true);
    setErrorMessage('');

    try {
      // 1. Construct Prompt
      const questionsText = currentPractice.questions.map(q =>
        `Pregunta ${q.id} (${q.topic}): ${q.text}\nRespuesta del estudiante: ${userAnswers[q.id] || "Sin respuesta"}`
      ).join('\n\n');

      const prompt = `
        Actúa como un profesor experto. Corrige el siguiente examen/trabajo de un estudiante de ${userProfile.level} (${userProfile.grade}).
        
        Preguntas y Respuestas:
        ${questionsText}

        Genera un informe de corrección en formato JSON con la siguiente estructura EXACTA:
        {
          "score": 85, // Puntuación numérica 0-100
          "strengths": [
            { "subject": "Nombre del tema fuerte", "score": 90, "potential": 95 }
          ],
          "weaknesses": [
             "Área de mejora 1", "Área de mejora 2"
          ],
          "recommendations": [
            {
              "category": "Reforzar Conocimientos",
              "icon": "Target",
              "color": "text-blue-600",
              "bgColor": "bg-blue-50",
              "items": ["Recomendación específica 1", "Recomendación específica 2"]
            }
          ],
          "feedback_text": "Comentario general alentador para el estudiante..."
        }
        SOLO responde con el JSON válido, sin markdown.
      `;

      // 2. Call API
      const resultText = await callGeminiAPI(prompt);

      // 3. Parse JSON
      const jsonString = resultText.replace(/```json/g, '').replace(/```/g, '').trim();
      const correctionData = JSON.parse(jsonString);

      setCorrectionResult(correctionData);
      setActiveTab('feedback');

    } catch (error) {
      console.error("Error correcting practice:", error);
      setErrorMessage(`Error al corregir: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSavePractice = async () => {
    setLoading(true);
    try {
      const contentToSave = JSON.stringify({
        practice: currentPractice,
        answers: userAnswers,
        date: new Date().toISOString()
      });

      const fileName = `${currentPractice.type === 'exam' ? 'Examen' : 'Trabajo'}_${new Date().toLocaleDateString().replace(/\//g, '-')}.json`;

      const { error } = await supabase
        .from('materials')
        .insert({
          user_id: session.user.id,
          name: fileName,
          subject: selectedSubject, // Save under current subject
          type: 'saved_practice', // Special type
          content: contentToSave,
          date: new Date().toISOString()
        });

      if (error) throw error;

      alert('Progreso guardado correctamente. Podrás encontrarlo en la lista de archivos.');

    } catch (error) {
      console.error("Error saving practice:", error);
      setErrorMessage(`Error al guardar: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveBook = async (bookNameToSave) => {
    const name = bookNameToSave || bookName;
    if (!name.trim()) {
      setErrorMessage('Por favor, escribe el nombre del libro.');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('materials')
        .insert({
          user_id: session.user.id,
          name: `[LIBRO] ${name}`,
          subject: selectedSubject,
          type: 'Libro',
          content: `[REFERENCIA_LIBRO]: ${name}. Utiliza tu conocimiento general sobre este libro de texto escolar para generar contenido y analizar temas.`,
          date: new Date().toISOString()
        })
        .select();

      if (error) throw error;

      setBookName('');
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);

      // Refresh files list
      const { data: allFiles } = await supabase
        .from('materials')
        .select('*')
        .eq('user_id', session.user.id)
        .order('date', { ascending: false });
      if (allFiles) {
        setFiles(allFiles);
        // Update saved books list
        const books = allFiles.filter(f => f.type === 'Libro');
        setSavedBooks(books);
      }

    } catch (error) {
      console.error("Error saving book:", error);
      setErrorMessage(`Error al guardar libro: ${error.message}`);
      setSaveStatus('error');
    } finally {
      setLoading(false);
    }
  };

  if (!session) {
    if (showAuth) {
      return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
          <div className="sm:mx-auto sm:w-full sm:max-w-md">
            <button
              onClick={() => setShowAuth(false)}
              className="mb-4 text-indigo-600 hover:text-indigo-800 font-medium flex items-center"
            >
              ← Volver al inicio
            </button>
            <Auth initialEmail={authEmail} initialIsSignUp={authIsSignUp} />
          </div>
        </div>
      );
    } else {
      return <LandingPage onGetStarted={handleGetStarted} onLogin={handleLogin} />;
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Camera className="h-8 w-8 text-indigo-600" />
              <h1 className="ml-3 text-2xl font-bold text-gray-900">
                EduAnalytics
              </h1>
            </div>
            <nav className="flex space-x-8">
              {[
                { id: 'profile', name: 'Mi Perfil', icon: User },
                { id: 'upload', name: 'Subir Material', icon: Upload },
                { id: 'analyze', name: 'Analizar Asignatura', icon: Brain },
                { id: 'calendar', name: 'Mi Agenda', icon: CalendarIcon },
                { id: 'parent_dashboard', name: 'Vista Padres', icon: Users },
                { id: 'feedback', name: 'Feedback', icon: BarChart3 },
                { id: 'resources', name: 'Recursos', icon: BookOpen }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${activeTab === tab.id
                    ? 'text-indigo-600 bg-indigo-50'
                    : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                  <tab.icon className="h-4 w-4 mr-2" />
                  {tab.name}
                </button>
              ))}
              <button
                onClick={() => {
                  if (window.confirm("¿Estás seguro de que quieres cerrar sesión?")) {
                    supabase.auth.signOut();
                  }
                }}
                className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-red-600 hover:bg-red-50"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Status Bar */}
        {(saveStatus !== 'idle' || errorMessage) && (
          <div className={`mb-4 px-4 py-3 rounded relative ${errorMessage ? 'bg-red-100 border border-red-400 text-red-700' :
            saveStatus === 'success' ? 'bg-green-100 border border-green-400 text-green-700' :
              'bg-blue-100 border border-blue-400 text-blue-700'
            }`}>
            <span className="block sm:inline">
              {errorMessage ? errorMessage :
                saveStatus === 'saving' ? 'Guardando cambios...' :
                  '¡Cambios guardados correctamente!'}
            </span>
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="px-4 py-6 sm:px-0">
            <StudentProfile
              userProfile={userProfile}
              handleProfileChange={handleProfileChange}
              handleAvatarUpload={handleAvatarUpload}
              saveProfile={saveProfile}
              calculateAge={calculateAge}
              educationLevels={educationLevels}
            />
          </div>
        )}

        {/* Upload Tab */}
        {activeTab === 'upload' && (
          <div className="px-4 py-6 sm:px-0">
            <div className="flex gap-6">
              {/* Sidebar for Subjects */}
              <div className="w-1/4 bg-white rounded-lg shadow p-4">
                <h3 className="font-bold text-gray-900 mb-4">Asignaturas</h3>
                <div className="space-y-2">
                  {subjects.map(subject => (
                    <div key={subject} className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedSubject(subject)}
                        className={`flex-1 text-left px-3 py-2 rounded-md text-sm ${selectedSubject === subject
                          ? 'bg-indigo-50 text-indigo-700 font-medium'
                          : 'text-gray-600 hover:bg-gray-50'
                          }`}
                      >
                        {subject}
                      </button>
                      <button
                        onClick={() => handleDeleteSubject(subject)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                        title="Eliminar asignatura"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>

                {isAddingSubject ? (
                  <div className="mt-4">
                    <input
                      type="text"
                      value={newSubject}
                      onChange={(e) => setNewSubject(e.target.value)}
                      placeholder="Nueva asignatura"
                      className="w-full px-3 py-2 border rounded-md text-sm mb-2"
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleAddSubject}
                        className="flex-1 bg-indigo-600 text-white px-2 py-1 rounded text-xs"
                      >
                        Añadir
                      </button>
                      <button
                        onClick={() => setIsAddingSubject(false)}
                        className="flex-1 bg-gray-200 text-gray-700 px-2 py-1 rounded text-xs"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsAddingSubject(true)}
                    className="mt-4 w-full flex items-center justify-center px-3 py-2 border-2 border-dashed border-gray-300 rounded-md text-sm text-gray-500 hover:border-indigo-500 hover:text-indigo-600"
                  >
                    + Añadir Asignatura
                  </button>
                )}
              </div>

              {/* Upload Area */}
              <div className="flex-1">
                <div className="bg-white rounded-lg shadow p-6 mb-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-2">{selectedSubject}</h2>
                  <p className="text-gray-500 text-sm mb-6">Sube los materiales para esta asignatura</p>

                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tipo de Material
                    </label>
                    <div className="flex gap-4">
                      {materialTypes.map(type => (
                        <button
                          key={type}
                          onClick={() => setSelectedMaterialType(type)}
                          className={`px-4 py-2 rounded-md text-sm font-medium border ${selectedMaterialType === type
                            ? 'bg-indigo-600 text-white border-indigo-600'
                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                            }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>

                  {selectedMaterialType === 'Libro' ? (
                    <>
                      {/* Book Choice Modal */}
                      {showBookModal && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
                            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 relative">
                              <button
                                onClick={() => setShowBookModal(false)}
                                className="absolute top-4 right-4 text-white hover:text-gray-200"
                              >
                                <X className="h-6 w-6" />
                              </button>
                              <h2 className="text-2xl font-bold">📚 ¿Cómo quieres trabajar con libros?</h2>
                              <p className="text-indigo-100 mt-2">Elige una opción para continuar</p>
                            </div>

                            <div className="divide-y">
                              {/* Option 1: Upload File */}
                              <button
                                onClick={() => {
                                  setBookChoice('upload');
                                  setShowBookModal(false);
                                }}
                                className="w-full p-6 flex items-start gap-4 hover:bg-gray-50 transition-colors text-left"
                              >
                                <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                  <Upload className="h-6 w-6 text-blue-600" />
                                </div>
                                <div className="flex-1">
                                  <h3 className="font-semibold text-gray-900 mb-1">Subir Archivo</h3>
                                  <p className="text-sm text-gray-600">Sube tu libro en PDF, Word o imágenes para guardarlo en tu cuenta</p>
                                  <p className="text-xs text-gray-500 mt-1">Recomendado si tienes el archivo digital</p>
                                </div>
                              </button>

                              {/* Option 2: AI Lookup */}
                              <button
                                onClick={() => {
                                  setBookChoice('ai');
                                  setShowBookModal(false);
                                }}
                                className="w-full p-6 flex items-start gap-4 hover:bg-gray-50 transition-colors text-left"
                              >
                                <div className="flex-shrink-0 w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                  <Brain className="h-6 w-6 text-purple-600" />
                                </div>
                                <div className="flex-1">
                                  <h3 className="font-semibold text-gray-900 mb-1">Consulta con IA</h3>
                                  <p className="text-sm text-gray-600">Escribe el nombre del libro y haz preguntas sin subir archivos</p>
                                  <p className="text-xs text-gray-500 mt-1">Respetuoso con derechos de autor</p>
                                </div>
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Show appropriate interface based on choice */}
                      {bookChoice === null ? (
                        <div
                          onClick={() => setShowBookModal(true)}
                          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:bg-gray-50 transition-colors cursor-pointer"
                        >
                          <BookOpen className="mx-auto h-12 w-12 text-indigo-400" />
                          <h3 className="mt-4 text-lg font-medium text-gray-900">Trabajar con Libros</h3>
                          <p className="mt-2 text-sm text-gray-500">Haz clic para elegir cómo quieres añadir tu libro</p>
                        </div>
                      ) : bookChoice === 'upload' ? (
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:bg-gray-50 transition-colors">
                          <FileText className="mx-auto h-12 w-12 text-blue-400" />
                          <div className="mt-4">
                            <label className="cursor-pointer">
                              <span className="text-lg font-medium text-indigo-600 hover:text-indigo-500">
                                Seleccionar archivo del libro
                              </span>
                              <input
                                type="file"
                                className="hidden"
                                accept=".pdf,.doc,.docx,.odt,.jpg,.jpeg,.png"
                                onChange={handleFileUpload}
                              />
                            </label>
                            <p className="mt-1 text-sm text-gray-500">PDF, Word, Imágenes</p>
                            <button
                              onClick={() => setBookChoice(null)}
                              className="mt-4 text-sm text-gray-600 hover:text-gray-800"
                            >
                              ← Cambiar opción
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="border-2 border-indigo-300 rounded-lg p-8 bg-gradient-to-br from-indigo-50 to-purple-50">
                          <Brain className="mx-auto h-12 w-12 text-purple-600" />
                          <h3 className="mt-4 text-lg font-medium text-gray-900">Consulta de Libro con IA</h3>
                          <div className="mt-6 max-w-md mx-auto space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Nombre del Libro
                              </label>
                              <input
                                type="text"
                                value={aiBookName}
                                onChange={(e) => setAiBookName(e.target.value)}
                                placeholder="Ej. Lengua castellana Santillana 4º primaria"
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Tu pregunta o tema
                              </label>
                              <textarea
                                value={aiBookQuestion}
                                onChange={(e) => setAiBookQuestion(e.target.value)}
                                placeholder="Ej: ¿Cómo se hace un retrato de la familia?
Necesito ayuda con los problemas de fracciones..."
                                rows="3"
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                              />
                            </div>
                            <button
                              onClick={async () => {
                                if (!aiBookName.trim() || !aiBookQuestion.trim()) {
                                  setErrorMessage('Por favor, completa el nombre del libro y tu pregunta.');
                                  return;
                                }
                                setLoading(true);
                                setAiResponse(null);
                                try {
                                  // Primero, guardar el libro si no existe ya
                                  const bookExists = files.some(f =>
                                    f.type === 'Libro' &&
                                    f.name.includes(aiBookName) &&
                                    f.subject === selectedSubject
                                  );

                                  if (!bookExists) {
                                    await handleSaveBook(aiBookName);
                                  }

                                  const prompt = `Eres un profesor experto español. El estudiante tiene el libro "${aiBookName}" de ${selectedSubject} (curso: ${userProfile.grade || 'Primaria'}).
                                  
Pregunta del estudiante: ${aiBookQuestion}
                                  
Proporciona una respuesta educativa COMPLETA y DETALLADA basada en el contenido típico de este libro de texto. Incluye:
                                  1. Explicación clara del concepto con ejemplos específicos
                                  2. Ejercicios prácticos relacionados con la pregunta
                                  3. Consejos para estudiar este tema según el nivel del estudiante
                                  4. Referencia aproximada a qué unidad/tema del libro corresponde
                                  
Adapta la respuesta al nivel educativo del estudiante y hazla práctica y útil.`;

                                  const response = await callGeminiAPI(prompt);
                                  setAiResponse(response);

                                  // Guardar la consulta
                                  await supabase.from('materials').insert({
                                    user_id: session.user.id,
                                    name: `[CONSULTA AI] ${aiBookName}: ${aiBookQuestion.substring(0, 50)}...`,
                                    subject: selectedSubject,
                                    type: 'Libro',
                                    content: `Libro: ${aiBookName}\nPregunta: ${aiBookQuestion}\n\nRespuesta IA:\n${response}`,
                                    date: new Date().toISOString()
                                  });

                                  setAiBookQuestion('');
                                } catch (error) {
                                  setErrorMessage('Error al consultar la IA: ' + error.message);
                                } finally {
                                  setLoading(false);
                                }
                              }}
                              disabled={loading || !aiBookName.trim() || !aiBookQuestion.trim()}
                              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-3 rounded-md hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 font-medium flex items-center justify-center gap-2"
                            >
                              {loading ? (
                                <>
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                  Consultando IA...
                                </>
                              ) : (
                                <>
                                  <Brain className="h-5 w-5" />
                                  Obtener Ayuda de la IA
                                </>
                              )}
                            </button>

                            {/* AI Response Display */}
                            {aiResponse && (
                              <div className="mt-6 bg-white rounded-lg border-2 border-green-300 p-6">
                                <div className="flex items-center justify-between mb-4">
                                  <h4 className="font-semibold text-green-900 flex items-center gap-2">
                                    <CheckCircle className="h-5 w-5" />
                                    Respuesta de la IA
                                  </h4>
                                  <button
                                    onClick={() => setAiResponse(null)}
                                    className="text-gray-400 hover:text-gray-600"
                                  >
                                    <X className="h-5 w-5" />
                                  </button>
                                </div>
                                <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap">
                                  {aiResponse}
                                </div>
                                <div className="mt-4 pt-4 border-t flex gap-2">
                                  <button
                                    onClick={() => {
                                      const blob = new Blob([`Libro: ${aiBookName}\n\nPregunta: ${aiBookQuestion}\n\n${aiResponse}`], { type: 'text/plain' });
                                      const url = URL.createObjectURL(blob);
                                      const link = document.createElement('a');
                                      link.href = url;
                                      link.download = `Respuesta_${aiBookName.substring(0, 20)}.txt`;
                                      link.click();
                                      URL.revokeObjectURL(url);
                                    }}
                                    className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 flex items-center justify-center gap-2"
                                  >
                                    <Download className="h-4 w-4" />
                                    Descargar
                                  </button>
                                  <button
                                    onClick={() => setAiResponse(null)}
                                    className="flex-1 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-md hover:bg-indigo-200"
                                  >
                                    Nueva Consulta
                                  </button>
                                </div>
                              </div>
                            )}

                            <button
                              onClick={() => {
                                setBookChoice(null);
                                setAiResponse(null);
                              }}
                              className="w-full text-sm text-gray-600 hover:text-gray-800"
                            >
                              ← Cambiar opción
                            </button>
                          </div>
                        </div>
                      )}
                    </>
                  ) : selectedMaterialType !== 'Libro' ? (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:bg-gray-50 transition-colors">
                      <FileText className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="mt-4">
                        <label className="cursor-pointer">
                          <span className="text-lg font-medium text-indigo-600 hover:text-indigo-500">
                            Seleccionar archivos
                          </span>
                          <input
                            type="file"
                            className="hidden"
                            multiple
                            accept=".pdf,.doc,.docx,.txt,.md,.csv,.odt,.jpg,.jpeg,.png"
                            onChange={handleFileUpload}
                          />
                        </label>
                        <p className="mt-1 text-sm text-gray-500">
                          PDF, Word, Imágenes, Texto
                        </p>
                      </div>
                    </div>
                  ) : null}
                  {/* Save button appears when there are pending files */}
                  {pendingFiles.length > 0 && (
                    <button
                      onClick={() => handleFileUpload(pendingFiles)}
                      className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                    >
                      Guardar Archivos ({pendingFiles.length})
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* File List for Selected Subject */}
            {files.filter(f => f.subject === selectedSubject).length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-md font-medium text-gray-900 mb-4">
                  Archivos en {selectedSubject}
                </h3>
                <div className="space-y-4">
                  {materialTypes.map(type => {
                    const typeFiles = files.filter(f => f.subject === selectedSubject && f.type === type);
                    if (typeFiles.length === 0) return null;
                    return (
                      <div key={type}>
                        <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">{type}</h4>
                        <ul className="space-y-2">
                          {typeFiles.map((file) => (
                            <li key={file.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md group">
                              <div className="flex items-center flex-1">
                                <input
                                  type="checkbox"
                                  checked={selectedFileIds.includes(file.id)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setSelectedFileIds(prev => [...prev, file.id]);
                                    } else {
                                      setSelectedFileIds(prev => prev.filter(id => id !== file.id));
                                    }
                                  }}
                                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded mr-3"
                                />
                                <FileText className="h-5 w-5 text-gray-400 mr-3" />
                                <button
                                  onClick={() => {
                                    if (file.content.startsWith('[ARCHIVO_ADJUNTO]:')) {
                                      const url = file.content.replace('[ARCHIVO_ADJUNTO]:', '').trim();
                                      window.open(url, '_blank');
                                    } else {
                                      alert(`Contenido de ${file.name}:\n\n${file.content.substring(0, 500)}${file.content.length > 500 ? '...' : ''}`);
                                    }
                                  }}
                                  className="text-sm text-indigo-600 hover:text-indigo-800 hover:underline text-left"
                                >
                                  {file.name}
                                </button>
                                <span className="ml-2 text-xs text-gray-400">
                                  {file.content.startsWith('[ARCHIVO_ADJUNTO]:') ? '(Ver archivo)' : '(Ver contenido)'}
                                </span>
                              </div>
                              <button
                                onClick={() => handleDeleteMaterial(file.id, file.name)}
                                className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-all"
                                title="Eliminar archivo"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Analyze Tab - Worksheet Generator */}
        {
          activeTab === 'analyze' && (
            <WorksheetGenerator
              session={session}
              userProfile={userProfile}
              callGeminiAPI={callGeminiAPI}
              selectedFiles={files.filter(f => selectedFileIds.includes(f.id))}
              savedBooks={savedBooks}
              allFiles={files}
              initialTopic={initialTopic}
            />
          )
        }

        {/* Feedback Tab - Advanced Analytics Dashboard */}
        {
          activeTab === 'feedback' && (
            <FeedbackDashboard
              session={session}
              userProfile={userProfile}
              callGeminiAPI={callGeminiAPI}
            />
          )
        }

        {/* Resources Tab */}
        {
          activeTab === 'resources' && (
            <div className="px-4 py-6 sm:px-0">
              <ResourcesLibrary
                userProfile={userProfile}
                callGeminiAPI={callGeminiAPI}
                onGenerateWorksheet={handleGenerateWorksheetFromResource}
              />
            </div>
          )
        }

        {/* Calendar Tab */}
        {
          activeTab === 'calendar' && (
            <Calendar
              session={session}
              userProfile={userProfile}
            />
          )
        }

        {/* Parent Dashboard Tab */}
        {
          activeTab === 'parent_dashboard' && (
            <ParentDashboard
              session={session}
              userProfile={userProfile}
              callGeminiAPI={callGeminiAPI}
            />
          )
        }
      </main >
    </div >
  );
};

export default EduAnalyticsApp;
