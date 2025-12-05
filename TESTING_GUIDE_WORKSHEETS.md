# 🧪 Testing Guide: Enhanced Worksheet Generation

## ✅ Quick Start Testing (5 minutes)

### Test 1: Basic Worksheet Generation
1. **Navigate to app**: Open http://localhost:3000
2. **Go to**: "Analizar" or "Recursos" tab (with WorksheetGenerator)
3. **Select**:
   - Asignatura: Matemáticas
   - Tipo: Ficha de Ejercicios
   - Dificultad: Intermedio ⭐⭐
   - Número de preguntas: 5
4. **Click**: "Generar Ficha"
5. **Expected Result**: 
   - ✅ Worksheet with 5 questions
   - ✅ Each question shows metadata badges (Bloom's level, difficulty, type, points)
   - ✅ Learning objectives displayed at top
   - ✅ Rubric shown at bottom
   - ✅ Professional formatting

---

## 🎯 Test Scenarios

### Scenario 1: Personalization Test
**Goal**: Verify student interests are incorporated

**Steps**:
1. Go to **Perfil** tab
2. Fill in:
   - Nombre: "María"
   - Fecha de nacimiento: 2015 (8 años)
   - Curso: "3º Primaria"
   - Intereses: "fútbol, animales, Harry Potter"
   - Observaciones: "Le gusta aprender con ejemplos visuales"
3. Click **Guardar Cambios**
4. Go to **Worksheet Generator**
5. Generate 5 Matemáticas questions, Básico level
6. **Expected**: Questions mention fútbol, animales, or Harry Potter examples

**Example Expected Question**:
> "María tiene 12 cromos de jugadores de fútbol y quiere repartirlos equitativamente entre sus 4 amigos. ¿Cuántos cromos recibirá cada amigo?"

---

### Scenario 2: Difficulty Levels Test
**Goal**: Verify difficulty calibration works

**Test A - Básico** (⭐):
1. Generate 3 questions, Básico
2. **Expected**:
   - Bloom's levels: "Remember", "Understand"
   - Simple vocabulary
   - Hints provided (💡 Pista)
   -Direct questions: "Define...", "Lista...", "¿Qué es...?"

**Test B - Intermedio** (⭐⭐):
1. Generate 3 questions, Intermedio
2. **Expected**:
   - Bloom's levels: "Understand", "Apply", "Analyze"
   - Requires explanations
   - Real-world scenarios
   - Questions: "Explica por qué...", "Compara...", "Calcula..."

**Test C - Avanzado** (⭐⭐⭐):
1. Generate 3 questions, Avanzado
2. **Expected**:
   - Bloom's levels: "Analyze", "Evaluate", "Create"
   - Multi-step problems
   - Critical thinking required
   - Questions: "Diseña...", "Justifica...", "Predice y explica..."

---

### Scenario 3: Learning Disabilities Adaptation
**Goal**: Verify accommodation for learning differences

**Test - Dyslexia**:
1. Go to Perfil
2. Observaciones: "Tiene dislexia"
3. Generate worksheet
4. **Expected**:
   - Shorter sentences
   - Clear, simple language
   - No dense text blocks
   - Well-structured questions

**Test - ADHD**:
1. Observaciones: "Tiene TDAH"
2. Generate worksheet
3. **Expected**:
   - Questions broken into small steps
   - Clear structure with numbering
   - One concept per question

---

### Scenario 4: File-Based Generation
**Goal**: Test generating from uploaded materials

**Steps**:
1. Go to **Subir Material** tab
2. Select Matemáticas
3. Upload a text file with notes about "fracciones"
4. Go to **Worksheet Generator**
5. Select Matemáticas
6. Check the file checkbox
7. Generate worksheet
8. **Expected**:
   - Questions ONLY about fracciones(from file content)
   - Not generic math questions
   - References to specific examples from file

---

### Scenario 5: Visual Display Test
**Goal**: Verify all new UI elements work

**Check for**:
- [ ] ⏱️ Estimated time displays correctly
- [ ] 📊 Total points sum correctly
- [ ] 📝 Question count is accurate
- [ ] 🎯 Learning objectives list shows
- [ ] 📋 Instructions display
- [ ] 🏷️ Each question shows:
  - [ ] Points badge (indigo)
  - [ ] Bloom's level badge (colored: gray/blue/green/yellow/orange/purple)
  - [ ] Difficulty badge (green/yellow/red stars)
  - [ ] Type icon and label
- [ ] 📚 Topic and sub-topic display
- [ ] 💡 Hints show for basic level
- [ ] ℹ️ Expected format guidance shows
- [ ] 📋 Rubric displays at bottom
- [ ] Hover effect on question boxes works

---

## 🔍 Quality Checks

### Question Quality Checklist
For each generated worksheet, verify:

1. **Clarity**: Questions are clear and unambiguous
2. **Age-appropriate**: Language matches student age
3. **Curriculum-aligned**: Mentions LOMLOE competencies
4. **Diverse**: Mix of question types
5. **Personalized**: References student interests (if provided)
6. **Complete**: Answer keys have full explanations

### Bloom's Taxonomy Verification
| Level | Question Starters | Should Appear In |
|-------|------------------|------------------|
| Remember | "Define", "Lista", "¿Qué es?" | Básico |
| Understand | "Explica", "Resume", "Describe" | Básico/Intermedio |
| Apply | "Calcula", "Usa", "Resuelve" | Intermedio |
| Analyze | "Compara", "Contrasta", "¿Por qué?" | Intermedio/Avanzado |
| Evaluate | "Justifica", "Critica", "Evalúa" | Avanzado |
| Create | "Diseña", "Inventa", "Propón" | Avanzado |

---

## 🐛 Troubleshooting

### Issue: "La IA generó una respuesta inválida"
**Cause**: API returned malformed JSON
**Solution**: 
1. Check browser console (F12)
2. Look for logged JSON
3. Try again (AI sometimes has issues)
4. Reduce number of questions if persistent

### Issue: No metadata (Bloom's level, etc.) showing
**Cause**: AI didn't include fields in response
**Solution**:
1. Wait 1-2 seconds after generation
2. Check if questions loaded
3. Try different subject/difficulty
4. AI learning curve - may need 2-3 attempts

### Issue: Questions too generic
**Cause**: Profile not filled or not loaded
**Solution**:
1. Verify profile is saved
2. Reload page
3. Check console for profile data
4. Try more specific interests

---

## 📊 Success Metrics

### A+ Quality Worksheet Should Have:
- ✅ 3+ Bloom's taxonomy levels represented
- ✅ Mix of question types (not all "short_answer")
- ✅ Student interests mentioned in at least 2 questions
- ✅ Clear learning objectives (2-4 listed)
- ✅ Detailed rubric with 4 levels
- ✅ Answer keys with explanations
- ✅ Partial credit criteria defined
- ✅ Age-appropriate language and examples

---

## 🎓 Example Expected Output

### Sample Question from Enhanced System:
```
Pregunta 1
[2 puntos] [🧠 Apply] [⭐⭐ intermedio] [🧮 problem_solving]

📚 Números y operaciones → Multiplicación de fracciones

A María le encanta el fútbol. Si entrena 3/4 de hora cada día 
y quiere aumentar su tiempo de entrenamiento multiplicándolo 
por 2/3, ¿cuántas horas entrenará cada día después del cambio?

Explica tu proceso de cálculo paso a paso.

ℹ️ Formato esperado: Muestra la operación matemática y explica 
cada paso con tus propias palabras.
```

**What makes this great:**
- ✅ Incorporates student interest (fútbol)
- ✅ Real-world scenario
- ✅ Requires explanation (not just calculation)
- ✅ Clear metadata (points, Bloom's level, difficulty, type)
- ✅ Guidance on expected answer format

---

## 🚀 Advanced Testing

### Performance Test
1. Generate 20 questions
2. Time: Should complete in 10-30 seconds
3. All metadata should load
4. Page should remain responsive

### Edge Cases
1. **No profile data**: Should use fallback curriculum
2. **No files selected**: Should generate from curriculum
3. **Empty interests**: Should not crash, generic questions OK
4. **Long subject names**: UI should handle gracefully

---

## 📝 Feedback Collection

### What to Note:
1. Question quality (1-10)
2. Personalization effectiveness (1-10)
3. UI clarity (1-10)
4. Any errors or issues
5. Suggestions for improvement

---

## ✅ Quick Validation Checklist

Before considering test complete:
- [ ] Generated at least 3 worksheets
- [ ] Tried all 3 difficulty levels
- [ ] Tested with and without student profile
- [ ] Verified Bloom's taxonomy badges work
- [ ] Checked rubric displays
- [ ] Tried different subjects
- [ ] Tested file-based generation
- [ ] No console errors
- [ ] UI looks professional

---

**Happy Testing!** 🎉

If you find any issues, check:
1. Browser console (F12) for errors
2. Network tab for API request/response
3. ENHANCED_WORKSHEET_GENERATION_COMPLETE.md for expected behavior
