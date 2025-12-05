# 🎤 Voice Answer Implementation - Documentation

## Overview
We're implementing voice recording functionality for worksheet answers to improve accessibility and allow students to respond verbally instead of typing.

## Features
1. **Record Audio**: Students can record their voice answers
2. **Playback**: Review recorded answers before submitting
3. **Transcription**: Automatic speech-to-text using Gemini API
4. **Integration**: Transcribed text automatically populates the answer field
5. **Correction**: AI analyzes both audio and transcribed text during correction

## Implementation Status

### ✅ Completed:
- Audio recording UI with microphone button
- Recording state management (`recording`, `audioAnswers`, `mediaRecorder`)
- Start/stop recording functionality
- Audio playback UI
- Delete audio answer functionality

### ⚠️ Incomplete:
- **transcribeAudio function** - Needs proper implementation
- **correctWorksheet integration** - Should include audio answers in feedback

## Technical Approach

### Option 1: Gemini API with Audio (RECOMMENDED)
Gemini 2.0 Flash supports audio input natively. We can send the audio directly to the API for transcription.

**Pros:**
- High-quality transcription
- Works in all browsers
- Supports Spanish well
- No additional dependencies

**Cons:**
- Uses API calls (minimal cost)
- Requires internet connection

### Option 2: Web Speech API (Browser-based)
Use browser's built-in speech recognition `webkitSpeechRecognition`.

**Pros:**
- Free, no API calls
- Real-time transcription possible

**Cons:**
- Only works in  Chrome/Edge
- Requires recording AND live recognition (complex)
- Less accurate for Spanish

## Recommended Implementation

```javascript
const transcribeAudio = async (questionId, audioBlob) => {
    setTranscribing(questionId);
    try {
        console.log('🎤 Transcribiendo audio para pregunta', questionId);

        // Convert audio blob to base64
        const reader = new FileReader();
        const base64Audio = await new Promise((resolve, reject) => {
            reader.onloadend = () => {
                const base64String = reader.result.split(',')[1];
                resolve(base64String);
            };
            reader.onerror = reject;
            reader.readAsDataURL(audioBlob);
        });

        // Call Gemini API with audio
        const API_KEY = process.env.REACT_APP_GEMINI_API_KEY;
        
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${API_KEY}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{
                        parts: [
                            {
                                text: `Transcribe el siguiente audio a texto en español. Devuelve SOLAMENTE el texto transcrito, sin formato adicional. Corrige ortografía y puntuación naturalmente.`
                            },
                            {
                                inline_data: {
                                    mime_type: 'audio/webm',
                                    data: base64Audio
                                }
                            }
                        ]
                    }],
                    generationConfig: {
                        temperature: 0.3,
                        maxOutputTokens: 1000,
                    }
                })
            }
        );

        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }

        const data = await response.json();
        const transcription = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() 
            || '[No se pudo transcribir el audio]';
        
        console.log('✅ Transcripción:', transcription);

        // Update state with transcription
        setAudioAnswers(prev => ({
            ...prev,
            [questionId]: {
                ...prev[questionId],
                transcription: transcription
            }
        }));

        // Also populate text answer field
        setStudentAnswers(prev => ({
            ...prev,
           [questionId]: transcription
        }));

    } catch (error) {
        console.error('❌ Error al transcribir:', error);
        
        setAudioAnswers(prev => ({
            ...prev,
            [questionId]: {
                ...prev[questionId],
                transcription: '[Error al transcribir. Por favor, vuelve a grabar.]'
            }
        }));
    } finally {
        setTranscribing(null);
    }
};
```

## Integration with Correction System

The `correctWorksheet` function should already work because:
1. Transcriptions are automatically copied to `studentAnswers` state
2. The correction function reads from `studentAnswers`
3. No changes needed to correction logic!

## File Corruption Issue

The WorksheetGenerator.js file got corrupted during the last edit. We need to:
1. **Restore from git** if possible
2. **Or manually fix** the transcribeAudio function placement

### Location in File:
- Should be after `stopRecording` (around line 1010-1020)
- Should be before `deleteAudioAnswer`
- Must be a standalone function, not nested inside another

## Testing Checklist

Once implemented, test:
- [ ] Click microphone button → recording starts
- [ ] Red pulse indicator shows while recording
- [ ] Click stop → recording stops
- [ ] Audio player appears with playback controls
- [ ] Transcription starts automatically
- [ ] Transcribed text appears in answer field
- [ ] Can delete and re-record
- [ ] Correction works with transcribed answers

## Next Steps

1. Fix the corrupted WorksheetGenerdor.js file
2. Implement the transcribeAudio function properly
3. Test the full workflow
4. Add loading indicator during transcription
5. Handle edge cases (no microphone permission, API errors)
