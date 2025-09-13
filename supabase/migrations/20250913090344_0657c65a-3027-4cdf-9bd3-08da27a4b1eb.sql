-- 1) Add blocked flags
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_blocked boolean NOT NULL DEFAULT false;
ALTER TABLE public.professionals ADD COLUMN IF NOT EXISTS is_blocked boolean NOT NULL DEFAULT false;

-- 2) Allow the admin (by email) to update any profile/professional (for blocking)
DROP POLICY IF EXISTS "Admin can update any profile" ON public.profiles;
CREATE POLICY "Admin can update any profile"
ON public.profiles
FOR UPDATE
USING ((auth.jwt() ->> 'email') = 'autosrafaela@gmail.com')
WITH CHECK ((auth.jwt() ->> 'email') = 'autosrafaela@gmail.com');

DROP POLICY IF EXISTS "Admin can update any professional" ON public.professionals;
CREATE POLICY "Admin can update any professional"
ON public.professionals
FOR UPDATE
USING ((auth.jwt() ->> 'email') = 'autosrafaela@gmail.com')
WITH CHECK ((auth.jwt() ->> 'email') = 'autosrafaela@gmail.com');

-- 3) Enable and allow admin to manage roles (optional but helpful to manage roles from UI)
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin can manage all roles" ON public.user_roles;
CREATE POLICY "Admin can manage all roles"
ON public.user_roles
FOR ALL
USING ((auth.jwt() ->> 'email') = 'autosrafaela@gmail.com')
WITH CHECK ((auth.jwt() ->> 'email') = 'autosrafaela@gmail.com');