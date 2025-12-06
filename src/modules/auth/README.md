# 🔐 Módulo 1: Autenticación y Roles

## Responsabilidad
Gestión completa de login, sesión, roles y permisos.

## Componentes
- `Login.js` - Pantalla de login (Google/Email)
- `ProfileSelector.js` - Selector tipo Netflix ("¿Quién está aprendiendo?")
- `RoleGuard.js` - HOC para proteger rutas por rol
- `Unauthorized.js` - Página 403

## Contextos
- `AuthContext.js` - Estado global de autenticación
- `RoleContext.js` - Estado global de rol activo

## Hooks
- `useAuth()` - Acceso a usuario actual
- `useRole()` - Acceso a rol actual

## Estado Actual
✅ Login con Google funcional
⚠️ Persistencia de sesión tiene parpadeos al recargar
🔨 Próximo: Migrar a modelo "Family Profiles"
