import { RefreshCw, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface UpdateNotificationBannerProps {
  onUpdate: () => void;
  isUpdating: boolean;
}

export const UpdateNotificationBanner = ({ onUpdate, isUpdating }: UpdateNotificationBannerProps) => {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] bg-primary text-primary-foreground py-2 px-4 shadow-lg animate-in slide-in-from-top duration-300">
      <div className="container mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <RefreshCw className={`h-5 w-5 ${isUpdating ? 'animate-spin' : ''}`} />
          <span className="text-sm font-medium">
            ¡Nueva versión disponible!
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={onUpdate}
            disabled={isUpdating}
            className="text-xs h-7"
          >
            {isUpdating ? 'Actualizando...' : 'Actualizar ahora'}
          </Button>
          
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setDismissed(true)}
            className="h-7 w-7 text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
