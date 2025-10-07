-- Grant admin role back to the specified user by email
-- Uses existing SECURITY DEFINER function to avoid RLS issues
select public.add_user_admin_role('autosrafaela@gmail.com');

-- Verify result (non-blocking in migration; safe to run)
-- This select will not change state; it's for confirmation logs
select public.has_role((select id from auth.users where email = 'autosrafaela@gmail.com'), 'admin') as is_admin;