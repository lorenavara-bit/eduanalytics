import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { User, Mail, Lock } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function Auth() {
    const navigate = useNavigate();
    const location = useLocation();

    // Get initial state from navigation if available
    const initialEmail = location.state?.email || '';
    const initialIsSignUp = location.pathname === '/signup';

    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState(initialEmail);
    const [password, setPassword] = useState('');
    const [isSignUp, setIsSignUp] = useState(initialIsSignUp);
    const [message, setMessage] = useState('');

    useEffect(() => {
        setIsSignUp(location.pathname === '/signup');
    }, [location.pathname]);

    const handleAuth = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        try {
            if (isSignUp) {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                });
                if (error) throw error;
                setMessage('¡Registro exitoso! Revisa tu email para confirmar.');
            } else {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
                // Redirect on success
                navigate('/app');
            }
        } catch (error) {
            console.error('Auth error:', error);
            setMessage(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
                <div>
                    <div className="mx-auto h-12 w-12 bg-indigo-100 rounded-full flex items-center justify-center">
                        <User className="h-6 w-6 text-indigo-600" />
                    </div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        {isSignUp ? 'Crear Cuenta' : 'Iniciar Sesión'}
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        {isSignUp ? 'Regístrate para guardar tu progreso' : 'Accede a tus datos guardados'}
                    </p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleAuth}>
                    <div className="rounded-md shadow-sm -space-y-px">
                        <div className="relative">
                            <Mail className="absolute top-3 left-3 h-5 w-5 text-gray-400" />
                            <input
                                type="email"
                                required
                                className="appearance-none rounded-none relative block w-full px-10 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                                placeholder="Correo electrónico"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div className="relative">
                            <Lock className="absolute top-3 left-3 h-5 w-5 text-gray-400" />
                            <input
                                type="password"
                                required
                                className="appearance-none rounded-none relative block w-full px-10 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                                placeholder="Contraseña"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    {message && (
                        <div className={`text-sm text-center ${message.includes('exitoso') ? 'text-green-600' : 'text-red-600'}`}>
                            {message}
                        </div>
                    )}

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                        >
                            {loading ? 'Procesando...' : (isSignUp ? 'Registrarse' : 'Entrar')}
                        </button>
                    </div>
                </form>
                <div className="text-center">
                    <button
                        onClick={() => navigate(isSignUp ? '/login' : '/signup')}
                        className="text-sm text-indigo-600 hover:text-indigo-500 font-medium"
                    >
                        {isSignUp ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate'}
                    </button>
                </div>
            </div>
        </div>
    );
}
