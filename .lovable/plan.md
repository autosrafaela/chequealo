

# Plan: Agregar 5 gomerías a la base de datos

Las 5 gomerías ya están incluidas en la Edge Function `seed-pioneers`. La forma más directa es invocar esa función, que las creará automáticamente con usuarios ficticios `@chequealo.net`, verificados y con acceso fundador.

## Acción

Invocar la Edge Function `seed-pioneers` (POST, requiere auth de admin). Esto:
1. Limpia pioneros `@chequealo.net` anteriores
2. Re-crea los 115 profesionales del array PIONEERS (incluyendo las 5 gomerías)

**Alternativa más quirúrgica**: Si no querés re-crear todos los pioneros, puedo insertar solo las 5 gomerías directamente en la DB creando usuarios auth + profiles + professionals con una migración SQL o invocando la función con un subset.

**Recomendación**: Invocar `seed-pioneers` ya que es idempotente (limpia y recrea).

