# Aplicar Migración 010: Calendai Events

## Descripción
Esta migración crea la tabla `calendar_events` que almacenará:
- ✅ Deberes
- ✅ Exámenes  
- ✅ Sesiones de estudio
- ✅ Proyectos
- ✅ Otros eventos

## Pasos para Aplicar la Migración

### 1. Abrir Supabase SQL Editor
1. Ve a [tu proyecto de Supabase](https://app.supabase.com)
2. Selecciona tu proyecto
3. En el menú lateral, haz clic en **SQL Editor**

### 2. Ejecutar la Migración
1. Clic en **"+ New Query"**
2. Copia TODO el contenido del archivo `database/migrations/010_calendar_events.sql`
3. Pega el contenido en el editor SQL
4. Haz clic en **"Run"** (botón verde abajo a la derecha)

### 3. Verificar que se Creó correctamente
En el editor SQL, ejecuta:
```sql
SELECT * FROM calendar_events LIMIT 1;
```

Debería devolver: `(0 rows)` (tabla vacía pero existente)

### 4. Verificar RLS (Row Level Security)
Ejecuta:
```sql
SELECT tablename, policyname 
FROM pg_policies 
WHERE tablename = 'calendar_events';
```

Deberías ver 4 policies:
- Users can view their own calendar events
- Users can insert their own calendar events  
- Users can update their own calendar events
- Users can delete their own calendar events

## ¿Problemas?

Si obtienes un error al ejecutar la migración:

1. **Error: "relation calendar_events already exists"**
   - La tabla ya existe, no es necesario hacer nada más.

2. **Error de permisos**
   - Asegúrate de estar conectado con el usuario correcto de Supabase.

3. **Otros errores**
   - Copia el mensaje de error y revísalo línea por línea.
   - La mayoría de errores son de sintaxis SQL.

## ¡Listo!
Una vez aplicada la migración, la nueva pestaña **"📅 Mi Agenda"** funcionará correctamente.
