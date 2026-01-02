import { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { MessageCircle, ChevronDown, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useChat } from '@/hooks/useChat';
import { useAuth } from '@/contexts/AuthContext';
import { FloatingChatWindow } from './FloatingChatWindow';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface OpenChat {
  id: string;
  conversationId: string;
  conversation: any;
  position: { bottom: number; right: number };
}

const STORAGE_KEY = 'chequealo-open-chats';

export const MultipleFloatingChats = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const {
    conversations,
    canReceiveMessages,
    openConversationByContactRequest,
    getConversationWithRelations
  } = useChat();

  const [openChats, setOpenChats] = useState<OpenChat[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showConversationsList, setShowConversationsList] = useState(false);
  const [isWidgetHidden, setIsWidgetHidden] = useState(false);

  // Restaurar chats abiertos desde localStorage al montar
  useEffect(() => {
    if (!user || conversations.length === 0) return;
    
    const savedChatsJson = localStorage.getItem(STORAGE_KEY);
    if (savedChatsJson) {
      try {
        const savedChatIds: string[] = JSON.parse(savedChatsJson);
        // Restaurar solo conversaciones que aún existen
        const chatsToRestore = savedChatIds
          .map(id => conversations.find(c => c.id === id))
          .filter(Boolean);
        
        if (chatsToRestore.length > 0) {
          const restoredChats: OpenChat[] = chatsToRestore.map((conv, index) => ({
            id: `chat-${conv.id}`,
            conversationId: conv.id,
            conversation: conv,
            position: {
              bottom: 160,
              right: 24 + (index * 400)
            }
          }));
          setOpenChats(restoredChats);
        }
      } catch (e) {
        console.error('Error restoring chats from localStorage:', e);
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, [user, conversations.length > 0 ? conversations[0]?.id : null]);

  // Guardar chats abiertos en localStorage cuando cambian
  useEffect(() => {
    if (openChats.length > 0) {
      const chatIds = openChats.map(chat => chat.conversationId);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(chatIds));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [openChats]);

  // Detectar parámetros de URL para abrir chat automáticamente
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    const conversationId = params.get('conversation');
    const contactRequestId = params.get('contactRequestId');
    
    if (tab === 'messages') {
      if (conversationId && conversations.length > 0) {
        const conversation = conversations.find(c => c.id === conversationId);
        if (conversation) {
          handleOpenChat(conversation);
          clearUrlParams();
        }
      } else if (contactRequestId) {
        openConversationByContactRequest(contactRequestId).then(conv => {
          if (conv) {
            handleOpenChat(conv);
            clearUrlParams();
          }
        });
      }
    }
  }, [location.search, conversations]);

  const clearUrlParams = () => {
    const newParams = new URLSearchParams(location.search);
    newParams.delete('tab');
    newParams.delete('conversation');
    newParams.delete('contactRequestId');
    navigate({ search: newParams.toString() }, { replace: true });
  };

  // Calcular mensajes no leídos
  useEffect(() => {
    const total = conversations.reduce((acc, conv) => {
      return acc + (conv.unread_count_user || 0);
    }, 0);
    setUnreadCount(total);
  }, [conversations]);

  const handleOpenChat = useCallback(async (conversation: any) => {
    // Verificar si el chat ya está abierto
    const existingChat = openChats.find(chat => chat.conversationId === conversation.id);
    if (existingChat) {
      // Si ya está abierto, cerrar la lista
      setShowConversationsList(false);
      return;
    }

    // Enriquecer la conversación con relaciones si faltan
    let enriched = conversation;
    if (!conversation.professionals) {
      const fetched = await getConversationWithRelations(conversation.id);
      if (fetched) enriched = fetched;
    }

    // Calcular posición para el nuevo chat
    const baseRight = 24;
    const chatWidth = 400;
    const newPosition = {
      bottom: 160,
      right: baseRight + (openChats.length * chatWidth)
    };

    const newChat: OpenChat = {
      id: `chat-${enriched.id}`,
      conversationId: enriched.id,
      conversation: enriched,
      position: newPosition
    };

    setOpenChats(prev => [...prev, newChat]);
    setShowConversationsList(false);
  }, [openChats, getConversationWithRelations]);

  const handleCloseChat = useCallback((chatId: string) => {
    setOpenChats(prev => {
      const filtered = prev.filter(chat => chat.id !== chatId);
      // Reposicionar los chats restantes
      return filtered.map((chat, index) => ({
        ...chat,
        position: {
          bottom: 160,
          right: 24 + (index * 400)
        }
      }));
    });
  }, []);

  const getInitials = (name: string) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';
  };

  const formatMessageTime = (timestamp: string) => {
    return formatDistanceToNow(new Date(timestamp), { addSuffix: true, locale: es });
  };

  if (!user || !canReceiveMessages) return null;

  return (
    <>
      {/* Botón minimizado para restaurar el widget */}
      {isWidgetHidden && (
        <button
          onClick={() => setIsWidgetHidden(false)}
          className="fixed bottom-20 right-6 z-50 h-10 w-10 rounded-full bg-primary shadow-lg hover:shadow-xl transition-all flex items-center justify-center"
          title="Abrir mensajes"
        >
          <MessageCircle className="h-5 w-5 text-primary-foreground" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-red-500">
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </button>
      )}

      {/* Botón flotante principal con lista de conversaciones */}
      {!isWidgetHidden && (
        <div className="fixed bottom-20 right-6 z-50">
          {/* Lista de conversaciones desplegable */}
          {showConversationsList && (
            <div className="absolute bottom-16 right-0 w-80 bg-background border rounded-lg shadow-2xl overflow-hidden mb-2">
              <div className="p-3 border-b bg-primary text-primary-foreground flex items-center justify-between">
                <h3 className="font-semibold text-sm">Conversaciones</h3>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setShowConversationsList(false);
                      setIsWidgetHidden(true);
                    }}
                    className="h-6 w-6 text-primary-foreground hover:bg-primary/90"
                    title="Ocultar chat"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowConversationsList(false)}
                    className="h-6 w-6 text-primary-foreground hover:bg-primary/90"
                  >
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <ScrollArea className="max-h-80">
                {conversations.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground">
                    <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No hay conversaciones</p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {conversations.map((conv) => {
                      const isOpen = openChats.some(c => c.conversationId === conv.id);
                      return (
                        <div
                          key={conv.id}
                          className={`p-3 cursor-pointer hover:bg-muted/50 transition-colors flex items-center gap-3 ${isOpen ? 'bg-muted/30' : ''}`}
                          onClick={() => handleOpenChat(conv)}
                        >
                          <Avatar className="h-10 w-10 flex-shrink-0">
                            <AvatarImage src={conv.professionals?.image_url} />
                            <AvatarFallback className="text-xs">
                              {getInitials(conv.professionals?.full_name || 'U')}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-0.5">
                              <h4 className="font-semibold text-sm truncate uppercase">
                                {conv.professionals?.full_name || 'Usuario'}
                              </h4>
                              {conv.last_message_at && (
                                <span className="text-xs text-muted-foreground flex-shrink-0 ml-2">
                                  {formatMessageTime(conv.last_message_at)}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center justify-between">
                              <p className="text-xs text-muted-foreground truncate">
                                {conv.last_message_preview || 'Sin mensajes'}
                              </p>
                              {conv.unread_count_user > 0 && (
                                <Badge className="ml-2 h-5 min-w-5 flex items-center justify-center p-0 text-xs bg-primary flex-shrink-0">
                                  {conv.unread_count_user}
                                </Badge>
                              )}
                            </div>
                          </div>
                          {isOpen && (
                            <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0" title="Chat abierto" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </ScrollArea>
            </div>
          )}

          {/* Botón principal con X para ocultar */}
          <div className="flex items-center gap-2">
            {!showConversationsList && (
              <button
                onClick={() => setIsWidgetHidden(true)}
                className="h-8 w-8 rounded-full bg-background border shadow-md hover:bg-muted transition-colors flex items-center justify-center"
                title="Ocultar mensajes"
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            )}
            <Button
              onClick={() => setShowConversationsList(!showConversationsList)}
              className="relative h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all"
              size="icon"
            >
              {showConversationsList ? (
                <ChevronDown className="h-6 w-6" />
              ) : (
                <MessageCircle className="h-6 w-6" />
              )}
              {unreadCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-6 w-6 flex items-center justify-center p-0 bg-red-500">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </Badge>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Ventanas de chat flotantes */}
      {openChats.map(chat => (
        <FloatingChatWindow
          key={chat.id}
          conversation={chat.conversation}
          position={chat.position}
          onClose={() => handleCloseChat(chat.id)}
          onOpenNewChat={handleOpenChat}
          allConversations={conversations}
        />
      ))}
    </>
  );
};
