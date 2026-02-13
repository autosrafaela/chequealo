import { useState, useRef, useEffect } from "react";
import { ArrowLeft, Phone, Send, MoreVertical, Paperclip, Mic, Image as ImageIcon, X, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format, isToday, isYesterday, isSameDay } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { MessageBubble } from "./MessageBubble";
import { DateSeparator } from "./DateSeparator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import type { Message, Conversation } from "@/types/chat";
import { getAvatarColor, getAvatarTextColor } from "@/utils/avatarColors";

interface WhatsAppChatViewProps {
  conversation: Conversation | null;
  messages: Message[];
  currentUserId: string;
  sending: boolean;
  onBack: () => void;
  onSendMessage: (content: string, type?: string, file?: File) => Promise<void>;
  onCall?: () => void;
  onArchive?: () => void;
  onBlock?: () => void;
  isProfessional?: boolean;
  myProfessionalId?: string | null;
}

const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

const formatDateHeader = (dateString: string): string => {
  const date = new Date(dateString);
  if (isToday(date)) return 'Hoy';
  if (isYesterday(date)) return 'Ayer';
  return format(date, "d 'de' MMMM, yyyy", { locale: es });
};

export const WhatsAppChatView = ({
  conversation,
  messages,
  currentUserId,
  sending,
  onBack,
  onSendMessage,
  onCall,
  onArchive,
  onBlock,
  isProfessional = false,
  myProfessionalId
}: WhatsAppChatViewProps) => {
  const [messageText, setMessageText] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [showWhatsAppFallback, setShowWhatsAppFallback] = useState(false);
  const [lastOwnMessage, setLastOwnMessage] = useState<string>("");

  const professional = conversation?.professionals;
  const clientProfile = conversation?.profiles;
  
  // Per-conversation identity
  const amProfessionalHere = myProfessionalId != null 
    ? conversation?.professional_id === myProfessionalId 
    : isProfessional;
  
  const name = amProfessionalHere
    ? (clientProfile?.full_name || `Cliente de ${professional?.profession || 'consulta'}`)
    : (professional?.full_name || 'Usuario');
  const avatar = amProfessionalHere
    ? clientProfile?.avatar_url
    : professional?.image_url;
  const profession = professional?.profession;

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // WhatsApp fallback: detect 5 min without response
  useEffect(() => {
    if (!messages.length || !professional?.phone) {
      setShowWhatsAppFallback(false);
      return;
    }

    const checkFallback = () => {
      const lastMsg = messages[messages.length - 1];
      if (lastMsg.sender_id === currentUserId) {
        const elapsed = Date.now() - new Date(lastMsg.created_at).getTime();
        if (elapsed > 5 * 60 * 1000) {
          setShowWhatsAppFallback(true);
          setLastOwnMessage(lastMsg.content);
          return;
        }
      }
      setShowWhatsAppFallback(false);
    };

    checkFallback();
    const interval = setInterval(checkFallback, 30000);
    return () => clearInterval(interval);
  }, [messages, currentUserId, professional?.phone]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, [conversation?.id]);

  const handleSend = async () => {
    const content = messageText.trim();
    if (!content && !selectedFile) return;
    
    const text = content || (selectedFile?.type.startsWith('image/') ? '📷 Imagen' : '📎 Archivo');
    const type = selectedFile 
      ? (selectedFile.type.startsWith('image/') ? 'image' : 'file')
      : 'text';
    
    setMessageText("");
    clearFileSelection();
    
    await onSendMessage(text, type, selectedFile || undefined);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      if (file.type.startsWith('image/')) {
        setPreviewUrl(URL.createObjectURL(file));
      }
    }
  };

  const clearFileSelection = () => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCall = () => {
    if (professional?.phone) {
      const cleanPhone = professional.phone.replace(/\D/g, '');
      window.open(`https://wa.me/${cleanPhone}`, '_blank');
    }
  };

  // Group messages by date
  const groupedMessages = messages.reduce((groups, message, index) => {
    const messageDate = new Date(message.created_at);
    const previousMessage = messages[index - 1];
    
    if (!previousMessage || !isSameDay(messageDate, new Date(previousMessage.created_at))) {
      groups.push({ type: 'date' as const, date: message.created_at });
    }
    groups.push({ type: 'message' as const, message });
    
    return groups;
  }, [] as ({ type: 'date'; date: string } | { type: 'message'; message: Message })[]);

  if (!conversation) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-muted/30 p-8">
        <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-4">
          <svg className="w-12 h-12 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-foreground mb-2">
          Selecciona una conversación
        </h2>
        <p className="text-muted-foreground text-center max-w-xs">
          Elige un chat de la lista para empezar a hablar
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <header className="shrink-0 flex items-center gap-3 px-4 py-3 bg-primary text-primary-foreground border-b">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="text-primary-foreground hover:bg-primary-foreground/10 h-9 w-9 md:hidden"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>

        <Avatar className={`h-10 w-10 border-2 border-primary-foreground/20 ${!avatar ? getAvatarColor(name) : ''}`}>
          <AvatarImage src={avatar || undefined} alt={name} />
          <AvatarFallback className={`${getAvatarColor(name)} text-white font-medium`}>
            {getInitials(name)}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <h2 className="font-semibold truncate">{name}</h2>
          {profession && (
            <p className="text-xs text-primary-foreground/70 truncate">
              {profession}
            </p>
          )}
        </div>

        {professional?.phone && (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleCall}
            className="text-primary-foreground hover:bg-primary-foreground/10 h-9 w-9"
          >
            <Phone className="h-5 w-5" />
          </Button>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="text-primary-foreground hover:bg-primary-foreground/10 h-9 w-9"
            >
              <MoreVertical className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {onArchive && (
              <DropdownMenuItem onClick={onArchive}>
                Archivar conversación
              </DropdownMenuItem>
            )}
            {onBlock && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onBlock} className="text-destructive">
                  Bloquear
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      {/* Messages Area */}
      <div 
        className="flex-1 overflow-y-auto p-4 space-y-2"
        style={{ 
          backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%239C92AC" fill-opacity="0.03"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' 
        }}
      >
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="bg-muted/80 backdrop-blur-sm rounded-lg px-6 py-4 max-w-xs">
              <p className="text-sm text-muted-foreground">
                No hay mensajes aún. ¡Envía el primero!
              </p>
            </div>
          </div>
        ) : (
          <>
            {groupedMessages.map((item, index) => {
              if (item.type === 'date') {
                return (
                  <DateSeparator key={`date-${index}`} date={new Date(item.date)} />
                );
              }
              
              const msg = item.message;
              const isOwn = msg.sender_id === currentUserId;
              
              return (
                <MessageBubble
                  key={msg.id}
                  message={msg}
                  isOwn={isOwn}
                />
              );
            })}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* WhatsApp fallback banner */}
      {showWhatsAppFallback && professional?.phone && (
        <div className="shrink-0 px-4 py-3 border-t bg-muted/50 flex items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">Sin respuesta aún...</p>
          <Button
            size="sm"
            className="bg-green-600 hover:bg-green-700 text-white shrink-0"
            onClick={() => {
              const cleanPhone = professional.phone!.replace(/\D/g, '');
              const whatsappNumber = cleanPhone.startsWith('54') ? cleanPhone : `54${cleanPhone}`;
              const text = encodeURIComponent(lastOwnMessage || 'Hola, te escribí por Chequealo');
              window.open(`https://wa.me/${whatsappNumber}?text=${text}`, '_blank');
            }}
          >
            <MessageCircle className="h-4 w-4 mr-1" />
            Reenviar por WhatsApp
          </Button>
        </div>
      )}

      {/* File preview */}
      {selectedFile && (
        <div className="shrink-0 p-3 border-t bg-muted/50">
          <div className="flex items-center gap-3">
            {previewUrl ? (
              <img src={previewUrl} alt="Preview" className="h-16 w-16 object-cover rounded-lg" />
            ) : (
              <div className="h-16 w-16 bg-muted rounded-lg flex items-center justify-center">
                <Paperclip className="h-6 w-6 text-muted-foreground" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{selectedFile.name}</p>
              <p className="text-xs text-muted-foreground">
                {(selectedFile.size / 1024).toFixed(1)} KB
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={clearFileSelection}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="shrink-0 p-3 border-t bg-background">
        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept="image/*,application/pdf,.doc,.docx"
            onChange={handleFileSelect}
          />
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
            className="h-10 w-10 shrink-0 text-muted-foreground hover:text-foreground"
          >
            <Paperclip className="h-5 w-5" />
          </Button>

          <Input
            ref={inputRef}
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Escribe un mensaje..."
            className="flex-1 rounded-full bg-muted/50 border-0"
            disabled={sending}
          />

          <Button
            size="icon"
            onClick={handleSend}
            disabled={(!messageText.trim() && !selectedFile) || sending}
            className="h-10 w-10 shrink-0 rounded-full"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};
