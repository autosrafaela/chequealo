import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface Combo {
  id: string;
  professional_id: string;
  title: string;
  description: string | null;
  includes: string[];
  price_from: number;
  deposit_amount: number | null;
  deposit_percentage: number;
  is_active: boolean;
  display_order: number;
}

const fetchCombos = async (professionalId: string): Promise<Combo[]> => {
  const { data, error } = await supabase
    .from('combos')
    .select('*')
    .eq('professional_id', professionalId)
    .eq('is_active', true)
    .order('display_order');

  if (error) throw error;
  return data || [];
};

export const useCombos = (professionalId: string | undefined) => {
  const { data: combos = [], isLoading: loading, error } = useQuery({
    queryKey: ['combos', professionalId],
    queryFn: () => fetchCombos(professionalId!),
    enabled: !!professionalId,
    staleTime: 5 * 60 * 1000, // 5 minutos de caché
  });

  return { combos, loading, error };
};

export default useCombos;
