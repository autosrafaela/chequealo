import { supabase } from '@/integrations/supabase/client';

/**
 * Send push notification to users via Edge Function
 * This function NO LONGER depends on user session - it uses the Edge Function's service role
 */
export const sendPushNotification = async (
  userIds: string[],
  title: string,
  message: string,
  actionUrl?: string
) => {
  if (!userIds || userIds.length === 0) {
    console.log('[notificationHelpers] No userIds provided, skipping push notification');
    return;
  }

  console.log('[notificationHelpers] Sending push notification:', {
    userIdsCount: userIds.length,
    title: title.substring(0, 50),
    actionUrl
  });

  try {
    const { data, error } = await supabase.functions.invoke('send-push-notification', {
      body: {
        userIds,
        title,
        body: message,
        url: actionUrl,
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        tag: `notification-${Date.now()}`,
        requireInteraction: title.toLowerCase().includes('urgente') || title.toLowerCase().includes('express')
      }
    });

    if (error) {
      console.error('[notificationHelpers] Push notification error:', error);
    } else {
      console.log('[notificationHelpers] Push notification sent successfully:', data);
    }
    
    return { data, error };
  } catch (error) {
    console.error('[notificationHelpers] Error sending push notification:', error);
    return { data: null, error };
  }
};

export interface CreateNotificationProps {
  userId: string;
  title: string;
  message: string;
  type?: 'success' | 'info' | 'warning' | 'error' | 'message' | 'zone_alert' | 'booking' | 'review' | 'payment';
  actionUrl?: string;
}

/**
 * Create a new notification for a user and send push notification
 */
export const createNotification = async ({
  userId,
  title,
  message,
  type = 'info',
  actionUrl
}: CreateNotificationProps) => {
  if (!userId) {
    console.error('[notificationHelpers] createNotification called without userId');
    return { data: null, error: 'userId is required' };
  }

  console.log('[notificationHelpers] Creating notification:', { userId, title, type });

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

    if (error) {
      console.error('[notificationHelpers] Error inserting notification:', error);
      throw error;
    }
    
    console.log('[notificationHelpers] Notification created in DB:', data.id);
    
    // Send push notification - this runs independently of DB insert success
    // Don't await to avoid blocking, but log the result
    sendPushNotification([userId], title, message, actionUrl)
      .then(result => {
        if (result?.error) {
          console.warn('[notificationHelpers] Push notification failed but DB notification was created');
        }
      })
      .catch(err => {
        console.warn('[notificationHelpers] Push notification error (non-blocking):', err);
      });
    
    return { data, error: null };
  } catch (error) {
    console.error('[notificationHelpers] Error creating notification:', error);
    return { data: null, error };
  }
};

/**
 * Create notification when a new contact request is received
 */
export const notifyNewContactRequest = async (
  professionalId: string, 
  clientName: string, 
  requestType: 'contact' | 'quote',
  conversationId?: string
) => {
  console.log('[notificationHelpers] notifyNewContactRequest:', { professionalId, clientName, requestType });
  
  // Get professional's user_id
  const { data: professional } = await supabase
    .from('professionals')
    .select('user_id')
    .eq('id', professionalId)
    .single();

  if (!professional) {
    console.error('[notificationHelpers] Professional not found:', professionalId);
    return { data: null, error: 'Professional not found' };
  }

  const actionUrl = conversationId
    ? `/dashboard?tab=messages&conversation=${conversationId}`
    : '/dashboard?tab=requests';

  return await createNotification({
    userId: professional.user_id,
    title: requestType === 'contact' ? '🔔 Nueva solicitud de contacto' : '📋 Nueva solicitud de presupuesto',
    message: `${clientName.toUpperCase()} te ha enviado una ${requestType === 'contact' ? 'solicitud de contacto' : 'solicitud de presupuesto'}. Haz clic para responder en el chat.`,
    type: 'info',
    actionUrl
  });
};

/**
 * Create PRIORITY notification when an Express request is received
 */
