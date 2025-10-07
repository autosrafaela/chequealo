import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export const useFavorites = () => {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const loadFavorites = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('favorites')
        .select('professional_id')
        .eq('user_id', user.id);

      if (error) throw error;
      
      setFavorites(data?.map(f => f.professional_id) || []);
    } catch (error) {
      console.error('Error loading favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFavorites();
  }, [user]);

  const toggleFavorite = async (professionalId: string) => {
    if (!user) {
      toast.error('Debes iniciar sesión para guardar favoritos');
      return;
    }

    try {
      const isFavorite = favorites.includes(professionalId);
      
      if (isFavorite) {
        // Remove from favorites
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('professional_id', professionalId);

        if (error) throw error;
        
        setFavorites(prev => prev.filter(id => id !== professionalId));
        toast.success('Eliminado de favoritos');
      } else {
        // Add to favorites
        const { error } = await supabase
          .from('favorites')
          .insert({
            user_id: user.id,
            professional_id: professionalId
          });

        if (error) throw error;
        
        setFavorites(prev => [...prev, professionalId]);
        toast.success('Agregado a favoritos');
      }
    } catch (error: any) {
      console.error('Error toggling favorite:', error);
      if (error.message?.includes('duplicate')) {
        toast.error('Ya está en tus favoritos');
      } else {
        toast.error('Error al actualizar favoritos');
      }
    }
  };

  const isFavorite = (professionalId: string) => {
    return favorites.includes(professionalId);
  };

  return {
    favorites,
    loading,
    toggleFavorite,
    isFavorite,
    loadFavorites
  };
};