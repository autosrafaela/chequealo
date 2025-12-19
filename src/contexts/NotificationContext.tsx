import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { 
  playNotificationWithVibration, 
  initializeAudioContext,
  isAudioReady,
  type NotificationSoundType,
  type VibrationPattern 
} from '@/utils/notificationSound';

// ===== TYPES =====
export interface NotificationData {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
  action_url?: string;
  created_at: string;
  read: boolean;
}

interface NotificationContextValue {
  // State
  notifications: NotificationData[];
  unreadCount: number;
  newNotification: NotificationData | null;
  isSubscribedToPush: boolean;
  pushPermission: NotificationPermission;
  isPushSupported: boolean;
  loading: boolean;
  isAudioInitialized: boolean;
  
  // Actions
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  clearNewNotification: () => void;
  refreshNotifications: () => Promise<void>;
  subscribeToPush: () => Promise<boolean>;
  unsubscribeFromPush: () => Promise<boolean>;
  initializeAudio: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextValue | null>(null);

// VAPID Public Key
const VAPID_PUBLIC_KEY = "BP1yFovtMdbM1FEO_DxZm8nVLDrdr5x9YPxPZlkI58cSKhpI1_7L_SNocLh9S08QBMFJ8rXKOKJjrT4XIpCFdjo";

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// Map notification types to sounds
const getNotificationSound = (notifType: string, title: string): { sound: NotificationSoundType; vibration: VibrationPattern } => {
  const titleLower = title.toLowerCase();
  
  if (titleLower.includes('urgente') || titleLower.includes('express')) {
    return { sound: 'express', vibration: 'urgent' };
  }
  if (titleLower.includes('mensaje') || titleLower.includes('message')) {
    return { sound: 'message', vibration: 'short' };
  }
  if (titleLower.includes('reseña') || titleLower.includes('review')) {
    return { sound: 'new_review', vibration: 'success' };
  }
  if (titleLower.includes('reserva') || titleLower.includes('booking')) {
    return { sound: 'booking_confirmed', vibration: 'success' };
  }
  if (titleLower.includes('pago') || titleLower.includes('payment')) {
    return { sound: 'payment', vibration: 'success' };
  }
  if (titleLower.includes('zona') || titleLower.includes('zone')) {
    return { sound: 'zone_alert', vibration: 'medium' };
  }
  if (titleLower.includes('favorito')) {
    return { sound: 'favorite', vibration: 'short' };
  }
  if (titleLower.includes('insignia') || titleLower.includes('badge')) {
    return { sound: 'badge_unlocked', vibration: 'success' };
  }
  if (titleLower.includes('contacto') || titleLower.includes('contact')) {
    return { sound: 'contact', vibration: 'medium' };
  }
  
  switch (notifType) {
    case 'error':
      return { sound: 'urgent', vibration: 'urgent' };
    case 'warning':
      return { sound: 'urgent', vibration: 'medium' };
    case 'success':
      return { sound: 'achievement', vibration: 'success' };
    default:
      return { sound: 'default', vibration: 'short' };
  }
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  
  // State
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [newNotification, setNewNotification] = useState<NotificationData | null>(null);
  const [isSubscribedToPush, setIsSubscribedToPush] = useState(false);
  const [pushPermission, setPushPermission] = useState<NotificationPermission>('default');
  const [isPushSupported, setIsPushSupported] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isAudioInitialized, setIsAudioInitialized] = useState(false);
  
  // Refs to prevent loops
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const isSubscribedRef = useRef(false);
  const processedNotificationsRef = useRef<Set<string>>(new Set());

  // Initialize audio function exposed to consumers
  const initializeAudio = useCallback(async () => {
    console.log('[NotificationProvider] Manual audio initialization requested');
    const success = await initializeAudioContext();
    setIsAudioInitialized(success);
  }, []);

