-- Add external_url column to work_photos table for optional links
ALTER TABLE public.work_photos 
ADD COLUMN IF NOT EXISTS external_url TEXT NULL;

-- Add a comment explaining the column
COMMENT ON COLUMN public.work_photos.external_url IS 'Optional external link/URL related to this work photo';