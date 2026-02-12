

# Plan: Rebranding de chequealo.ar a chequealo.net

## Resumen

Actualizar todas las referencias de dominio `.ar` a `.net` en toda la aplicacion: frontend, emails, edge functions, SEO, configuracion y documentacion. Aproximadamente 20+ archivos afectados.

---

## Alcance de cambios

### Regla general de reemplazo

| Patron actual | Reemplazo |
|---|---|
| `chequealo.ar` (dominio en URLs) | `chequealo.net` |
| `CHEQUEALO.AR` (texto legal) | `CHEQUEALO.NET` |
| `Chequealo.ar` (texto UI) | `Chequealo.net` |
| `info@chequealo.ar` | `info@chequealo.net` |
| `contacto@chequealo.ar` | `contacto@chequealo.net` |
| `noreply@chequealo.ar` | `noreply@chequealo.net` |
| `instagram.com/chequealo.ar` | `instagram.com/chequealo.net` (o el handle correcto) |
| `@chequealoar` (Twitter) | `@chequealonet` (o el handle correcto) |

**Nota:** Los textos que dicen solo "CHEQUEALO" (sin dominio) no se modifican.

---

## 1. Frontend - Componentes y Paginas

### `src/components/SEO/SEOHead.tsx`
- Linea 13: `BASE_URL` de `https://chequealo.ar` a `https://chequealo.net`
- Linea 99: email de contacto en structured data

### `src/components/SEO/ProfessionalSEO.tsx`
- Lineas 85, 137, 163, 166, 223, 227: todas las URLs canonicas y OG image fallback

### `src/components/SlugConfiguration.tsx`
- Lineas 171, 195, 232, 260: prefijo de URL visible y copiable

### `src/components/ProfileShareCard.tsx`
- Lineas 71, 73: `getProfileUrl()` URLs de perfil compartido

### `src/hooks/useGenerateShareCard.ts`
- Lineas 223, 227: texto del canvas "Chequealo.ar" -> "Chequealo.net"
- Lineas 394-395: displayUrl en la tarjeta de compartir

### `src/utils/utmHelpers.ts`
- Lineas 45-46: baseUrl para links compartidos con UTM

### `src/pages/Index.tsx`
- Linea 130: link de Instagram
- Linea 166: email de contacto en footer

### `src/pages/AISearch.tsx`
- Lineas 196, 199, 221, 232, 235, 272, 275, 336, 339: todas las referencias a "Chequealo.ar" en texto y URLs

### `src/pages/NotFound.tsx`
- Lineas 115, 118: email de contacto

### `src/pages/TermsOfService.tsx`
- Todas las menciones de "CHEQUEALO.AR" en el texto legal (aprox. 15+ ocurrencias)

### `src/components/FavoritesPanel.tsx`
- Linea 103: subject del email "Contacto desde Chequealo"

---

## 2. Configuracion y Estaticos

### `index.html`
- Linea 28: `og:url`
- Lineas 48, 51, 54: App Links URLs (iOS, Android, Web)
- Titulo y description ya dicen "Chequealo" sin ".ar", OK

### `public/sitemap.xml`
- Todas las URLs (9 entradas): reemplazar `chequealo.ar` por `chequealo.net`

### `public/manifest.json`
- Sin cambios necesarios (ya dice "Chequealo" sin dominio)

### `capacitor.config.ts`
- Linea 8: `url: 'https://chequealo.ar'` a `https://chequealo.net`

---

## 3. Edge Functions (Supabase)

### `supabase/functions/send-custom-auth-email/index.ts`
- Linea 197: `from: 'CHEQUEALO <noreply@chequealo.ar>'` a `noreply@chequealo.net`
- Copyright en templates HTML (ya dice solo "CHEQUEALO" sin dominio, OK)

### `supabase/functions/send-custom-auth-email/_templates/confirmation-email.tsx`
- Sin cambios (usa "CHEQUEALO" sin dominio)

### `supabase/functions/send-custom-auth-email/_templates/recovery-email.tsx`
- Sin cambios

### `supabase/functions/send-custom-auth-email/_templates/magic-link-email.tsx`
- Sin cambios

### `supabase/functions/billing-subscribe/index.ts`
- Lineas 30-31: agregar `chequealo.net` y `www.chequealo.net` a allowedDomains (mantener .ar temporalmente para transicion)

### `supabase/functions/billing-portal/index.ts`
- Lineas 22-23: agregar `chequealo.net` y `www.chequealo.net`

### `supabase/functions/create-payment-preference/index.ts`
- Lineas 29-30: agregar `chequealo.net` y `www.chequealo.net`

### `supabase/functions/send-push-notification/index.ts`
- Linea 52: email de VAPID a `contacto@chequealo.net`

---

## 4. Documentacion (MD files)

### Archivos a actualizar:
- `CHECKLIST_REGISTRO.md` - URLs de redirect
- `README_billing.md` - URLs de ejemplo
- `PROBLEMA_COMPARTIR_PERFILES.md` - URLs de ejemplo
- `PROBLEMA_META_TAGS_SOLUCION.md` - URLs de ejemplo
- `CLOUDFLARE_WORKER_SETUP.md` - configuracion de dominio
- `INSTRUCCIONES_WEB_PUSH.md` - email de contacto

---

## 5. Logo

Los logos existentes en `src/assets/` son:
- `chequealo-final-logo.png`
- `chequealo-logo.png`
- `chequealo-new-logo.png`
- `chequealo-transparent-logo.png`

Estos son archivos de imagen y no pueden ser editados programaticamente. Si alguno contiene ".ar" en el grafico, el usuario debera proporcionar nuevas versiones. El codigo no hace referencia textual a ".ar" en los nombres de archivo.

---

## Notas importantes

- Las edge functions de billing mantendran AMBOS dominios (.ar y .net) en la whitelist durante la transicion
- Los emails (noreply@, contacto@, info@) cambian a .net -- el usuario debe configurar el dominio de envio en Resend para chequealo.net
- El handle de Instagram `chequealo.ar` debe confirmarse si cambia o se mantiene
- El handle de Twitter `@chequealoar` debe confirmarse si cambia
