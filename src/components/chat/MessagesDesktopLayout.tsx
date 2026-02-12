import { useState, useMemo, useEffect, useRef } from 'react';
import { Search, SquarePen, Send, Paperclip, Smile, ArrowLeft } from 'lucide-react';
import { format, isToday, isYesterday, isThisWeek } from 'date-fns';
import { es } from 'date-fns/locale';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useChat } from '@/hooks/useChat';
import { useAuth } from '@/contexts/AuthContext';
import { MessageBubble } from './MessageBubble';
import { DateSeparator } from './DateSeparator';
import { ChatHeader } from './ChatHeader';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

interface MessagesDesktopLayoutProps {
  initialConversationId?: string;
  isProfessional?: boolean;
}

// Color mapping for professional categories
const categoryColors: Record<string, string> = {
  'Salud': 'bg-emerald-500',
  'Hogar': 'bg-blue-500',
  'Legal': 'bg-purple-500',
  'Tecnología': 'bg-orange-500',
  'Educación': 'bg-pink-500',
  'Belleza': 'bg-rose-500',
  'Finanzas': 'bg-slate-500',
  'Transporte': 'bg-amber-500',
  'Gastronomía': 'bg-red-500',
  'Arte': 'bg-indigo-500',
  'Deporte': 'bg-green-500',
  'Mascotas': 'bg-teal-500',
};

const getCategoryColor = (profession: string | undefined): string => {
  if (!profession) return 'bg-primary';
  
  const lowerProfession = profession.toLowerCase();
  
  if (lowerProfession.includes('médic') || lowerProfession.includes('doctor') || lowerProfession.includes('enferm') || lowerProfession.includes('salud')) {
    return categoryColors['Salud'];
  }
  if (lowerProfession.includes('plomer') || lowerProfession.includes('electric') || lowerProfession.includes('carpint') || lowerProfession.includes('pintor')) {
    return categoryColors['Hogar'];
  }
  if (lowerProfession.includes('abogad') || lowerProfession.includes('legal') || lowerProfession.includes('notari')) {
    return categoryColors['Legal'];
  }
  if (lowerProfession.includes('programad') || lowerProfession.includes('técnic') || lowerProfession.includes('reparaci') || lowerProfession.includes('tecnolog')) {
    return categoryColors['Tecnología'];
  }
  if (lowerProfession.includes('profeso') || lowerProfession.includes('tutor') || lowerProfession.includes('clase') || lowerProfession.includes('educac')) {
    return categoryColors['Educación'];
  }
  if (lowerProfession.includes('estilis') || lowerProfession.includes('peluqu') || lowerProfession.includes('manicur') || lowerProfession.includes('belleza')) {
    return categoryColors['Belleza'];
  }
  if (lowerProfession.includes('contador') || lowerProfession.includes('financ') || lowerProfession.includes('banco')) {
    return categoryColors['Finanzas'];
  }
  
  return 'bg-primary';
};

const getCategoryLabel = (profession: string | undefined): string => {
  if (!profession) return 'General';
  
  const lowerProfession = profession.toLowerCase();
  
  if (lowerProfession.includes('médic') || lowerProfession.includes('doctor') || lowerProfession.includes('enferm') || lowerProfession.includes('salud')) {
    return 'Salud';
  }
  if (lowerProfession.includes('plomer') || lowerProfession.includes('electric') || lowerProfession.includes('carpint') || lowerProfession.includes('pintor')) {
    return 'Hogar';
  }
  if (lowerProfession.includes('abogad') || lowerProfession.includes('legal') || lowerProfession.includes('notari')) {
    return 'Legal';
  }
  if (lowerProfession.includes('programad') || lowerProfession.includes('técnic') || lowerProfession.includes('reparaci') || lowerProfession.includes('tecnolog')) {
    return 'Tecnología';
  }
  if (lowerProfession.includes('profeso') || lowerProfession.includes('tutor') || lowerProfession.includes('clase') || lowerProfession.includes('educac')) {
    return 'Educación';
  }
  if (lowerProfession.includes('estilis') || lowerProfession.includes('peluqu') || lowerProfession.includes('manicur') || lowerProfession.includes('belleza')) {
    return 'Belleza';
  }
  if (lowerProfession.includes('contador') || lowerProfession.includes('financ') || lowerProfession.includes('banco')) {
    return 'Finanzas';
  }
  
  return 'General';
};

