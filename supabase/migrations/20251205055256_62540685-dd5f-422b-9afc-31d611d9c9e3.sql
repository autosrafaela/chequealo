-- Create pro_routes table for "Estoy en tu zona hoy" feature
CREATE TABLE public.pro_routes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  professional_id UUID NOT NULL REFERENCES public.professionals(id) ON DELETE CASCADE,
  route_date DATE NOT NULL DEFAULT CURRENT_DATE,
  neighborhoods TEXT[] NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  boost_expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(professional_id, route_date)
);

-- Enable RLS
ALTER TABLE public.pro_routes ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Pro routes are viewable by everyone"
  ON public.pro_routes
  FOR SELECT
  USING (is_active = true AND route_date = CURRENT_DATE);

CREATE POLICY "Professionals can manage their own routes"
  ON public.pro_routes
  FOR ALL
  USING (professional_id IN (
    SELECT id FROM professionals WHERE user_id = auth.uid()
  ));

-- Index for efficient queries
CREATE INDEX idx_pro_routes_date_active ON public.pro_routes(route_date, is_active) WHERE is_active = true;
CREATE INDEX idx_pro_routes_professional ON public.pro_routes(professional_id);
CREATE INDEX idx_pro_routes_neighborhoods ON public.pro_routes USING GIN(neighborhoods);

-- Trigger for updated_at
CREATE TRIGGER update_pro_routes_updated_at
  BEFORE UPDATE ON public.pro_routes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();