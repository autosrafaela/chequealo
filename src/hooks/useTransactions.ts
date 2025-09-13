import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface Transaction {
  id: string;
  user_id: string;
  professional_id: string;
  contact_request_id?: string;
  service_type?: string;
  amount?: number;
  status: string;
  started_at?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
  profiles?: {
    full_name?: string;
    email?: string;
  };
}

interface TransactionStats {
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
  cancelled: number;
  totalRevenue: number;
  averageTransaction: number;
}

export const useTransactions = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stats, setStats] = useState<TransactionStats>({
    total: 0,
    pending: 0,
    inProgress: 0,
    completed: 0,
    cancelled: 0,
    totalRevenue: 0,
    averageTransaction: 0
  });
  const [loading, setLoading] = useState(false);

  const fetchTransactions = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Get professional ID
      const { data: professional } = await supabase
        .from('professionals')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!professional) {
        setTransactions([]);
        return;
      }

      // First get transactions
      const { data: transactionData, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('professional_id', professional.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Then get profiles for all users
      const userIds = transactionData?.map(t => t.user_id).filter(Boolean) || [];
      let profilesData: any[] = [];
      
      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, full_name, email')
          .in('user_id', userIds);
        
        profilesData = profiles || [];
      }

      // Combine data
      const transactionsWithProfiles = transactionData?.map(transaction => ({
        ...transaction,
        profiles: profilesData.find(p => p.user_id === transaction.user_id)
      })) || [];
      
      setTransactions(transactionsWithProfiles);
      
      // Calculate stats
      const stats = {
        total: transactionsWithProfiles.length,
        pending: transactionsWithProfiles.filter(t => t.status === 'pending').length,
        inProgress: transactionsWithProfiles.filter(t => t.status === 'in_progress').length,
        completed: transactionsWithProfiles.filter(t => t.status === 'completed').length,
        cancelled: transactionsWithProfiles.filter(t => t.status === 'cancelled').length,
        totalRevenue: transactionsWithProfiles
          .filter(t => t.status === 'completed' && t.amount)
          .reduce((sum, t) => sum + (t.amount || 0), 0),
        averageTransaction: 0
      };
      
      const completedWithAmount = transactionsWithProfiles.filter(t => t.status === 'completed' && t.amount);
      if (completedWithAmount.length > 0) {
        stats.averageTransaction = stats.totalRevenue / completedWithAmount.length;
      }
      
      setStats(stats);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast.error('Error al cargar las transacciones');
    } finally {
      setLoading(false);
    }
  };

  const updateTransactionStatus = async (transactionId: string, status: string) => {
    try {
      const updateData: any = { status };
      
      if (status === 'in_progress') {
        updateData.started_at = new Date().toISOString();
      } else if (status === 'completed') {
        updateData.completed_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('transactions')
        .update(updateData)
        .eq('id', transactionId);

      if (error) throw error;

      toast.success('Estado actualizado correctamente');
      fetchTransactions();
    } catch (error) {
      console.error('Error updating transaction:', error);
      toast.error('Error al actualizar el estado');
    }
  };

  const createTransaction = async (transactionData: {
    userId: string;
    serviceType: string;
    amount?: string;
    contactRequestId?: string;
  }) => {
    if (!user) return false;

    try {
      // Get professional ID
      const { data: professional } = await supabase
        .from('professionals')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!professional) return false;

      const { error } = await supabase
        .from('transactions')
        .insert({
          professional_id: professional.id,
          user_id: transactionData.userId,
          service_type: transactionData.serviceType,
          amount: transactionData.amount ? parseFloat(transactionData.amount) : null,
          contact_request_id: transactionData.contactRequestId || null
        });

      if (error) throw error;

      toast.success('Trabajo creado exitosamente');
      fetchTransactions();
      return true;
    } catch (error) {
      console.error('Error creating transaction:', error);
      toast.error('Error al crear el trabajo');
      return false;
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [user]);

  return {
    transactions,
    stats,
    loading,
    fetchTransactions,
    updateTransactionStatus,
    createTransaction
  };
};