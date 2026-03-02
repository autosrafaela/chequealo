

# Plan: Agregar 19 nuevos profesionales al array PIONEERS

## Cambio

Agregar los 19 nuevos profesionales al final del array `PIONEERS` en `supabase/functions/seed-pioneers/index.ts`, manteniendo los 16 existentes. El total pasara a ser 35 profesionales.

La funcion ya tiene la logica de cleanup (elimina los `@chequealo.net` existentes) y re-crea todos, asi que al ejecutar el boton se limpiaran los anteriores y se crearan los 35.

## Archivo a modificar

| Archivo | Cambio |
|---------|--------|
| `supabase/functions/seed-pioneers/index.ts` | Agregar 19 entradas nuevas al array `PIONEERS` (linea 24, antes del cierre `]`) |

## Nuevas entradas

Gestores del Automotor (3), Mecanicos (4), Electricistas (2), Gasista (1), Plomeros (2), Carpinteros (2), Fletes (3), Jardineria (2).

