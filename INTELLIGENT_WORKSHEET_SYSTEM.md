# 🎯 Sistema Inteligente de Generación de Fichas - Estilo Colegio Español

## 📋 Descripción General

Este sistema genera fichas y exámenes **idénticos a los del colegio**, personalizados para cada estudiante según:
- **Curriculum LOMLOE español** (conceptos esenciales por curso)
- **Patrones de preguntas reales** de colegios españoles
- **Intereses del estudiante** (fútbol, animales, dinosaurios...)
- **Observaciones del profesor** (dificultades específicas, estilo de aprendizaje)

## 🎓 Patrones de Preguntas de Colegios Españoles

### Tipos de Preguntas Implementadas:

#### 1. **Definiciones y Conceptos Clave**
```
✓ "¿Qué es una fracción?"
✓ "Define con tus propias palabras qué es un ecosistema"
✓ "Explica la diferencia entre suma y multiplicación"
```

#### 2. **Verdadero/Falso con Explicación**
```
✓ "Verdadero o Falso: Todos los números pares terminan en 2, 4, 6, 8 o 0. 
   Justifica tu respuesta."
```

#### 3. **Relacionar Columnas**
```
✓ "Relaciona cada animal con su grupo:
   Columna A: Perro, Pez, Águila
   Columna B: Mamíferos, Aves, Peces"
```

#### 4. **Problemas Prácticos de la Vida Real**
```
✓ "Si en el zoo hay 235 animales y llegan 120 más, ¿cuántos hay ahora?"
✓ "María tiene 8 cajas con 6 lápices cada una. ¿Cuántos lápices tiene en total?"
```

#### 5. **Preguntas de Desarrollo Corto**
```
✓ "Explica brevemente (3-5 líneas) cómo funciona el ciclo del agua"
```

#### 6. **Test de Opción Múltiple**
```
✓ "¿Cuál de estos es un ser vivo?
   a) Piedra  b) Agua  c) Árbol  d) Aire"
```

#### 7. **Completar Huecos**
```
✓ "Completa: Los seres vivos realizan tres funciones vitales: 
   nutrición, _____ y _____"
```

#### 8. **Análisis Sintáctico (Lengua)**
```
✓ "Analiza esta frase: 'El perro corre en el parque'
   - Señala el sujeto
   - Señala el predicado
   - Identifica los verbos"
```

## 📚 Estructura de Exámenes por Edad

### **Primaria (6-12 años)**

#### **1º-2º Primaria (6-8 años)**
```
ESTRUCTURA TÍPICA:
├── Parte 1: Definiciones simples (20 pts)
│   └── "¿Qué es...?" (conceptos básicos)
├── Parte 2: Ejercicios prácticos (40 pts)
│   └── Operaciones simples, dibujos, identificación
└── Parte 3: Problemas sencillos (40 pts)
    └── Un paso, contexto familiar

⏱️ Duración: 30-40 minutos
📊 Total: 100 puntos
```

#### **3º-4º Primaria (8-10 años)**
```
ESTRUCTURA TÍPICA:
├── Parte 1: Teoría (30 pts)
│   ├── Definiciones (15 pts)
│   └── Verdadero/Falso (15 pts)
├── Parte 2: Práctica (40 pts)
│   ├── Ejercicios guiados (20 pts)
│   └── Relacionar columnas (20 pts)
└── Parte 3: Aplicación (30 pts)
    └── Problemas de dos pasos

⏱️ Duración: 45-60 minutos
📊 Total: 100 puntos
```

#### **5º-6º Primaria (10-12 años)**
```
ESTRUCTURA TÍPICA:
├── Parte 1: Conceptos (25 pts)
│   └── Definiciones y comparaciones
├── Parte 2: Ejercicios (35 pts)
│   └── Variados, algunos complejos
├── Parte 3: Problemas (25 pts)
│   └── Multi-paso, razonamiento
└── Parte 4: Desarrollo (15 pts)
    └── Pregunta abierta, explicación

⏱️ Duración: 60 minutos
📊 Total: 100 puntos
```

## 🎯 Conceptos Esenciales por Asignatura y Curso (LOMLOE)

### **MATEMÁTICAS**

