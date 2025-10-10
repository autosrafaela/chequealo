-- Migrar suscripciones del plan duplicado "Profesional Mensual" al "Plan Profesional"
UPDATE subscriptions 
SET 
  plan_id = 'a0aac672-b7ed-486c-8ea7-8d460504acfa',
  updated_at = now()
WHERE plan_id = '8e9f40a5-f9bf-413f-9e8e-ef539f3cce75';

-- Actualizar selected_plan_id si existe
UPDATE subscriptions 
SET 
  selected_plan_id = 'a0aac672-b7ed-486c-8ea7-8d460504acfa',
  updated_at = now()
WHERE selected_plan_id = '8e9f40a5-f9bf-413f-9e8e-ef539f3cce75';

-- Desactivar el plan duplicado "Profesional Mensual"
UPDATE subscription_plans 
SET 
  is_active = false,
  updated_at = now()
WHERE id = '8e9f40a5-f9bf-413f-9e8e-ef539f3cce75';