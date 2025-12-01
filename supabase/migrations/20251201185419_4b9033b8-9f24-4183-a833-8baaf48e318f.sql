-- Fix email-based admin authorization in RLS policies
-- has_role signature: has_role(_user_id uuid, _role app_role)

-- 1. Fix profiles table policies
DROP POLICY IF EXISTS "Admin can update any profile" ON public.profiles;
CREATE POLICY "Admin can update any profile" ON public.profiles
  FOR UPDATE USING (
    has_role(auth.uid(), 'admin'::app_role)
  );

-- 2. Fix professionals table policies  
DROP POLICY IF EXISTS "Admin can update any professional" ON public.professionals;
CREATE POLICY "Admin can update any professional" ON public.professionals
  FOR UPDATE USING (
    has_role(auth.uid(), 'admin'::app_role)
  );

-- Fix "Admins can view all professionals data" policy
DROP POLICY IF EXISTS "Admins can view all professionals data" ON public.professionals;
CREATE POLICY "Admins can view all professionals data" ON public.professionals
  FOR SELECT USING (
    has_role(auth.uid(), 'admin'::app_role)
  );

-- 3. Fix user_roles table policies
DROP POLICY IF EXISTS "Admin can manage all roles" ON public.user_roles;
CREATE POLICY "Admin can manage all roles" ON public.user_roles
  FOR ALL USING (
    has_role(auth.uid(), 'admin'::app_role)
  );

-- 4. Fix contact_access_logs table policies
DROP POLICY IF EXISTS "Admin can view contact access logs" ON public.contact_access_logs;
CREATE POLICY "Admin can view all contact access logs" ON public.contact_access_logs
  FOR SELECT USING (
    has_role(auth.uid(), 'admin'::app_role)
  );

-- 5. Fix profiles "Users can view limited profile info" policy
DROP POLICY IF EXISTS "Users can view limited profile info" ON public.profiles;
CREATE POLICY "Users can view limited profile info" ON public.profiles
  FOR SELECT USING (
    (auth.uid() = user_id) 
    OR has_role(auth.uid(), 'admin'::app_role)
    OR ((auth.uid() IS NOT NULL) AND (NOT is_blocked))
  );

-- 6. Add admin delete policy for professionals
DROP POLICY IF EXISTS "Admin can delete any professional" ON public.professionals;
CREATE POLICY "Admin can delete any professional" ON public.professionals
  FOR DELETE USING (
    has_role(auth.uid(), 'admin'::app_role)
  );