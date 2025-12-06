# 🏗️ ARQUITECTURA MODULAR - EDUANALYTICS

## 📁 Estructura de Módulos

```
src/
├── modules/              # Módulos de funcionalidad (Feature-Based)
│   ├── auth/            # Módulo 1: Autenticación y roles
│   ├── generator/       # Módulo 2: Generador IA de fichas
│   ├── parent-dashboard/# Módulo 3: Dashboard padres
│   ├── student-ui/      # Módulo 4: Interfaz estudiante
│   ├── navigation/      # Módulo 5: Layouts y navegación
│   ├── analytics/       # Módulo 6: Métricas educativas
│   ├── database/        # Módulo 7: Persistencia y queries
│   └── config/          # Módulo 8: Configuración currículos
│
├── shared/              # Código compartido
│   ├── components/      # Componentes UI reutilizables
│   ├── hooks/           # Custom hooks
│   └── utils/           # Funciones helper y constantes
│
├── App.js               # Punto de entrada y router principal
├── index.js             # Bootstrap de React
└── index.css            # Estilos globales
```

## 🎯 Principios de Arquitectura

### 1. Feature-Based (No por Tipo)
❌ MAL: `components/`, `pages/`, `contexts/` todo mezclado
✅ BIEN: Cada módulo tiene sus propios componentes, hooks y lógica

### 2. Independencia de Módulos
- Cada módulo puede funcionar de forma autónoma
- Las dependencias entre módulos van a través de `shared/`
- Favorece el mantenimiento y testing

### 3. Responsabilidad Única
- Un módulo = Una funcionalidad de negocio
- Fácil de rastrear bugs (si falla login, miras `auth/`)

### 4. Escalabilidad
- Añadir nuevos módulos no rompe los existentes
- Equipo puede trabajar en módulos distintos sin conflictos

## 🔀 Flujo de Datos

```
User Action
    ↓
Component (modules/*)
    ↓
Custom Hook (shared/hooks/)
    ↓
Service (modules/database/services/)
    ↓
Supabase
```

## 📦 Convenciones de Nombres

- **Componentes**: PascalCase (`StudentProfile.js`)
- **Hooks**: camelCase con `use` (`useAuth.js`)
- **Utils**: camelCase (`formatDate.js`)
- **Módulos**: kebab-case (`parent-dashboard/`)

## 🚀 Próximos Pasos de Migración

1. ✅ Crear estructura de carpetas
2. ✅ Documentar cada módulo
3. ⏳ Mover archivos existentes a módulos
4. ⏳ Actualizar imports en toda la app
5. ⏳ Crear archivo de barrel exports (`index.js`) por módulo
6. ⏳ Testing de integridad

## 📝 Notas para el Equipo

- **NUNCA** importes directamente de otro módulo (`import X from '../auth/Component'`)
- **SIEMPRE** usa barrel exports (`import { X } from '@/modules/auth'`)
- **DOCUMENTA** cada componente nuevo con comentarios JSDoc
- **TESTEA** cada módulo de forma aislada

---
**Última actualización:** 2025-12-06
**Autor:** Antigravity AI + Lorena (Product Owner)
