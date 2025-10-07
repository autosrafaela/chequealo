-- Create badges table for achievements system
CREATE TABLE public.badges (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    icon TEXT NOT NULL,
    category TEXT NOT NULL, -- 'activity', 'quality', 'social', 'milestone'
    points INTEGER NOT NULL DEFAULT 0,
    rarity TEXT NOT NULL DEFAULT 'common', -- 'common', 'rare', 'epic', 'legendary' 
    condition_type TEXT NOT NULL, -- 'reviews_count', 'rating_average', 'bookings_count', 'photos_uploaded'
    condition_value INTEGER NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user achievements table
CREATE TABLE public.user_achievements (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    badge_id UUID NOT NULL REFERENCES public.badges(id) ON DELETE CASCADE,
    earned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    progress INTEGER DEFAULT 0, -- for progressive achievements
    is_displayed BOOLEAN NOT NULL DEFAULT true,
    UNIQUE(user_id, badge_id)
);

-- Create user stats table for gamification
CREATE TABLE public.user_stats (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE,
    total_points INTEGER NOT NULL DEFAULT 0,
    level INTEGER NOT NULL DEFAULT 1,
    experience_points INTEGER NOT NULL DEFAULT 0,
    badges_count INTEGER NOT NULL DEFAULT 0,
    ranking_position INTEGER,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create professional rankings table
CREATE TABLE public.professional_rankings (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    professional_id UUID NOT NULL REFERENCES public.professionals(id) ON DELETE CASCADE,
    category TEXT NOT NULL, -- 'overall', 'monthly', 'by_profession'
    rank_position INTEGER NOT NULL,
    score NUMERIC NOT NULL DEFAULT 0.0,
    period_start DATE,
    period_end DATE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(professional_id, category, period_start, period_end)
);

-- Enable RLS on all tables
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.professional_rankings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for badges (public readable)
CREATE POLICY "Badges are viewable by everyone" 
ON public.badges FOR SELECT USING (true);

CREATE POLICY "Only admins can manage badges" 
ON public.badges FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for user achievements
CREATE POLICY "Users can view their own achievements" 
ON public.user_achievements FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Achievements can be viewed by everyone for profiles" 
ON public.user_achievements FOR SELECT 
USING (is_displayed = true);

-- RLS Policies for user stats
CREATE POLICY "Users can view their own stats" 
ON public.user_stats FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "User stats are publicly viewable for rankings" 
ON public.user_stats FOR SELECT 
USING (true);

CREATE POLICY "Users can update their own stats" 
ON public.user_stats FOR UPDATE 
USING (user_id = auth.uid());

-- RLS Policies for professional rankings
CREATE POLICY "Professional rankings are viewable by everyone" 
ON public.professional_rankings FOR SELECT USING (true);

CREATE POLICY "Only system can manage rankings" 
ON public.professional_rankings FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Insert default badges
INSERT INTO public.badges (name, description, icon, category, points, rarity, condition_type, condition_value) VALUES
('Primer Contacto', 'Realizaste tu primera solicitud de contacto', 'MessageSquare', 'activity', 10, 'common', 'contact_requests_count', 1),
('Verificado', 'Completaste la verificación de tu perfil profesional', 'Shield', 'milestone', 50, 'rare', 'is_verified', 1),
('Estrella en Ascenso', 'Alcanzaste 4+ estrellas de calificación', 'Star', 'quality', 100, 'epic', 'rating_average', 4),
('Fotógrafo', 'Subiste 5+ fotos de tus trabajos', 'Camera', 'activity', 25, 'common', 'work_photos_count', 5),
('Profesional Popular', 'Recibiste 25+ reseñas', 'Heart', 'social', 200, 'epic', 'reviews_count', 25),
('Experto', 'Completaste 100+ trabajos', 'Award', 'milestone', 500, 'legendary', 'completed_jobs', 100),
('Comunicador', 'Respondiste a 50+ mensajes', 'MessageCircle', 'social', 75, 'rare', 'messages_sent', 50),
('Confiable', 'Mantuviste 100% de puntualidad en citas', 'Clock', 'quality', 150, 'epic', 'punctuality_rate', 100),
('Especialista', 'Ofrecés 10+ servicios diferentes', 'Briefcase', 'activity', 80, 'rare', 'services_count', 10),
('Cliente Frecuente', 'Realizaste 10+ contactos con profesionales', 'User', 'activity', 60, 'rare', 'contact_requests_count', 10);

-- Create triggers for automatic stats updates
CREATE OR REPLACE FUNCTION public.update_user_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Create or update user stats when achievements are earned
  INSERT INTO public.user_stats (user_id, badges_count, total_points)
  SELECT 
    NEW.user_id,
    COUNT(*) as badges_count,
    COALESCE(SUM(b.points), 0) as total_points
  FROM public.user_achievements ua
  LEFT JOIN public.badges b ON ua.badge_id = b.id
  WHERE ua.user_id = NEW.user_id
  ON CONFLICT (user_id) DO UPDATE SET
    badges_count = EXCLUDED.badges_count,
    total_points = EXCLUDED.total_points,
    level = GREATEST(1, FLOOR(EXCLUDED.total_points / 100.0)::INTEGER),
    experience_points = EXCLUDED.total_points % 100,
    updated_at = now();
    
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER update_user_stats_trigger
  AFTER INSERT ON public.user_achievements
  FOR EACH ROW EXECUTE FUNCTION public.update_user_stats();

-- Function to check and award badges
CREATE OR REPLACE FUNCTION public.check_and_award_badges(user_id_param UUID)
RETURNS VOID AS $$
DECLARE
  badge_record RECORD;
  user_value INTEGER;
  professional_id_var UUID;
BEGIN
  -- Get professional_id if user is a professional
  SELECT id INTO professional_id_var
  FROM public.professionals 
  WHERE user_id = user_id_param;

  -- Check each badge condition
  FOR badge_record IN SELECT * FROM public.badges WHERE is_active = true LOOP
    -- Skip if user already has this badge
    IF EXISTS (
      SELECT 1 FROM public.user_achievements 
      WHERE user_id = user_id_param AND badge_id = badge_record.id
    ) THEN
      CONTINUE;
    END IF;

    user_value := 0;

    -- Calculate user's current value for this badge condition
    CASE badge_record.condition_type
      WHEN 'contact_requests_count' THEN
        SELECT COUNT(*) INTO user_value
        FROM public.contact_requests
        WHERE user_id = user_id_param;
        
      WHEN 'is_verified' THEN
        SELECT CASE WHEN is_verified THEN 1 ELSE 0 END INTO user_value
        FROM public.professionals
        WHERE user_id = user_id_param;
        
      WHEN 'rating_average' THEN
        SELECT FLOOR(COALESCE(rating, 0)) INTO user_value
        FROM public.professionals
        WHERE user_id = user_id_param;
        
      WHEN 'work_photos_count' THEN
        SELECT COUNT(*) INTO user_value
        FROM public.work_photos wp
        JOIN public.professionals p ON wp.professional_id = p.id
        WHERE p.user_id = user_id_param;
        
      WHEN 'reviews_count' THEN
        SELECT COALESCE(review_count, 0) INTO user_value
        FROM public.professionals
        WHERE user_id = user_id_param;
        
      WHEN 'services_count' THEN
        SELECT COUNT(*) INTO user_value
        FROM public.professional_services ps
        JOIN public.professionals p ON ps.professional_id = p.id
        WHERE p.user_id = user_id_param AND ps.is_active = true;
        
      ELSE
        CONTINUE;
    END CASE;

    -- Award badge if condition is met
    IF user_value >= badge_record.condition_value THEN
      INSERT INTO public.user_achievements (user_id, badge_id)
      VALUES (user_id_param, badge_record.id)
      ON CONFLICT (user_id, badge_id) DO NOTHING;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;