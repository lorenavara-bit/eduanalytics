# 📅 Calendario de Organización - Documentación Completa

## Resumen
El nuevo módulo de Calendario permite a los estudiantes organizar sus deberes, exámenes y sesiones de estudio de forma visual e interactiva.

## Funcionalidades Principales

### 1. Vista de Calendario Mensual
- ✅ Navegación entre meses
- ✅ Vista completa del mes actual
- ✅ Eventos codificados por colores
- ✅ Indicador visual del día actual
- ✅ Múltiples eventos por día

### 2. Tipos de Eventos
| Tipo | Icono | Color | Descripción |
|------|-------|-------|-------------|
| **Deberes** | 📚 | Azul `#3B82F6` | Tareas y deberes para casa |
| **Examen** | 📝 | Rojo `#EF4444` | Exámenes y pruebas |
| **Sesión de Estudio** | 📖 | Morado `#8B5CF6` | Tiempo de estudio planificado |
| **Proyecto** | 🎯 | Naranja `#F59E0B` | Trabajos y proyectos largos |
| **Otro** | 📌 | Gris `#6B7280` | Otros eventos |

### 3. Gestión de Eventos

#### Crear Evento
1. Haz clic en un día del calendario o en el botón **"+ Nuevo Evento"**
2. Completa el formulario modal:
   - **Título** (requerido): ej. "Entregar trabajo de Ciencias"
   - **Tipo** (requerido): Selecciona entre los 5 tipos
   - **Asignatura** (opcional): ej. "Matemáticas"
   - **Fecha** (requerido): Selecciona en el calendario
   - **Hora** (opcional): Inicio y fin
   - **Prioridad**: Baja, Media, Alta
   - **Descripción** (opcional): Detalles adicionales
   - **Recordatorio**: Días de antelación (0-7 días)
3. Haz clic en **"Guardar"**

#### Editar Evento
1. Haz clic en un evento del calendario o de la lista
2. Modifica los campos necesarios
3. Haz clic en **"Actualizar"**

#### Eliminar Evento
1. Haz clic en un evento para abrirlo
2. Haz clic en **"Eliminar"**
3. Confirma la eliminación

#### Marcar como Completado
1. En la lista de próximos eventos, haz clic en el ✓ 
2. El evento se marca como completado y se atempera visualmente

### 4. Panel Lateral "Próximos 7 Días"
- Muestra eventos de los próximos 7 días
- Solo eventos pendientes (no completados)
- Información visible:
  - Icono del tipo de evento
  - Título y asignatura
  - Días hasta el evento
  - Prioridad (badge de color)
  - Estado (marcar como completado)

### 5. Prioridades
| Nivel | Color | Badge | Uso |
|-------|-------|-------|-----|
| **Baja** | Gris | `bg-gray-200` | Tareas opcionales |
| **Media** | Azul | `bg-blue-200` | Tareas normales |
| **Alta** | Rojo | `bg-red-200` | Exámenes importantes |

### 6. Recordatorios
Configurable al crear/editar evento:
- **Mismo día** (0 días antes)
- **1 día antes**
- **2 días antes**
- **3 días antes**
- **1 semana antes** (7 días)

> **Nota**: Actualmente los recordatorios no envían notificaciones push. Se muestran en el panel lateral "Próximos 7 Días".

## Integración con Fichas Guardadas

### Link Automático (Futuro)
Cuando guardas una ficha desde "Analizar Asignatura":
- [ ] Opción para añadir automáticamente al calendario
- [ ] Pre-rellenar tipo, asignatura y fecha sugerida
- [ ] Vincular ficha con evento (`linked_worksheet_id`)

### Acceso Rápido (Futuro)
Desde el calendario:
- [ ] Ver ficha vinculada directamente
- [ ] Marcar ficha como "estudiada" al completar el evento

## Base de Datos

