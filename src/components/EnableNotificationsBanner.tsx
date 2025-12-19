import { useState } from 'react';
import { Bell, BellRing, X, Volume2, Vibrate, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useNotifications } from '@/contexts/NotificationContext';
import { toast } from 'sonner';

interface EnableNotificationsBannerProps {
  className?: string;
  variant?: 'full' | 'compact';
}

export const EnableNotificationsBanner = ({ 
  className = '',
  variant = 'full'
}: EnableNotificationsBannerProps) => {
  const { 
    isSubscribedToPush, 
    isPushSupported, 
    pushPermission,
    subscribeToPush,
    loading,
    isAudioInitialized,
    initializeAudio
  } = useNotifications();

  const [dismissed, setDismissed] = useState(() => {
    return localStorage.getItem('notifications_banner_dismissed') === 'true';
  });
  const [isActivating, setIsActivating] = useState(false);

  // Don't show if already subscribed, not supported, or dismissed
  if (isSubscribedToPush || !isPushSupported || dismissed) {
    return null;
  }

  // Don't show if permission was denied
  if (pushPermission === 'denied') {
    return null;
  }

  const handleActivateAll = async () => {
    setIsActivating(true);
    
    try {
      // First initialize audio if not ready
      if (!isAudioInitialized) {
        await initializeAudio();
      }

      // Then subscribe to push
      const success = await subscribeToPush();
      
      if (success) {
        toast.success('¡Notificaciones activadas!', {
          description: 'Ahora recibirás alertas de mensajes, reservas y más.'
        });
        setDismissed(true);
        localStorage.setItem('notifications_banner_dismissed', 'true');
      }
    } catch (error) {
      console.error('[EnableNotificationsBanner] Error activating notifications:', error);
      toast.error('Error al activar notificaciones');
    } finally {
      setIsActivating(false);
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem('notifications_banner_dismissed', 'true');
    toast.info('Puedes activar notificaciones desde Configuración cuando quieras');
  };

  if (variant === 'compact') {
    return (
      <div className={`flex items-center gap-2 p-2 bg-primary/10 rounded-lg ${className}`}>
        <BellRing className="h-4 w-4 text-primary animate-pulse" />
        <span className="text-sm text-foreground/80 flex-1">
          Activa notificaciones
        </span>
        <Button 
          size="sm" 
          variant="default"
          onClick={handleActivateAll}
          disabled={loading || isActivating}
          className="h-7 text-xs"
        >
          {isActivating ? 'Activando...' : 'Activar'}
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={handleDismiss}
          className="h-7 w-7 p-0"
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
    );
  }

  return (
    <Card className={`relative overflow-hidden border-primary/30 bg-gradient-to-r from-primary/5 to-primary/10 ${className}`}>
      {/* Decorative background */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      
      <div className="relative p-4 sm:p-6">
        <button 
          onClick={handleDismiss}
          className="absolute top-2 right-2 p-1 rounded-full hover:bg-foreground/10 transition-colors"
          aria-label="Cerrar"
        >
          <X className="h-4 w-4 text-muted-foreground" />
        </button>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          {/* Icon */}
          <div className="flex-shrink-0">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-primary/20 flex items-center justify-center">
              <BellRing className="h-6 w-6 sm:h-7 sm:w-7 text-primary animate-pulse" />
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-foreground mb-1">
              ¡No te pierdas nada!
            </h3>
            <p className="text-sm text-muted-foreground mb-3">
              Activa las notificaciones para recibir alertas de mensajes, reservas, reseñas y más.
            </p>

            {/* Features */}
            <div className="flex flex-wrap gap-3 mb-4">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Bell className="h-3.5 w-3.5 text-primary" />
                <span>Push</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Volume2 className="h-3.5 w-3.5 text-primary" />
                <span>Sonidos</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Vibrate className="h-3.5 w-3.5 text-primary" />
                <span>Vibración</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Smartphone className="h-3.5 w-3.5 text-primary" />
                <span>Tiempo real</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-2">
              <Button 
                onClick={handleActivateAll}
                disabled={loading || isActivating}
                className="gap-2"
              >
                <BellRing className="h-4 w-4" />
                {isActivating ? 'Activando...' : 'Activar notificaciones'}
              </Button>
              <Button 
                variant="ghost" 
                onClick={handleDismiss}
                className="text-muted-foreground"
              >
                Ahora no
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default EnableNotificationsBanner;
