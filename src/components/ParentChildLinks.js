import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import {
    Users, QrCode, Copy, Check, RefreshCw,
    UserPlus, Shield, AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, Button, Badge, Alert } from './DesignSystem';
import { useRole } from '../contexts/RoleContext';

const ParentChildLinks = () => {
    const { session } = useRole();
    const [loading, setLoading] = useState(true);
    const [children, setChildren] = useState([]);

    // New logic: LINK CHILD via Code
    const [linkCode, setLinkCode] = useState('');
    const [linking, setLinking] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            // Cargar hijos vinculados
            const { data: linksData, error: linksError } = await supabase
                .from('parent_child_links')
                .select('*')
                .eq('parent_user_id', session.user.id);

            if (linksError) throw linksError;

            if (linksData && linksData.length > 0) {
                // Obtener IDs de los hijos
                const childIds = linksData.map(link => link.child_user_id);

                // Obtener perfiles de esos hijos
                const { data: profilesData, error: profilesError } = await supabase
                    .from('profiles')
                    .select('id, name, email, avatar_url')
                    .in('id', childIds);

                if (profilesError) throw profilesError;

                // Combinar datos
                const combinedData = linksData.map(link => ({
                    ...link,
                    student: profilesData.find(p => p.id === link.child_user_id) || {}
                }));

                setChildren(combinedData);
            } else {
                setChildren([]);
            }

        } catch (error) {
            console.error('Error loading links:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLinkChild = async () => {
        if (!linkCode.trim()) return;
        setLinking(true);
        try {
            // 1. Verify code
            const { data: codeData, error: codeError } = await supabase
                .from('invitation_codes')
                .select('*')
                .eq('code', linkCode.toUpperCase().trim())
                .is('used_by', null)
                .gt('expires_at', new Date().toISOString())
                .single();

            if (codeError || !codeData) throw new Error('Código inválido o expirado');

            // 2. Create link (NOW we know both IDs)
            const { error: linkError } = await supabase
                .from('parent_child_links')
                .insert({
                    parent_user_id: session.user.id, // ME (Parent)
                    child_user_id: codeData.child_user_id, // CHILD (From Code)
                    status: 'active'
                });

            if (linkError) throw linkError;

            // 3. Mark code as used
            const { error: updateError } = await supabase
                .from('invitation_codes')
                .update({ used_by: session.user.id, used_at: new Date().toISOString() })
                .eq('id', codeData.id);

            if (updateError) console.error('Error updating code:', updateError);

            alert('¡Hijo vinculado con éxito!');
            setLinkCode('');
            loadData(); // Refresh list
        } catch (error) {
            console.error('Link error:', error);
            if (error.message?.includes('violates row-level security')) {
                alert('Error de permisos en base de datos. Por favor ejecuta la migración 012 en Supabase.');
            } else {
                alert('Error al vincular: ' + error.message);
            }
        } finally {
            setLinking(false);
        }
    };

    return (
        <div className="p-6 max-w-4xl mx-auto space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                        <Users className="h-8 w-8 text-indigo-600" />
                        Gestión de Familia
                    </h1>
                    <p className="text-gray-600 mt-1">Conecta las cuentas de tus hijos para ver su progreso</p>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                {/* Vincular Hijo (INPUT) */}
                <Card className="bg-gradient-to-br from-indigo-50 to-white border-indigo-100">
                    <CardHeader>
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <UserPlus className="h-5 w-5 text-indigo-600" />
                            Vincular Nuevo Hijo
                        </h2>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            <div className="text-center p-6 bg-white rounded-xl border-2 border-dashed border-indigo-200">
                                <QrCode className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                                <p className="text-gray-600 mb-4 font-medium">Introduce el código generado por tu hijo</p>

                                <input
                                    type="text"
                                    placeholder="AB1234"
                                    value={linkCode}
                                    onChange={(e) => setLinkCode(e.target.value.toUpperCase())}
                                    className="w-full text-center text-3xl font-mono tracking-widest border-2 border-gray-300 rounded-xl py-4 mb-4 focus:border-indigo-500 focus:ring-0 uppercase"
                                    maxLength={6}
                                />

                                <Button
                                    onClick={handleLinkChild}
                                    disabled={!linkCode || linking}
                                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-md"
                                >
                                    {linking ? 'Verificando...' : 'Vincular Cuenta'}
                                </Button>
                            </div>

                            <Alert className="bg-blue-50 text-blue-800 border-blue-100">
                                <AlertCircle className="h-4 w-4" />
                                <div>
                                    <strong>¿Cómo funciona?</strong>
                                    <ol className="list-decimal ml-4 mt-1 text-sm space-y-1">
                                        <li>Pide a tu hijo que entre en su perfil.</li>
                                        <li>En la sección <strong>Familia</strong>, debe generar un código.</li>
                                        <li>Introduce ese código aquí.</li>
                                    </ol>
                                </div>
                            </Alert>
                        </div>
                    </CardContent>
                </Card>

                {/* Lista de Hijos */}
                <Card>
                    <CardHeader>
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <Shield className="h-5 w-5 text-green-600" />
                            Cuentas Vinculadas
                        </h2>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="text-center py-8 text-gray-500">Cargando...</div>
                        ) : children.length === 0 ? (
                            <div className="text-center py-12 bg-gray-50 rounded-lg">
                                <p className="text-gray-500">No hay cuentas vinculadas aún.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {children.map(link => (
                                    <div key={link.id} className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold overflow-hidden">
                                                {link.student?.avatar_url ? (
                                                    <img src={link.student.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                                                ) : (
                                                    (link.student?.name?.[0]?.toUpperCase() || 'E')
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gray-900">{link.student?.name || 'Estudiante'}</p>
                                                <p className="text-xs text-gray-500">Vinculado el {new Date(link.created_at).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <Badge className="bg-green-100 text-green-800 border-green-200">
                                            Activo
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default ParentChildLinks;
