/**
 * AIFunctionContext.js
 * 
 * Context para todas las funciones relacionadas con IA:
 * - callGeminiAPI
 * - analyzeContent
 * - generatePractice
 * - correctPractice
 * - handleFileUpload
 */

import React, { createContext, useContext, useState } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { supabase } from '../supabaseClient';
import { useRole } from './RoleContext';

const AIFunctionContext = createContext();

export const useAIFunctions = () => {
    const context = useContext(AIFunctionContext);
    if (!context) {
        throw new Error('useAIFunctions must be used within AIFunctionProvider');
    }
    return context;
};

export const AIFunctionProvider = ({ children }) => {
    const { session, userProfile } = useRole();
    const [apiKey, setApiKey] = useState(process.env.REACT_APP_DEFAULT_GEMINI_KEY || '');
    const [loading, setLoading] = useState(false);

    // Initialize API key from profile
    React.useEffect(() => {
        if (userProfile?.gemini_api_key) {
            setApiKey(userProfile.gemini_api_key);
        } else {
            setApiKey(process.env.REACT_APP_DEFAULT_GEMINI_KEY || '');
        }
    }, [userProfile]);

    /**
     * Call Gemini API
     */
    const callGeminiAPI = async (prompt, retries = 3) => {
        if (!apiKey) {
            throw new Error('API Key no configurada');
        }

        for (let attempt = 0; attempt < retries; attempt++) {
            try {
                const genAI = new GoogleGenerativeAI(apiKey);
                const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

                const result = await model.generateContent(prompt);
                const response = await result.response;
                return response.text();
            } catch (error) {
                console.error(`Attempt ${attempt + 1} failed:`, error);

                if (attempt === retries - 1) {
                    throw error;
                }

                // Wait before retry
                await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
            }
        }
    };

    /**
     * Analyze content from selected files
     */
    const analyzeContent = async (selectedFiles) => {
        setLoading(true);
        try {
            if (!selectedFiles || selectedFiles.length === 0) {
                throw new Error('Selecciona al menos un archivo para analizar');
            }

            const combinedContent = selectedFiles
                .map(f => `--- Archivo: ${f.name} ---\n${f.content}`)
                .join('\n\n');

            const prompt = `
Analiza el siguiente contenido educativo y proporciona un análisis detallado en JSON.

Contenido:
${combinedContent}

Responde con este formato JSON exacto:
{
  "resumen": "Resumen general del contenido",
  "temas_principales": ["tema1", "tema2", ...],
  "puntos_clave": ["punto1", "punto2", ...],
  "sugerencias": ["sugerencia1", "sugerencia2", ...],
  "nivel_dificultad": "Básico/Intermedio/Avanzado"
}
SOLO responde con el JSON, sin markdown.
            `;

            const resultText = await callGeminiAPI(prompt);
            const jsonString = resultText.replace(/```json/g, '').replace(/```/g, '').trim();
            const analysisResult = JSON.parse(jsonString);

            return analysisResult;
        } finally {
            setLoading(false);
        }
    };

    /**
     * Generate practice (exam or assignment)
     */
    const generatePractice = async (type, selectedFiles, userProfileData) => {
        setLoading(true);
        try {
            if (!selectedFiles || selectedFiles.length === 0) {
                throw new Error(`Selecciona archivos para generar el ${type === 'exam' ? 'examen' : 'trabajo'}`);
            }

            const combinedContent = selectedFiles
                .map(f => `--- ${f.name} ---\n${f.content}`)
                .join('\n\n');

            const prompt = `
Actúa como un profesor. Genera un ${type === 'exam' ? 'examen' : 'trabajo'} para un estudiante de ${userProfileData?.level || 'Primaria'} (${userProfileData?.grade || '4º curso'}).

Contenido del material:
${combinedContent}

Genera 5-7 preguntas variadas (test, desarrollo, verdadero/falso).

Responde con este JSON exacto:
{
  "title": "Título del ${type}",
  "questions": [
    {
      "id": 1,
      "text": "Texto de la pregunta",
      "type": "multiple_choice|open_ended|true_false",
      "topic": "Tema relacionado",
      "options": ["opción A", "opción B"] // Solo si es multiple_choice
    }
  ]
}
SOLO responde con JSON, sin markdown.
            `;

            const resultText = await callGeminiAPI(prompt);
            const jsonString = resultText.replace(/```json/g, '').replace(/```/g, '').trim();
            const practiceData = JSON.parse(jsonString);

            return {
                type,
                title: practiceData.title,
                questions: practiceData.questions
            };
        } finally {
            setLoading(false);
        }
    };

    /**
     * Correct practice answers
     */
    const correctPractice = async (practice, userAnswers, userProfileData) => {
        setLoading(true);
        try {
            const questionsText = practice.questions.map(q =>
                `Pregunta ${q.id} (${q.topic}): ${q.text}\nRespuesta del estudiante: ${userAnswers[q.id] || 'Sin respuesta'}`
            ).join('\n\n');

            const prompt = `
Actúa como profesor y corrige este ${practice.type === 'exam' ? 'examen' : 'trabajo'} de un estudiante de ${userProfileData?.level || 'Primaria'} (${userProfileData?.grade || '4º'}).

Preguntas y Respuestas:
${questionsText}

Responde con este JSON exacto:
{
  "score": 85,
  "feedback": "Feedback general",
  "strengths": ["fortaleza1", "fortaleza2"],
  "errors": ["error1", "error2"],
  "suggestions": ["sugerencia1", "sugerencia2"]
}
SOLO responde con JSON, sin markdown.
            `;

            const resultText = await callGeminiAPI(prompt);
            const jsonString = resultText.replace(/```json/g, '').replace(/```/g, '').trim();
            const correctionData = JSON.parse(jsonString);

            return correctionData;
        } finally {
            setLoading(false);
        }
    };

    /**
     * Handle file upload and text extraction
     */
    const handleFileUpload = async (filesToUpload, userId, subject, materialType) => {
        setLoading(true);
        try {
            let selectedFiles = [];
            if (filesToUpload?.target?.files) {
                selectedFiles = Array.from(filesToUpload.target.files);
            } else if (Array.isArray(filesToUpload)) {
                selectedFiles = filesToUpload;
            }

            const newFiles = [];

            for (const file of selectedFiles) {
                // Upload to Supabase Storage
                const fileExt = file.name.split('.').pop();
                const fileName = `${Math.random()}.${fileExt}`;
                const filePath = `${userId}/${fileName}`;

                let { error: uploadError } = await supabase.storage
                    .from('MATERIALES')
                    .upload(filePath, file);

                if (uploadError) throw uploadError;

                // Get public URL
                const { data: urlData } = supabase.storage
                    .from('MATERIALES')
                    .getPublicUrl(filePath);

                // Extract text (simplified - in production use proper OCR/PDF parser)
                const content = await extractTextFromFile(file);

                // Save to database
                const { data, error } = await supabase
                    .from('materials')
                    .insert({
                        user_id: userId,
                        name: file.name,
                        subject: subject,
                        type: materialType,
                        content: content,
                        file_url: urlData.publicUrl,
                        date: new Date().toISOString()
                    })
                    .select()
                    .single();

                if (error) throw error;
                if (data) newFiles.push(data);
            }

            return newFiles;
        } finally {
            setLoading(false);
        }
    };

    /**
     * Extract text from file (simplified)
     */
    const extractTextFromFile = async (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const text = e.target.result;
                resolve(text.substring(0, 10000)); // Limit to 10k chars
            };
            reader.onerror = () => reject('Error reading file');
            reader.readAsText(file);
        });
    };

    const value = {
        apiKey,
        setApiKey,
        loading,
        callGeminiAPI,
        analyzeContent,
        generatePractice,
        correctPractice,
        handleFileUpload
    };

    return (
        <AIFunctionContext.Provider value={value}>
            {children}
        </AIFunctionContext.Provider>
    );
};

export default AIFunctionContext;
