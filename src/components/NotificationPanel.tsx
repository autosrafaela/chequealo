import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, X, MessageSquare, Star, Settings, CheckCircle } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

interface Notification {
  id: string;
  type: 'response' | 'feedback' | 'admin';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
}

interface NotificationPanelProps {
  notifications: Notification[];
  unreadCount: number;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
}

const NotificationPanel = ({ 
  notifications = [], 
  unreadCount = 0, 
  onMarkAsRead,
  onMarkAllAsRead 
}: NotificationPanelProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'response':
        return <MessageSquare className="h-4 w-4 text-blue-500" />;
      case 'feedback':
        return <Star className="h-4 w-4 text-yellow-500" />;
      case 'admin':
        return <Settings className="h-4 w-4 text-purple-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  const getNotificationBadgeColor = (type: string) => {
    switch (type) {
      case 'response':
        return 'bg-blue-100 text-blue-800';
      case 'feedback':
        return 'bg-yellow-100 text-yellow-800';
      case 'admin':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const mockNotifications: Notification[] = [
    {
      id: '1',
      type: 'response',
      title: 'Nueva respuesta a tu solicitud',
      message: 'Ana Rodríguez respondió a tu consulta sobre servicios contables.',
      timestamp: 'Hace 5 minutos',
      read: false
    },
    {
      id: '2',
      type: 'feedback',
      title: 'Solicitud de calificación',
      message: 'Califica el servicio recibido de José Martínez (Plomero).',
      timestamp: 'Hace 1 hora',
      read: false
    },
    {
      id: '3',
      type: 'admin',
      title: 'Actualización de políticas',
      message: 'Hemos actualizado nuestros términos y condiciones.',
      timestamp: 'Hace 2 horas',
      read: true
    },
    {
      id: '4',
      type: 'response',
      title: 'Propuesta recibida',
      message: 'Laura Gómez envió una propuesta para tu proyecto eléctrico.',
      timestamp: 'Ayer',
      read: true
    }
  ];

  const notificationsToShow = notifications.length > 0 ? notifications : mockNotifications;
  const unreadCountToShow = unreadCount > 0 ? unreadCount : notificationsToShow.filter(n => !n.read).length;

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-navy-foreground hover:text-primary relative"
        >
          <Bell className="h-4 w-4 mr-1" />
          Notificaciones
          {unreadCountToShow > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {unreadCountToShow > 99 ? '99+' : unreadCountToShow}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader className="space-y-4">
          <div className="flex items-center justify-between">
            <SheetTitle>Notificaciones</SheetTitle>
            {unreadCountToShow > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onMarkAllAsRead}
                className="text-sm"
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                Marcar todas leídas
              </Button>
            )}
          </div>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          {notificationsToShow.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No tienes notificaciones</p>
            </div>
          ) : (
            notificationsToShow.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 rounded-lg border transition-colors cursor-pointer hover:bg-gray-50 ${
                  notification.read 
                    ? 'bg-white border-gray-200' 
                    : 'bg-blue-50 border-blue-200'
                }`}
                onClick={() => {
                  if (!notification.read) {
                    onMarkAsRead(notification.id);
                  }
                }}
              >
                <div className="flex items-start space-x-3">
                  {getNotificationIcon(notification.type)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-sm font-medium truncate">
                        {notification.title}
                      </h4>
                      <Badge 
                        variant="secondary" 
                        className={`text-xs ${getNotificationBadgeColor(notification.type)}`}
                      >
                        {notification.type === 'response' && 'Respuesta'}
                        {notification.type === 'feedback' && 'Feedback'}
                        {notification.type === 'admin' && 'Admin'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {notification.message}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {notification.timestamp}
                    </p>
                  </div>
                  {!notification.read && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default NotificationPanel;