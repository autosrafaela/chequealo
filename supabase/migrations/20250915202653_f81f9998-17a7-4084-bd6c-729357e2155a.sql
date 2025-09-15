-- Restrict exposure of professional contact info and provide controlled access

-- 1) Recreate public view without sensitive columns
CREATE OR REPLACE VIEW public.professionals_public AS
SELECT 
  id,
  user_id,
  is_verified,
  verification_date,
  rating,
  review_count,
  created_at,
  updated_at,
  image_url,
  availability,
  full_name,
  profession,
  location,
  description,
  is_blocked
FROM public.professionals;

-- 2) Tighten RLS on professionals: remove public SELECT, allow owner and admins
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'professionals' 
      AND policyname = 'Professionals basic info viewable by everyone'
  ) THEN
    EXECUTE 'DROP POLICY "Professionals basic info viewable by everyone" ON public.professionals';
  END IF;
END $$;

-- Allow owners to view their own records
CREATE POLICY IF NOT EXISTS "Users can view their own professional profile"
ON public.professionals
FOR SELECT
USING (auth.uid() = user_id);

-- Allow admins to view everything
CREATE POLICY IF NOT EXISTS "Admins can view all professionals"
ON public.professionals
FOR SELECT
USING ((auth.jwt() ->> 'email') = 'autosrafaela@gmail.com' OR public.has_role(auth.uid(), 'admin'));

-- 3) Controlled contact access function with audit logging
CREATE OR REPLACE FUNCTION public.get_professional_contact(prof_id uuid)
RETURNS TABLE(phone text, email text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Require authenticated user
  IF auth.uid() IS NULL THEN
    RETURN;
  END IF;

  IF EXISTS (
      SELECT 1 FROM public.professionals p 
      WHERE p.id = prof_id AND p.user_id = auth.uid()
    )
    OR ((auth.jwt() ->> 'email') = 'autosrafaela@gmail.com')
    OR public.has_role(auth.uid(), 'admin')
    OR EXISTS (
      SELECT 1 FROM public.contact_requests cr 
      WHERE cr.professional_id = prof_id 
        AND cr.user_id = auth.uid()
    )
  THEN
    PERFORM public.log_contact_access(prof_id, 'view_contact');
    RETURN QUERY SELECT p.phone, p.email FROM public.professionals p WHERE p.id = prof_id;
  ELSE
    RETURN; -- Not authorized
  END IF;
END;
$$;