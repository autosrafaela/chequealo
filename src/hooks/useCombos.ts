import { useState, useEffect } from 'react';
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

export const useCombos = (professionalId: string | undefined) => {
  const [combos, setCombos] = useState<Combo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!professionalId) {
      setLoading(false);
      return;
    }

    const fetchCombos = async () => {
      try {
        const { data, error } = await supabase
          .from('combos')
          .select('*')
          .eq('professional_id', professionalId)
          .eq('is_active', true)
          .order('display_order');

        if (error) throw error;
        setCombos(data || []);
      } catch (err) {
        console.error('Error fetching combos:', err);
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchCombos();
  }, [professionalId]);

  return { combos, loading, error };
};

export default useCombos;
