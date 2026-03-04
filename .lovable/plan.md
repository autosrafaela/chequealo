

# Plan: Agregar 5 profesionales de Gomería al seed-pioneers

## Cambios

| Archivo | Cambio |
|---------|--------|
| `supabase/functions/seed-pioneers/index.ts` | Agregar 5 nuevos profesionales al array `PIONEERS` |

## Nuevos profesionales a agregar

1. Cesana Neumáticos (Auxilio) - Gomería a Domicilio
2. Auxilios y Neumáticos VF - Gomería a Domicilio
3. Gomería Móvil Cristian 24hs - Gomería a Domicilio
4. Neumáticos Debona (Consultas) - Gomería
5. Gomería Rafaela Urgencias - Gomería a Domicilio

## Nota
Algunos teléfonos coinciden con profesionales existentes en el array (Cesana Neumáticos, Fletes y Auxilios VF, Mundo Servicios, Cerrajería De Urgencias). Se agregarán como entradas separadas con sus nuevas categorías, lo que generará emails diferentes basados en el slug del nombre (no del teléfono, ya que colisionarían). Verificaré si el seed usa teléfono como email — si es así, los duplicados serán omitidos automáticamente por el `createUser` que detecta emails existentes.

Después de actualizar el archivo, será necesario **re-deployar** la función y **ejecutarla desde el panel admin** para que se carguen los nuevos profesionales.

