import { useState } from "react";
import { Check, ChevronDown, ChevronUp, Mail, Phone, Archive, MessageCircle, Calculator, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatDistanceToNow, format } from "date-fns";
import { es } from "date-fns/locale";
import type { ContactRequest } from "@/hooks/useContactRequests";

interface SimplifiedRequestListProps {
  requests: ContactRequest[];
  onContact: (requestId: string) => void;
  onArchive: (requestId: string) => void;
  onMarkAsRead?: (requestId: string) => void;
  onOpenChat?: (requestId: string) => void;
}

export const SimplifiedRequestList = ({
  requests,
  onContact,
  onArchive,
  onMarkAsRead,
  onOpenChat
}: SimplifiedRequestListProps) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const isUnread = (request: ContactRequest) => request.status === 'pending';

  const handleExpand = (request: ContactRequest) => {
    if (expandedId === request.id) {
      setExpandedId(null);
    } else {
      setExpandedId(request.id);
      if (isUnread(request) && onMarkAsRead) {
        onMarkAsRead(request.id);
      }
    }
  };

  const handleWhatsAppContact = (request: ContactRequest, e: React.MouseEvent) => {
    e.stopPropagation();
    const message = encodeURIComponent(
      `Hola ${request.name}! Recibí tu solicitud desde Chequealo. ¿En qué puedo ayudarte?`
    );
    window.open(`https://wa.me/${request.phone?.replace(/\D/g, '')}?text=${message}`, '_blank');
    onContact(request.id);
  };

  const getTypeIcon = (type: ContactRequest['type']) => {
    return type === 'contact' ? MessageCircle : Calculator;
  };

  const formatTimestamp = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffHours < 1) {
      return formatDistanceToNow(date, { addSuffix: true, locale: es });
    } else if (diffHours < 24) {
      return format(date, 'HH:mm', { locale: es });
    } else if (diffHours < 48) {
      return 'Ayer';
    } else {
      return format(date, 'dd/MM', { locale: es });
    }
  };

  if (requests.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <MessageCircle className="h-16 w-16 text-muted-foreground/40 mb-4" />
        <p className="text-lg font-medium text-foreground mb-2">
          No hay solicitudes
        </p>
        <p className="text-muted-foreground text-sm max-w-xs">
          Las solicitudes de contacto de clientes aparecerán aquí
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-border">
      {requests.map((request) => {
        const isExpanded = expandedId === request.id;
        const TypeIcon = getTypeIcon(request.type);
        const unread = isUnread(request);
        
        return (
          <div 
            key={request.id} 
            className={cn(
              "transition-colors",
              unread && "bg-primary/5 border-l-4 border-l-primary"
            )}
          >
            {/* Collapsed View */}
            <div
              onClick={() => handleExpand(request)}
              className="p-4 cursor-pointer hover:bg-accent/50 active:bg-accent transition-colors"
            >
              <div className="flex items-start gap-3">
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center">
                    <TypeIcon className="h-5 w-5 text-primary" />
                  </div>
                  {unread && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full border-2 border-background" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className={cn(
                        "text-sm truncate",
                        unread ? "font-semibold text-foreground" : "font-medium text-foreground"
                      )}>
                        {request.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {request.type === 'contact' ? 'Contacto' : 'Presupuesto'}
                        {request.service_type && ` · ${request.service_type}`}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatTimestamp(request.created_at)}
                    </span>
                  </div>

                  <p className={cn(
                    "text-sm mt-1 line-clamp-2",
                    unread ? "text-foreground" : "text-muted-foreground"
                  )}>
                    {request.message}
                  </p>
                </div>

                {/* Expand indicator */}
                <div className="flex-shrink-0 text-muted-foreground">
                  {isExpanded ? (
                    <ChevronUp className="h-5 w-5" />
                  ) : (
                    <ChevronDown className="h-5 w-5" />
                  )}
                </div>
              </div>
            </div>

            {/* Expanded View */}
            {isExpanded && (
              <div className="px-4 pb-4 pt-0 space-y-4 animate-in slide-in-from-top-2 duration-200">
                {/* Contact Info */}
                <div className="flex flex-wrap gap-2 text-sm">
                  <a 
                    href={`mailto:${request.email}`}
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-muted rounded-full hover:bg-muted/80 transition-colors"
                  >
                    <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-foreground truncate max-w-[200px]">{request.email}</span>
                  </a>

                  {request.phone && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-muted rounded-full">
                      <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-foreground">{request.phone}</span>
                    </span>
                  )}
                </div>

                {/* Budget Range */}
                {request.type === 'quote' && request.budget_range && (
                  <div className="text-sm px-3 py-2 bg-primary/10 rounded-lg">
                    <span className="font-medium text-muted-foreground">Presupuesto: </span>
                    <span className="text-primary font-semibold">{request.budget_range}</span>
                  </div>
                )}

                {/* Full Message */}
                <div className="bg-muted/50 rounded-lg p-3">
                  <p className="text-sm text-foreground whitespace-pre-wrap">
                    {request.message}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-2">
                  {request.phone && (
                    <Button
                      onClick={(e) => handleWhatsAppContact(request, e)}
                      className="flex-1 min-w-[140px] bg-green-500 hover:bg-green-600 text-white"
                      size="sm"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      WhatsApp
                    </Button>
                  )}
                  
                  {onOpenChat && (
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenChat(request.id);
                      }}
                      variant="outline"
                      className="flex-1 min-w-[140px]"
                      size="sm"
                    >
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Chat Interno
                    </Button>
                  )}

                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      onArchive(request.id);
                    }}
                    variant="ghost"
                    size="icon"
                    className="flex-shrink-0"
                    title="Cerrar solicitud"
                  >
                    <Archive className="h-4 w-4" />
                  </Button>
                </div>

                {/* Status Actions */}
                {request.status === 'pending' && (
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      onContact(request.id);
                    }}
                    variant="ghost"
                    size="sm"
                    className="w-full text-muted-foreground"
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Marcar como contactado
                  </Button>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
