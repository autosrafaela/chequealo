-- Eliminar el servicio MAGABY
DELETE FROM professional_services 
WHERE service_name ILIKE '%magab%';

-- Agregar categoría "Automatización con IA" en service_categories (en categoría de Tecnología)
INSERT INTO service_categories (name, description, icon, display_order, profession_category_id, is_active)
VALUES (
  'Automatización con IA',
  'Servicios de automatización y soluciones con Inteligencia Artificial',
  '🤖',
  0,
  (SELECT id FROM profession_categories WHERE name = 'Tecnología' LIMIT 1),
  true
)
ON CONFLICT DO NOTHING;