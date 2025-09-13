-- Crear tabla para "me gusta" en reseñas
CREATE TABLE public.review_likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  review_id UUID NOT NULL,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(review_id, user_id)
);

-- Habilitar RLS
ALTER TABLE public.review_likes ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para review_likes
CREATE POLICY "Users can manage their own review likes" 
ON public.review_likes 
FOR ALL 
USING (auth.uid() = user_id);

CREATE POLICY "Review likes are viewable by everyone" 
ON public.review_likes 
FOR SELECT 
USING (true);

-- Función para actualizar contadores de likes (opcional)
CREATE OR REPLACE FUNCTION public.update_review_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  -- Esta función se puede usar para mantener un contador de likes
  -- en la tabla reviews si es necesario
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;