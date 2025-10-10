-- Corregir el nombre del perfil profesional para que coincida con el perfil de usuario
-- para el usuario maximiliano_bauducco005@hotmail.com

UPDATE professionals 
SET 
  full_name = (
    SELECT full_name 
    FROM profiles 
    WHERE profiles.user_id = professionals.user_id
  ),
  updated_at = now()
WHERE user_id = '470e1ffe-29ad-4f78-af9e-f7d1c74f3405'
  AND EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.user_id = professionals.user_id
  );