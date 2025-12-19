import { useNotifications } from '@/contexts/NotificationContext';
import NotificationPopup from './NotificationPopup';

/**
 * Wrapper component that displays the notification popup when a new notification arrives.
 * Uses the unified notification context.
 */
const NotificationPopupWrapper = () => {
  const { newNotification, clearNewNotification, markAsRead } = useNotifications();

  if (!newNotification) return null;

  return (
    <NotificationPopup
      notification={newNotification}
      onClose={clearNewNotification}
      onMarkAsRead={markAsRead}
    />
  );
};

export default NotificationPopupWrapper;