### Tabla: `calendar_events`
```sql
CREATE TABLE calendar_events (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    event_type TEXT NOT NULL,  -- 'homework', 'exam', 'study_session', 'project', 'other'
    subject TEXT,
    event_date DATE NOT NULL,
    start_time TIME,
    end_time TIME,
    status TEXT NOT NULL DEFAULT 'pending',  -- 'pending', 'in_progress', 'completed', 'cancelled'
    priority TEXT DEFAULT 'medium',  -- 'low', 'medium', 'high'
    color TEXT DEFAULT '#4F46E5',
    reminder_days INTEGER DEFAULT 0,
    linked_worksheet_id UUID,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### RLS Policies
- ✅ Los usuarios solo pueden ver sus propios eventos
- ✅ Los usuarios solo pueden crear, editar y eliminar sus eventos
- ✅ Trigger automático para `updated_at`

## Archivos Creados

| Archivo | Descripción |
|---------|-------------|
| `src/components/Calendar.js` | Componente React principal (500+ líneas) |
| `database/migrations/010_calendar_events.sql` | Migración SQL |
| `database/APPLY_MIGRATION_010.md` | Instrucciones de instalación |
| `DATABASE_CALENDAR_DOCS.md` | Esta documentación |

## Modificaciones en App.js

### Cambios Realizados:
1. **Import del componente**:
   ```javascript
   import Calendar from './components/Calendar';
   import { Calendar as CalendarIcon } from 'lucide-react';
   ```

2. **Nuevo Tab en navegación**:
   ```javascript
   const tabs = [
     // ...otros tabs
     { id: 'calendar', name: 'Mi Agenda', icon: CalendarIcon },
   ];
   ```

3. **Renderizado condicional**:
   ```javascript
   {activeTab === 'calendar' && (
     <Calendar session={session} userProfile={userProfile} />
   )}
   ```

## UI/UX Highlights

### Calendario Mensual
- Grid responsive 7x6 (semanas)
- Días del mes anterior/siguiente atenuados
- Día actual destacado con border azul y fondo indigo
- Eventos truncados con tooltip al hover
- Click en día vacío para crear evento
- Indicador "+X más" si hay más de 2 eventos

### Modal de Evento
- Diseño limpio y moderno
- Botones de tipo con iconos grandes
- Validación de campos required
- Fecha precargada al hacer click en día
- Confirmación al eliminar

### Colores y Accesibilidad
- Contraste WCAG AA compliant
- Colores distintivos por tipo
- Iconos para usuarios con daltonismo
- Tooltips descriptivos

## Mejoras Futuras (Roadmap)

### Nivel 1 - Básico (Próxima Versión)
- [ ] Notificaciones push reales (Web Push API)
- [ ] Sincronización con Google Calendar
- [ ] Exportar a .ics (iCalendar)
- [ ] Vista semanal/diaria

### Nivel 2 - Intermedio
- [ ] Arrastrar y soltar eventos entre días
- [ ] Repetir eventos (semanal, mensual)
- [ ] Plantillas de eventos rápidos
- [ ] Estadísticas de productividad

### Nivel 3 - Avanzado
- [ ] IA sugiere horarios de estudio óptimos
- [ ] Alertas de sobrecarga (demasiados deberes)
- [ ] Compartir eventos con padres/profesores
- [ ] Integración con sistema de recompensas/gamificación

## Uso Típico

### Escenario 1: Organizar Semana de Exámenes
```
Lunes 10/12: Examen de Mates
├─ Tipo: Examen
├─ Prioridad: Alta
├─ Recordatorio: 2 días antes
└─ Sesión de estudio previa: Sábado 8/12

Miércoles 12/12: Entregar trabajo de Ciencias
├─ Tipo: Proyecto
├─ Prioridad: Alta
└─ Link a ficha guardada: "Cuerpo Humano - Aparato Digestivo"

Viernes 14/12: Deberes de Lengua
├─ Tipo: Deberes
├─ Prioridad: Media
└─ Notas: "Ejercicios página 45-50"
```

### Escenario 2: Planificar Estudio Mensual
Usuario planifica:
- 3 sesiones de estudio semanales (Lun, Mié, Vie 17:00-18:30)
- Exámenes finales marcados con 1 semana de antelación
- Proyectos divididos en hitos semanales

## Preguntas Frecuentes

**P: ¿Los eventos se guardan automáticamente?**  
R: Sí, cada vez que creas/editas un evento, se guarda inmediatamente en Supabase.

**P: ¿Puedo ver eventos de otros meses?**  
R: Sí, usa las flechas < > en el header del calendario para navegar entre meses.

**P: ¿Los recordatorios envían notificaciones?**  
R: Actualmente no. Los eventos próximos se muestran en el panel lateral. Las notificaciones push se implementarán próximamente.

**P: ¿Puedo vincular una ficha guardada a un evento?**  
R: La funcionalidad está preparada en la base de datos (`linked_worksheet_id`) pero aún no está implementada en la UI. Próximamente.

**P: ¿Hay límite de eventos que puedo crear?**  
R: No, puedes crear tantos eventos como necesites.

**P: ¿Qué pasa con los eventos pasados?**  
R: Los eventos pasados se mantienen en la base de datos pero no se muestran en "Próximos 7 Días". Puedes verlos navegando a meses anteriores.

## Soporte y Feedback

Si encuentras algún bug o tienes sugerencias de mejora, por favor:
1. Revisa la consola del navegador (F12) para errores
2. Verifica que la migración 010 se aplicó correctamente
3. Comprueba que tienes conexión con Supabase

---

**Fecha de creación**: 2025-12-05  
**Versión**: 1.0.0  
**Estado**: ✅ Completamente funcional
