-- Add free access field to professionals table
ALTER TABLE public.professionals
ADD COLUMN has_free_access boolean NOT NULL DEFAULT false;

-- Add comment to explain the field
COMMENT ON COLUMN public.professionals.has_free_access IS 'Admin can grant free unlimited access to selected professionals';

-- Create index for faster queries
CREATE INDEX idx_professionals_free_access ON public.professionals(has_free_access) WHERE has_free_access = true;