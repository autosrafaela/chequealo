-- Function to automatically update professional rating
CREATE OR REPLACE FUNCTION public.update_professional_rating()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for automatic rating update
DROP TRIGGER IF EXISTS update_rating_on_review_change ON public.reviews;
CREATE TRIGGER update_rating_on_review_change
  AFTER INSERT OR UPDATE OR DELETE ON public.reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.update_professional_rating();

-- Function to create notification when contact request is made
CREATE OR REPLACE FUNCTION public.notify_professional_contact()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for contact notifications
DROP TRIGGER IF EXISTS notify_professional_on_contact ON public.contact_requests;
CREATE TRIGGER notify_professional_on_contact
  AFTER INSERT ON public.contact_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_professional_contact();