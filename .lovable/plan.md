

# Plan: El Resplandor VIP — Tarjetas Premium con Brillo Dorado

## Análisis del Hacker Ético

**Hallazgo clave**: No existe un campo `plan_tier` ni `VIP` en la DB. Los planes se llaman `Profesional`, `Emprendedor`, `Premium` en `subscription_plans`. El campo `featured_listing: boolean` ya indica si el plan incluye listado destacado. Hay también `has_free_access` para Pioneros.

**El problema**: Las tarjetas (`ProfessionalCard`, `EnhancedProfessionalCard`) no reciben info de suscripción. Las vistas públicas (`professionals_public`) no exponen el plan del profesional — y **no deberían**, porque exponer datos de billing al público es un riesgo de privacidad.

**La solución**: Crear una vista pública que solo exponga `is_vip: boolean` (sin detallar plan ni precio). Un profesional es VIP si tiene `featured_listing = true` en su plan activo Y su suscripción está `active` (o `has_free_access = true` con rating >= 4).

## Arquitectura

```text
subscription_plans.featured_listing = true
         +
subscriptions.status = 'active'        →  professionals_vip_status (view)
         +                                   id | is_vip
professionals.rating >= 4.0
```

## Archivos a crear/modificar

### 1. SQL Migration — Vista `professionals_vip_status`
Vista que expone solo `professional_id` y `is_vip` basado en:
- Subscription activa con plan que tiene `featured_listing = true`, O `has_free_access = true`
- Rating >= 4.0
- No bloqueado

### 2. Hook `src/hooks/useVipStatus.ts`
Hook ligero que consulta `professionals_vip_status` para un array de IDs de profesionales. Usa React Query con `staleTime: 5min` para no bombardear la DB.

### 3. Editar `src/components/EnhancedProfessionalCard.tsx`
- Recibir prop `isVip?: boolean`
- Si `isVip && rating >= 4`:
  - Border dorado `border-2 border-[#D4AF37]`
  - Glow: `shadow-[0_0_20px_rgba(212,175,55,0.35)]`
  - Badge "SELECCIÓN PREMIUM" en esquina superior derecha (fondo negro, texto dorado, font sans-serif)
- Animación hover amplificada para VIP

### 4. Editar `src/components/ProfessionalCard.tsx`
- Misma lógica visual que EnhancedProfessionalCard

### 5. Editar `src/components/LatestProfessionals.tsx` y `src/pages/Search.tsx`
- Importar `useVipStatus` y pasar `isVip` a cada tarjeta

### 6. CSS en `src/index.css`
- Clase `.card-vip-glow` con keyframe de pulso dorado sutil

## Regla de seguridad comercial

La doble condición `is_vip AND rating >= 4` se evalúa tanto en la vista SQL como en el componente (defense in depth). Un profesional que pague Premium pero tenga 2 estrellas NO brilla.

## Detalle técnico

La vista SQL:
```sql
CREATE VIEW professionals_vip_status AS
SELECT p.id, 
  CASE WHEN (
    p.rating >= 4.0 
    AND NOT p.is_blocked
    AND (
      p.has_free_access = true 
      OR EXISTS (
        SELECT 1 FROM subscriptions s 
        JOIN subscription_plans sp ON s.plan_id = sp.id
        WHERE s.professional_id = p.id 
        AND s.status = 'active'
        AND sp.featured_listing = true
      )
    )
  ) THEN true ELSE false END as is_vip
FROM professionals p;
```

