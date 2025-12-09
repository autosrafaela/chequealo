import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { usePlanRestrictions } from '@/hooks/usePlanRestrictions';
import { toast } from 'sonner';
import { Bell, MessageCircle, Calendar, Star, AlertCircle, MapPin, CreditCard, Zap } from 'lucide-react';
import { 
  playNotificationSound, 
  playNotificationWithVibration, 
  initializeAudioContext,
  NotificationSoundType,
  VibrationPattern 
} from '@/utils/notificationSound';

interface RealtimeNotification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'reminder' | 'message' | 'booking' | 'review' | 'zone_alert' | 'payment';
  read: boolean;
  action_url?: string;
  created_at: string;
}

// Map notification types to sounds and vibrations
const getNotificationConfig = (notification: RealtimeNotification): { 
  sound: NotificationSoundType; 
  vibration: VibrationPattern;
} => {
  const title = notification.title.toLowerCase();
  
  // Check for express/urgent keywords first
  if (title.includes('express') || title.includes('urgencia') || title.includes('urgente')) {
    return { sound: 'express', vibration: 'urgent' };
  }

  switch (notification.type) {
    case 'message':
      return { sound: 'message', vibration: 'short' };
    case 'booking':
      if (title.includes('confirmad')) {
        return { sound: 'booking_confirmed', vibration: 'success' };
      }
      if (title.includes('recordatorio')) {
        return { sound: 'booking_reminder', vibration: 'medium' };
      }
      return { sound: 'booking_confirmed', vibration: 'medium' };
    case 'review':
      return { sound: 'new_review', vibration: 'success' };
    case 'zone_alert':
      return { sound: 'zone_alert', vibration: 'medium' };
    case 'payment':
      return { sound: 'payment', vibration: 'success' };
    case 'warning':
      return { sound: 'urgent', vibration: 'urgent' };
    case 'error':
      return { sound: 'urgent', vibration: 'long' };
    case 'success':
      return { sound: 'contact', vibration: 'success' };
    default:
      return { sound: 'default', vibration: 'short' };
  }
};

