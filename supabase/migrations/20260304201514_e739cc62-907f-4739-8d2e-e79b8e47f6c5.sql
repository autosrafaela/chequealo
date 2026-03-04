-- Ensure autosrafaela@gmail.com has admin role in user_roles table
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role FROM auth.users WHERE email = 'autosrafaela@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;

-- Fix get_professional_contact: remove hardcoded email bypass, use has_role only
CREATE OR REPLACE FUNCTION public.get_professional_contact(prof_id uuid)
 RETURNS TABLE(phone text, email text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
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
    -- Admin access via RBAC (no rate limit)
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