

# Plan: Agregar 23 nuevos profesionales al array PIONEERS

## Cambio

Agregar 23 nuevos profesionales al final del array `PIONEERS` en `supabase/functions/seed-pioneers/index.ts`. El total pasará de 35 a 58 profesionales.

Nuevas categorías: Abogado (1), Escribanía (1), Contador (2), Ingeniero (1), Nutricionista (4), Psicólogo (4), Kinesiólogo (4), Arquitecto (5), Veterinario (1).

## Archivo a modificar

| Archivo | Cambio |
|---------|--------|
| `supabase/functions/seed-pioneers/index.ts` | Agregar 23 entradas al array `PIONEERS` antes del cierre `]` |

Al ejecutar "Cargar Pioneros" desde el Admin Dashboard, se limpiarán los `@chequealo.net` existentes y se re-crearán los 58.

