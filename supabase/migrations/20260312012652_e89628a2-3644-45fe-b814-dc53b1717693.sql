
CREATE TABLE public.lead_clicks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id uuid NOT NULL,
  clicker_id uuid,
  source text DEFAULT 'profile',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.lead_clicks ENABLE ROW LEVEL SECURITY;

-- Anyone can insert (fire-and-forget, no auth required)
CREATE POLICY "Anyone can insert lead clicks"
  ON public.lead_clicks FOR INSERT
  WITH CHECK (true);

-- Only admins can read
CREATE POLICY "Admins can read lead clicks"
  ON public.lead_clicks FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Admins can manage (update/delete)
CREATE POLICY "Admins can manage lead clicks"
  ON public.lead_clicks FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Indexes for analytics
CREATE INDEX idx_lead_clicks_professional ON public.lead_clicks(professional_id);
CREATE INDEX idx_lead_clicks_created ON public.lead_clicks(created_at);
