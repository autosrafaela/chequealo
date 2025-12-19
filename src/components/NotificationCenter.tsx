import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Bell, 
  CheckCircle, 
  AlertTriangle, 
  Info, 
  CheckCheck,
  RefreshCw,
  BellRing,
  BellOff,
  Settings
} from 'lucide-react';
import { useRealtimeNotifications } from '@/hooks/useRealtimeNotifications';
import { useServiceWorkerUpdate } from '@/hooks/useServiceWorkerUpdate';
import { useNotifications } from '@/contexts/NotificationContext';
import { toast } from 'sonner';
import SwipeableNotificationItem from './SwipeableNotificationItem';

const NotificationCenter = () => {
  const navigate = useNavigate();
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead
  } = useRealtimeNotifications();

  const { updateAvailable, isUpdating, updateApp, showBanner } = useServiceWorkerUpdate();
  
  // Push notification context
  const { 
    isPushSupported, 
    isSubscribedToPush, 
    pushPermission,
    subscribeToPush,
    deleteNotification,
    initializeAudio
  } = useNotifications();

  const [isOpen, setIsOpen] = useState(false);
  const [isActivatingPush, setIsActivatingPush] = useState(false);

  const handleActivatePush = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsActivatingPush(true);
    try {
      await initializeAudio();
      await subscribeToPush();
    } catch (error) {
      console.error('Error activating push:', error);
      toast.error('Error al activar las notificaciones');
    } finally {
      setIsActivatingPush(false);
    }
  };

  // Create update notification if available
  const updateNotification = updateAvailable ? {
    id: 'sw-update-notification',
    title: '¡Nueva versión disponible!',
    message: 'Hay una actualización lista para instalar. Haz clic para actualizar la aplicación.',
    type: 'update' as const,
    created_at: new Date().toISOString(),
    read: false,
    isUpdate: true
  } : null;

  // Combine update notification with regular notifications
  const allNotifications = updateNotification 
    ? [updateNotification, ...notifications]
    : notifications;

  const totalUnreadCount = unreadCount + (updateAvailable ? 1 : 0);

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'update':
        return <RefreshCw className="h-4 w-4 text-primary animate-pulse" />;
      default:
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const handleNotificationClick = (notification: any) => {
    // Handle update notification
    if (notification.isUpdate) {
      updateApp();
      return;
    }

    if (!notification.read) {
      markAsRead(notification.id);
    }
    
    if (notification.action_url) {
      if (notification.action_url.startsWith('http')) {
        window.open(notification.action_url, '_blank');
      } else {
        navigate(notification.action_url);
      }
    }
    setIsOpen(false);
  };

  const handleDeleteNotification = async (id: string) => {
    await deleteNotification(id);
  };

  const handleUpdateClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    updateApp();
  };

  const handleShowBanner = (e: React.MouseEvent) => {
    e.stopPropagation();
    showBanner();
    setIsOpen(false);
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className={`h-5 w-5 ${updateAvailable ? 'text-primary' : ''}`} />
          {totalUnreadCount > 0 && (
            <Badge 
              className={`absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs text-white animate-pulse ${
                updateAvailable ? 'bg-primary' : 'bg-red-500'
              }`}
            >
              {totalUnreadCount > 99 ? '99+' : totalUnreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-80 p-0">
        <div className="p-3 border-b">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Notificaciones</h3>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllAsRead}
                className="text-xs"
              >
                <CheckCheck className="h-3 w-3 mr-1" />
                Marcar todas
              </Button>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Desliza hacia la derecha para eliminar
          </p>
        </div>
        
        {allNotifications.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">
            <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No hay notificaciones</p>
          </div>
        ) : (
          <ScrollArea className="max-h-96">
            {allNotifications.map((notification) => (
              <SwipeableNotificationItem
                key={notification.id}
                notification={notification}
                icon={getIcon(notification.type)}
                onDelete={handleDeleteNotification}
                onMarkAsRead={markAsRead}
                onClick={() => handleNotificationClick(notification)}
                isUpdating={isUpdating}
                onUpdateClick={handleUpdateClick}
                onShowBanner={handleShowBanner}
              />
            ))}
          </ScrollArea>
        )}
        
        {/* Push Notification Settings Section */}
        <DropdownMenuSeparator />
        <div className="p-3 space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Settings className="h-4 w-4" />
            <span>Configuración de notificaciones</span>
          </div>
          
          {!isPushSupported ? (
            <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 p-2 rounded">
              <BellOff className="h-4 w-4" />
              <span>Tu navegador no soporta notificaciones push</span>
            </div>
          ) : pushPermission === 'denied' ? (
            <div className="flex items-center gap-2 text-xs text-destructive bg-destructive/10 p-2 rounded">
              <BellOff className="h-4 w-4" />
              <span>Notificaciones bloqueadas. Actívalas en la configuración del navegador.</span>
            </div>
          ) : isSubscribedToPush ? (
            <div className="flex items-center gap-2 text-xs text-green-600 bg-green-50 dark:bg-green-900/20 p-2 rounded">
              <BellRing className="h-4 w-4" />
              <span>Notificaciones push activadas</span>
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={handleActivatePush}
              disabled={isActivatingPush}
              className="w-full text-xs"
            >
              <BellRing className={`h-4 w-4 mr-2 ${isActivatingPush ? 'animate-pulse' : ''}`} />
              {isActivatingPush ? 'Activando...' : 'Activar notificaciones push'}
            </Button>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationCenter;
