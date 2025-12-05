/**
 * RoleContext.js
 * 
 * Context Provider para gestión de roles multi-usuario
 * 
 * Funcionalidades:
 * - Detecta roles disponibles del usuario
 * - Gestiona el rol actual (student, parent, teacher)
 * - Permite cambiar entre roles
 * - Proporciona datos del perfil del usuario
 * - Recarga automática cuando cambia la sesión
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

// Create context
const RoleContext = createContext();

/**
 * Hook para usar el contexto de roles
 * @returns {Object} - { currentRole, availableRoles, userProfile, loading, switchRole, reload }
 */
export const useRole = () => {
    const context = useContext(RoleContext);
    if (!context) {
        throw new Error('useRole must be used within a RoleProvider');
    }
    return context;
};

/**
 * Provider component
 */
export const RoleProvider = ({ children }) => {
    // State
    const [currentRole, setCurrentRole] = useState(null);
    const [availableRoles, setAvailableRoles] = useState([]);
    const [userProfile, setUserProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [session, setSession] = useState(null);

    // Load user roles on mount and session change
    useEffect(() => {
        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            if (session) {
                loadUserRoles(session.user.id);
            } else {
                setLoading(false);
            }
        });

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            if (session) {
                loadUserRoles(session.user.id);
            } else {
                // User logged out
                setCurrentRole(null);
                setAvailableRoles([]);
                setUserProfile(null);
                setLoading(false);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    /**
     * Load user profile and determine available roles
     */
    const loadUserRoles = async (userId) => {
        setLoading(true);
        try {
            // Fetch user profile
            const { data: profile, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            if (error) throw error;

            if (profile) {
                setUserProfile(profile);

                // Set available roles (default to ['student'] if not set)
                const roles = profile.available_roles && profile.available_roles.length > 0
                    ? profile.available_roles
                    : ['student'];
                setAvailableRoles(roles);

                // Set current role
                const currentRoleValue = profile.current_role || profile.role || 'student';

                // Verify current role is in available roles
                if (roles.includes(currentRoleValue)) {
                    setCurrentRole(currentRoleValue);
                } else {
                    // Fallback to first available role
                    setCurrentRole(roles[0]);
                    // Update in DB
                    await updateCurrentRoleInDB(userId, roles[0]);
                }
            } else {
                // No profile found, create default
                await createDefaultProfile(userId);
            }
        } catch (error) {
            console.error('Error loading user roles:', error);
            // Fallback to defaults
            setCurrentRole('student');
            setAvailableRoles(['student']);
        } finally {
            setLoading(false);
        }
    };

    /**
     * Create default profile for new users
     */
    const createDefaultProfile = async (userId) => {
        try {
            const { data: user } = await supabase.auth.getUser();

            const defaultProfile = {
                id: userId,
                email: user?.user?.email || '',
                role: 'student',
                available_roles: ['student'],
                current_role: 'student',
                name: user?.user?.user_metadata?.full_name || '',
                created_at: new Date().toISOString()
            };

            const { error } = await supabase
                .from('profiles')
                .insert(defaultProfile);

            if (error) throw error;

            setUserProfile(defaultProfile);
            setCurrentRole('student');
            setAvailableRoles(['student']);
        } catch (error) {
            console.error('Error creating default profile:', error);
        }
    };

    /**
     * Update current role in database
     */
    const updateCurrentRoleInDB = async (userId, role) => {
        try {
            const { error } = await supabase
                .from('profiles')
                .update({ current_role: role, updated_at: new Date().toISOString() })
                .eq('id', userId);

            if (error) throw error;
        } catch (error) {
            console.error('Error updating current role:', error);
        }
    };

    /**
     * Switch to a different role
     * @param {string} newRole - The role to switch to
     * @returns {Promise<boolean>} - Success status
     */
    const switchRole = async (newRole) => {
        // Validate role is available
        if (!availableRoles.includes(newRole)) {
            console.error(`Role "${newRole}" not available for this user`);
            return false;
        }

        // Same role, no action needed
        if (newRole === currentRole) {
            return true;
        }

        try {
            if (!session?.user?.id) return false;

            // Update in database
            await updateCurrentRoleInDB(session.user.id, newRole);

            // Update local state
            setCurrentRole(newRole);

            // Update userProfile state
            setUserProfile(prev => ({
                ...prev,
                current_role: newRole
            }));

            console.log(`✅ Switched to ${newRole} role`);
            return true;
        } catch (error) {
            console.error('Error switching role:', error);
            return false;
        }
    };

    /**
     * Reload user data (useful after profile updates)
     */
    const reload = () => {
        if (session?.user?.id) {
            loadUserRoles(session.user.id);
        }
    };

    /**
     * Check if user has a specific role available
     */
    const hasRole = (role) => {
        return availableRoles.includes(role);
    };

    /**
     * Check if current role matches
     */
    const isRole = (role) => {
        return currentRole === role;
    };

    // Context value
    const value = {
        // State
        currentRole,
        availableRoles,
        userProfile,
        loading,
        session,

        // Methods
        switchRole,
        reload,
        hasRole,
        isRole
    };

    return (
        <RoleContext.Provider value={value}>
            {children}
        </RoleContext.Provider>
    );
};

export default RoleContext;
