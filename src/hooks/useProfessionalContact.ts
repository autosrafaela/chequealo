import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ContactInfo {
  phone: string | null;
  email: string | null;
}

export const useProfessionalContact = () => {
  const [loading, setLoading] = useState(false);

  const getContactInfo = async (professionalId: string): Promise<ContactInfo | null> => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .rpc('get_professional_contact', { prof_id: professionalId });
      
      if (error) {
        console.error('Error getting contact info:', error);
        return null;
      }

      // Handle both array and object returns
      if (!data) return null;
      if (Array.isArray(data)) return data[0] ?? null;
      if (typeof data === 'object' && 'phone' in data) return data as ContactInfo;
      return null;
    } catch (error) {
      console.error('Error getting contact info:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    getContactInfo,
    loading
  };
};