import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Bell, 
  CheckCircle, 
  AlertTriangle, 
  Info, 
  X, 
  Star,
  MessageSquare,
  User,
  CreditCard
} from 'lucide-react';
import { toast } from 'sonner';

interface NotificationData {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
  action_url?: string;
  created_at: string;
}

interface NotificationPopupProps {
  notification: NotificationData;
  onClose: () => void;
  onMarkAsRead: (id: string) => void;
}

const NotificationPopup = ({ notification, onClose, onMarkAsRead }: NotificationPopupProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Play notification sound
    playNotificationSound(notification.type);
    
    // Animate in
    setIsVisible(true);
    
    // Auto-close after 6 seconds
    const timer = setTimeout(() => {
      handleClose();
    }, 6000);

    return () => clearTimeout(timer);
  }, []);

  const playNotificationSound = (type: string) => {
    try {
      const audio = new Audio();
      
      // Different sounds for different notification types
      switch (type) {
        case 'success':
          // Success sound frequency
          playTone(800, 200, 0.3);
          setTimeout(() => playTone(1000, 200, 0.3), 100);
          break;
        case 'info':
          // Info sound
          playTone(600, 300, 0.2);
          break;
        case 'warning':
          // Warning sound
          playTone(400, 400, 0.3);
          setTimeout(() => playTone(450, 200, 0.3), 200);
          break;
        case 'error':
          // Error sound
          playTone(300, 500, 0.4);
          break;
        default:
          playTone(600, 300, 0.2);
      }
    } catch (error) {
      console.log('Could not play notification sound:', error);
    }
  };

  const playTone = (frequency: number, duration: number, volume: number) => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = frequency;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration / 1000);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + duration / 1000);
    } catch (error) {
      console.log('Web Audio API not supported');
    }
  };

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const handleMarkAsRead = () => {
    onMarkAsRead(notification.id);
    handleClose();
  };

  const handleActionClick = () => {
    if (notification.action_url) {
      window.open(notification.action_url, '_blank');
    }
    handleMarkAsRead();
  };

  const getIcon = () => {
    switch (notification.type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'error':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getBadgeColor = () => {
    switch (notification.type) {
      case 'success':
        return 'bg-green-500 text-white';
      case 'warning':
        return 'bg-yellow-500 text-white';
      case 'error':
        return 'bg-red-500 text-white';
      default:
        return 'bg-blue-500 text-white';
    }
  };

  return (
    <div 
      className={`fixed top-20 right-4 z-50 transform transition-all duration-300 ${
        isVisible ? 'translate-x-0 opacity-100 scale-100' : 'translate-x-full opacity-0 scale-95'
      }`}
    >
      <Card className="w-80 shadow-2xl border-l-4 border-l-primary animate-pulse">
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              {getIcon()}
              <Badge className={getBadgeColor()}>
                {notification.type.toUpperCase()}
              </Badge>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="h-6 w-6 p-0 hover:bg-gray-100"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-semibold text-foreground text-sm">
              {notification.title}
            </h4>
            <p className="text-sm text-muted-foreground">
              {notification.message}
            </p>
            
            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-muted-foreground">
                {new Date(notification.created_at).toLocaleTimeString()}
              </span>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleMarkAsRead}
                  className="text-xs"
                >
                  Marcar como leída
                </Button>
                {notification.action_url && (
                  <Button
                    variant="default"
                    size="sm"
                    onClick={handleActionClick}
                    className="text-xs"
                  >
                    Ver detalles
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationPopup;