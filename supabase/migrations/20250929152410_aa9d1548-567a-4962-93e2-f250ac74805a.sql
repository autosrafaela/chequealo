-- Actualizar los precios de los planes existentes
UPDATE subscription_plans SET 
  price = 8990 
WHERE name = 'Plan Básico';

UPDATE subscription_plans SET 
  price = 14990 
WHERE name LIKE '%Profesional%';

UPDATE subscription_plans SET 
  price = 24990 
WHERE name = 'Plan Premium';