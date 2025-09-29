import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { usePlanRestrictions } from './usePlanRestrictions';
import { toast } from 'sonner';

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  sender_type: string; // Allow any string from database  
  message_type: string; // Allow any string from database
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
  status: string; // Allow any string from database
  created_at: string;
  updated_at: string;
  professionals?: {
    full_name: string;
    image_url?: string;
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

  useEffect(() => {
    if (user && planLimits.canReceiveMessages) {
      fetchConversations();
      setupRealtimeSubscriptions();
    }
  }, [user, planLimits.canReceiveMessages]);

  const fetchConversations = async () => {
    try {
      setLoading(true);

      // Check if user is professional
      const { data: professional } = await supabase
        .from('professionals')
        .select('id')
        .eq('user_id', user?.id)
        .single();

      let query = supabase
        .from('conversations')
        .select(`
          *,
          professionals!professional_id(full_name, image_url)
        `)
        .eq('status', 'active')
        .order('last_message_at', { ascending: false });

      if (professional) {
        // Professional sees conversations with their clients
        query = query.eq('professional_id', professional.id);
      } else {
        // User sees conversations with professionals
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

      // Mark messages as read
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

      if (messageType !== 'text' && !planLimits.canSendFiles) {
        toast.error('El envío de archivos no está disponible en tu plan actual');
        return null;
      }

      setSending(true);

      let fileUrl: string | undefined;
      let fileName: string | undefined;
      let fileSize: number | undefined;

      // Handle file upload if present
      if (file && planLimits.canSendFiles) {
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

      // Determine sender type
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

      // Update local messages state
      setMessages(prev => ({
        ...prev,
        [conversationId]: [...(prev[conversationId] || []), data]
      }));

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
      // Check if user is professional
      const { data: professional } = await supabase
        .from('professionals')
        .select('id')
        .eq('user_id', user?.id)
        .single();

      const senderType = professional ? 'professional' : 'user';
      const oppositeSenderType = professional ? 'user' : 'professional';

      // Mark messages as read
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

      // Update conversation unread count
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
    // Subscribe to new messages
    const messagesSubscription = supabase
      .channel('messages')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages'
      }, (payload) => {
        const newMessage = payload.new as Message;
        
        setMessages(prev => ({
          ...prev,
          [newMessage.conversation_id]: [
            ...(prev[newMessage.conversation_id] || []),
            newMessage
          ]
        }));

        // Show notification if message is not from current user
        if (newMessage.sender_id !== user?.id) {
          toast.success('Nuevo mensaje recibido');
        }
      })
      .subscribe();

    // Subscribe to conversation updates
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

  return {
    conversations,
    messages,
    loading,
    sending,
    activeConversationId,
    setActiveConversationId,
    fetchMessages,
    createConversation,
    sendMessage,
    markMessagesAsRead,
    deleteConversation,
    blockConversation,
    refreshConversations: fetchConversations,
    canSendFiles: planLimits.canSendFiles,
    canReceiveMessages: planLimits.canReceiveMessages
  };
};