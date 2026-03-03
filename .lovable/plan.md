

# Plan: URL con profesión para mejor indexación SEO

## Problema
Actualmente los perfiles sin slug personalizado muestran la URL con UUID: `/professional/3e71ac40-fd61-...`. Esto es malo para SEO. El usuario quiere que se muestre la profesión en la URL automáticamente (ej: `/fletes-mudanzas-y-cargas-rosario`), pero solo cuando NO tienen un slug personalizado.

## Lógica
- **Con slug personalizado** (configurado por el profesional): mantener `/:slug` → sin cambios
- **Sin slug personalizado**: auto-generar un slug SEO-friendly con formato `profesion-nombre-ciudad` y reemplazar la URL del navegador

## Cambios

| Archivo | Cambio |
|---------|--------|
| `src/pages/ProfessionalProfile.tsx` | En el `useEffect` (línea 97-111), cuando el profesional NO tiene slug personalizado, generar un slug automático con `profession-fullname-location` y hacer `window.history.replaceState` a `/:autoSlug` |
| `src/pages/ProfessionalProfileBySlug.tsx` | En la query, además de buscar por slug exacto en DB, intentar parsear el slug como auto-generado (buscar por profesión/nombre/ubicación) para resolver el perfil |
| `src/utils/utmHelpers.ts` | Actualizar `getProfessionalShareUrl` para usar el slug (personalizado o auto-generado) en vez del UUID cuando sea posible |
| `src/components/ProfileShareCard.tsx` | Asegurar que los links compartidos usen el slug SEO-friendly |

## Función helper de auto-slug

```ts
// Genera slug SEO: "fletes-juan-perez-rosario"
function generateAutoSlug(profession: string, fullName: string, location: string): string {
  return [profession, fullName, location]
    .join('-')
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // quitar acentos
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 80);
}
```

## Flujo
1. Usuario visita `/professional/:uuid` → se carga el perfil
2. Si tiene slug personalizado → `replaceState` a `/:customSlug` (ya funciona)
3. Si NO tiene slug personalizado → generar auto-slug → `replaceState` a `/:autoSlug`
4. Si alguien visita `/:autoSlug` directamente → `ProfessionalProfileBySlug` intenta buscar por slug en DB; si no encuentra, parsea como auto-slug y busca por coincidencia de profesión/nombre/ubicación
5. Los links compartidos (WhatsApp, etc.) usan el slug SEO-friendly en vez del UUID

