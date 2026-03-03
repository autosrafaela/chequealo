

# Fix: Hacer visible la pestaña Logo en Admin Dashboard

## Problema
La pestaña "Logo" existe en el código pero está al final de 21 tabs en una barra scrollable. En tu screenshot se ve que el scroll termina en "Carus..." (Carrusel) y Logo queda oculto después de "Novedades".

## Solución
Mover la pestaña "Logo" a una posición más visible, justo después de "Configuración" (posición ~12), ya que es una herramienta de branding/configuración. Esto la coloca antes de BI, Monitor, SEO, Carrusel y Novedades.

## Archivo a modificar
| Archivo | Cambio |
|---------|--------|
| `src/pages/AdminDashboard.tsx` | Mover el `TabsTrigger value="logo"` de la línea 601 a después de la línea 595 (después de Configuración) |

