# 🚀 Aplicar Migración 011: Sistema Multi-Rol

## 📋 Pre-requisitos

Antes de aplicar esta migración, asegúrate de:

- ✅ Tener backup de tu base de datos
- ✅ Estar conectado a Supabase con permisos de administrador
- ✅ Haber aplicado migraciones anteriores (001-010)

---

## 🔧 PASO 1: Abrir Supabase SQL Editor

1. Ve a [Supabase Dashboard](https://app.supabase.com)
2. Selecciona tu proyecto
3. En el menú lateral, haz clic en **SQL Editor**
4. Haz clic en **"+ New Query"**

---

## 📝 PASO 2: Copiar y Ejecutar SQL

1. Abre el archivo `database/migrations/011_multi_role_system.sql`
2. **Copia TODO el contenido** (Ctrl+A, Ctrl+C)
3. **Pega** en el SQL Editor de Supabase
4. Haz clic en **RUN** (botón verde abajo a la derecha)

---

## ✅ PASO 3: Verificar Éxito

Deberías ver al final del output:

```
NOTICE: Migration 011 completed successfully!
```

Si ves este mensaje, ¡todo fue bien! ✨

---

## 🔍 PASO 4: Verificación Manual (Opcional)

Ejecuta estas queries para verificar:

### 4.1 Verificar tabla `profiles` modificada

```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND column_name IN ('role', 'available_roles', 'current_role', 'parent_email');
```

**Esperado**: 4 columnas listadas

### 4.2 Verificar tabla `parent_child_links`

```sql
SELECT COUNT(*) as total_policies
FROM pg_policies 
WHERE tablename = 'parent_child_links';
```

**Esperado**: 5 policies

### 4.3 Verificar vista `parent_dashboard_summary`

```sql
SELECT * FROM parent_dashboard_summary LIMIT 1;
```

**Esperado**: Query ejecuta sin error (puede devolver 0 filas si no hay datos)

### 4.4 Verificar función helper

```sql
SELECT generate_invitation_code();
```

**Esperado**: Devuelve un código de 8 caracteres (ej: "A3F7B2E9")

---

## 🎯 PASO 5: Asignar Roles Iniciales

### 5.1 Convertir un usuario existente a PADRE

```sql
-- Reemplaza 'email@example.com' con el email real
UPDATE profiles 
SET 
    role = 'parent',
    available_roles = ARRAY['parent', 'student']::TEXT[],
    current_role = 'parent'
WHERE email = 'email@example.com';
```

### 5.2 Mantener usuarios como ALUMNOS (por defecto)

Los usuarios existentes ya tienen `role = 'student'` por defecto. No necesitas hacer nada.

### 5.3 Usuario MULTI-ROL (Padre + Alumno)

```sql
-- Usuario que puede ser padre Y alumno
UPDATE profiles 
SET 
    role = 'parent',  -- Rol principal
    available_roles = ARRAY['parent', 'student']::TEXT[],
    current_role = 'parent'  -- Rol actual al entrar
WHERE email = 'email@example.com';
```

---

## 🔗 PASO 6: Crear Primera Vinculación (Testing)

### Opción A: Vinculación directa (padre invita a hijo por email)

```sql
-- Reemplaza los emails con usuarios reales de tu DB
WITH parent_user AS (
    SELECT id FROM auth.users WHERE email = 'padre@example.com'
),
child_user AS (
    SELECT id FROM auth.users WHERE email = 'hijo@example.com'
)
INSERT INTO parent_child_links (parent_user_id, child_user_id, status)
SELECT p.id, c.id, 'active'
FROM parent_user p, child_user c;
```

### Opción B: Crear código de invitación

```sql
-- Hijo genera código
WITH child AS (
    SELECT id FROM auth.users WHERE email = 'hijo@example.com'
)
INSERT INTO invitation_codes (code, child_user_id, created_by)
SELECT 
    generate_invitation_code(),
    id,
    id
FROM child
RETURNING code, expires_at;
```

**El código generado se usa en la app para que el padre se vincule.**

---

## 🐛 Troubleshooting

### Error: "column already exists"

**Solución**: La columna ya fue añadida en ejecución previa. Comenta esa línea en el SQL y vuelve a ejecutar.

### Error: "relation already exists"

**Solución**: Las tablas ya existen. Puedes:
1. Comentar la sección CREATE TABLE
2. O hacer DROP TABLE antes (⚠️ **perderás datos**)

### Error: "permission denied"

**Solución**: Necesitas permisos de administrador en Supabase. Contacta al owner del proyecto.

### Warning: "trigger already exists"

**No es problema**. El trigger ya está creado. Ignora el warning.

---

## 📊 PASO 7: Verificar en App

Después de aplicar la migración:

1. **Recarga la app** (Ctrl+R)
2. **Haz logout y login** de nuevo
3. Verifica que tu usuario tiene el rol correcto en `userProfile`

Abre la consola del navegador (F12) y ejecuta:

```javascript
console.log(userProfile);
// Debería mostrar: role, available_roles, current_role
```

---

## ✨ ¡Listo!

Migration 011 aplicada con éxito. Ahora tu app tiene:

- ✅ Sistema de roles (student, parent, teacher)
- ✅ Vinculación padre-hijo con permisos
- ✅ Códigos de invitación
- ✅ Vista optimizada para dashboard padres
- ✅ RLS para seguridad multi-tenant

**Próximo paso**: Implementar RoleContext en la app React. 🚀

---

## 🆘 Soporte

Si encuentras algún error:

1. Copia el mensaje de error completo
2. Verifica qué paso específico falló
3. Revisa la sección de Troubleshooting
4. Si persiste, házmelo saber con el error exacto

---

**Fecha de creación**: 2025-12-05  
**Versión**: 1.0.0  
**Autor**: Antigravity AI
