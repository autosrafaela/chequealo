-- Tabla para profesiones del profesional (relación muchos a muchos)
CREATE TABLE public.professional_professions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id UUID NOT NULL REFERENCES public.professionals(id) ON DELETE CASCADE,
  profession VARCHAR(100) NOT NULL,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(professional_id, profession)
);

-- Índice para búsquedas
CREATE INDEX idx_professional_professions_professional ON public.professional_professions(professional_id);
CREATE INDEX idx_professional_professions_profession ON public.professional_professions(profession);

-- Enable RLS
ALTER TABLE public.professional_professions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Professions are viewable by everyone"
ON public.professional_professions
FOR SELECT
USING (true);

CREATE POLICY "Professionals can manage their own professions"
ON public.professional_professions
FOR ALL
USING (
  professional_id IN (
    SELECT id FROM public.professionals WHERE user_id = auth.uid()
  )
);

-- Migrar datos existentes: copiar la profesión actual como profesión principal
INSERT INTO public.professional_professions (professional_id, profession, is_primary)
SELECT id, profession, true
FROM public.professionals
WHERE profession IS NOT NULL AND profession != ''
ON CONFLICT (professional_id, profession) DO NOTHING;