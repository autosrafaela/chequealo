-- =============================================
-- GAMIFICACIÓN: Sistema de Insignias y Recompensas (CORREGIDO)
-- =============================================

-- 1. Agregar constraint único en badges.name si no existe
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'badges_name_key'
  ) THEN
    ALTER TABLE public.badges ADD CONSTRAINT badges_name_key UNIQUE (name);
  END IF;
END $$;

-- 2. Insertar insignias predefinidas para profesionales
INSERT INTO public.badges (name, description, icon, category, rarity, condition_type, condition_value, points) VALUES
  -- Perfil y Setup
  ('Primer Paso', 'Completó su perfil profesional', '🎯', 'profile', 'common', 'profile_created', 1, 10),
  ('Fotógrafo', 'Agregó una foto de perfil', '📸', 'profile', 'common', 'has_profile_photo', 1, 15),
  ('Contador de Historias', 'Escribió una descripción completa (más de 100 caracteres)', '📝', 'profile', 'common', 'description_complete', 1, 20),
  
  -- Servicios
  ('Primer Servicio', 'Agregó su primer servicio', '⚡', 'services', 'common', 'services_count', 1, 25),
  ('Catálogo Completo', 'Tiene 3 o más servicios activos', '📦', 'services', 'rare', 'services_count', 3, 50),
  ('Profesional Premium', 'Tiene 5 o más servicios activos', '💎', 'services', 'epic', 'services_count', 5, 100),
  
  -- Portfolio
  ('Primera Obra', 'Subió su primera foto de trabajo', '🎨', 'portfolio', 'common', 'work_photos_count', 1, 25),
  ('Portafolio Visual', 'Tiene 5 o más fotos de trabajos', '🖼️', 'portfolio', 'rare', 'work_photos_count', 5, 75),
  ('Galería Profesional', 'Tiene 10 o más fotos de trabajos', '🏆', 'portfolio', 'epic', 'work_photos_count', 10, 150),
  
  -- Reseñas y Reputación
  ('Primera Estrella', 'Recibió su primera reseña', '⭐', 'reviews', 'common', 'reviews_count', 1, 30),
  ('Reconocido', 'Tiene 5 o más reseñas', '🌟', 'reviews', 'rare', 'reviews_count', 5, 100),
  ('Experto Confiable', 'Tiene 10 o más reseñas', '✨', 'reviews', 'epic', 'reviews_count', 10, 200),
  ('Excelencia', 'Tiene calificación promedio de 5 estrellas', '👑', 'reviews', 'legendary', 'rating_average', 5, 300),
  
  -- Verificación
  ('Verificado', 'Perfil verificado oficialmente', '✓', 'verification', 'epic', 'is_verified', 1, 250),
  
  -- Actividad
  ('Disponible', 'Configuró su disponibilidad horaria', '📅', 'activity', 'common', 'has_availability', 1, 20),
  ('Primer Cliente', 'Recibió su primera solicitud de contacto', '🤝', 'activity', 'common', 'contact_requests_count', 1, 30),
  ('Popular', 'Recibió 10 o más solicitudes de contacto', '🔥', 'activity', 'rare', 'contact_requests_count', 10, 150),
  
  -- Hitos especiales
  ('Trabajador Activo', 'Completó 5 trabajos', '💪', 'achievements', 'rare', 'transactions_completed', 5, 100),
  ('Profesional Destacado', 'Completó 20 trabajos', '🎖️', 'achievements', 'epic', 'transactions_completed', 20, 300)
ON CONFLICT (name) DO NOTHING;

-- 3. Agregar constraint único en user_achievements si no existe
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'user_achievements_user_badge_unique'
  ) THEN
    ALTER TABLE public.user_achievements ADD CONSTRAINT user_achievements_user_badge_unique UNIQUE (user_id, badge_id);
  END IF;
END $$;

