import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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

const fetchProfessionalId = async (userId: string): Promise<string | null> => {
  const { data, error } = await supabase
    .from('professionals')
    .select('id')
    .eq('user_id', userId)
    .maybeSingle();
  
  if (error) throw error;
  return data?.id || null;
};

const fetchRequests = async (professionalId: string): Promise<ContactRequest[]> => {
  const { data, error } = await supabase
    .from('contact_requests')
    .select('*')
    .eq('professional_id', professionalId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data as ContactRequest[]) || [];
};

export const useContactRequests = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // First get professional ID
  const { data: professionalId } = useQuery({
    queryKey: ['my-professional-id', user?.id],
    queryFn: () => fetchProfessionalId(user!.id),
    enabled: !!user,
    staleTime: 30 * 60 * 1000, // 30 minutes - rarely changes
  });

  // Then get contact requests
  const { data: requests = [], isLoading: loading } = useQuery({
    queryKey: ['contact-requests', professionalId],
    queryFn: () => fetchRequests(professionalId!),
    enabled: !!professionalId,
    staleTime: 2 * 60 * 1000, // 2 minutes - more dynamic
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ requestId, status }: { requestId: string; status: ContactRequest['status'] }) => {
      const { error } = await supabase
        .from('contact_requests')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', requestId);

      if (error) throw error;
      return { requestId, status };
    },
    onMutate: async ({ requestId, status }) => {
      await queryClient.cancelQueries({ queryKey: ['contact-requests', professionalId] });
      const previous = queryClient.getQueryData<ContactRequest[]>(['contact-requests', professionalId]);
      queryClient.setQueryData(
        ['contact-requests', professionalId],
        (old: ContactRequest[] | undefined) =>
          old?.map(req =>
            req.id === requestId
              ? { ...req, status, updated_at: new Date().toISOString() }
              : req
          ) || []
      );
      return { previous };
    },
    onError: (_, __, context) => {
      queryClient.setQueryData(['contact-requests', professionalId], context?.previous);
      toast.error('Error al actualizar el estado');
    },
    onSuccess: () => toast.success('Estado actualizado correctamente'),
  });

  const updateRequestStatus = (requestId: string, status: ContactRequest['status']) => {
    updateStatusMutation.mutate({ requestId, status });
  };

  const loadRequests = () => {
    queryClient.invalidateQueries({ queryKey: ['contact-requests', professionalId] });
  };

  return {
    requests,
    loading,
    loadRequests,
    updateRequestStatus
  };
};
