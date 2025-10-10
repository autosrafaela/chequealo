-- Desactivar planes antiguos con UUID
UPDATE public.subscription_plans 
SET is_active = false 
WHERE id IN (
  'f5e19c51-efde-4d25-bd60-1a6bd925911b',
  'a0aac672-b7ed-486c-8ea7-8d460504acfa',
  'e670805c-dd44-48b6-9ba5-25c0be83d6ee',
  '8e9f40a5-f9bf-413f-9e8e-ef539f3cce75'
);

-- Actualizar precios correctos en los planes nuevos
UPDATE public.subscription_plans 
SET price = 8999, sort_order = 1
WHERE id = 'emprendedor';

UPDATE public.subscription_plans 
SET price = 14990, sort_order = 2, is_recommended = true
WHERE id = 'profesional';

UPDATE public.subscription_plans 
SET price = 24990, sort_order = 3
WHERE id = 'agencia';