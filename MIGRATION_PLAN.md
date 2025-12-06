# 📋 PLAN DE MIGRACIÓN MODULAR

## ✅ COMPLETADO

### Fase 0: Estructura Base
- ✅ Creada estructura de carpetas `src/modules/`
- ✅ Documentado cada módulo con README.md
- ✅ Creado documento maestro ARCHITECTURE.md
- ✅ Arreglado problema de tabs duplicados (Subir/Analizar → Generador IA)

## 🔄 EN PROGRESO

### Fase 1: Migración de Navegación (Módulo 5)
**Prioridad:** ALTA - Afecta a toda la app

1. [ ] Mover archivos:
   - `src/layouts/` → `src/modules/navigation/layouts/`
   - `src/StudentApp.js` → `src/modules/navigation/routes/StudentRoutes.js`
   - Crear `ParentRoutes.js`

2. [ ] Crear `src/modules/navigation/index.js`:
```js
export { default as AppLayout } from './layouts/AppLayout';
export { default as StudentLayout } from './layouts/StudentLayout';
export { default as ParentLayout } from './layouts/ParentLayout';
```

### Fase 2: Migración de Autenticación (Módulo 1)
**Prioridad:** ALTA - Bloquea Módulo "Family Profiles"

1. [ ] Mover archivos:
   - `src/Auth.js` → `src/modules/auth/components/Login.js`
   - `src/contexts/RoleContext.js` → `src/modules/auth/contexts/RoleContext.js`
   - `src/pages/Unauthorized.js` → `src/modules/auth/pages/Unauthorized.js`

2. [ ] Crear nuevos:
   - `src/modules/auth/components/ProfileSelector.js` (Pantalla Netflix)
   - `src/modules/auth/hooks/useAuth.js`

### Fase 3: Migración del Generador (Módulo 2)
**Prioridad:** MEDIA

1. [ ] Mover:
   - `src/components/WorksheetGeneratorComplete.js` → `src/modules/generator/components/WorksheetGenerator.js`
   - `src/contexts/AIFunctionContext.js` → `src/modules/generator/services/geminiService.js`

2. [ ] Dividir en sub-componentes:
   - `QuestionRenderer.js` - Renderiza una pregunta
   - `AnswerInput.js` - Input según tipo
   - `CorrectionDisplay.js` - Muestra feedback

### Fase 4: Migración de Student UI (Módulo 4)
**Prioridad:** MEDIA

1. [ ] Mover:
   - `src/components/StudentProfile.js` → `src/modules/student-ui/components/StudentProfile.js`
   - `src/components/Calendar.js` → `src/modules/student-ui/components/Calendar.js`
   - `src/components/ResourcesLibrary.js` → `src/modules/student-ui/components/ResourcesLibrary.js`

### Fase 5: Migración de Parent Dashboard (Módulo 3)
**Prioridad:** BAJA (Resolver BD primero)

1. [ ] Mover:
   - `src/components/ParentDashboard.js` → `src/modules/parent-dashboard/components/ParentOverview.js`
   - `src/components/ParentChildLinks.js` → `src/modules/parent-dashboard/components/LinkManager.js`

### Fase 6: Migración de Analytics (Módulo 6)
**Prioridad:** BAJA

1. [ ] Mover:
   - `src/components/FeedbackDashboard.js` → `src/modules/analytics/components/FeedbackDashboard.js`

2. [ ] Crear:
   - `src/modules/analytics/services/analyticsService.js`

### Fase 7: Shared Components
**Prioridad:** MEDIA - Hacerlo mientras migramos

1. [ ] Crear componentes base:
   - `Button.js`
   - `Card.js`
   - `Modal.js`
   - `Spinner.js`
   - `Avatar.js`

2. [ ] Reemplazar código inline por componentes compartidos

### Fase 8: Database Services (Módulo 7)
**Prioridad:** ALTA

1. [ ] Crear servicios:
   - `profileService.js` - CRUD de perfiles
   - `worksheetService.js` - Gestión de fichas
   - `parentChildService.js` - Vinculación
   - `analyticsService.js` - Queries de métricas

2. [ ] Mover:
   - `src/supabaseClient.js` → `src/modules/database/client.js`
   - `src/contexts/StudentDataContext.js` → `src/modules/database/contexts/DataContext.js`

### Fase 9: Config (Módulo 8)
**Prioridad:** BAJA

1. [ ] Crear JSONs:
   - `curriculos/spain-primary.json`
   - `subjects.json`

## 🎯 ROADMAP DE EJECUCIÓN

### Semana 1 (Esta semana)
- ✅ Estructura creada
- 🔄 Migrar Navegación (Fase 1)
- 🔄 Arreglar tabs duplicados ✅
- 🔄 Aplicar Migration 013 (Family Profiles)

### Semana 2
- Migrar Autenticación (Fase 2)
- Implementar ProfileSelector estilo Netflix
- Migrar Generador (Fase 3)

### Semana 3
- Migrar Student UI (Fase 4)
- Crear componentes compartidos (Fase 7)
- Migrar Database Services (Fase 8)

### Semana 4
- Migrar Parent Dashboard (Fase 5)
- Migrar Analytics (Fase 6)
- Testing integral

## 🛠️ Comandos Útiles

```bash
# Buscar imports rotos después de mover archivos
npm run build

# Verificar que no quedan archivos antiguos
ls src/components  # Debería estar vacío al final
ls src/contexts    # Debería estar vacío al final
```

## ⚠️ ADVERTENCIAS

- **NO** mover todos los archivos a la vez. Ir módulo por módulo.
- **HACER COMMIT** después de cada fase completada.
- **TESTEAR** que la app sigue funcionando después de cada migración.
- **ACTUALIZAR IMPORTS** inmediatamente después de mover un archivo.

---
**Estado Actual:** Fase 0 completada, Fase 1 comenzando
**Última actualización:** 2025-12-06 10:55
