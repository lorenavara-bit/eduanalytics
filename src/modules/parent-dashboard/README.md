# 👨‍👩‍👧 Módulo 3: Dashboard Padres

## Responsabilidad
Panel de control para supervisión parental.

## Componentes
- `ParentOverview.js` - Vista general de todos los hijos
- `ChildCard.js` - Tarjeta resumen por hijo
- `ProgressChart.js` - Gráfico de evolución académica
- `TaskAssigner.js` - Asignador de deberes/tareas
- `AlertsPanel.js` - Notificaciones y alertas educativas

## Datos Mostrados
- Tiempo de estudio diario/semanal
- Notas promedio por asignatura
- Tareas pendientes/completadas
- Alertas de dificultades detectadas

## Estado Actual
⚠️ Dashboard muestra datos "mock" (no conectado a BD real)
❌ Error SQL en vinculación padre-hijo (parent_child_links)
🔨 Próximo: Arreglar RLS policies y conectar datos reales
