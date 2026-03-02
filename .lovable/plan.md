

# Plan: Optimización SEO Técnico para chequealo.net

## Estado Actual

| Componente | Estado | Problema |
|-----------|--------|----------|
| Meta Tags Dinámicos | ✅ Implementado | `ProfessionalSEO.tsx` usa DOM manipulation manual en vez de Helmet; título ya sigue estructura correcta |
| URLs Amigables (Slugs) | ✅ Implementado | Slugs son elegidos por el usuario, no auto-generados con categoría+ubicación |
| Sitemap.xml | ⚠️ Estático | Solo 9 páginas fijas hardcodeadas, no incluye perfiles profesionales |
| Robots.txt | ✅ Completo | Ya cubre todos los bots y rutas |

## Cambios Necesarios

### 1. Edge Function: Sitemap Dinámico
Crear `supabase/functions/generate-sitemap/index.ts` que:
- Consulte todos los profesionales activos de Supabase
- Genere XML con URLs estáticas + todos los perfiles profesionales (por slug o ID)
- Responda con `Content-Type: application/xml`
- Se pueda acceder desde `https://chequealo.net/sitemap.xml` vía redirect en Cloudflare

### 2. Migrar ProfessionalSEO a react-helmet-async
Refactorizar `ProfessionalSEO.tsx` para usar `<Helmet>` (como ya hace `SEOHead.tsx`) en vez de manipulación DOM manual. Esto es más limpio y evita memory leaks.

### 3. Auto-generar slugs SEO-friendly al crear profesionales
Modificar el seed-pioneers y/o agregar lógica para que los profesionales sin slug reciban uno auto-generado basado en `nombre-categoria-ubicacion` (ej: `juan-perez-electricista-rafaela`).

### 4. Actualizar sitemap.xml estático
Actualizar `public/sitemap.xml` con dominio correcto (`chequealo.net`) y agregar página de install, campaigns, etc. que faltan. Este archivo servirá como fallback mientras el edge function no esté configurado con redirect.

## Archivos

| Archivo | Acción |
|---------|--------|
| `supabase/functions/generate-sitemap/index.ts` | Crear |
| `src/components/SEO/ProfessionalSEO.tsx` | Refactorizar a Helmet |
| `public/sitemap.xml` | Actualizar URLs y dominio |
| `supabase/functions/seed-pioneers/index.ts` | Agregar auto-slug en función de seeding |

## Nota Técnica

Como la app es una SPA en Cloudflare Pages, los crawlers de Google no ejecutan JavaScript inicialmente. El sitemap dinámico vía edge function es la pieza más importante para que Google descubra los perfiles. Los meta tags client-side funcionan porque Googlebot sí renderiza JavaScript en segunda pasada, pero el sitemap acelera el descubrimiento.

