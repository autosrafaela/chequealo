-- Fix remaining function search_path security issues

-- Fix update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $function$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$function$;

-- Fix update_professional_rating function  
CREATE OR REPLACE FUNCTION public.update_professional_rating()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  -- Update the professional's rating and review count
  UPDATE public.professionals 
  SET 
    rating = (
      SELECT COALESCE(AVG(rating), 0.0) 
      FROM public.reviews 
      WHERE professional_id = COALESCE(NEW.professional_id, OLD.professional_id)
    ),
    review_count = (
      SELECT COUNT(*) 
      FROM public.reviews 
      WHERE professional_id = COALESCE(NEW.professional_id, OLD.professional_id)
    ),
    updated_at = now()
  WHERE id = COALESCE(NEW.professional_id, OLD.professional_id);
  
  -- Create notification for the professional when a new review is added
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.notifications (user_id, title, message, type)
    SELECT 
      p.user_id,
      'Nueva reseña recibida',
      'Has recibido una nueva reseña de ' || NEW.rating || ' estrellas',
      'info'
    FROM public.professionals p
    WHERE p.id = NEW.professional_id;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$function$;

-- Fix notify_professional_contact function
CREATE OR REPLACE FUNCTION public.notify_professional_contact()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  -- Create notification for the professional
  INSERT INTO public.notifications (user_id, title, message, type, action_url)
  SELECT 
    p.user_id,
    CASE 
      WHEN NEW.type = 'contact' THEN 'Nueva solicitud de contacto'
      ELSE 'Nueva solicitud de presupuesto'
    END,
    'De: ' || NEW.name || ' - ' || LEFT(NEW.message, 50) || '...',
    'info',
    '/professional/' || NEW.professional_id
  FROM public.professionals p
  WHERE p.id = NEW.professional_id;
  
  RETURN NEW;
END;
$function$;

-- Fix update_user_rating function
CREATE OR REPLACE FUNCTION public.update_user_rating()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  -- This would update a user_stats table when implemented
  -- For now, just return the trigger result
  RETURN COALESCE(NEW, OLD);
END;
$function$;

-- Fix create_professional_subscription function
CREATE OR REPLACE FUNCTION public.create_professional_subscription()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  default_plan_id uuid;
BEGIN
  -- Get the default plan ID
  SELECT id INTO default_plan_id 
  FROM public.subscription_plans 
  WHERE name = 'Profesional Mensual' 
  LIMIT 1;
  
  -- Create subscription for the new professional
  IF default_plan_id IS NOT NULL THEN
    INSERT INTO public.subscriptions (
      user_id,
      professional_id,
      plan_id,
      status,
      trial_start_date,
      trial_end_date,
      payment_data_required_date
    )
    VALUES (
      NEW.user_id,
      NEW.id,
      default_plan_id,
      'trial',
      now(),
      now() + interval '90 days',
      now() + interval '75 days'
    );
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Fix check_subscription_status function
CREATE OR REPLACE FUNCTION public.check_subscription_status(professional_user_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  subscription_status text;
  trial_end_date timestamp with time zone;
BEGIN
  SELECT s.status, s.trial_end_date 
  INTO subscription_status, trial_end_date
  FROM public.subscriptions s
  JOIN public.professionals p ON s.professional_id = p.id
  WHERE p.user_id = professional_user_id
  ORDER BY s.created_at DESC
  LIMIT 1;
  
  -- If no subscription found, return 'none'
  IF subscription_status IS NULL THEN
    RETURN 'none';
  END IF;
  
  -- Check if trial has expired
  IF subscription_status = 'trial' AND now() > trial_end_date THEN
    RETURN 'expired';
  END IF;
  
  RETURN subscription_status;
END;
$function$;

-- Fix update_review_likes_count function
CREATE OR REPLACE FUNCTION public.update_review_likes_count()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $function$
BEGIN
  -- Esta función se puede usar para mantener un contador de likes
  -- en la tabla reviews si es necesario
  RETURN COALESCE(NEW, OLD);
END;
$function$;

-- Fix add_user_admin_role function
CREATE OR REPLACE FUNCTION public.add_user_admin_role(_email text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
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
$function$;