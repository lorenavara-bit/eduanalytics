import React, { useState } from 'react';
import { BookOpen, Brain, TrendingUp, Sparkles, CheckCircle, ArrowRight, Upload, FileText, Zap, Users, Star, Shield } from 'lucide-react';

const LandingPage = ({ onGetStarted, onLogin }) => {
    const [email, setEmail] = useState('');

    const features = [
        {
            icon: Upload,
            title: "Sube Materiales Escolares",
            description: "PDF, Word, imágenes - cualquier material de clase",
            color: "from-blue-500 to-blue-600"
        },
        {
            icon: Brain,
            title: "IA Analiza el Contenido",
            description: "Comprende automáticamente temas y conceptos clave",
            color: "from-purple-500 to-purple-600"
        },
        {
            icon: FileText,
            title: "Genera Exámenes Personalizados",
            description: "Ejercicios adaptados al nivel e intereses de tu hijo",
            color: "from-pink-500 to-pink-600"
        },
        {
            icon: TrendingUp,
            title: "Seguimiento de Progreso",
            description: "Visualiza el crecimiento en cada asignatura",
            color: "from-green-500 to-green-600"
        }
    ];

    const benefits = [
        "Genera ejercicios ilimitados en segundos",
        "Personalizado según el nivel de tu hijo",
        "Ahorra €100+ al mes vs tutores privados",
        "Disponible 24/7 desde cualquier dispositivo",
        "Seguimiento multi-año del progreso"
    ];

    const testimonials = [
        {
            name: "María González",
            role: "Madre de Alex, 10 años",
            text: "Mi hijo tiene altas capacidades y se aburría con los ejercicios estándar. Ahora puedo generar problemas de matemáticas sobre dinosaurios y está motivadísimo.",
            rating: 5
        },
        {
            name: "Carlos Fernández",
            role: "Padre de Lucía, 8 años",
            text: "Como padre sin formación pedagógica, finalmente tengo una herramienta que me ayuda a apoyar a mi hija efectivamente. Los exámenes generados son de calidad profesional.",
            rating: 5
        },
        {
            name: "Ana Martín",
            role: "Madre de 2 hijos",
            text: "Gestiono el aprendizaje de mis dos hijos desde una sola plataforma. El seguimiento multi-año es invaluable para ver su evolución.",
            rating: 5
        }
    ];

    return (
        <div className="min-h-screen bg-white">
            {/* Navigation */}
            <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-lg border-b border-gray-200 z-50">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                            <BookOpen className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-xl font-bold text-gray-900">EduAnalytics</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={onLogin}
                            className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium"
                        >
                            Iniciar Sesión
                        </button>
                        <button
                            onClick={() => onGetStarted(email)}
                            className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg transition-all"
                        >
                            Empezar Gratis
                        </button>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <div className="pt-32 pb-20 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-medium mb-6">
                                <Sparkles className="w-4 h-4" />
                                Tecnología Educativa con IA
                            </div>
                            <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
                                Ayuda a tu hijo a{' '}
                                <span className="bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
                                    alcanzar su potencial
                                </span>
                            </h1>
                            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                                Genera ejercicios personalizados, exámenes y material de estudio adaptado a los intereses y nivel de tu hijo. Todo con inteligencia artificial.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 mb-8">
                                <input
                                    type="email"
                                    placeholder="tu@email.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="px-6 py-4 border-2 border-gray-300 rounded-xl text-lg focus:outline-none focus:border-blue-500 flex-1"
                                />
                                <button
                                    onClick={() => onGetStarted(email)}
                                    className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold text-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 whitespace-nowrap"
                                >
                                    Prueba Gratis
                                    <ArrowRight className="w-5 h-5" />
                                </button>
                            </div>
                            <p className="text-sm text-gray-500">
                                ✓ Sin tarjeta de crédito ✓ Configuración en 2 minutos ✓ Cancela cuando quieras
                            </p>
                        </div>

                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl blur-3xl opacity-20"></div>
                            <div className="relative bg-white rounded-3xl shadow-2xl p-8 border border-gray-200">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl">
                                        <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                                            <Upload className="w-6 h-6 text-white" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-semibold text-gray-900">Matemáticas_Tema5.pdf</p>
                                            <p className="text-sm text-gray-600">Subido hace 2 min</p>
                                        </div>
                                        <CheckCircle className="w-6 h-6 text-green-500" />
                                    </div>

                                    <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-xl">
                                        <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
                                            <Brain className="w-6 h-6 text-white" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-semibold text-gray-900">Análisis completado</p>
                                            <p className="text-sm text-gray-600">15 conceptos identificados</p>
                                        </div>
                                        <CheckCircle className="w-6 h-6 text-green-500" />
                                    </div>

                                    <div className="p-4 bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl border-2 border-pink-200">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Zap className="w-5 h-5 text-pink-600" />
                                            <p className="font-semibold text-gray-900">¡Examen generado!</p>
                                        </div>
                                        <p className="text-sm text-gray-600 mb-3">
                                            10 preguntas personalizadas sobre fracciones
                                        </p>
                                        <button className="w-full px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg transition-all">
                                            Descargar PDF
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="py-12 bg-gray-50">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        <div className="text-center">
                            <p className="text-4xl font-bold text-gray-900 mb-2">500+</p>
                            <p className="text-gray-600">Familias Activas</p>
                        </div>
                        <div className="text-center">
                            <p className="text-4xl font-bold text-gray-900 mb-2">10K+</p>
                            <p className="text-gray-600">Ejercicios Generados</p>
                        </div>
                        <div className="text-center">
                            <p className="text-4xl font-bold text-gray-900 mb-2">4.9/5</p>
                            <p className="text-gray-600">Valoración Padres</p>
                        </div>
                        <div className="text-center">
                            <p className="text-4xl font-bold text-gray-900 mb-2">95%</p>
                            <p className="text-gray-600">Recomendarían</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Features */}
            <div className="py-20 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">
                            ¿Cómo Funciona?
                        </h2>
                        <p className="text-xl text-gray-600">
                            Tan simple que lo usarás todos los días
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {features.map((feature, idx) => {
                            const Icon = feature.icon;
                            return (
                                <div key={idx} className="text-center">
                                    <div className="relative inline-block mb-6">
                                        <div className={`w-20 h-20 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center shadow-lg`}>
                                            <Icon className="w-10 h-10 text-white" />
                                        </div>
                                        <div className="absolute -top-2 -right-2 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                            {idx + 1}
                                        </div>
                                    </div>
                                    <h3 className="text-xl font-semibold text-gray-900 mb-3">
                                        {feature.title}
                                    </h3>
                                    <p className="text-gray-600">
                                        {feature.description}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Benefits */}
            <div className="py-20 px-6 bg-gradient-to-br from-blue-50 to-purple-50">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">
                            ¿Por Qué Elegir EduAnalytics?
                        </h2>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        {benefits.map((benefit, idx) => (
                            <div key={idx} className="flex items-start gap-4 p-6 bg-white rounded-xl shadow-sm">
                                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                                    <CheckCircle className="w-5 h-5 text-white" />
                                </div>
                                <p className="text-lg text-gray-700">{benefit}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Testimonials */}
            <div className="py-20 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">
                            Lo Que Dicen los Padres
                        </h2>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {testimonials.map((testimonial, idx) => (
                            <div key={idx} className="p-8 bg-white rounded-2xl shadow-lg border border-gray-200">
                                <div className="flex gap-1 mb-4">
                                    {[...Array(testimonial.rating)].map((_, i) => (
                                        <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                                    ))}
                                </div>
                                <p className="text-gray-700 mb-6 leading-relaxed">
                                    "{testimonial.text}"
                                </p>
                                <div>
                                    <p className="font-semibold text-gray-900">{testimonial.name}</p>
                                    <p className="text-sm text-gray-600">{testimonial.role}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* CTA Final */}
            <div className="py-20 px-6 bg-gradient-to-r from-blue-500 to-purple-600">
                <div className="max-w-4xl mx-auto text-center text-white">
                    <h2 className="text-4xl md:text-5xl font-bold mb-6">
                        Empieza Hoy Mismo
                    </h2>
                    <p className="text-xl mb-8 opacity-90">
                        Únete a cientos de familias que ya están ayudando a sus hijos a alcanzar su potencial
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-xl mx-auto">
                        <input
                            type="email"
                            placeholder="tu@email.com"
                            className="w-full px-6 py-4 rounded-xl text-gray-900 text-lg focus:outline-none focus:ring-4 focus:ring-white/50"
                        />
                        <button
                            onClick={() => onGetStarted('')}
                            className="w-full sm:w-auto px-8 py-4 bg-white text-blue-600 rounded-xl font-semibold text-lg hover:shadow-2xl transition-all whitespace-nowrap"
                        >
                            Comenzar Gratis
                        </button>
                    </div>
                    <p className="mt-6 text-sm opacity-75">
                        ✓ Sin compromiso ✓ Cancela cuando quieras ✓ Soporte en español
                    </p>
                </div>
            </div>

            {/* Footer */}
            <footer className="py-12 px-6 bg-gray-900 text-white">
                <div className="max-w-7xl mx-auto">
                    <div className="grid md:grid-cols-4 gap-8 mb-8">
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                                    <BookOpen className="w-5 h-5 text-white" />
                                </div>
                                <span className="text-lg font-bold">EduAnalytics</span>
                            </div>
                            <p className="text-gray-400 text-sm">
                                Educación personalizada con IA para cada niño
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold mb-4">Producto</h4>
                            <ul className="space-y-2 text-sm text-gray-400">
                                <li><a href="#" className="hover:text-white">Características</a></li>
                                <li><a href="#" className="hover:text-white">Precios</a></li>
                                <li><a href="#" className="hover:text-white">Casos de Uso</a></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-semibold mb-4">Recursos</h4>
                            <ul className="space-y-2 text-sm text-gray-400">
                                <li><a href="#" className="hover:text-white">Blog</a></li>
                                <li><a href="#" className="hover:text-white">Guías</a></li>
                                <li><a href="#" className="hover:text-white">Soporte</a></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-semibold mb-4">Legal</h4>
                            <ul className="space-y-2 text-sm text-gray-400">
                                <li><a href="#" className="hover:text-white">Privacidad</a></li>
                                <li><a href="#" className="hover:text-white">Términos</a></li>
                                <li><a href="#" className="hover:text-white">Contacto</a></li>
                            </ul>
                        </div>
                    </div>

                    <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-sm text-gray-400">
                            © 2025 EduAnalytics. Hecho con ❤️ en Galicia, España
                        </p>
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                            <Shield className="w-4 h-4" />
                            <span>GDPR Compliant • Datos Protegidos</span>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
