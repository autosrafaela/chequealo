-- Create table for tracking campaign events (WhatsApp clicks, form submissions, etc.)
CREATE TABLE public.campaign_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type TEXT NOT NULL, -- 'whatsapp_click', 'form_submit', 'page_view'
  campaign TEXT NOT NULL, -- 'urgencias24', 'cheq10', 'sena20'
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_content TEXT,
  professional_id UUID REFERENCES public.professionals(id),
  user_agent TEXT,
  referrer TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.campaign_events ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert events (for tracking)
CREATE POLICY "Anyone can insert campaign events"
ON public.campaign_events
FOR INSERT
WITH CHECK (true);

-- Only admins can view events
CREATE POLICY "Admins can view campaign events"
ON public.campaign_events
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Create index for faster queries
CREATE INDEX idx_campaign_events_campaign ON public.campaign_events(campaign);
CREATE INDEX idx_campaign_events_event_type ON public.campaign_events(event_type);
CREATE INDEX idx_campaign_events_created_at ON public.campaign_events(created_at DESC);