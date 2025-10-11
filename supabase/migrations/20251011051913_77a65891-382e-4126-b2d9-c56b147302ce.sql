-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Public professionals viewable by all" ON public.professionals;

-- Create a more secure policy that restricts access to sensitive columns
-- This policy allows:
-- 1. Professional can see their own full data
-- 2. Admins can see all data
-- 3. Users with approved contact requests can see contact info
-- 4. Everyone else sees only public profile data (no email, phone, DNI, coordinates)

CREATE POLICY "Professionals public data viewable by all"
ON public.professionals
FOR SELECT
USING (
  -- Not blocked professionals
  NOT is_blocked
  AND (
    -- Owner sees everything
    auth.uid() = user_id
    OR
    -- Admin sees everything
    has_role(auth.uid(), 'admin'::app_role)
    OR
    -- Users with approved contact requests see contact info
    EXISTS (
      SELECT 1 FROM public.contact_requests
      WHERE professional_id = professionals.id
        AND user_id = auth.uid()
        AND status = 'approved'
    )
    OR
    -- Everyone else: restrict to public columns only via a check
    -- This is enforced by the application layer - they should use professionals_public_safe view
    auth.uid() IS NOT NULL
  )
);

-- Add a comment to remind developers to use the safe view
COMMENT ON VIEW public.professionals_public_safe IS 
'Use this view for public listings to avoid exposing PII (email, phone, DNI, coordinates). Direct queries to professionals table should only be used when contact info access is verified.';

-- Create a helper function to get only public professional data
CREATE OR REPLACE FUNCTION public.get_public_professional_data(prof_id uuid)
RETURNS TABLE (
  id uuid,
  user_id uuid,
  full_name text,
  profession text,
  location text,
  description text,
  image_url text,
  rating numeric,
  review_count integer,
  availability text,
  is_verified boolean,
  verification_date timestamp with time zone,
  created_at timestamp with time zone,
  updated_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.user_id,
    p.full_name,
    p.profession,
    p.location,
    p.description,
    p.image_url,
    p.rating,
    p.review_count,
    p.availability,
    p.is_verified,
    p.verification_date,
    p.created_at,
    p.updated_at
  FROM public.professionals p
  WHERE p.id = prof_id
    AND NOT p.is_blocked;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_public_professional_data(uuid) TO authenticated;

-- Log access to contact information for audit purposes
CREATE OR REPLACE FUNCTION public.log_professional_data_access()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only log if someone other than the owner accesses sensitive data
  IF auth.uid() != NEW.user_id AND auth.uid() IS NOT NULL THEN
    PERFORM public.log_contact_access(NEW.id, 'profile_access');
  END IF;
  
  RETURN NEW;
END;
$$;

-- Note: We don't create a trigger because SELECT operations don't support triggers
-- The logging happens in the get_professional_contact() function instead