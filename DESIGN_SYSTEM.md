# 🎨 Sistema de Diseño Unificado - EduAnalytics

## ✅ ¿Qué se ha implementado?

Se ha creado un **sistema de diseño completo y unificado** basado en el estilo de la landing page para mantener coherencia visual en toda la aplicación.

---

## 📂 Archivos Creados/Modificados

### 1. `src/index.css` - Variables CSS y Estilos Base
**Contenido:**
- ✅ Variables CSS para colores, sombras, bordes, espaciado
- ✅ Tipografía unificada (h1-h5, body-large, etc.)
- ✅ Utilidades de transiciones y hover
- ✅ Glassmorphism y gradientes
- ✅ Scrollbar personalizado
- ✅ Responsive breakpoints

### 2. `src/components/DesignSystem.js` - Componentes Reutilizables
**Componentes disponibles:**
- ✅ `Button` - 6 variantes, 3 tamaños
- ✅ `Card` - 4 variantes con Header/Content/Footer
- ✅ `Input` y `Textarea` - Con y sin iconos
- ✅ `Badge` - Para etiquetas y estados
- ✅ `Alert` - Alertas de info/success/warning/error
- ✅ `Spinner` - Indicador de carga
- ✅ `Container` - Contenedor responsive
- ✅ `Section` - Secciones de página

---

## 🎨 Variables CSS Disponibles

### Colores Principales
```css
--primary-blue: #3b82f6
--primary-purple: #8b5cf6
--gradient-primary: linear-gradient(135deg, #3b82f6, #8b5cf6)
```

### Colores de Fondo
```css
--bg-white: #ffffff
--bg-gray-50: #f8fafc
--bg-gradient-page: linear-gradient(135deg, #eff6ff 0%, #faf5ff 100%)
```

### Colores de Estado
```css
--success: #10b981
--warning: #f59e0b
--error: #ef4444
--info: #3b82f6
```

### Sombras
```css
--shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05)
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1)
--shadow-lg: 0 10px 25px -5px rgba(0, 0, 0, 0.1)
--shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1)
```

---

## 📚 Cómo Usar los Componentes

### Button

```jsx
import { Button } from './components/DesignSystem';

// Variantes
<Button variant="primary" size="lg">Guardar</Button>
<Button variant="secondary" size="md">Cancelar</Button>
<Button variant="ghost">Opciones</Button>
<Button variant="success">Confirmar</Button>
<Button variant="danger">Eliminar</Button>
<Button variant="outline">Ver más</Button>

// Con icono
<Button variant="primary">
  <Brain className="w-5 h-5 mr-2" />
  Generar con IA
</Button>

// Full width
<Button variant="primary" fullWidth>Botón completo</Button>
```

### Card

```jsx
import { Card, CardHeader, CardContent, CardFooter } from './components/DesignSystem';

// Tarjeta básica
<Card variant="default">
  <CardHeader>
    <h3 className="text-xl font-bold">Título</h3>
  </CardHeader>
  <CardContent>
    Contenido de la tarjeta
  </CardContent>
  <CardFooter>
    <Button variant="primary">Acción</Button>
  </CardFooter>
</Card>

// Tarjeta con gradiente
<Card variant="gradient">
  <CardContent>Tarjeta destacada</CardContent>
</Card>

// Tarjeta con efecto hover
<Card variant="default" hover>
  Haz hover aquí
</Card>

// Tarjeta glassmorphism
<Card variant="glass">
  Efecto cristal
</Card>
```

### Input

```jsx
import { Input, Textarea } from './components/DesignSystem';
import { Search, Mail } from 'lucide-react';

// Input básico
<Input 
  placeholder="Escribe aquí..."
  value={value}
  onChange={(e) => setValue(e.target.value)}
/>

// Input con icono
<Input 
  icon={<Search className="w-5 h-5" />}
  placeholder="Buscar..."
/>

// Input con error
<Input 
  error={true}
  placeholder="Campo requerido"
/>

// Textarea
<Textarea 
  rows={4}
  placeholder="Escribe tus observaciones..."
/>
```

### Badge

```jsx
import { Badge } from './components/DesignSystem';

<Badge variant="success">Completado</Badge>
<Badge variant="warning">Pendiente</Badge>
<Badge variant="danger">Error</Badge>
<Badge variant="gradient">Premium</Badge>
```

### Alert

```jsx
import { Alert } from './components/DesignSystem';
import { CheckCircle, AlertCircle } from 'lucide-react';

<Alert 
  variant="success" 
  icon={<CheckCircle className="w-5 h-5" />}
>
  ¡Ficha generada correctamente!
</Alert>

<Alert 
  variant="error"
  icon={<AlertCircle className="w-5 h-5" />}
  onClose={() => setShowAlert(false)}
>
  Hubo un error al guardar
</Alert>
```

### Container y Section

```jsx
import { Container, Section } from './components/DesignSystem';

<Section bgGradient>
  <Container>
    <h1>Título de la Sección</h1>
    <p>Contenido...</p>
  </Container>
</Section>
```

---

