import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface PendingTransaction {
  id: string;
  user_id: string;
  professional_id: string;
  service_type: string;
  started_at: string;
  user_confirmed_completion: boolean | null;
  professional_confirmed_completion: boolean | null;
  user_confirmed_at: string | null;
  professional_confirmed_at: string | null;
  professional?: {
    full_name: string;
    profession: string;
  };
  user?: {
    full_name: string;
  };
}

export const useTransactionConfirmation = () => {
  const { user } = useAuth();
  const [pendingTransactions, setPendingTransactions] = useState<PendingTransaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [isProfessional, setIsProfessional] = useState(false);
  const [professionalId, setProfessionalId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      checkIfProfessional();
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadPendingTransactions();
      
      // Set up realtime subscription for transaction updates
      const channel = supabase
        .channel('transaction-confirmations')
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'transactions',
            filter: isProfessional 
              ? `professional_id=eq.${professionalId}`
              : `user_id=eq.${user.id}`
          },
          () => {
            loadPendingTransactions();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user, isProfessional, professionalId]);

  const checkIfProfessional = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('professionals')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (!error && data) {
      setIsProfessional(true);
      setProfessionalId(data.id);
    }
  };

  const loadPendingTransactions = async () => {
    if (!user) return;

    try {
      setLoading(true);

      let query = supabase
        .from('transactions')
        .select(`
          id,
          user_id,
          professional_id,
          service_type,
          started_at,
          user_confirmed_completion,
          professional_confirmed_completion,
          user_confirmed_at,
          professional_confirmed_at,
          professionals!inner(full_name, profession)
        `)
        .eq('status', 'in_progress')
        .not('confirmation_requested_at', 'is', null);

      if (isProfessional && professionalId) {
        query = query.eq('professional_id', professionalId);
      } else {
        query = query.eq('user_id', user.id);
      }

      const { data, error } = await query;

      if (error) throw error;

      setPendingTransactions(data || []);
    } catch (error) {
      console.error('Error loading pending transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const confirmCompletion = async (transactionId: string, completed: boolean) => {
    if (!user) return;

    try {
      const updateData: any = {};
      
      if (isProfessional) {
        updateData.professional_confirmed_completion = completed;
        updateData.professional_confirmed_at = new Date().toISOString();
      } else {
        updateData.user_confirmed_completion = completed;
        updateData.user_confirmed_at = new Date().toISOString();
      }

      const { error: updateError } = await supabase
        .from('transactions')
        .update(updateData)
        .eq('id', transactionId);

      if (updateError) throw updateError;

      // Check if both parties have confirmed
      const { data: transaction, error: fetchError } = await supabase
        .from('transactions')
        .select('user_confirmed_completion, professional_confirmed_completion, user_id, professional_id')
        .eq('id', transactionId)
        .single();

      if (fetchError) throw fetchError;

      // If both confirmed as completed, update transaction status
      if (transaction.user_confirmed_completion && transaction.professional_confirmed_completion) {
        const { error: completeError } = await supabase
          .from('transactions')
          .update({ 
            status: 'completed',
            completed_at: new Date().toISOString(),
            both_confirmed_at: new Date().toISOString()
          })
          .eq('id', transactionId);

        if (completeError) throw completeError;

        // Send notifications to both parties that they can now rate each other
        await supabase
          .from('notifications')
          .insert([
            {
              user_id: transaction.user_id,
              title: '¡Hora de calificar!',
              message: '¡Ambos confirmaron que el trabajo se completó! Ahora pueden calificarse mutuamente.',
              type: 'success',
              action_url: `/user/dashboard?rate_transaction=${transactionId}`
            },
            {
              user_id: transaction.professional_id,
              title: '¡Hora de calificar!',
              message: '¡Ambos confirmaron que el trabajo se completó! Ahora pueden calificarse mutuamente.',
              type: 'success',
              action_url: `/professional/dashboard?rate_transaction=${transactionId}`
            }
          ]);

        toast.success('¡Confirmación completa! Ahora pueden calificarse mutuamente.');
      } else {
        toast.success(completed ? 'Confirmación enviada' : 'Respuesta registrada');
      }

      loadPendingTransactions();
    } catch (error) {
      console.error('Error confirming transaction:', error);
      toast.error('Error al confirmar la transacción');
    }
  };

  return {
    pendingTransactions,
    loading,
    isProfessional,
    confirmCompletion,
    refreshTransactions: loadPendingTransactions
  };
};
