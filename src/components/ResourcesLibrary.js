import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import {
    BookOpen, Video, FileText, Search, Sparkles,
    Download, ExternalLink, Star, Filter, Plus,
    Brain, Lightbulb, GraduationCap, Trash2, Save, Check, X
} from 'lucide-react';
import { Button, Card, CardHeader, CardContent, Spinner, Input, Badge, Alert } from './DesignSystem';
import { useRole } from '../contexts/RoleContext';
import { useAIFunctions } from '../contexts/AIFunctionContext';

// --- Components Helper ---

// 1. Simple Markdown Renderer
const SimpleMarkdown = ({ content }) => {
    if (!content) return null;

    // Split by lines to handle block elements
    const lines = content.split('\n');

    return (
        <div className="space-y-3 text-gray-700 leading-relaxed">
            {lines.map((line, index) => {
                // Headers
                if (line.startsWith('### ')) {
                    return <h3 key={index} className="text-lg font-bold text-indigo-800 mt-4 mb-2">{line.replace('### ', '')}</h3>;
                }
                if (line.startsWith('## ')) {
                    return <h2 key={index} className="text-xl font-bold text-indigo-900 mt-6 mb-3 border-b border-indigo-100 pb-2">{line.replace('## ', '')}</h2>;
                }
                if (line.startsWith('# ')) {
                    return <h1 key={index} className="text-2xl font-bold text-indigo-900 mt-6 mb-4">{line.replace('# ', '')}</h1>;
                }

                // List items
                if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
                    return (
                        <div key={index} className="flex items-start gap-2 ml-4">
                            <span className="text-indigo-500 mt-1.5">•</span>
                            <span dangerouslySetInnerHTML={{ __html: parseInlineStyles(line.replace(/^[-*]\s/, '')) }} />
                        </div>
                    );
                }

                // Numbered lists
                if (/^\d+\.\s/.test(line.trim())) {
                    return (
                        <div key={index} className="flex items-start gap-2 ml-4">
                            <span className="text-indigo-600 font-bold mt-0">{line.match(/^\d+\./)[0]}</span>
                            <span dangerouslySetInnerHTML={{ __html: parseInlineStyles(line.replace(/^\d+\.\s/, '')) }} />
                        </div>
                    );
                }

                // Empty lines
                if (line.trim() === '') {
                    return <div key={index} className="h-2"></div>;
                }

                // Paragraphs with inline styles
                return <p key={index} dangerouslySetInnerHTML={{ __html: parseInlineStyles(line) }} />;
            })}
        </div>
    );
};

// Helper to parse bold (**text**) and italic (*text*)
const parseInlineStyles = (text) => {
    let parsed = text;
    // Bold: **text**
    parsed = parsed.replace(/\*\*(.*?)\*\*/g, '<strong class="text-gray-900 font-bold">$1</strong>');
    // Italic: *text*
    parsed = parsed.replace(/\*(.*?)\*/g, '<em class="text-gray-600">$1</em>');
    // Highlight: `text`
    parsed = parsed.replace(/`(.*?)`/g, '<code class="bg-gray-100 px-1 py-0.5 rounded text-indigo-600 font-mono text-sm">$1</code>');
    return parsed;
};

// 2. Toast Notification Component
const Toast = ({ message, type, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 3000);
        return () => clearTimeout(timer);
    }, [onClose]);

    const bgColors = {
        success: 'bg-green-600',
        error: 'bg-red-600',
        info: 'bg-blue-600'
    };

    return (
        <div className={`fixed bottom-4 right-4 ${bgColors[type] || bgColors.info} text-white px-6 py-3 rounded-lg shadow-xl flex items-center gap-3 animate-fade-in-up z-50`}>
            {type === 'success' ? <Check className="h-5 w-5" /> :
                type === 'error' ? <X className="h-5 w-5" /> :
                    <Sparkles className="h-5 w-5" />}
            <span className="font-medium">{message}</span>
        </div>
    );
};

// --- Main Component ---

