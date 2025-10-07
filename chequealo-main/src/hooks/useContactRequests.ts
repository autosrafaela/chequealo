import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface ContactRequest {
  id: string;
  professional_id: string;
  user_id: string;
  type: 'contact' | 'quote';
  name: string;
  email: string;
  phone?: string;
  message: string;
  service_type?: string;
  budget_range?: string;
  status: 'pending' | 'contacted' | 'closed';
  created_at: string;
  updated_at: string;
}

export const useContactRequests = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<ContactRequest[]>([]);
  const [loading, setLoading] = useState(false);

  const loadRequests = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Get professional ID for current user
      const { data: professional, error: profError } = await supabase
        .from('professionals')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (profError) throw profError;
      
      if (!professional) {
        setRequests([]);
        return;
      }

      const { data, error } = await supabase
        .from('contact_requests')
        .select('*')
        .eq('professional_id', professional.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setRequests(data as ContactRequest[] || []);
    } catch (error) {
      console.error('Error loading contact requests:', error);
      toast.error('Error al cargar las solicitudes');
    } finally {
      setLoading(false);
    }
  };

  const updateRequestStatus = async (requestId: string, status: ContactRequest['status']) => {
    try {
      const { error } = await supabase
        .from('contact_requests')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', requestId);

      if (error) throw error;
      
      setRequests(prev => 
        prev.map(req => 
          req.id === requestId ? { ...req, status, updated_at: new Date().toISOString() } : req
        )
      );
      
      toast.success('Estado actualizado correctamente');
    } catch (error) {
      console.error('Error updating request status:', error);
      toast.error('Error al actualizar el estado');
    }
  };

  useEffect(() => {
    loadRequests();
  }, [user]);

  return {
    requests,
    loading,
    loadRequests,
    updateRequestStatus
  };
};