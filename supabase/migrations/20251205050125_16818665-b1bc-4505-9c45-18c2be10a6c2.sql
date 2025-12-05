-- Create weekly neighborhood rankings table
CREATE TABLE IF NOT EXISTS public.weekly_rankings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id uuid NOT NULL REFERENCES public.professionals(id) ON DELETE CASCADE,
  location text NOT NULL,
  profession text NOT NULL,
  rank_position integer NOT NULL,
  score numeric NOT NULL DEFAULT 0,
  reviews_score numeric DEFAULT 0,
  response_score numeric DEFAULT 0,
  punctuality_score numeric DEFAULT 0,
  new_reviews_count integer DEFAULT 0,
  avg_response_minutes integer,
  week_start date NOT NULL,
  week_end date NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(professional_id, week_start)
);

-- Enable RLS
ALTER TABLE public.weekly_rankings ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Weekly rankings are viewable by everyone"
ON public.weekly_rankings FOR SELECT
USING (true);

CREATE POLICY "Only system can manage rankings"
ON public.weekly_rankings FOR ALL
USING (has_role(auth.uid(), 'admin'));

-- Indexes
CREATE INDEX IF NOT EXISTS idx_weekly_rankings_location ON public.weekly_rankings(location);
CREATE INDEX IF NOT EXISTS idx_weekly_rankings_profession ON public.weekly_rankings(profession);
CREATE INDEX IF NOT EXISTS idx_weekly_rankings_week ON public.weekly_rankings(week_start);
CREATE INDEX IF NOT EXISTS idx_weekly_rankings_score ON public.weekly_rankings(score DESC);