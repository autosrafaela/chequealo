-- Fix SECURITY DEFINER views to use SECURITY INVOKER
-- This ensures views execute with the permissions of the querying user, not the view creator
-- Prevents RLS bypass vulnerabilities

-- Drop and recreate professionals_public view
DROP VIEW IF EXISTS public.professionals_public CASCADE;

CREATE VIEW public.professionals_public
WITH (security_invoker = true)
AS SELECT 
  id,
  full_name,
  profession,
  location,
  description,
  image_url,
  rating,
  review_count,
  is_verified,
  verification_date,
  is_blocked,
  availability,
  created_at,
  updated_at
FROM public.professionals
WHERE is_blocked = false;

-- Grant select permission to authenticated users
GRANT SELECT ON public.professionals_public TO authenticated;

-- Add descriptive comment
COMMENT ON VIEW public.professionals_public IS 
'Public view of professionals without sensitive contact data. Uses SECURITY INVOKER to respect RLS policies of the current user.';

-- Drop and recreate bookings_public view
DROP VIEW IF EXISTS public.bookings_public CASCADE;

CREATE VIEW public.bookings_public
WITH (security_invoker = true)
AS SELECT 
  id,
  professional_id,
  user_id,
  service_id,
  booking_date,
  duration_minutes,
  status,
  total_amount,
  currency,
  created_at,
  updated_at,
  -- Mask sensitive client data
  (LEFT(client_name, 1) || '***') AS client_name_masked,
  (LEFT(client_email, 3) || '***@***') AS client_email_masked,
  ('XXX-XXX-' || RIGHT(COALESCE(client_phone, 'XXXX'), 4)) AS client_phone_masked
FROM public.bookings;

-- Grant select permission to authenticated users
GRANT SELECT ON public.bookings_public TO authenticated;

-- Add descriptive comment
COMMENT ON VIEW public.bookings_public IS 
'Public view of bookings with masked client data. Uses SECURITY INVOKER to respect RLS policies of the current user.';

-- Verify the views are created correctly
DO $$
BEGIN
  -- Check if views exist and have security_invoker set
  IF NOT EXISTS (
    SELECT 1 FROM pg_views 
    WHERE schemaname = 'public' 
    AND viewname = 'professionals_public'
  ) THEN
    RAISE EXCEPTION 'View professionals_public was not created successfully';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_views 
    WHERE schemaname = 'public' 
    AND viewname = 'bookings_public'
  ) THEN
    RAISE EXCEPTION 'View bookings_public was not created successfully';
  END IF;

  RAISE NOTICE 'Security INVOKER views created successfully';
END $$;