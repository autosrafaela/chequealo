import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface AgendaSlot {
  id: string;
  professional_id: string;
  slot_date: string;
  block_type: 'morning' | 'afternoon' | 'evening';
  status: 'available' | 'hold' | 'booked';
  hold_expires_at: string | null;
  hold_by_user_id: string | null;
  booked_by_user_id: string | null;
  booked_by_name: string | null;
  booked_by_email: string | null;
  booked_by_phone: string | null;
  booking_notes: string | null;
  deposit_amount: number;
  deposit_paid: boolean;
  mercadopago_preference_id: string | null;
  mercadopago_payment_id: string | null;
  created_at: string;
  updated_at: string;
}

export const BLOCK_LABELS: Record<string, string> = {
  morning: 'Mañana (8-12h)',
  afternoon: 'Tarde (12-18h)',
  evening: 'Noche (18-22h)',
};

export const BLOCK_TIMES: Record<string, string> = {
  morning: '08:00 - 12:00',
  afternoon: '12:00 - 18:00',
  evening: '18:00 - 22:00',
};

// Hook for viewing professional's agenda (public)
export const useProfessionalAgenda = (professionalId: string | undefined) => {
  return useQuery({
    queryKey: ['agenda-slots', professionalId],
    queryFn: async () => {
      if (!professionalId) return [];

      // Release expired holds first (ignore errors)
      try {
        await supabase.rpc('release_expired_agenda_holds');
      } catch {
        // Ignore errors from releasing holds
      }

      const today = new Date().toISOString().split('T')[0];
      const weekEnd = new Date();
      weekEnd.setDate(weekEnd.getDate() + 7);
      
      const { data, error } = await supabase
        .from('agenda_slots')
        .select('*')
        .eq('professional_id', professionalId)
        .gte('slot_date', today)
        .lte('slot_date', weekEnd.toISOString().split('T')[0])
        .order('slot_date', { ascending: true })
        .order('block_type', { ascending: true });

      if (error) throw error;
      return (data || []) as AgendaSlot[];
    },
    enabled: !!professionalId,
    staleTime: 1000 * 30, // 30 seconds - refresh frequently for availability
    refetchInterval: 1000 * 60, // Refetch every minute
  });
};

// Hook for professional to manage their agenda
export const useAgendaManager = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: professionalData } = useQuery({
    queryKey: ['my-professional', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase
        .from('professionals')
        .select('id')
        .eq('user_id', user.id)
        .single();
      return data;
    },
    enabled: !!user,
  });

  const { data: mySlots, isLoading } = useQuery({
    queryKey: ['my-agenda-slots', professionalData?.id],
    queryFn: async () => {
      if (!professionalData?.id) return [];

      const today = new Date().toISOString().split('T')[0];
      const monthEnd = new Date();
      monthEnd.setDate(monthEnd.getDate() + 30);
      
      const { data, error } = await supabase
        .from('agenda_slots')
        .select('*')
        .eq('professional_id', professionalData.id)
        .gte('slot_date', today)
        .lte('slot_date', monthEnd.toISOString().split('T')[0])
        .order('slot_date', { ascending: true });

      if (error) throw error;
      return (data || []) as AgendaSlot[];
    },
    enabled: !!professionalData?.id,
  });

  // Create/toggle slot availability
  const toggleSlot = useMutation({
    mutationFn: async ({ date, blockType, depositAmount }: { 
      date: string; 
      blockType: string; 
      depositAmount?: number;
    }) => {
      if (!professionalData?.id) throw new Error('No professional profile');

      // Check if slot exists
      const { data: existing } = await supabase
        .from('agenda_slots')
        .select('id, status')
        .eq('professional_id', professionalData.id)
        .eq('slot_date', date)
        .eq('block_type', blockType)
        .maybeSingle();

      if (existing) {
        // If exists and available, remove it
        if (existing.status === 'available') {
          const { error } = await supabase
            .from('agenda_slots')
            .delete()
            .eq('id', existing.id);
          if (error) throw error;
          return { action: 'removed' };
        } else {
          throw new Error('No se puede eliminar un slot reservado o en espera');
        }
      } else {
        // Create new slot
        const { error } = await supabase
          .from('agenda_slots')
          .insert({
            professional_id: professionalData.id,
            slot_date: date,
            block_type: blockType,
            status: 'available',
            deposit_amount: depositAmount || 0,
          });
        if (error) throw error;
        return { action: 'created' };
      }
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['my-agenda-slots'] });
      queryClient.invalidateQueries({ queryKey: ['agenda-slots'] });
      toast.success(result.action === 'created' ? 'Bloque agregado' : 'Bloque eliminado');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // Update deposit amount for a slot
  const updateDeposit = useMutation({
    mutationFn: async ({ slotId, depositAmount }: { slotId: string; depositAmount: number }) => {
      const { error } = await supabase
        .from('agenda_slots')
        .update({ deposit_amount: depositAmount })
        .eq('id', slotId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-agenda-slots'] });
      toast.success('Seña actualizada');
    },
  });

  return {
    mySlots,
    isLoading,
    professionalId: professionalData?.id,
    toggleSlot,
    updateDeposit,
  };
};

// Hook for booking a slot
export const useBookSlot = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Hold a slot (15 min reservation)
  const holdSlot = useMutation({
    mutationFn: async (slotId: string) => {
      if (!user) throw new Error('Debes iniciar sesión para reservar');

      // Release any existing holds by this user
      await supabase.rpc('release_expired_agenda_holds');

      const holdExpires = new Date();
      holdExpires.setMinutes(holdExpires.getMinutes() + 15);

      const { data, error } = await supabase
        .from('agenda_slots')
        .update({
          status: 'hold',
          hold_by_user_id: user.id,
          hold_expires_at: holdExpires.toISOString(),
        })
        .eq('id', slotId)
        .eq('status', 'available')
        .select()
        .single();

      if (error) throw new Error('Este bloque ya no está disponible');
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agenda-slots'] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // Confirm booking after payment
  const confirmBooking = useMutation({
    mutationFn: async ({
      slotId,
      name,
      email,
      phone,
      notes,
      paymentId,
    }: {
      slotId: string;
      name: string;
      email: string;
      phone?: string;
      notes?: string;
      paymentId?: string;
    }) => {
      if (!user) throw new Error('No user');

      const { data, error } = await supabase
        .from('agenda_slots')
        .update({
          status: 'booked',
          booked_by_user_id: user.id,
          booked_by_name: name,
          booked_by_email: email,
          booked_by_phone: phone || null,
          booking_notes: notes || null,
          deposit_paid: true,
          mercadopago_payment_id: paymentId || null,
          hold_by_user_id: null,
          hold_expires_at: null,
        })
        .eq('id', slotId)
        .or(`hold_by_user_id.eq.${user.id},status.eq.available`)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agenda-slots'] });
      toast.success('¡Turno reservado exitosamente!');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // Cancel hold
  const cancelHold = useMutation({
    mutationFn: async (slotId: string) => {
      if (!user) return;

      const { error } = await supabase
        .from('agenda_slots')
        .update({
          status: 'available',
          hold_by_user_id: null,
          hold_expires_at: null,
        })
        .eq('id', slotId)
        .eq('hold_by_user_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agenda-slots'] });
    },
  });

  return {
    holdSlot,
    confirmBooking,
    cancelHold,
  };
};
