-- Fix remaining SECURITY DEFINER view: professionals_public_safe
-- This view was created without explicit security_invoker setting

DROP VIEW IF EXISTS public.professionals_public_safe CASCADE;

CREATE VIEW public.professionals_public_safe
WITH (security_invoker = true)
AS SELECT 
  id,
  user_id,
  full_name,
  profession,
  location,
  description,
  image_url,
  rating,
  review_count,
  availability,
  is_verified,
  verification_date,
  created_at,
  updated_at
FROM public.professionals
WHERE NOT is_blocked;

-- Grant select permission to authenticated users
GRANT SELECT ON public.professionals_public_safe TO authenticated;

-- Add descriptive comment
COMMENT ON VIEW public.professionals_public_safe IS 
'Safe public view of professionals excluding all PII (email, phone, DNI, coordinates). Uses SECURITY INVOKER to respect RLS policies. Recommended for public listings.';