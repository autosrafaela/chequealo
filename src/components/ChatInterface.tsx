import { useState, useEffect, useRef } from 'react';
import { useChat } from '@/hooks/useChat';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  Send, 
  Search, 
  MoreVertical,
  ArrowLeft,
  Paperclip,
  Image as ImageIcon
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface ChatInterfaceProps {
  initialConversationId?: string;
}

const ChatInterface = ({ initialConversationId }: ChatInterfaceProps) => {
  const { user } = useAuth();
  const {
    conversations,
    messages,
    activeConversationId,
    loading,
    sending,
    fetchMessages,
    sendMessage,
    setActiveConversationId
  } = useChat();

  const [messageText, setMessageText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [selectedConversation, setSelectedConversation] = useState<any>(null);

  // Abrir conversación inicial si se proporciona
  useEffect(() => {
    if (initialConversationId && conversations.length > 0) {
      const conv = conversations.find(c => c.id === initialConversationId);
      if (conv) {
        handleConversationClick(conv);
      }
    }
  }, [initialConversationId, conversations]);

  // Auto scroll al final de mensajes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleConversationClick = async (conversation: any) => {
    setSelectedConversation(conversation);
    setActiveConversationId(conversation.id);
    await fetchMessages(conversation.id);
  };

  const handleSendMessage = async () => {
    if (!messageText.trim() || !activeConversationId) return;

    await sendMessage(activeConversationId, messageText, 'text');
    setMessageText('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const filteredConversations = conversations.filter(conv => {
    const otherParticipant = conv.professionals?.full_name || '';
    return otherParticipant.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatMessageTime = (timestamp: string) => {
    return formatDistanceToNow(new Date(timestamp), {
      addSuffix: true,
      locale: es
    });
  };

  return (
    <div className="flex h-[calc(100vh-200px)] bg-background rounded-lg border overflow-hidden">
      {/* Lista de conversaciones - Sidebar */}
      <div className="w-full md:w-96 border-r flex flex-col">
        <div className="p-4 border-b">
          <h2 className="text-xl font-semibold mb-3">Mensajes</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar conversaciones..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <ScrollArea className="flex-1">
          {loading ? (
            <div className="p-4 text-center text-muted-foreground">
              Cargando conversaciones...
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              <p>No hay conversaciones</p>
            </div>
          ) : (
            <div className="divide-y">
              {filteredConversations.map((conversation) => (
                <div
                  key={conversation.id}
                  onClick={() => handleConversationClick(conversation)}
                  className={`p-4 cursor-pointer hover:bg-muted/50 transition-colors ${
                    selectedConversation?.id === conversation.id ? 'bg-muted' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={conversation.professionals?.image_url} />
                      <AvatarFallback>
                        {getInitials(conversation.professionals?.full_name || 'Usuario')}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-sm truncate">
                          {conversation.professionals?.full_name || 'Usuario'}
                        </h3>
                        {conversation.last_message_at && (
                          <span className="text-xs text-muted-foreground">
                            {formatMessageTime(conversation.last_message_at)}
                          </span>
                        )}
                      </div>
                      
                      <p className="text-sm text-muted-foreground truncate">
                        {conversation.last_message_preview || 'Sin mensajes'}
                      </p>
                      
                      {conversation.unread_count_user > 0 && (
                        <Badge className="mt-1 bg-primary text-primary-foreground">
                          {conversation.unread_count_user}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Área de chat */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Header del chat */}
            <div className="p-4 border-b flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  className="md:hidden"
                  onClick={() => setSelectedConversation(null)}
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                
                <Avatar className="h-10 w-10">
                  <AvatarImage src={selectedConversation.professionals?.image_url} />
                  <AvatarFallback>
                    {getInitials(selectedConversation.professionals?.full_name || 'Usuario')}
                  </AvatarFallback>
                </Avatar>
                
                <div>
                  <h3 className="font-semibold">
                    {selectedConversation.professionals?.full_name || 'Usuario'}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {selectedConversation.status === 'active' ? 'Activo' : 'Inactivo'}
                  </p>
                </div>
              </div>

              <Button variant="ghost" size="sm">
                <MoreVertical className="h-5 w-5" />
              </Button>
            </div>

            {/* Mensajes */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages[activeConversationId]?.map((message) => {
                  const isOwn = message.sender_id === user?.id;
                  
                  return (
                    <div
                      key={message.id}
                      className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                          isOwn
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        }`}
                      >
                        <p className="text-sm break-words">{message.content}</p>
                        <span className={`text-xs mt-1 block ${
                          isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'
                        }`}>
                          {new Date(message.created_at).toLocaleTimeString('es-AR', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Input de mensaje */}
            <div className="p-4 border-t">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" disabled>
                  <Paperclip className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="sm" disabled>
                  <ImageIcon className="h-5 w-5" />
                </Button>
                
                <Input
                  placeholder="Escribe un mensaje..."
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={sending}
                  className="flex-1"
                />
                
                <Button
                  onClick={handleSendMessage}
                  disabled={!messageText.trim() || sending}
                  size="sm"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <Send className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">Selecciona una conversación</p>
              <p className="text-sm">Elige una conversación para empezar a chatear</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatInterface;
