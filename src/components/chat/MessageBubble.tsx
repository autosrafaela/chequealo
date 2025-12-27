import { Check, CheckCheck, Paperclip } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface MessageBubbleProps {
  message: {
    id: string;
    content: string;
    message_type: string;
    file_url?: string;
    file_name?: string;
    is_read: boolean;
    created_at: string;
    sender_id: string;
  };
  isOwn: boolean;
}

export const MessageBubble = ({ message, isOwn }: MessageBubbleProps) => {
  const formatTime = (timestamp: string) => {
    return format(new Date(timestamp), 'h:mm a');
  };

  return (
    <div className={cn("flex", isOwn ? "justify-end" : "justify-start")}>
      <div className="relative max-w-[75%]">
        {/* Message bubble with tail */}
        <div
          className={cn(
            "relative px-3 py-2 rounded-2xl",
            isOwn
              ? "bg-[hsl(var(--chat-bubble-sent))] text-[hsl(var(--chat-bubble-sent-foreground))] rounded-tr-sm"
              : "bg-[hsl(var(--chat-bubble-received))] text-foreground rounded-tl-sm"
          )}
        >
          {/* Image attachment */}
          {message.message_type === 'image' && message.file_url && (
            <img
              src={message.file_url}
              alt="Imagen adjunta"
              className="rounded-lg mb-2 max-w-full cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => window.open(message.file_url, '_blank')}
            />
          )}

          {/* Audio attachment */}
          {message.message_type === 'audio' && message.file_url && (
            <audio
              controls
              className="mb-2 max-w-full h-8"
              preload="metadata"
            >
              <source src={message.file_url} type="audio/webm" />
            </audio>
          )}

          {/* File attachment */}
          {message.message_type === 'file' && message.file_url && (
            <a
              href={message.file_url}
              download={message.file_name}
              className="flex items-center gap-2 mb-2 hover:underline text-xs"
            >
              <Paperclip className="h-3 w-3" />
              <span>{message.file_name}</span>
            </a>
          )}

          {/* Message text */}
          <p className="text-sm break-words whitespace-pre-wrap">
            {message.content}
          </p>

          {/* Time and read status */}
          <div className={cn(
            "flex items-center justify-end gap-1 mt-1",
            isOwn ? "text-[hsl(var(--chat-bubble-sent-foreground))]/70" : "text-muted-foreground"
          )}>
            <span className="text-[10px]">
              {formatTime(message.created_at)}
            </span>
            {isOwn && (
              message.is_read ? (
                <CheckCheck className="h-3.5 w-3.5 text-blue-400" />
              ) : (
                <Check className="h-3.5 w-3.5" />
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
