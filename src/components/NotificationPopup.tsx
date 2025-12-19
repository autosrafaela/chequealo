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
  CreditCard,
  MapPin,
  Calendar,
  Zap,
  Heart,
  Trophy,
  Award
} from 'lucide-react';
import { 
  playNotificationWithVibration, 
  NotificationSoundType, 
  VibrationPattern 
} from '@/utils/notificationSound';

interface NotificationData {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error' | 'message' | 'booking' | 'review' | 'zone_alert' | 'payment';
  action_url?: string;
  created_at: string;
}

interface NotificationPopupProps {
  notification: NotificationData;
  onClose: () => void;
  onMarkAsRead: (id: string) => void;
}

// Map notification types to sounds and vibrations
const getNotificationConfig = (notification: NotificationData): { 
  sound: NotificationSoundType; 
  vibration: VibrationPattern;
} => {
  const title = notification.title.toLowerCase();
  
  // Check for express/urgent keywords first - PRIORITY
  if (title.includes('express') || title.includes('urgencia') || title.includes('urgente') || title.includes('🚀')) {
    console.log('[NotificationPopup] Playing EXPRESS sound');
    return { sound: 'express', vibration: 'urgent' };
  }

  // Check for new professional celebration
  if (title.includes('nuevo profesional') || title.includes('🎉')) {
    console.log('[NotificationPopup] Playing NEW PROFESSIONAL fanfare');
    return { sound: 'new_professional', vibration: 'success' };
  }

  // Check for favorites ❤️
  if (title.includes('favoritos') || title.includes('❤️')) {
    console.log('[NotificationPopup] Playing FAVORITE sound');
    return { sound: 'favorite', vibration: 'success' };
  }

  // Check for achievements/profile complete 🎯
  if (title.includes('perfil completo') || title.includes('🎯') || title.includes('logro')) {
    console.log('[NotificationPopup] Playing ACHIEVEMENT sound');
    return { sound: 'achievement', vibration: 'success' };
  }

  // Check for badges 🏆
  if (title.includes('badge') || title.includes('🏆') || title.includes('desbloqueado')) {
    console.log('[NotificationPopup] Playing BADGE UNLOCKED sound');
    return { sound: 'badge_unlocked', vibration: 'success' };
  }

  switch (notification.type) {
    case 'message':
      console.log('[NotificationPopup] Playing MESSAGE sound');
      return { sound: 'message', vibration: 'short' };
    case 'booking':
      if (title.includes('confirmad')) {
        console.log('[NotificationPopup] Playing BOOKING CONFIRMED sound');
        return { sound: 'booking_confirmed', vibration: 'success' };
      }
      if (title.includes('recordatorio')) {
        console.log('[NotificationPopup] Playing BOOKING REMINDER sound');
        return { sound: 'booking_reminder', vibration: 'medium' };
      }
      return { sound: 'booking_confirmed', vibration: 'medium' };
    case 'review':
      console.log('[NotificationPopup] Playing NEW REVIEW fanfare');
      return { sound: 'new_review', vibration: 'success' };
    case 'zone_alert':
      console.log('[NotificationPopup] Playing ZONE ALERT sound');
      return { sound: 'zone_alert', vibration: 'medium' };
    case 'payment':
      console.log('[NotificationPopup] Playing PAYMENT sound');
      return { sound: 'payment', vibration: 'success' };
    case 'warning':
      console.log('[NotificationPopup] Playing WARNING/EXPRESS sound');
      return { sound: 'express', vibration: 'urgent' };
    case 'error':
      console.log('[NotificationPopup] Playing URGENT sound');
      return { sound: 'urgent', vibration: 'long' };
    case 'success':
      console.log('[NotificationPopup] Playing CONTACT/SUCCESS sound');
      return { sound: 'contact', vibration: 'success' };
    default:
      console.log('[NotificationPopup] Playing DEFAULT sound');
      return { sound: 'default', vibration: 'short' };
  }
};

