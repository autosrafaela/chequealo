import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { MessageCircle, X, Send, Paperclip, Image as ImageIcon, Mic, MicOff, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useChat } from '@/hooks/useChat';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

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
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Detectar parámetros de URL para abrir chat automáticamente
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    const conversationId = params.get('conversation');
    
    if (tab === 'messages' && conversationId && conversations.length > 0) {
      const conversation = conversations.find(c => c.id === conversationId);
      if (conversation) {
        setIsOpen(true);
        handleOpenConversation(conversation);
        // Limpiar parámetros de URL
        const newParams = new URLSearchParams(location.search);
        newParams.delete('tab');
        newParams.delete('conversation');
        navigate({ search: newParams.toString() }, { replace: true });
      }
    }
  }, [location.search, conversations, navigate]);

  // Calcular mensajes no leídos
  useEffect(() => {
    const total = conversations.reduce((acc, conv) => {
      return acc + (conv.unread_count_user || 0);
    }, 0);
    setUnreadCount(total);
  }, [conversations]);

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

  // Auto-abrir la última conversación para permitir continuar escribiendo
  useEffect(() => {
    if (isOpen && showConversationList && !activeConversationId && conversations.length > 0) {
      handleOpenConversation(conversations[0]); // la más reciente ya viene ordenada
    }
  }, [isOpen, showConversationList, activeConversationId, conversations]);

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

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const formatMessageTime = (timestamp: string) => {
    return formatDistanceToNow(new Date(timestamp), { addSuffix: true, locale: es });
  };

  if (!user || !canReceiveMessages) return null;

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
          <div className="p-4 border-b flex items-center justify-between bg-primary text-primary-foreground">
            {showConversationList ? (
              <>
                <h3 className="font-semibold">Mensajes</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                  className="text-primary-foreground hover:bg-primary/90"
                >
                  <X className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleBackToList}
                    className="text-primary-foreground hover:bg-primary/90"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={selectedConversation?.professionals?.image_url} />
                      <AvatarFallback>
                        {getInitials(selectedConversation?.professionals?.full_name || 'Usuario')}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-semibold text-sm">
                      {selectedConversation?.professionals?.full_name || 'Usuario'}
                    </span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                  className="text-primary-foreground hover:bg-primary/90"
                >
                  <X className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>

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
                            {conversation.unread_count_user > 0 && (
                              <Badge className="mt-1 bg-primary text-primary-foreground text-xs">
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
            ) : (
              <>
                {/* Mensajes */}
                <ScrollArea className="h-[calc(100%-120px)] p-4">
                  <div className="space-y-3">
                    {messages[activeConversationId]?.map((message) => {
                      const isOwn = message.sender_id === user?.id;
                      return (
                        <div
                          key={message.id}
                          className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[75%] rounded-2xl px-3 py-2 ${
                              isOwn
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted'
                            }`}
                          >
                            {message.message_type === 'image' && message.file_url && (
                              <img 
                                src={message.file_url} 
                                alt="Imagen adjunta"
                                className="rounded-lg mb-1 max-w-full"
                              />
                            )}
                            
                            {message.message_type === 'audio' && message.file_url && (
                              <audio 
                                controls 
                                className="mb-1 max-w-full"
                                preload="metadata"
                              >
                                <source src={message.file_url} type="audio/webm" />
                              </audio>
                            )}
                            
                            {message.message_type === 'file' && message.file_url && (
                              <a 
                                href={message.file_url} 
                                download={message.file_name}
                                className="flex items-center gap-2 mb-1 hover:underline text-xs"
                              >
                                <Paperclip className="h-3 w-3" />
                                <span>{message.file_name}</span>
                              </a>
                            )}
                            
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
                <div className="p-3 border-t bg-background">
                  {selectedFile && (
                    <div className="mb-2 p-2 bg-muted rounded-lg flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {previewUrl ? (
                          <img src={previewUrl} alt="Preview" className="h-10 w-10 object-cover rounded" />
                        ) : (
                          <Paperclip className="h-4 w-4" />
                        )}
                        <span className="text-xs">{selectedFile.name}</span>
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
                    
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => fileInputRef.current?.click()}
                      className="h-8 w-8"
                    >
                      <Paperclip className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => imageInputRef.current?.click()}
                      className="h-8 w-8"
                    >
                      <ImageIcon className="h-4 w-4" />
                    </Button>
                    
                    <div className="flex items-center">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={isRecording ? stopRecording : startRecording}
                        className={`h-8 w-8 ${isRecording ? 'text-red-500' : ''}`}
                        title={transcribeAudio ? 'Grabar y transcribir' : 'Grabar audio directo'}
                      >
                        {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setTranscribeAudio(!transcribeAudio)}
                        disabled={isRecording}
                        className="h-8 w-8 text-xs"
                        title={transcribeAudio ? 'Cambiar a audio directo' : 'Cambiar a transcripción'}
                      >
                        {transcribeAudio ? '📝' : '🎵'}
                      </Button>
                    </div>
                    
                    <Input
                      placeholder="Escribe un mensaje..."
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="flex-1 h-8 text-sm"
                    />
                    
                    <Button
                      onClick={handleSendMessage}
                      disabled={!messageText.trim() && !selectedFile}
                      size="icon"
                      className="h-8 w-8"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};
