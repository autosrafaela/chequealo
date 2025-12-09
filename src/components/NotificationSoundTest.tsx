import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Volume2, Zap, MessageCircle, Bell, Calendar, MapPin, Star, CreditCard, Vibrate } from 'lucide-react';
import { 
  playNotificationSound, 
  initializeAudioContext, 
  triggerVibration,
  NotificationSoundType 
} from '@/utils/notificationSound';

interface SoundButton {
  type: NotificationSoundType;
  label: string;
  icon: React.ReactNode;
  variant?: 'default' | 'outline' | 'secondary';
  className?: string;
}

const soundButtons: SoundButton[] = [
  { 
    type: 'express', 
    label: 'Express (Urgente)', 
    icon: <Zap className="h-4 w-4 mr-2" />,
    className: 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white'
  },
  { type: 'contact', label: 'Contacto (Chime)', icon: <Bell className="h-4 w-4 mr-2" />, variant: 'outline' },
  { type: 'message', label: 'Mensaje (Ping)', icon: <MessageCircle className="h-4 w-4 mr-2" />, variant: 'outline' },
  { type: 'zone_alert', label: 'Zona Today', icon: <MapPin className="h-4 w-4 mr-2" />, variant: 'outline' },
  { type: 'booking_confirmed', label: 'Reserva Confirmada', icon: <Calendar className="h-4 w-4 mr-2" />, variant: 'outline' },
  { type: 'booking_reminder', label: 'Recordatorio', icon: <Calendar className="h-4 w-4 mr-2" />, variant: 'outline' },
  { type: 'new_review', label: 'Nueva Reseña', icon: <Star className="h-4 w-4 mr-2" />, variant: 'outline' },
  { type: 'payment', label: 'Pago (Cha-ching)', icon: <CreditCard className="h-4 w-4 mr-2" />, variant: 'outline' },
  { type: 'urgent', label: 'Urgente (Pulsos)', icon: <Zap className="h-4 w-4 mr-2" />, variant: 'secondary' },
  { type: 'default', label: 'Default', icon: <Volume2 className="h-4 w-4 mr-2" />, variant: 'secondary' },
];

export const NotificationSoundTest = () => {
  const handlePlay = (type: NotificationSoundType) => {
    initializeAudioContext();
    playNotificationSound(type);
  };

  const handleVibrate = (pattern: 'short' | 'medium' | 'long' | 'urgent' | 'success') => {
    triggerVibration(pattern);
  };

  return (
    <Card className="max-w-md mx-auto mt-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Volume2 className="h-5 w-5" />
          Prueba de Sonidos de Notificación
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {soundButtons.map((btn) => (
          <Button 
            key={btn.type}
            onClick={() => handlePlay(btn.type)} 
            variant={btn.variant || 'default'}
            className={`w-full ${btn.className || ''}`}
          >
            {btn.icon}
            {btn.label}
          </Button>
        ))}
        
        <div className="pt-4 border-t">
          <p className="text-sm text-muted-foreground mb-3 flex items-center gap-2">
            <Vibrate className="h-4 w-4" />
            Patrones de Vibración
          </p>
          <div className="grid grid-cols-3 gap-2">
            <Button variant="outline" size="sm" onClick={() => handleVibrate('short')}>
              Corta
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleVibrate('medium')}>
              Media
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleVibrate('long')}>
              Larga
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleVibrate('urgent')}>
              Urgente
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleVibrate('success')}>
              Éxito
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default NotificationSoundTest;