#### **1º-2º Primaria**
- Suma, resta, número, unidad, decena
- Par, impar, centena
- Mayor que, menor que
- Problemas simples de suma/resta

#### **3º-4º Primaria**
- Multiplicación, división, tabla de multiplicar
- Fracción, numerador, denominador
- Ángulo, perímetro, área
- Problemas de dos pasos

#### **5º-6º Primaria**
- Decimal, porcentaje
- Fracción equivalente, simplificación
- Área, volumen, capacidad
- Ecuación simple, variable
- Estadística básica

### **LENGUA CASTELLANA**

#### **1º-2º Primaria**
- Mayúscula, punto, coma
- Sustantivo, verbo básico
- Sílaba, palabra
- Comprensión lectora simple

#### **3º-4º Primaria**
- Sustantivo, verbo, adjetivo
- Sujeto, predicado
- Sinónimo, antónimo
- Prefijo, sufijo
- Ortografía b/v, g/j, h

#### **5º-6º Primaria**
- Análisis morfológico completo
- Tipos de oraciones
- Narrativa, descripción, diálogo
- Figuras literarias básicas
- Tiempos verbales

### **CIENCIAS NATURALES**

#### **1º-2º Primaria**
- Ser vivo, animal, planta
- Partes del cuerpo
- Los sentidos
- Estaciones del año

#### **3º-4º Primaria**
- Funciones vitales (nutrición, reproducción, relación)
- Estados de la materia (sólido, líquido, gas)
- Ecosistema, cadena alimentaria
- El agua y sus estados

#### **5º-6º Primaria**
- Fotosíntesis, respiración celular
- Sistema digestivo, circulatorio
- Energía, fuerza, movimiento
- Ciclos naturales

### **CIENCIAS SOCIALES**

#### **1º-2º Primaria**
- Mi familia, mi colegio
- El barrio, la ciudad
- Profesiones básicas
- Días de la semana, meses

#### **3º-4º Primaria**
- Geografía de España (comunidades)
- Relieve, ríos, costas
- Época romana, medieval
- Línea del tiempo

#### **5º-6º Primaria**
- Historia de España (resumen)
- Edad Moderna, Contemporánea
- Sistema político español
- Europa y el mundo

## 🎨 Personalización con Intereses

### Ejemplo 1: **Estudiante que le gusta el fútbol**

**Problema estándar:**
> "Si María tiene 12 caramelos..."

**Problema personalizado:**
> "Si el Madrid marcó 235 goles en una temporada y el Barça 120, 
> ¿cuántos goles marcaron entre los dos equipos?"

### Ejemplo 2: **Estudiante que le gustan los dinosaurios**

**Problema estándar:**
> "Ordena estos animales por tamaño..."

**Problema personalizado:**
> "El Tyrannosaurus Rex medía 12 metros y el Velociraptor 2 metros. 
> ¿Cuántos Velociraptors colocados en fila medirían lo mismo que un T-Rex?"

### Ejemplo 3: **Estudiante que le gustan los animales**

**Problema estándar:**
> "Clasifica estos objetos..."

**Problema personalizado:**
> "En el zoo hay 235 animales. Si 120 son mamíferos, ¿cuántos NO son mamíferos?"

## 🔍 Observaciones y Personalización

### Base de Datos: Campos de Estudiante

```sql
-- Tabla student_profiles incluye:
observations TEXT          -- Observaciones generales del profesor
learning_notes TEXT[]      -- Notas de seguimiento
special_requirements TEXT[] -- Necesidades específicas
diagnosed_difficulties TEXT[] -- Dificultades diagnosticadas
learning_style TEXT        -- 'visual', 'auditivo', 'kinestésico', 'mixto'
```

### Aplicación en Fichas

| Observación | Acción en la Ficha |
|------------|-------------------|
| **"Confunde b/d"** | → Incluir ejercicios específicos de discriminación visual |
| **"Dificultad con fracciones"** | → Más práctica gradual, empezar por 1/2, 1/4 |
| **"Aprende mejor visual"** | → Incluir diagramas, gráficos, imágenes |
| **"Necesita refuerzo en vocabulario"** | → Actividades de definiciones y sinónimos |
| **"Se distrae fácilmente"** | → Ejercicios más cortos y variados |
| **"Problemas con tablas de multiplicar"** | → Incluir repaso de tablas específicas |
| **"Confunde centenas/decenas"** | → Ejercicios de valor posicional con visuales |

