# Aplicar Migración: Tabla Worksheets

## 📋 Instrucciones Rápidas

1. **Abre Supabase Dashboard**: Ve a [https://supabase.com/dashboard](https://supabase.com/dashboard)

2. **Selecciona tu proyecto** EduAnalytics

3. **Ve al SQL Editor**:
   - En el menú izquierdo, click en "SQL Editor"
   - Click en "New query"

4. **Copia y pega el contenido** del archivo:
   `database/migrations/005_worksheets.sql`

5. **Ejecuta la consulta**:
   - Click en "Run" o presiona `Ctrl+Enter`
   - Deberías ver: "Success. No rows returned"

6. **Verifica la tabla**:
   - Ve a "Table Editor" en el menú izquierdo
   - Deberías ver la nueva tabla `worksheets`

## ✅ Verificación

Después de ejecutar, prueba guardar un examen en la aplicación. ¡Debería funcionar!

## 🗂️ Estructura de la Tabla

La tabla `worksheets` incluye:
- `id`: UUID único
- `user_id`: Referencia al usuario
- `subject`: Asignatura (ej: "Ciencias Sociales")
- `type`: Tipo ("worksheet" o "exam")
- `title`: Título del ejercicio
- `worksheet_data`: JSON con las preguntas
- `student_answers`: JSON con las respuestas del alumno
- `status`: Estado ("not_started", "in_progress", "completed")
- `score`: Puntuación (0-100)
- Timestamps automáticos

## 🔒 Seguridad

✅ Row Level Security (RLS) habilitado
✅ Los usuarios solo ven sus propios worksheets
✅ Políticas para SELECT, INSERT, UPDATE, DELETE
