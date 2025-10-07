import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { usePlanRestrictions } from './usePlanRestrictions';
import { toast } from 'sonner';

interface Booking {
  id: string;
  professional_id: string;
  user_id: string;
  service_id?: string;
  booking_date: string;
  duration_minutes: number;
  status: string; // Allow any string from database
  notes?: string;
  client_name: string;
  client_email: string;
  client_phone?: string;
  total_amount?: number;
  currency: string;
  booking_reference: string;
  cancellation_reason?: string;
  created_at: string;
  updated_at: string;
  professional_services?: {
    service_name: string;
    price_from: number;
    price_to: number;
  };
}

interface AvailabilitySlot {
  id: string;
  professional_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_available: boolean;
  slot_duration_minutes: number;
  max_bookings_per_slot: number;
}

export const useBookings = () => {
  const { user } = useAuth();
  const { planLimits, checkContactRequestsLimit } = usePlanRestrictions();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [availabilitySlots, setAvailabilitySlots] = useState<AvailabilitySlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (user) {
      fetchBookings();
      fetchAvailabilitySlots();
    }
  }, [user]);

  const fetchBookings = async () => {
    try {
      setLoading(true);

      // Check if user is professional
      const { data: professional } = await supabase
        .from('professionals')
        .select('id')
        .eq('user_id', user?.id)
        .single();

      let query = supabase
        .from('bookings')
        .select(`
          *,
          professional_services(service_name, price_from, price_to)
        `)
        .order('booking_date', { ascending: true });

      if (professional) {
        // Professional can see their bookings
        query = query.eq('professional_id', professional.id);
      } else {
        // User can see their bookings
        query = query.eq('user_id', user?.id);
      }

      const { data, error } = await query;

      if (error) throw error;
      setBookings(data || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast.error('Error al cargar las reservas');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailabilitySlots = async () => {
    try {
      const { data: professional } = await supabase
        .from('professionals')
        .select('id')
        .eq('user_id', user?.id)
        .single();

      if (!professional) return;

      const { data, error } = await supabase
        .from('availability_slots')
        .select('*')
        .eq('professional_id', professional.id)
        .order('day_of_week', { ascending: true });

      if (error) throw error;
      setAvailabilitySlots(data || []);
    } catch (error) {
      console.error('Error fetching availability slots:', error);
    }
  };

  const checkBookingLimits = async (): Promise<boolean> => {
    if (planLimits.maxContactRequests === -1) return true; // Unlimited for plan

    try {
      const { data: professional } = await supabase
        .from('professionals')
        .select('id')
        .eq('user_id', user?.id)
        .single();

      if (!professional) return false;

      // Check current month's bookings
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { data: monthlyBookings, error } = await supabase
        .from('bookings')
        .select('id')
        .eq('professional_id', professional.id)
        .gte('created_at', startOfMonth.toISOString());

      if (error) throw error;

      const currentBookings = monthlyBookings?.length || 0;
      return currentBookings < (planLimits.maxContactRequests || 20);
    } catch (error) {
      console.error('Error checking booking limits:', error);
      return false;
    }
  };

  const createBooking = async (bookingData: {
    professional_id: string;
    service_id?: string;
    booking_date: string;
    duration_minutes: number;
    notes?: string;
    client_name: string;
    client_email: string;
    client_phone?: string;
    total_amount?: number;
  }) => {
    try {
      setCreating(true);

      const { data, error } = await supabase
        .from('bookings')
        .insert({
          ...bookingData,
          user_id: user?.id,
          currency: 'ARS'
        })
        .select()
        .single();

      if (error) throw error;

      await fetchBookings();
      toast.success('Reserva creada exitosamente');
      return data;
    } catch (error) {
      console.error('Error creating booking:', error);
      toast.error('Error al crear la reserva');
      return null;
    } finally {
      setCreating(false);
    }
  };

  const updateBookingStatus = async (bookingId: string, status: string, cancellationReason?: string) => {
    try {
      const updateData: any = { status };
      if (cancellationReason) {
        updateData.cancellation_reason = cancellationReason;
      }

      const { error } = await supabase
        .from('bookings')
        .update(updateData)
        .eq('id', bookingId);

      if (error) throw error;

      await fetchBookings();
      toast.success('Estado de reserva actualizado');
      return true;
    } catch (error) {
      console.error('Error updating booking status:', error);
      toast.error('Error al actualizar el estado de la reserva');
      return false;
    }
  };

  const createAvailabilitySlot = async (slotData: {
    day_of_week: number;
    start_time: string;
    end_time: string;
    slot_duration_minutes: number;
    max_bookings_per_slot: number;
  }) => {
    try {
      const { data: professional } = await supabase
        .from('professionals')
        .select('id')
        .eq('user_id', user?.id)
        .single();

      if (!professional) throw new Error('Perfil profesional no encontrado');

      const { data, error } = await supabase
        .from('availability_slots')
        .insert({
          ...slotData,
          professional_id: professional.id
        })
        .select()
        .single();

      if (error) throw error;

      await fetchAvailabilitySlots();
      toast.success('Horario de disponibilidad agregado');
      return data;
    } catch (error) {
      console.error('Error creating availability slot:', error);
      toast.error('Error al crear horario de disponibilidad');
      return null;
    }
  };

  const updateAvailabilitySlot = async (slotId: string, updates: Partial<AvailabilitySlot>) => {
    try {
      const { error } = await supabase
        .from('availability_slots')
        .update(updates)
        .eq('id', slotId);

      if (error) throw error;

      await fetchAvailabilitySlots();
      toast.success('Horario actualizado');
      return true;
    } catch (error) {
      console.error('Error updating availability slot:', error);
      toast.error('Error al actualizar horario');
      return false;
    }
  };

  const deleteAvailabilitySlot = async (slotId: string) => {
    try {
      const { error } = await supabase
        .from('availability_slots')
        .delete()
        .eq('id', slotId);

      if (error) throw error;

      await fetchAvailabilitySlots();
      toast.success('Horario eliminado');
      return true;
    } catch (error) {
      console.error('Error deleting availability slot:', error);
      toast.error('Error al eliminar horario');
      return false;
    }
  };

  const getAvailableSlots = async (professionalId: string, date: string) => {
    try {
      const targetDate = new Date(date);
      const dayOfWeek = targetDate.getDay();

      const { data: slots, error } = await supabase
        .from('availability_slots')
        .select('*')
        .eq('professional_id', professionalId)
        .eq('day_of_week', dayOfWeek)
        .eq('is_available', true);

      if (error) throw error;

      // Get existing bookings for this date
      const { data: existingBookings, error: bookingError } = await supabase
        .from('bookings')
        .select('booking_date, duration_minutes')
        .eq('professional_id', professionalId)
        .gte('booking_date', `${date}T00:00:00`)
        .lt('booking_date', `${date}T23:59:59`)
        .in('status', ['pending', 'confirmed']);

      if (bookingError) throw bookingError;

      // Filter out booked slots
      const availableSlots = slots?.filter(slot => {
        const slotStart = new Date(`${date}T${slot.start_time}`);
        const slotEnd = new Date(`${date}T${slot.end_time}`);

        return !existingBookings?.some(booking => {
          const bookingStart = new Date(booking.booking_date);
          const bookingEnd = new Date(bookingStart.getTime() + booking.duration_minutes * 60000);

          return (bookingStart < slotEnd && bookingEnd > slotStart);
        });
      });

      return availableSlots || [];
    } catch (error) {
      console.error('Error getting available slots:', error);
      return [];
    }
  };

  return {
    bookings,
    availabilitySlots,
    loading,
    creating,
    checkBookingLimits,
    createBooking,
    updateBookingStatus,
    createAvailabilitySlot,
    updateAvailabilitySlot,
    deleteAvailabilitySlot,
    getAvailableSlots,
    refreshBookings: fetchBookings,
    refreshAvailability: fetchAvailabilitySlots
  };
};