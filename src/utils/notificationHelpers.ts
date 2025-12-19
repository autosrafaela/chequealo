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
  type?: 'success' | 'info' | 'warning' | 'error' | 'message' | 'zone_alert' | 'booking' | 'review' | 'payment';
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
export const notifyNewContactRequest = async (
  professionalId: string, 
  clientName: string, 
  requestType: 'contact' | 'quote',
  conversationId?: string
) => {
  // Get professional's user_id
  const { data: professional } = await supabase
    .from('professionals')
    .select('user_id')
    .eq('id', professionalId)
    .single();

  if (!professional) return { data: null, error: 'Professional not found' };

  // Use /dashboard (unified professional dashboard route)
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
  // Get professional's user_id
  const { data: professional } = await supabase
    .from('professionals')
    .select('user_id')
    .eq('id', professionalId)
    .single();

  if (!professional) return { data: null, error: 'Professional not found' };

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
  // Use /dashboard for professionals, /user-dashboard for clients
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
 * Notifies users who:
 * 1. Have previously contacted the professional
 * 2. Have the professional in their favorites
 */
export const notifyZoneTodayToInterested = async (
  professionalId: string,
  professionalName: string,
  profession: string,
  neighborhoods: string[]
) => {
  try {
    // Get users who have contacted this professional
    const { data: contactRequests } = await supabase
      .from('contact_requests')
      .select('user_id')
      .eq('professional_id', professionalId)
      .neq('user_id', null);

    // Get users who have this professional in favorites
    const { data: favorites } = await supabase
      .from('favorites')
      .select('user_id')
      .eq('professional_id', professionalId);

    // Combine and deduplicate user IDs
    const contactUserIds = (contactRequests || []).map(r => r.user_id);
    const favoriteUserIds = (favorites || []).map(f => f.user_id);
    const allUserIds = [...new Set([...contactUserIds, ...favoriteUserIds])];

    if (allUserIds.length === 0) {
      console.log('No interested users to notify for zone today');
      return { data: null, notifiedCount: 0 };
    }

    const neighborhoodList = neighborhoods.slice(0, 3).join(', ');
    const hasMore = neighborhoods.length > 3 ? ` y ${neighborhoods.length - 3} más` : '';

    // Create bulk notifications
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

    // Send push notifications
    if (data && data.length > 0) {
      await sendPushNotification(
        allUserIds,
        `📍 ${professionalName.toUpperCase()} está cerca hoy`,
        `El ${profession} está trabajando en ${neighborhoodList}${hasMore}`,
        `/professional/${professionalId}`
      );
    }

    console.log(`Notified ${allUserIds.length} users about zone today activation`);
    return { data, notifiedCount: allUserIds.length };
  } catch (error) {
    console.error('Error notifying zone today interested users:', error);
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

/**
 * Notify all users when a new professional registers (until 250 professionals)
 */
export const notifyNewProfessionalToAllUsers = async (
  professionalId: string,
  professionalName: string,
  profession: string,
  excludeUserId?: string
) => {
  try {
    // Check current professional count
    const { count: professionalCount } = await supabase
      .from('professionals')
      .select('*', { count: 'exact', head: true });

    // Only notify if less than 250 professionals
    if (professionalCount && professionalCount >= 250) {
      console.log('Professional count >= 250, skipping new professional notification');
      return { data: null, notifiedCount: 0, skipped: true };
    }

    // Get all registered users (from profiles table)
    const { data: profiles } = await supabase
      .from('profiles')
      .select('user_id');

    if (!profiles || profiles.length === 0) {
      console.log('No users to notify about new professional');
      return { data: null, notifiedCount: 0 };
    }

    // Filter out the professional's own user ID
    const userIds = profiles
      .map(p => p.user_id)
      .filter(id => id !== excludeUserId);

    if (userIds.length === 0) {
      return { data: null, notifiedCount: 0 };
    }

    // Create bulk notifications with special type for new professional sound
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

    // Send push notifications
    if (data && data.length > 0) {
      await sendPushNotification(
        userIds,
        '🎉 ¡Nuevo profesional en Chequealo!',
        `${professionalName.toUpperCase()} se sumó como ${profession}`,
        `/professional/${professionalId}`
      );
    }

    console.log(`Notified ${userIds.length} users about new professional (total: ${professionalCount})`);
    return { data, notifiedCount: userIds.length, professionalCount };
  } catch (error) {
    console.error('Error notifying about new professional:', error);
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
  try {
    // Get professional's user_id
    const { data: professional } = await supabase
      .from('professionals')
      .select('user_id')
      .eq('id', professionalId)
      .single();

    if (!professional) return { data: null, error: 'Professional not found' };

    return await createNotification({
      userId: professional.user_id,
      title: '❤️ ¡Te agregaron a favoritos!',
      message: `${clientName.toUpperCase()} te guardó en sus favoritos. ¡Tu perfil está destacando!`,
      type: 'success',
      actionUrl: '/dashboard?tab=analytics'
    });
  } catch (error) {
    console.error('Error notifying added to favorites:', error);
    return { data: null, error };
  }
};

/**
 * Notify user when profile reaches 100% completion 🎯
 */
export const notifyProfileComplete = async (userId: string, userName?: string) => {
  return await createNotification({
    userId,
    title: '🎯 ¡Perfil completo al 100%!',
    message: `${userName ? `¡Felicitaciones ${userName.toUpperCase()}! ` : ''}Tu perfil está completo y optimizado para recibir más clientes.`,
    type: 'success',
    actionUrl: '/dashboard'
  });
};

/**
 * Notify user when a badge is unlocked 🏆
 */
export const notifyBadgeUnlocked = async (
  userId: string,
  badgeName: string,
  badgeDescription: string
) => {
  return await createNotification({
    userId,
    title: `🏆 ¡Badge desbloqueado: ${badgeName}!`,
    message: badgeDescription,
    type: 'success',
    actionUrl: '/dashboard?tab=badges'
  });
};
