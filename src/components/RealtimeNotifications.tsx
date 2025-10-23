import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { usePlanRestrictions } from '@/hooks/usePlanRestrictions';
import { toast } from 'sonner';
import { Bell, MessageCircle, Calendar, Star, AlertCircle } from 'lucide-react';

interface RealtimeNotification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'reminder' | 'message' | 'booking' | 'review';
  read: boolean;
  action_url?: string;
  created_at: string;
}

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
      case 'warning':
      case 'error':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const getToastVariant = (type: string): 'default' | 'destructive' => {
    return type === 'error' || type === 'warning' ? 'destructive' : 'default';
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
    // Only show toast for premium users or specific notification types
    if (!planLimits.advancedAnalytics && !['booking', 'reminder', 'message'].includes(notification.type)) {
      return;
    }

    toast(notification.title, {
      description: notification.message,
      icon: getNotificationIcon(notification.type),
      action: notification.action_url ? {
        label: "Ver",
        onClick: () => handleNotificationClick(notification)
      } : undefined,
      duration: notification.type === 'reminder' ? 10000 : 5000,
    });
  };

  useEffect(() => {
    if (!user || isSubscribed) return;

    console.log('Setting up realtime notifications for user:', user.id);

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
                  table: 'messages',
                  filter: `conversation_id=in.(select id from conversations where professional_id=${professional.id})`
                },
                (payload) => {
                  console.log('New message received:', payload);
                  const message = payload.new;
                  
                  // Only show notification if message is not from current user
                  if (message.sender_id !== user.id) {
                    toast('Nuevo mensaje', {
                      description: `Tienes un nuevo mensaje: ${message.content.substring(0, 50)}...`,
                      icon: <MessageCircle className="h-4 w-4" />,
                      action: {
                        label: "Ver",
                        onClick: () => window.location.href = `/user-dashboard?tab=messages&conversation=${message.conversation_id}`
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
            toast('Reserva actualizada', {
              description: `Estado de cita cambiado a: ${newBooking.status}`,
              icon: <Calendar className="h-4 w-4" />
            });
          }
        }
      )
      .subscribe();

    // Cleanup on unmount
    return () => {
      console.log('Cleaning up realtime subscriptions');
      setIsSubscribed(false);
      notificationsChannel?.unsubscribe();
      messagesChannel?.unsubscribe();
      bookingsChannel?.unsubscribe();
    };
  }, [user, planLimits.canReceiveMessages, planLimits.advancedAnalytics, isSubscribed]);

  // This component doesn't render anything visible
  return null;
};

export default RealtimeNotifications;