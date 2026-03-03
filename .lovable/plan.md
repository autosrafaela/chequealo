

# Fix: Pestañas cortadas al final en Admin Dashboard

## Problema
Las últimas pestañas (Carrusel, Novedades) se cortan porque el `pr-6` no es suficiente padding al final del scroll horizontal. Los últimos items quedan parcialmente ocultos.

## Solución
Aumentar el padding derecho de la `TabsList` de `pr-6` a `pr-16` para dar más espacio de scroll al final, asegurando que las últimas pestañas sean completamente visibles.

## Archivo
| Archivo | Cambio |
|---------|--------|
| `src/pages/AdminDashboard.tsx` | Cambiar `pr-6` → `pr-16` en el className de `TabsList` (línea 584) |

