# 🤖 Módulo 2: Generador IA

## Responsabilidad
Generación de fichas, exámenes y corrección con IA (Gemini).

## Componentes
- `WorksheetGenerator.js` - Interfaz principal unificada
- `QuestionRenderer.js` - Renderiza preguntas dinámicas
- `AnswerInput.js` - Inputs adaptativos por tipo de pregunta
- `CorrectionDisplay.js` - Muestra feedback de la IA
- `SavedWorksheets.js` - Listado de fichas guardadas

## Servicios
- `geminiService.js` - Conexión con Gemini API
- `promptEngine.js` - Sistema de prompts personalizados

## Tipos de Ejercicios Soportados
- Multiple choice
- Verdadero/Falso
- Respuesta corta
- Problemas matemáticos
- Comprensión lectora

## Estado Actual
✅ Generación básica funcional
✅ Corrección con IA operativa
⚠️ Falta usar datos del perfil para personalizar enunciados
🔨 Próximo: Fusionar "Subir Material" + "Analizar" en un solo flujo
