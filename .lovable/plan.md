

# Auditoría de Seguridad — Reporte del Hacker Ético

## Veredicto general
El Programa Pioneros **no está en riesgo inmediato**, pero hay varias macanas que van de "te pueden molestar" a "te pueden romper el sistema". Las ordeno por gravedad.

---

## CRITICO — Riesgo alto

### 1. `ActualizarPassword.tsx`: Fallback demasiado permisivo (líneas 63-69)
Si un usuario llega a `/actualizar-password` **sin hash de recovery** pero tiene una sesión activa (porque ya estaba logueado), el código le muestra el formulario de cambio de contraseña **sin pedir la contraseña actual**.

**Escenario de ataque**: Si alguien deja la sesión abierta en un dispositivo compartido, cualquiera puede navegar a `/actualizar-password` y cambiarle la contraseña sin saber la anterior.

**Fix**: Cuando `isRecovery` se setea por sesión existente (no por `PASSWORD_RECOVERY` event ni por hash `type=recovery`), no mostrar el formulario. O pedir la contraseña actual como paso previo.

### 2. `Auth.tsx` línea 201: DNI viaja en la URL como query param
```
navigate(`/register?type=professional&email=...&name=...`)
```
El DNI se guarda en `sessionStorage` (mejor), pero el email y nombre completo viajan en la URL. Si el usuario comparte ese link o queda en el historial del navegador, se expone PII. No es catastrófico pero es datos personales en un lugar que no corresponde.

**Fix**: Mover todo a `sessionStorage` como ya hacés con el DNI.

---

## ALTO — Riesgo medio-alto

### 3. `has_free_access` es editable por el propio profesional
La columna `has_free_access` está en la tabla `professionals`. La policy de UPDATE dice:
```sql
Users can update their own professional profile
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid())
```
**Esto significa que cualquier profesional puede hacer:**
```javascript
supabase.from('professionals').update({ has_free_access: true }).eq('user_id', myId)
```
Y se otorga acceso premium ilimitado gratis. **Esto rompe todo el modelo de negocio del Programa Pioneros.**

**Fix**: Crear una policy restrictiva o usar un trigger que impida que `has_free_access` sea modificado por el propio usuario. Solo admins deberían poder cambiar ese campo. Opciones:
- Column-level security (Supabase no lo soporta nativo)
- Trigger BEFORE UPDATE que resetee `has_free_access` al valor anterior si `auth.uid() = user_id`
- Mover `has_free_access` a una tabla separada con RLS solo para admins

### 4. `SubscriptionAlert.tsx` muestra mensaje incorrecto
El componente dice "Programa Pioneros" y "365 días" pero se muestra para **cualquier** estado que no sea `active` ni `none`. Si un profesional tiene subscription `expired` o `payment_required`, ve el banner de Pioneros. Es confuso y engañoso.

---

## MEDIO — Riesgo medio

### 5. SEO Landing: Sin rate limiting ni cache
`CategoryLanding.tsx` hace una query a Supabase en **cada** page load. Si Google manda 100 crawlers simultáneos, son 100 queries. No hay cache. Con el `CATEGORY_MAP` de 40+ categorías y 5 ciudades, son 200+ URLs posibles, cada una golpeando la DB.

**Fix**: React Query con `staleTime` largo (5-10 min), o un edge function con cache headers.

### 6. `seed-pioneers`: Contraseñas UUID no son recuperables
Los Pioneros se crean con `crypto.randomUUID() + '-X1!'` como contraseña. Si bien el flujo de recovery ahora funciona, el email es ficticio (`@chequealo.net`). **Un Pionero no puede hacer recovery porque el email no existe realmente.** Si perdés la sesión del Pionero, está locked out para siempre.

**Nota**: Si los Pioneros son perfiles de vitrina y no se loguean nunca, esto no importa. Pero si alguna vez necesitan acceder, están fritos.

### 7. `professionals_public` view no filtra `is_blocked`
En `CategoryLanding.tsx` línea 45, filtrás manualmente `.eq('is_blocked', false)`. Pero la view `professionals_public` **ya debería** filtrar bloqueados. Si olvidás ese filtro en otro lugar, exponés profesionales bloqueados.

---

## BAJO — Molestias

### 8. Mapeo incompleto en `categoryMapping.ts`
Comparando con los datos del `seed-pioneers`, faltan categorías en el mapa:
- `Cuidado de Personas` (el map tiene `Cuidado de Personas` pero bajo `cuidadores` con `Cuidador/a de Adultos Mayores` - no matchea exactamente)
- No se cubre la variante `Electricidad` vs `Electricista` (los pioneers usan ambos)

### 9. `structuredData` en `CategoryLanding.tsx` línea 149
El wrapper `{ "@context": "wrapper", graphs: combinedStructuredData }` no es JSON-LD válido. Google lo va a ignorar. Debería ser un array de objetos JSON-LD inyectados como scripts separados o un `@graph`.

---

## Resumen de acciones necesarias

| # | Severidad | Acción | Esfuerzo |
|---|-----------|--------|----------|
| 3 | **CRITICO** | Proteger `has_free_access` con trigger/table separada | Medio |
| 1 | **CRITICO** | No mostrar form de password sin evento recovery real | Bajo |
| 2 | Alto | Sacar PII de query params | Bajo |
| 4 | Alto | Corregir lógica de `SubscriptionAlert` | Bajo |
| 5 | Medio | Agregar cache/React Query al landing SEO | Bajo |
| 9 | Bajo | Corregir structured data JSON-LD | Bajo |
| 8 | Bajo | Completar mapeo de categorías | Bajo |

El item **#3 es el más peligroso para el Programa Pioneros**. Cualquier profesional con conocimientos básicos de la consola del navegador puede darse acceso premium gratis. Recomiendo corregirlo antes de seguir sumando usuarios.

