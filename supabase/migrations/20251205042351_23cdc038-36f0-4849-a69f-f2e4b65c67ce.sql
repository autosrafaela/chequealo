-- Add is_express column to contact_requests for Express quotes
ALTER TABLE public.contact_requests 
ADD COLUMN is_express boolean NOT NULL DEFAULT false;

-- Add index for filtering express requests
CREATE INDEX idx_contact_requests_is_express ON public.contact_requests(is_express) WHERE is_express = true;