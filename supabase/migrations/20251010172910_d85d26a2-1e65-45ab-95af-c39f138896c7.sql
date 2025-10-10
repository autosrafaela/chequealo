-- Complete migration to change subscription IDs from UUID to TEXT
-- Step 1: Drop foreign key constraints
ALTER TABLE public.subscriptions DROP CONSTRAINT IF EXISTS subscriptions_plan_id_fkey;
ALTER TABLE public.subscriptions DROP CONSTRAINT IF EXISTS subscriptions_selected_plan_id_fkey;

-- Step 2: Change subscription_plans.id from UUID to TEXT
ALTER TABLE public.subscription_plans ALTER COLUMN id DROP DEFAULT;
ALTER TABLE public.subscription_plans ALTER COLUMN id TYPE TEXT USING id::TEXT;

-- Step 3: Change subscriptions columns from UUID to TEXT  
ALTER TABLE public.subscriptions ALTER COLUMN plan_id TYPE TEXT USING plan_id::TEXT;
ALTER TABLE public.subscriptions ALTER COLUMN selected_plan_id TYPE TEXT USING selected_plan_id::TEXT;

-- Step 4: Re-add foreign key constraints
ALTER TABLE public.subscriptions 
  ADD CONSTRAINT subscriptions_plan_id_fkey 
  FOREIGN KEY (plan_id) REFERENCES public.subscription_plans(id) ON DELETE RESTRICT;

ALTER TABLE public.subscriptions 
  ADD CONSTRAINT subscriptions_selected_plan_id_fkey 
  FOREIGN KEY (selected_plan_id) REFERENCES public.subscription_plans(id) ON DELETE SET NULL;

-- Step 5: Add new columns if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'subscription_plans' AND column_name = 'sort_order') THEN
    ALTER TABLE public.subscription_plans ADD COLUMN sort_order INTEGER DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'subscription_plans' AND column_name = 'is_recommended') THEN
    ALTER TABLE public.subscription_plans ADD COLUMN is_recommended BOOLEAN DEFAULT false;
  END IF;
END $$;

-- Step 6: Seed plans (idempotent)
-- Free plan
INSERT INTO public.subscription_plans (
  id, name, price, currency, billing_interval, features,
  max_contact_requests, max_work_photos, max_monthly_bookings,
  can_receive_messages, can_send_files, featured_listing,
  advanced_analytics, priority_support, calendar_integration,
  grace_period_days, is_active, sort_order, is_recommended
)
VALUES (
  'free', 'Gratis', 0, 'ARS', 'monthly',
  '["Búsqueda básica", "Perfil público simple", "1 servicio listado"]'::jsonb,
  5, 3, 5, false, false, false, false, false, false, 0, true, 0, false
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, price = EXCLUDED.price, features = EXCLUDED.features,
  max_contact_requests = EXCLUDED.max_contact_requests,
  max_work_photos = EXCLUDED.max_work_photos,
  sort_order = EXCLUDED.sort_order, is_active = EXCLUDED.is_active;

-- Emprendedor plan
INSERT INTO public.subscription_plans (
  id, name, price, currency, billing_interval, features,
  max_contact_requests, max_work_photos, max_monthly_bookings,
  can_receive_messages, can_send_files, featured_listing,
  advanced_analytics, priority_support, calendar_integration,
  grace_period_days, is_active, sort_order, is_recommended
)
VALUES (
  'emprendedor', 'Emprendedor', 4990, 'ARS', 'monthly',
  '["5 servicios listados", "Portfolio de trabajos", "Link de WhatsApp", "Sistema de reseñas", "Mensajería básica", "Perfil destacado básico"]'::jsonb,
  30, 10, 20, true, false, false, false, false, false, 90, true, 1, false
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, price = EXCLUDED.price, features = EXCLUDED.features,
  max_contact_requests = EXCLUDED.max_contact_requests,
  max_work_photos = EXCLUDED.max_work_photos,
  sort_order = EXCLUDED.sort_order, is_active = EXCLUDED.is_active;

-- Profesional plan (recommended)
INSERT INTO public.subscription_plans (
  id, name, price, currency, billing_interval, features,
  max_contact_requests, max_work_photos, max_monthly_bookings,
  can_receive_messages, can_send_files, featured_listing,
  advanced_analytics, priority_support, calendar_integration,
  grace_period_days, is_active, sort_order, is_recommended
)
VALUES (
  'profesional', 'Profesional Mensual', 14990, 'ARS', 'monthly',
  '["Servicios ilimitados", "Portfolio completo", "Reseñas destacadas", "Prioridad en listados", "Calendario integrado", "Badges de verificación", "Mensajería con archivos", "Analytics básico"]'::jsonb,
  -1, -1, -1, true, true, true, false, false, true, 90, true, 2, true
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, price = EXCLUDED.price, features = EXCLUDED.features,
  max_contact_requests = EXCLUDED.max_contact_requests,
  max_work_photos = EXCLUDED.max_work_photos,
  sort_order = EXCLUDED.sort_order,
  is_recommended = EXCLUDED.is_recommended, is_active = EXCLUDED.is_active;

-- Agencia plan
INSERT INTO public.subscription_plans (
  id, name, price, currency, billing_interval, features,
  max_contact_requests, max_work_photos, max_monthly_bookings,
  can_receive_messages, can_send_files, featured_listing,
  advanced_analytics, priority_support, calendar_integration,
  grace_period_days, is_active, sort_order, is_recommended
)
VALUES (
  'agencia', 'Agencia', 39990, 'ARS', 'monthly',
  '["Todo de Profesional", "Multi-sede", "Cuentas de equipo", "Analytics avanzado", "Soporte prioritario 24/7", "API access", "Reportes personalizados", "Gestor de cuenta dedicado"]'::jsonb,
  -1, -1, -1, true, true, true, true, true, true, 90, true, 3, false
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, price = EXCLUDED.price, features = EXCLUDED.features,
  max_contact_requests = EXCLUDED.max_contact_requests,
  max_work_photos = EXCLUDED.max_work_photos,
  sort_order = EXCLUDED.sort_order, is_active = EXCLUDED.is_active;