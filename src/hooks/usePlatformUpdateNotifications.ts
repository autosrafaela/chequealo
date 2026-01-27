import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { playNotificationWithVibration } from '@/utils/notificationSound';
import { toast } from 'sonner';
import { UPDATE_TYPES } from './usePlatformUpdates';

/**
 * Hook to listen for new platform updates and show push notifications
 */
export const usePlatformUpdateNotifications = () => {
  const { user } = useAuth();

  useEffect(() => {
    if (!user?.id) return;

    // Subscribe to new platform updates
    const channel = supabase
      .channel('platform-updates-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'platform_updates',
        },
        async (payload) => {
          const update = payload.new as any;
          
          // Only notify if update is active and published
          if (!update.is_active) return;
          const publishAt = new Date(update.publish_at);
          if (publishAt > new Date()) return;

          // Play notification sound and vibrate
          playNotificationWithVibration('urgent');

          // Show toast notification
          const typeConfig = UPDATE_TYPES[update.type as keyof typeof UPDATE_TYPES];
          const icon = update.icon || typeConfig?.icon || '✨';
          
          toast(
            `${icon} ${update.title}`,
            {
              description: update.description,
              duration: 8000,
              action: update.link ? {
                label: 'Ver más',
                onClick: () => {
                  if (update.link.startsWith('http')) {
                    window.open(update.link, '_blank');
                  } else {
                    window.location.href = update.link;
                  }
                }
              } : undefined,
            }
          );

          // Show browser notification if permitted
          if ('Notification' in window && Notification.permission === 'granted') {
            try {
              const notification = new Notification(update.title, {
                body: update.description,
                icon: '/icon-192.png',
                tag: `platform-update-${update.id}`,
                requireInteraction: true,
              });

              notification.onclick = () => {
                window.focus();
                notification.close();
                if (update.link) {
                  if (update.link.startsWith('http')) {
                    window.open(update.link, '_blank');
                  } else {
                    window.location.href = update.link;
                  }
                }
              };

              // Auto close after 8 seconds
              setTimeout(() => notification.close(), 8000);
            } catch (error) {
              console.log('Browser notification not available:', error);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);
};
