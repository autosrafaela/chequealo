import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface PlatformUpdate {
  id: string;
  title: string;
  description: string;
  type: 'feature' | 'improvement' | 'fix' | 'announcement';
  icon: string | null;
  link: string | null;
  is_active: boolean;
  created_at: string;
  publish_at: string;
}

export const UPDATE_TYPES = {
  feature: { 
    icon: '🚀', 
    label: 'Nueva funcionalidad',
    color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
  },
  improvement: { 
    icon: '⚡', 
    label: 'Mejora',
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
  },
  fix: { 
    icon: '🔧', 
    label: 'Corrección',
    color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400'
  },
  announcement: { 
    icon: '📢', 
    label: 'Anuncio',
    color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'
  },
} as const;

export const usePlatformUpdates = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch unread platform updates
  const { data: unreadUpdates = [], isLoading, refetch } = useQuery({
    queryKey: ['platform-updates-unread', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      // Get all active updates
      const { data: updates, error: updatesError } = await supabase
        .from('platform_updates')
        .select('*')
        .eq('is_active', true)
        .lte('publish_at', new Date().toISOString())
        .order('publish_at', { ascending: false });

      if (updatesError) {
        console.error('Error fetching platform updates:', updatesError);
        return [];
      }

      if (!updates || updates.length === 0) return [];

      // Get read statuses for current user
      const { data: readStatuses, error: readError } = await supabase
        .from('user_update_reads')
        .select('update_id')
        .eq('user_id', user.id);

      if (readError) {
        console.error('Error fetching read statuses:', readError);
        return updates as PlatformUpdate[];
      }

      const readIds = new Set(readStatuses?.map(r => r.update_id) || []);
      
      // Filter to only unread updates
      return updates.filter(update => !readIds.has(update.id)) as PlatformUpdate[];
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Mark single update as read
  const markAsReadMutation = useMutation({
    mutationFn: async (updateId: string) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('user_update_reads')
        .insert({ 
          user_id: user.id, 
          update_id: updateId 
        });

      if (error && error.code !== '23505') { // Ignore duplicate key error
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform-updates-unread'] });
    },
  });

  // Mark all updates as read
  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id || !unreadUpdates.length) return;

      const inserts = unreadUpdates.map(update => ({
        user_id: user.id,
        update_id: update.id
      }));

      const { error } = await supabase
        .from('user_update_reads')
        .upsert(inserts, { onConflict: 'user_id,update_id' });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform-updates-unread'] });
    },
  });

  return {
    unreadUpdates,
    unreadCount: unreadUpdates.length,
    isLoading,
    markAsRead: (updateId: string) => markAsReadMutation.mutate(updateId),
    markAllAsRead: () => markAllAsReadMutation.mutate(),
    refetch,
  };
};
