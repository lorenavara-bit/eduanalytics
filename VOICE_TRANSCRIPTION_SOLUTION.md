# 🎙️ Solución de Transcripción de Voz: Web Speech API

## 📝 Resumen
Inicialmente se implementó la transcripción utilizando la API de Gemini (`gemini-2.0-flash-exp` y `gemini-1.5-flash`). Sin embargo, debido a limitaciones de cuota (Error 429) y complejidad en la configuración de API Keys, se migró a la **Web Speech API** nativa del navegador.

## ✅ Solución Final: Web Speech API

### Ventajas:
1.  **Gratuita e Ilimitada:** No depende de cuotas de API externas.
2.  **Rápida:** La transcripción ocurre en tiempo real en el dispositivo/navegador.
3.  **Privacidad:** En muchos navegadores el procesamiento es local o gestionado por el proveedor del navegador de forma segura.
4.  **Sin Configuración:** No requiere añadir claves API al archivo `.env`.

### Implementación Técnica:
Se utiliza `window.SpeechRecognition` (o `window.webkitSpeechRecognition` para Chrome/Edge).

```javascript
const startListening = (questionId) => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'es-ES';
    
    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        // Actualizar estado...
    };
    
    recognition.start();
};
```

### Archivos Afectados:
- `src/components/WorksheetGeneratorComplete.js`: Lógica completa de grabación y transcripción.

---

## ⚠️ Solución Anterior (Descartada): Gemini API

Se intentó usar `gemini-1.5-flash` enviando blobs de audio en base64.
- **Problema:** Errores 429 (Too Many Requests) y 404 (Model Not Found) frecuentes en la capa gratuita.
- **Estado:** Código eliminado en favor de Web Speech API.

## 🧪 Cómo Probar
1.  Abre la aplicación en Chrome, Edge o Safari.
2.  Ve a "Analizar Asignatura".
3.  Haz clic en el botón de micrófono en cualquier pregunta o en "Consideraciones".
4.  Permite el acceso al micrófono.
5.  Habla y verifica que el texto aparece automáticamente.
