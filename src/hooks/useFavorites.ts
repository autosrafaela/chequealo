import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const fetchFavorites = async (userId: string): Promise<string[]> => {
  const { data, error } = await supabase
    .from('favorites')
    .select('professional_id')
    .eq('user_id', userId);

  if (error) throw error;
  return data?.map(f => f.professional_id) || [];
};

export const useFavorites = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: favorites = [], isLoading: loading } = useQuery({
    queryKey: ['favorites', user?.id],
    queryFn: () => fetchFavorites(user!.id),
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });

  const addMutation = useMutation({
    mutationFn: async (professionalId: string) => {
      const { error } = await supabase
        .from('favorites')
        .insert({ user_id: user!.id, professional_id: professionalId });
      if (error) throw error;
      return professionalId;
    },
    onMutate: async (professionalId) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ['favorites', user?.id] });
      const previous = queryClient.getQueryData<string[]>(['favorites', user?.id]);
      queryClient.setQueryData(['favorites', user?.id], [...(previous || []), professionalId]);
      return { previous };
    },
    onError: (err: any, _, context) => {
      queryClient.setQueryData(['favorites', user?.id], context?.previous);
      if (err.message?.includes('duplicate')) {
        toast.error('Ya está en tus favoritos');
      } else {
        toast.error('Error al agregar a favoritos');
      }
    },
    onSuccess: () => toast.success('Agregado a favoritos'),
  });

  const removeMutation = useMutation({
    mutationFn: async (professionalId: string) => {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user!.id)
        .eq('professional_id', professionalId);
      if (error) throw error;
      return professionalId;
    },
    onMutate: async (professionalId) => {
      await queryClient.cancelQueries({ queryKey: ['favorites', user?.id] });
      const previous = queryClient.getQueryData<string[]>(['favorites', user?.id]);
      queryClient.setQueryData(
        ['favorites', user?.id],
        (previous || []).filter(id => id !== professionalId)
      );
      return { previous };
    },
    onError: (_, __, context) => {
      queryClient.setQueryData(['favorites', user?.id], context?.previous);
      toast.error('Error al eliminar de favoritos');
    },
    onSuccess: () => toast.success('Eliminado de favoritos'),
  });

  const toggleFavorite = async (professionalId: string) => {
    if (!user) {
      toast.error('Debes iniciar sesión para guardar favoritos');
      return;
    }

    if (favorites.includes(professionalId)) {
      removeMutation.mutate(professionalId);
    } else {
      addMutation.mutate(professionalId);
    }
  };

  const isFavorite = (professionalId: string) => favorites.includes(professionalId);

  const loadFavorites = () => {
    queryClient.invalidateQueries({ queryKey: ['favorites', user?.id] });
  };

  return {
    favorites,
    loading,
    toggleFavorite,
    isFavorite,
    loadFavorites
  };
};
