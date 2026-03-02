

# Plan: Actualizar seed-pioneers con nueva lista y limpieza previa

## Cambios en `supabase/functions/seed-pioneers/index.ts`

### 1. Reemplazar el array PIONEERS con los 16 nuevos profesionales
Los telefonos ya vienen en formato internacional (`+54 9 3492 ...`), asi que todos tienen telefono valido. Se simplifica la logica.

### 2. Agregar paso de limpieza antes del seed
Antes de crear los nuevos, la funcion eliminara los pioneros anteriores (usuarios con email `@chequealo.net`):
- Buscar todos los profesionales con email terminado en `@chequealo.net`
- Para cada uno: eliminar datos relacionados (professional_services, work_photos, reviews, contact_requests, subscriptions, etc.), luego el registro de professionals, profiles, y finalmente el auth user con `admin.deleteUser()`
- Esto reutiliza el patron de eliminacion de `admin-delete-user`

### 3. Almacenar el telefono tal cual viene
Como los telefonos ya estan en formato `+54 9 XXXX XXXXXX`, se guardan directamente en el campo `phone`.

## Archivo a modificar

| Archivo | Cambio |
|---------|--------|
| `supabase/functions/seed-pioneers/index.ts` | Reemplazar array, agregar limpieza previa de pioneros `@chequealo.net` |

