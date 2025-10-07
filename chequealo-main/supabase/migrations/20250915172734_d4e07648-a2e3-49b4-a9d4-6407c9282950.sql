-- Fix critical security issues from the linter

-- Fix 1: Change security definer view to security invoker to prevent privilege escalation
DROP VIEW IF EXISTS public.professionals_public;

-- Recreate the view with proper security settings
CREATE VIEW public.professionals_public
WITH (security_invoker = true)
AS SELECT 
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

-- Grant proper access to the view
GRANT SELECT ON public.professionals_public TO anon, authenticated;

-- Fix 2: Update functions to have proper search_path settings
-- Fix the handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, username)
  VALUES (
    NEW.id, 
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'username'
  );
  
  -- Assign default user role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  -- Create welcome notification
  INSERT INTO public.notifications (user_id, title, message, type)
  VALUES (
    NEW.id,
    '¡Bienvenido a TodoAca.ar!',
    'Tu cuenta ha sido creada exitosamente. Ahora puedes buscar profesionales y guardar tus favoritos.',
    'success'
  );
  
  RETURN NEW;
END;
$function$;

-- Fix the log_contact_access function search path
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

-- Fix 3: Add function to enable leaked password protection
-- Note: This requires project admin to enable it in Auth settings
-- We'll create a reminder notification for admins
INSERT INTO public.notifications (user_id, title, message, type) 
SELECT 
  p.user_id,
  'Acción requerida: Seguridad de contraseñas',
  'Por favor habilita la protección contra contraseñas filtradas en Configuración de Auth > Seguridad de contraseñas en el dashboard de Supabase.',
  'warning'
FROM public.profiles p 
JOIN public.user_roles ur ON p.user_id = ur.user_id 
WHERE ur.role = 'admin'::app_role
ON CONFLICT DO NOTHING;