import { Check, CheckCheck, MessageSquare, Search } from "lucide-react";
import { formatDistanceToNow, isToday, isYesterday, format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import type { Conversation, MessageStatus } from "@/types/chat";
import { getAvatarColor } from "@/utils/avatarColors";

interface WhatsAppChatListProps {
  conversations: Conversation[];
  loading: boolean;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onChatSelect: (conversationId: string) => void;
  currentChatId?: string;
  currentUserId?: string;
  isProfessional?: boolean;
}

const getStatusIcon = (isRead: boolean, isFromMe: boolean) => {
  if (!isFromMe) return null;
  
  return isRead ? (
    <CheckCheck className="h-4 w-4 text-blue-500" />
  ) : (
    <Check className="h-4 w-4 text-muted-foreground" />
  );
};

const formatTimestamp = (dateString: string | null): string => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  
  if (isToday(date)) {
    return format(date, 'HH:mm');
  }
  if (isYesterday(date)) {
    return 'Ayer';
  }
  return format(date, 'dd/MM/yy');
};

const getInitials = (name: string | undefined): string => {
  if (!name) return '?';
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

export const WhatsAppChatList = ({
  conversations,
  loading,
  searchQuery,
  onSearchChange,
  onChatSelect,
  currentChatId,
  currentUserId,
  isProfessional = false
}: WhatsAppChatListProps) => {

  if (loading) {
    return (
      <div className="flex flex-col h-full">
        {/* Search skeleton */}
        <div className="p-3 border-b">
          <Skeleton className="h-10 w-full rounded-full" />
        </div>
        
        {/* Loading items */}
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 p-4 border-b">
            <Skeleton className="h-12 w-12 rounded-full shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-48" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Search Bar */}
      <div className="p-3 border-b bg-background/95 backdrop-blur-sm">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar o empezar un chat"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 bg-muted/50 border-0 rounded-full h-10"
          />
        </div>
      </div>

      {/* Empty state */}
      {conversations.length === 0 && !loading && (
        <div className="flex-1 flex flex-col items-center justify-center p-8">
          <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
            <MessageSquare className="h-10 w-10 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-1">
            No hay conversaciones
          </h3>
          <p className="text-muted-foreground text-center text-sm">
            Tus mensajes con profesionales aparecerán aquí
          </p>
        </div>
      )}

      {/* Conversations list */}
      <div className="flex-1 overflow-y-auto">
        {conversations.map((conv) => {
          const professional = conv.professionals;
          const clientProfile = (conv as any).profiles;
          const name = isProfessional
            ? (clientProfile?.full_name || `Cliente de ${professional?.profession || 'consulta'}`)
            : (professional?.full_name || 'Usuario');
          const avatar = isProfessional
            ? clientProfile?.avatar_url
            : professional?.image_url;
          const unreadCount = isProfessional
            ? (conv.unread_count_professional || 0)
            : (conv.unread_count_user || 0);
          const hasUnread = unreadCount > 0;
          const isSelected = currentChatId === conv.id;
          
          return (
            <button
              key={conv.id}
              onClick={() => onChatSelect(conv.id)}
              className={cn(
                "w-full flex items-center gap-3 p-4 border-b transition-colors",
                "hover:bg-muted/50 active:bg-muted",
                isSelected && "bg-primary/10"
              )}
            >
              {/* Avatar */}
              <div className="relative shrink-0">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={avatar || undefined} alt={name} />
                  <AvatarFallback className={`${getAvatarColor(name)} text-white font-medium`}>
                    {getInitials(name)}
                  </AvatarFallback>
                </Avatar>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                {/* Name and timestamp row */}
                <div className="flex items-center justify-between gap-2">
                  <span className={cn(
                    "font-medium truncate",
                    hasUnread ? "text-foreground" : "text-foreground"
                  )}>
                    {name}
                  </span>
                  <span className={cn(
                    "text-xs shrink-0",
                    hasUnread ? "text-primary font-medium" : "text-muted-foreground"
                  )}>
                    {formatTimestamp(conv.last_message_at)}
                  </span>
                </div>

                {/* Service tag */}
                {professional?.profession && (
                  <span className="text-xs text-muted-foreground">
                    {professional.profession}
                  </span>
                )}

                {/* Last message row */}
                <div className="flex items-center justify-between gap-2 mt-0.5">
                  <div className="flex items-center gap-1 min-w-0 flex-1">
                    {getStatusIcon(true, false)}
                    <span className={cn(
                      "text-sm truncate",
                      hasUnread ? "text-foreground font-medium" : "text-muted-foreground"
                    )}>
                      {conv.last_message_preview || 'Sin mensajes'}
                    </span>
                  </div>

                  {/* Unread badge */}
                  {hasUnread && (
                    <span className="shrink-0 min-w-5 h-5 px-1.5 flex items-center justify-center text-xs font-bold bg-primary text-primary-foreground rounded-full">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