const formatTimestamp = (dateString: string | null): string => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  
  if (isToday(date)) {
    return format(date, 'h:mm a');
  }
  if (isYesterday(date)) {
    return 'Ayer';
  }
  if (isThisWeek(date)) {
    return format(date, 'EEE', { locale: es });
  }
  return format(date, 'd MMM', { locale: es });
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

export const MessagesDesktopLayout = ({ 
  initialConversationId, 
  isProfessional = false 
}: MessagesDesktopLayoutProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { 
    conversations, 
    messages, 
    loading, 
    sending,
    fetchMessages, 
    sendMessage,
    deleteConversation,
    blockConversation,
    getConversationWithRelations
  } = useChat();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(
    initialConversationId || null
  );
  const [selectedConversation, setSelectedConversation] = useState<any>(null);
  const [newMessage, setNewMessage] = useState('');
  const [showMobileChat, setShowMobileChat] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize with initial conversation
  useEffect(() => {
    if (initialConversationId) {
      setSelectedConversationId(initialConversationId);
      setShowMobileChat(true);
    }
  }, [initialConversationId]);

  // Load conversation details and messages when selected
  useEffect(() => {
    if (selectedConversationId) {
      fetchMessages(selectedConversationId);
      getConversationWithRelations(selectedConversationId).then(setSelectedConversation);
    }
  }, [selectedConversationId]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages[selectedConversationId || '']]);

  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) return conversations;
    
    const query = searchQuery.toLowerCase();
    return conversations.filter(conv => {
      const name = conv.professionals?.full_name || '';
      const profession = conv.professionals?.profession || '';
      return name.toLowerCase().includes(query) || profession.toLowerCase().includes(query);
    });
  }, [conversations, searchQuery]);

  const handleConversationClick = (conversationId: string) => {
    setSelectedConversationId(conversationId);
    setShowMobileChat(true);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversationId) return;
    
    await sendMessage(selectedConversationId, newMessage.trim());
    setNewMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleBack = () => {
    setShowMobileChat(false);
    setSelectedConversationId(null);
  };

  const handleClose = () => {
    setShowMobileChat(false);
    setSelectedConversationId(null);
  };

  const currentMessages = selectedConversationId ? messages[selectedConversationId] || [] : [];

  // Group messages by date
  const groupedMessages = useMemo(() => {
    const groups: { date: string; messages: typeof currentMessages }[] = [];
    let currentDate = '';
    
    currentMessages.forEach(msg => {
      const msgDate = format(new Date(msg.created_at), 'yyyy-MM-dd');
      if (msgDate !== currentDate) {
        currentDate = msgDate;
        groups.push({ date: msgDate, messages: [] });
      }
      groups[groups.length - 1].messages.push(msg);
    });
    
    return groups;
  }, [currentMessages]);

  // Conversation list component
  const ConversationList = () => (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Mensajes</h2>
          <button 
            onClick={() => navigate('/search')}
            className="p-2 hover:bg-muted rounded-full transition-colors"
            aria-label="Nuevo mensaje"
          >
            <SquarePen className="h-5 w-5" />
          </button>
        </div>
        
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar conversaciones..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-muted/50 border-0"
          />
        </div>
      </div>

      {/* Conversations List */}
      <ScrollArea className="flex-1">
        <div className="divide-y divide-border">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-48" />
                </div>
              </div>
            ))
          ) : filteredConversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <Search className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground text-center">
                {searchQuery ? 'No se encontraron conversaciones' : 'No tienes mensajes aún'}
              </p>
            </div>
          ) : (
            filteredConversations.map((conversation) => {
              const professionalInfo = conversation.professionals;
              const clientProfile = (conversation as any).profiles;
              const name = isProfessional 
                ? (clientProfile?.full_name || `Cliente de ${professionalInfo?.profession || 'consulta'}`)
                : (professionalInfo?.full_name || 'Profesional');
              const imageUrl = isProfessional 
                ? clientProfile?.avatar_url 
                : professionalInfo?.image_url;
              const profession = professionalInfo?.profession;
              const unreadCount = isProfessional 
                ? conversation.unread_count_professional 
                : conversation.unread_count_user;
              const hasUnread = (unreadCount || 0) > 0;
              const isSelected = selectedConversationId === conversation.id;
              
              return (
                <button
                  key={conversation.id}
                  onClick={() => handleConversationClick(conversation.id)}
                  className={cn(
                    "w-full flex items-center gap-3 p-4 transition-colors text-left",
                    isSelected ? "bg-primary/10" : "hover:bg-muted/50"
                  )}
                >
                  <Avatar className={`h-12 w-12 ${getCategoryColor(profession)}`}>
                    <AvatarImage src={imageUrl || undefined} alt={name} />
                    <AvatarFallback className="text-white font-medium">
                      {getInitials(name)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className={cn("truncate", hasUnread ? "font-bold" : "font-semibold")}>
                          {name}
                        </span>
                        <Badge 
                          variant="secondary" 
                          className="text-[10px] px-1.5 py-0 h-4 shrink-0 bg-muted text-muted-foreground"
                        >
                          {getCategoryLabel(profession)}
                        </Badge>
                      </div>
                      <span className={cn(
                        "text-xs shrink-0",
                        hasUnread ? "text-primary font-medium" : "text-muted-foreground"
                      )}>
                        {formatTimestamp(conversation.last_message_at)}
                      </span>
                    </div>
                    <p className={cn(
                      "text-sm truncate mt-0.5",
                      hasUnread ? "text-foreground font-medium" : "text-muted-foreground"
                    )}>
                      {conversation.last_message_preview || 'Sin mensajes'}
                    </p>
                  </div>
                  
                  {hasUnread && (
                    <div className="w-2.5 h-2.5 rounded-full bg-primary shrink-0" />
                  )}
                </button>
              );
            })
          )}
        </div>
      </ScrollArea>
    </div>
  );

  // Chat panel component
  const ChatPanel = () => (
    <div className="flex flex-col h-full bg-background">
      {selectedConversationId && selectedConversation ? (
        <>
          {/* Chat Header */}
          <ChatHeader
            conversation={selectedConversation}
            onBack={handleBack}
            onClose={handleClose}
            onArchive={() => deleteConversation(selectedConversationId)}
            onBlock={() => blockConversation(selectedConversationId)}
            showBackButton={showMobileChat}
          />

          {/* Messages Area */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {groupedMessages.map((group, groupIndex) => (
                <div key={groupIndex}>
                  <DateSeparator date={new Date(group.date)} />
                  <div className="space-y-2 mt-2">
                    {group.messages.map((message) => (
                      <MessageBubble
                        key={message.id}
                        message={message}
                        isOwn={message.sender_id === user?.id}
                      />
                    ))}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Message Input */}
          <div className="p-3 border-t bg-background">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="shrink-0">
                <Paperclip className="h-5 w-5" />
              </Button>
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Escribe un mensaje..."
                className="flex-1"
              />
              <Button variant="ghost" size="icon" className="shrink-0">
                <Smile className="h-5 w-5" />
              </Button>
              <Button 
                onClick={handleSendMessage} 
                disabled={!newMessage.trim() || sending}
                size="icon"
                className="shrink-0"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </>
      ) : (
        <div className="flex-1 flex items-center justify-center text-muted-foreground">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <Search className="h-8 w-8" />
            </div>
            <p>Selecciona una conversación para comenzar</p>
          </div>
        </div>
      )}
    </div>
  );

  // Mobile: Show list or chat
  // Desktop: Show both side by side
  return (
    <div className="h-[calc(100vh-200px)] min-h-[600px] border rounded-lg overflow-hidden bg-background">
      {/* Desktop Layout */}
      <div className="hidden md:flex h-full">
        {/* Left: Conversation List */}
        <div className="w-96 lg:w-[400px] border-r">
          <ConversationList />
        </div>
        
        {/* Right: Chat */}
        <div className="flex-1">
          <ChatPanel />
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden h-full">
        {showMobileChat ? (
          <ChatPanel />
        ) : (
          <ConversationList />
        )}
      </div>
    </div>
  );
};

export default MessagesDesktopLayout;
