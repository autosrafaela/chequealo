

# Plan: Corregir 2 bugs críticos del buscador inteligente

## Problema 1: Sugerencias AI muestran JSON crudo
La imagen muestra que las sugerencias IA muestran `\`\`\`json`, `[`, `]` como líneas individuales. Esto pasa porque el edge function `ai-search-enhance` devuelve el contenido con formato markdown (```json ... ```), y el parsing en `useAISearch.ts` no lo limpia antes de hacer `JSON.parse` o split por `\n`.

## Problema 2: La query de búsqueda llega con comillas literales
La URL muestra `q=%22gomerías+neumáticos+reparación%22` — las comillas `"` son parte del query. Esto pasa porque:
1. `intelligentSearch("gomerias")` llama a la AI, que devuelve `"gomerías neumáticos reparación"` (con comillas)
2. Ese string CON comillas se usa como `finalQuery`
3. En `useAdvancedSearch`, las comillas rompen los filtros `.ilike.%"gomerías%` — nunca matchea nada

## Solución

| Archivo | Cambio |
|---------|--------|
| `src/hooks/useAISearch.ts` | **2 fixes**: (1) Limpiar markdown/comillas del response AI en `searchWithAI` y `generateSuggestions`. (2) Priorizar el fallback local (`parseQueryLocally`) ANTES de llamar a la AI, ya que el diccionario local es más confiable y rápido |
| `src/components/IntelligentSearch.tsx` | Sanitizar sugerencias: filtrar líneas vacías, quitar markdown formatting (```json, [, ]) |

### Fix 1: Sanitizar respuesta AI (`useAISearch.ts`)
```ts
function cleanAIResponse(text: string): string {
  return text
    .replace(/```json\s*/gi, '')
    .replace(/```\s*/gi, '')
    .replace(/^["']+|["']+$/g, '') // quitar comillas envolventes
    .trim();
}
```
Aplicar en `searchWithAI` al resultado `data?.enhancedQuery` y en `generateSuggestions` filtrar líneas que sean solo `[`, `]`, vacías, o markdown.

### Fix 2: Priorizar fallback local (`useAISearch.ts`)
Invertir el orden en `intelligentSearch`: primero intentar `parseQueryLocally`. Si el resultado local resuelve a una profesión conocida (está en el diccionario), usarlo directamente sin llamar a la AI. Solo llamar a la AI si el fallback local no encuentra match.

Esto es más rápido, más confiable, y evita que la AI devuelva queries con comillas o formatos rotos.

### Fix 3: Filtrar sugerencias basura (`IntelligentSearch.tsx`)
En `generateAISuggestions`, filtrar sugerencias que sean solo puntuación, markdown, o menores a 5 caracteres.

## Resultado esperado
- Sugerencias IA limpias, sin JSON crudo
- Buscar "gomerias" → resuelve localmente a "gomería" → filtra por profesión Gomería → resultados correctos
- Sin comillas literales en la URL de búsqueda

