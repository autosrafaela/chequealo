import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { SquarePen, Loader2, ArrowLeft, AlertCircle, RefreshCw } from 'lucide-react';
import { WhatsAppChatList } from '@/components/chat/WhatsAppChatList';
import { WhatsAppChatView } from '@/components/chat/WhatsAppChatView';
import { useChat } from '@/hooks/useChat';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
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
  const [isProcessingChat, setIsProcessingChat] = useState(false);
  const [chatOpenError, setChatOpenError] = useState<string | null>(null);
  
  // Anti-loop guard: track last processed chatParam to prevent infinite retries
  const lastProcessedChatRef = useRef<string | null>(null);
  const processingRef = useRef(false);

  // Stable chat param from URL
  const chatParam = searchParams.get('chat');

  // Core logic to resolve and open chat - called once per unique chatParam
  const processChatParam = useCallback(async (param: string) => {
    if (!user?.id) {
      console.info('[Messages] No user, skipping chat param processing');
      return;
    }

    // Prevent concurrent processing
    if (processingRef.current) {
      console.info('[Messages] Already processing, skipping');
      return;
    }

    // Anti-loop: don't reprocess the same param that already failed
    if (lastProcessedChatRef.current === param && chatOpenError) {
      console.info('[Messages] Already tried this param and failed, waiting for retry');
      return;
    }

    processingRef.current = true;
    setIsProcessingChat(true);
    setChatOpenError(null);
    lastProcessedChatRef.current = param;

    console.info('[Messages] Processing chatParam:', param);

    try {
      // Step 1: Try to find as existing conversation ID
      const { data: existingConv, error: convError } = await supabase
        .from('conversations')
        .select('id')
        .eq('id', param)
        .maybeSingle();

      if (convError) {
        console.error('[Messages] Error checking conversation:', convError);
      }

      if (existingConv) {
        console.info('[Messages] Found as conversation ID:', existingConv.id);
        setSelectedConversationId(existingConv.id);
        setSearchParams({ chat: existingConv.id }, { replace: true });
        // Refresh conversations in background to ensure it's in the list
        refreshConversations();
        setIsProcessingChat(false);
        processingRef.current = false;
        return;
      }

      console.info('[Messages] Not a conversation ID, trying as professional...');

      // Step 2: Try to resolve as professional (by user_id first, then by id)
      let professionalId: string | null = null;

      // Try by user_id (in case chatParam is an auth.user id)
      const { data: profByUserId } = await supabase
        .from('professionals')
        .select('id')
        .eq('user_id', param)
        .maybeSingle();

      if (profByUserId) {
        professionalId = profByUserId.id;
        console.info('[Messages] Found professional by user_id:', professionalId);
      } else {
        // Try by professional.id
        const { data: profById } = await supabase
          .from('professionals')
          .select('id')
          .eq('id', param)
          .maybeSingle();

        if (profById) {
          professionalId = profById.id;
          console.info('[Messages] Found professional by id:', professionalId);
        }
      }

      if (!professionalId) {
        console.error('[Messages] Could not find professional or conversation for:', param);
        setChatOpenError('No se encontró el chat o profesional solicitado.');
        setIsProcessingChat(false);
        processingRef.current = false;
        return;
      }

      // Step 3: Check if conversation already exists with this professional
      const { data: existingConvWithProf } = await supabase
        .from('conversations')
        .select('id')
        .eq('professional_id', professionalId)
        .eq('user_id', user.id)
        .eq('status', 'active')
        .maybeSingle();

      if (existingConvWithProf) {
        console.info('[Messages] Found existing conversation:', existingConvWithProf.id);
        setSelectedConversationId(existingConvWithProf.id);
        setSearchParams({ chat: existingConvWithProf.id }, { replace: true });
        await refreshConversations();
        setIsProcessingChat(false);
        processingRef.current = false;
        return;
      }

      // Step 4: Create new conversation
      console.info('[Messages] Creating new conversation with professional:', professionalId);
      const newConversation = await createConversation(professionalId);
      
      if (newConversation) {
        console.info('[Messages] Created conversation:', newConversation.id);
        setSelectedConversationId(newConversation.id);
        setSearchParams({ chat: newConversation.id }, { replace: true });
      } else {
        console.error('[Messages] Failed to create conversation');
        setChatOpenError('No se pudo abrir la conversación. Intentá nuevamente.');
      }
    } catch (error) {
      console.error('[Messages] Error processing chat param:', error);
      setChatOpenError('Error al abrir el chat. Intentá nuevamente.');
    } finally {
      setIsProcessingChat(false);
      processingRef.current = false;
    }
  }, [user?.id, chatOpenError, createConversation, refreshConversations, setSearchParams]);

  // Handle retry button
  const handleRetry = useCallback(() => {
    if (chatParam) {
      setChatOpenError(null);
      lastProcessedChatRef.current = null;
      processChatParam(chatParam);
    }
  }, [chatParam, processChatParam]);

  // Process chat parameter from URL - only depends on stable values
  useEffect(() => {
    if (!chatParam || loading || !user?.id) return;
    
    // Skip if we already processed this exact param successfully
    if (lastProcessedChatRef.current === chatParam && !chatOpenError && selectedConversationId) {
      return;
    }
    
    // Skip if already processing
    if (processingRef.current) return;

    processChatParam(chatParam);
  }, [chatParam, loading, user?.id]); // Minimal dependencies - no callbacks

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
    setChatOpenError(null);
  };

  const handleBack = () => {
    setSelectedConversationId(null);
    setSearchParams({}, { replace: true });
    setChatOpenError(null);
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

  // Error state UI component
  const ErrorState = () => (
    <div className="flex flex-col items-center justify-center h-full gap-4 p-6 text-center">
      <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
        <AlertCircle className="h-8 w-8 text-destructive" />
      </div>
      <div className="space-y-2">
        <p className="text-foreground font-medium">{chatOpenError}</p>
        <p className="text-sm text-muted-foreground">
          Verificá que el enlace sea correcto o intentá nuevamente.
        </p>
      </div>
      <Button onClick={handleRetry} variant="default" className="gap-2">
        <RefreshCw className="h-4 w-4" />
        Reintentar
      </Button>
      <Button onClick={handleBack} variant="ghost" size="sm">
        Volver a la lista
      </Button>
    </div>
  );

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header - Mobile only when no chat selected, or always on desktop */}
      <header className={`shrink-0 flex items-center justify-between px-4 py-3 bg-primary text-primary-foreground ${selectedConversationId ? 'hidden md:flex' : 'flex'}`}>
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="text-primary-foreground hover:bg-primary-foreground/10 h-9 w-9"
            aria-label="Volver"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-semibold">Mensajes</h1>
        </div>
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
        <div className={`flex-1 ${selectedConversationId || isProcessingChat || chatOpenError ? 'block' : 'hidden md:block'}`}>
          {isProcessingChat ? (
            <div className="flex flex-col items-center justify-center h-full gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-muted-foreground">Abriendo conversación...</p>
            </div>
          ) : chatOpenError ? (
            <ErrorState />
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
