import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const VAPID_PUBLIC_KEY = "BP1yFovtMdbM1FEO_DxZm8nVLDrdr5x9YPxPZlkI58cSKhpI1_7L_SNocLh9S08QBMFJ8rXKOKJjrT4XIpCFdjo";

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export const usePushNotifications = () => {
  const { user } = useAuth();
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkSupport();
    checkSubscription();
  }, [user]);

  const checkSupport = () => {
    const supported = 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
    setIsSupported(supported);
    
    if (supported) {
      setPermission(Notification.permission);
    }
  };

  const checkSubscription = async () => {
    if (!user || !isSupported) {
      setLoading(false);
      return;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      setIsSubscribed(!!subscription);
    } catch (error) {
      console.error('Error checking subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const subscribe = async () => {
    if (!user) {
      toast.error('Debes iniciar sesión para suscribirte a notificaciones');
      return false;
    }

    if (!isSupported) {
      toast.error('Tu navegador no soporta notificaciones push');
      return false;
    }

    try {
      setLoading(true);

      // Request notification permission
      const permissionResult = await Notification.requestPermission();
      setPermission(permissionResult);

      if (permissionResult !== 'granted') {
        toast.error('Se necesita permiso para enviar notificaciones');
        return false;
      }

      // Get service worker registration
      const registration = await navigator.serviceWorker.ready;

      // Subscribe to push notifications
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
      });

      // Convert subscription to JSON
      const subscriptionJson = subscription.toJSON();

      // Save subscription to database
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

      setIsSubscribed(true);
      toast.success('¡Notificaciones activadas correctamente!');
      return true;

    } catch (error: any) {
      console.error('Error subscribing to push notifications:', error);
      toast.error('Error al activar notificaciones: ' + error.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const unsubscribe = async () => {
    if (!user) return false;

    try {
      setLoading(true);

      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        await subscription.unsubscribe();
      }

      // Deactivate subscription in database
      const { error } = await supabase
        .from('push_subscriptions')
        .update({ is_active: false })
        .eq('user_id', user.id);

      if (error) throw error;

      setIsSubscribed(false);
      toast.success('Notificaciones desactivadas');
      return true;

    } catch (error: any) {
      console.error('Error unsubscribing from push notifications:', error);
      toast.error('Error al desactivar notificaciones');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    isSupported,
    isSubscribed,
    permission,
    loading,
    subscribe,
    unsubscribe
  };
};
