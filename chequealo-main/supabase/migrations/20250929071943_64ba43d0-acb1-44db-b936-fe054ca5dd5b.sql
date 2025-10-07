-- Insert the three subscription plans
INSERT INTO public.subscription_plans (name, price, currency, billing_interval, grace_period_days, is_active) VALUES
  ('Plan Básico', 9990, 'ARS', 'monthly', 90, true),
  ('Plan Profesional', 19990, 'ARS', 'monthly', 90, true),
  ('Plan Premium', 39990, 'ARS', 'monthly', 90, true);

-- Add features columns to subscription_plans table
ALTER TABLE public.subscription_plans 
ADD COLUMN features JSONB DEFAULT '[]'::jsonb,
ADD COLUMN max_contact_requests INTEGER DEFAULT -1,
ADD COLUMN max_work_photos INTEGER DEFAULT -1,
ADD COLUMN priority_support BOOLEAN DEFAULT false,
ADD COLUMN advanced_analytics BOOLEAN DEFAULT false,
ADD COLUMN featured_listing BOOLEAN DEFAULT false;

-- Update the plans with their specific features
UPDATE public.subscription_plans 
SET 
  features = '["Perfil profesional básico", "Hasta 50 contactos/mes", "Galería de 10 fotos", "Reseñas básicas", "Soporte estándar"]'::jsonb,
  max_contact_requests = 50,
  max_work_photos = 10,
  priority_support = false,
  advanced_analytics = false,
  featured_listing = false
WHERE name = 'Plan Básico';

UPDATE public.subscription_plans 
SET 
  features = '["Perfil profesional completo", "Contactos ilimitados", "Galería ilimitada", "Sistema completo de reseñas", "Notificaciones en tiempo real", "Estadísticas básicas", "Soporte prioritario", "Verificación de identidad"]'::jsonb,
  max_contact_requests = -1,
  max_work_photos = -1,
  priority_support = true,
  advanced_analytics = false,
  featured_listing = false
WHERE name = 'Plan Profesional' OR name = 'Profesional Mensual';

UPDATE public.subscription_plans 
SET 
  features = '["Todo del Plan Profesional", "Perfil destacado en búsquedas", "Analíticas avanzadas", "Promoción prioritaria", "Badge premium", "Soporte 24/7", "Acceso beta a nuevas funciones", "Reportes detallados"]'::jsonb,
  max_contact_requests = -1,
  max_work_photos = -1,
  priority_support = true,
  advanced_analytics = true,
  featured_listing = true
WHERE name = 'Plan Premium';

-- Add plan_selection_deadline to subscriptions table
ALTER TABLE public.subscriptions 
ADD COLUMN plan_selection_deadline TIMESTAMP WITH TIME ZONE DEFAULT (now() + interval '90 days'),
ADD COLUMN selected_plan_id UUID REFERENCES public.subscription_plans(id);

-- Update existing subscriptions to have the Professional plan selected by default
UPDATE public.subscriptions 
SET selected_plan_id = (
  SELECT id FROM public.subscription_plans 
  WHERE name IN ('Plan Profesional', 'Profesional Mensual') 
  LIMIT 1
)
WHERE selected_plan_id IS NULL;