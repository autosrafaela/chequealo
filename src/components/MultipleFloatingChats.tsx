import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useChat } from '@/hooks/useChat';
import { useAuth } from '@/contexts/AuthContext';
import { FloatingChatWindow } from './FloatingChatWindow';

interface OpenChat {
  id: string;
  conversationId: string;
  conversation: any;
  position: { bottom: number; right: number };
}

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
  }, [location.search, conversations, navigate]);

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

  const handleOpenChat = async (conversation: any) => {
    // Verificar si el chat ya está abierto
    const existingChat = openChats.find(chat => chat.conversationId === conversation.id);
    if (existingChat) {
      return;
    }

    // Enriquecer la conversación con relaciones si faltan (p.ej. al crear por contactRequest)
    let enriched = conversation;
    if (!conversation.professionals) {
      const fetched = await getConversationWithRelations(conversation.id);
      if (fetched) enriched = fetched;
    }

    // Calcular posición para el nuevo chat
    const baseRight = 24; // 6 * 4 = 24px (right-6)
    const chatWidth = 384 + 16; // w-96 + gap
    const newPosition = {
      bottom: 96, // Debajo del botón flotante
      right: baseRight + (openChats.length * chatWidth)
    };

    const newChat: OpenChat = {
      id: `chat-${Date.now()}`,
      conversationId: enriched.id,
      conversation: enriched,
      position: newPosition
    };

    setOpenChats(prev => [...prev, newChat]);
  };

  const handleCloseChat = (chatId: string) => {
    setOpenChats(prev => {
      const filtered = prev.filter(chat => chat.id !== chatId);
      // Reposicionar los chats restantes
      return filtered.map((chat, index) => ({
        ...chat,
        position: {
          bottom: 96,
          right: 24 + (index * 400)
        }
      }));
    });
  };

  const handleOpenConversationsList = () => {
    // Abrir la primera conversación si existe
    if (conversations.length > 0 && openChats.length === 0) {
      handleOpenChat(conversations[0]);
    }
  };

  if (!user || !canReceiveMessages) return null;

  return (
    <>
      {/* Botón flotante principal */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={handleOpenConversationsList}
          className="relative h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all"
          size="icon"
        >
          <MessageCircle className="h-6 w-6" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-6 w-6 flex items-center justify-center p-0 bg-red-500">
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </div>

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
