

# Plan: Fix SEO Landing — Slug-to-Profession Mapping

## The Problem (Confirmed)

The DB has real data like:
- Professions: `Cerrajero`, `Albañil`, `Aire Acondicionado`, `Plomero`, `Fumigaciones`, `Gomería a Domicilio`
- Locations: `Rafaela`, `Rafaela, Santa Fe`, `RAFAELA`, `San Cristóbal, Santa Fe`

Current code does `ilike('%cerrajeros%')` but `cerrajeros` (plural) won't match `Cerrajero` (singular). And `albaniles` won't match `Albañil` (ñ vs n). Every programmatic page would return 0 results and get `noindex`ed.

Location matching is less broken (`ilike('%rafaela%')` catches `Rafaela`, `RAFAELA`, `Rafaela, Santa Fe`) but still fragile.

## The Fix

### 1. Create `src/utils/categoryMapping.ts`

A mapping dictionary from URL slugs to exact DB profession values. Each entry maps a slug to an array of profession strings (to catch variants like `Plomero`, `Plomería`, `Plomero y Gasista`):

```typescript
export const CATEGORY_MAP: Record<string, { label: string; dbValues: string[] }> = {
  'cerrajeros': { label: 'Cerrajeros', dbValues: ['Cerrajero'] },
  'plomeros': { label: 'Plomeros', dbValues: ['Plomero', 'Plomería', 'Plomero y Gasista', 'Plomería y Gas', 'Sanitarios y Plomería'] },
  'electricistas': { label: 'Electricistas', dbValues: ['Electricista', 'Electricidad del Automotor'] },
  'albaniles': { label: 'Albañiles', dbValues: ['Albañil', 'Albañil y Pintor'] },
  'pintores': { label: 'Pintores', dbValues: ['Pintor', 'Albañil y Pintor'] },
  'gasistas': { label: 'Gasistas', dbValues: ['Gasista', 'Plomero y Gasista', 'Plomería y Gas'] },
  'aire-acondicionado': { label: 'Aire Acondicionado', dbValues: ['Aire Acondicionado', 'Técnico en Refrigeración'] },
  'fumigaciones': { label: 'Fumigaciones', dbValues: ['Fumigaciones'] },
  'gomerias': { label: 'Gomerías', dbValues: ['Gomería', 'Gomería a Domicilio'] },
  'fletes': { label: 'Fletes y Mudanzas', dbValues: ['Fletes', 'Fletero / Mudanzas', 'Fletes y Remolques'] },
  'carpinteros': { label: 'Carpinteros', dbValues: ['Carpintero', 'Carpintero / Ebanista'] },
  'herreros': { label: 'Herreros', dbValues: ['Herrero'] },
  'jardineros': { label: 'Jardineros', dbValues: ['Jardinería', 'Jardinero / Paisajista'] },
  'mecanicos': { label: 'Mecánicos', dbValues: ['Mecánico', 'Mecánica Ligera', 'Repuestos y Mecánica'] },
  'peluqueria': { label: 'Peluquería', dbValues: ['Peluquería', 'Barbería'] },
  'veterinarios': { label: 'Veterinarios', dbValues: ['Veterinario', 'Veterinaria y Peluquería'] },
  'limpieza': { label: 'Limpieza', dbValues: ['Limpieza de Tapizados', 'Limpieza y Mantenimiento'] },
  'tecnicos-pc': { label: 'Técnicos de PC', dbValues: ['Técnico de PC', 'Servicio Técnico PC/Celulares'] },
  'fotografos': { label: 'Fotógrafos', dbValues: ['Fotógrafo'] },
  'abogados': { label: 'Abogados', dbValues: ['Abogado'] },
  'contadores': { label: 'Contadores', dbValues: ['Contador'] },
  'arquitectos': { label: 'Arquitectos', dbValues: ['Arquitecto', 'Ingeniero'] },
  'pileteros': { label: 'Pileteros', dbValues: ['Piletero'] },
  'alarmas': { label: 'Alarmas y Seguridad', dbValues: ['Instalador de Alarmas', 'Instalador de Cámaras de Seguridad'] },
  // ... (all 70+ professions mapped)
};

export const CITY_MAP: Record<string, { label: string; dbPattern: string }> = {
  'rafaela': { label: 'Rafaela', dbPattern: 'Rafaela' },
  'san-cristobal': { label: 'San Cristóbal', dbPattern: 'San Cristóbal' },
  'san-jorge': { label: 'San Jorge', dbPattern: 'San Jorge' },
  'susana': { label: 'Susana', dbPattern: 'Susana' },
  // expandable as coverage grows
};
```

### 2. Update `src/pages/CategoryLanding.tsx`

Replace the blind `ilike` with controlled queries:

- Import `CATEGORY_MAP` and `CITY_MAP`
- After parsing the slug, look up `CATEGORY_MAP[parsed.category]`
- If not found → render empty state + `noindex` (invalid slug)
- If found → use `label` for H1/meta, and query with `.in('profession', mapping.dbValues)` instead of `ilike`
- For city: use `ilike('location', '%${cityMapping.dbPattern}%')` (ilike is fine here since it's an exact city name, case-insensitive)

### 3. Update `src/utils/seoSlug.ts`

- `deslugify()` should no longer be the source of labels — the mapping dict provides proper accented labels
- Keep `parseCategorySlug()` as-is for URL parsing

## Files to change
- **Create**: `src/utils/categoryMapping.ts`
- **Edit**: `src/pages/CategoryLanding.tsx` — swap ilike for mapped `.in()` query
- **Minor edit**: `src/utils/seoSlug.ts` — no functional changes needed, mapping overrides labels

