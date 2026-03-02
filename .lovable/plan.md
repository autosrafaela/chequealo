

# Plan: Edge Function para Seed Masivo de Profesionales Pioneros

## Resumen

Crear una edge function `seed-pioneers` que, invocada por un admin, cree automaticamente 31 profesionales en la base de datos usando la Admin API de Supabase Auth. Se agregara un boton en el AdminDashboard para ejecutarla.

## Edge Function: `supabase/functions/seed-pioneers/index.ts`

La funcion hara lo siguiente para cada profesional del array:

1. **Sanitizar telefono** para generar email ficticio (ej: `3492663183@chequealo.net`)
2. **Crear usuario en Auth** con `supabaseAdmin.auth.admin.createUser()` pasando `email_confirm: true` y password `Pionero2026!`
3. **Insertar en `profiles`** con `full_name` y `user_id`
4. **Insertar en `professionals`** con `full_name`, `profession` (category), `phone`, `location`, `email` ficticio, `is_verified: true`, `verification_date: now()`, `has_free_access: true`
5. **Insertar en `subscriptions`** con `plan_id: 'free'`, `status: 'active'`
6. Retornar un resumen de creados/fallidos

**Manejo de datos incompletos**: Para los profesionales que tienen direcciones o emails en el campo `phone` en vez de numeros, se omite el phone y se genera el email ficticio usando el nombre slugificado.

**Seguridad**: Requiere auth header + verificacion de rol admin (mismo patron que `admin-delete-user`).

## Config: `supabase/config.toml`

Agregar:
```toml
[functions.seed-pioneers]
verify_jwt = false
```

## Frontend: Boton en AdminDashboard

En `src/pages/AdminDashboard.tsx`, agregar un boton "Cargar Pioneros" que invoque `supabase.functions.invoke('seed-pioneers')` con confirmacion previa. Mostrar resultado con toast.

## Archivos a crear/modificar

| Archivo | Accion |
|---------|--------|
| `supabase/functions/seed-pioneers/index.ts` | Crear - edge function con toda la logica |
| `supabase/config.toml` | Editar - agregar config de la funcion |
| `src/pages/AdminDashboard.tsx` | Editar - agregar boton para ejecutar el seed |

