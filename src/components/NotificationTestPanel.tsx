import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/contexts/AuthContext';
import { createNotification } from '@/utils/notificationHelpers';
import { playNotificationSound, triggerVibration, type NotificationSoundType, type VibrationPattern } from '@/utils/notificationSound';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { toast } from 'sonner';
import { 
  Bell, Send, TestTube2, Volume2, Vibrate, Smartphone, 
  CheckCircle2, XCircle, AlertCircle, Loader2, RefreshCw,
  Play, Zap, Heart, Star, MessageCircle, Calendar, CreditCard,
  MapPin, Users, Trophy
} from 'lucide-react';

const SOUND_TYPES: { type: NotificationSoundType; label: string; icon: React.ReactNode }[] = [
  { type: 'default', label: 'Por defecto', icon: <Bell className="h-4 w-4" /> },
  { type: 'message', label: 'Mensaje', icon: <MessageCircle className="h-4 w-4" /> },
  { type: 'contact', label: 'Contacto', icon: <Users className="h-4 w-4" /> },
  { type: 'express', label: 'Express 🚀', icon: <Zap className="h-4 w-4" /> },
  { type: 'zone_alert', label: 'Alerta de zona', icon: <MapPin className="h-4 w-4" /> },
  { type: 'booking_confirmed', label: 'Reserva confirmada', icon: <Calendar className="h-4 w-4" /> },
  { type: 'booking_reminder', label: 'Recordatorio', icon: <Bell className="h-4 w-4" /> },
  { type: 'new_review', label: 'Nueva reseña', icon: <Star className="h-4 w-4" /> },
  { type: 'payment', label: 'Pago', icon: <CreditCard className="h-4 w-4" /> },
  { type: 'urgent', label: 'Urgente', icon: <AlertCircle className="h-4 w-4" /> },
  { type: 'new_professional', label: 'Nuevo profesional', icon: <Users className="h-4 w-4" /> },
  { type: 'favorite', label: 'Favorito', icon: <Heart className="h-4 w-4" /> },
  { type: 'achievement', label: 'Logro', icon: <Trophy className="h-4 w-4" /> },
  { type: 'badge_unlocked', label: 'Badge desbloqueado', icon: <Star className="h-4 w-4" /> },
];

const VIBRATION_PATTERNS: { pattern: VibrationPattern; label: string; description: string }[] = [
  { pattern: 'short', label: 'Corta', description: '100ms' },
  { pattern: 'medium', label: 'Media', description: '300ms' },
  { pattern: 'long', label: 'Larga', description: '500ms' },
  { pattern: 'urgent', label: 'Urgente', description: '3 pulsos rápidos' },
  { pattern: 'success', label: 'Éxito', description: '2 pulsos alegres' },
];