export const notifyExpressRequest = async (
  professionalId: string, 
  clientName: string,
  serviceType: string,
  conversationId: string
) => {
  console.log('[notificationHelpers] notifyExpressRequest:', { professionalId, clientName, serviceType });
  
  const { data: professional } = await supabase
    .from('professionals')
    .select('user_id')
    .eq('id', professionalId)
    .single();

  if (!professional) {
    console.error('[notificationHelpers] Professional not found:', professionalId);
    return { data: null, error: 'Professional not found' };
  }

  const actionUrl = `/dashboard?tab=messages&conversation=${conversationId}`;

  return await createNotification({
    userId: professional.user_id,
    title: '🚀 ¡SOLICITUD EXPRESS!',
    message: `${clientName.toUpperCase()} necesita "${serviceType}" con URGENCIA. Responde rápido para ganar este cliente.`,
    type: 'warning',
    actionUrl
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
    message: `${reviewerName.toUpperCase()} te dejó una reseña de ${rating} estrellas ${stars}`,
    type: 'review',
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
  conversationId: string,
  isRecipientProfessional: boolean = false
) => {
  console.log('[notificationHelpers] notifyNewMessage:', { recipientUserId, senderName, isRecipientProfessional });
  
  const dashboardUrl = isRecipientProfessional ? '/dashboard' : '/user-dashboard';
  const actionUrl = `${dashboardUrl}?tab=messages&conversation=${conversationId}`;
  
  return await createNotification({
    userId: recipientUserId,
    title: `💬 Mensaje de ${senderName.toUpperCase()}`,
    message: messagePreview.length > 50 ? `${messagePreview.substring(0, 50)}...` : messagePreview,
    type: 'message',
    actionUrl
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
    type: 'payment',
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
 * Create notification when booking is confirmed
 */
export const notifyBookingConfirmed = async (userId: string, professionalName: string, date: string) => {
  return await createNotification({
    userId,
    title: '📅 Reserva confirmada',
    message: `Tu cita con ${professionalName.toUpperCase()} para el ${date} ha sido confirmada`,
    type: 'booking',
    actionUrl: '/user-dashboard?tab=bookings'
  });
};

/**
 * Create notification for booking reminder
 */
export const notifyBookingReminder = async (userId: string, professionalName: string, timeUntil: string) => {
  return await createNotification({
    userId,
    title: '⏰ Recordatorio de cita',
    message: `Tu cita con ${professionalName.toUpperCase()} es en ${timeUntil}`,
    type: 'booking',
    actionUrl: '/user-dashboard?tab=bookings'
  });
};

/**
 * Create welcome notification for new users
 */
export const notifyWelcomeUser = async (userId: string, userName?: string) => {
  return await createNotification({
    userId,
    title: `¡Bienvenido${userName ? `, ${userName.toUpperCase()}` : ''}! 👋`,
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
 * Notify users when a professional activates "En tu zona hoy"
 */
export const notifyZoneTodayToInterested = async (
  professionalId: string,
  professionalName: string,
  profession: string,
  neighborhoods: string[]
) => {
  console.log('[notificationHelpers] notifyZoneTodayToInterested:', { professionalId, professionalName });
  
  try {
    const { data: contactRequests } = await supabase
      .from('contact_requests')
      .select('user_id')
      .eq('professional_id', professionalId)
      .neq('user_id', null);

    const { data: favorites } = await supabase
      .from('favorites')
      .select('user_id')
      .eq('professional_id', professionalId);

    const contactUserIds = (contactRequests || []).map(r => r.user_id);
    const favoriteUserIds = (favorites || []).map(f => f.user_id);
    const allUserIds = [...new Set([...contactUserIds, ...favoriteUserIds])];

    if (allUserIds.length === 0) {
      console.log('[notificationHelpers] No interested users to notify for zone today');
      return { data: null, notifiedCount: 0 };
    }

    const neighborhoodList = neighborhoods.slice(0, 3).join(', ');
    const hasMore = neighborhoods.length > 3 ? ` y ${neighborhoods.length - 3} más` : '';

    const notifications = allUserIds.map(userId => ({
      user_id: userId,
      title: `📍 ${professionalName.toUpperCase()} está cerca hoy`,
      message: `El ${profession} que contactaste está trabajando en ${neighborhoodList}${hasMore}. ¡Aprovecha para agendar!`,
      type: 'zone_alert',
      action_url: `/professional/${professionalId}`,
      read: false
    }));

    const { data, error } = await supabase
      .from('notifications')
      .insert(notifications)
      .select();

    if (error) throw error;

    // Send push notifications to all users
    if (data && data.length > 0) {
      sendPushNotification(
        allUserIds,
        `📍 ${professionalName.toUpperCase()} está cerca hoy`,
        `El ${profession} está trabajando en ${neighborhoodList}${hasMore}`,
        `/professional/${professionalId}`
      ).catch(err => console.warn('[notificationHelpers] Zone today push error:', err));
    }

    console.log(`[notificationHelpers] Notified ${allUserIds.length} users about zone today activation`);
    return { data, notifiedCount: allUserIds.length };
  } catch (error) {
    console.error('[notificationHelpers] Error notifying zone today interested users:', error);
    return { data: null, error, notifiedCount: 0 };
  }
};

/**
 * Bulk create notifications for multiple users
 */
export const createBulkNotifications = async (
  userIds: string[],
  title: string,
  message: string,
  type: 'success' | 'info' | 'warning' | 'error' | 'zone_alert' = 'info',
  actionUrl?: string
) => {
  console.log('[notificationHelpers] createBulkNotifications:', { userIdsCount: userIds.length, title });
  
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
      sendPushNotification(userIds, title, message, actionUrl)
        .catch(err => console.warn('[notificationHelpers] Bulk push error:', err));
    }
    
    return { data, error: null };
  } catch (error) {
    console.error('[notificationHelpers] Error creating bulk notifications:', error);
    return { data: null, error };
  }
};

/**
 * Notify all users when a new professional registers (until 250 professionals)
 */
export const notifyNewProfessionalToAllUsers = async (
  professionalId: string,
  professionalName: string,
  profession: string,
  excludeUserId?: string
) => {
  console.log('[notificationHelpers] notifyNewProfessionalToAllUsers:', { professionalId, professionalName });
  
  try {
    const { count: professionalCount } = await supabase
      .from('professionals')
      .select('*', { count: 'exact', head: true });

    if (professionalCount && professionalCount >= 250) {
      console.log('[notificationHelpers] Professional count >= 250, skipping notification');
      return { data: null, notifiedCount: 0, skipped: true };
    }

    const { data: profiles } = await supabase
      .from('profiles')
      .select('user_id');

    if (!profiles || profiles.length === 0) {
      console.log('[notificationHelpers] No users to notify about new professional');
      return { data: null, notifiedCount: 0 };
    }

    const userIds = profiles
      .map(p => p.user_id)
      .filter(id => id !== excludeUserId);

    if (userIds.length === 0) {
      return { data: null, notifiedCount: 0 };
    }

    const notifications = userIds.map(userId => ({
      user_id: userId,
      title: '🎉 ¡Nuevo profesional en Chequealo!',
      message: `${professionalName.toUpperCase()} se sumó como ${profession}. ¡Ya somos ${professionalCount} profesionales verificados!`,
      type: 'success',
      action_url: `/professional/${professionalId}`,
      read: false
    }));

    const { data, error } = await supabase
      .from('notifications')
      .insert(notifications)
      .select();

    if (error) throw error;

    if (data && data.length > 0) {
      sendPushNotification(
        userIds,
        '🎉 ¡Nuevo profesional en Chequealo!',
        `${professionalName.toUpperCase()} se sumó como ${profession}`,
        `/professional/${professionalId}`
      ).catch(err => console.warn('[notificationHelpers] New professional push error:', err));
    }

    console.log(`[notificationHelpers] Notified ${userIds.length} users about new professional`);
    return { data, notifiedCount: userIds.length, professionalCount };
  } catch (error) {
    console.error('[notificationHelpers] Error notifying about new professional:', error);
    return { data: null, error, notifiedCount: 0 };
  }
};

/**
 * Notify professional when someone adds them to favorites ❤️
 */
export const notifyAddedToFavorites = async (
  professionalId: string,
  clientName: string
) => {
  console.log('[notificationHelpers] notifyAddedToFavorites:', { professionalId, clientName });
  
  try {
    const { data: professional } = await supabase
      .from('professionals')
      .select('user_id')
      .eq('id', professionalId)
      .single();

    if (!professional) {
      console.error('[notificationHelpers] Professional not found:', professionalId);
      return { data: null, error: 'Professional not found' };
    }

    return await createNotification({
      userId: professional.user_id,
      title: '❤️ ¡Te agregaron a favoritos!',
      message: `${clientName.toUpperCase()} te guardó en sus favoritos. ¡Tu perfil está destacando!`,
      type: 'success',
      actionUrl: '/dashboard?tab=analytics'
    });
  } catch (error) {
    console.error('[notificationHelpers] Error in notifyAddedToFavorites:', error);
    return { data: null, error };
  }
};

/**
 * Notify user when their profile is 100% complete
 */
export const notifyProfileComplete = async (professionalUserId: string) => {
  return await createNotification({
    userId: professionalUserId,
    title: '🎯 ¡Perfil completo al 100%!',
    message: 'Tu perfil está completamente configurado. ¡Ahora tienes más visibilidad!',
    type: 'success',
    actionUrl: '/dashboard?tab=profile'
  });
};

/**
 * Notify user when they unlock a badge
 */
export const notifyBadgeUnlocked = async (userId: string, badgeName: string, badgePoints: number) => {
  return await createNotification({
    userId,
    title: '🏆 ¡Nueva insignia desbloqueada!',
    message: `Has ganado la insignia "${badgeName}" y ${badgePoints} puntos. ¡Sigue así!`,
    type: 'success',
    actionUrl: '/dashboard?tab=profile'
  });
};

/**
 * Test push notification - for debugging
 */
export const sendTestPushNotification = async (userId: string) => {
  console.log('[notificationHelpers] Sending test push notification to:', userId);
  
  return await sendPushNotification(
    [userId],
    '🧪 Test de notificación push',
    'Si ves esto, las notificaciones push funcionan correctamente!',
    '/dashboard'
  );
};
