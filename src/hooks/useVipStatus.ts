import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useVipStatus = (professionalIds: string[]) => {
  return useQuery({
    queryKey: ['vip-status', professionalIds.sort().join(',')],
    queryFn: async () => {
      if (professionalIds.length === 0) return new Map<string, boolean>();

      const { data, error } = await supabase
        .from('professionals_vip_status' as any)
        .select('id, is_vip')
        .in('id', professionalIds);

      if (error) {
        console.error('Error fetching VIP status:', error);
        return new Map<string, boolean>();
      }

      const map = new Map<string, boolean>();
      (data || []).forEach((row: any) => {
        map.set(row.id, row.is_vip === true);
      });
      return map;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: professionalIds.length > 0,
  });
};
