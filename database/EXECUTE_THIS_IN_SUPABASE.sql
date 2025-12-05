-- ========================================
-- COPIA Y PEGA TODO ESTE SCRIPT EN SQL EDITOR
-- ========================================

-- 1. Eliminar todas las políticas existentes de avatares
DROP POLICY IF EXISTS "Users can upload own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Avatars are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own avatar" ON storage.objects;
DROP POLICY IF EXISTS "avatar_upload_policy" ON storage.objects;
DROP POLICY IF EXISTS "avatar_select_policy" ON storage.objects;
DROP POLICY IF EXISTS "avatar_update_policy" ON storage.objects;
DROP POLICY IF EXISTS "avatar_delete_policy" ON storage.objects;

-- 2. Asegurar que el bucket avatars es público
UPDATE storage.buckets 
SET public = true 
WHERE id = 'avatars';

-- 3. Crear política INSERT (subir avatares)
CREATE POLICY "avatar_upload_policy"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 4. Crear política SELECT (ver avatares públicamente)
CREATE POLICY "avatar_select_policy"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');

-- 5. Crear política UPDATE (actualizar propios avatares)
CREATE POLICY "avatar_update_policy"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars' 
  AND (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'avatars' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 6. Crear política DELETE (eliminar propios avatares)
CREATE POLICY "avatar_delete_policy"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 7. Verificar que todo está correcto
SELECT 'Bucket configurado:' as status, id, name, public 
FROM storage.buckets 
WHERE id = 'avatars'
UNION ALL
SELECT 'Políticas creadas:' as status, policyname, cmd, ''
FROM pg_policies 
WHERE tablename = 'objects' 
AND policyname LIKE '%avatar%'
ORDER BY status DESC;