const NotificationPopup = ({ notification, onClose, onMarkAsRead }: NotificationPopupProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    console.log('[NotificationPopup] Received notification:', notification);
    
    // Get sound and vibration config
    const config = getNotificationConfig(notification);
    
    // Play notification sound with vibration using the advanced system
    console.log('[NotificationPopup] Playing sound:', config.sound, 'with vibration:', config.vibration);
    playNotificationWithVibration(config.sound, config.vibration);
    
    // Animate in
    setIsVisible(true);
    
    // Auto-close after 6 seconds
    const timer = setTimeout(() => {
      handleClose();
    }, 6000);

    return () => clearTimeout(timer);
  }, []);

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
      console.log('[NotificationPopup] Navigating to:', notification.action_url);
      // Navigate in same window instead of opening new tab
      window.location.href = notification.action_url;
    }
    handleMarkAsRead();
  };

  const getIcon = () => {
    const title = notification.title.toLowerCase();
    
    // Check for specific keywords first
    if (title.includes('express') || title.includes('🚀')) {
      return <Zap className="h-5 w-5 text-amber-500" />;
    }
    if (title.includes('zona') || title.includes('📍')) {
      return <MapPin className="h-5 w-5 text-primary" />;
    }
    if (title.includes('favoritos') || title.includes('❤️')) {
      return <Heart className="h-5 w-5 text-red-500" />;
    }
    if (title.includes('badge') || title.includes('🏆') || title.includes('desbloqueado')) {
      return <Award className="h-5 w-5 text-purple-500" />;
    }
    if (title.includes('perfil completo') || title.includes('🎯')) {
      return <Trophy className="h-5 w-5 text-amber-500" />;
    }
    
    switch (notification.type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'error':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'message':
        return <MessageSquare className="h-5 w-5 text-blue-500" />;
      case 'booking':
        return <Calendar className="h-5 w-5 text-purple-500" />;
      case 'review':
        return <Star className="h-5 w-5 text-yellow-500" />;
      case 'zone_alert':
        return <MapPin className="h-5 w-5 text-primary" />;
      case 'payment':
        return <CreditCard className="h-5 w-5 text-green-500" />;
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getBadgeColor = () => {
    const title = notification.title.toLowerCase();
    
    // Special badges for express/urgent
    if (title.includes('express') || title.includes('🚀')) {
      return 'bg-gradient-to-r from-amber-500 to-orange-500 text-white';
    }
    // Favorites badge
    if (title.includes('favoritos') || title.includes('❤️')) {
      return 'bg-gradient-to-r from-red-400 to-pink-500 text-white';
    }
    // Badge unlocked
    if (title.includes('badge') || title.includes('🏆')) {
      return 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white';
    }
    // Achievement/profile complete
    if (title.includes('perfil completo') || title.includes('🎯')) {
      return 'bg-gradient-to-r from-amber-400 to-yellow-500 text-white';
    }
    
    switch (notification.type) {
      case 'success':
        return 'bg-green-500 text-white';
      case 'warning':
        return 'bg-yellow-500 text-white';
      case 'error':
        return 'bg-red-500 text-white';
      case 'message':
        return 'bg-blue-500 text-white';
      case 'booking':
        return 'bg-purple-500 text-white';
      case 'review':
        return 'bg-yellow-400 text-black';
      case 'zone_alert':
        return 'bg-primary text-primary-foreground';
      case 'payment':
        return 'bg-green-600 text-white';
      default:
        return 'bg-blue-500 text-white';
    }
  };

  const getTypeLabel = () => {
    const title = notification.title.toLowerCase();
    
    if (title.includes('express') || title.includes('🚀')) {
      return 'EXPRESS';
    }
    if (title.includes('favoritos') || title.includes('❤️')) {
      return 'FAVORITO';
    }
    if (title.includes('badge') || title.includes('🏆')) {
      return 'BADGE';
    }
    if (title.includes('perfil completo') || title.includes('🎯')) {
      return 'LOGRO';
    }
    
    switch (notification.type) {
      case 'message':
        return 'MENSAJE';
      case 'booking':
        return 'CITA';
      case 'review':
        return 'RESEÑA';
      case 'zone_alert':
        return 'ZONA';
      case 'payment':
        return 'PAGO';
      default:
        return notification.type.toUpperCase();
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
                {getTypeLabel()}
              </Badge>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="h-6 w-6 p-0 hover:bg-muted"
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