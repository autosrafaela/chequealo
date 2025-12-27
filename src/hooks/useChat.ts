import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { usePlanRestrictions } from './usePlanRestrictions';
import { toast } from 'sonner';
import { playNotificationWithVibration, isAudioReady } from '@/utils/notificationSound';

interface Message {
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
}

interface Conversation {
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
  };
}

export const useChat = () => {
  const { user } = useAuth();
  const { planLimits } = usePlanRestrictions();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<{ [conversationId: string]: Message[] }>({});
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);

  // Track processed messages to avoid duplicate sounds
  const processedMessagesRef = useRef<Set<string>>(new Set());
  // Track last sound time to debounce
  const lastSoundTimeRef = useRef<number>(0);

  useEffect(() => {
    if (user) {
      fetchConversations();
      const cleanup = setupRealtimeSubscriptions();
      return cleanup;
    }
  }, [user]);

  const fetchConversations = async () => {
    try {
      setLoading(true);

      const { data: professional } = await supabase
        .from('professionals')
        .select('id')
        .eq('user_id', user?.id)
        .single();

      let query = supabase
        .from('conversations')
        .select(`
          *,
          professionals!professional_id(full_name, image_url, profession)
        `)
        .eq('status', 'active')
        .order('last_message_at', { ascending: false });

      if (professional) {
        query = query.eq('professional_id', professional.id);
      } else {
        query = query.eq('user_id', user?.id);
      }

      const { data, error } = await query;

      if (error) throw error;
      setConversations(data || []);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      toast.error('Error al cargar conversaciones');
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId: string) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      setMessages(prev => ({
        ...prev,
        [conversationId]: data || []
      }));

      await markMessagesAsRead(conversationId);
      
      return data;
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('Error al cargar mensajes');
      return [];
    }
  };

  const createConversation = async (professionalId: string, contactRequestId?: string) => {
    try {
      if (!planLimits.canReceiveMessages) {
        toast.error('El chat no está disponible en tu plan actual');
        return null;
      }

      const { data, error } = await supabase
        .from('conversations')
        .upsert({
          professional_id: professionalId,
          user_id: user?.id,
          contact_request_id: contactRequestId
        }, {
          onConflict: 'professional_id,user_id'
        })
        .select()
        .single();

      if (error) throw error;

      await fetchConversations();
      return data;
    } catch (error) {
      console.error('Error creating conversation:', error);
      toast.error('Error al crear conversación');
      return null;
    }
  };

  const sendMessage = async (
    conversationId: string, 
    content: string, 
    messageType: string = 'text',
    file?: File
  ) => {
    try {
      if (!planLimits.canReceiveMessages) {
        toast.error('El chat no está disponible en tu plan actual');
        return null;
      }

      setSending(true);

      let fileUrl: string | undefined;
      let fileName: string | undefined;
      let fileSize: number | undefined;

      if (file) {
        const fileExt = file.name.split('.').pop();
        const filePath = `chat-files/${conversationId}/${Date.now()}.${fileExt}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('avatars')
          .getPublicUrl(filePath);

        fileUrl = urlData.publicUrl;
        fileName = file.name;
        fileSize = file.size;
      }

      const { data: professional } = await supabase
        .from('professionals')
        .select('id')
        .eq('user_id', user?.id)
        .single();

      const senderType = professional ? 'professional' : 'user';

      const { data, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: user?.id,
          sender_type: senderType,
          message_type: messageType,
          content,
          file_url: fileUrl,
          file_name: fileName,
          file_size: fileSize
        })
        .select()
        .single();

      if (error) throw error;

      // Add to processed messages to prevent sound when we receive our own message
      processedMessagesRef.current.add(data.id);

      setMessages(prev => ({
        ...prev,
        [conversationId]: [...(prev[conversationId] || []), data]
      }));

      // Send notification to the recipient
      try {
        const { data: conversation } = await supabase
          .from('conversations')
          .select('user_id, professional_id, professionals(user_id)')
          .eq('id', conversationId)
          .single();

        if (conversation) {
          const { data: senderProfile } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('user_id', user?.id)
            .single();

          const senderName = senderProfile?.full_name || 'Un usuario';
          
          const recipientUserId = senderType === 'professional' 
            ? conversation.user_id 
            : conversation.professionals?.user_id;
          
          const isRecipientProfessional = senderType === 'user';

          if (recipientUserId) {
            const { notifyNewMessage } = await import('@/utils/notificationHelpers');
            await notifyNewMessage(
              recipientUserId,
              senderName,
              messageType === 'text' ? content : 'Archivo adjunto',
              conversationId,
              isRecipientProfessional
            );
          }
        }
      } catch (notifError) {
        console.error('Error sending notification:', notifError);
      }

      return data;
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Error al enviar mensaje');
      return null;
    } finally {
      setSending(false);
    }
  };

  const markMessagesAsRead = async (conversationId: string) => {
    try {
      const { data: professional } = await supabase
        .from('professionals')
        .select('id')
        .eq('user_id', user?.id)
        .single();

      const oppositeSenderType = professional ? 'user' : 'professional';

      const { error } = await supabase
        .from('messages')
        .update({ 
          is_read: true, 
          read_at: new Date().toISOString() 
        })
        .eq('conversation_id', conversationId)
        .eq('sender_type', oppositeSenderType)
        .eq('is_read', false);

      if (error) throw error;

      const updateField = professional ? 'unread_count_professional' : 'unread_count_user';
      
      await supabase
        .from('conversations')
        .update({ [updateField]: 0 })
        .eq('id', conversationId);

    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  const setupRealtimeSubscriptions = useCallback(() => {
    const messagesSubscription = supabase
      .channel('messages')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages'
      }, async (payload) => {
        const newMessage = payload.new as Message;
        
        setMessages(prev => ({
          ...prev,
          [newMessage.conversation_id]: [
            ...(prev[newMessage.conversation_id] || []),
            newMessage
          ]
        }));

        // Play sound only if:
        // 1. Message is not from current user
        // 2. Message hasn't been processed yet
        // 3. Debounce 300ms between sounds
        const now = Date.now();
        const shouldPlaySound = 
          newMessage.sender_id !== user?.id && 
          !processedMessagesRef.current.has(newMessage.id) &&
          now - lastSoundTimeRef.current > 300;

        if (shouldPlaySound) {
          processedMessagesRef.current.add(newMessage.id);
          lastSoundTimeRef.current = now;
          
          console.log('[useChat] Playing sound for new message:', newMessage.id);
          
          // Play notification sound with vibration
          await playNotificationWithVibration('message', 'short');
          
          toast.success('Nuevo mensaje recibido', {
            description: newMessage.content?.substring(0, 50) || 'Nuevo mensaje'
          });
          
          // Clean up old processed messages
          if (processedMessagesRef.current.size > 100) {
            const entries = Array.from(processedMessagesRef.current);
            processedMessagesRef.current = new Set(entries.slice(-50));
          }
        }
      })
      .subscribe();

    const conversationsSubscription = supabase
      .channel('conversations')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'conversations'
      }, () => {
        fetchConversations();
      })
      .subscribe();

    return () => {
      messagesSubscription.unsubscribe();
      conversationsSubscription.unsubscribe();
    };
  }, [user?.id]);

  const deleteConversation = async (conversationId: string) => {
    try {
      const { error } = await supabase
        .from('conversations')
        .update({ status: 'archived' })
        .eq('id', conversationId);

      if (error) throw error;

      await fetchConversations();
      toast.success('Conversación archivada');
      return true;
    } catch (error) {
      console.error('Error deleting conversation:', error);
      toast.error('Error al archivar conversación');
      return false;
    }
  };

  const blockConversation = async (conversationId: string) => {
    try {
      const { error } = await supabase
        .from('conversations')
        .update({ status: 'blocked' })
        .eq('id', conversationId);

      if (error) throw error;

      await fetchConversations();
      toast.success('Conversación bloqueada');
      return true;
    } catch (error) {
      console.error('Error blocking conversation:', error);
      toast.error('Error al bloquear conversación');
      return false;
    }
  };

  const openConversationByContactRequest = async (contactRequestId: string) => {
    try {
      const existingConv = conversations.find(c => c.contact_request_id === contactRequestId);
      
      if (existingConv) {
        return existingConv;
      }

      const { data: contactRequest, error: crError } = await supabase
        .from('contact_requests')
        .select('professional_id, user_id')
        .eq('id', contactRequestId)
        .single();

      if (crError) throw crError;

      const newConv = await createConversation(contactRequest.professional_id, contactRequestId);
      return newConv;
    } catch (error) {
      console.error('Error opening conversation by contact request:', error);
      toast.error('Error al abrir el chat');
      return null;
    }
  };

  return {
    conversations,
    messages,
    loading,
    sending,
    activeConversationId,
    setActiveConversationId,
    fetchMessages,
    createConversation,
    openConversationByContactRequest,
    sendMessage,
    markMessagesAsRead,
    deleteConversation,
    blockConversation,
    refreshConversations: fetchConversations,
    canSendFiles: planLimits.canSendFiles,
    canReceiveMessages: planLimits.canReceiveMessages,
    getConversationWithRelations: async (conversationId: string) => {
      const { data } = await supabase
        .from('conversations')
        .select(`*, professionals!professional_id(full_name, image_url)`) 
        .eq('id', conversationId)
        .single();
      return data;
    }
  };
};
