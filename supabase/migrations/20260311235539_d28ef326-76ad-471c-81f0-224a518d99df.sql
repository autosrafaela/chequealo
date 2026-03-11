
-- Trigger to prevent professionals from self-modifying has_free_access
CREATE OR REPLACE FUNCTION public.protect_has_free_access()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- If the caller is the owner (not admin), revert has_free_access to old value
  IF auth.uid() = NEW.user_id AND NOT public.has_role(auth.uid(), 'admin'::app_role) THEN
    NEW.has_free_access := OLD.has_free_access;
  END IF;
  RETURN NEW;
END;
$$;

-- Attach trigger
DROP TRIGGER IF EXISTS protect_has_free_access_trigger ON public.professionals;
CREATE TRIGGER protect_has_free_access_trigger
  BEFORE UPDATE ON public.professionals
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_has_free_access();
