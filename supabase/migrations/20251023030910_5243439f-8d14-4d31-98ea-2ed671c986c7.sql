-- Update password for admin user
-- This will set the password to 'Aconcagua1!' for autosrafaela@gmail.com
UPDATE auth.users
SET 
  encrypted_password = crypt('Aconcagua1!', gen_salt('bf')),
  updated_at = now()
WHERE email = 'autosrafaela@gmail.com';