const ResourcesLibrary = ({ onGenerateWorksheet }) => {
    // Get data from contexts
    const { userProfile } = useRole();
    const { callGeminiAPI } = useAIFunctions();

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [aiResource, setAiResource] = useState(null);
    const [generatingResource, setGeneratingResource] = useState(false);

    // State for saved resources
    const [savedResources, setSavedResources] = useState([]);
    const [savingResource, setSavingResource] = useState(false);

    // Toast state
    const [toast, setToast] = useState(null); // { message, type }

    // NO STATIC RESOURCES - User wants clean library
    const staticResources = [];

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
    };

    // Load saved resources on mount
    useEffect(() => {
        loadSavedResources();
    }, []);

    const loadSavedResources = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data, error } = await supabase
                .from('saved_resources')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setSavedResources(data || []);
        } catch (error) {
            console.error('Error loading resources:', error);
        }
    };

    const saveResourceToDb = async (resource) => {
        setSavingResource(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                showToast("Debes iniciar sesión para guardar", "error");
                return;
            }

            const newResource = {
                user_id: user.id,
                title: resource.title,
                content: resource.content,
                type: 'guide',
                category: 'Personalizado',
                level: userProfile.level || 'General',
                tags: ['IA', 'Guía de Estudio'],
                created_at: new Date().toISOString()
            };

            const { data, error } = await supabase
                .from('saved_resources')
                .insert([newResource])
                .select();

            if (error) throw error;

            setSavedResources([data[0], ...savedResources]);
            setAiResource(null);
            showToast("¡Guía guardada en tu biblioteca!");
        } catch (error) {
            console.error('Error saving resource:', error);
            showToast('Error al guardar: ' + error.message, 'error');
        } finally {
            setSavingResource(false);
        }
    };

    const deleteResource = async (id) => {
        if (!window.confirm("¿Estás seguro de que quieres eliminar este recurso?")) return;

        try {
            const { error } = await supabase
                .from('saved_resources')
                .delete()
                .eq('id', id);

            if (error) throw error;

            setSavedResources(savedResources.filter(r => r.id !== id));
            showToast("Recurso eliminado");
        } catch (error) {
            console.error('Error deleting resource:', error);
            showToast('Error al eliminar', 'error');
        }
    };

    const downloadResource = (resource) => {
        const element = document.createElement("a");
        const file = new Blob([resource.content], { type: 'text/plain' });
        element.href = URL.createObjectURL(file);
        element.download = `${resource.title.replace(/\s+/g, '_')}.txt`;
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
        showToast("Descarga iniciada");
    };

    const handleOpenGuide = (resource) => {
        // Open the saved guide in preview mode (same as aiResource)
        setAiResource({
            title: resource.title,
            content: resource.content,
            date: new Date(resource.created_at).toLocaleDateString(),
            isSaved: true // Mark as already saved so we don't show save button
        });
        // Scroll to top to see the opened guide
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const generateAIStudyGuide = async () => {
        if (!searchQuery) return;

        setGeneratingResource(true);
        try {
            // Calculate age for better adaptation
            const calculateAge = (birthDate) => {
                if (!birthDate) return null;
                const today = new Date();
                const birth = new Date(birthDate);
                let age = today.getFullYear() - birth.getFullYear();
                const m = today.getMonth() - birth.getMonth();
                if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
                return age;
            };

            const studentAge = calculateAge(userProfile.birth_date);
            const ageInfo = studentAge ? `${studentAge} años` : 'edad no especificada';

            const prompt = `
Eres un PROFESOR EXPERTO DE ÉLITE especializado en didáctica personalizada. Tu misión es crear la MEJOR guía de estudio posible, adaptada con precisión milimétrica al estudiante.

📋 PERFIL DEL ESTUDIANTE:
- Nombre: ${userProfile.name || 'Estudiante'}
- Edad: ${ageInfo}
- Nivel educativo: ${userProfile.level || 'No especificado'}
- Curso: ${userProfile.grade || 'No especificado'}
- Intereses personales: ${userProfile.interests || 'No especificados'}
- Estilo de aprendizaje: ${userProfile.observations || 'No especificado'}

🎯 TEMA SOLICITADO: "${searchQuery}"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚡ INSTRUCCIONES CRÍTICAS - LEE ATENTAMENTE:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1️⃣ ADAPTACIÓN AL NIVEL (OBLIGATORIO):
   ${studentAge && studentAge < 10 ?
                    `- El estudiante tiene ${studentAge} años. Usa lenguaje MUY SIMPLE, frases cortas, muchos ejemplos visuales y analogías con cosas cotidianas (animales, juguetes, comida).
      - Evita tecnicismos. Usa emojis y ejemplos divertidos.
      - Explica como si hablaras con un niño pequeño.` :
                    studentAge && studentAge < 14 ?
                        `- El estudiante tiene ${studentAge} años (preadolescente). Usa lenguaje claro pero más técnico, ejemplos cercanos a su realidad (videojuegos, deportes, redes sociales).
      - Incluye datos curiosos que les fascinen.
      - Tono amigable y motivador, como un hermano mayor explicando.` :
                        studentAge && studentAge < 18 ?
                            `- El estudiante tiene ${studentAge} años (adolescente). Usa lenguaje académico pero accesible. Conecta con sus intereses actuales.
      - Incluye aplicaciones prácticas y relevancia en el mundo real.
      - Tono más serio pero sin perder la cercanía.` :
                            `- Adapta el lenguaje al nivel educativo (${userProfile.level || 'general'}). Usa vocabulario y conceptos apropiados.`
                }

2️⃣ CONEXIÓN CON INTERESES (FUNDAMENTAL):
   - Los intereses del estudiante son: "${userProfile.interests || 'No especificados'}"
   - DEBES conectar TODOS los ejemplos y analogías con estos intereses siempre que sea posible.
   ${userProfile.interests ?
                    `- Por ejemplo, si le gusta el fútbol, usa metáforas deportivas. Si le gusta Minecraft, usa construcción de bloques como analogía.`
                    : ''}

3️⃣ PROFUNDIDAD SIN LÍMITES:
   - NO te limites en longitud. Cuanto MÁS COMPLETA y RICA sea la guía, MEJOR.
   - Incluye TODO lo necesario para que el estudiante DOMINE el tema.
   - Prefiero una guía de 2000 palabras excelente que una de 200 mediocre.

4️⃣ ESTRUCTURA OBLIGATORIA (USA MARKDOWN CORRECTO):

# ${searchQuery}

## 🎯 ¿Qué vamos a aprender?
[Introducción motivadora y enganchadora de 2-3 párrafos que conecte con los intereses del estudiante]

## 📚 Conceptos Fundamentales
[Explicación clara y detallada de los conceptos clave. Usa **negritas** para términos importantes]

### Concepto 1: [Nombre]
[Explicación detallada con ejemplos]

### Concepto 2: [Nombre]
[Explicación detallada con ejemplos]

[...continúa con todos los conceptos necesarios]

## 💡 Ejemplos Prácticos
[Mínimo 3 ejemplos RESUELTOS PASO A PASO que el estudiante pueda seguir]

### Ejemplo 1: [Título descriptivo]
**Problema:** [Enunciado]
**Solución paso a paso:**
1. [Paso 1 explicado]
2. [Paso 2 explicado]
3. [Resultado final]

## 🔑 Puntos Clave para Recordar
- [Punto 1]
- [Punto 2]
- [Punto 3]
[...mínimo 7-10 puntos]

## 🌟 Trucos y Técnicas de Memoria
[Mnemotecnias, trucos, formas fáciles de recordar conceptos difíciles]

## 🎨 Analogías y Metáforas
[Conecta con los intereses del estudiante. Haz que el concepto sea memorable]

## 📝 Practica: Preguntas de Autoevaluación

### Nivel Básico:
1. [Pregunta fácil]
2. [Pregunta fácil]
3. [Pregunta fácil]

### Nivel Intermedio:
1. [Pregunta media]
2. [Pregunta media]
3. [Pregunta media]

### Nivel Avanzado (Desafío):
1. [Pregunta difícil]
2. [Pregunta difícil]

## 🚀 Ideas para Seguir Aprendiendo
- [Actividad práctica 1]
- [Actividad práctica 2]
- [Experimento o proyecto sugerido]
- [Recursos adicionales: videos, apps, juegos educativos]

## ❓ Errores Comunes y Cómo Evitarlos
1. **Error común 1:** [Explicación]
   - ✅ Cómo evitarlo: [Consejo]

2. **Error común 2:** [Explicación]
   - ✅ Cómo evitarlo: [Consejo]

## 🎯 Conexión con el Mundo Real
[Explica cómo se usa este conocimiento en la vida real, profesiones, tecnología actual, etc.]

---

## 📖 RESPUESTAS a las Preguntas de Autoevaluación

### Nivel Básico:
1. **Respuesta:** [Explicación completa]
2. **Respuesta:** [Explicación completa]
3. **Respuesta:** [Explicación completa]

### Nivel Intermedio:
1. **Respuesta:** [Explicación completa]
2. **Respuesta:** [Explicación completa]
3. **Respuesta:** [Explicación completa]

### Nivel Avanzado:
1. **Respuesta:** [Explicación completa con razonamiento]
2. **Respuesta:** [Explicación completa con razonamiento]

---

## 💪 Mensaje Final Motivador
[Un párrafo que anime al estudiante a seguir practicando y le de confianza]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚠️ FORMATO MARKDOWN:
- Usa # ## ### para títulos (SIEMPRE con espacio después del #)
- Usa **texto** para negritas
- Usa listas con - o números
- Usa \`código\` para términos técnicos
- NO uses HTML, solo Markdown puro

🎯 OBJETIVO: Crear una guía tan buena que el estudiante la quiera leer COMPLETA y la entienda PERFECTAMENTE.
🔥 PRIORIDAD MÁXIMA: Calidad > Brevedad. Prefiero 10 páginas excelentes que 1 página mediocre.

¡Comienza ahora!
            `;

            const response = await callGeminiAPI(prompt);
            setAiResource({
                title: `Guía de Estudio: ${searchQuery}`,
                content: response,
                date: new Date().toLocaleDateString()
            });
        } catch (error) {
            console.error("Error generating guide:", error);
            showToast("Error al generar la guía", "error");
        } finally {
            setGeneratingResource(false);
        }
    };

    // Combine static and saved resources
    const allResources = [
        ...savedResources.map(r => ({ ...r, isSaved: true })),
        ...staticResources
    ];

    const filteredResources = allResources.filter(resource => {
        const matchesSearch = resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (resource.description && resource.description.toLowerCase().includes(searchQuery.toLowerCase()));

        if (selectedCategory === 'all') return matchesSearch;
        if (selectedCategory === 'saved') return matchesSearch && resource.isSaved;
        return matchesSearch && resource.type === selectedCategory;
    });

    return (
        <div className="space-y-8 relative">
            {/* Toast Notification */}
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            {/* Header Section */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl p-8 text-white shadow-lg">
                <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                    <div>
                        <h2 className="text-3xl font-bold mb-2 flex items-center gap-3">
                            <BookOpen className="h-8 w-8" /> Biblioteca de Recursos
                        </h2>
                        <p className="text-blue-100 text-lg max-w-2xl">
                            Explora materiales educativos, genera guías de estudio con IA y guarda tus favoritos.
                        </p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg border border-white/20">
                        <div className="flex items-center gap-3 mb-2">
                            <Sparkles className="h-5 w-5 text-yellow-300" />
                            <span className="font-semibold">Asistente IA Activo</span>
                        </div>
                        <p className="text-sm text-blue-100">
                            {savedResources.length} guías guardadas en tu biblioteca.
                        </p>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="mt-8 relative max-w-3xl mx-auto">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                        <input
                            type="text"
                            placeholder="¿Qué quieres aprender hoy? (ej. Fotosíntesis, Fracciones...)"
                            className="w-full pl-12 pr-32 py-4 rounded-full text-gray-900 shadow-xl focus:ring-4 focus:ring-blue-400 focus:outline-none text-lg"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && generateAIStudyGuide()}
                        />
                        <button
                            onClick={generateAIStudyGuide}
                            disabled={!searchQuery || generatingResource}
                            className="absolute right-2 top-2 bottom-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 rounded-full font-medium transition-colors flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {generatingResource ? <Spinner className="h-4 w-4 text-white" /> : <Sparkles className="h-4 w-4" />}
                            Generar Guía
                        </button>
                    </div>
                </div>
            </div>

            {/* AI Generated Resource Result (Preview) */}
            {aiResource && (
                <div className="animate-fade-in">
                    <Card className="border-2 border-indigo-100 overflow-hidden shadow-xl ring-4 ring-indigo-50">
                        <div className="bg-indigo-50 p-4 border-b border-indigo-100 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="bg-indigo-100 p-2 rounded-full">
                                    <Brain className="h-6 w-6 text-indigo-600" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-indigo-900 text-lg">{aiResource.title}</h3>
                                    <p className="text-xs text-indigo-600">
                                        {aiResource.isSaved ? 'Guía Guardada' : 'Vista Previa • Generado por IA'}
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="secondary" size="sm" onClick={() => setAiResource(null)}>
                                    Cerrar
                                </Button>
                                {!aiResource.isSaved && (
                                    <Button
                                        variant="primary"
                                        size="sm"
                                        onClick={() => saveResourceToDb(aiResource)}
                                        disabled={savingResource}
                                    >
                                        {savingResource ? <Spinner /> : <Save className="h-4 w-4 mr-2" />}
                                        Guardar en Biblioteca
                                    </Button>
                                )}
                            </div>
                        </div>
                        <CardContent className="p-8 max-h-[600px] overflow-y-auto bg-white">
                            {/* Use SimpleMarkdown here */}
                            <SimpleMarkdown content={aiResource.content} />
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Categories & Filters */}
            <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                <button
                    onClick={() => setSelectedCategory('all')}
                    className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${selectedCategory === 'all' ? 'bg-gray-900 text-white shadow-md' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'}`}
                >
                    Todos
                </button>
                <button
                    onClick={() => setSelectedCategory('saved')}
                    className={`px-6 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${selectedCategory === 'saved' ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'}`}
                >
                    <Save className="h-4 w-4" /> Mis Guías ({savedResources.length})
                </button>
            </div>

            {/* Resources Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Create New Resource Card */}
                <div
                    onClick={() => document.querySelector('input[type="text"]').focus()}
                    className="border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50 transition-all group h-full min-h-[200px]"
                >
                    <div className="bg-indigo-100 p-4 rounded-full mb-4 group-hover:scale-110 transition-transform">
                        <Sparkles className="h-8 w-8 text-indigo-600" />
                    </div>
                    <h3 className="font-bold text-gray-900 mb-2">Crear Nuevo Recurso</h3>
                    <p className="text-sm text-gray-500">
                        Usa la IA para generar una guía de estudio sobre cualquier tema
                    </p>
                </div>

                {/* Resource Cards */}
                {filteredResources.map(resource => (
                    <Card key={resource.id} className="hover:shadow-lg transition-shadow duration-300 group flex flex-col h-full">
                        <CardContent className="p-6 flex flex-col h-full">
                            <div className="flex justify-between items-start mb-4">
                                <div className={`p-3 rounded-lg ${resource.type === 'video' ? 'bg-red-100 text-red-600' :
                                    resource.isSaved ? 'bg-indigo-100 text-indigo-600' :
                                        'bg-blue-100 text-blue-600'
                                    }`}>
                                    {resource.type === 'video' ? <Video className="h-6 w-6" /> :
                                        resource.isSaved ? <Brain className="h-6 w-6" /> :
                                            <BookOpen className="h-6 w-6" />}
                                </div>
                                <div className="flex gap-2">
                                    <Badge variant={
                                        resource.level === 'Primaria' ? 'success' :
                                            resource.level === 'Secundaria' ? 'warning' : 'default'
                                    }>
                                        {resource.level || 'General'}
                                    </Badge>
                                    {resource.isSaved && (
                                        <button
                                            onClick={(e) => { e.stopPropagation(); deleteResource(resource.id); }}
                                            className="text-gray-400 hover:text-red-500 transition-colors"
                                            title="Eliminar"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    )}
                                </div>
                            </div>

                            <h3 className="font-bold text-xl text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors line-clamp-2">
                                {resource.title}
                            </h3>

                            {/* Render preview of content using SimpleMarkdown for first few lines or description */}
                            <div className="text-gray-600 text-sm mb-4 flex-grow line-clamp-3">
                                {resource.description || (
                                    <div className="opacity-70">
                                        {resource.content ? resource.content.substring(0, 100) + '...' : 'Sin descripción'}
                                    </div>
                                )}
                            </div>

                            <div className="flex flex-wrap gap-2 mb-6">
                                {resource.tags && resource.tags.map(tag => (
                                    <span key={tag} className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                                        #{tag}
                                    </span>
                                ))}
                            </div>

                            <div className="flex gap-2 mt-auto pt-4 border-t border-gray-100">
                                {resource.isSaved ? (
                                    <>
                                        <Button
                                            variant="secondary"
                                            className="flex-1 text-sm"
                                            onClick={() => downloadResource(resource)}
                                        >
                                            <Download className="h-4 w-4 mr-2" /> Descargar
                                        </Button>
                                        <Button
                                            className="flex-1 text-sm bg-green-600 hover:bg-green-700 text-white"
                                            onClick={() => handleOpenGuide(resource)}
                                        >
                                            <BookOpen className="h-4 w-4 mr-2" /> Leer
                                        </Button>
                                    </>
                                ) : (
                                    <Button variant="secondary" className="w-full text-sm">
                                        <ExternalLink className="h-4 w-4 mr-2" /> Abrir Recurso
                                    </Button>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {filteredResources.length === 0 && (
                <div className="text-center py-12 bg-gray-50 rounded-xl">
                    <Search className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900">No se encontraron recursos</h3>
                    <p className="text-gray-500">Intenta con otra búsqueda o genera una guía nueva con IA.</p>
                </div>
            )}
        </div>
    );
};

export default ResourcesLibrary;
