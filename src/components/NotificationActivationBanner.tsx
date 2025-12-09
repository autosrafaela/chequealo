import { useState, useEffect } from 'react';
import { Bell, Volume2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePushNotifications } from '@/hooks/usePushNotifications';

const COOLDOWN_KEY = 'notification-banner-dismissed';
const COOLDOWN_DAYS = 7;

export const NotificationActivationBanner = () => {
  const { isSupported, isSubscribed, permission, loading, subscribe } = usePushNotifications();
  const [isDismissed, setIsDismissed] = useState(true);
  const [isActivating, setIsActivating] = useState(false);

  useEffect(() => {
    // Check if banner should be shown
    const dismissedAt = localStorage.getItem(COOLDOWN_KEY);
    if (dismissedAt) {
      const dismissedDate = new Date(parseInt(dismissedAt));
      const now = new Date();
      const daysSinceDismissed = (now.getTime() - dismissedDate.getTime()) / (1000 * 60 * 60 * 24);
      
      if (daysSinceDismissed < COOLDOWN_DAYS) {
        setIsDismissed(true);
        return;
      }
    }
    setIsDismissed(false);
  }, []);

  // Don't show if:
  // - Not supported
  // - Already subscribed
  // - Permission already denied or granted
  // - Dismissed within cooldown period
  // - Still loading
  if (!isSupported || isSubscribed || permission !== 'default' || isDismissed || loading) {
    return null;
  }

  const handleActivate = async () => {
    setIsActivating(true);
    try {
      await subscribe();
    } finally {
      setIsActivating(false);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem(COOLDOWN_KEY, Date.now().toString());
    setIsDismissed(true);
  };

  return (
    <div className="bg-card border-b border-border shadow-sm animate-in slide-in-from-top-2 duration-300">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          {/* Left side: Icons and text */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="flex items-center gap-1 flex-shrink-0">
              <Bell className="h-5 w-5 text-primary" />
              <Volume2 className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="min-w-0">
              <p className="font-medium text-sm text-foreground truncate">
                Activá las notificaciones
              </p>
              <p className="text-xs text-muted-foreground hidden sm:block">
                Recibí alertas sonoras cuando haya nuevas solicitudes, mensajes y más
              </p>
            </div>
          </div>

          {/* Right side: Button and close */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button
              size="sm"
              onClick={handleActivate}
              disabled={isActivating}
              className="text-xs px-4"
            >
              {isActivating ? 'Activando...' : 'Activar'}
            </Button>
            <button
              onClick={handleDismiss}
              className="p-1 hover:bg-muted rounded-full transition-colors"
              aria-label="Cerrar"
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationActivationBanner;
