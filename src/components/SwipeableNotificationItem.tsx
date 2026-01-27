import { useState, useRef, useCallback } from 'react';
import { Check, Clock, Trash2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface SwipeableNotificationItemProps {
  notification: {
    id: string;
    title: string;
    message: string;
    type: string;
    created_at: string;
    read: boolean;
    action_url?: string;
    isUpdate?: boolean;
    isPlatformUpdate?: boolean;
    typeLabel?: string;
    typeColor?: string;
    link?: string;
  };
  icon: React.ReactNode;
  onDelete: (id: string) => void;
  onMarkAsRead: (id: string) => void;
  onClick: () => void;
  isUpdating?: boolean;
  onUpdateClick?: (e: React.MouseEvent) => void;
  onShowBanner?: (e: React.MouseEvent) => void;
}

const SwipeableNotificationItem = ({
  notification,
  icon,
  onDelete,
  onMarkAsRead,
  onClick,
  isUpdating = false,
  onUpdateClick,
  onShowBanner
}: SwipeableNotificationItemProps) => {
  const [translateX, setTranslateX] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const startX = useRef(0);
  const currentX = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const SWIPE_THRESHOLD = 80;

  const formatTime = (dateString: string) => {
    const now = new Date();
    const notificationTime = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - notificationTime.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Ahora';
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;
    return `${Math.floor(diffInMinutes / 1440)}d`;
  };

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (notification.isUpdate || notification.isPlatformUpdate) return; // Don't allow swipe on special notifications
    startX.current = e.touches[0].clientX;
    currentX.current = e.touches[0].clientX;
  }, [notification.isUpdate, notification.isPlatformUpdate]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (notification.isUpdate || notification.isPlatformUpdate) return;
    currentX.current = e.touches[0].clientX;
    const diff = startX.current - currentX.current;
    
    // Only allow swiping right (negative translateX means swipe left, positive means swipe right)
    // We want swipe right to delete, so diff should be negative
    const swipeAmount = Math.max(0, -diff);
    setTranslateX(Math.min(swipeAmount, 120));
  }, [notification.isUpdate, notification.isPlatformUpdate]);

  const handleTouchEnd = useCallback(() => {
    if (notification.isUpdate || notification.isPlatformUpdate) return;
    
    if (translateX > SWIPE_THRESHOLD) {
      // Trigger delete animation
      setIsDeleting(true);
      setTimeout(() => {
        onDelete(notification.id);
      }, 300);
    } else {
      // Reset position
      setTranslateX(0);
    }
  }, [translateX, notification.id, notification.isUpdate, notification.isPlatformUpdate, onDelete]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (notification.isUpdate || notification.isPlatformUpdate) return;
    startX.current = e.clientX;
    currentX.current = e.clientX;
    
    const handleMouseMove = (moveEvent: MouseEvent) => {
      currentX.current = moveEvent.clientX;
      const diff = startX.current - currentX.current;
      const swipeAmount = Math.max(0, -diff);
      setTranslateX(Math.min(swipeAmount, 120));
    };
    
    const handleMouseUp = () => {
      if (translateX > SWIPE_THRESHOLD) {
        setIsDeleting(true);
        setTimeout(() => {
          onDelete(notification.id);
        }, 300);
      } else {
        setTranslateX(0);
      }
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [notification.id, notification.isUpdate, notification.isPlatformUpdate, onDelete, translateX]);

  return (
    <div 
      ref={containerRef}
      className={cn(
        "relative overflow-hidden transition-all duration-300",
        isDeleting && "opacity-0 h-0"
      )}
    >
      {/* Delete background (visible when swiping) */}
      <div 
        className={cn(
          "absolute inset-y-0 left-0 flex items-center justify-start px-4 bg-destructive transition-opacity",
          translateX > 0 ? "opacity-100" : "opacity-0"
        )}
        style={{ width: `${Math.min(translateX, 120)}px` }}
      >
        <Trash2 className="h-5 w-5 text-destructive-foreground" />
      </div>
      
      {/* Notification content */}
      <div
        className={cn(
          "p-3 cursor-pointer transition-all border-b bg-background",
          !notification.read ? 'bg-muted/50' : '',
          notification.isUpdate ? 'border-l-2 border-primary bg-primary/5' : '',
          notification.isPlatformUpdate ? 'border-l-2 border-primary bg-primary/5' : ''
        )}
        style={{ 
          transform: `translateX(${translateX}px)`,
          transition: translateX === 0 ? 'transform 0.2s ease-out' : 'none'
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onClick={onClick}
      >
        <div className="flex items-start gap-3 w-full">
          <div className="flex-shrink-0 mt-0.5">
            {icon}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className={cn(
                "text-sm font-medium truncate",
                !notification.read ? 'text-foreground' : 'text-muted-foreground'
              )}>
                {notification.title}
              </h4>
              {!notification.read && (
                <div className={cn(
                  "w-2 h-2 rounded-full flex-shrink-0",
                  notification.isUpdate || notification.isPlatformUpdate ? 'bg-primary' : 'bg-primary'
                )} />
              )}
            </div>
            
            {/* Platform update type badge */}
            {notification.isPlatformUpdate && notification.typeLabel && (
              <Badge className={cn("text-xs mb-1 w-fit", notification.typeColor)}>
                {notification.typeLabel}
              </Badge>
            )}
            
            <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
              {notification.message}
            </p>
            
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatTime(notification.created_at)}
              </span>
              
              {notification.isUpdate ? (
                <div className="flex gap-1">
                  <Button
                    variant="default"
                    size="sm"
                    onClick={onUpdateClick}
                    disabled={isUpdating}
                    className="text-xs h-6 px-2"
                  >
                    <RefreshCw className={cn("h-3 w-3 mr-1", isUpdating && 'animate-spin')} />
                    {isUpdating ? 'Actualizando...' : 'Actualizar'}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onShowBanner}
                    className="text-xs h-6 px-2"
                  >
                    Ver banner
                  </Button>
                </div>
              ) : !notification.read && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onMarkAsRead(notification.id);
                  }}
                  className="text-xs h-6 px-2"
                >
                  <Check className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Swipe hint on mobile */}
      {!notification.isUpdate && !notification.isPlatformUpdate && translateX === 0 && (
        <div className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground opacity-30 pointer-events-none md:hidden">
          ← desliza
        </div>
      )}
    </div>
  );
};

export default SwipeableNotificationItem;
