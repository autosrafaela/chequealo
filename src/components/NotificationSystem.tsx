import { useEffect } from 'react';
import NotificationPopup from './NotificationPopup';
import { useRealtimeNotifications } from '@/hooks/useRealtimeNotifications';

const NotificationSystem = () => {
  const {
    newNotification,
    markAsRead,
    clearNewNotification
  } = useRealtimeNotifications();

  useEffect(() => {
    // Request notification permission on first load
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    // Request permission for audio autoplay
    if ('AudioContext' in window) {
      const audioContext = new AudioContext();
      if (audioContext.state === 'suspended') {
        const resumeAudio = () => {
          audioContext.resume();
          document.removeEventListener('click', resumeAudio);
          document.removeEventListener('touchstart', resumeAudio);
        };
        document.addEventListener('click', resumeAudio);
        document.addEventListener('touchstart', resumeAudio);
      }
    }
  }, []);

  return (
    <>
      {newNotification && (
        <NotificationPopup
          notification={newNotification}
          onClose={clearNewNotification}
          onMarkAsRead={markAsRead}
        />
      )}
    </>
  );
};

export default NotificationSystem;