import { ArrowLeft, Phone, MoreVertical, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

interface ChatHeaderProps {
  conversation: {
    professionals?: {
      full_name: string;
      image_url?: string;
      profession?: string;
      phone?: string;
    };
    profiles?: {
      full_name: string;
      avatar_url?: string;
    };
    contact_requests?: {
      service_type?: string;
      type?: string;
    };
    status?: string;
  } | null;
  isProfessional?: boolean;
  isOnline?: boolean;
  lastSeen?: string;
  onBack: () => void;
  onClose: () => void;
  onArchive?: () => void;
  onBlock?: () => void;
  showBackButton?: boolean;
}

export const ChatHeader = ({
  conversation,
  isProfessional = false,
  isOnline = false,
  lastSeen,
  onBack,
  onClose,
  onArchive,
  onBlock,
  showBackButton = true
}: ChatHeaderProps) => {
  const professional = conversation?.professionals;
  const clientProfile = conversation?.profiles;
  const contactRequest = conversation?.contact_requests;

  // Dynamic identity: show client name for professionals, professional name for clients
  const displayName = isProfessional
    ? (clientProfile?.full_name || `Cliente de ${professional?.profession || 'consulta'}`)
    : (professional?.full_name || 'Usuario');
  
  const displayImage = isProfessional
    ? clientProfile?.avatar_url
    : professional?.image_url;

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getStatusText = () => {
    if (isOnline) return 'En línea';
    if (lastSeen) {
      const lastSeenDate = new Date(lastSeen);
      const now = new Date();
      const diffMinutes = Math.floor((now.getTime() - lastSeenDate.getTime()) / 60000);
      if (diffMinutes < 5) return 'En línea';
      if (diffMinutes < 60) return `Activo hace ${diffMinutes} min`;
      if (diffMinutes < 1440) return `Activo hace ${Math.floor(diffMinutes / 60)}h`;
      return 'Desconectado';
    }
    return conversation?.status === 'active' ? 'Activo' : 'Inactivo';
  };

  const handleCall = () => {
    if (professional?.phone) {
      const cleanPhone = professional.phone.replace(/\D/g, '');
      window.open(`https://wa.me/${cleanPhone}`, '_blank');
    }
  };

  return (
    <div className="p-3 border-b flex items-center justify-between bg-primary text-primary-foreground">
      <div className="flex items-center gap-2">
        {showBackButton && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="text-primary-foreground hover:bg-primary/90 h-8 w-8"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
        )}

        <Avatar className="h-9 w-9 border-2 border-primary-foreground/20">
          <AvatarImage src={displayImage} />
          <AvatarFallback className="bg-primary-foreground/20 text-primary-foreground text-xs">
            {getInitials(displayName)}
          </AvatarFallback>
        </Avatar>

        <div className="flex flex-col">
          <span className="font-semibold text-sm leading-tight">
            {displayName}
          </span>
          {contactRequest?.service_type ? (
            <span className="text-xs text-primary-foreground/70 leading-tight">
              Interesado en: {contactRequest.service_type}
            </span>
          ) : (
            <span className="text-xs text-primary-foreground/70 leading-tight">
              {professional?.profession && !isProfessional && (
                <span>{professional.profession} • </span>
              )}
              <span className={isOnline ? 'text-green-300' : ''}>
                {getStatusText()}
              </span>
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1">
        {professional?.phone && !isProfessional && (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleCall}
            className="text-primary-foreground hover:bg-primary/90 h-8 w-8"
          >
            <Phone className="h-4 w-4" />
          </Button>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="text-primary-foreground hover:bg-primary/90 h-8 w-8"
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {onArchive && (
              <DropdownMenuItem onClick={onArchive}>
                Archivar conversación
              </DropdownMenuItem>
            )}
            {onBlock && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onBlock} className="text-destructive">
                  Bloquear
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="text-primary-foreground hover:bg-primary/90 h-8 w-8"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
