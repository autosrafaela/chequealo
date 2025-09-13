-- Create table for predefined professions/categories
CREATE TABLE public.profession_categories (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL UNIQUE,
  description text,
  is_active boolean NOT NULL DEFAULT true,
  icon text,
  display_order integer DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profession_categories ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Profession categories are viewable by everyone" 
ON public.profession_categories 
FOR SELECT 
USING (true);

CREATE POLICY "Only admins can manage profession categories" 
ON public.profession_categories 
FOR ALL 
USING (public.has_role(auth.uid(), 'admin'));

-- Create table for service categories
CREATE TABLE public.service_categories (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL UNIQUE,
  description text,
  profession_category_id uuid REFERENCES public.profession_categories(id),
  is_active boolean NOT NULL DEFAULT true,
  icon text,
  display_order integer DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.service_categories ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Service categories are viewable by everyone" 
ON public.service_categories 
FOR SELECT 
USING (true);

CREATE POLICY "Only admins can manage service categories" 
ON public.service_categories 
FOR ALL 
USING (public.has_role(auth.uid(), 'admin'));

-- Add update triggers
CREATE TRIGGER update_profession_categories_updated_at
BEFORE UPDATE ON public.profession_categories
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_service_categories_updated_at
BEFORE UPDATE ON public.service_categories
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some initial profession categories
INSERT INTO public.profession_categories (name, description, icon, display_order) VALUES
('Hogar y Construcción', 'Servicios relacionados con el hogar, construcción y mantenimiento', '🏠', 1),
('Tecnología', 'Servicios de tecnología, informática y desarrollo', '💻', 2),
('Salud y Bienestar', 'Servicios de salud, terapias y bienestar', '🏥', 3),
('Educación', 'Clases particulares, tutorías y enseñanza', '📚', 4),
('Automotriz', 'Reparación y mantenimiento de vehículos', '🚗', 5),
('Belleza y Estética', 'Servicios de belleza, peluquería y estética', '💅', 6),
('Eventos', 'Organización de eventos, catering y entretenimiento', '🎉', 7),
('Deportes y Fitness', 'Entrenamiento personal y actividades deportivas', '🏋️', 8),
('Legal y Contable', 'Servicios legales, contables y administrativos', '⚖️', 9),
('Arte y Diseño', 'Servicios creativos, diseño y arte', '🎨', 10);

-- Insert some initial service categories
INSERT INTO public.service_categories (name, description, profession_category_id) 
SELECT 'Plomería', 'Instalación y reparación de sistemas de agua', id FROM public.profession_categories WHERE name = 'Hogar y Construcción'
UNION ALL
SELECT 'Electricidad', 'Instalaciones y reparaciones eléctricas', id FROM public.profession_categories WHERE name = 'Hogar y Construcción'
UNION ALL
SELECT 'Carpintería', 'Trabajos en madera y muebles', id FROM public.profession_categories WHERE name = 'Hogar y Construcción'
UNION ALL
SELECT 'Pintura', 'Pintura de paredes y superficies', id FROM public.profession_categories WHERE name = 'Hogar y Construcción'
UNION ALL
SELECT 'Desarrollo Web', 'Creación de sitios y aplicaciones web', id FROM public.profession_categories WHERE name = 'Tecnología'
UNION ALL
SELECT 'Soporte Técnico', 'Reparación de computadoras y dispositivos', id FROM public.profession_categories WHERE name = 'Tecnología'
UNION ALL
SELECT 'Diseño Gráfico', 'Creación de diseños y material gráfico', id FROM public.profession_categories WHERE name = 'Arte y Diseño'
UNION ALL
SELECT 'Fotografía', 'Servicios de fotografía profesional', id FROM public.profession_categories WHERE name = 'Arte y Diseño'
UNION ALL
SELECT 'Fisioterapia', 'Terapia física y rehabilitación', id FROM public.profession_categories WHERE name = 'Salud y Bienestar'
UNION ALL
SELECT 'Masajes', 'Terapias de relajación y masajes', id FROM public.profession_categories WHERE name = 'Salud y Bienestar';