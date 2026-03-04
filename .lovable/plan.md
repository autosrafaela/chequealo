

# Plan: Corregir búsqueda — resultados irrelevantes para términos de profesión directos

## Diagnóstico

Cuando se busca "psiquiatra":

1. `parseQueryLocally` no tiene "psiquiatra" en su diccionario → no resuelve
2. `intelligentSearch` cae al fallback AI → la AI expande a "psiquiatra consulta salud mental"
3. En `useAdvancedSearch`, las keywords "consulta", "salud", "mental" no están en `SYNONYM_MAP` → **no hay matchedProfessions**
4. Se ejecuta búsqueda broad OR en TODOS los campos (nombre, descripción, ubicación) con las 4 keywords
5. El MIN_SCORE es solo 5 (sin match de profesión) → pasan profesionales irrelevantes que tienen "salud" o "consulta" en su descripción

**Raíz del problema**: La AI expande innecesariamente términos que ya son nombres de profesión, y el buscador no detecta que "psiquiatra" ES una profesión.

## Solución (2 archivos)

### 1. `src/hooks/useAdvancedSearch.ts`

- En `resolveSearch`, además de buscar keywords individuales, buscar también la **query completa** contra los nombres de profesión (fuzzy match)
- Cuando no hay `matchedProfessions` pero SÍ hay resultados cuya `profession` coincide con algún keyword, **post-filtrar**: si existen resultados con match directo en profession, eliminar los que no tienen match en profession
- Esto resuelve el caso genérico: cualquier profesión que se escriba directamente (psiquiatra, veterinario, etc.) filtrará correctamente aunque no esté en el SYNONYM_MAP

### 2. `src/hooks/useAISearch.ts`

- En `intelligentSearch`: si la query es corta (1-2 palabras), **no llamar a la AI**. Devolver la query tal cual. Esto evita que la AI expanda "psiquiatra" a "psiquiatra consulta salud mental"
- Solo llamar a la AI para queries largas/descriptivas (3+ palabras) donde realmente puede agregar valor

## Resultado esperado
- "psiquiatra" → muestra solo el psiquiatra, sin expansión AI
- "canilla que gotea" → resuelve localmente a "plomero" (3+ palabras, pero el local lo atrapa)
- "necesito alguien que arregle mi techo" → 3+ palabras, sin match local → AI ayuda
- Cualquier profesión escrita directamente se filtra correctamente

