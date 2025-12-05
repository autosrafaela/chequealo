-- Add followup tracking fields to contact_requests
ALTER TABLE public.contact_requests 
ADD COLUMN IF NOT EXISTS last_followup_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS followup_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS reengaged boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS reengaged_at timestamp with time zone;

-- Create lead_coupons table for dynamic discount codes
CREATE TABLE public.lead_coupons (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code text NOT NULL UNIQUE,
  contact_request_id uuid REFERENCES public.contact_requests(id) ON DELETE CASCADE,
  professional_id uuid NOT NULL REFERENCES public.professionals(id) ON DELETE CASCADE,
  discount_percentage integer NOT NULL DEFAULT 10,
  expires_at timestamp with time zone NOT NULL,
  used_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.lead_coupons ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Coupons viewable by professionals" ON public.lead_coupons
  FOR SELECT USING (
    professional_id IN (
      SELECT id FROM professionals WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Coupons viewable by coupon holder" ON public.lead_coupons
  FOR SELECT USING (
    contact_request_id IN (
      SELECT id FROM contact_requests WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "System can manage coupons" ON public.lead_coupons
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Index for faster queries
CREATE INDEX idx_lead_coupons_expires ON public.lead_coupons(expires_at);
CREATE INDEX idx_contact_requests_followup ON public.contact_requests(status, created_at, last_followup_at);