## 🧠 Evaluación de Comprensión Real

El sistema evalúa en **múltiples niveles** para asegurar comprensión profunda:

### Ejemplo con "Fracción":

#### **Nivel 1: Definición formal**
> "¿Qué es una fracción?"

#### **Nivel 2: Ejemplo práctico**
> "Si tenemos una pizza dividida en 8 partes y comemos 3, 
> ¿qué fracción representa lo que comimos?"

#### **Nivel 3: Identificación**
> "¿Cuál de estas es una fracción propia? 3/4, 5/2, 8/8"

#### **Nivel 4: Aplicación**
> "María ha leído 2/3 de un libro de 60 páginas. ¿Cuántas páginas ha leído?"

### Indicadores de Comprensión Real:

✓ **Puede explicar con sus palabras**
✓ **Reconoce ejemplos y contraejemplos**
✓ **Aplica el concepto en situaciones nuevas**
✓ **Conecta con otros conceptos aprendidos**

## 🎯 Algoritmo de Generación Inteligente

### INPUT:
1. **Datos del estudiante:**
   - Curso y edad
   - Intereses y hobbies
   - Observaciones del profesor
   - Dificultades específicas
   - Estilo de aprendizaje

2. **Configuración:**
   - Asignatura
   - Tipo (ficha o examen)
   - Nivel de dificultad
   - Número de preguntas

### PROCESO:

```
PASO 1: SELECCIONAR CONCEPTOS
├─ Obtener conceptos del curriculum para el curso
├─ Priorizar conceptos que aborden dificultades específicas
└─ Seleccionar 3-5 conceptos clave

PASO 2: ELEGIR PATRONES DE PREGUNTAS
├─ Obtener patrones típicos de colegios españoles
├─ Mezclar tipos (definición, aplicación, test...)
└─ Ajustar complejidad según nivel

PASO 3: PERSONALIZAR CON INTERESES
├─ Identificar intereses (fútbol, animales, etc.)
├─ Adaptar contextos de problemas
└─ Mantener rigor académico

PASO 4: INCORPORAR OBSERVACIONES
├─ Si "confunde X" → incluir ejercicios específicos
├─ Si "estilo visual" → añadir diagramas
└─ Si "necesita refuerzo" → más repetición graduada

PASO 5: ESTRUCTURAR COMO FICHA REAL
├─ Seguir estructura típica del colegio
├─ Distribuir puntuación
├─ Añadir instrucciones claras
└─ Calcular tiempo estimado
```

### OUTPUT:

**Ficha que parece hecha por un profesor**, pero perfectamente personalizada para el estudiante.

## 📝 Ejemplo Completo: María (8 años, 3º Primaria)

### Perfil:
- **Edad:** 8 años
- **Curso:** 3º Primaria
- **Intereses:** Animales, especialmente gatos
- **Observación:** "Confunde centenas y decenas"
- **Curriculum:** Operaciones hasta 1000, problemas de dos pasos

### Ficha Generada:

