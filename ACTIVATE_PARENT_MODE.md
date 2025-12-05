# 🛠️ GUÍA RÁPIDA: ACTIVAR MODO PADRE

Para ver el nuevo **Parent Dashboard** y el selector de roles, tu usuario necesita tener permisos de "Padre" en la base de datos. Por defecto, solo tienes "Estudiante".

## PASO 1: Ejecutar este SQL en Supabase

Ve a tu panel de Supabase (SQL Editor) y ejecuta esto:

```sql
UPDATE profiles 
SET available_roles = '["student", "parent"]'::jsonb;
```

Esto dará acceso total a todos tus usuarios.

## PASO 2: Probar en la App

1. **Recarga** la página.
2. Si ya estás dentro, haz **Logout** (click en tu avatar > Cerrar Sesión).
3. Haz **Login** de nuevo.
4. 🎉 **AHORA VERÁS**: Una pantalla preguntando "¿Quién eres hoy?" (Padre o Estudiante).

---

## ✅ COSAS YA ARREGLADAS (Recarga para ver)

1. **Login**: Ya redirige correctamente (arreglado hace un momento).
2. **"Upload Page - TODO"**: YA NO SALE. Ahora carga el **Generador de Fichas** correctamente.
3. **Subir Materiales**: Funciona como antes.

¡Pruébalo ahora! 🚀
