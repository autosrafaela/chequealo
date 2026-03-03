

# Plan: Guardar y eliminar logos generados

## Problema
Actualmente se puede guardar logos generados en Storage, pero no hay botón para eliminar los que no gustan. Además la sección de "Logos Guardados" solo se muestra si ya hay logos previos.

## Cambios en `src/components/admin/LogoManager.tsx`

1. **Agregar botón "Eliminar"** en cada card de logo guardado — llama `supabase.storage.from('logos').remove([path])` y refresca la lista
2. **Agregar estado `deleting`** para mostrar spinner durante la eliminación
3. **Diálogo de confirmación** antes de eliminar (usando AlertDialog o un simple confirm)
4. **Si el logo eliminado era el activo**, desactivarlo automáticamente de localStorage
5. **Importar `Trash2`** de lucide-react para el ícono de eliminar
6. **Mostrar siempre** la sección de logos guardados (con mensaje "No hay logos guardados aún" si está vacía)

## Archivo

| Archivo | Cambio |
|---------|--------|
| `src/components/admin/LogoManager.tsx` | Agregar función `handleDelete`, botón Eliminar en cada card, y lógica de limpieza |

