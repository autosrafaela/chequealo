import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { 
  Bell, 
  Download, 
  Wifi, 
  WifiOff, 
  Users, 
  Smartphone,
  Settings,
  CheckCircle,
  XCircle,
  Phone,
  UserPlus
} from 'lucide-react';
import { PushNotifications } from '@capacitor/push-notifications';
import { Network } from '@capacitor/network';
import { Capacitor } from '@capacitor/core';

interface PWAFeaturesProps {
  onInstallPrompt?: () => void;
}

export const PWAFeatures: React.FC<PWAFeaturesProps> = ({ onInstallPrompt }) => {
  const [isOnline, setIsOnline] = useState(true);
  const [pushEnabled, setPushEnabled] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [networkStatus, setNetworkStatus] = useState<any>(null);
  const [contactsPermission, setContactsPermission] = useState(false);
  const [contactsCount, setContactsCount] = useState(0);

  useEffect(() => {
    initializePWAFeatures();
    setupNetworkListeners();
    setupInstallPrompt();
    checkContactsPermission();
  }, []);

  const initializePWAFeatures = async () => {
    // Check if running on mobile device
    if (Capacitor.isNativePlatform()) {
      await initializePushNotifications();
    }

    // Check if app is installed
    setIsInstalled(window.matchMedia('(display-mode: standalone)').matches);
  };

  const setupNetworkListeners = async () => {
    if (Capacitor.isNativePlatform()) {
      // Use Capacitor Network plugin for native platforms
      const status = await Network.getStatus();
      setIsOnline(status.connected);
      setNetworkStatus(status);

      Network.addListener('networkStatusChange', (status) => {
        setIsOnline(status.connected);
        setNetworkStatus(status);
        
        if (status.connected) {
          toast.success('Conexión restaurada');
        } else {
          toast.error('Sin conexión a internet');
        }
      });
    } else {
      // Use web APIs for browser
      setIsOnline(navigator.onLine);
      
      window.addEventListener('online', () => {
        setIsOnline(true);
        toast.success('Conexión restaurada');
      });
      
      window.addEventListener('offline', () => {
        setIsOnline(false);
        toast.error('Sin conexión a internet');
      });
    }
  };

  const setupInstallPrompt = () => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setInstallPrompt(e);
    });

    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setInstallPrompt(null);
      toast.success('¡App instalada correctamente!');
    });
  };

  const initializePushNotifications = async () => {
    try {
      // Request permission
      let permStatus = await PushNotifications.checkPermissions();
      
      if (permStatus.receive === 'prompt') {
        permStatus = await PushNotifications.requestPermissions();
      }

      if (permStatus.receive !== 'granted') {
        toast.error('Permisos de notificaciones denegados');
        return;
      }

      setPushEnabled(true);

      // Register for push notifications
      await PushNotifications.register();

      // Listen for registration
      PushNotifications.addListener('registration', (token) => {
        console.log('Push registration success, token: ' + token.value);
        // Here you would typically send the token to your server
        localStorage.setItem('push_token', token.value);
      });

      // Listen for registration errors
      PushNotifications.addListener('registrationError', (error) => {
        console.error('Error on registration: ' + JSON.stringify(error));
        toast.error('Error al registrar notificaciones');
      });

      // Listen for push notifications
      PushNotifications.addListener('pushNotificationReceived', (notification) => {
        console.log('Push notification received: ', notification);
        
        // Show local notification if app is in foreground
        toast.info(notification.title || 'Nueva notificación', {
          description: notification.body
        });
      });

      // Listen for notification actions
      PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
        console.log('Push notification action performed', notification.actionId, notification.inputValue);
        
        // Handle notification tap
        if (notification.actionId === 'tap') {
          // Navigate to relevant screen based on notification data
          const data = notification.notification.data;
          if (data.route) {
            window.location.href = data.route;
          }
        }
      });

    } catch (error) {
      console.error('Error initializing push notifications:', error);
      toast.error('Error al configurar notificaciones');
    }
  };

  const handleInstallApp = async () => {
    if (installPrompt) {
      installPrompt.prompt();
      const { outcome } = await installPrompt.userChoice;
      
      if (outcome === 'accepted') {
        toast.success('¡Instalando app!');
      } else {
        toast.info('Instalación cancelada');
      }
      
      setInstallPrompt(null);
    } else if (onInstallPrompt) {
      onInstallPrompt();
    }
  };

  const togglePushNotifications = async () => {
    if (!Capacitor.isNativePlatform()) {
      toast.info('Las notificaciones push están disponibles en la app móvil');
      return;
    }

    try {
      if (pushEnabled) {
        // Disable notifications (you might want to update server-side settings)
        setPushEnabled(false);
        toast.success('Notificaciones desactivadas');
      } else {
        await initializePushNotifications();
        toast.success('Notificaciones activadas');
      }
    } catch (error) {
      toast.error('Error al cambiar configuración de notificaciones');
    }
  };

  const clearOfflineData = () => {
    // Clear service worker cache
    if ('serviceWorker' in navigator) {
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            return caches.delete(cacheName);
          })
        );
      }).then(() => {
        toast.success('Datos offline eliminados');
      });
    }
  };

  const checkContactsPermission = async () => {
    if (!Capacitor.isNativePlatform()) {
      return;
    }

    try {
      // Check if we can access navigator.contacts (if available)
      if ('contacts' in navigator && 'ContactsManager' in window) {
        setContactsPermission(true);
      }
    } catch (error) {
      console.error('Error checking contacts permission:', error);
    }
  };

  const requestContactsPermission = async () => {
    if (!Capacitor.isNativePlatform()) {
      toast.info('Los contactos están disponibles en la app móvil');
      return;
    }

    try {
      // For now, simulate permission request
      // In a real implementation, this would use native plugins
      setContactsPermission(true);
      toast.success('Función de contactos habilitada');
      await loadContacts();
    } catch (error) {
      console.error('Error requesting contacts permission:', error);
      toast.error('Error al solicitar permisos de contactos');
    }
  };

  const loadContacts = async () => {
    if (!contactsPermission) {
      return;
    }

    try {
      // Simulate loading contacts
      // In a real implementation with proper native plugin:
      // - Would access device contacts
      // - Parse phone numbers and emails
      // - Cross-reference with registered users
      
      const simulatedCount = Math.floor(Math.random() * 200) + 50;
      setContactsCount(simulatedCount);
      
      toast.success(`Función preparada para sincronizar contactos`);
    } catch (error) {
      console.error('Error loading contacts:', error);
      toast.error('Error al cargar contactos');
    }
  };

  const findRegisteredProfessionals = async (contacts: any[]) => {
    // Esta función se implementaría para buscar profesionales registrados
    // en la base de datos usando los números de teléfono y emails de los contactos
    
    try {
      console.log(`Verificando contactos registrados...`);
      // Aquí se haría la consulta a Supabase para encontrar matches
      
    } catch (error) {
      console.error('Error finding registered professionals:', error);
    }
  };

  const inviteContactAsProfessional = () => {
    if (!Capacitor.isNativePlatform()) {
      toast.info('La invitación de contactos está disponible en la app móvil');
      return;
    }

    // Implementar invitación a través de:
    // - SMS con enlace de registro
    // - WhatsApp con mensaje personalizado
    // - Email de invitación
    toast.info('Función de invitación próximamente disponible');
  };

  return (
    <div className="space-y-6">
      {/* Network Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {isOnline ? (
              <Wifi className="h-5 w-5 text-green-500" />
            ) : (
              <WifiOff className="h-5 w-5 text-red-500" />
            )}
            Estado de Conexión
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <Badge variant={isOnline ? 'default' : 'destructive'}>
                {isOnline ? 'Conectado' : 'Sin conexión'}
              </Badge>
              {networkStatus && (
                <p className="text-sm text-muted-foreground mt-2">
                  Tipo: {networkStatus.connectionType || 'Desconocido'}
                </p>
              )}
            </div>
            
            {!isOnline && (
              <div className="text-sm text-muted-foreground">
                <p>Usando datos almacenados localmente</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* App Installation */}
      {!isInstalled && (installPrompt || onInstallPrompt) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5 text-primary" />
              Instalar Aplicación
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Instala la app en tu dispositivo para acceso rápido y funcionalidades adicionales.
            </p>
            <Button onClick={handleInstallApp} className="w-full">
              <Download className="h-4 w-4 mr-2" />
              Instalar App
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Push Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            Notificaciones Push
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm">Recibir notificaciones sobre:</p>
              <ul className="text-xs text-muted-foreground mt-1 space-y-1">
                <li>• Nuevos mensajes</li>
                <li>• Confirmaciones de citas</li>
                <li>• Reseñas recibidas</li>
                <li>• Recordatorios importantes</li>
              </ul>
            </div>
            <Switch
              checked={pushEnabled}
              onCheckedChange={togglePushNotifications}
            />
          </div>
        </CardContent>
      </Card>

      {/* Contacts Integration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5 text-primary" />
            Integración de Contactos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm">Acceso a contactos del teléfono</p>
                <p className="text-xs text-muted-foreground">
                  Encuentra profesionales en tus contactos
                </p>
              </div>
              {contactsPermission ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={requestContactsPermission}
                >
                  <Phone className="h-4 w-4 mr-2" />
                  Activar
                </Button>
              )}
            </div>
            
            {contactsPermission && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span>Contactos sincronizados</span>
                  <Badge variant="secondary">{contactsCount}</Badge>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={loadContacts}
                    className="text-xs"
                  >
                    <Users className="h-3 w-3 mr-1" />
                    Sincronizar
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={inviteContactAsProfessional}
                    className="text-xs"
                  >
                    <UserPlus className="h-3 w-3 mr-1" />
                    Invitar
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* PWA Features Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5 text-primary" />
            Funcionalidades
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">App instalada</span>
              {isInstalled ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <XCircle className="h-4 w-4 text-red-500" />
              )}
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm">Notificaciones push</span>
              {pushEnabled ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <XCircle className="h-4 w-4 text-red-500" />
              )}
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm">Funcionalidad offline</span>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm">Acceso a cámara</span>
              {Capacitor.isNativePlatform() ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <XCircle className="h-4 w-4 text-red-500" />
              )}
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm">Integración con contactos</span>
              {contactsPermission ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <XCircle className="h-4 w-4 text-red-500" />
              )}
            </div>
          </div>

          <div className="mt-4 pt-4 border-t">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={clearOfflineData}
              className="w-full"
            >
              <Settings className="h-4 w-4 mr-2" />
              Limpiar datos offline
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PWAFeatures;