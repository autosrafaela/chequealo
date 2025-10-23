import { supabase } from '@/integrations/supabase/client';

/**
 * Send push notification to users
 */
const sendPushNotification = async (
  userIds: string[],
  title: string,
  message: string,
  actionUrl?: string
) => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    await supabase.functions.invoke('send-push-notification', {
      body: {
        userIds,
        title,
        body: message,
        url: actionUrl,
        icon: '/icon-192.png'
      }
    });
  } catch (error) {
    console.error('Error sending push notification:', error);
  }
};

export interface CreateNotificationProps {
  userId: string;
  title: string;
  message: string;
  type?: 'success' | 'info' | 'warning' | 'error';
  actionUrl?: string;
}

/**
 * Create a new notification for a user
 */
export const createNotification = async ({
  userId,
  title,
  message,
  type = 'info',
  actionUrl
}: CreateNotificationProps) => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        title,
        message,
        type,
        action_url: actionUrl,
        read: false
      })
      .select()
      .single();

    if (error) throw error;
    
    // Send push notification
    if (data) {
      await sendPushNotification([userId], title, message, actionUrl);
    }
    
    return { data, error: null };
  } catch (error) {
    console.error('Error creating notification:', error);
    return { data: null, error };
  }
};

/**
 * Create notification when a new contact request is received
 */
export const notifyNewContactRequest = async (professionalUserId: string, clientName: string, serviceType: string) => {
  return await createNotification({
    userId: professionalUserId,
    title: '🔔 Nueva solicitud de contacto',
    message: `${clientName} está interesado en tu servicio de ${serviceType}`,
    type: 'info',
    actionUrl: '/dashboard'
  });
};

/**
 * Create notification when a professional gets verified
 */
export const notifyProfessionalVerified = async (professionalUserId: string) => {
  return await createNotification({
    userId: professionalUserId,
    title: '✅ ¡Profesional verificado!',
    message: 'Tu perfil profesional ha sido verificado exitosamente',
    type: 'success',
    actionUrl: '/dashboard'
  });
};

/**
 * Create notification when subscription is about to expire
 */
export const notifySubscriptionExpiring = async (professionalUserId: string, daysLeft: number) => {
  return await createNotification({
    userId: professionalUserId,
    title: '⏰ Suscripción por vencer',
    message: `Tu suscripción vence en ${daysLeft} días. Renueva para mantener tu perfil activo`,
    type: 'warning',
    actionUrl: '/dashboard'
  });
};

/**
 * Create notification when subscription expires
 */
export const notifySubscriptionExpired = async (professionalUserId: string) => {
  return await createNotification({
    userId: professionalUserId,
    title: '❌ Suscripción expirada',
    message: 'Tu suscripción ha expirado. Renueva para reactivar tu perfil',
    type: 'error',
    actionUrl: '/dashboard'
  });
};

/**
 * Create notification when a new review is received
 */
export const notifyNewReview = async (professionalUserId: string, rating: number, reviewerName: string) => {
  const stars = '⭐'.repeat(rating);
  return await createNotification({
    userId: professionalUserId,
    title: '⭐ Nueva reseña recibida',
    message: `${reviewerName} te dejó una reseña de ${rating} estrellas ${stars}`,
    type: 'success',
    actionUrl: '/dashboard'
  });
};

/**
 * Create notification when a new message is received
 */
export const notifyNewMessage = async (
  recipientUserId: string, 
  senderName: string, 
  messagePreview: string,
  conversationId: string
) => {
  return await createNotification({
    userId: recipientUserId,
    title: `💬 Mensaje de ${senderName}`,
    message: messagePreview.length > 50 ? `${messagePreview.substring(0, 50)}...` : messagePreview,
    type: 'message' as any,
    actionUrl: `/user-dashboard?tab=messages&conversation_id=${conversationId}`
  });
};

/**
 * Create notification when payment is successful
 */
export const notifyPaymentSuccess = async (userId: string, amount: number) => {
  return await createNotification({
    userId,
    title: '💳 Pago procesado',
    message: `Tu pago de $${amount} ha sido procesado exitosamente`,
    type: 'success',
    actionUrl: '/dashboard'
  });
};

/**
 * Create notification when payment fails
 */
export const notifyPaymentFailed = async (userId: string, amount: number) => {
  return await createNotification({
    userId,
    title: '❌ Error en el pago',
    message: `No se pudo procesar tu pago de $${amount}. Por favor, verifica tu método de pago`,
    type: 'error',
    actionUrl: '/dashboard'
  });
};

/**
 * Create welcome notification for new users
 */
export const notifyWelcomeUser = async (userId: string, userName?: string) => {
  return await createNotification({
    userId,
    title: `¡Bienvenido${userName ? `, ${userName}` : ''}! 👋`,
    message: 'Tu cuenta ha sido creada exitosamente. Explora nuestra plataforma y encuentra los mejores profesionales',
    type: 'success'
  });
};

/**
 * Create notification for system maintenance
 */
export const notifySystemMaintenance = async (userId: string, maintenanceDate: string) => {
  return await createNotification({
    userId,
    title: '🔧 Mantenimiento programado',
    message: `Habrá mantenimiento del sistema el ${maintenanceDate}. El servicio podría verse interrumpido`,
    type: 'warning'
  });
};

/**
 * Bulk create notifications for multiple users
 */
export const createBulkNotifications = async (
  userIds: string[],
  title: string,
  message: string,
  type: 'success' | 'info' | 'warning' | 'error' = 'info',
  actionUrl?: string
) => {
  try {
    const notifications = userIds.map(userId => ({
      user_id: userId,
      title,
      message,
      type,
      action_url: actionUrl,
      read: false
    }));

    const { data, error } = await supabase
      .from('notifications')
      .insert(notifications)
      .select();

    if (error) throw error;
    
    // Send push notifications to all users
    if (data && data.length > 0) {
      await sendPushNotification(userIds, title, message, actionUrl);
    }
    
    return { data, error: null };
  } catch (error) {
    console.error('Error creating bulk notifications:', error);
    return { data: null, error };
  }
};