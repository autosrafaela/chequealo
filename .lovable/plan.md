

# Plan: Lead Tracking en WhatsApp — Tabla `lead_clicks` + Fire-and-Forget INSERT

## Qué se hace

Cada clic en WhatsApp (en el perfil, en las tarjetas, en favoritos) registra un INSERT silencioso en `lead_clicks` antes de abrir WhatsApp. Si el INSERT falla, WhatsApp se abre igual.

## Hallazgos del Hacker Ético

1. **Ya tenés `campaign_events`** con `whatsapp_click` — pero solo se usa en las 3 landing pages de campañas. Los clics de WhatsApp desde perfiles y tarjetas **no se trackean**. Ahí perdés la data más importante.
2. **`ProfessionalCard.tsx` no abre WhatsApp directo** — navega a `/professional/{id}?contact=whatsapp`. O sea que el clic real pasa en `WhatsAppContactButton` dentro de `ProfessionalProfile`. Eso ya es un solo punto de captura, lo cual facilita.
3. **`EnhancedProfessionalCard.tsx`** tiene un botón "WhatsApp" que navega a `#contact` en el perfil. Mismo caso.
4. **No hay riesgo para Pioneros** en este cambio. Es solo lectura de datos agregados.

## Arquitectura

```text
User clicks WhatsApp → fire-and-forget INSERT → open wa.me (always)
                              ↓
                     lead_clicks table
                     (anon INSERT, admin SELECT)
```

## Archivos

### 1. SQL Migration — Tabla `lead_clicks`

```sql
CREATE TABLE public.lead_clicks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id uuid NOT NULL,
  clicker_id uuid,              -- NULL if anonymous
  source text DEFAULT 'profile', -- 'profile', 'card', 'favorites', 'campaign'
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.lead_clicks ENABLE ROW LEVEL SECURITY;

-- Anyone can insert (fire-and-forget, no auth required)
CREATE POLICY "Anyone can insert lead clicks"
  ON public.lead_clicks FOR INSERT
  WITH CHECK (true);

-- Only admins can read
CREATE POLICY "Admins can read lead clicks"
  ON public.lead_clicks FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- No update/delete for anyone except admins
CREATE POLICY "Admins can manage lead clicks"
  ON public.lead_clicks FOR ALL
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Index for analytics queries
CREATE INDEX idx_lead_clicks_professional ON public.lead_clicks(professional_id);
CREATE INDEX idx_lead_clicks_created ON public.lead_clicks(created_at);
```

### 2. Edit `src/components/WhatsAppContactButton.tsx`

Add `professionalId` prop. Before opening WhatsApp, do a fire-and-forget:

```typescript
// Fire-and-forget — never blocks WhatsApp opening
supabase.from('lead_clicks').insert({
  professional_id: professionalId,
  clicker_id: user?.id || null,
  source
}).then(() => {}).catch(() => {});
```

Then immediately open WhatsApp (existing logic unchanged).

### 3. Edit callers to pass `professionalId`

- `ProfessionalProfile.tsx` — already has the professional ID, pass it to `<WhatsAppContactButton>`
- `FavoritesPanel.tsx` — pass `professionalId={professional.id}` and `source="favorites"`

### 4. Minor: `ProfessionalCard.tsx` WhatsApp icon button

Currently navigates to profile. No change needed — the tracking fires in `WhatsAppContactButton` on the profile page.

## Security Notes

- **No FK constraint** on `professional_id` intentionally — avoids cascade issues and allows tracking even if profile is later deleted. The index is enough for joins.
- **No rate limiting** needed here — INSERT is cheap, and if someone spams it, worst case is inflated numbers (not a security risk). Could add a rate limit later if needed.
- Admins-only SELECT prevents competitors from scraping lead data.

