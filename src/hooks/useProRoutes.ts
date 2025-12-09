import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface ProRoute {
  id: string;
  professional_id: string;
  route_date: string;
  neighborhoods: string[];
  is_active: boolean;
  boost_expires_at: string | null;
  created_at: string;
  updated_at: string;
}

export const useProRoutes = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Get professional's current route for today
  const { data: todayRoute, isLoading } = useQuery({
    queryKey: ['pro-route-today', user?.id],
    queryFn: async () => {
      if (!user) return null;

      // First get the professional ID
      const { data: professional } = await supabase
        .from('professionals')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!professional) return null;

      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('pro_routes')
        .select('*')
        .eq('professional_id', professional.id)
        .eq('route_date', today)
        .maybeSingle();

      if (error) throw error;
      return data as ProRoute | null;
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 5,
  });

  // Activate "En tu zona hoy"
  const activateRoute = useMutation({
    mutationFn: async (neighborhoods: string[]) => {
      if (!user) throw new Error('No user');

      const { data: professional } = await supabase
        .from('professionals')
        .select('id, full_name, profession')
        .eq('user_id', user.id)
        .single();

      if (!professional) throw new Error('No professional profile');

      const today = new Date().toISOString().split('T')[0];
      const boostExpires = new Date();
      boostExpires.setHours(boostExpires.getHours() + 7); // 7 hours boost

      const { data, error } = await supabase
        .from('pro_routes')
        .upsert({
          professional_id: professional.id,
          route_date: today,
          neighborhoods,
          is_active: true,
          boost_expires_at: boostExpires.toISOString(),
        }, {
          onConflict: 'professional_id,route_date'
        })
        .select()
        .single();

      if (error) throw error;
      
      // Return professional info for notification
      return { route: data, professional };
    },
    onSuccess: async (result) => {
      queryClient.invalidateQueries({ queryKey: ['pro-route-today'] });
      queryClient.invalidateQueries({ queryKey: ['professionals'] });
      toast.success('¡Activaste "En tu zona hoy"! Tu perfil tendrá más visibilidad por 7 horas.');
      
      // Notify interested users (done async, don't wait)
      if (result?.professional && result?.route) {
        import('@/utils/notificationHelpers').then(({ notifyZoneTodayToInterested }) => {
          notifyZoneTodayToInterested(
            result.professional.id,
            result.professional.full_name,
            result.professional.profession,
            result.route.neighborhoods
          ).then((res) => {
            if (res.notifiedCount > 0) {
              console.log(`Notified ${res.notifiedCount} interested users about zone activation`);
            }
          });
        });
      }
    },
    onError: (error) => {
      console.error('Error activating route:', error);
      toast.error('Error al activar la zona');
    },
  });

  // Deactivate route
  const deactivateRoute = useMutation({
    mutationFn: async () => {
      if (!todayRoute) throw new Error('No route to deactivate');

      const { error } = await supabase
        .from('pro_routes')
        .update({ is_active: false })
        .eq('id', todayRoute.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pro-route-today'] });
      queryClient.invalidateQueries({ queryKey: ['professionals'] });
      toast.success('Desactivaste "En tu zona hoy"');
    },
    onError: (error) => {
      console.error('Error deactivating route:', error);
      toast.error('Error al desactivar');
    },
  });

  return {
    todayRoute,
    isLoading,
    activateRoute,
    deactivateRoute,
    isBoostActive: todayRoute?.is_active && todayRoute?.boost_expires_at 
      ? new Date(todayRoute.boost_expires_at) > new Date() 
      : false,
  };
};

// Hook to check if a professional has active "En tu zona" for search results
export const useActiveProRoutes = () => {
  return useQuery({
    queryKey: ['active-pro-routes'],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('pro_routes')
        .select('professional_id, neighborhoods, boost_expires_at')
        .eq('route_date', today)
        .eq('is_active', true);

      if (error) throw error;
      
      // Filter those with active boost
      const now = new Date();
      return (data || []).filter(route => 
        route.boost_expires_at && new Date(route.boost_expires_at) > now
      );
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};
