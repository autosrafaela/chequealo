

# Auditoría de Seguridad + SEO — Chequealo.net

## NIVEL CRITICO — Te pueden romper el sistema HOY

### 1. `seed-gomerias` es una puerta abierta de par en par

`verify_jwt = false` en config.toml Y **no valida JWT ni rol admin en el código**. Cualquier persona en el planeta puede hacer:

```bash
curl -X POST https://rolitmcxydholgsxpvwa.supabase.co/functions/v1/seed-gomerias
```

Y crear usuarios en tu tabla `auth.users` con `service_role_key`. **Esto es gravísimo.** A diferencia de `seed-pioneers` (que sí valida admin role internamente), `seed-gomerias` confía ciegamente en que "es una función de una sola vez". Nunca desactivaste la función.

**Impacto Pioneros**: Un atacante podría crear usuarios basura que ensucien el directorio, diluyan la credibilidad del programa y generen datos falsos.

**Fix**: Agregar validación de JWT + admin role en `seed-gomerias` (como ya tiene `seed-pioneers`), o directamente eliminar la función.

---

### 2. Contraseña hardcodeada de Pioneros: `Pionero2026!`

En `seed-pioneers/index.ts` línea 243: todos los Pioneros se crean con la misma contraseña. Cualquiera que lea este repo (o lo adivine) puede loguearse como **cualquier Pionero** y:
- Cambiar su perfil, fotos, descripción
- Responder reseñas como si fueran ellos
- Acceder a sus mensajes y datos de contacto
- Modificar su agenda

**Fix**: Generar contraseñas aleatorias por usuario (ej: `crypto.randomUUID()`) y no loguear a nadie con esas cuentas (son perfiles vitrina).

---

### 3. `check-subscription-status`: `verify_jwt = false` + no valida quién consulta

Cualquiera puede consultar el estado de suscripción de cualquier `professional_user_id` sin autenticarse. Es information disclosure.

---

### 4. `send-push-notification`: `verify_jwt = false` + sin auth check

Cualquiera puede enviar push notifications a cualquier usuario. Spam, phishing, impersonación.

---

### 5. DNI expuesto en URL (Auth.tsx línea 192)

```typescript
navigate(`/register?type=professional&email=...&name=...&dni=...`);
```

El DNI viaja como query parameter en la URL. Queda en historial del navegador, logs de servidor, analytics, referrer headers. Datos personales sensibles en texto plano.

**Fix**: Usar state de React Router o sessionStorage temporal.

---

## NIVEL ALTO

### 6. Email confirmation deshabilitado

`supabase/config.toml` línea 56: `enable_confirmations = false`. Cualquiera puede registrar cuentas con emails que no le pertenecen. Un atacante puede crear un perfil profesional con el email de otra persona y suplantar su identidad.

### 7. `handleAddAdmin` busca por nombre, no por email

`AdminDashboard.tsx` línea 325: `ilike('full_name', '%${newAdminEmail}%')`. Esto:
- Busca con LIKE (match parcial) — si escribís "Juan" podés darle admin al primer Juan que aparezca
- El campo se llama `newAdminEmail` pero no busca por email
- Si hay colisión de nombres, le das admin al primero que devuelva la query

### 8. CORS `Access-Control-Allow-Origin: '*'` en TODAS las edge functions

Incluyendo `admin-delete-user`, `billing-subscribe`, `create-payment-preference`. Cualquier sitio malicioso puede hacer requests a tus edge functions si el usuario tiene sesión activa. Deberías restringir a `https://chequealo.ar` y `https://chequealo.net`.

### 9. `delete-my-account` no borra tablas nuevas

Faltan: `conversations`, `messages`, `chat_quotes`, `combo_reservations`, `combos`, `agenda_slots`, `availability_slots`, `certifications`, `bookings`, `push_subscriptions`, `professional_professions`, `professional_rankings`, `pro_routes`, `campaign_events`, `badges/user_achievements`. El usuario "se borra" pero deja data huérfana por todos lados. Mismo problema en `admin-delete-user`.

---

## NIVEL MEDIO

### 10. Sin rate limiting en login/signup

No hay throttling en `handleLogin` ni `handleSignup`. Un atacante puede hacer brute-force de contraseñas. Supabase tiene rate limiting nativo pero es generoso (default ~30 req/s).

### 11. `useUserRole` loguea info sensible

Líneas 31 y 38: `console.log('[useUserRole] adminCheck', { userId, adminCheck })`. En producción, cualquiera con devtools ve si un usuario es admin o no, lo que ayuda a un atacante a mapear targets.

### 12. Falta validación de input en `signUp`

No se sanitiza `fullName` ni `username` antes de guardarlos en `user_metadata`. Podrían inyectar HTML/scripts que se rendericen en otro lado (stored XSS si algún componente muestra el nombre sin escapar).

---

## SEO — Thin Content / Spam Detection

### 13. Tu alerta es correcta: las landing pages SEO programáticas son thin content

`SeoLanding.tsx` hace redirect inmediato a `/professional/{id}`. Google ve un redirect, no contenido único. Y las páginas de perfil individual son todas iguales cambiando nombre/profesión.

**Plan para evitar penalización:**

Cada landing programática (`/plomero/rafaela`, `/electricista/rosario`) debe ser una **página real con contenido dinámico único**:

- H1 dinámico: "5 Plomeros Disponibles en Rafaela Hoy"
- Listado de profesionales reales de esa categoría+ciudad (con rating, review count)
- Rating promedio de la categoría en esa ciudad
- Texto generado con variables: "Encontrá plomeros verificados en Rafaela con un rating promedio de 4.7/5 basado en 23 reseñas reales"
- FAQs dinámicos por categoría (schema markup)
- Mapa con ubicaciones
- Sin redirect — renderizar contenido propio

**Cambios necesarios:**
1. Crear `src/pages/CategoryLocationLanding.tsx` — página real con query a `professionals` filtrada por profesión + location
2. Agregar ruta `/servicios/:profession/:location` en el router
3. El sitemap dinámico debe incluir estas rutas combinatorias
4. Cada página debe tener `<SEOHead>` con structured data de tipo `ItemList` + `Service`

---

## Resumen ejecutivo

| Severidad | Hallazgo | Riesgo Pioneros |
|-----------|----------|-----------------|
| CRITICO | seed-gomerias sin auth | SI — pueden crear usuarios falsos |
| CRITICO | Contraseña Pionero2026! hardcodeada | SI — pueden suplantar Pioneros |
| CRITICO | push-notification sin auth | SI — spam a Pioneros |
| ALTO | Email confirmation off | SI — suplantación de identidad |
| ALTO | CORS wildcard en funciones admin | Medio |
| ALTO | delete-my-account incompleto | Bajo |
| MEDIO | DNI en URL | Bajo |
| MEDIO | Rate limiting ausente | Medio |
| SEO | Thin content programático | Futuro |

**Prioridad 1 (hoy)**: Asegurar `seed-gomerias`, cambiar contraseñas de Pioneros, proteger `send-push-notification` y `check-subscription-status`.

**Prioridad 2 (esta semana)**: Habilitar email confirmation, restringir CORS, completar cascade deletes, sacar DNI de URLs.

**Prioridad 3 (próximo sprint)**: Landing pages SEO con contenido dinámico real.

