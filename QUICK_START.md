# 🚀 Quick Deploy - EduAnalytics

## 📦 Para hacer Deploy AHORA (método rápido actual):

### En Windows:
```powershell
# Opción 1: Doble click en el archivo
deploy.ps1

# Opción 2: Desde PowerShell
.\deploy.ps1
```

Esto hará:
1. ✅ Build de producción
2. ✅ Crear ZIP con timestamp: `eduanalytics-build-2025-12-01_2345.zip`
3. ✅ Abrir carpeta con el ZIP

Luego:
1. Ve a Hostinger File Manager
2. Sube el ZIP a `public_html/`
3. Descomprímelo
4. ¡Listo!

---

## ☁️ Para guardar tu código en la nube (hacerlo UNA VEZ):

Ver archivo: **`GITHUB_SETUP.md`**

Pasos resumidos:
```powershell
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/TU_USUARIO/eduanalytics-app.git
git push -u origin main
```

---

## 💻 Para trabajar desde otro ordenador:

```powershell
# Clonar (primera vez)
git clone https://github.com/TU_USUARIO/eduanalytics-app.git
cd eduanalytics-app
npm install

# Trabajar
npm start

# Hacer deploy
.\deploy.ps1
```

---

## 🔄 Flujo diario (después de configurar GitHub):

### Al terminar de trabajar:
```powershell
git add .
git commit -m "Descripción de cambios"
git push
```

### Al empezar de trabajar (desde otro PC):
```powershell
git pull
```

---

## 📝 Comandos útiles:

```powershell
# Desarrollo local
npm start

# Build de producción
npm run build

# Deploy completo (build + zip)
.\deploy.ps1

# Ver estado de Git
git status

# Ver cambios
git diff

# Ver historial
git log --oneline
```

---

## ✅ Checklist primera configuración:

- [ ] Crear cuenta GitHub (si no tienes)
- [ ] Seguir `GITHUB_SETUP.md`
- [ ] Subir código con `git push`
- [ ] Probar deploy con `.\deploy.ps1`
- [ ] Subir a Hostinger y verificar

¡Listo para trabajar desde cualquier lado! 🎉
