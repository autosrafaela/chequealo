

# Plan: Corregir búsqueda de "Gomería" en el buscador inteligente

## Problema
El `SYNONYM_MAP` en `useAdvancedSearch.ts` no incluye "Gomería" ni "Gomería a Domicilio" como profesiones. Cuando se busca "gomería", el fuzzy matching (Levenshtein) lo empareja incorrectamente con profesiones no relacionadas, mostrando resultados irrelevantes.

## Solución

| Archivo | Cambio |
|---------|--------|
| `src/hooks/useAdvancedSearch.ts` | Agregar "Gomería" y "Gomería a Domicilio" al `SYNONYM_MAP` con sinónimos relevantes (neumáticos, auxilio, rueda, cubierta, pinchadura, etc.) |
| `src/hooks/useAISearch.ts` | Agregar mappings de gomería al `problemMappings` local para el fallback de búsqueda AI |

## Entradas a agregar en SYNONYM_MAP

```ts
'Gomería': ['neumatico', 'neumaticos', 'cubierta', 'cubiertas', 'rueda', 'pinchadura', 'llanta'],
'Gomería a Domicilio': ['gomeria', 'auxilio', 'auxilio mecanico', 'goma', 'gomas', 'pinchada', 'rueda pinchada'],
```

También agregar "gomería" y sinónimos al `problemMappings` en `useAISearch.ts`.

