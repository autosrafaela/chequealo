import { Bell, BellOff } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { usePushNotifications } from '@/hooks/usePushNotifications';

const PushNotificationToggle = () => {
  const {
    isSupported,
    isSubscribed,
    permission,
    loading,
    subscribe,
    unsubscribe
  } = usePushNotifications();

  if (!isSupported) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BellOff className="h-5 w-5" />
            Notificaciones Push
          </CardTitle>
          <CardDescription>
            Tu navegador no soporta notificaciones push
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertDescription>
              Las notificaciones push no están disponibles en este navegador. 
              Prueba con Chrome, Firefox, Edge o Safari en un dispositivo compatible.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const handleToggle = async (checked: boolean) => {
    if (checked) {
      await subscribe();
    } else {
      await unsubscribe();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Notificaciones Push
        </CardTitle>
        <CardDescription>
          Recibe notificaciones en tiempo real sobre nuevas solicitudes, mensajes y actualizaciones
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="push-notifications" className="text-base">
              Activar notificaciones
            </Label>
            <p className="text-sm text-muted-foreground">
              {isSubscribed 
                ? '✓ Notificaciones activadas' 
                : 'Desactivadas'}
            </p>
          </div>
          <Switch
            id="push-notifications"
            checked={isSubscribed}
            onCheckedChange={handleToggle}
            disabled={loading || permission === 'denied'}
          />
        </div>

        {permission === 'denied' && (
          <Alert variant="destructive">
            <AlertDescription>
              Has bloqueado las notificaciones. Para activarlas, ve a la configuración de tu navegador 
              y permite las notificaciones para este sitio.
            </AlertDescription>
          </Alert>
        )}

        {permission === 'default' && (
          <Alert>
            <AlertDescription>
              Al activar las notificaciones, tu navegador te pedirá permiso para enviarlas.
            </AlertDescription>
          </Alert>
        )}

        {isSubscribed && (
          <Alert>
            <AlertDescription className="text-sm">
              ✓ Recibirás notificaciones sobre:
              <ul className="mt-2 ml-4 list-disc space-y-1">
                <li>Nuevas solicitudes de contacto</li>
                <li>Mensajes nuevos</li>
                <li>Cambios en reservas</li>
                <li>Reseñas recibidas</li>
              </ul>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default PushNotificationToggle;
