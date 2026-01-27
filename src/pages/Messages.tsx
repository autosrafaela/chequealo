import { useState, useMemo, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { SquarePen, Loader2 } from 'lucide-react';
import { WhatsAppChatList } from '@/components/chat/WhatsAppChatList';
import { WhatsAppChatView } from '@/components/chat/WhatsAppChatView';
import { useChat } from '@/hooks/useChat';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import type { Conversation, Message } from '@/types/chat';

const Messages = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const { 
    conversations, 
    messages: allMessages,
    loading, 
    sending,
    fetchMessages,
    sendMessage,
    deleteConversation,
    blockConversation,
    createConversation,
    refreshConversations
  } = useChat();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [isCreatingChat, setIsCreatingChat] = useState(false);

  // Handle chat parameter from URL (can be conversation_id or professional_id)
  const handleChatParam = useCallback(async (chatParam: string) => {
    if (!user || isCreatingChat) return;

    // First check if it's an existing conversation ID
    const existingConversation = conversations.find(c => c.id === chatParam);
    if (existingConversation) {
      setSelectedConversationId(chatParam);
      return;
    }

    // Check if it's a professional_id - try to find or create conversation
    setIsCreatingChat(true);
    try {
      // Check if a conversation already exists with this professional
      const { data: existingConv } = await supabase
        .from('conversations')
        .select('id')
        .eq('professional_id', chatParam)
        .eq('user_id', user.id)
        .eq('status', 'active')
        .maybeSingle();

      if (existingConv) {
        setSelectedConversationId(existingConv.id);
        // Update URL with correct conversation ID
        setSearchParams({ chat: existingConv.id }, { replace: true });
        await refreshConversations();
      } else {
        // Create new conversation with professional
        const newConversation = await createConversation(chatParam);
        if (newConversation) {
          setSelectedConversationId(newConversation.id);
          // Update URL with correct conversation ID
          setSearchParams({ chat: newConversation.id }, { replace: true });
        }
      }
    } catch (error) {
      console.error('Error handling chat param:', error);
      // If param is already a conversation ID that just doesn't exist in cache yet
      setSelectedConversationId(chatParam);
    } finally {
      setIsCreatingChat(false);
    }
  }, [user, conversations, isCreatingChat, createConversation, refreshConversations, setSearchParams]);

  // Process chat parameter from URL
  useEffect(() => {
    const chatParam = searchParams.get('chat');
    if (chatParam && !loading) {
      handleChatParam(chatParam);
    }
  }, [searchParams, loading, handleChatParam]);

  // Load messages when conversation is selected
  useEffect(() => {
    if (selectedConversationId) {
      fetchMessages(selectedConversationId);
    }
  }, [selectedConversationId, fetchMessages]);

  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) return conversations;
    
    const query = searchQuery.toLowerCase();
    return conversations.filter(conv => {
      const name = conv.professionals?.full_name || '';
      const profession = conv.professionals?.profession || '';
      return name.toLowerCase().includes(query) || profession.toLowerCase().includes(query);
    });
  }, [conversations, searchQuery]);

  const selectedConversation = useMemo(() => {
    if (!selectedConversationId) return null;
    return conversations.find(c => c.id === selectedConversationId) || null;
  }, [conversations, selectedConversationId]);

  const currentMessages = useMemo(() => {
    if (!selectedConversationId) return [];
    return (allMessages[selectedConversationId] || []) as Message[];
  }, [allMessages, selectedConversationId]);

  const handleChatSelect = (conversationId: string) => {
    setSelectedConversationId(conversationId);
    setSearchParams({ chat: conversationId }, { replace: true });
  };

  const handleBack = () => {
    setSelectedConversationId(null);
    setSearchParams({}, { replace: true });
  };

  const handleSendMessage = async (content: string, type?: string, file?: File) => {
    if (!selectedConversationId) return;
    await sendMessage(selectedConversationId, content, type || 'text', file);
  };

  const handleNewMessage = () => {
    navigate('/search');
  };

  const handleArchive = async () => {
    if (selectedConversationId) {
      await deleteConversation(selectedConversationId);
      setSelectedConversationId(null);
      setSearchParams({}, { replace: true });
    }
  };

  const handleBlock = async () => {
    if (selectedConversationId) {
      await blockConversation(selectedConversationId);
      setSelectedConversationId(null);
      setSearchParams({}, { replace: true });
    }
  };

  const handleCall = () => {
    const professional = selectedConversation?.professionals as { full_name: string; image_url?: string; profession?: string; phone?: string } | undefined;
    if (professional?.phone) {
      const cleanPhone = professional.phone.replace(/\D/g, '');
      window.open(`https://wa.me/${cleanPhone}`, '_blank');
    }
  };

  // Not logged in
  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center p-6">
          <p className="text-muted-foreground mb-4">Inicia sesión para ver tus mensajes</p>
          <button 
            onClick={() => navigate('/auth')}
            className="text-primary hover:underline"
          >
            Iniciar sesión
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header - Mobile only when no chat selected, or always on desktop */}
      <header className={`shrink-0 flex items-center justify-between px-4 py-3 bg-primary text-primary-foreground ${selectedConversationId ? 'hidden md:flex' : 'flex'}`}>
        <h1 className="text-xl font-semibold">Mensajes</h1>
        <button 
          onClick={handleNewMessage}
          className="p-2 hover:bg-primary-foreground/10 rounded-full transition-colors"
          aria-label="Nuevo mensaje"
        >
          <SquarePen className="h-5 w-5" />
        </button>
      </header>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Chat list - hidden on mobile when chat is selected */}
        <div className={`w-full md:w-96 md:border-r shrink-0 ${selectedConversationId ? 'hidden md:block' : 'block'}`}>
          <WhatsAppChatList
            conversations={filteredConversations as Conversation[]}
            loading={loading}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onChatSelect={handleChatSelect}
            currentChatId={selectedConversationId || undefined}
            currentUserId={user?.id}
          />
        </div>

        {/* Chat view - full width on mobile, or right side on desktop */}
        <div className={`flex-1 ${selectedConversationId ? 'block' : 'hidden md:block'}`}>
          {isCreatingChat ? (
            <div className="flex flex-col items-center justify-center h-full gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-muted-foreground">Abriendo conversación...</p>
            </div>
          ) : (
            <WhatsAppChatView
              conversation={selectedConversation as Conversation | null}
              messages={currentMessages}
              currentUserId={user?.id || ''}
              sending={sending}
              onBack={handleBack}
              onSendMessage={handleSendMessage}
              onCall={handleCall}
              onArchive={handleArchive}
              onBlock={handleBlock}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Messages;
