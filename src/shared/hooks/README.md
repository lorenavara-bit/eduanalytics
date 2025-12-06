# 🪝 Shared: Custom Hooks

## Hooks Disponibles
- `useAuth.js` - Acceso a autenticación
- `useRole.js` - Acceso a rol actual
- `useStudentData.js` - Datos del alumno activo
- `useWorksheets.js` - Gestión de fichas
- `useAnalytics.js` - Acceso a métricas
- `useLocalStorage.js` - Persistencia local
- `useDebounce.js` - Debounce para inputs

## Patrón
Todos los hooks siguen el patrón:
```js
export const useNombreHook = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // ... lógica
  
  return { data, loading, error };
};
```
