-- Habilitar extensión pg_net para hacer HTTP requests desde PostgreSQL
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Crear función que envía push notification cuando se inserta una notificación
CREATE OR REPLACE FUNCTION public.send_push_on_notification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  supabase_url text := 'https://rolitmcxydholgsxpvwa.supabase.co';
  service_role_key text;
BEGIN
  -- Obtener la service role key desde la configuración
  service_role_key := current_setting('app.settings.service_role_key', true);
  
  -- Si no hay key configurada, salir silenciosamente
  IF service_role_key IS NULL OR service_role_key = '' THEN
    RETURN NEW;
  END IF;
  
  -- Llamar al edge function send-push-notification de forma asíncrona
  PERFORM net.http_post(
    url := supabase_url || '/functions/v1/send-push-notification',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || service_role_key
    ),
    body := jsonb_build_object(
      'userIds', ARRAY[NEW.user_id::text],
      'title', NEW.title,
      'body', NEW.message,
      'data', jsonb_build_object(
        'type', NEW.type,
        'actionUrl', COALESCE(NEW.action_url, '/dashboard'),
        'notificationId', NEW.id::text
      )
    )
  );
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Si falla el push, no bloquear la inserción de la notificación
    RAISE WARNING 'Error sending push notification: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- Crear trigger que se ejecuta después de cada INSERT en notifications
CREATE TRIGGER trigger_send_push_on_notification
  AFTER INSERT ON public.notifications
  FOR EACH ROW
  EXECUTE FUNCTION public.send_push_on_notification();