-- Create table for tracking redirects
CREATE TABLE IF NOT EXISTS public.redirect_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  from_path TEXT NOT NULL,
  to_path TEXT NOT NULL,
  referrer TEXT,
  user_agent TEXT,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for better query performance
CREATE INDEX idx_redirect_analytics_from_path ON public.redirect_analytics(from_path);
CREATE INDEX idx_redirect_analytics_timestamp ON public.redirect_analytics(timestamp DESC);

-- Enable RLS (Row Level Security)
ALTER TABLE public.redirect_analytics ENABLE ROW LEVEL SECURITY;

-- Create policy to allow inserts from anyone (anonymous tracking)
CREATE POLICY "Anyone can insert redirect analytics" 
ON public.redirect_analytics 
FOR INSERT 
WITH CHECK (true);

-- Create policy to allow admins to view all data
CREATE POLICY "Admins can view all redirect analytics" 
ON public.redirect_analytics 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
);

-- Add comment to table
COMMENT ON TABLE public.redirect_analytics IS 'Tracks URL redirects to analyze traffic sources and alternative route usage';