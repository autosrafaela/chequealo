

# Plan: Corregir EditMyServices - Rubros personalizados y guardado

## Problema actual

1. Cuando el usuario escribe un rubro que no existe en la lista (ej: "Lobbista"), solo aparece un link "Sugerirlo aqui" que requiere pasos extra innecesarios
2. No hay invalidacion del cache de React Query despues de guardar, por lo que el perfil publico no refleja los cambios inmediatamente

## Cambios

### Archivo: `src/components/EditMyServices.tsx`

**A. Opcion "Agregar como nueva profesion" en el dropdown**

Cuando `searchTerm` tiene texto y no hay coincidencia exacta en la lista, mostrar como primera opcion del dropdown:

```
+ Agregar "Lobbista" como nueva profesion
```

Esto reemplaza el flujo actual de "Sugerirlo aqui" + campo de texto separado. Se elimina la seccion de sugerencia manual ya que queda integrada en el dropdown.

Logica:
- Si `searchTerm.length >= 2` y no existe un rubro con ese nombre exacto en `serviceCategories` ni en `rubros`, mostrar la opcion de agregar al inicio del dropdown
- La opcion aparece incluso si hay resultados parciales (ej: buscar "Lob" muestra resultados de lista + la opcion de agregar "Lob")
- Solo aparece como opcion unica cuando no hay coincidencias en la lista

**B. Invalidacion de cache React Query**

Despues del guardado exitoso, invalidar las queries de React Query para que el perfil publico se actualice:

```typescript
import { useQueryClient } from '@tanstack/react-query';

// En handleSave, despues del insert exitoso:
queryClient.invalidateQueries({ queryKey: ['professional', professionalData.id] });
```

**C. Limpieza**

- Eliminar los estados `showSuggestion` y `customRubro` ya que no se necesitan
- Eliminar el bloque JSX de sugerencia manual (lineas 311-342)
- El feedback visual (toast de exito/error) ya existe y funciona correctamente

## Archivo a modificar

| Archivo | Cambio |
|---------|--------|
| `src/components/EditMyServices.tsx` | Agregar opcion inline de rubro custom en dropdown, invalidar cache, limpiar codigo de sugerencia manual |

