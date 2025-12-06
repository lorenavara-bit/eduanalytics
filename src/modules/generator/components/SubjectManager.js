import React, { useState, useEffect } from 'react';
import { Plus, X, BookOpen } from 'lucide-react';
import { supabase } from '../../supabaseClient';

/**
 * SubjectManager Component
 * Gestiona asignaturas predefinidas + personalizadas del usuario
 * Permite añadir asignaturas como "Gallego", "Catalán", etc.
 */
const SubjectManager = ({ availableSubjects, onSubjectsChange }) => {
    const [customSubjects, setCustomSubjects] = useState([]);
    const [newSubject, setNewSubject] = useState('');
    const [adding, setAdding] = useState(false);

    // Asignaturas predefinidas base (España)
    const defaultSubjects = [
        'Matemáticas',
        'Lengua Castellana',
        'Inglés',
        'Ciencias Naturales',
        'Ciencias Sociales',
        'Educación Física',
        'Música',
        'Plástica / Arte'
    ];

    useEffect(() => {
        loadCustomSubjects();
    }, []);

    const loadCustomSubjects = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data, error } = await supabase
                .from('custom_subjects')
                .select('*')
                .eq('user_id', user.id);

            if (error) throw error;

            if (data) {
                setCustomSubjects(data.map(s => s.subject_name));
                // Notificar al padre que hay asignaturas personalizadas
                if (onSubjectsChange) {
                    const allSubjects = [...defaultSubjects, ...data.map(s => s.subject_name)];
                    onSubjectsChange(allSubjects);
                }
            }
        } catch (error) {
            console.error('Error cargando asignaturas personalizadas:', error);
        }
    };

    const addCustomSubject = async () => {
        if (!newSubject.trim()) return;

        setAdding(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('No autenticado');

            const { error } = await supabase
                .from('custom_subjects')
                .insert({
                    user_id: user.id,
                    subject_name: newSubject.trim()
                });

            if (error) throw error;

            setCustomSubjects([...customSubjects, newSubject.trim()]);
            setNewSubject('');

            // Actualizar lista total
            if (onSubjectsChange) {
                const allSubjects = [...defaultSubjects, ...customSubjects, newSubject.trim()];
                onSubjectsChange(allSubjects);
            }

            alert('✅ Asignatura añadida correctamente');
        } catch (error) {
            console.error('Error añadiendo asignatura:', error);
            alert('Error: ' + error.message);
        } finally {
            setAdding(false);
        }
    };

    const deleteCustomSubject = async (subjectName) => {
        if (!window.confirm(`¿Eliminar "${subjectName}"?`)) return;

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { error } = await supabase
                .from('custom_subjects')
                .delete()
                .eq('user_id', user.id)
                .eq('subject_name', subjectName);

            if (error) throw error;

            const newCustom = customSubjects.filter(s => s !== subjectName);
            setCustomSubjects(newCustom);

            if (onSubjectsChange) {
                onSubjectsChange([...defaultSubjects, ...newCustom]);
            }
        } catch (error) {
            console.error('Error eliminando asignatura:', error);
        }
    };

    return (
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    <BookOpen className="inline h-4 w-4 mr-1" />
                    Asignaturas Disponibles
                </label>
                <p className="text-xs text-gray-500 mb-3">
                    Asignaturas predefinidas + tus asignaturas personalizadas
                </p>
            </div>

            {/* Asignaturas Personalizadas */}
            {customSubjects.length > 0 && (
                <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3">
                    <p className="text-xs font-semibold text-indigo-700 mb-2">✨ Mis Asignaturas</p>
                    <div className="flex flex-wrap gap-2">
                        {customSubjects.map(subject => (
                            <div
                                key={subject}
                                className="bg-white px-3 py-1 rounded-full text-sm flex items-center gap-2 border border-indigo-300"
                            >
                                <span>{subject}</span>
                                <button
                                    onClick={() => deleteCustomSubject(subject)}
                                    className="text-red-500 hover:text-red-700"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Añadir Nueva */}
            <div className="border border-gray-300 rounded-lg p-3 bg-gray-50">
                <p className="text-sm font-semibold text-gray-700 mb-2">
                    <Plus className="inline h-4 w-4 mr-1" />
                    Añadir Asignatura Personalizada
                </p>
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={newSubject}
                        onChange={(e) => setNewSubject(e.target.value)}
                        placeholder="Ej: Gallego, Catalán, Euskera..."
                        className="flex-1 px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                        onKeyPress={(e) => e.key === 'Enter' && addCustomSubject()}
                    />
                    <button
                        onClick={addCustomSubject}
                        disabled={adding || !newSubject.trim()}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50 text-sm"
                    >
                        {adding ? '...' : 'Añadir'}
                    </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                    💡 Útil para asignaturas regionales o talleres especiales
                </p>
            </div>
        </div>
    );
};

export default SubjectManager;