  // Initialize audio on first user interaction
  useEffect(() => {
    const handleInteraction = async () => {
      if (isAudioReady()) {
        setIsAudioInitialized(true);
        return;
      }
      
      console.log('[NotificationProvider] Initializing audio on user interaction');
      const success = await initializeAudioContext();
      setIsAudioInitialized(success);
      
      if (success) {
        document.removeEventListener('click', handleInteraction);
        document.removeEventListener('touchstart', handleInteraction);
        document.removeEventListener('keydown', handleInteraction);
      }
    };
    
    // Check if already initialized
    if (isAudioReady()) {
      setIsAudioInitialized(true);
      return;
    }
    
    document.addEventListener('click', handleInteraction);
    document.addEventListener('touchstart', handleInteraction);
    document.addEventListener('keydown', handleInteraction);
    
    return () => {
      document.removeEventListener('click', handleInteraction);
      document.removeEventListener('touchstart', handleInteraction);
      document.removeEventListener('keydown', handleInteraction);
    };
  }, []);

  // Check push notification support
  useEffect(() => {
    const supported = 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
    setIsPushSupported(supported);
    
    if (supported && 'Notification' in window) {
      setPushPermission(Notification.permission);
    }
  }, []);

  // Check if user is subscribed to push
  const checkPushSubscription = useCallback(async () => {
    if (!user || !isPushSupported) {
      setLoading(false);
      return;
    }

    try {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        setIsSubscribedToPush(!!subscription);
      }
    } catch (error) {
      console.error('[NotificationProvider] Error checking push subscription:', error);
    } finally {
      setLoading(false);
    }
  }, [user, isPushSupported]);

  useEffect(() => {
    checkPushSubscription();
  }, [checkPushSubscription]);

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      const formattedNotifications: NotificationData[] = (data || []).map(notif => ({
        id: notif.id,
        title: notif.title,
        message: notif.message,
        type: notif.type as NotificationData['type'],
        action_url: notif.action_url,
        created_at: notif.created_at,
        read: notif.read
      }));

      setNotifications(formattedNotifications);
      setUnreadCount(formattedNotifications.filter(n => !n.read).length);
    } catch (error) {
      console.error('[NotificationProvider] Error fetching notifications:', error);
    }
  }, [user]);

  // Set up realtime subscription - only once per user
  useEffect(() => {
    if (!user) {
      if (channelRef.current) {
        console.log('[NotificationProvider] Cleaning up channel - user logged out');
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
        isSubscribedRef.current = false;
      }
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    if (isSubscribedRef.current) {
      console.log('[NotificationProvider] Already subscribed, skipping');
      return;
    }

    console.log('[NotificationProvider] Setting up realtime subscription for user:', user.id);
    
    fetchNotifications();

    const channelName = `notifications_${user.id}_${Date.now()}`;
    
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        async (payload) => {
          const notifId = payload.new.id;
          
          // Prevent duplicate processing
          if (processedNotificationsRef.current.has(notifId)) {
            console.log('[NotificationProvider] Notification already processed:', notifId);
            return;
          }
          processedNotificationsRef.current.add(notifId);
          
          // Clean up old processed notifications
          if (processedNotificationsRef.current.size > 100) {
            const entries = Array.from(processedNotificationsRef.current);
            processedNotificationsRef.current = new Set(entries.slice(-50));
          }
          
          console.log('[NotificationProvider] New notification received:', payload);
          
          const newNotif: NotificationData = {
            id: notifId,
            title: payload.new.title,
            message: payload.new.message,
            type: payload.new.type as NotificationData['type'],
            action_url: payload.new.action_url,
            created_at: payload.new.created_at,
            read: false
          };

          setNotifications(prev => [newNotif, ...prev]);
          setUnreadCount(prev => prev + 1);
          setNewNotification(newNotif);

          // Play sound and vibration
          const { sound, vibration } = getNotificationSound(newNotif.type, newNotif.title);
          console.log('[NotificationProvider] Playing notification sound:', sound);
          await playNotificationWithVibration(sound, vibration);

          // Show toast notification
          toast(newNotif.title, {
            description: newNotif.message,
            action: newNotif.action_url ? {
              label: 'Ver',
              onClick: () => window.location.href = newNotif.action_url!
            } : undefined
          });

          // Show browser notification if granted
          if (Notification.permission === 'granted') {
            try {
              new Notification(newNotif.title, {
                body: newNotif.message,
                icon: '/icon-192.png',
                badge: '/icon-192.png',
                tag: newNotif.id
              });
            } catch (e) {
              console.log('[NotificationProvider] Native notification failed:', e);
            }
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          setNotifications(prev =>
            prev.map(notif =>
              notif.id === payload.new.id
                ? { ...notif, read: payload.new.read }
                : notif
            )
          );
          
          setNotifications(prev => {
            setUnreadCount(prev.filter(n => !n.read).length);
            return prev;
          });
        }
      )
      .subscribe((status) => {
        console.log('[NotificationProvider] Subscription status:', status);
      });

    channelRef.current = channel;
    isSubscribedRef.current = true;

    return () => {
      console.log('[NotificationProvider] Cleaning up channel on unmount');
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
        isSubscribedRef.current = false;
      }
    };
  }, [user?.id]);

  // Mark as read
  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId);

      if (error) throw error;

      setNotifications(prev =>
        prev.map(notif =>
          notif.id === notificationId ? { ...notif, read: true } : notif
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('[NotificationProvider] Error marking notification as read:', error);
      toast.error('Error al marcar notificación como leída');
    }
  }, []);

  // Mark all as read
  const markAllAsRead = useCallback(async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', user.id)
        .eq('read', false);

      if (error) throw error;

      setNotifications(prev =>
        prev.map(notif => ({ ...notif, read: true }))
      );
      setUnreadCount(0);
      toast.success('Todas las notificaciones marcadas como leídas');
    } catch (error) {
      console.error('[NotificationProvider] Error marking all as read:', error);
      toast.error('Error al marcar todas las notificaciones como leídas');
    }
  }, [user]);

  // Clear new notification popup
  const clearNewNotification = useCallback(() => {
    setNewNotification(null);
  }, []);

  // Subscribe to push notifications
  const subscribeToPush = useCallback(async () => {
    if (!user) {
      toast.error('Debes iniciar sesión para activar notificaciones');
      return false;
    }

    if (!isPushSupported) {
      toast.error('Tu navegador no soporta notificaciones push');
      return false;
    }

    try {
      setLoading(true);

      const permissionResult = await Notification.requestPermission();
      setPushPermission(permissionResult);

      if (permissionResult !== 'granted') {
        toast.error('Se necesita permiso para enviar notificaciones');
        return false;
      }

      const registration = await navigator.serviceWorker.ready;

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
      });

      const subscriptionJson = subscription.toJSON();

      const { error } = await supabase
        .from('push_subscriptions')
        .upsert({
          user_id: user.id,
          endpoint: subscription.endpoint,
          p256dh: subscriptionJson.keys?.p256dh || '',
          auth: subscriptionJson.keys?.auth || '',
          user_agent: navigator.userAgent,
          is_active: true
        }, {
          onConflict: 'user_id,endpoint'
        });

      if (error) throw error;

      setIsSubscribedToPush(true);
      toast.success('¡Notificaciones push activadas!');
      return true;

    } catch (error: any) {
      console.error('[NotificationProvider] Error subscribing to push:', error);
      toast.error('Error al activar notificaciones push');
      return false;
    } finally {
      setLoading(false);
    }
  }, [user, isPushSupported]);

  // Unsubscribe from push
  const unsubscribeFromPush = useCallback(async () => {
    if (!user) return false;

    try {
      setLoading(true);

      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();

        if (subscription) {
          await subscription.unsubscribe();
        }
      }

      const { error } = await supabase
        .from('push_subscriptions')
        .update({ is_active: false })
        .eq('user_id', user.id);

      if (error) throw error;

      setIsSubscribedToPush(false);
      toast.success('Notificaciones push desactivadas');
      return true;

    } catch (error: any) {
      console.error('[NotificationProvider] Error unsubscribing from push:', error);
      toast.error('Error al desactivar notificaciones push');
      return false;
    } finally {
      setLoading(false);
    }
  }, [user]);

  const value: NotificationContextValue = {
    notifications,
    unreadCount,
    newNotification,
    isSubscribedToPush,
    pushPermission,
    isPushSupported,
    loading,
    isAudioInitialized,
    markAsRead,
    markAllAsRead,
    clearNewNotification,
    refreshNotifications: fetchNotifications,
    subscribeToPush,
    unsubscribeFromPush,
    initializeAudio
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
