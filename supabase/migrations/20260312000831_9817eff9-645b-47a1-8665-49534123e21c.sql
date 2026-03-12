
-- Vista pública que expone SOLO is_vip (sin datos de billing)
-- Un profesional es VIP si: rating >= 4, no bloqueado, y tiene plan con featured_listing o has_free_access
CREATE OR REPLACE VIEW public.professionals_vip_status AS
SELECT 
  p.id,
  CASE WHEN (
    COALESCE(p.rating, 0) >= 4.0 
    AND NOT p.is_blocked
    AND (
      p.has_free_access = true 
      OR EXISTS (
        SELECT 1 FROM public.subscriptions s 
        JOIN public.subscription_plans sp ON s.plan_id = sp.id
        WHERE s.professional_id = p.id 
        AND s.status = 'active'
        AND sp.featured_listing = true
      )
    )
  ) THEN true ELSE false END as is_vip
FROM public.professionals p;

-- Grant public read access to the view
GRANT SELECT ON public.professionals_vip_status TO anon, authenticated;
