

# Plan: Busqueda Imbatible - Mejoras Finales

## Analisis

La mayor parte de la logica ya esta implementada (sinonimos, fuzzy match, multicampo, prioridad geografica, busqueda en professional_professions). Los cambios necesarios son puntuales.

## Cambios

### 1. Expandir diccionario de sinonimos (useAdvancedSearch.ts)

Agregar terminos faltantes al SYNONYM_MAP existente:

- **Plomero / Gasista**: agregar `'baño'`, `'tanque'`, `'desagote'`, `'sifon'`
- **Tecnico de Aire Acondicionado**: agregar `'frio'`, `'frío'`, `'calefaccion'`
- **Tecnico en Refrigeracion**: agregar entrada nueva con `'heladera'`, `'freezer'`, `'refrigerador'`
- **Albañil**: agregar `'humedad'`, `'fisura'`, `'rajadura'`
- **Techista**: agregar `'filtracion'`, `'lluvia'`

### 2. Pantalla "Sin Resultados" mejorada (Search.tsx)

Reemplazar la card simple actual (lineas 168-181) por un diseño con:

- Icono de lupa con cara triste (SearchX de lucide-react)
- Titulo: "No encontramos lo que buscas..."
- Subtitulo contextual con el termino buscado
- Formulario ultra-corto con un solo campo de texto + boton "Avisarme"
- Al enviar, guardar en una tabla existente o mostrar toast de confirmacion
- Boton secundario "Limpiar filtros"

Dado que no existe una tabla para estas solicitudes, el formulario insertara en `contact_requests` con type `'search_request'` y el mensaje sera lo que el usuario busco. Alternativamente, si no queremos contaminar esa tabla, simplemente mostramos un toast de exito simulado con el mensaje "Te avisaremos cuando haya profesionales de [termino]".

Enfoque elegido: toast simple sin persistencia en DB (mas liviano, sin migracion).

### 3. Actualizacion automatica de rubros nuevos

La busqueda ya consulta `professional_professions` en cada ejecucion, por lo que rubros nuevos son encontrables al instante. No se necesita cambio adicional. La unica mejora es asegurar que `EditMyServices` invalide el cache de busqueda:

En `EditMyServices.tsx`, despues del guardado exitoso, agregar:
```typescript
queryClient.invalidateQueries({ queryKey: ['search'] });
```

Esto ya se implemento parcialmente en el cambio anterior. Solo necesitamos verificar que la invalidacion cubra las queries relevantes.

## Archivos a modificar

| Archivo | Cambio |
|---------|--------|
| `src/hooks/useAdvancedSearch.ts` | Expandir SYNONYM_MAP con terminos faltantes |
| `src/pages/Search.tsx` | Pantalla "Sin Resultados" con icono triste, mensaje contextual y mini-formulario |