-- 4. Crear función para otorgar insignias automáticamente con notificación
CREATE OR REPLACE FUNCTION public.award_badges_and_notify(user_id_param uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  badge_record RECORD;
  user_value INTEGER;
  professional_record RECORD;
  newly_awarded_count INTEGER := 0;
BEGIN
  -- Get professional data
  SELECT * INTO professional_record
  FROM public.professionals 
  WHERE user_id = user_id_param;

  -- Si no es profesional, salir
  IF professional_record IS NULL THEN
    RETURN;
  END IF;

  -- Check each active badge
  FOR badge_record IN 
    SELECT * FROM public.badges 
    WHERE is_active = true 
    ORDER BY points ASC
  LOOP
    -- Skip if user already has this badge
    IF EXISTS (
      SELECT 1 FROM public.user_achievements 
      WHERE user_id = user_id_param AND badge_id = badge_record.id
    ) THEN
      CONTINUE;
    END IF;

    user_value := 0;

    -- Calculate user's current value for this badge condition
    CASE badge_record.condition_type
      WHEN 'profile_created' THEN
        user_value := 1;
        
      WHEN 'has_profile_photo' THEN
        user_value := CASE WHEN professional_record.image_url IS NOT NULL THEN 1 ELSE 0 END;
        
      WHEN 'description_complete' THEN
        user_value := CASE 
          WHEN professional_record.description IS NOT NULL 
            AND LENGTH(professional_record.description) >= 100 
          THEN 1 ELSE 0 END;
        
      WHEN 'services_count' THEN
        SELECT COUNT(*) INTO user_value
        FROM public.professional_services
        WHERE professional_id = professional_record.id AND is_active = true;
        
      WHEN 'work_photos_count' THEN
        SELECT COUNT(*) INTO user_value
        FROM public.work_photos
        WHERE professional_id = professional_record.id;
        
      WHEN 'reviews_count' THEN
        user_value := COALESCE(professional_record.review_count, 0);
        
      WHEN 'rating_average' THEN
        user_value := FLOOR(COALESCE(professional_record.rating, 0));
        
      WHEN 'is_verified' THEN
        user_value := CASE WHEN professional_record.is_verified THEN 1 ELSE 0 END;
        
      WHEN 'has_availability' THEN
        SELECT CASE WHEN COUNT(*) > 0 THEN 1 ELSE 0 END INTO user_value
        FROM public.availability_slots
        WHERE professional_id = professional_record.id;
        
      WHEN 'contact_requests_count' THEN
        SELECT COUNT(*) INTO user_value
        FROM public.contact_requests
        WHERE professional_id = professional_record.id;
        
      WHEN 'transactions_completed' THEN
        SELECT COUNT(*) INTO user_value
        FROM public.transactions
        WHERE professional_id = professional_record.id AND status = 'completed';
        
      ELSE
        CONTINUE;
    END CASE;

    -- Award badge if condition is met
    IF user_value >= badge_record.condition_value THEN
      INSERT INTO public.user_achievements (user_id, badge_id)
      VALUES (user_id_param, badge_record.id)
      ON CONFLICT (user_id, badge_id) DO NOTHING;
      
      -- Crear notificación de nueva insignia
      INSERT INTO public.notifications (user_id, title, message, type, action_url)
      VALUES (
        user_id_param,
        '🎉 ¡Nueva Insignia Desbloqueada!',
        'Has ganado la insignia "' || badge_record.name || '" (' || badge_record.points || ' puntos)',
        'achievement',
        '/dashboard?tab=profile'
      );
      
      newly_awarded_count := newly_awarded_count + 1;
    END IF;
  END LOOP;
END;
$$;

-- 5. Crear triggers para otorgar insignias automáticamente

-- Trigger cuando se crea/actualiza un profesional
CREATE OR REPLACE FUNCTION public.trigger_award_badges_professional()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  PERFORM public.award_badges_and_notify(NEW.user_id);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS award_badges_on_professional_update ON public.professionals;
CREATE TRIGGER award_badges_on_professional_update
AFTER INSERT OR UPDATE ON public.professionals
FOR EACH ROW
EXECUTE FUNCTION public.trigger_award_badges_professional();

-- Trigger cuando se agregan servicios
CREATE OR REPLACE FUNCTION public.trigger_award_badges_service()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  prof_user_id uuid;
BEGIN
  SELECT user_id INTO prof_user_id
  FROM public.professionals
  WHERE id = NEW.professional_id;
  
  IF prof_user_id IS NOT NULL THEN
    PERFORM public.award_badges_and_notify(prof_user_id);
  END IF;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS award_badges_on_service_add ON public.professional_services;
CREATE TRIGGER award_badges_on_service_add
AFTER INSERT ON public.professional_services
FOR EACH ROW
EXECUTE FUNCTION public.trigger_award_badges_service();

-- Trigger cuando se suben fotos de trabajo
CREATE OR REPLACE FUNCTION public.trigger_award_badges_photo()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  prof_user_id uuid;
BEGIN
  SELECT user_id INTO prof_user_id
  FROM public.professionals
  WHERE id = NEW.professional_id;
  
  IF prof_user_id IS NOT NULL THEN
    PERFORM public.award_badges_and_notify(prof_user_id);
  END IF;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS award_badges_on_photo_upload ON public.work_photos;
CREATE TRIGGER award_badges_on_photo_upload
AFTER INSERT ON public.work_photos
FOR EACH ROW
EXECUTE FUNCTION public.trigger_award_badges_photo();

-- Trigger cuando se reciben reseñas
CREATE OR REPLACE FUNCTION public.trigger_award_badges_review()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  prof_user_id uuid;
BEGIN
  SELECT user_id INTO prof_user_id
  FROM public.professionals
  WHERE id = NEW.professional_id;
  
  IF prof_user_id IS NOT NULL THEN
    PERFORM public.award_badges_and_notify(prof_user_id);
  END IF;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS award_badges_on_review ON public.reviews;
CREATE TRIGGER award_badges_on_review
AFTER INSERT OR UPDATE ON public.reviews
FOR EACH ROW
EXECUTE FUNCTION public.trigger_award_badges_review();

-- Trigger cuando se crean slots de disponibilidad
CREATE OR REPLACE FUNCTION public.trigger_award_badges_availability()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  prof_user_id uuid;
BEGIN
  SELECT user_id INTO prof_user_id
  FROM public.professionals
  WHERE id = NEW.professional_id;
  
  IF prof_user_id IS NOT NULL THEN
    PERFORM public.award_badges_and_notify(prof_user_id);
  END IF;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS award_badges_on_availability ON public.availability_slots;
CREATE TRIGGER award_badges_on_availability
AFTER INSERT ON public.availability_slots
FOR EACH ROW
EXECUTE FUNCTION public.trigger_award_badges_availability();

-- Trigger cuando se reciben solicitudes de contacto
CREATE OR REPLACE FUNCTION public.trigger_award_badges_contact()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  prof_user_id uuid;
BEGIN
  SELECT user_id INTO prof_user_id
  FROM public.professionals
  WHERE id = NEW.professional_id;
  
  IF prof_user_id IS NOT NULL THEN
    PERFORM public.award_badges_and_notify(prof_user_id);
  END IF;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS award_badges_on_contact ON public.contact_requests;
CREATE TRIGGER award_badges_on_contact
AFTER INSERT ON public.contact_requests
FOR EACH ROW
EXECUTE FUNCTION public.trigger_award_badges_contact();

-- Trigger cuando se completan transacciones
CREATE OR REPLACE FUNCTION public.trigger_award_badges_transaction()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  prof_user_id uuid;
BEGIN
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    SELECT user_id INTO prof_user_id
    FROM public.professionals
    WHERE id = NEW.professional_id;
    
    IF prof_user_id IS NOT NULL THEN
      PERFORM public.award_badges_and_notify(prof_user_id);
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS award_badges_on_transaction ON public.transactions;
CREATE TRIGGER award_badges_on_transaction
AFTER UPDATE ON public.transactions
FOR EACH ROW
EXECUTE FUNCTION public.trigger_award_badges_transaction();