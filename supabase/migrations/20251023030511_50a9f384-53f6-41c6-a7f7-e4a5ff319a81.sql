-- Restore admin role for autosrafaela@gmail.com
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role
FROM auth.users
WHERE email = 'autosrafaela@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;