# 🚀 Guía de Despliegue Automático en Hostinger (GitHub Actions)

He configurado un sistema profesional para que **cada vez que guardes cambios en GitHub, se actualice tu web en Hostinger automáticamente**.

## Pasos para activar el sistema:

### 1. Obtener credenciales FTP de Hostinger
1. Ve a tu panel de **Hostinger**.
2. Ve a **Tablero** (Dashboard) del sitio web -> **Archivos** -> **Cuentas FTP**.
3. Anota estos 3 datos:
   - **Hostname** (ej: `ftp.midominio.com` o una IP)
   - **Usuario** (ej: `u123456789`)
   - **Contraseña** (la que definiste o cambiaste ahí)

### 2. Configurar Secretos en GitHub
1. Ve a tu repositorio en GitHub: `https://github.com/lorenavara-bit/eduanalytics`
2. Clic en **Settings** (pestaña superior derecha).
3. En el menú izquierdo: **Secrets and variables** -> **Actions**.
4. Clic en el botón verde **New repository secret**.
5. Crea estos 3 secretos (copia y pega los nombres exactos):

   | Nombre del Secreto | Valor a poner |
   |--------------------|---------------|
   | `FTP_SERVER`       | El Hostname de Hostinger |
   | `FTP_USERNAME`     | El Usuario FTP |
   | `FTP_PASSWORD`     | La Contraseña FTP |

### 3. Subir el código por primera vez
En tu terminal (VS Code), ejecuta esto para subir la configuración que acabo de crear:

```powershell
git add .
git commit -m "Configurar despliegue automatico Hostinger"
git push -u origin main
```

*(Si te pide credenciales, ponlas. Si falla por algún conflicto, avísame).*

---

### 🎉 ¡Listo!
Ahora, cada vez que hagas un `git push`, GitHub:
1. Descargará tu código.
2. Instalará todo y creará la versión optimizada (`npm run build`).
3. Se conectará a tu Hostinger y subirá **solo** los archivos nuevos a `public_html`.

Puedes ver el progreso en la pestaña **Actions** de tu repositorio en GitHub.
