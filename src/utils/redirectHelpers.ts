import { supabase } from '@/integrations/supabase/client';

/**
 * Determina la ruta del dashboard correcto según el tipo de usuario
 * @param userId - ID del usuario autenticado
 * @returns Ruta del dashboard correspondiente
 */
export async function getDashboardRoute(userId: string): Promise<string> {
  try {
    // Verificar si el usuario tiene un perfil de profesional
    const { data: professionalProfile } = await supabase
      .from('professionals')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();
    
    // Si tiene perfil de profesional, redirigir a dashboard profesional
    if (professionalProfile) {
      return '/dashboard';
    }
    
    // Si no, es un cliente regular
    return '/user-dashboard';
  } catch (error) {
    console.error('Error determining dashboard route:', error);
    // Por defecto, enviar a user-dashboard en caso de error
    return '/user-dashboard';
  }
}

/**
 * Verifica si un usuario es profesional
 * @param userId - ID del usuario autenticado
 * @returns true si es profesional, false si es cliente
 */
export async function isProfessionalUser(userId: string): Promise<boolean> {
  try {
    const { data } = await supabase
      .from('professionals')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();
    
    return !!data;
  } catch (error) {
    console.error('Error checking if user is professional:', error);
    return false;
  }
}
