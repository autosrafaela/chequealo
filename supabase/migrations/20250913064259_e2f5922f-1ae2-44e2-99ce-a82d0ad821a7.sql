-- Create test user in auth.users and set up admin role
-- First, let's create a simple function to add admin role to a user
CREATE OR REPLACE FUNCTION public.add_user_admin_role(_email text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  _user_id uuid;
BEGIN
  -- Get user ID from email
  SELECT id INTO _user_id 
  FROM auth.users 
  WHERE email = _email;
  
  IF _user_id IS NOT NULL THEN
    -- Insert admin role if it doesn't exist
    INSERT INTO public.user_roles (user_id, role)
    VALUES (_user_id, 'admin'::app_role)
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
END;
$$;