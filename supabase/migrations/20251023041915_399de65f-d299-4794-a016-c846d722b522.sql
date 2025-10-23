-- Sincronizar las fotos de perfil de profiles.avatar_url a professionals.image_url
UPDATE professionals p
SET image_url = pr.avatar_url
FROM profiles pr
WHERE p.user_id = pr.user_id
  AND pr.avatar_url IS NOT NULL
  AND (p.image_url IS NULL OR p.image_url = '');

-- Crear un trigger para mantener sincronizadas las fotos de perfil automáticamente
CREATE OR REPLACE FUNCTION sync_professional_avatar()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Cuando se actualiza un avatar en profiles, actualizar también en professionals
  UPDATE professionals
  SET image_url = NEW.avatar_url,
      updated_at = now()
  WHERE user_id = NEW.user_id;
  
  RETURN NEW;
END;
$$;

-- Crear trigger que se ejecuta cuando se actualiza avatar_url en profiles
DROP TRIGGER IF EXISTS sync_avatar_to_professionals ON profiles;
CREATE TRIGGER sync_avatar_to_professionals
  AFTER INSERT OR UPDATE OF avatar_url ON profiles
  FOR EACH ROW
  WHEN (NEW.avatar_url IS NOT NULL)
  EXECUTE FUNCTION sync_professional_avatar();