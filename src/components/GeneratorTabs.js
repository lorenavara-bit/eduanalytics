import React, { useState } from 'react';
import { Brain, Upload, Settings } from 'lucide-react';
import WorksheetGeneratorComplete from './WorksheetGeneratorComplete';
import FileUploader from '../modules/generator/components/FileUploader';
import SubjectManager from '../modules/generator/components/SubjectManager';
import { useStudentData } from '../contexts/StudentDataContext';

/**
 * GeneratorTabs - Wrapper con pestañas para el Generador IA
 * Unifica: Generar desde cero, Subir Material, Gestionar Asignaturas
 */
const GeneratorTabs = () => {
    const [activeTab, setActiveTab] = useState('generate');
    const { subjects, setSubjects } = useStudentData();

    const tabs = [
        {
            id: 'generate',
            name: 'Generar Ficha',
            icon: Brain,
            description: 'Crea ejercicios con IA'
        },
        {
            id: 'upload',
            name: 'Subir Material',
            icon: Upload,
            description: 'Sube PDFs o imágenes'
        },
        {
            id: 'subjects',
            name: 'Mis Asignaturas',
            icon: Settings,
            description: 'Añadir asignaturas personalizadas'
        }
    ];

    return (
        <div className="space-y-4">
            {/* Navegación de Pestañas */}
            <div className="bg-white border-b border-gray-200 rounded-t-lg">
                <nav className="flex space-x-1 px-4" aria-label="Tabs">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;

                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`
                                    group inline-flex items-center px-4 py-3 font-medium text-sm border-b-2 
                                    transition-all duration-200
                                    ${isActive
                                        ? 'border-indigo-600 text-indigo-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }
                                `}
                            >
                                <Icon className={`
                                    h-5 w-5 mr-2
                                    ${isActive ? 'text-indigo-600' : 'text-gray-400 group-hover:text-gray-500'}
                                `} />
                                <div className="text-left">
                                    <div>{tab.name}</div>
                                    <div className="text-xs text-gray-500 font-normal">
                                        {tab.description}
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                </nav>
            </div>

            {/* Contenido de las Pestañas */}
            <div className="bg-white rounded-b-lg shadow-sm">
                {activeTab === 'generate' && (
                    <div>
                        <WorksheetGeneratorComplete />
                    </div>
                )}

                {activeTab === 'upload' && (
                    <div className="p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                            <Upload className="h-6 w-6 mr-2 text-indigo-600" />
                            Subir Material de Estudio
                        </h2>
                        <p className="text-sm text-gray-600 mb-6">
                            Sube apuntes, ejercicios o exámenes anteriores.
                            Luego podrás generar fichas basadas en ellos.
                        </p>
                        <FileUploader
                            onUploadComplete={(material) => {
                                alert(`Material "${material.name}" subido. Ahora puedes usarlo en "Generar Ficha"`);
                                setActiveTab('generate');
                            }}
                        />
                        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <p className="text-sm text-blue-800">
                                💡 <strong>Tip:</strong> Después de subir archivos, ve a "Generar Ficha"
                                y selecciona tus materiales para crear ejercicios personalizados.
                            </p>
                        </div>
                    </div>
                )}

                {activeTab === 'subjects' && (
                    <div className="p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                            <Settings className="h-6 w-6 mr-2 text-indigo-600" />
                            Gestionar Asignaturas
                        </h2>
                        <p className="text-sm text-gray-600 mb-6">
                            Añade asignaturas personalizadas como Gallego, Catalán, Euskera,
                            o cualquier taller especial de tu colegio.
                        </p>
                        <SubjectManager
                            availableSubjects={subjects}
                            onSubjectsChange={(newSubjects) => {
                                setSubjects(newSubjects);
                            }}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default GeneratorTabs;
