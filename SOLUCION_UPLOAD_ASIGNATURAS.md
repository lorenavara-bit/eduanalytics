# 🎯 SOLUCIÓN COMPLETA: Upload + Asignaturas Personalizadas

## ✅ LO QUE SE HA AÑADIDO

### 1. Tab "Subir Material"
Ahora puedes subir archivos (PDFs, imágenes, Word) que luego se pueden usar para generar fichas personalizadas.

### 2. Tab "Mis Asignaturas"
Puedes añadir asignaturas personalizadas como:
- Gallego
- Catalán
- Euskera
- Cualquier otra

### 3. Nueva Interfaz con Pestañas
El "Generador IA" ahora tiene 3 pestañas:
1. **Generar Ficha** - Generador de ejercicios con IA (funcionalidad original)
2. **Subir Material** - Sube PDFs, imágenes o documentos Word
3. **Mis Asignaturas** - Gestiona asignaturas personalizadas

## 📋 PASO 1: Aplicar Migration 014 en Supabase

**IMPORTANTE:** Antes de hacer el build, debes aplicar la migración de base de datos.

1. Ve a **Supabase Dashboard** > **SQL Editor** > **New query**

2. Copia y pega esta SQL:

```sql
-- Migration 014: Custom Subjects & Materials

-- 1. Tabla para asignaturas personalizadas
CREATE TABLE IF NOT EXISTS public.custom_subjects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    subject_name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, subject_name)
);

ALTER TABLE public.custom_subjects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own subjects"
    ON public.custom_subjects
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 2. Tabla materials (si no existe)
CREATE TABLE IF NOT EXISTS public.materials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT,
    subject TEXT,
    url TEXT,
    date TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.materials ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'materials' 
        AND policyname = 'Users can manage their own materials'
    ) THEN
        CREATE POLICY "Users can manage their own materials"
            ON public.materials
            FOR ALL
            USING (auth.uid() = user_id)
            WITH CHECK (auth.uid() = user_id);
    END IF;
END $$;

-- 3. Índices
CREATE INDEX IF NOT EXISTS idx_custom_subjects_user ON public.custom_subjects(user_id);
CREATE INDEX IF NOT EXISTS idx_materials_user ON public.materials(user_id);
CREATE INDEX IF NOT EXISTS idx_materials_subject ON public.materials(subject);
```

3. Haz clic en **Run**

4. Deberías ver "Success. No rows returned"

## 📋 PASO 2: Configurar Supabase Storage (Para Subir Archivos)

Para que funcione el upload de archivos, necesitas un **bucket de Storage**:

1. Ve a **Storage** en tu dashboard de Supabase

2. Haz clic en **Create a new bucket**

3. Configura:
   - **Name:** `materials`
   - **Public bucket:** ✅ Sí (para que los archivos sean accesibles)

4. Haz clic en **Create bucket**

5. Ve a la pestaña **Policies** del bucket y añade esta policy:

```sql
CREATE POLICY "Users can upload their own materials"
ON storage.objects FOR INSERT
TO public
WITH CHECK (
    bucket_id = 'materials' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own materials"
ON storage.objects FOR SELECT
TO public
USING (
    bucket_id = 'materials' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);
```

## 📋 PASO 3: Build y Deploy

Ahora sí, haz el build:

```bash
npm run build
```

Luego sube el contenido de `build/` a Hostinger como hiciste antes.

## ✨ CÓMO USAR LAS NUEVAS FUNCIONALIDADES

### Para añadir "Gallego" (o cualquier asignatura):

1. Entra a la app
2. Ve a "Generador IA"
3. Haz clic en la pestaña **"Mis Asignaturas"**
4. Escribe "Gallego" en el campo
5. Haz clic en "Añadir"
6. ✅ Ahora "Gallego" aparecerá en el desplegable de asignaturas

### Para subir material:

1. Ve a "Generador IA"
2. Haz clic en la pestaña **"Subir Material"**
3. Selecciona un archivo (PDF, JPG, PNG o DOCX)
4. Haz clic en "Subir y Guardar"
5. ✅ El archivo se guardará y podrás usarlo en "Generar Ficha"

---

**Estado:** Listo para aplicar y desplegar
**Archivos creados:** 4 componentes nuevos + 1 migración SQL
