-- Add DNI column to professionals table
ALTER TABLE public.professionals 
ADD COLUMN dni TEXT;

-- Add unique constraint on DNI to prevent duplicate registrations with same DNI
CREATE UNIQUE INDEX idx_professionals_dni ON public.professionals (dni) 
WHERE dni IS NOT NULL AND dni != '';