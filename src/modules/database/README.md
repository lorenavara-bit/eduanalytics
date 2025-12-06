# 💾 Módulo 7: Base de Datos

## Responsabilidad
Schemas, queries, servicios de persistencia y migraciones.

## Estructura
- `schemas/` - Definiciones de tablas (TypeScript types)
- `queries/` - Queries SQL reutilizables
- `services/` - Servicios de acceso a datos
- `migrations/` - Historial de cambios en BD

## Servicios Principales
- `profileService.js` - CRUD de perfiles
- `worksheetService.js` - Gestión de fichas
- `analyticsService.js` - Queries de métricas
- `parentChildService.js` - Vinculación familia

## Estado Actual
✅ Conexión Supabase operativa
❌ Políticas RLS bloqueando algunas operaciones
🔨 Próximo: Migración 013 (Family Profiles) pendiente de aplicar
