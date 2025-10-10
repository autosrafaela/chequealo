import { Bell } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import PushNotificationToggle from './PushNotificationToggle';

/**
 * Settings panel for push notifications
 * Wraps PushNotificationToggle in a consistent card layout
 */
const PushNotificationSettings = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Configuración de Notificaciones
        </CardTitle>
        <CardDescription>
          Gestiona cómo y cuándo recibes notificaciones
        </CardDescription>
      </CardHeader>
      <CardContent>
        <PushNotificationToggle />
      </CardContent>
    </Card>
  );
};

export default PushNotificationSettings;
