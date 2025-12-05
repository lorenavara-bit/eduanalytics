# Crear Bucket de Avatares en Supabase

## Problema
Al intentar subir una foto de perfil, aparece el error "bucket not found" porque el bucket `avatars` no existe en Supabase Storage.

## Solución: Crear el Bucket de Avatares

### Paso 1: Acceder a Supabase Storage

1. Ve a tu proyecto en [Supabase Dashboard](https://app.supabase.com)
2. En el menú lateral, haz clic en **Storage**
3. Verás una lista de buckets existentes (probablemente solo tengas `materials`)

### Paso 2: Crear el Bucket "avatars"

1. Haz clic en el botón **"New bucket"** (o "Create bucket")
2. Configura el nuevo bucket con estos valores:
   - **Name:** `avatars`
   - **Public bucket:** ✅ **SÍ** (marca esta casilla)
     - Esto es necesario para que las imágenes de avatar sean accesibles públicamente
   - **File size limit:** `2 MB` (opcional, ayuda a evitar archivos muy grandes)
   - **Allowed MIME types:** `image/*` (opcional, solo permite imágenes)
3. Haz clic en **"Create bucket"** o **"Save"**

### Paso 3: Configurar Políticas de Seguridad (RLS Policies)

Una vez creado el bucket, necesitas configurar las políticas de seguridad para que los usuarios puedan subir y ver sus avatares.

#### 3.1. Habilitar RLS (Row Level Security)
- Por defecto, RLS estará habilitado en el nuevo bucket

#### 3.2. Crear Política de INSERT (Subir avatares)

1. En la página del bucket `avatars`, ve a la pestaña **"Policies"**
2. Haz clic en **"New Policy"** → **"For full customization"** → **"Create policy"**
3. Configura la política:
   - **Policy name:** `Users can upload their own avatars`
   - **Allowed operation:** `INSERT`
   - **Target roles:** `authenticated`
   - **USING expression:** Déjalo vacío o usa `true`
   - **WITH CHECK expression:**
     ```sql
     (bucket_id = 'avatars') AND (auth.uid()::text = (storage.foldername(name))[1])
     ```
     Esto permite que los usuarios solo suban archivos en su propia carpeta (user_id)
4. Haz clic en **"Review"** y luego **"Save policy"**

#### 3.3. Crear Política de SELECT (Ver avatares)

1. Crea otra nueva política
2. Configura:
   - **Policy name:** `Avatars are publicly accessible`
   - **Allowed operation:** `SELECT`
   - **Target roles:** `public` (o `authenticated` si solo quieres que usuarios autenticados puedan verlos)
   - **USING expression:**
     ```sql
     bucket_id = 'avatars'
     ```
3. Haz clic en **"Review"** y luego **"Save policy"**

#### 3.4. Crear Política de UPDATE (Opcional - Actualizar avatares)

1. Crea otra nueva política
2. Configura:
   - **Policy name:** `Users can update their own avatars`
   - **Allowed operation:** `UPDATE`
   - **Target roles:** `authenticated`
   - **USING expression:**
     ```sql
     (bucket_id = 'avatars') AND (auth.uid()::text = (storage.foldername(name))[1])
     ```
3. Haz clic en **"Review"** y luego **"Save policy"**

#### 3.5. Crear Política de DELETE (Opcional - Eliminar avatares antiguos)

1. Crea otra nueva política
2. Configura:
   - **Policy name:** `Users can delete their own avatars`
   - **Allowed operation:** `DELETE`
   - **Target roles:** `authenticated`
   - **USING expression:**
     ```sql
     (bucket_id = 'avatars') AND (auth.uid()::text = (storage.foldername(name))[1])
     ```
3. Haz clic en **"Review"** y luego **"Save policy"**

### Paso 4: Verificar la Configuración

1. En la página de Storage, deberías ver ahora el bucket `avatars` marcado como **público**
2. Verifica que las políticas estén activas (deberían aparecer con un ícono verde)

### Paso 5: Probar la Subida de Avatar

1. Regresa a tu aplicación EduAnalytics
2. Recarga la página (F5)
3. Ve a la pestaña **Perfil**
4. Haz clic en el icono de cámara para subir una foto de perfil
5. Selecciona una imagen
6. Deberías ver el mensaje "¡Cambios guardados correctamente!"
7. La imagen debería aparecer en el círculo del avatar

## Alternativa: Creación mediante SQL

Si prefieres crear el bucket mediante SQL, puedes ejecutar esto en el **SQL Editor** de Supabase:

```sql
-- Crear el bucket (esto requiere privilegios de administrador)
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true);

-- Crear políticas de seguridad
CREATE POLICY "Users can upload their own avatars"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Avatars are publicly accessible"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');

CREATE POLICY "Users can update their own avatars"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own avatars"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
```

## Notas Importantes

- **Estructura de carpetas:** Los avatares se guardan con la estructura `user_id/random_filename.ext`
- **Bucket público:** El bucket `avatars` debe ser público para que las imágenes sean accesibles
- **Seguridad:** Las políticas aseguran que cada usuario solo puede modificar sus propios archivos
- **Límite de tamaño:** Considera establecer un límite de tamaño en el bucket para evitar archivos muy grandes

## ¿Problemas?

Si después de crear el bucket sigues teniendo problemas:

1. Verifica que el bucket se llama exactamente `avatars` (en minúsculas)
2. Confirma que el bucket es **público**
3. Revisa que las políticas estén habilitadas
4. Verifica en la consola del navegador (F12) si hay errores específicos
5. Comprueba que tu API key de Supabase sea correcta en el archivo `.env.local`
