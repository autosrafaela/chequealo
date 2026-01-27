-- Agregar columna slug única para URLs personalizadas
ALTER TABLE public.professionals 
ADD COLUMN IF NOT EXISTS slug VARCHAR(50) UNIQUE;

-- Crear índice para búsquedas rápidas por slug
CREATE UNIQUE INDEX IF NOT EXISTS idx_professionals_slug ON public.professionals(slug) WHERE slug IS NOT NULL;

-- Constraint: solo letras minúsculas, números y guiones (mínimo 3 caracteres)
ALTER TABLE public.professionals 
ADD CONSTRAINT slug_format CHECK (slug IS NULL OR (slug ~ '^[a-z0-9][a-z0-9-]{1,48}[a-z0-9]$' AND LENGTH(slug) >= 3));

-- Comentario explicativo
COMMENT ON COLUMN public.professionals.slug IS 'URL personalizada del profesional (ej: chequealo.ar/mi-nombre). Solo letras minúsculas, números y guiones.';