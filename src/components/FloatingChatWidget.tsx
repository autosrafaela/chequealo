import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { MessageCircle, Send, Paperclip, Image as ImageIcon, Mic, MicOff, PlusCircle, Smile, Receipt } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useChat } from '@/hooks/useChat';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { ChatHeader } from './chat/ChatHeader';
import { MessageBubble } from './chat/MessageBubble';
import { DateSeparator } from './chat/DateSeparator';
import { ChatQuoteCard } from './chat/ChatQuoteCard';
import { CreateQuoteModal } from './chat/CreateQuoteModal';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

export const FloatingChatWidget = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const {
    conversations,
    messages,
    activeConversationId,
    sending,
    fetchMessages,
    sendMessage,
    setActiveConversationId,
    openConversationByContactRequest,
    deleteConversation,
    blockConversation,
    canReceiveMessages
  } = useChat();

  const [isOpen, setIsOpen] = useState(false);
  const [showConversationList, setShowConversationList] = useState(true);
  const [messageText, setMessageText] = useState('');
  const [selectedConversation, setSelectedConversation] = useState<any>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [transcribeAudio, setTranscribeAudio] = useState(true);
  const [isProfessional, setIsProfessional] = useState(false);
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [quotes, setQuotes] = useState<any[]>([]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Check if user is professional
  useEffect(() => {
    const checkProfessional = async () => {
      if (!user) return;
      const { data } = await supabase
        .from('professionals')
        .select('id')
        .eq('user_id', user.id)
        .single();
      setIsProfessional(!!data);
    };
    checkProfessional();
  }, [user]);

  // Fetch quotes for active conversation
  useEffect(() => {
    const fetchQuotes = async () => {
      if (!activeConversationId) return;
      const { data } = await supabase
        .from('chat_quotes')
        .select('*')
        .eq('conversation_id', activeConversationId)
        .order('created_at', { ascending: true });
      setQuotes(data || []);
    };
    fetchQuotes();
  }, [activeConversationId, messages]);

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
          setIsOpen(true);
          handleOpenConversation(conversation);
          const newParams = new URLSearchParams(location.search);
          newParams.delete('tab');
          newParams.delete('conversation');
          navigate({ search: newParams.toString() }, { replace: true });
        }
      } else if (contactRequestId) {
        openConversationByContactRequest(contactRequestId).then(conv => {
          if (conv) {
            setIsOpen(true);
            handleOpenConversation(conv);
            const newParams = new URLSearchParams(location.search);
            newParams.delete('tab');
            newParams.delete('contactRequestId');
            navigate({ search: newParams.toString() }, { replace: true });
          }
        });
      }
    }
  }, [location.search, conversations, navigate]);

  // Calcular mensajes no leídos según tipo de usuario
  useEffect(() => {
    const total = conversations.reduce((acc, conv) => {
      const unreadField = isProfessional ? 'unread_count_professional' : 'unread_count_user';
      return acc + ((conv as any)[unreadField] || 0);
    }, 0);
    setUnreadCount(total);
  }, [conversations, isProfessional]);

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeConversationId]);

  const handleOpenConversation = async (conversation: any) => {
    setSelectedConversation(conversation);
    setActiveConversationId(conversation.id);
    setShowConversationList(false);
    await fetchMessages(conversation.id);
  };

  const handleBackToList = () => {
    setShowConversationList(true);
    setSelectedConversation(null);
    setActiveConversationId(null);
  };


  const handleSendMessage = async () => {
    if ((!messageText.trim() && !selectedFile) || !activeConversationId) return;

    const messageType = selectedFile ? (selectedFile.type.startsWith('image/') ? 'image' : 'file') : 'text';
    
    await sendMessage(
      activeConversationId, 
      messageText || (selectedFile ? `Archivo: ${selectedFile.name}` : ''),
      messageType,
      selectedFile || undefined
    );
    
    setMessageText('');
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => setPreviewUrl(reader.result as string);
        reader.readAsDataURL(file);
      } else {
        setPreviewUrl(null);
      }
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (imageInputRef.current) imageInputRef.current.value = '';
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      
      audioChunksRef.current = [];
      
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        
        if (transcribeAudio) {
          await transcribeAndSend(audioBlob);
        } else {
          await sendAudioDirect(audioBlob);
        }
        
        stream.getTracks().forEach(track => track.stop());
      };
      
      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('No se pudo acceder al micrófono');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
      setIsRecording(false);
      setMediaRecorder(null);
    }
  };

  const sendAudioDirect = async (audioBlob: Blob) => {
    if (!activeConversationId) return;
    try {
      const audioFile = new File([audioBlob], `audio-${Date.now()}.webm`, { type: 'audio/webm' });
      await sendMessage(activeConversationId, '🎤 Mensaje de voz', 'audio', audioFile);
    } catch (error) {
      console.error('Error sending audio:', error);
      alert('Error al enviar el audio');
    }
  };

  const transcribeAndSend = async (audioBlob: Blob) => {
    if (!activeConversationId) return;
    try {
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      reader.onloadend = async () => {
        const base64Audio = (reader.result as string).split(',')[1];
        const { data, error } = await supabase.functions.invoke('transcribe-audio', {
          body: { audio: base64Audio }
        });
        if (error) throw error;
        if (data?.text) {
          await sendMessage(activeConversationId, `🎤 ${data.text}`, 'text');
        }
      };
    } catch (error) {
      console.error('Error transcribing audio:', error);
      alert('Error al transcribir el audio');
    }
  };

  const handleSendQuote = async (quoteData: { title: string; description: string; amount: number }) => {
    if (!activeConversationId || !selectedConversation) return;

    try {
      const { data: professional } = await supabase
        .from('professionals')
        .select('id')
        .eq('user_id', user?.id)
        .single();

      if (!professional) return;

      const { data: quote, error } = await supabase
        .from('chat_quotes')
        .insert({
          conversation_id: activeConversationId,
          professional_id: professional.id,
          user_id: selectedConversation.user_id,
          title: quoteData.title,
          description: quoteData.description,
          amount: quoteData.amount,
          currency: 'ARS'
        })
        .select()
        .single();

      if (error) throw error;

      // Send a message about the quote
      await sendMessage(
        activeConversationId,
        `📋 Presupuesto enviado: ${quoteData.title} - $${quoteData.amount.toFixed(2)}`,
        'text'
      );

      setShowQuoteModal(false);
      setQuotes(prev => [...prev, quote]);
    } catch (error) {
      console.error('Error sending quote:', error);
    }
  };

  const handleAcceptQuote = async (quoteId: string) => {
    try {
      await supabase
        .from('chat_quotes')
        .update({ status: 'accepted', responded_at: new Date().toISOString() })
        .eq('id', quoteId);

      setQuotes(prev => prev.map(q => 
        q.id === quoteId ? { ...q, status: 'accepted' } : q
      ));

      await sendMessage(activeConversationId!, '✅ Presupuesto aceptado', 'text');
    } catch (error) {
      console.error('Error accepting quote:', error);
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const formatMessageTime = (timestamp: string) => {
    return formatDistanceToNow(new Date(timestamp), { addSuffix: true, locale: es });
  };

  // Group messages by date
  const groupMessagesByDate = (msgs: any[]) => {
    const groups: { date: Date; messages: any[] }[] = [];
    
    msgs?.forEach((msg) => {
      const msgDate = new Date(msg.created_at);
      const lastGroup = groups[groups.length - 1];
      
      if (!lastGroup || !isSameDay(lastGroup.date, msgDate)) {
        groups.push({ date: msgDate, messages: [msg] });
      } else {
        lastGroup.messages.push(msg);
      }
    });
    
    return groups;
  };

  if (!user || !canReceiveMessages) return null;

  const currentMessages = messages[activeConversationId || ''] || [];
  const messageGroups = groupMessagesByDate(currentMessages);

  return (
    <>
      {/* Botón flotante */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsOpen(!isOpen)}
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

      {/* Widget de chat */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 h-[600px] bg-background border rounded-lg shadow-2xl z-50 flex flex-col overflow-hidden">
          {/* Header */}
          {showConversationList ? (
            <div className="p-4 border-b flex items-center justify-between bg-primary text-primary-foreground">
              <h3 className="font-semibold">Mensajes</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="text-primary-foreground hover:bg-primary/90 h-8 w-8"
              >
                ✕
              </Button>
            </div>
          ) : (
            <ChatHeader
              conversation={selectedConversation}
              onBack={handleBackToList}
              onClose={() => setIsOpen(false)}
              onArchive={() => deleteConversation(activeConversationId!)}
              onBlock={() => blockConversation(activeConversationId!)}
            />
          )}

          {/* Contenido */}
          <div className="flex-1 overflow-hidden">
            {showConversationList ? (
              <ScrollArea className="h-full">
                {conversations.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground">
                    <p className="text-sm">No hay conversaciones</p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {conversations.map((conversation) => (
                      <div
                        key={conversation.id}
                        onClick={() => handleOpenConversation(conversation)}
                        className="p-3 cursor-pointer hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={conversation.professionals?.image_url} />
                            <AvatarFallback>
                              {getInitials(conversation.professionals?.full_name || 'Usuario')}
                            </AvatarFallback>
                          </Avatar>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className="font-semibold text-sm truncate">
                                {conversation.professionals?.full_name || 'Usuario'}
                              </h4>
                              {conversation.last_message_at && (
                                <span className="text-xs text-muted-foreground">
                                  {formatMessageTime(conversation.last_message_at)}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground truncate">
                              {conversation.last_message_preview || 'Sin mensajes'}
                            </p>
                            {((isProfessional ? conversation.unread_count_professional : conversation.unread_count_user) || 0) > 0 && (
                              <Badge className="mt-1 bg-primary text-primary-foreground text-xs">
                                {isProfessional ? conversation.unread_count_professional : conversation.unread_count_user}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            ) : (
              <>
                {/* Mensajes con separadores de fecha */}
                <ScrollArea className="h-[calc(100%-60px)] p-4">
                  <div className="space-y-2">
                    {messageGroups.map((group, groupIndex) => (
                      <div key={groupIndex}>
                        <DateSeparator date={group.date} />
                        {group.messages.map((message) => {
                          const isOwn = message.sender_id === user?.id;
                          
                          // Check if there's a quote for this message
                          const quote = quotes.find(q => 
                            message.content.includes(q.title) && 
                            message.content.includes('Presupuesto')
                          );

                          return (
                            <div key={message.id} className="mb-2">
                              {quote && (
                                <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-2`}>
                                  <ChatQuoteCard
                                    quote={quote}
                                    isOwnMessage={isOwn}
                                    isProfessional={isProfessional}
                                    onAccept={handleAcceptQuote}
                                  />
                                </div>
                              )}
                              <MessageBubble message={message} isOwn={isOwn} />
                            </div>
                          );
                        })}
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>

                {/* Input de mensaje mejorado */}
                <div className="p-3 border-t bg-background">
                  {selectedFile && (
                    <div className="mb-2 p-2 bg-muted rounded-lg flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {previewUrl ? (
                          <img src={previewUrl} alt="Preview" className="h-10 w-10 object-cover rounded" />
                        ) : (
                          <Paperclip className="h-4 w-4" />
                        )}
                        <span className="text-xs truncate max-w-[200px]">{selectedFile.name}</span>
                      </div>
                      <Button variant="ghost" size="sm" onClick={handleRemoveFile}>✕</Button>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-1">
                    <input
                      ref={fileInputRef}
                      type="file"
                      className="hidden"
                      onChange={handleFileSelect}
                      accept="*/*"
                    />
                    <input
                      ref={imageInputRef}
                      type="file"
                      className="hidden"
                      onChange={handleFileSelect}
                      accept="image/*"
                    />
                    
                    {/* Plus menu for attachments */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                          <PlusCircle className="h-5 w-5 text-muted-foreground" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start">
                        <DropdownMenuItem onClick={() => imageInputRef.current?.click()}>
                          <ImageIcon className="h-4 w-4 mr-2" />
                          Imagen
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => fileInputRef.current?.click()}>
                          <Paperclip className="h-4 w-4 mr-2" />
                          Archivo
                        </DropdownMenuItem>
                        {isProfessional && (
                          <DropdownMenuItem onClick={() => setShowQuoteModal(true)}>
                            <Receipt className="h-4 w-4 mr-2" />
                            Presupuesto
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>

                    <Input
                      placeholder="Escribe un mensaje..."
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="flex-1 h-9"
                      disabled={sending}
                    />

                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 shrink-0"
                    >
                      <Smile className="h-5 w-5 text-muted-foreground" />
                    </Button>

                    {messageText.trim() || selectedFile ? (
                      <Button
                        onClick={handleSendMessage}
                        disabled={sending}
                        size="icon"
                        className="h-8 w-8 shrink-0"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    ) : (
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={isRecording ? stopRecording : startRecording}
                        className={`h-8 w-8 shrink-0 ${isRecording ? 'text-red-500' : ''}`}
                      >
                        {isRecording ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5 text-muted-foreground" />}
                      </Button>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Quote Modal */}
      <CreateQuoteModal
        open={showQuoteModal}
        onOpenChange={setShowQuoteModal}
        onSubmit={handleSendQuote}
      />
    </>
  );
};