```
╔══════════════════════════════════════════════════════════╗
║   FICHA DE MATEMÁTICAS - 3º PRIMARIA                     ║
║   Alumna: María                    Fecha: _________      ║
║   Tiempo: 45 minutos               Total: 100 puntos     ║
╚══════════════════════════════════════════════════════════╝

PARTE 1: CONCEPTOS (20 puntos)

1. (5 pts) ¿Qué es una centena? ¿Cuántas decenas tiene una centena?
   
   Tu respuesta:
   ___________________________________________________________
   ___________________________________________________________

2. (5 pts) ¿Qué es una decena? ¿Cuántas unidades tiene?
   
   Tu respuesta:
   ___________________________________________________________
   ___________________________________________________________

3. (10 pts) Completa la tabla:

   | Número | Centenas | Decenas | Unidades |
   |--------|----------|---------|----------|
   |  235   |    ?     |    ?    |    ?     |
   |  470   |    ?     |    ?    |    ?     |

PARTE 2: PROBLEMAS CON ANIMALES (50 puntos)

4. (15 pts) En el refugio de animales hay 235 gatos. 
   Si llegan 120 gatos más, ¿cuántos gatos hay ahora?
   
   Operación:
   
   Respuesta: ___________ gatos

5. (15 pts) María tiene 3 cajas con 100 chuches cada una
   y 5 bolsas con 10 chuches cada una. 
   ¿Cuántas chuches tiene en total?
   
   Operación:
   
   Respuesta: ___________ chuches

6. (20 pts) En la tienda de mascotas:
   - Los gatos cuestan 200€
   - Los ratones cuestan 15€
   - Las jaulas cuestan 50€
   
   Si María compra 1 gato y 1 jaula, ¿cuánto gasta?
   Si paga con un billete de 500€, ¿cuánto le devuelven?
   
   Operaciones:
   
   Respuestas: 
   Gasta: ___________ €
   Le devuelven: ___________ €

PARTE 3: PRÁCTICA DE VALOR POSICIONAL (30 puntos)

7. (15 pts) Escribe estos números:
   
   a) 3 centenas, 4 decenas, 5 unidades = ___________
   b) 5 centenas, 0 decenas, 8 unidades = ___________
   c) 2 centenas, 3 decenas, 0 unidades = ___________

8. (15 pts) Ordena de menor a mayor:
   
   450 • 235 • 540 • 120 • 399
   
   ___ < ___ < ___ < ___ < ___

¡MUY BIEN! Has terminado 🐱
```

## 🚀 Cómo Usar el Sistema

### Paso 1: Configurar Perfil del Estudiante

1. Ve a la pestaña **"Perfil"**
2. Rellena:
   - Nombre
   - Fecha de nacimiento (para calcular edad)
   - Curso (ej: "3º Primaria")
   - Intereses (ej: "animales, gatos, dinosaurios")
   - Observaciones (ej: "confunde centenas y decenas")

### Paso 2: Generar Ficha Personalizada

1. Ve a la pestaña **"Analizar"**
2. Selecciona:
   - Tipo: Ficha o Examen
   - Asignatura
   - Nivel: Básico / Intermedio / Avanzado
   - Número de preguntas (5-20)
3. Click **"Generar"**

### Paso 3: Completar y Corregir

1. El estudiante responde las preguntas
2. Click **"Corregir"**
3. La IA evalúa y da feedback detallado

### Paso 4: Ver Progreso

1. Ve a **"Feedback"**
2. Genera informe de progreso
3. Ve gráficos de evolución
4. Descarga el informe

## 📊 Base de Datos

### Tablas Principales:

- **`curriculum_concepts`**: Conceptos esenciales por curso/asignatura
- **`question_patterns`**: Patrones de preguntas reales
- **`student_profiles`**: Información extendida del estudiante
- **`worksheets`**: Fichas generadas
- **`worksheet_results`**: Resultados y respuestas
- **`learning_analytics`**: Análisis de progreso

### Funciones Útiles:

```sql
-- Obtener conceptos apropiados para un estudiante
SELECT * FROM get_student_concepts('3º Primaria', 'Matemáticas', 
  ARRAY['confunde centenas y decenas']);

-- Obtener patrones de preguntas
SELECT * FROM get_question_patterns_for_worksheet(
  'Matemáticas', '3º Primaria', 'intermedio', 5);
```

## 🎓 Ventajas del Sistema

✅ **Alineado con LOMLOE**: Curriculum oficial español
✅ **Patrones reales**: Preguntas como en el colegio
✅ **Personalización completa**: Intereses + observaciones
✅ **Evaluación profunda**: Múltiples niveles de comprensión
✅ **Seguimiento continuo**: Analytics y progreso
✅ **Feedback constructivo**: IA analiza errores y aciertos
✅ **Descargable**: Fichas en formato texto

## 📈 Próximos Pasos

- [ ] Añadir más conceptos para 4º, 5º, 6º Primaria
- [ ] Incluir 1º, 2º, 3º, 4º ESO
- [ ] Añadir más asignaturas (Inglés, Música, Plástica)
- [ ] Generación de imágenes para fichas visuales
- [ ] Exportar a PDF con formato profesional
- [ ] Sistema de badges y gamificación
- [ ] Sugerencias automáticas de fichas según dificultades detectadas

---

**Sistema desarrollado siguiendo LOMLOE y patrones de colegios españoles** 🇪🇸
