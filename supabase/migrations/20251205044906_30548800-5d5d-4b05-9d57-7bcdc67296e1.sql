-- Create combos table for quick packages
CREATE TABLE public.combos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  professional_id UUID NOT NULL REFERENCES public.professionals(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  includes TEXT[] NOT NULL DEFAULT '{}',
  price_from NUMERIC NOT NULL,
  deposit_amount NUMERIC,
  deposit_percentage INTEGER DEFAULT 30,
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.combos ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Combos are viewable by everyone"
ON public.combos FOR SELECT
USING (is_active = true);

CREATE POLICY "Professionals can manage their own combos"
ON public.combos FOR ALL
USING (professional_id IN (
  SELECT id FROM public.professionals WHERE user_id = auth.uid()
));

-- Index for faster lookups
CREATE INDEX idx_combos_professional_id ON public.combos(professional_id);
CREATE INDEX idx_combos_active ON public.combos(is_active) WHERE is_active = true;

-- Trigger for updated_at
CREATE TRIGGER update_combos_updated_at
BEFORE UPDATE ON public.combos
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();