-- Add geolocation support to professionals table
ALTER TABLE public.professionals 
ADD COLUMN latitude DOUBLE PRECISION,
ADD COLUMN longitude DOUBLE PRECISION,
ADD COLUMN location_verified BOOLEAN DEFAULT false,
ADD COLUMN location_updated_at TIMESTAMP WITH TIME ZONE;

-- Add video support to work_photos table
ALTER TABLE public.work_photos 
ADD COLUMN video_url TEXT,
ADD COLUMN media_type TEXT DEFAULT 'image' CHECK (media_type IN ('image', 'video')),
ADD COLUMN is_before_after BOOLEAN DEFAULT false,
ADD COLUMN before_image_url TEXT,
ADD COLUMN after_image_url TEXT;

-- Create certifications table
CREATE TABLE public.certifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  professional_id UUID NOT NULL,
  certificate_name TEXT NOT NULL,
  certificate_url TEXT NOT NULL,
  issuing_organization TEXT NOT NULL,
  issue_date DATE,
  expiry_date DATE,
  verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for certifications
ALTER TABLE public.certifications ENABLE ROW LEVEL SECURITY;

-- Create policies for certifications
CREATE POLICY "Professionals can manage their certifications"
ON public.certifications
FOR ALL
USING (professional_id IN (
  SELECT id FROM public.professionals 
  WHERE user_id = auth.uid()
))
WITH CHECK (professional_id IN (
  SELECT id FROM public.professionals 
  WHERE user_id = auth.uid()
));

CREATE POLICY "Certifications are viewable by everyone"
ON public.certifications
FOR SELECT
USING (true);

-- Add trigger for certifications updated_at
CREATE TRIGGER update_certifications_updated_at
  BEFORE UPDATE ON public.certifications
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Update subscription plans with new features
UPDATE public.subscription_plans 
SET 
  max_work_photos = CASE 
    WHEN name LIKE '%Básico%' THEN 5
    WHEN name LIKE '%Profesional%' THEN 20
    WHEN name LIKE '%Premium%' THEN -1
    ELSE max_work_photos
  END,
  features = features || 
    CASE 
      WHEN name LIKE '%Básico%' THEN '["basic_portfolio", "basic_location"]'::jsonb
      WHEN name LIKE '%Profesional%' THEN '["enhanced_portfolio", "video_uploads", "proximity_search"]'::jsonb
      WHEN name LIKE '%Premium%' THEN '["enhanced_portfolio", "video_uploads", "before_after_gallery", "digital_certificates", "advanced_geolocation", "interactive_map"]'::jsonb
      ELSE '["basic_portfolio"]'::jsonb
    END;