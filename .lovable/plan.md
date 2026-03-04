

# Plan: Corregir buscador inteligente — resultados irrelevantes

## Diagnóstico del problema

El buscador tiene **3 problemas graves**:

1. **Sin filtro de relevancia mínima**: Cuando buscás "gomería", la query OR trae TODOS los profesionales que coinciden en CUALQUIER campo (nombre, descripción, ubicación). Un profesional con "goma" en su descripción aparece. No hay umbral mínimo de score, así que TODO se muestra.

2. **Sinónimos no filtran, solo expanden keywords**: Cuando el diccionario resuelve "gomería" → profesión "Gomería", debería filtrar POR esa profesión. En cambio, agrega "gomería" como keyword genérica que busca en todos los campos con OR.

3. **Acentos no normalizados**: "gomería" (con tilde) no coincide con "gomeria" (sin tilde) en el mapa de keywords. El `KEYWORD_TO_PROFESSION` tiene "gomeria" sin tilde pero el usuario escribe con tilde.

## Solución

| Archivo | Cambio |
|---------|--------|
| `src/hooks/useAdvancedSearch.ts` | 3 correcciones principales (ver abajo) |

### Corrección 1: Normalizar acentos en búsqueda
Agregar función `normalizeText` que quite acentos antes de buscar en el diccionario de sinónimos:
```ts
function normalizeText(text: string): string {
  return text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}
```

### Corrección 2: Cuando hay match de profesión, filtrar por profesión
Cuando el diccionario de sinónimos o fuzzy match resuelve a una profesión específica, usar esa profesión como **filtro principal** en vez de solo agregar keywords al OR genérico. Esto significa:
- Si "gomería" resuelve a profesión "Gomería", la query principal será `profession.ilike.%Gomería%` (prioridad alta)
- Los profesionales que no tienen esa profesión solo aparecen si coinciden fuertemente en servicios

### Corrección 3: Umbral mínimo de relevancia
Cuando hay un search query activo, filtrar resultados con `relevanceScore < umbral` (ej: score mínimo de 5). Esto elimina los resultados que aparecen solo por coincidencias vagas en descripción o nombre.

### Corrección 4: Normalizar keywords en SYNONYM_MAP
Asegurar que tanto las keys del `KEYWORD_TO_PROFESSION` como los términos de búsqueda pasen por `normalizeText` para que "gomería" == "gomeria".

## Resultado esperado
- Buscar "gomería" → solo muestra profesionales de Gomería y Gomería a Domicilio
- Buscar "plomero" → solo muestra plomeros
- Buscar "canilla" → resuelve a Plomero y filtra por esa profesión
- Resultados irrelevantes eliminados por umbral de score

