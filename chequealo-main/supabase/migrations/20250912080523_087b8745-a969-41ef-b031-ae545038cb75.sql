-- Create table for contact/quote requests
CREATE TABLE public.contact_requests (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  professional_id uuid NOT NULL,
  user_id uuid NOT NULL,
  type text NOT NULL CHECK (type IN ('contact', 'quote')),
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  message text NOT NULL,
  service_type text,
  budget_range text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'contacted', 'closed')),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on contact_requests
ALTER TABLE public.contact_requests ENABLE ROW LEVEL SECURITY;

-- Policies for contact_requests
CREATE POLICY "Professionals can view their requests" 
ON public.contact_requests 
FOR SELECT 
USING (professional_id IN (
  SELECT id FROM professionals WHERE user_id = auth.uid()
));

CREATE POLICY "Users can create contact requests" 
ON public.contact_requests 
FOR INSERT 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can view their own requests" 
ON public.contact_requests 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Professionals can update their requests status" 
ON public.contact_requests 
FOR UPDATE 
USING (professional_id IN (
  SELECT id FROM professionals WHERE user_id = auth.uid()
));

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
CREATE TRIGGER notify_professional_on_contact
  AFTER INSERT ON public.contact_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_professional_contact();

-- Add trigger to update contact_requests updated_at
CREATE TRIGGER update_contact_requests_updated_at
  BEFORE UPDATE ON public.contact_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();