# 🛠️ Shared: Utilidades

## Funciones Helper
- `formatDate.js` - Formateo de fechas
- `calculateScore.js` - Cálculo de puntuaciones
- `generateAvatar.js` - Generador de avatars por defecto
- `constants.js` - Constantes globales
- `validators.js` - Validadores de formularios

## API Wrappers
- `supabase.js` - Cliente Supabase configurado
- `gemini.js` - Cliente Gemini configurado

## Ejemplo
```js
import { formatDate } from '@/shared/utils/formatDate';

const formattedDate = formatDate(new Date(), 'DD/MM/YYYY');
```
