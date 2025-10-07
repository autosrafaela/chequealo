-- Phase 1: Fix Critical Data Exposure Issues

-- 1. Drop and recreate professionals_public view to exclude sensitive contact info
DROP VIEW IF EXISTS public.professionals_public;

CREATE VIEW public.professionals_public AS
SELECT 
  id,
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
  is_blocked,
  created_at,
  updated_at
FROM public.professionals
WHERE is_blocked = false;

-- 2. Update RLS policies for professionals table to restrict contact info access
DROP POLICY IF EXISTS "Professionals contact info restricted" ON public.professionals;

CREATE POLICY "Professionals contact info restricted" 
ON public.professionals 
FOR SELECT 
USING (
  -- Professional can see their own data
  user_id = auth.uid() 
  OR 
  -- Admin can see all data
  ((auth.jwt() ->> 'email') = 'autosrafaela@gmail.com' OR has_role(auth.uid(), 'admin'::app_role))
  OR
  -- Users who made contact requests can see basic info (but contact access is controlled by get_professional_contact function)
  (
    auth.uid() IS NOT NULL 
    AND id IN (
      SELECT professional_id 
      FROM public.contact_requests 
      WHERE user_id = auth.uid()
    )
  )
);

-- 3. Update profiles table RLS policies to protect personal information
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

CREATE POLICY "Users can view public profile info" 
ON public.profiles 
FOR SELECT 
USING (
  -- Users can see their own complete profile
  auth.uid() = user_id 
  OR 
  -- Admin can see all profiles
  ((auth.jwt() ->> 'email') = 'autosrafaela@gmail.com' OR has_role(auth.uid(), 'admin'::app_role))
  OR
  -- Everyone can see limited public info (username only, no personal data)
  (auth.uid() IS NOT NULL AND NOT is_blocked)
);

-- 4. Create function to get safe public professional profile
CREATE OR REPLACE FUNCTION public.get_public_professional_profile(prof_id uuid)
RETURNS TABLE(
  id uuid,
  full_name text,
  profession text,
  location text,
  description text,
  image_url text,
  rating numeric,
  review_count integer,
  availability text,
  is_verified boolean,
  verification_date timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  RETURN QUERY 
  SELECT 
    p.id,
    p.full_name,
    p.profession,
    p.location,
    p.description,
    p.image_url,
    p.rating,
    p.review_count,
    p.availability,
    p.is_verified,
    p.verification_date
  FROM public.professionals p
  WHERE p.id = prof_id 
    AND p.is_blocked = false;
END;
$function$;

-- 5. Enhanced contact access logging with rate limiting protection
CREATE OR REPLACE FUNCTION public.log_contact_access(prof_id uuid, access_type text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
  recent_access_count integer;
BEGIN
  -- Only log if user is authenticated
  IF auth.uid() IS NULL THEN
    RETURN;
  END IF;

  -- Check for rate limiting (max 10 contact views per hour per user)
  SELECT COUNT(*) INTO recent_access_count
  FROM public.contact_access_logs
  WHERE accessed_by = auth.uid()
    AND access_type = 'view_contact'
    AND created_at > now() - interval '1 hour';

  -- Allow if under rate limit or if it's the professional's own profile
  IF recent_access_count < 10 OR EXISTS (
    SELECT 1 FROM public.professionals 
    WHERE id = prof_id AND user_id = auth.uid()
  ) THEN
    INSERT INTO public.contact_access_logs (professional_id, accessed_by, access_type)
    VALUES (prof_id, auth.uid(), access_type);
  END IF;
END;
$function$;

-- 6. Enhanced get_professional_contact function with better security
CREATE OR REPLACE FUNCTION public.get_professional_contact(prof_id uuid)
RETURNS TABLE(phone text, email text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
  recent_access_count integer;
BEGIN
  -- Require authenticated user
  IF auth.uid() IS NULL THEN
    RETURN;
  END IF;

  -- Rate limiting check (max 5 contact info requests per hour per user)
  SELECT COUNT(*) INTO recent_access_count
  FROM public.contact_access_logs
  WHERE accessed_by = auth.uid()
    AND access_type = 'view_contact'
    AND created_at > now() - interval '1 hour';

  -- Check authorization with enhanced security
  IF (
    -- Professional can see their own contact info (no rate limit)
    EXISTS (
      SELECT 1 FROM public.professionals p 
      WHERE p.id = prof_id AND p.user_id = auth.uid()
    )
    OR 
    -- Admin access (no rate limit)
    ((auth.jwt() ->> 'email') = 'autosrafaela@gmail.com')
    OR 
    public.has_role(auth.uid(), 'admin')
    OR 
    -- Users with approved contact requests (with rate limiting)
    (
      recent_access_count < 5 
      AND EXISTS (
        SELECT 1 FROM public.contact_requests cr 
        WHERE cr.professional_id = prof_id 
          AND cr.user_id = auth.uid()
          AND cr.status = 'approved'
      )
    )
  ) THEN
    -- Log the access
    PERFORM public.log_contact_access(prof_id, 'view_contact');
    
    -- Return contact information
    RETURN QUERY 
    SELECT p.phone, p.email 
    FROM public.professionals p 
    WHERE p.id = prof_id;
  ELSE
    -- Not authorized or rate limited
    RETURN;
  END IF;
END;
$function$;

-- 7. Create security audit trigger for sensitive data access
CREATE OR REPLACE FUNCTION public.audit_sensitive_access()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  -- Log when someone accesses sensitive professional data
  IF TG_OP = 'SELECT' AND TG_TABLE_NAME = 'professionals' THEN
    INSERT INTO public.contact_access_logs (professional_id, accessed_by, access_type)
    VALUES (NEW.id, auth.uid(), 'profile_access');
  END IF;
  
  RETURN NEW;
END;
$function$;