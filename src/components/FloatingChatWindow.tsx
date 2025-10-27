import { useState, useEffect, useRef } from 'react';
import { X, Send, Paperclip, Image as ImageIcon, Mic, MicOff, ArrowLeft, MessageCircle } from 'lucide-react';
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

interface FloatingChatWindowProps {
  conversation: any;
  position: { bottom: number; right: number };
  onClose: () => void;
  onOpenNewChat: (conversation: any) => void;
  allConversations: any[];
}

export const FloatingChatWindow = ({ 
  conversation: initialConversation, 
  position, 
  onClose,
  onOpenNewChat,
  allConversations
}: FloatingChatWindowProps) => {
  const { user } = useAuth();
  const {
    messages,
    sending,
    fetchMessages,
    sendMessage,
    setActiveConversationId
  } = useChat();

  const [showConversationList, setShowConversationList] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [currentConversation, setCurrentConversation] = useState(initialConversation);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [transcribeAudio, setTranscribeAudio] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Cargar mensajes al montar
  useEffect(() => {
    if (currentConversation?.id) {
      setActiveConversationId(currentConversation.id);
      fetchMessages(currentConversation.id);
    }
  }, [currentConversation?.id]);

  // Auto scroll
  useEffect(() => {
    if (!isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, currentConversation?.id, isMinimized]);

  const handleSendMessage = async () => {
    if ((!messageText.trim() && !selectedFile) || !currentConversation?.id) return;

    const messageType = selectedFile ? (selectedFile.type.startsWith('image/') ? 'image' : 'file') : 'text';
    
    await sendMessage(
      currentConversation.id, 
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
    if (!currentConversation?.id) return;
    try {
      const audioFile = new File([audioBlob], `audio-${Date.now()}.webm`, { type: 'audio/webm' });
      await sendMessage(currentConversation.id, '🎤 Mensaje de voz', 'audio', audioFile);
    } catch (error) {
      console.error('Error sending audio:', error);
    }
  };

  const transcribeAndSend = async (audioBlob: Blob) => {
    if (!currentConversation?.id) return;
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
          await sendMessage(currentConversation.id, `🎤 ${data.text}`, 'text');
        }
      };
    } catch (error) {
      console.error('Error transcribing audio:', error);
    }
  };

  const handleSelectConversation = (conv: any) => {
    setCurrentConversation(conv);
    setShowConversationList(false);
    setActiveConversationId(conv.id);
    fetchMessages(conv.id);
  };

  const handleOpenNewConversation = (conv: any) => {
    onOpenNewChat(conv);
    setShowConversationList(false);
  };

  const getInitials = (name: string) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';
  };

  const formatMessageTime = (timestamp: string) => {
    return formatDistanceToNow(new Date(timestamp), { addSuffix: true, locale: es });
  };

  // Obtener el nombre del contacto (profesional)
  const getContactName = () => {
    if (currentConversation?.professionals?.full_name) {
      return currentConversation.professionals.full_name;
    }
    return 'Chat';
  };

  const getContactImage = () => {
    return currentConversation?.professionals?.image_url;
  };

  if (isMinimized) {
    return (
      <div 
        className="fixed z-50 cursor-pointer"
        style={{ 
          bottom: `${position.bottom}px`, 
          right: `${position.right}px` 
        }}
      >
        <Button
          onClick={() => setIsMinimized(false)}
          className="relative h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all"
          size="icon"
        >
          <MessageCircle className="h-6 w-6" />
          <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-primary">
            1
          </Badge>
        </Button>
      </div>
    );
  }

  return (
    <div 
      className="fixed w-96 h-[600px] bg-background border rounded-lg shadow-2xl z-50 flex flex-col overflow-hidden"
      style={{ 
        bottom: `${position.bottom}px`, 
        right: `${position.right}px` 
      }}
    >
      {/* Header */}
      <div className="p-4 border-b flex items-center justify-between bg-primary text-primary-foreground">
        {showConversationList ? (
          <>
            <h3 className="font-semibold">Conversaciones</h3>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMinimized(true)}
                className="text-primary-foreground hover:bg-primary/90 h-8 w-8"
              >
                _
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="text-primary-foreground hover:bg-primary/90 h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowConversationList(true)}
                className="text-primary-foreground hover:bg-primary/90 h-8 w-8"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <Avatar className="h-8 w-8">
                <AvatarImage src={getContactImage()} />
                <AvatarFallback>
                  {getInitials(getContactName())}
                </AvatarFallback>
              </Avatar>
              <span className="font-semibold text-sm">
                {getContactName()}
              </span>
            </div>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMinimized(true)}
                className="text-primary-foreground hover:bg-primary/90 h-8 w-8"
              >
                _
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="text-primary-foreground hover:bg-primary/90 h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </>
        )}
      </div>

      {/* Contenido */}
      <div className="flex-1 overflow-hidden">
        {showConversationList ? (
          <ScrollArea className="h-full">
            {allConversations.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                <p className="text-sm">No hay conversaciones</p>
              </div>
            ) : (
              <div className="divide-y">
                {allConversations.map((conv) => (
                  <div
                    key={conv.id}
                    className="p-3 cursor-pointer hover:bg-muted/50 transition-colors flex justify-between items-center"
                  >
                    <div 
                      className="flex items-start gap-3 flex-1"
                      onClick={() => handleSelectConversation(conv)}
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={conv.professionals?.image_url} />
                        <AvatarFallback>
                          {getInitials(conv.professionals?.full_name || 'U')}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-semibold text-sm truncate">
                            {conv.professionals?.full_name || 'Usuario'}
                          </h4>
                          {conv.last_message_at && (
                            <span className="text-xs text-muted-foreground">
                              {formatMessageTime(conv.last_message_at)}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          {conv.last_message_preview || 'Sin mensajes'}
                        </p>
                        {conv.unread_count_user > 0 && (
                          <Badge className="mt-1 bg-primary text-primary-foreground text-xs">
                            {conv.unread_count_user}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenNewConversation(conv);
                      }}
                      className="h-8 w-8 ml-2"
                      title="Abrir en nueva ventana"
                    >
                      <MessageCircle className="h-4 w-4" />
                    </Button>
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
                {messages[currentConversation?.id]?.map((message) => {
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
                
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={isRecording ? stopRecording : startRecording}
                  className={`h-8 w-8 ${isRecording ? 'text-red-500' : ''}`}
                >
                  {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                </Button>
                
                <Input
                  placeholder="Escribe un mensaje..."
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1 h-8 text-sm"
                  disabled={sending}
                />
                
                <Button
                  onClick={handleSendMessage}
                  disabled={(!messageText.trim() && !selectedFile) || sending}
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
  );
};
