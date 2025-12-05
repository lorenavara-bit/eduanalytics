-- =====================================================
-- SCRIPT PARA ARREGLAR POLÍTICAS DEL BUCKET AVATARS
-- =====================================================

-- PASO 1: Ver todas las políticas actuales relacionadas con avatars
SELECT policyname, cmd, roles
FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage'
AND (policyname LIKE '%avatar%' OR policyname LIKE '%Avatar%');

-- =====================================================
-- PASO 2: ELIMINAR TODAS LAS POLÍTICAS EXISTENTES
-- =====================================================
-- Ejecuta estas una por una y copia EXACTAMENTE los nombres que viste en PASO 1

-- Intenta eliminar las políticas con todos los nombres posibles
DROP POLICY IF EXISTS "Users can upload own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Avatars are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own avatar" ON storage.objects;

-- =====================================================
-- PASO 3: VERIFICAR QUE SE ELIMINARON
-- =====================================================
SELECT policyname 
FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage'
AND (policyname LIKE '%avatar%' OR policyname LIKE '%Avatar%');

-- Si este query devuelve resultados vacíos, continúa al PASO 4
-- Si todavía ves políticas, copia el nombre EXACTO y ejecuta:
-- DROP POLICY IF EXISTS "NOMBRE_EXACTO_AQUI" ON storage.objects;

-- =====================================================
-- PASO 4: VERIFICAR CONFIGURACIÓN DEL BUCKET
-- =====================================================
SELECT id, name, public, file_size_limit 
FROM storage.buckets 
WHERE id = 'avatars';

-- IMPORTANTE: Verifica que 'public' sea TRUE
-- Si es FALSE, ejecuta esto:
UPDATE storage.buckets 
SET public = true 
WHERE id = 'avatars';

-- =====================================================
-- PASO 5: CREAR NUEVAS POLÍTICAS CORRECTAS
-- =====================================================

-- Política 1: INSERT (subir avatares)
CREATE POLICY "avatar_upload_policy"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Política 2: SELECT (ver avatares públicamente)
CREATE POLICY "avatar_select_policy"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');

-- Política 3: UPDATE (actualizar propios avatares)
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

-- Política 4: DELETE (eliminar propios avatares)
CREATE POLICY "avatar_delete_policy"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- =====================================================
-- PASO 6: VERIFICACIÓN FINAL
-- =====================================================

-- Ver bucket
SELECT id, name, public, file_size_limit 
FROM storage.buckets 
WHERE id = 'avatars';
-- Debe mostrar: public = true

-- Ver políticas creadas
SELECT policyname, cmd, roles
FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage'
AND policyname LIKE '%avatar%'
ORDER BY policyname;
-- Debes ver exactamente 4 políticas:
-- - avatar_delete_policy (DELETE, authenticated)
-- - avatar_insert_policy (INSERT, authenticated)  
-- - avatar_select_policy (SELECT, public)
-- - avatar_update_policy (UPDATE, authenticated)

-- =====================================================
-- RESUMEN DE LO QUE DEBES VER:
-- =====================================================
-- ✅ Bucket 'avatars' con public = TRUE
-- ✅ 4 políticas activas para avatares
-- ✅ Política SELECT permite acceso público
-- ✅ Otras políticas solo para usuarios autenticados
