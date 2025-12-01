-- Create storage bucket for carousel images
INSERT INTO storage.buckets (id, name, public)
VALUES ('carousel', 'carousel', true)
ON CONFLICT (id) DO NOTHING;

-- Create carousel_slides table
CREATE TABLE IF NOT EXISTS public.carousel_slides (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT,
  description TEXT,
  image_url TEXT NOT NULL,
  link_url TEXT,
  button_text TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.carousel_slides ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can view active slides
CREATE POLICY "Active slides are viewable by everyone"
  ON public.carousel_slides
  FOR SELECT
  USING (is_active = true);

-- Policy: Admins can manage all slides
CREATE POLICY "Admins can manage slides"
  ON public.carousel_slides
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Storage policies for carousel bucket
CREATE POLICY "Carousel images are publicly accessible"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'carousel');

CREATE POLICY "Admins can upload carousel images"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'carousel' AND
    has_role(auth.uid(), 'admin'::app_role)
  );

CREATE POLICY "Admins can update carousel images"
  ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'carousel' AND
    has_role(auth.uid(), 'admin'::app_role)
  );

CREATE POLICY "Admins can delete carousel images"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'carousel' AND
    has_role(auth.uid(), 'admin'::app_role)
  );

-- Create index for ordering
CREATE INDEX IF NOT EXISTS idx_carousel_slides_order 
  ON public.carousel_slides(display_order, is_active);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_carousel_slides_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_carousel_slides_updated_at
  BEFORE UPDATE ON public.carousel_slides
  FOR EACH ROW
  EXECUTE FUNCTION public.update_carousel_slides_updated_at();