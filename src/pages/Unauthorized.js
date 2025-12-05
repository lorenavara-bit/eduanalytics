/**
 * Unauthorized.js
 * 
 * Página mostrada cuando un usuario intenta acceder a una ruta
 * para la que no tiene permisos
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, ArrowLeft } from 'lucide-react';

const Unauthorized = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 p-6">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
                {/* Icon */}
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-100 flex items-center justify-center">
                    <Shield className="h-10 w-10 text-red-600" />
                </div>

                {/* Title */}
                <h1 className="text-3xl font-bold text-gray-900 mb-3">
                    Acceso Denegado
                </h1>

                {/* Message */}
                <p className="text-gray-600 mb-2">
                    No tienes permisos para acceder a esta sección.
                </p>
                <p className="text-sm text-gray-500 mb-8">
                    Si crees que esto es un error, contacta al administrador.
                </p>

                {/* Actions */}
                <div className="flex flex-col gap-3">
                    <button
                        onClick={() => navigate('/app/select-role')}
                        className="w-full bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                    >
                        Seleccionar Rol
                    </button>
                    <button
                        onClick={() => navigate(-1)}
                        className="w-full flex items-center justify-center gap-2 text-gray-600 hover:text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Volver
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Unauthorized;
