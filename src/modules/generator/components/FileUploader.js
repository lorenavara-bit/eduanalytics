import React, { useState } from 'react';
import { Upload, Plus, X } from 'lucide-react';
import { supabase } from '../../supabaseClient';

/**
 * FileUploader Component
 * Permite subir archivos (PDFs, imágenes) a Supabase Storage
 * y guardarlos como "materials" para generar fichas basadas en ellos
 */
const FileUploader = ({ onUploadComplete }) => {
    const [uploading, setUploading] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validar tipo (PDF, imágenes, Word)
            const allowed = ['application/pdf', 'image/jpeg', 'image/png', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
            if (!allowed.includes(file.type)) {
                alert('Solo se permiten archivos PDF, imágenes (JPG, PNG) o Word (.docx)');
                return;
            }
            setSelectedFile(file);
        }
    };

    const uploadFile = async () => {
        if (!selectedFile) return;

        setUploading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('No autenticado');

            // 1. Subir a Supabase Storage
            const fileExt = selectedFile.name.split('.').pop();
            const fileName = `${user.id}/${Date.now()}.${fileExt}`;

            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('materials')
                .upload(fileName, selectedFile);

            if (uploadError) throw uploadError;

            // 2. Obtener URL pública
            const { data: urlData } = supabase.storage
                .from('materials')
                .getPublicUrl(fileName);

            // 3. Guardar referencia en la tabla 'materials'
            const { data: materialData, error: dbError } = await supabase
                .from('materials')
                .insert({
                    user_id: user.id,
                    name: selectedFile.name,
                    type: selectedFile.type,
                    subject: 'General', // Podrías permitir selección
                    url: urlData.publicUrl,
                    date: new Date()
                })
                .select()
                .single();

            if (dbError) throw dbError;

            alert('✅ Archivo subido correctamente');
            setSelectedFile(null);
            if (onUploadComplete) onUploadComplete(materialData);

        } catch (error) {
            console.error('Error subiendo archivo:', error);
            alert('Error al subir el archivo: ' + error.message);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 bg-gray-50">
            <div className="text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="mt-4">
                    <label className="cursor-pointer">
                        <span className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 inline-block">
                            Seleccionar Archivo
                        </span>
                        <input
                            type="file"
                            className="hidden"
                            accept=".pdf,.jpg,.jpeg,.png,.docx"
                            onChange={handleFileChange}
                        />
                    </label>
                </div>
                {selectedFile && (
                    <div className="mt-4 text-sm text-gray-700">
                        <p><strong>Archivo:</strong> {selectedFile.name}</p>
                        <p><strong>Tamaño:</strong> {(selectedFile.size / 1024).toFixed(2)} KB</p>
                        <button
                            onClick={uploadFile}
                            disabled={uploading}
                            className="mt-3 bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 disabled:opacity-50"
                        >
                            {uploading ? 'Subiendo...' : 'Subir y Guardar'}
                        </button>
                    </div>
                )}
                <p className="mt-2 text-xs text-gray-500">
                    Formatos: PDF, JPG, PNG, DOCX (Max. 10MB)
                </p>
            </div>
        </div>
    );
};

export default FileUploader;
