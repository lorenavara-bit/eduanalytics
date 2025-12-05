# EduAnalytics - Setup con GitHub

## 🌟 Configuración Inicial (Solo una vez)

### Paso 1: Crear repositorio en GitHub

1. Ve a [https://github.com/new](https://github.com/new)
2. Nombre: `eduanalytics-app`
3. **Privado** (si no quieres que sea público)
4. NO marques "Add README" (ya tienes archivos)
5. Click "Create repository"

### Paso 2: Subir tu código (desde tu laptop actual)

Abre PowerShell en la carpeta del proyecto y ejecuta:

```powershell
# Inicializar Git (si no está ya)
git init

# Añadir todos los archivos
git add .

# Primer commit
git commit -m "Initial commit - EduAnalytics App"

# Conectar con GitHub (reemplaza TU_USUARIO con tu usuario de GitHub)
git branch -M main
git remote add origin https://github.com/TU_USUARIO/eduanalytics-app.git

# Subir todo a GitHub
git push -u origin main
```

**Nota**: Te pedirá usuario/contraseña de GitHub. Si tienes 2FA, necesitas un [Personal Access Token](https://github.com/settings/tokens).

---

## 💻 Trabajar desde Otro Ordenador

En cualquier otro PC:

```powershell
# Clonar el repositorio
git clone https://github.com/TU_USUARIO/eduanalytics-app.git

# Entrar a la carpeta
cd eduanalytics-app

# Instalar dependencias
npm install

# Trabajar normalmente
npm start
```

---

## 🔄 Flujo de Trabajo Diario

### Desde el PC donde haces cambios:

```powershell
# Guardar cambios en GitHub
git add .
git commit -m "Descripción de los cambios"
git push
```

### Desde otro PC (para obtener los últimos cambios):

```powershell
# Actualizar código
git pull
```

---

## 🚀 Hacer Deploy (Build + ZIP)

Simplemente ejecuta el script `deploy.ps1` (lo creo en el siguiente archivo).

Ver: `deploy.ps1` para automatizar todo.

---

## 📋 Archivo .gitignore

Ya deberías tener `.gitignore` para NO subir a GitHub:
- `node_modules/` (pesado, se instala con npm install)
- `build/` (se genera cada vez)
- `.env` (secretos)

Si no lo tienes, créalo con ese contenido.

---

## ✅ Ventajas

✅ Código respaldado en la nube
✅ Histórico de cambios
✅ Trabajo desde cualquier PC
✅ Colaboración fácil (si añades más personas)
✅ No pierdes código si se daña el laptop
