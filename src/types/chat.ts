export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'failed';

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  sender_type: string;
  message_type: string;
  content: string;
  file_url?: string;
  file_name?: string;
  file_size?: number;
  is_read: boolean;
  read_at?: string;
  created_at: string;
  updated_at: string;
  status?: MessageStatus;
}

export interface ChatParticipant {
  id: string;
  name: string;
  avatar?: string;
  profession?: string;
  phone?: string;
  isOnline: boolean;
  lastSeen?: Date;
}

export interface Conversation {
  id: string;
  professional_id: string;
  user_id: string;
  contact_request_id?: string;
  last_message_at: string;
  last_message_preview?: string;
  unread_count_user: number;
  unread_count_professional: number;
  status: string;
  created_at: string;
  updated_at: string;
  professionals?: {
    full_name: string;
    image_url?: string;
    profession?: string;
    phone?: string;
  };
}

export interface Chat {
  id: string;
  participant: ChatParticipant;
  lastMessage?: {
    text: string;
    timestamp: Date;
    isFromMe: boolean;
    status: MessageStatus;
  };
  unreadCount: number;
  isPinned?: boolean;
}
