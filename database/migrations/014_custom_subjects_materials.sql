-- =====================================================
-- MIGRATION 014: Custom Subjects & File Upload Support
-- Description: Añadir asignaturas personalizadas y fix materials table
-- =====================================================

-- 1. Tabla para asignaturas personalizadas del usuario
CREATE TABLE IF NOT EXISTS public.custom_subjects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    subject_name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Evitar duplicados por usuario
    UNIQUE(user_id, subject_name)
);

-- 2. Enable RLS
ALTER TABLE public.custom_subjects ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policy
CREATE POLICY "Users can manage their own subjects"
    ON public.custom_subjects
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 4. Verificar/crear tabla materials si no existe
CREATE TABLE IF NOT EXISTS public.materials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT, -- MIME type (application/pdf, image/jpeg...)
    subject TEXT,
    url TEXT, -- Public URL from Supabase Storage
    date TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Enable RLS en materials
ALTER TABLE public.materials ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policy para materials (si no existe)
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

-- 7. Índices
CREATE INDEX IF NOT EXISTS idx_custom_subjects_user ON public.custom_subjects(user_id);
CREATE INDEX IF NOT EXISTS idx_materials_user ON public.materials(user_id);
CREATE INDEX IF NOT EXISTS idx_materials_subject ON public.materials(subject);