export const RealtimeNotifications: React.FC = () => {
  const { user } = useAuth();
  const { planLimits } = usePlanRestrictions();
  const [isSubscribed, setIsSubscribed] = useState(false);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'message':
        return <MessageCircle className="h-4 w-4" />;
      case 'booking':
      case 'reminder':
        return <Calendar className="h-4 w-4" />;
      case 'review':
        return <Star className="h-4 w-4" />;
      case 'zone_alert':
        return <MapPin className="h-4 w-4 text-primary" />;
      case 'payment':
        return <CreditCard className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <Zap className="h-4 w-4 text-amber-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-destructive" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const handleNotificationClick = (notification: RealtimeNotification) => {
    // Mark notification as read
    supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notification.id)
      .then(() => {
        console.log(`Notification ${notification.id} marked as read`);
      });

    // Navigate if action_url is provided
    if (notification.action_url) {
      window.location.href = notification.action_url;
    }
  };

  const showNotificationToast = (notification: RealtimeNotification) => {
    // Get sound and vibration config
    const config = getNotificationConfig(notification);
    
    // Play sound with vibration
    playNotificationWithVibration(config.sound, config.vibration);

    // Determine toast duration based on type
    const duration = notification.type === 'zone_alert' ? 8000 
      : notification.type === 'booking' ? 10000 
      : ['warning', 'error'].includes(notification.type) ? 8000 
      : 5000;

    toast(notification.title, {
      description: notification.message,
      icon: getNotificationIcon(notification.type),
      action: notification.action_url ? {
        label: "Ver",
        onClick: () => handleNotificationClick(notification)
      } : undefined,
      duration,
    });
  };

  useEffect(() => {
    if (!user || isSubscribed) return;

    console.log('Setting up realtime notifications for user:', user.id);

    // Initialize audio context on first interaction
    const handleFirstInteraction = () => {
      initializeAudioContext();
      document.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('touchstart', handleFirstInteraction);
    };
    document.addEventListener('click', handleFirstInteraction);
    document.addEventListener('touchstart', handleFirstInteraction);

    // Subscribe to notifications table changes
    const notificationsChannel = supabase
      .channel('notifications_channel')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('New notification received:', payload);
          const notification = payload.new as RealtimeNotification;
          showNotificationToast(notification);
        }
      )
      .subscribe((status) => {
        console.log('Notifications subscription status:', status);
        if (status === 'SUBSCRIBED') {
          setIsSubscribed(true);
        }
      });

    // Subscribe to messages for professionals (if they can receive messages)
    let messagesChannel: any = null;
    if (planLimits.canReceiveMessages) {
      // Get professional ID first
      supabase
        .from('professionals')
        .select('id')
        .eq('user_id', user.id)
        .single()
        .then(({ data: professional }) => {
          if (professional) {
            messagesChannel = supabase
              .channel('messages_channel')
              .on(
                'postgres_changes',
                {
                  event: 'INSERT',
                  schema: 'public',
                  table: 'messages'
                },
                async (payload) => {
                  console.log('New message received:', payload);
                  const message = payload.new as any;
                  
                  // Only show notification if message is not from current user
                  if (message.sender_id !== user.id) {
                    // Check if user is professional
                    const { data: prof } = await supabase
                      .from('professionals')
                      .select('id')
                      .eq('user_id', user.id)
                      .single();
                    
                    const redirectUrl = prof 
                      ? `/dashboard?tab=messages&conversation=${message.conversation_id}`
                      : `/user-dashboard?tab=messages&conversation=${message.conversation_id}`;
                    
                    // Play message notification sound with vibration
                    playNotificationWithVibration('message', 'short');
                    
                    toast('Nuevo mensaje', {
                      description: `Tienes un nuevo mensaje: ${message.content.substring(0, 50)}...`,
                      icon: <MessageCircle className="h-4 w-4" />,
                      action: {
                        label: "Ver",
                        onClick: () => window.location.href = redirectUrl
                      }
                    });
                  }
                }
              )
              .subscribe();
          }
        });
    }

    // Subscribe to booking updates
    const bookingsChannel = supabase
      .channel('bookings_channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookings'
        },
        (payload) => {
          console.log('Booking update received:', payload);
          const booking = payload.new || payload.old;
          
          // Show notification based on event type
          if (payload.eventType === 'INSERT' && booking && 'booking_date' in booking) {
            const bookingData = booking as any;
            playNotificationWithVibration('booking_confirmed', 'success');
            toast('Nueva reserva', {
              description: `Nueva cita programada para ${new Date(bookingData.booking_date).toLocaleDateString()}`,
              icon: <Calendar className="h-4 w-4" />,
              action: {
                label: "Ver",
                onClick: () => window.location.href = '/professional/bookings'
              }
            });
          } else if (payload.eventType === 'UPDATE' && payload.old && payload.new && 
                    'status' in payload.old && 'status' in payload.new && 
                    payload.old.status !== payload.new.status) {
            const newBooking = payload.new as any;
            playNotificationWithVibration('default', 'short');
            toast('Reserva actualizada', {
              description: `Estado de cita cambiado a: ${newBooking.status}`,
              icon: <Calendar className="h-4 w-4" />
            });
          }
        }
      )
      .subscribe();

    // Subscribe to pro_routes for zone today alerts
    const proRoutesChannel = supabase
      .channel('pro_routes_channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'pro_routes'
        },
        async (payload) => {
          console.log('Pro route update received:', payload);
          
          // Only process INSERT or UPDATE where is_active becomes true
          if (payload.eventType === 'INSERT' || 
             (payload.eventType === 'UPDATE' && payload.new && 'is_active' in payload.new && payload.new.is_active)) {
            const route = payload.new as any;
            
            // Check if current user has contacted or favorited this professional
            const [contactCheck, favoriteCheck] = await Promise.all([
              supabase
                .from('contact_requests')
                .select('id')
                .eq('professional_id', route.professional_id)
                .eq('user_id', user.id)
                .limit(1),
              supabase
                .from('favorites')
                .select('id')
                .eq('professional_id', route.professional_id)
                .eq('user_id', user.id)
                .limit(1)
            ]);

            const hasContacted = (contactCheck.data?.length || 0) > 0;
            const hasFavorited = (favoriteCheck.data?.length || 0) > 0;

            if (hasContacted || hasFavorited) {
              // Get professional info
              const { data: professional } = await supabase
                .from('professionals')
                .select('full_name, profession')
                .eq('id', route.professional_id)
                .single();

              if (professional) {
                const neighborhoods = route.neighborhoods?.slice(0, 2).join(', ') || 'tu zona';
                
                playNotificationWithVibration('zone_alert', 'medium');
                
                toast(`📍 ${professional.full_name.toUpperCase()} está cerca`, {
                  description: `El ${professional.profession} está trabajando en ${neighborhoods} hoy`,
                  icon: <MapPin className="h-4 w-4 text-primary" />,
                  duration: 8000,
                  action: {
                    label: "Ver perfil",
                    onClick: () => window.location.href = `/professional/${route.professional_id}`
                  }
                });
              }
            }
          }
        }
      )
      .subscribe();

    // Cleanup on unmount
    return () => {
      console.log('Cleaning up realtime subscriptions');
      setIsSubscribed(false);
      document.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('touchstart', handleFirstInteraction);
      notificationsChannel?.unsubscribe();
      messagesChannel?.unsubscribe();
      bookingsChannel?.unsubscribe();
      proRoutesChannel?.unsubscribe();
    };
  }, [user, planLimits.canReceiveMessages, isSubscribed]);

  // This component doesn't render anything visible
  return null;
};

export default RealtimeNotifications;
