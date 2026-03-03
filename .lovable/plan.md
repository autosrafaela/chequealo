

# Plan: Logo Manager en Admin Dashboard

## Resumen

Crear un nuevo componente `LogoManager` y una nueva tab "Logo" en el Admin Dashboard. Este componente mostrará los logos existentes del proyecto, permitirá generar un nuevo logo con IA, y tendrá un switch para activar/desactivar el nuevo logo en toda la app.

## Diseño

El componente tendrá:
1. **Galería de logos actuales** — muestra los 4 archivos de `src/assets/chequealo-*.png` como previews
2. **Generador de logo con IA** — botón que llama al endpoint de Nano banana para generar el logo según el prompt del usuario
3. **Preview del logo generado** — muestra el resultado
4. **Botón "Guardar como candidato"** — sube el logo generado a Supabase Storage
5. **Switch "Usar nuevo logo"** — toggle que guarda en `localStorage` (o una tabla de config) si la app debe usar el logo nuevo o el actual. El logo NO se reemplaza automáticamente; el admin decide cuándo activarlo.

## Archivos

| Archivo | Acción |
|---------|--------|
| `src/components/admin/LogoManager.tsx` | Crear — componente completo con galería, generación IA, preview y switch |
| `src/pages/AdminDashboard.tsx` | Editar — agregar tab "Logo" y import del `LogoManager` |

## Detalles Técnicos

- La generación usa el endpoint `https://ai.gateway.lovable.dev/v1/chat/completions` con modelo `google/gemini-2.5-flash-image` y el prompt descriptivo del usuario.
- Se necesita el secret `LOVABLE_API_KEY` para la llamada. Se usará una Edge Function proxy para no exponer la key en el frontend.
- El logo generado se guarda en un bucket de Supabase Storage (`logos`).
- El switch de activación usa `localStorage` key `active_logo_url`. Los componentes que importan el logo (Header, MobileOptimizedHeader, Auth, Login, Register, Install, PWAInstallPrompt) leerán este valor para decidir qué logo mostrar.
- Alternativamente, si se prefiere algo más simple: el switch simplemente muestra instrucciones de "descargá el logo y subilo como asset", sin auto-reemplazo en runtime.

## Flujo del Admin

1. Va a Admin Dashboard → tab "Logo"
2. Ve los logos actuales del proyecto
3. Clickea "Generar nuevo logo con IA"
4. Ve el preview del resultado
5. Si le gusta, clickea "Guardar"
6. Activa el switch "Usar nuevo logo" cuando esté listo

