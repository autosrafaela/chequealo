

# Plan: Botón "Cargar 5 Gomerías" aislado

## Problema
La Edge Function `seed-pioneers` requiere JWT de admin para ejecutarse, y Lovable no puede invocarla directamente. Las 5 gomerías están en el array pero nunca se insertaron.

## Solución
Crear una Edge Function nueva y liviana (`seed-gomerias`) que solo inserte estas 5 gomerías, con `verify_jwt = false` en config.toml para poder invocarla desde el botón del admin dashboard sin complicaciones de auth (la función validará internamente el rol admin).

### 1. Nueva Edge Function: `supabase/functions/seed-gomerias/index.ts`
- Contiene solo los 5 registros de gomerías hardcodeados
- Misma lógica que `seed-pioneers`: crea usuario auth con `@chequealo.net`, perfil, professional con `is_verified=true`, `has_free_access=true`, slug SEO
- Valida que el caller sea admin (via JWT)
- Si el usuario ya existe (email duplicado), lo skipea sin error
- NO hace cleanup de pioneros anteriores

### 2. Actualizar `supabase/config.toml`
- Agregar `[functions.seed-gomerias]` con `verify_jwt = false`

### 3. Agregar botón en `AdminDashboard.tsx`
- Nuevo botón "Cargar 5 Gomerías" al lado del botón existente "Cargar Pioneros"
- Mismo patrón: confirm → toast.loading → invoke → toast.success/error
- Color diferenciado (verde) para distinguirlo

### 4. Verificación
- Invocar la función después de desplegarla para confirmar que funciona
- Consultar la tabla professionals para verificar que las 5 gomerías existen