const NotificationTestPanel = () => {
  const { user } = useAuth();
  const { isSupported, permission, isSubscribed, subscribe, unsubscribe, loading: pushLoading } = usePushNotifications();
  
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState<'success' | 'info' | 'warning' | 'error'>('info');
  const [actionUrl, setActionUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // System status
  const [audioContextState, setAudioContextState] = useState<string>('unknown');
  const [vibrationSupported, setVibrationSupported] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  
  // User preferences
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);

  useEffect(() => {
    // Check system capabilities
    setVibrationSupported('vibrate' in navigator);
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
    
    // Check AudioContext
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      setAudioContextState(ctx.state);
      ctx.close();
    } catch {
      setAudioContextState('not supported');
    }
    
    // Load user preferences
    setSoundEnabled(localStorage.getItem('notification_sound_enabled') !== 'false');
    setVibrationEnabled(localStorage.getItem('notification_vibration_enabled') !== 'false');
  }, []);

  const handleSoundToggle = (enabled: boolean) => {
    setSoundEnabled(enabled);
    localStorage.setItem('notification_sound_enabled', enabled ? 'true' : 'false');
    toast.success(enabled ? 'Sonidos activados' : 'Sonidos desactivados');
  };

  const handleVibrationToggle = (enabled: boolean) => {
    setVibrationEnabled(enabled);
    localStorage.setItem('notification_vibration_enabled', enabled ? 'true' : 'false');
    toast.success(enabled ? 'Vibración activada' : 'Vibración desactivada');
  };

  const testSound = async (soundType: NotificationSoundType) => {
    try {
      await playNotificationSound(soundType);
      toast.success(`Sonido "${soundType}" reproducido`);
    } catch (error) {
      toast.error('Error al reproducir sonido');
      console.error('Sound test error:', error);
    }
  };

  const testVibration = (pattern: VibrationPattern) => {
    triggerVibration(pattern);
    toast.success(`Vibración "${pattern}" activada`);
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      toast.success(`Permiso de notificaciones: ${permission}`);
    }
  };

  const testBrowserNotification = () => {
    if (notificationPermission === 'granted') {
      new Notification('🔔 Prueba de notificación', {
        body: 'Esta es una notificación de prueba del navegador',
        icon: '/favicon.ico',
        tag: 'test-notification'
      });
      toast.success('Notificación del navegador enviada');
    } else {
      toast.error('Permisos de notificación no concedidos');
    }
  };

  const handleSendTestNotification = async () => {
    if (!user || !title || !message) {
      toast.error('Por favor complete todos los campos requeridos');
      return;
    }

    setIsLoading(true);
    
    try {
      const { error } = await createNotification({
        userId: user.id,
        title,
        message,
        type,
        actionUrl: actionUrl || undefined
      });

      if (error) throw error;

      toast.success('Notificación de prueba enviada');
      
      setTitle('');
      setMessage('');
      setActionUrl('');
      setType('info');
    } catch (error) {
      console.error('Error sending test notification:', error);
      toast.error('Error al enviar notificación de prueba');
    } finally {
      setIsLoading(false);
    }
  };

  const sendQuickTest = async (testType: string) => {
    if (!user) return;

    setIsLoading(true);
    
    try {
      let testTitle, testMessage, testNotifType: 'success' | 'info' | 'warning' | 'error', testActionUrl;

      switch (testType) {
        case 'success':
          testTitle = '✅ Prueba de éxito';
          testMessage = 'Esta es una notificación de prueba de tipo éxito';
          testNotifType = 'success';
          testActionUrl = '/dashboard';
          break;
        case 'warning':
          testTitle = '⚠️ Prueba de advertencia';
          testMessage = 'Esta es una notificación de prueba de tipo advertencia';
          testNotifType = 'warning';
          testActionUrl = '/dashboard';
          break;
        case 'error':
          testTitle = '❌ Prueba de error';
          testMessage = 'Esta es una notificación de prueba de tipo error';
          testNotifType = 'error';
          testActionUrl = '/dashboard';
          break;
        default:
          testTitle = 'ℹ️ Prueba de información';
          testMessage = 'Esta es una notificación de prueba de tipo información';
          testNotifType = 'info';
          testActionUrl = '/dashboard';
      }

      const { error } = await createNotification({
        userId: user.id,
        title: testTitle,
        message: testMessage,
        type: testNotifType,
        actionUrl: testActionUrl
      });

      if (error) throw error;

      toast.success(`Notificación de prueba ${testType} enviada`);
    } catch (error) {
      console.error('Error sending quick test notification:', error);
      toast.error('Error al enviar notificación de prueba');
    } finally {
      setIsLoading(false);
    }
  };

  const refreshStatus = () => {
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      setAudioContextState(ctx.state);
      ctx.close();
    } catch {
      setAudioContextState('not supported');
    }
    toast.success('Estado actualizado');
  };

  const StatusBadge = ({ status, label }: { status: 'ok' | 'warning' | 'error'; label: string }) => {
    const variants = {
      ok: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      error: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    };
    const icons = {
      ok: <CheckCircle2 className="h-3 w-3" />,
      warning: <AlertCircle className="h-3 w-3" />,
      error: <XCircle className="h-3 w-3" />,
    };
    return (
      <Badge className={`${variants[status]} flex items-center gap-1`}>
        {icons[status]}
        {label}
      </Badge>
    );
  };

  if (!user) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">Inicia sesión para probar las notificaciones</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* System Status Card */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg">
                <TestTube2 className="h-5 w-5" />
                Estado del Sistema
              </CardTitle>
              <CardDescription>Verifica que todas las funciones están operativas</CardDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={refreshStatus}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Audio Context</p>
              <StatusBadge 
                status={audioContextState === 'running' ? 'ok' : audioContextState === 'suspended' ? 'warning' : 'error'} 
                label={audioContextState} 
              />
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Vibración</p>
              <StatusBadge 
                status={vibrationSupported ? 'ok' : 'warning'} 
                label={vibrationSupported ? 'Soportada' : 'No disponible'} 
              />
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Notificaciones</p>
              <StatusBadge 
                status={notificationPermission === 'granted' ? 'ok' : notificationPermission === 'denied' ? 'error' : 'warning'} 
                label={notificationPermission} 
              />
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Push Notifications</p>
              {pushLoading ? (
                <Badge className="flex items-center gap-1">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Cargando...
                </Badge>
              ) : (
                <StatusBadge 
                  status={isSubscribed ? 'ok' : isSupported ? 'warning' : 'error'} 
                  label={isSubscribed ? 'Suscrito' : isSupported ? 'No suscrito' : 'No soportado'} 
                />
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* User Preferences */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Preferencias de Usuario</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Volume2 className="h-4 w-4 text-muted-foreground" />
              <Label htmlFor="sound-toggle">Sonidos de notificación</Label>
            </div>
            <Switch 
              id="sound-toggle" 
              checked={soundEnabled} 
              onCheckedChange={handleSoundToggle} 
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Vibrate className="h-4 w-4 text-muted-foreground" />
              <Label htmlFor="vibration-toggle">Vibración</Label>
            </div>
            <Switch 
              id="vibration-toggle" 
              checked={vibrationEnabled} 
              onCheckedChange={handleVibrationToggle}
              disabled={!vibrationSupported}
            />
          </div>
        </CardContent>
      </Card>

      {/* Sound Tests */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Volume2 className="h-5 w-5" />
            Prueba de Sonidos
          </CardTitle>
          <CardDescription>Haz clic en un tipo para escuchar el sonido</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
            {SOUND_TYPES.map(({ type, label, icon }) => (
              <Button
                key={type}
                variant="outline"
                size="sm"
                onClick={() => testSound(type)}
                className="flex items-center gap-1.5 justify-start"
                disabled={!soundEnabled}
              >
                {icon}
                <span className="text-xs truncate">{label}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Vibration Tests */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Vibrate className="h-5 w-5" />
            Prueba de Vibración
          </CardTitle>
          <CardDescription>Prueba los diferentes patrones de vibración</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
            {VIBRATION_PATTERNS.map(({ pattern, label, description }) => (
              <Button
                key={pattern}
                variant="outline"
                size="sm"
                onClick={() => testVibration(pattern)}
                className="flex flex-col items-center gap-0.5 h-auto py-2"
                disabled={!vibrationEnabled || !vibrationSupported}
              >
                <span className="text-xs font-medium">{label}</span>
                <span className="text-[10px] text-muted-foreground">{description}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Push Notifications */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Smartphone className="h-5 w-5" />
            Push Notifications
          </CardTitle>
          <CardDescription>Gestiona las notificaciones push del navegador</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {notificationPermission !== 'granted' && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={requestNotificationPermission}
              >
                <Bell className="h-4 w-4 mr-2" />
                Solicitar Permiso
              </Button>
            )}
            {notificationPermission === 'granted' && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={testBrowserNotification}
              >
                <Play className="h-4 w-4 mr-2" />
                Probar Notificación del Navegador
              </Button>
            )}
            {isSupported && !isSubscribed && (
              <Button 
                variant="default" 
                size="sm" 
                onClick={subscribe}
                disabled={pushLoading}
              >
                {pushLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Bell className="h-4 w-4 mr-2" />}
                Suscribirse a Push
              </Button>
            )}
            {isSubscribed && (
              <Button 
                variant="destructive" 
                size="sm" 
                onClick={unsubscribe}
                disabled={pushLoading}
              >
                {pushLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <XCircle className="h-4 w-4 mr-2" />}
                Cancelar Suscripción
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Database Notifications */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Bell className="h-5 w-5" />
            Notificaciones de Base de Datos
          </CardTitle>
          <CardDescription>Envía notificaciones reales a través del sistema</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Quick Tests */}
          <div>
            <Label className="text-sm font-semibold mb-3 block">Pruebas Rápidas</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => sendQuickTest('success')}
                disabled={isLoading}
                className="text-green-600 border-green-200 hover:bg-green-50"
              >
                ✅ Éxito
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => sendQuickTest('info')}
                disabled={isLoading}
                className="text-blue-600 border-blue-200 hover:bg-blue-50"
              >
                ℹ️ Info
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => sendQuickTest('warning')}
                disabled={isLoading}
                className="text-yellow-600 border-yellow-200 hover:bg-yellow-50"
              >
                ⚠️ Alerta
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => sendQuickTest('error')}
                disabled={isLoading}
                className="text-red-600 border-red-200 hover:bg-red-50"
              >
                ❌ Error
              </Button>
            </div>
          </div>

          <Separator />

          {/* Custom Notification Form */}
          <div className="space-y-4">
            <Label className="text-sm font-semibold">Notificación Personalizada</Label>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title" className="text-xs">Título *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Título de la notificación"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="type" className="text-xs">Tipo</Label>
                <Select value={type} onValueChange={(value: 'success' | 'info' | 'warning' | 'error') => setType(value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="info">Información</SelectItem>
                    <SelectItem value="success">Éxito</SelectItem>
                    <SelectItem value="warning">Advertencia</SelectItem>
                    <SelectItem value="error">Error</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="message" className="text-xs">Mensaje *</Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Contenido del mensaje"
                className="mt-1"
                rows={2}
              />
            </div>

            <div>
              <Label htmlFor="actionUrl" className="text-xs">URL de Acción (opcional)</Label>
              <Input
                id="actionUrl"
                value={actionUrl}
                onChange={(e) => setActionUrl(e.target.value)}
                placeholder="/dashboard, /mensajes, etc."
                className="mt-1"
              />
            </div>

            <Button
              onClick={handleSendTestNotification}
              disabled={isLoading || !title || !message}
              className="w-full"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              {isLoading ? 'Enviando...' : 'Enviar Notificación'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationTestPanel;
