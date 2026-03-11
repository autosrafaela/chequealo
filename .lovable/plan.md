

# Plan: SEO Programático — Landing Pages Dinámicas por Categoría+Ciudad

## Ruta

`/profesionales/:categorySlug` donde `categorySlug` = `cerrajeros-en-rafaela`, `plomeros-en-buenos-aires`, etc.

El componente parsea el slug separando por `-en-` para extraer categoría y ciudad.

## Archivos

### 1. Crear `src/pages/CategoryLanding.tsx`
Página completa con:

- **Parseo del slug**: Split por `-en-` → `categoria` + `ciudad`. Desnormalizar acentos no es necesario porque la DB se consulta con `ilike`.
- **Query Supabase**: `professionals_public` filtrado por `ilike('profession', '%categoria%')` + `ilike('location', '%ciudad%')` + `is_verified = true`.
- **H1 dinámico**: "Los mejores {Categoría} en {Ciudad}" con conteo: "Encontramos {N} profesionales verificados".
- **Stats agregados**: Rating promedio calculado client-side del resultado.
- **SEOHead**: Title `{Categoría} en {Ciudad} | Chequealo.net`, description con stats dinámicos, structured data `ItemList`.
- **noindex si vacío**: Si 0 resultados → `<SEOHead noIndex={true} />` + estado vacío amigable con link a `/search`.
- **Listado**: Reutiliza `ProfessionalCard` existente para mostrar cada profesional.
- **FAQs dinámicos**: 3-4 preguntas generadas con variables (categoría, ciudad, count, rating) + schema FAQ.
- **Header + BottomNavigation** para consistencia.

### 2. Editar `src/App.tsx`
- Agregar lazy import: `const CategoryLanding = lazy(() => import("./pages/CategoryLanding"));`
- Agregar ruta **antes** del catch-all `/:slug`: `<Route path="/profesionales/:categorySlug" element={<CategoryLanding />} />`

### 3. Crear `src/utils/seoSlug.ts`
Utilidad para:
- `parseCategorySlug(slug)` → `{ category, city }` (split por `-en-`)
- `buildCategorySlug(category, city)` → slug sanitizado
- `deslugify(slug)` → texto legible (guiones → espacios, capitalize)

No se requieren cambios en la DB ni migraciones. Se usa la vista `professionals_public` existente que ya tiene `profession`, `location`, `rating`, `review_count`.

