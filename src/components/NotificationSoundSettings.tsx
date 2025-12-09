import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { 
  Volume2, 
  VolumeX, 
  Vibrate, 
  Bell, 
  MessageCircle, 
  MapPin, 
  Calendar, 
  Star, 
  CreditCard,
  Zap,
  Play,
  Users
} from 'lucide-react';
import { 
  playNotificationSound, 
  triggerVibration, 
  NotificationSoundType, 
  VibrationPattern 
} from '@/utils/notificationSound';
import { toast } from 'sonner';

interface SoundSetting {
  id: NotificationSoundType;
  label: string;
  description: string;
  icon: React.ReactNode;
  vibration: VibrationPattern;
}

const soundSettings: SoundSetting[] = [
  {
    id: 'message',
    label: 'Mensajes',
    description: 'Nuevos mensajes de chat',
    icon: <MessageCircle className="h-4 w-4" />,
    vibration: 'short'
  },
  {
    id: 'contact',
    label: 'Contactos',
    description: 'Solicitudes de contacto',
    icon: <Bell className="h-4 w-4" />,
    vibration: 'medium'
  },
  {
    id: 'express',
    label: 'Express/Urgente ⚡',
    description: 'Solicitudes express con vibración urgente',
    icon: <Zap className="h-4 w-4 text-amber-500" />,
    vibration: 'urgent'
  },
  {
    id: 'zone_alert',
    label: 'Zona Today',
    description: 'Profesionales cerca de ti',
    icon: <MapPin className="h-4 w-4 text-primary" />,
    vibration: 'medium'
  },
  {
    id: 'booking_confirmed',
    label: 'Reservas',
    description: 'Confirmación de citas',
    icon: <Calendar className="h-4 w-4" />,
    vibration: 'success'
  },
  {
    id: 'new_review',
    label: 'Reseñas',
    description: 'Nuevas reseñas recibidas',
    icon: <Star className="h-4 w-4 text-yellow-500" />,
    vibration: 'success'
  },
  {
    id: 'payment',
    label: 'Pagos',
    description: 'Pagos procesados',
    icon: <CreditCard className="h-4 w-4 text-green-500" />,
    vibration: 'success'
  },
  {
    id: 'new_professional',
    label: 'Nuevo Profesional 🎉',
    description: 'Cuando se suma un nuevo profesional',
    icon: <Users className="h-4 w-4 text-primary" />,
    vibration: 'success'
  }
];

export const NotificationSoundSettings = () => {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);
  const [disabledSounds, setDisabledSounds] = useState<string[]>([]);

  useEffect(() => {
    // Load preferences from localStorage
    const storedSoundEnabled = localStorage.getItem('notification_sound_enabled');
    const storedVibrationEnabled = localStorage.getItem('notification_vibration_enabled');
    const storedDisabledSounds = localStorage.getItem('notification_disabled_sounds');

    if (storedSoundEnabled !== null) {
      setSoundEnabled(storedSoundEnabled === 'true');
    }
    if (storedVibrationEnabled !== null) {
      setVibrationEnabled(storedVibrationEnabled === 'true');
    }
    if (storedDisabledSounds) {
      try {
        setDisabledSounds(JSON.parse(storedDisabledSounds));
      } catch {
        setDisabledSounds([]);
      }
    }
  }, []);

  const handleSoundEnabledChange = (enabled: boolean) => {
    setSoundEnabled(enabled);
    localStorage.setItem('notification_sound_enabled', String(enabled));
    toast.success(enabled ? 'Sonidos activados' : 'Sonidos desactivados');
  };

  const handleVibrationEnabledChange = (enabled: boolean) => {
    setVibrationEnabled(enabled);
    localStorage.setItem('notification_vibration_enabled', String(enabled));
    if (enabled) {
      triggerVibration('short');
    }
    toast.success(enabled ? 'Vibración activada' : 'Vibración desactivada');
  };

  const handleSoundTypeToggle = (soundId: string, enabled: boolean) => {
    const newDisabled = enabled 
      ? disabledSounds.filter(id => id !== soundId)
      : [...disabledSounds, soundId];
    
    setDisabledSounds(newDisabled);
    localStorage.setItem('notification_disabled_sounds', JSON.stringify(newDisabled));
  };

  const playTestSound = (soundType: NotificationSoundType, vibrationPattern: VibrationPattern) => {
    if (soundEnabled) {
      playNotificationSound(soundType);
    }
    if (vibrationEnabled) {
      triggerVibration(vibrationPattern);
    }
    if (!soundEnabled && !vibrationEnabled) {
      toast.info('Activa sonidos o vibración para probar');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Volume2 className="h-5 w-5" />
          Configuración de Notificaciones
        </CardTitle>
        <CardDescription>
          Personaliza los sonidos y vibraciones de las notificaciones
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Master toggles */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {soundEnabled ? (
                <Volume2 className="h-5 w-5 text-primary" />
              ) : (
                <VolumeX className="h-5 w-5 text-muted-foreground" />
              )}
              <div>
                <Label htmlFor="sound-toggle" className="text-base font-medium">
                  Sonidos de notificación
                </Label>
                <p className="text-sm text-muted-foreground">
                  Reproducir sonidos cuando lleguen notificaciones
                </p>
              </div>
            </div>
            <Switch
              id="sound-toggle"
              checked={soundEnabled}
              onCheckedChange={handleSoundEnabledChange}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Vibrate className={`h-5 w-5 ${vibrationEnabled ? 'text-primary' : 'text-muted-foreground'}`} />
              <div>
                <Label htmlFor="vibration-toggle" className="text-base font-medium">
                  Vibración
                </Label>
                <p className="text-sm text-muted-foreground">
                  Vibrar el dispositivo con las notificaciones
                </p>
              </div>
            </div>
            <Switch
              id="vibration-toggle"
              checked={vibrationEnabled}
              onCheckedChange={handleVibrationEnabledChange}
            />
          </div>
        </div>

        <Separator />

        {/* Individual sound settings */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-muted-foreground">
            Sonidos por tipo de notificación
          </h4>
          
          <div className="space-y-3">
            {soundSettings.map((setting) => {
              const isEnabled = !disabledSounds.includes(setting.id);
              
              return (
                <div 
                  key={setting.id}
                  className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-muted">
                      {setting.icon}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{setting.label}</p>
                      <p className="text-xs text-muted-foreground">{setting.description}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => playTestSound(setting.id, setting.vibration)}
                      disabled={!soundEnabled && !vibrationEnabled}
                      className="h-8 w-8 p-0"
                    >
                      <Play className="h-3 w-3" />
                    </Button>
                    <Switch
                      checked={isEnabled}
                      onCheckedChange={(checked) => handleSoundTypeToggle(setting.id, checked)}
                      disabled={!soundEnabled && !vibrationEnabled}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Test all sounds button */}
        <div className="pt-4">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => {
              let delay = 0;
              soundSettings.forEach((setting) => {
                setTimeout(() => {
                  playTestSound(setting.id, setting.vibration);
                }, delay);
                delay += 800;
              });
            }}
            disabled={!soundEnabled && !vibrationEnabled}
          >
            <Volume2 className="h-4 w-4 mr-2" />
            Probar todos los sonidos
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default NotificationSoundSettings;
