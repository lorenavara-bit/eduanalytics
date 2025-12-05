-- Script para verificar y crear el bucket de avatares en Supabase
-- Ejecuta este script en el SQL Editor de tu proyecto de Supabase

-- =====================================================
-- PASO 1: Verificar si el bucket 'avatars' existe
-- =====================================================
SELECT * FROM storage.buckets WHERE id = 'avatars';

-- Si no ves ningún resultado, significa que el bucket NO existe
-- Si ves un resultado, el bucket YA existe

-- =====================================================
-- PASO 2: Crear el bucket (solo si NO existe)
-- =====================================================
-- IMPORTANTE: Solo ejecuta esto si el PASO 1 no devolvió resultados

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',                    -- id del bucket
  'avatars',                    -- nombre del bucket
  true,                         -- público = true (IMPORTANTE)
  2097152,                      -- límite de 2MB (2 * 1024 * 1024 bytes)
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']  -- solo imágenes
)
ON CONFLICT (id) DO NOTHING;  -- No hace nada si ya existe

-- =====================================================
-- PASO 3: Verificar las políticas existentes
-- =====================================================
SELECT * FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage'
AND policyname LIKE '%avatar%';

-- =====================================================
-- PASO 4: Eliminar políticas antiguas (si existen)
-- =====================================================
DROP POLICY IF EXISTS "Users can upload their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Avatars are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatars" ON storage.objects;

-- =====================================================
-- PASO 5: Crear nuevas políticas
-- =====================================================

-- Política 1: Permitir subir avatares (INSERT)
CREATE POLICY "Users can upload their own avatars"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Política 2: Permitir ver avatares públicamente (SELECT)
CREATE POLICY "Avatars are publicly accessible"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');

-- Política 3: Permitir actualizar propios avatares (UPDATE)
CREATE POLICY "Users can update their own avatars"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Política 4: Permitir eliminar propios avatares (DELETE)
CREATE POLICY "Users can delete their own avatars"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- =====================================================
-- PASO 6: Verificar que todo se creó correctamente
-- =====================================================

-- Verificar bucket
SELECT id, name, public, file_size_limit, allowed_mime_types 
FROM storage.buckets 
WHERE id = 'avatars';

-- Verificar políticas
SELECT policyname, cmd, roles, qual, with_check
FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage'
AND policyname LIKE '%avatar%'
ORDER BY policyname;

-- =====================================================
-- RESULTADO ESPERADO
-- =====================================================
-- Deberías ver:
-- 1. Un bucket llamado 'avatars' con public = true
-- 2. Cuatro políticas para avatares (INSERT, SELECT, UPDATE, DELETE)
