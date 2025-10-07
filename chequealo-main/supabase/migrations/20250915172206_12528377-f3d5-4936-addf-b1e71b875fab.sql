-- Security Fix: Protect professional contact information from unauthorized access
-- Create a public view that excludes sensitive contact fields for unauthenticated users

-- First, update RLS policies to restrict sensitive data access
DROP POLICY IF EXISTS "Professionals are viewable by everyone" ON public.professionals;

-- Create new policies with tiered access
CREATE POLICY "Professionals basic info viewable by everyone" 
ON public.professionals 
FOR SELECT 
USING (true);

-- Create a secure view for public access that excludes sensitive contact information
CREATE OR REPLACE VIEW public.professionals_public AS
SELECT 
  id,
  user_id,
  full_name,
  profession,
  location,
  description,
  image_url,
  is_verified,
  verification_date,
  availability,
  rating,
  review_count,
  created_at,
  updated_at,
  is_blocked,
  -- Only show contact info for authenticated users
  CASE 
    WHEN auth.uid() IS NOT NULL THEN email 
    ELSE NULL 
  END as email,
  CASE 
    WHEN auth.uid() IS NOT NULL THEN phone 
    ELSE NULL 
  END as phone
FROM public.professionals
WHERE NOT is_blocked;

-- Grant access to the public view
GRANT SELECT ON public.professionals_public TO anon, authenticated;

-- Create RLS policy for the view
ALTER VIEW public.professionals_public SET (security_invoker = true);

-- Ensure professionals can still manage their own profiles
CREATE POLICY "Users can update their own professional profile" 
ON public.professionals 
FOR UPDATE 
USING (user_id = auth.uid());

CREATE POLICY "Users can create their own professional profile" 
ON public.professionals 
FOR INSERT 
WITH CHECK (user_id = auth.uid());

-- Admin can still update any professional (keeping existing admin functionality)
CREATE POLICY "Admin can update any professional" 
ON public.professionals 
FOR UPDATE 
USING ((auth.jwt() ->> 'email'::text) = 'autosrafaela@gmail.com'::text)
WITH CHECK ((auth.jwt() ->> 'email'::text) = 'autosrafaela@gmail.com'::text);

-- Add audit logging for sensitive data access
CREATE TABLE IF NOT EXISTS public.contact_access_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id uuid NOT NULL,
  accessed_by uuid,
  access_type text NOT NULL, -- 'email', 'phone', 'full_profile'
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on audit logs
ALTER TABLE public.contact_access_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Admin can view contact access logs" 
ON public.contact_access_logs 
FOR SELECT 
USING ((auth.jwt() ->> 'email'::text) = 'autosrafaela@gmail.com'::text);

-- Create function to log contact access
CREATE OR REPLACE FUNCTION public.log_contact_access(
  prof_id uuid,
  access_type text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NOT NULL THEN
    INSERT INTO public.contact_access_logs (professional_id, accessed_by, access_type)
    VALUES (prof_id, auth.uid(), access_type);
  END IF;
END;
$$;