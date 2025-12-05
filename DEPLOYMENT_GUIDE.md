# 🚀 Guía de Deployment - EduAnalytics

## 📦 Preparación del Build

El build de producción se genera con:
```bash
npm run build
```

Esto crea la carpeta `build/` con todos los archivos optimizados listos para producción.

---

## 🌐 Deployment en Hostinger

### Opción 1: Manual (FTP/File Manager)

1. **Accede a hPanel de Hostinger**
   - Ve a tu cuenta de Hostinger
   - Busca "File Manager" o usa un cliente FTP (FileZilla)

2. **Navega a la carpeta pública**
   - Generalmente: `public_html/` o `httpdocs/`
   - Para un subdominio: `public_html/eduanalytics/`

3. **Sube los archivos del build**
   - Sube **TODO** el contenido de la carpeta `build/`
   - **NO** subas la carpeta `build` en sí, solo su contenido
   - Deberías ver: `index.html`, `static/`, `manifest.json`, etc.

4. **Configura redirecciones (SPA)**
   - Crea/edita `.htaccess` en la carpeta raíz:

```apache
# .htaccess para React SPA
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteCond %{REQUEST_FILENAME} !-l
  RewriteRule . /index.html [L]
</IfModule>

# Compresión GZIP
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript application/json
</IfModule>

# Cache
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType image/jpg "access plus 1 year"
  ExpiresByType image/jpeg "access plus 1 year"
  ExpiresByType image/gif "access plus 1 year"
  ExpiresByType image/png "access plus 1 year"
  ExpiresByType text/css "access plus 1 month"
  ExpiresByType application/javascript "access plus 1 month"
</IfModule>
```

---

### Opción 2: GitHub + Auto-Deploy (Recomendado)

1. **Sube tu código a GitHub**
   ```bash
   git init
   git add .
   git commit -m "Deploy EduAnalytics"
   git branch -M main
   git remote add origin https://github.com/TU_USUARIO/eduanalytics-app.git
   git push -u origin main
   ```

2. **Conecta Hostinger con GitHub**
   - En hPanel, busca "Git Version Control" o similar
   - Conecta tu repositorio
   - Configura auto-deploy en push a `main`

3. **Script de Build en Hostinger**
   - Asegúrate de que Hostinger ejecute:
   ```bash
   npm install
   npm run build
   ```
   - Y copie `build/*` a `public_html/`

---

## 🔐 Configuración de Variables de Entorno

### Opción A: Build-time (Recomendado para React)

Crea `.env.production` en la raíz del proyecto:

```env
REACT_APP_SUPABASE_URL=https://tu-proyecto.supabase.co
REACT_APP_SUPABASE_ANON_KEY=tu-clave-anon
REACT_APP_DEFAULT_GEMINI_KEY=opcional-si-quieres-default
```

Rebuild con:
```bash
npm run build
```

### Opción B: Archivo de configuración

Si no puedes usar `.env`, crea `public/config.js`:

```javascript
window.ENV = {
  SUPABASE_URL: 'https://tu-proyecto.supabase.co',
  SUPABASE_ANON_KEY: 'tu-clave',
};
```

Y en `src/supabaseClient.js`, úsalo así:
```javascript
const supabaseUrl = window.ENV?.SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL;
```

---

## ✅ Checklist Pre-Deploy

- [ ] `.env.production` configurado con URLs correctas
- [ ] `npm run build` completa sin errores
- [ ] Migración `005_worksheets.sql` ejecutada en Supabase
- [ ] Bucket `materials` creado en Supabase Storage
- [ ] Políticas RLS configuradas en todas las tablas
- [ ] API Key de Gemini configurada (o users tienen la suya)
- [ ] `.htaccess` subido para rutas SPA
- [ ] HTTPS activado en Hostinger

---

## 🧪 Testing Post-Deploy

1. **Accede a tu URL** (ej: `https://eduanalytics.tudominio.com`)
2. **Prueba el login** con un usuario de prueba
3. **Sube un archivo** (verifica que Supabase Storage funcione)
4. **Genera un examen** desde un PDF/imagen
5. **Guarda un ejercicio** y recárgalo
6. **Verifica CORS**: Asegúrate de que Supabase permita tu dominio

---

## 🐛 Troubleshooting

### Error: "Failed to fetch" o CORS
- En Supabase Dashboard → Settings → API
- Añade tu dominio a "Allowed origins"
- Ej: `https://eduanalytics.tudominio.com`

### Las rutas no funcionan (404 en /analizar)
- Verifica que `.htaccess` esté correctamente subido
- Asegúrate de que mod_rewrite esté habilitado

### Storage no funciona
- Verifica políticas en Supabase Storage
- Asegúrate de que el bucket `materials` sea público o tenga RLS

### Gemini API no responde
- Verifica que la API Key esté en `.env.production`
- O que los usuarios puedan configurar la suya en Perfil

---

## 📊 Monitoreo

- **Logs de Supabase**: Dashboard → Logs
- **Network tab**: Chrome DevTools para debug
- **Console errors**: Revisa la consola del navegador

---

## 🎉 ¡Listo!

Tu aplicación EduAnalytics está ahora desplegada y accesible públicamente.

**URL de Ejemplo**: https://eduanalytics.tudominio.com

¡Disfruta! 🚀
