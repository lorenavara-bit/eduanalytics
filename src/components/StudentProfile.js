import React, { useState } from 'react';
import {
    User, Camera, Calendar, BookOpen, Star,
    Trophy, Flame, Target, Save, MapPin, Brain,
    Heart, Zap, Award, TrendingUp, Clock, Sun,
    Moon, Coffee, Sparkles, CheckCircle2, AlertCircle,
    Smile, Frown, Meh, ThumbsUp, ThumbsDown
} from 'lucide-react';
import { Card, CardContent, Button, Badge, Alert } from './DesignSystem';
import { useStudentData } from '../contexts/StudentDataContext';
import { useRole } from '../contexts/RoleContext';
import { useUI } from '../contexts/UIContext';
import { supabase } from '../supabaseClient';

const StudentProfile = () => {
    // Get data from contexts
    const { userProfile, setUserProfile } = useStudentData();
    const { session } = useRole();
    const { startSaving, completeSaving, failSaving } = useUI();

    const [activeSection, setActiveSection] = useState('personal');

    // Education levels
    const educationLevels = {
        'Infantil': ['3 años', '4 años', '5 años'],
        'Primaria': ['1º Primaria', '2º Primaria', '3º Primaria', '4º Primaria', '5º Primaria', '6º Primaria'],
        'ESO': ['1º ESO', '2º ESO', '3º ESO', '4º ESO'],
        'Bachillerato': ['1º Bachillerato', '2º Bachillerato']
    };

    // Handle profile change
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

    // Calculate age
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

    // Link Parent State
    const [linkCode, setLinkCode] = useState(null);
    const [generatingCode, setGeneratingCode] = useState(false);

    // Save profile
    const saveProfile = async () => {
        startSaving();
        try {
            const { error } = await supabase
                .from('profiles')
                .upsert({
                    id: session.user.id,
                    ...userProfile,
                    updated_at: new Date()
                });
            if (error) throw error;
            completeSaving();
        } catch (error) {
            failSaving(error.message);
        }
    };

    // Generate link code for parent
    const handleGenerateLinkCode = async () => {
        setGeneratingCode(true);
        try {
            // Generate random code
            const code = Math.random().toString(36).substring(2, 8).toUpperCase();
            const expiresAt = new Date();
            expiresAt.setHours(expiresAt.getHours() + 48); // 48h validity

            // Insert into invitation_codes
            // Note: child_user_id is REQUIRED by schema, so this fits perfectly
            const { data, error } = await supabase
                .from('invitation_codes')
                .insert({
                    code,
                    child_user_id: session.user.id, // I AM THE CHILD
                    created_by: session.user.id,    // I CREATED IT
                    expires_at: expiresAt.toISOString()
                    // No 'role' column in schema
                })
                .select()
                .single();

            if (error) throw error;
            setLinkCode(data.code);
            alert('¡Código generado! Dáselo a tu padre/madre.');
        } catch (error) {
            console.error('Error generation:', error);
            alert('Error al generar código: ' + error.message);
        } finally {
            setGeneratingCode(false);
        }
    };



    // Handle avatar upload
    const handleAvatarUpload = async (event) => {
        try {
            startSaving();
            if (!event.target.files || event.target.files.length === 0) {
                throw new Error('Selecciona una imagen');
            }

            const file = event.target.files[0];
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random()}.${fileExt}`;
            const filePath = `${session.user.id}/${fileName}`;

            let { error: uploadError } = await supabase.storage
                .from('AVATARS')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: urlData } = supabase.storage
                .from('AVATARS')
                .getPublicUrl(filePath);

            const updatedProfile = { ...userProfile, avatar_url: urlData.publicUrl };
            setUserProfile(updatedProfile);

            const { error: updateError } = await supabase
                .from('profiles')
                .upsert({
                    id: session.user.id,
                    ...updatedProfile,
                    updated_at: new Date()
                });

            if (updateError) throw updateError;
            completeSaving();
        } catch (error) {
            failSaving(error.message);
        }
    };

    // Enhanced stats with more gamification
    const stats = [
        { label: 'Racha', value: userProfile.practice_streak || 0, icon: Flame, color: 'text-orange-500', bg: 'bg-orange-100', unit: 'días' },
        { label: 'XP Total', value: userProfile.total_xp || 0, icon: Zap, color: 'text-yellow-500', bg: 'bg-yellow-100', unit: 'pts' },
        { label: 'Nivel', value: userProfile.current_level || 1, icon: Trophy, color: 'text-purple-500', bg: 'bg-purple-100', unit: '' },
        { label: 'Edad', value: calculateAge(userProfile.birth_date) || '-', icon: Calendar, color: 'text-blue-500', bg: 'bg-blue-100', unit: 'años' },
    ];

    // Sections for navigation
    const sections = [
        { id: 'personal', label: '👤 Personal', icon: User },
        { id: 'family', label: '👨‍👩‍👧 Familia', icon: Heart },
        { id: 'learning', label: '🧠 Aprendizaje', icon: Brain },
        { id: 'preferences', label: '⚙️ Preferencias', icon: Target },
        { id: 'achievements', label: '🏆 Logros', icon: Trophy },
    ];

    // Learning style options
    const learningStyles = [
        { value: 'visual', label: 'Visual 👁️', emoji: '📊', description: 'Aprendes mejor con imágenes y diagramas' },
        { value: 'auditivo', label: 'Auditivo 👂', emoji: '🎧', description: 'Prefieres escuchar explicaciones' },
        { value: 'kinestesico', label: 'Kinestésico ✋', emoji: '🏃', description: 'Aprendes haciendo y practicando' },
        { value: 'lectoescritor', label: 'Lectoescritor 📝', emoji: '📖', description: 'Te gusta leer y escribir' },
    ];

    // Best time to study
    const studyTimes = [
        { value: 'manana', label: 'Mañana', emoji: '🌅', icon: Sun },
        { value: 'tarde', label: 'Tarde', emoji: '🌤️', icon: Coffee },
        { value: 'noche', label: 'Noche', emoji: '🌙', icon: Moon },
    ];

    // Mood tracker for learning
    const moods = [
        { value: 'motivado', emoji: '😄', icon: Smile, color: 'text-green-500' },
        { value: 'neutral', emoji: '😐', icon: Meh, color: 'text-yellow-500' },
        { value: 'frustrado', emoji: '😞', icon: Frown, color: 'text-red-500' },
    ];

    return (
        <div className="max-w-6xl mx-auto space-y-6 p-4 animate-fade-in">

            {/* Hero Section with Enhanced Gradient */}
            <div className="relative rounded-3xl overflow-hidden bg-white shadow-2xl">
                {/* Animated Background Banner */}
                <div className="h-56 bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-600 relative overflow-hidden">
                    {/* Animated sparkles overlay */}
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMTAiIGN5PSIxMCIgcj0iMSIgZmlsbD0id2hpdGUiIG9wYWNpdHk9IjAuMyIvPjwvc3ZnPg==')] opacity-40"></div>
                </div>

                <div className="px-6 pb-8">
                    <div className="relative flex flex-col md:flex-row items-end -mt-16 mb-6 gap-4">
                        {/* Enhanced Avatar with Level Ring */}
                        <div className="relative group">
                            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur-lg opacity-50 group-hover:opacity-75 transition-opacity"></div>
                            <div className="relative w-32 h-32 rounded-full border-4 border-white shadow-2xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                                {userProfile.avatar_url ? (
                                    <img
                                        src={userProfile.avatar_url}
                                        alt="Avatar"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <User className="h-16 w-16 text-gray-400" />
                                )}
                            </div>
                            {/* Level badge on avatar */}
                            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg border-2 border-white">
                                Nvl. {userProfile.current_level || 1}
                            </div>
                            <label className="absolute top-0 right-0 bg-gradient-to-r from-purple-600 to-pink-600 text-white p-2 rounded-full cursor-pointer hover:from-purple-700 hover:to-pink-700 shadow-lg transition-all hover:scale-110">
                                <Camera className="h-4 w-4" />
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleAvatarUpload}
                                    className="hidden"
                                />
                            </label>
                        </div>

                        {/* Name & Status */}
                        <div className="flex-1 text-center md:text-left">
                            <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                                <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-purple-900 to-pink-900 bg-clip-text text-transparent">
                                    {userProfile.name || '¡Elige tu nombre!'}
                                </h1>
                                {userProfile.current_level >= 5 && (
                                    <Sparkles className="h-6 w-6 text-yellow-500 animate-pulse" />
                                )}
                            </div>
                            <div className="flex items-center justify-center md:justify-start gap-2 text-gray-600 flex-wrap">
                                <MapPin className="h-4 w-4" />
                                <span>{userProfile.grade || 'Curso no definido'}</span>
                                <span className="mx-1">•</span>
                                <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                                <span className="font-medium text-yellow-600">
                                    {userProfile.total_worksheets_completed || 0} fichas completadas
                                </span>
                            </div>
                            {/* XP Progress Bar */}
                            <div className="mt-3 max-w-md">
                                <div className="flex justify-between text-xs mb-1">
                                    <span className="text-gray-600">Progreso al Nivel {(userProfile.current_level || 1) + 1}</span>
                                    <span className="font-semibold text-purple-600">{userProfile.total_xp || 0} / {((userProfile.current_level || 1) * 100)} XP</span>
                                </div>
                                <div className="h-3 bg-gray-200 rounded-full overflow-hidden shadow-inner">
                                    <div
                                        className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 rounded-full transition-all duration-500 shadow-lg"
                                        style={{ width: `${Math.min(((userProfile.total_xp || 0) / ((userProfile.current_level || 1) * 100)) * 100, 100)}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>

                        {/* Save Button */}
                        <Button
                            onClick={saveProfile}
                            className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-xl transform hover:-translate-y-1 transition-all px-6 py-3 rounded-2xl font-bold"
                        >
                            <Save className="h-5 w-5 mr-2" />
                            Guardar Perfil
                        </Button>
                    </div>

                    {/* Enhanced Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {stats.map((stat, index) => (
                            <div
                                key={index}
                                className="bg-gradient-to-br from-white to-gray-50 p-5 rounded-2xl border-2 border-gray-100 hover:border-purple-300 hover:shadow-xl transition-all transform hover:-translate-y-1 cursor-pointer group"
                            >
                                <div className="flex flex-col items-center text-center">
                                    <div className={`p-3 rounded-xl ${stat.bg} group-hover:scale-110 transition-transform mb-2`}>
                                        <stat.icon className={`h-6 w-6 ${stat.color}`} />
                                    </div>
                                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">{stat.label}</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {stat.value}
                                        {stat.unit && <span className="text-sm text-gray-500 ml-1">{stat.unit}</span>}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Section Navigation */}
            <div className="bg-white rounded-2xl shadow-lg p-2">
                <div className="flex gap-2 overflow-x-auto">
                    {sections.map((section) => (
                        <button
                            key={section.id}
                            onClick={() => setActiveSection(section.id)}
                            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all whitespace-nowrap ${activeSection === section.id
                                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg scale-105'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            <section.icon className="h-5 w-5" />
                            {section.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content Sections */}
            <div className="grid grid-cols-1 gap-6">

                {/* PERSONAL INFO SECTION */}
                {activeSection === 'personal' && (
                    <Card className="shadow-xl border-2 border-purple-100 animate-fade-in">
                        <div className="p-6 bg-gradient-to-r from-purple-50 to-pink-50 border-b border-purple-100">
                            <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                <User className="h-6 w-6 text-purple-600" />
                                Datos Personales
                            </h3>
                            <p className="text-sm text-gray-600 mt-1">Información básica sobre ti</p>
                        </div>
                        <CardContent className="p-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                                        <Sparkles className="h-4 w-4 text-purple-500" />
                                        Nombre Completo
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={userProfile.name || ''}
                                        onChange={handleProfileChange}
                                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all bg-white font-medium"
                                        placeholder="Ej. Ana García"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                                        <Calendar className="h-4 w-4 text-blue-500" />
                                        Fecha de Nacimiento
                                    </label>
                                    <input
                                        type="date"
                                        name="birth_date"
                                        value={userProfile.birth_date || ''}
                                        onChange={handleProfileChange}
                                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all bg-white"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                                        <BookOpen className="h-4 w-4 text-green-500" />
                                        Nivel Educativo
                                    </label>
                                    <select
                                        name="level"
                                        value={userProfile.level || ''}
                                        onChange={handleProfileChange}
                                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all bg-white font-medium"
                                    >
                                        <option value="">Seleccionar nivel...</option>
                                        {Object.keys(educationLevels).map(level => (
                                            <option key={level} value={level}>{level}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                                        <Trophy className="h-4 w-4 text-orange-500" />
                                        Curso / Grado
                                    </label>
                                    <select
                                        name="grade"
                                        value={userProfile.grade || ''}
                                        onChange={handleProfileChange}
                                        disabled={!userProfile.level}
                                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all bg-white disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                                    >
                                        <option value="">
                                            {userProfile.level ? 'Seleccionar curso...' : 'Elige nivel primero'}
                                        </option>
                                        {userProfile.level && educationLevels[userProfile.level].map(grade => (
                                            <option key={grade} value={grade}>{grade}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* LEARNING SECTION - NEW! */}
                {activeSection === 'learning' && (
                    <div className="space-y-6 animate-fade-in">
                        <Card className="shadow-xl border-2 border-blue-100">
                            <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
                                <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                    <Brain className="h-6 w-6 text-blue-600" />
                                    Perfil de Aprendizaje IA
                                </h3>
                                <p className="text-sm text-gray-600 mt-1">La IA usa esto para personalizar todo</p>
                            </div>
                            <CardContent className="p-6 space-y-6">
                                {/* Learning Style */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-3">
                                        ¿Cómo aprendes mejor? 🎯
                                    </label>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {learningStyles.map((style) => (
                                            <button
                                                key={style.value}
                                                type="button"
                                                onClick={() => handleProfileChange({ target: { name: 'learning_style', value: style.value } })}
                                                className={`p-4 rounded-xl border-2 transition-all text-left ${userProfile.learning_style === style.value
                                                    ? 'border-blue-500 bg-blue-50 shadow-md scale-105'
                                                    : 'border-gray-200 hover:border-blue-300 hover:shadow-sm'
                                                    }`}
                                            >
                                                <div className="text-3xl mb-2">{style.emoji}</div>
                                                <div className="font-bold text-gray-900">{style.label}</div>
                                                <div className="text-xs text-gray-600 mt-1">{style.description}</div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Subjects - Favorite & Difficult */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                                            <Heart className="h-4 w-4 text-pink-500" />
                                            Asignaturas Favoritas
                                        </label>
                                        <input
                                            type="text"
                                            name="favorite_subjects"
                                            value={userProfile.favorite_subjects || ''}
                                            onChange={handleProfileChange}
                                            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-pink-500 focus:ring-4 focus:ring-pink-100 transition-all bg-white"
                                            placeholder="Ej. Matemáticas, Ciencias"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                                            <AlertCircle className="h-4 w-4 text-orange-500" />
                                            Asignaturas Difíciles
                                        </label>
                                        <input
                                            type="text"
                                            name="difficult_subjects"
                                            value={userProfile.difficult_subjects || ''}
                                            onChange={handleProfileChange}
                                            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-100 transition-all bg-white"
                                            placeholder="Ej. Lengua, Historia"
                                        />
                                    </div>
                                </div>

                                {/* Strengths & Weaknesses */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                                            <ThumbsUp className="h-4 w-4 text-green-500" />
                                            Mis Fortalezas
                                        </label>
                                        <textarea
                                            name="strengths"
                                            value={userProfile.strengths || ''}
                                            onChange={handleProfileChange}
                                            rows="4"
                                            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all bg-white resize-none"
                                            placeholder="Ej. Soy bueno en cálculo mental, memorizo rápido..."
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                                            <ThumbsDown className="h-4 w-4 text-red-500" />
                                            Áreas a Mejorar
                                        </label>
                                        <textarea
                                            name="weaknesses"
                                            value={userProfile.weaknesses || ''}
                                            onChange={handleProfileChange}
                                            rows="4"
                                            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-red-500 focus:ring-4 focus:ring-red-100 transition-all bg-white resize-none"
                                            placeholder="Ej. Me cuesta concentrarme, necesito repasar ortografía..."
                                        />
                                    </div>
                                </div>

                                {/* Learning Goals */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                                        <Target className="h-4 w-4 text-purple-500" />
                                        Mis Objetivos de Aprendizaje
                                    </label>
                                    <textarea
                                        name="learning_goals"
                                        value={userProfile.learning_goals || ''}
                                        onChange={handleProfileChange}
                                        rows="3"
                                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all bg-white resize-none"
                                        placeholder="Ej. Quiero sacar buenas notas, prepararme para el examen, aprender más sobre..."
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* PREFERENCES SECTION - NEW! */}
                {activeSection === 'preferences' && (
                    <div className="space-y-6 animate-fade-in">
                        <Card className="shadow-xl border-2 border-indigo-100">
                            <div className="p-6 bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-indigo-100">
                                <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                    <Target className="h-6 w-6 text-indigo-600" />
                                    Preferencias y Hábitos
                                </h3>
                                <p className="text-sm text-gray-600 mt-1">Personaliza tu experiencia</p>
                            </div>
                            <CardContent className="p-6 space-y-6">
                                {/* Best Study Time */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-3">
                                        ¿Cuándo estudias mejor? ⏰
                                    </label>
                                    <div className="grid grid-cols-3 gap-4">
                                        {studyTimes.map((time) => (
                                            <button
                                                key={time.value}
                                                type="button"
                                                onClick={() => handleProfileChange({ target: { name: 'best_study_time', value: time.value } })}
                                                className={`p-6 rounded-2xl border-2 transition-all ${userProfile.best_study_time === time.value
                                                    ? 'border-indigo-500 bg-indigo-50 shadow-lg scale-105'
                                                    : 'border-gray-200 hover:border-indigo-300 hover:shadow'
                                                    }`}
                                            >
                                                <time.icon className="h-10 w-10 mx-auto mb-2 text-indigo-600" />
                                                <div className="text-2xl mb-1">{time.emoji}</div>
                                                <div className="font-bold text-gray-900">{time.label}</div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Interests & Hobbies */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                                        <Heart className="h-4 w-4 text-pink-500" />
                                        Intereses y Hobbies
                                        <Badge variant="gradient" className="text-xs">Usado por IA</Badge>
                                    </label>
                                    <textarea
                                        name="interests"
                                        value={userProfile.interests || ''}
                                        onChange={handleProfileChange}
                                        rows="4"
                                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-pink-500 focus:ring-4 focus:ring-pink-100 transition-all bg-white resize-none"
                                        placeholder="Ej. Fútbol, videojuegos (Minecraft, Fortnite), dinosaurios, TikTok, bailar, dibujar..."
                                    />
                                    <p className="text-xs text-gray-500 mt-2">💡 La IA usará esto para crear ejercicios más interesantes para ti</p>
                                </div>

                                {/* Study Session Length */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                                        <Clock className="h-4 w-4 text-blue-500" />
                                        Tiempo de estudio preferido (minutos)
                                    </label>
                                    <input
                                        type="range"
                                        name="preferred_session_length"
                                        min="15"
                                        max="120"
                                        step="15"
                                        value={userProfile.preferred_session_length || 30}
                                        onChange={handleProfileChange}
                                        className="w-full"
                                    />
                                    <div className="flex justify-between text-sm text-gray-600 mt-1">
                                        <span>15 min</span>
                                        <span className="font-bold text-blue-600">{userProfile.preferred_session_length || 30} min</span>
                                        <span>120 min</span>
                                    </div>
                                </div>

                                {/* Observations */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                                        <Brain className="h-4 w-4 text-purple-500" />
                                        Observaciones del Profesor / Notas
                                        <Badge variant="gradient" className="text-xs">Muy importante para IA</Badge>
                                    </label>
                                    <textarea
                                        name="observations"
                                        value={userProfile.observations || ''}
                                        onChange={handleProfileChange}
                                        rows="5"
                                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all bg-white resize-none"
                                        placeholder="Ej. Confunde las tablas del 7 y 8, necesita repasar ortografía de la b/v, le cuesta concentrarse más de 20 minutos..."
                                    />
                                    <p className="text-xs text-gray-500 mt-2">✨ Cuanto más específico, mejor personalizará la IA</p>
                                </div>

                                {/* Current Mood */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-3">
                                        ¿Cómo te sientes hoy con el estudio? 😊
                                    </label>
                                    <div className="flex gap-4 justify-center">
                                        {moods.map((mood) => (
                                            <button
                                                key={mood.value}
                                                type="button"
                                                onClick={() => handleProfileChange({ target: { name: 'current_mood', value: mood.value } })}
                                                className={`p-6 rounded-2xl border-2 transition-all ${userProfile.current_mood === mood.value
                                                    ? 'border-indigo-500 bg-indigo-50 shadow-lg scale-110'
                                                    : 'border-gray-200 hover:border-gray-300 hover:shadow'
                                                    }`}
                                            >
                                                <mood.icon className={`h-12 w-12 ${mood.color}`} />
                                                <div className="text-3xl mt-2">{mood.emoji}</div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* ACHIEVEMENTS SECTION */}
                {activeSection === 'achievements' && (
                    <Card className="shadow-xl border-2 border-yellow-100 bg-gradient-to-br from-yellow-50 to-white animate-fade-in">
                        <div className="p-6 bg-gradient-to-r from-yellow-50 to-orange-50 border-b border-yellow-100">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                        <Trophy className="h-7 w-7 text-yellow-600" />
                                        Sala de Trofeos
                                    </h3>
                                    <p className="text-sm text-gray-600 mt-1">Logros desbloqueados: {userProfile.achievements?.length || 3}/12</p>
                                </div>
                                <div className="text-right">
                                    <div className="text-4xl font-bold text-yellow-600">{userProfile.total_xp || 0}</div>
                                    <div className="text-xs text-gray-500">XP Total</div>
                                </div>
                            </div>
                        </div>
                        <CardContent className="p-8">
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                {/* Achievement 1 - Unlocked */}
                                <div className="flex flex-col items-center text-center group cursor-pointer">
                                    <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-orange-100 to-red-100 flex items-center justify-center mb-3 border-4 border-orange-300 shadow-lg group-hover:scale-110 transition-transform">
                                        <Flame className="h-12 w-12 text-orange-500" />
                                        <div className="absolute -top-1 -right-1 bg-green-500 text-white rounded-full p-1">
                                            <CheckCircle2 className="h-4 w-4" />
                                        </div>
                                    </div>
                                    <h4 className="font-bold text-gray-900 text-sm">🔥 Racha Iniciada</h4>
                                    <p className="text-xs text-gray-500">3 días seguidos</p>
                                    <Badge variant="success" className="mt-2 text-xs">+50 XP</Badge>
                                </div>

                                {/* Achievement 2 - Unlocked */}
                                <div className="flex flex-col items-center text-center group cursor-pointer">
                                    <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center mb-3 border-4 border-blue-300 shadow-lg group-hover:scale-110 transition-transform">
                                        <BookOpen className="h-12 w-12 text-blue-500" />
                                        <div className="absolute -top-1 -right-1 bg-green-500 text-white rounded-full p-1">
                                            <CheckCircle2 className="h-4 w-4" />
                                        </div>
                                    </div>
                                    <h4 className="font-bold text-gray-900 text-sm">📚 Primera Ficha</h4>
                                    <p className="text-xs text-gray-500">Completada</p>
                                    <Badge variant="success" className="mt-2 text-xs">+25 XP</Badge>
                                </div>

                                {/* Achievement 3 - Unlocked */}
                                <div className="flex flex-col items-center text-center group cursor-pointer">
                                    <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center mb-3 border-4 border-green-300 shadow-lg group-hover:scale-110 transition-transform">
                                        <Target className="h-12 w-12 text-green-500" />
                                        <div className="absolute -top-1 -right-1 bg-green-500 text-white rounded-full p-1">
                                            <CheckCircle2 className="h-4 w-4" />
                                        </div>
                                    </div>
                                    <h4 className="font-bold text-gray-900 text-sm">🎯 Perfección</h4>
                                    <p className="text-xs text-gray-500">100% en un test</p>
                                    <Badge variant="success" className="mt-2 text-xs">+100 XP</Badge>
                                </div>

                                {/* Locked Achievements */}
                                {[
                                    { name: '⚡ Velocista', desc: '5 fichas en 1 día', xp: 150 },
                                    { name: '🧠 Genio', desc: 'Nivel 10', xp: 500 },
                                    { name: '🌟 Estrella', desc: '50 fichas', xp: 300 },
                                    { name: '👑 Leyenda', desc: '30 días racha', xp: 1000 },
                                    { name: '💎 Diamante', desc: 'Perfecto x5', xp: 250 },
                                    { name: '🏆 Campeón', desc: 'Todas completas', xp: 2000 },
                                ].map((achievement, idx) => (
                                    <div key={idx} className="flex flex-col items-center text-center opacity-50 grayscale cursor-not-allowed">
                                        <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mb-3 border-4 border-gray-200 border-dashed shadow-inner">
                                            <Award className="h-12 w-12 text-gray-400" />
                                        </div>
                                        <h4 className="font-bold text-gray-500 text-sm">{achievement.name}</h4>
                                        <p className="text-xs text-gray-400">{achievement.desc}</p>
                                        <Badge variant="default" className="mt-2 text-xs opacity-50">+{achievement.xp} XP</Badge>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* FAMILY SECTION */}
                {activeSection === 'family' && (
                    <Card className="shadow-xl bg-white animate-fade-in">
                        <div className="p-6 border-b border-gray-100 flex items-center gap-3">
                            <div className="p-2 bg-indigo-100 rounded-lg">
                                <Heart className="h-6 w-6 text-indigo-600" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">Vinculación Familiar</h3>
                                <p className="text-gray-500 text-sm">Conecta tu cuenta con la de tus padres</p>
                            </div>
                        </div>
                        <CardContent className="p-8">
                            <div className="max-w-md mx-auto text-center space-y-6">
                                <Alert className="bg-blue-50 text-blue-800 border-blue-100 flex gap-3 text-left">
                                    <AlertCircle className="h-5 w-5 flex-shrink-0" />
                                    <div>
                                        <p className="font-semibold">¿Cómo funciona?</p>
                                        <p className="text-sm mt-1">Genera un <strong>Código de Vinculación</strong> aquí y dáselo a tu padre o madre para que lo introduzca en su aplicación.</p>
                                    </div>
                                </Alert>

                                <div>
                                    {linkCode ? (
                                        <div className="bg-indigo-50 p-6 rounded-xl border-2 border-dashed border-indigo-200">
                                            <p className="text-sm text-gray-500 mb-2">Tu Código de Vinculación</p>
                                            <div className="text-4xl font-mono font-bold text-indigo-600 tracking-wider mb-2">
                                                {linkCode}
                                            </div>
                                            <p className="text-xs text-indigo-400">Expira en 48h</p>
                                        </div>
                                    ) : (
                                        <Button
                                            onClick={handleGenerateLinkCode}
                                            disabled={generatingCode}
                                            className="w-full h-12 text-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg hover:shadow-xl transition-all"
                                        >
                                            {generatingCode ? 'Generando...' : 'Generar Código para mis Padres'}
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Floating Save Button */}
            <div className="fixed bottom-8 right-8 z-50">
                <Button
                    onClick={saveProfile}
                    className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-2xl px-8 py-4 rounded-full font-bold text-lg transform hover:scale-110 transition-all flex items-center gap-3"
                >
                    <Save className="h-6 w-6" />
                    Guardar Todo
                    <Sparkles className="h-5 w-5 animate-pulse" />
                </Button>
            </div>
        </div>
    );
};

export default StudentProfile;
