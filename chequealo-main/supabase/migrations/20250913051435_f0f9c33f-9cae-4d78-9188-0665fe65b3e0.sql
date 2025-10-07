-- Agregar nueva categoría de Logística y Transporte
INSERT INTO public.profession_categories (name, description, icon, display_order, is_active) VALUES
('Logística y Transporte', 'Servicios de transporte, mudanzas y logística', '🚛', 11, true);

-- Obtener el ID de la nueva categoría para usarlo en los servicios
-- Agregar servicios de logística y transporte
INSERT INTO public.service_categories (name, description, profession_category_id, icon, display_order, is_active) 
SELECT 
  'Fletes y Mudanzas', 
  'Servicios de transporte de bienes y mudanzas', 
  pc.id, 
  '🚛', 
  0, 
  true
FROM public.profession_categories pc 
WHERE pc.name = 'Logística y Transporte';

INSERT INTO public.service_categories (name, description, profession_category_id, icon, display_order, is_active) 
SELECT 
  'Delivery y Mensajería', 
  'Servicios de entrega y mensajería', 
  pc.id, 
  '📦', 
  1, 
  true
FROM public.profession_categories pc 
WHERE pc.name = 'Logística y Transporte';

INSERT INTO public.service_categories (name, description, profession_category_id, icon, display_order, is_active) 
SELECT 
  'Transporte de Pasajeros', 
  'Servicios de transporte de personas', 
  pc.id, 
  '🚕', 
  2, 
  true
FROM public.profession_categories pc 
WHERE pc.name = 'Logística y Transporte';

-- Agregar más servicios que podrían estar faltando en otras categorías existentes

-- Servicios de Hogar y Construcción
INSERT INTO public.service_categories (name, description, profession_category_id, icon, display_order, is_active) 
SELECT 
  'Jardinería y Paisajismo', 
  'Diseño y mantenimiento de jardines', 
  pc.id, 
  '🌿', 
  10, 
  true
FROM public.profession_categories pc 
WHERE pc.name = 'Hogar y Construcción';

INSERT INTO public.service_categories (name, description, profession_category_id, icon, display_order, is_active) 
SELECT 
  'Limpieza y Mantenimiento', 
  'Servicios de limpieza doméstica y comercial', 
  pc.id, 
  '🧽', 
  11, 
  true
FROM public.profession_categories pc 
WHERE pc.name = 'Hogar y Construcción';

INSERT INTO public.service_categories (name, description, profession_category_id, icon, display_order, is_active) 
SELECT 
  'Instalación de Sistemas', 
  'Instalación de cámaras, sistemas de seguridad, etc.', 
  pc.id, 
  '📹', 
  12, 
  true
FROM public.profession_categories pc 
WHERE pc.name = 'Hogar y Construcción';

-- Servicios de Belleza y Estética
INSERT INTO public.service_categories (name, description, profession_category_id, icon, display_order, is_active) 
SELECT 
  'Peluquería y Barbería', 
  'Corte de cabello y tratamientos capilares', 
  pc.id, 
  '✂️', 
  1, 
  true
FROM public.profession_categories pc 
WHERE pc.name = 'Belleza y Estética';

INSERT INTO public.service_categories (name, description, profession_category_id, icon, display_order, is_active) 
SELECT 
  'Manicura y Pedicura', 
  'Cuidado de uñas de manos y pies', 
  pc.id, 
  '💅', 
  2, 
  true
FROM public.profession_categories pc 
WHERE pc.name = 'Belleza y Estética';

INSERT INTO public.service_categories (name, description, profession_category_id, icon, display_order, is_active) 
SELECT 
  'Maquillaje Profesional', 
  'Servicios de maquillaje para eventos', 
  pc.id, 
  '💄', 
  3, 
  true
FROM public.profession_categories pc 
WHERE pc.name = 'Belleza y Estética';

-- Servicios de Automotriz
INSERT INTO public.service_categories (name, description, profession_category_id, icon, display_order, is_active) 
SELECT 
  'Mecánica General', 
  'Reparación mecánica de vehículos', 
  pc.id, 
  '🔧', 
  1, 
  true
FROM public.profession_categories pc 
WHERE pc.name = 'Automotriz';

INSERT INTO public.service_categories (name, description, profession_category_id, icon, display_order, is_active) 
SELECT 
  'Electricidad Automotriz', 
  'Reparación eléctrica de vehículos', 
  pc.id, 
  '⚡', 
  2, 
  true
FROM public.profession_categories pc 
WHERE pc.name = 'Automotriz';

INSERT INTO public.service_categories (name, description, profession_category_id, icon, display_order, is_active) 
SELECT 
  'Pintura y Chapa', 
  'Pintura y reparación de carrocería', 
  pc.id, 
  '🎨', 
  3, 
  true
FROM public.profession_categories pc 
WHERE pc.name = 'Automotriz';

INSERT INTO public.service_categories (name, description, profession_category_id, icon, display_order, is_active) 
SELECT 
  'Lavado y Detailing', 
  'Lavado profesional y cuidado estético del vehículo', 
  pc.id, 
  '🚿', 
  4, 
  true
FROM public.profession_categories pc 
WHERE pc.name = 'Automotriz';

-- Servicios de Educación
INSERT INTO public.service_categories (name, description, profession_category_id, icon, display_order, is_active) 
SELECT 
  'Apoyo Escolar', 
  'Clases de apoyo para estudiantes', 
  pc.id, 
  '📖', 
  1, 
  true
FROM public.profession_categories pc 
WHERE pc.name = 'Educación';

INSERT INTO public.service_categories (name, description, profession_category_id, icon, display_order, is_active) 
SELECT 
  'Idiomas', 
  'Enseñanza de idiomas extranjeros', 
  pc.id, 
  '🌍', 
  2, 
  true
FROM public.profession_categories pc 
WHERE pc.name = 'Educación';

INSERT INTO public.service_categories (name, description, profession_category_id, icon, display_order, is_active) 
SELECT 
  'Música', 
  'Clases de instrumentos musicales', 
  pc.id, 
  '🎵', 
  3, 
  true
FROM public.profession_categories pc 
WHERE pc.name = 'Educación';