## 🎯 Clases de Utilidad CSS

### Tipografía
```jsx
<h1 className="text-5xl">Título Principal</h1>
<p className="body-large">Texto grande</p>
<p className="body-normal">Texto normal</p>
<p className="text-sm">Texto pequeño</p>
```

### Gradientes
```jsx
<div className="bg-gradient-primary">Con gradiente primario</div>
<div className="bg-gradient-page">Fondo de página</div>
```

### Glassmorphism
```jsx
<div className="glass">Efecto cristal claro</div>
<div className="glass-dark">Efecto cristal oscuro</div>
```

### Transiciones
```jsx
<div className="transition-all hover-shadow-lg hover-scale-105">
  Con efectos hover
</div>
```

---

## 🔄 Migración de Componentes Existentes

### ANTES (estilo antiguo):
```jsx
<div className="bg-indigo-500 text-white rounded-lg p-4 shadow-md">
  <h3 className="text-xl font-bold">Título</h3>
  <button className="bg-white text-indigo-600 px-4 py-2 rounded">
    Acción
  </button>
</div>
```

### DESPUÉS (estilo unificado):
```jsx
import { Card, CardContent, Button } from './components/DesignSystem';

<Card variant="gradient">
  <CardContent>
    <h3 className="text-xl font-bold">Título</h3>
    <Button variant="secondary">Acción</Button>
  </CardContent>
</Card>
```

---

## 📋 Lista de Cambios para Unificar

### Colores a reemplazar:
- `indigo-*` → `blue-*` o usar variables CSS
- `purple-*` → mantener con `purple-*`
- Gradientes `from-indigo-500 to-purple-600` → `from-blue-500 to-purple-600`

### Bordes redondeados:
- `rounded-lg` → `rounded-xl` (1rem)
- `rounded-md` → `rounded-lg` (0.75rem)

### Sombras:
- Usar variables: `shadow-lg`, `shadow-xl`
- Hover: `hover-shadow-lg`

---

## 🚀 Próximos Pasos

### Fase 1 (Completada) ✅
- ✅ Variables CSS
- ✅ Componentes base
- ✅ Documentación

### Fase 2 (Pendiente)
- [ ] Actualizar `App.js` para usar componentes del sistema
- [ ] Actualizar `WorksheetGenerator.js`
- [ ] Actualizar `FeedbackDashboard.js`
- [ ] Crear Header unificado (igual a landing)

### Fase 3 (Opcional)
- [ ] Modo oscuro
- [ ] Más componentes (Modal, Dropdown, Tabs)
- [ ] Animaciones avanzadas

---

## 💡 Ejemplo Completo de Uso

```jsx
import React, { useState } from 'react';
import { 
  Card, 
  CardHeader, 
  CardContent, 
  Button, 
  Input, 
  Badge, 
  Alert,
  Container,
  Section 
} from './components/DesignSystem';
import { BookOpen, Brain, CheckCircle } from 'lucide-react';

function MyComponent() {
  const [showSuccess, setShowSuccess] = useState(false);
  
  return (
    <Section bgGradient>
      <Container>
        <h1 className="text-5xl mb-8">Generador de Fichas</h1>
        
        <Card variant="default">
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold">Nueva Ficha</h3>
              <Badge variant="success">Activo</Badge>
            </div>
          </CardHeader>
          
          <CardContent>
            <Input 
              placeholder="Nombre del estudiante"
              icon={<BookOpen className="w-5 h-5" />}
            />
            
            {showSuccess && (
              <Alert 
                variant="success"
                icon={<CheckCircle className="w-5 h-5" />}
                onClose={() => setShowSuccess(false)}
              >
                ¡Ficha creada exitosamente!
              </Alert>
            )}
          </CardContent>
          
          <CardFooter>
            <Button 
              variant="primary" 
              onClick={() => setShowSuccess(true)}
              fullWidth
            >
              <Brain className="w-5 h-5 mr-2" />
              Generar con IA
            </Button>
          </CardFooter>
        </Card>
      </Container>
    </Section>
  );
}

export default MyComponent;
```

---

## 🎨 Paleta de Colores Completa

| Color | Uso | Variable CSS |
|-------|-----|--------------|
| ![#3b82f6](https://via.placeholder.com/15/3b82f6/000000?text=+) `#3b82f6` | Primario (Azul) | `--primary-blue` |
| ![#8b5cf6](https://via.placeholder.com/15/8b5cf6/000000?text=+) `#8b5cf6` | Primario (Púrpura) | `--primary-purple` |
| ![#10b981](https://via.placeholder.com/15/10b981/000000?text=+) `#10b981` | Éxito | `--success` |
| ![#f59e0b](https://via.placeholder.com/15/f59e0b/000000?text=+) `#f59e0b` | Advertencia | `--warning` |
| ![#ef4444](https://via.placeholder.com/15/ef4444/000000?text=+) `#ef4444` | Error | `--error` |

---

**¡El sistema de diseño está listo para usar! 🎉**

Ahora cualquier desarrollador puede usar estos componentes para mantener la coherencia visual en toda la aplicación.
