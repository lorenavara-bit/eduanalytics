-- Actualizar TODOS los usuarios actuales para que sean Admin/Superusuarios (Padre + Estudiante)
-- Esto te permitirá ver el Selector de Rol y acceder al Dashboard de Padres
UPDATE profiles
SET 
  available_roles = '["student", "parent"]'::jsonb,
  "current_role" = 'student' -- Por defecto entra como estudiante, pero podrá cambiar
WHERE available_roles IS NULL OR jsonb_array_length(available_roles) < 2;
