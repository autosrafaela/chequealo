-- Create professional_services table
CREATE TABLE public.professional_services (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  professional_id uuid NOT NULL REFERENCES public.professionals(id) ON DELETE CASCADE,
  service_name text NOT NULL,
  description text,
  price_from numeric,
  price_to numeric,
  price_unit text DEFAULT 'ARS'::text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create reviews table
CREATE TABLE public.reviews (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  professional_id uuid NOT NULL REFERENCES public.professionals(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  service_provided text,
  is_verified boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create review_responses table
CREATE TABLE public.review_responses (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  review_id uuid NOT NULL REFERENCES public.reviews(id) ON DELETE CASCADE,
  professional_id uuid NOT NULL REFERENCES public.professionals(id) ON DELETE CASCADE,
  response text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create work_photos table
CREATE TABLE public.work_photos (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  professional_id uuid NOT NULL REFERENCES public.professionals(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  caption text,
  work_type text,
  uploaded_by text NOT NULL DEFAULT 'professional'::text,
  is_featured boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.professional_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_photos ENABLE ROW LEVEL SECURITY;

-- RLS Policies for professional_services
CREATE POLICY "Services are viewable by everyone" 
ON public.professional_services 
FOR SELECT 
USING (true);

CREATE POLICY "Professionals can manage their own services" 
ON public.professional_services 
FOR ALL 
USING (professional_id IN (
  SELECT id FROM public.professionals WHERE user_id = auth.uid()
));

-- RLS Policies for reviews
CREATE POLICY "Reviews are viewable by everyone" 
ON public.reviews 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create reviews" 
ON public.reviews 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews" 
ON public.reviews 
FOR UPDATE 
USING (auth.uid() = user_id);

-- RLS Policies for review_responses
CREATE POLICY "Review responses are viewable by everyone" 
ON public.review_responses 
FOR SELECT 
USING (true);

CREATE POLICY "Professionals can manage responses to their reviews" 
ON public.review_responses 
FOR ALL 
USING (professional_id IN (
  SELECT id FROM public.professionals WHERE user_id = auth.uid()
));

-- RLS Policies for work_photos
CREATE POLICY "Work photos are viewable by everyone" 
ON public.work_photos 
FOR SELECT 
USING (true);

CREATE POLICY "Professionals can manage their own work photos" 
ON public.work_photos 
FOR ALL 
USING (professional_id IN (
  SELECT id FROM public.professionals WHERE user_id = auth.uid()
));

-- Create indexes for better performance
CREATE INDEX idx_professional_services_professional_id ON public.professional_services(professional_id);
CREATE INDEX idx_reviews_professional_id ON public.reviews(professional_id);
CREATE INDEX idx_review_responses_review_id ON public.review_responses(review_id);
CREATE INDEX idx_work_photos_professional_id ON public.work_photos(professional_id);

-- Update triggers for timestamps
CREATE TRIGGER update_professional_services_updated_at
  BEFORE UPDATE ON public.professional_services
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at
  BEFORE UPDATE ON public.reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_review_responses_updated_at
  BEFORE UPDATE ON public.review_responses
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample data
INSERT INTO public.professional_services (professional_id, service_name, description, price_from, price_to) 
SELECT id, 'Balances contables', 'Preparación de balances anuales para empresas y comercios', 15000, 50000
FROM public.professionals 
WHERE email = 'ana.rodriguez@email.com'
LIMIT 1;

INSERT INTO public.professional_services (professional_id, service_name, description, price_from, price_to) 
SELECT id, 'Liquidación de impuestos', 'AFIP, ARBA, municipales. Monotributo y responsable inscripto', 5000, 15000
FROM public.professionals 
WHERE email = 'ana.rodriguez@email.com'
LIMIT 1;