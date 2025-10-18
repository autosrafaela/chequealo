-- Desactivar el plan "Gratis" (freemium)
UPDATE public.subscription_plans
SET is_active = false
WHERE id = 'free';

-- Renombrar "Agencia" a "Premium" y actualizar características
UPDATE public.subscription_plans
SET 
  name = 'Premium',
  features = jsonb_build_array(
    'Todo de Profesional Mensual',
    'Multi-sede (gestión de sucursales)',
    'Cuentas de equipo (empleados)',
    'Analytics avanzado y reportes',
    'Soporte prioritario 24/7',
    'API access para integraciones',
    'Reportes personalizados',
    'Gestor de cuenta dedicado',
    'Templates de respuestas rápidas',
    'Integración con Google Calendar',
    'Estadísticas en tiempo real',
    'Exportación de datos avanzada',
    'Widget embebible para web',
    'Notificaciones SMS premium',
    'Capacitación personalizada',
    'Acceso beta a nuevas funciones'
  ),
  advanced_analytics = true,
  priority_support = true,
  sort_order = 3
WHERE id = 'agencia';

COMMENT ON TABLE subscription_plans IS 'Planes de suscripción disponibles. Plan Gratis eliminado, Premium ofrece funcionalidades avanzadas para empresas y profesionales establecidos';