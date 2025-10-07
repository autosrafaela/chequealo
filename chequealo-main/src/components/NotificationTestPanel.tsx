import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { createNotification } from '@/utils/notificationHelpers';
import { toast } from 'sonner';
import { Bell, Send, TestTube2 } from 'lucide-react';

const NotificationTestPanel = () => {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState<'success' | 'info' | 'warning' | 'error'>('info');
  const [actionUrl, setActionUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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
      
      // Reset form
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TestTube2 className="h-5 w-5" />
          Panel de Pruebas de Notificaciones
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Quick Tests */}
        <div>
          <Label className="text-base font-semibold mb-3 block">Pruebas Rápidas</Label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => sendQuickTest('success')}
              disabled={isLoading}
              className="text-green-600 border-green-200"
            >
              ✅ Éxito
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => sendQuickTest('info')}
              disabled={isLoading}
              className="text-blue-600 border-blue-200"
            >
              ℹ️ Info
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => sendQuickTest('warning')}
              disabled={isLoading}
              className="text-yellow-600 border-yellow-200"
            >
              ⚠️ Alerta
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => sendQuickTest('error')}
              disabled={isLoading}
              className="text-red-600 border-red-200"
            >
              ❌ Error
            </Button>
          </div>
        </div>

        {/* Custom Notification Form */}
        <div className="space-y-4">
          <Label className="text-base font-semibold">Notificación Personalizada</Label>
          
          <div>
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Título de la notificación"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="message">Mensaje *</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Contenido del mensaje"
              className="mt-1"
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="type">Tipo</Label>
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

          <div>
            <Label htmlFor="actionUrl">URL de Acción (opcional)</Label>
            <Input
              id="actionUrl"
              value={actionUrl}
              onChange={(e) => setActionUrl(e.target.value)}
              placeholder="/dashboard, /admin, etc."
              className="mt-1"
            />
          </div>

          <Button
            onClick={handleSendTestNotification}
            disabled={isLoading || !title || !message}
            className="w-full"
          >
            <Send className="h-4 w-4 mr-2" />
            {isLoading ? 'Enviando...' : 'Enviar Notificación'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default NotificationTestPanel;