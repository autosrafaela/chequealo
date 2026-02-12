

# Plan: Motor de Busqueda Inteligente con Sinonimos, Fuzzy Match y Cards Mejoradas

## Resumen

Optimizar el hook `useAdvancedSearch` para incluir un diccionario de sinonimos, busqueda difusa (fuzzy match), busqueda en rubros multiples (`professional_professions`), y priorizacion geografica. Ademas, actualizar las cards de resultados para mostrar foto, badge verificado y boton directo de WhatsApp.

---

## 1. Diccionario de Sinonimos

**Archivo:** `src/hooks/useAdvancedSearch.ts`

Crear un mapa de sinonimos al inicio del archivo que asocie terminos coloquiales con profesiones:

```text
'agua', 'cano', 'canilla', 'griferia', 'perdida de agua' -> 'Plomero'
'luz', 'corriente', 'termica', 'enchufe', 'cortocircuito' -> 'Electricista'
'defensa', 'juicio', 'legal', 'demanda', 'contrato' -> 'Abogado'
'aire', 'split', 'frio calor' -> 'Tecnico de Aire Acondicionado'
'pintar', 'pintura', 'paredes' -> 'Pintor'
'cerraduras', 'llave', 'puerta trabada' -> 'Cerrajero'
'piso', 'ceramico', 'porcelanato' -> 'Colocador de Pisos'
'plagas', 'cucarachas', 'ratas', 'fumigacion' -> 'Fumigador / Control de Plagas'
'auto', 'motor', 'frenos', 'aceite' -> 'Mecanico'
'muebles', 'madera', 'estantes' -> 'Carpintero / Ebanista'
'techo', 'gotera', 'membrana' -> 'Techista'
'alarma', 'seguridad', 'camaras' -> 'Instalador de Alarmas'
'internet', 'wifi', 'red' -> 'Instalador de Internet'
'celular', 'pantalla rota', 'telefono' -> 'Reparacion de Celulares'
'pc', 'computadora', 'notebook' -> 'Reparacion de Computadoras'
'limpieza', 'limpiar', 'hogar' -> 'Empleada Domestica / Servicio de Limpieza'
'mudanza', 'flete', 'transporte' -> 'Fletero / Mudanzas'
'ninera', 'cuidar ninos', 'babysitter' -> 'Cuidador/a de Ninos (Ninera)'
'mascotas', 'perro', 'gato', 'veterinaria' -> 'Veterinario'
'yoga', 'ejercicio', 'gym', 'entrenamiento' -> 'Entrenador Personal'
'foto', 'sesion', 'fotografia' -> 'Fotografo'
'diseno', 'logo', 'marca' -> 'Disenador Grafico'
'web', 'pagina', 'sitio', 'app' -> 'Desarrollador Web'
'contabilidad', 'impuestos', 'monotributo' -> 'Contador'
```

Logica: antes de ejecutar la query en Supabase, cada keyword del usuario se pasa por el mapa de sinonimos. Si un termino coincide, se expande la busqueda agregando el nombre de la profesion correspondiente como keyword adicional.

---

## 2. Fuzzy Match (Busqueda Difusa)

**Archivo:** `src/hooks/useAdvancedSearch.ts`

Implementar una funcion `fuzzyMatch` simple basada en distancia de Levenshtein simplificada que:

1. Compara cada keyword del usuario contra las profesiones conocidas
2. Si la distancia es menor o igual a 2 caracteres, agrega esa profesion como keyword
3. Ejemplo: "electrisista" (error) -> encuentra "Electricista" (distancia 1)

La funcion sera liviana (puro frontend, sin dependencias externas) y se ejecutara solo para keywords que no tuvieron coincidencia directa ni por sinonimos.

---

## 3. Busqueda en Rubros Multiples (professional_professions)

**Archivo:** `src/hooks/useAdvancedSearch.ts`

Agregar una tercera query paralela a la busqueda existente:

```typescript
const professionsQuery = supabase
  .from('professional_professions')
  .select('professional_id, profession')
  .or(keywords.map(k => `profession.ilike.%${k}%`).join(','));
```

Los `professional_id` resultantes se combinan con los de `professional_services` y `professionals_public_safe` para ampliar los resultados. Esto permite encontrar profesionales que registraron rubros personalizados (ej: "Lobbista") que no estan en el campo legacy `profession`.

---

## 4. Filtro Geografico - Priorizar "En Linea" en Rafaela

**Archivo:** `src/hooks/useAdvancedSearch.ts`

En el sistema de scoring (Paso 8), agregar:

- +15 puntos si `availability === 'available'` (En Linea)
- +10 puntos si `location` contiene "Rafaela"
- Combinados: +25 puntos extra para profesionales En Linea en Rafaela

Esto prioriza a los profesionales activos localmente sin excluir a los demas.

---

## 5. Cards de Resultados con WhatsApp

**Archivo:** `src/components/ProfessionalCard.tsx`

Modificar el card existente para:

- Agregar un boton verde de WhatsApp en la seccion de acciones (junto a "Ver Perfil" y "Pedir Presupuesto")
- El boton abre WhatsApp con un mensaje predeterminado usando `wa.me`
- Para obtener el telefono, se necesita una consulta adicional (o pasar phone como prop opcional)

Dado que las cards de busqueda usan la vista `professionals_public_safe` que NO incluye el telefono por seguridad, el boton de WhatsApp en la card redirigira al perfil publico del profesional donde si esta disponible el contacto. El boton dira "WhatsApp" y hara `navigate(/professional/${id})` con un scroll al area de contacto.

Cambios visuales adicionales:
- Asegurar que la foto del profesional sea prominente (ya lo es con w-16 h-16)
- Badge "Verificado" ya esta implementado con el icono Shield
- Agregar un fallback de silueta User cuando no hay foto (ya existe en AvatarFallback pero usar icono en lugar de iniciales)

---

## Archivos a modificar

| Archivo | Cambio |
|---------|--------|
| `src/hooks/useAdvancedSearch.ts` | Diccionario de sinonimos, fuzzy match, query a professional_professions, scoring geografico |
| `src/components/ProfessionalCard.tsx` | Agregar boton WhatsApp, mejorar fallback de avatar |

