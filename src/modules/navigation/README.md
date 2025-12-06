# 🧭 Módulo 5: Navegación y UX

## Responsabilidad
Layouts, menús, tabs, rutas y flujos de usuario.

## Componentes
- `AppLayout.js` - Layout raíz con header/footer
- `StudentLayout.js` - Layout con tabs para alumnos
- `ParentLayout.js` - Layout con sidebar para padres
- `TabNavigation.js` - Sistema de pestañas reutilizable
- `Breadcrumbs.js` - Migas de pan (próximo)

## Rutas Principales
- `/` - Landing page
- `/app/student/*` - Zona estudiante
- `/app/parent/*` - Zona padres
- `/unauthorized` - Error 403

## Estado Actual
✅ Routing básico funcional
⚠️ Falta loader/spinner global entre páginas
🔨 Próximo: Añadir transiciones suaves con framer-motion
