import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { 
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { format, addDays, startOfWeek, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';

interface TimeSlot {
  id?: string;
  date: Date;
  hour: number;
  is_available: boolean;
}

// Horarios de trabajo (9 AM a 6 PM)
const WORK_HOURS = Array.from({ length: 10 }, (_, i) => i + 9);

export const AvailabilityCalendar = () => {
  const { user } = useAuth();
  const [timeSlots, setTimeSlots] = useState<Map<string, boolean>>(new Map());
  const [loading, setLoading] = useState(true);
  const [professionalId, setProfessionalId] = useState<string | null>(null);
  const [weekStart, setWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  useEffect(() => {
    fetchProfessionalData();
  }, [user]);

  useEffect(() => {
    if (professionalId) {
      fetchAvailabilitySlots();
    }
  }, [professionalId]);

  const fetchProfessionalData = async () => {
    if (!user) return;

    try {
      const { data: professional } = await supabase
        .from('professionals')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (professional) {
        setProfessionalId(professional.id);
      }
    } catch (error) {
      console.error('Error fetching professional data:', error);
    }
  };

  const fetchAvailabilitySlots = async () => {
    if (!professionalId) return;

    try {
      setLoading(true);
      
      // Obtener slots de la semana actual
      const startDate = format(weekDays[0], 'yyyy-MM-dd');
      const endDate = format(weekDays[6], 'yyyy-MM-dd');
      
      const { data: slots, error } = await supabase
        .from('availability_slots')
        .select('*')
        .eq('professional_id', professionalId)
        .gte('start_time', startDate)
        .lte('start_time', endDate);

      if (error) throw error;
      
      // Construir mapa de disponibilidad
      const newMap = new Map<string, boolean>();
      slots?.forEach(slot => {
        const key = `${slot.start_time}-${slot.day_of_week}`;
        newMap.set(key, slot.is_available);
      });
      
      setTimeSlots(newMap);
    } catch (error) {
      console.error('Error fetching availability slots:', error);
      toast.error('Error al cargar horarios disponibles');
    } finally {
      setLoading(false);
    }
  };

  const getSlotKey = (date: Date, hour: number) => {
    return `${format(date, 'yyyy-MM-dd')}-${hour}`;
  };

  const isSlotAvailable = (date: Date, hour: number) => {
    const key = getSlotKey(date, hour);
    return timeSlots.get(key) ?? false;
  };

  const handleToggleSlot = async (date: Date, hour: number) => {
    if (!professionalId) return;

    const key = getSlotKey(date, hour);
    const currentAvailability = timeSlots.get(key) ?? false;
    const newAvailability = !currentAvailability;

    // Actualizar UI inmediatamente
    const newMap = new Map(timeSlots);
    newMap.set(key, newAvailability);
    setTimeSlots(newMap);

    try {
      const slotTime = `${format(date, 'yyyy-MM-dd')} ${hour.toString().padStart(2, '0')}:00:00`;
      const dayOfWeek = date.getDay();

      // Verificar si existe el slot
      const { data: existingSlot } = await supabase
        .from('availability_slots')
        .select('id')
        .eq('professional_id', professionalId)
        .eq('start_time', slotTime)
        .eq('day_of_week', dayOfWeek)
        .maybeSingle();

      if (existingSlot) {
        // Actualizar existente
        const { error } = await supabase
          .from('availability_slots')
          .update({ is_available: newAvailability })
          .eq('id', existingSlot.id);

        if (error) throw error;
      } else {
        // Crear nuevo
        const { error } = await supabase
          .from('availability_slots')
          .insert({
            professional_id: professionalId,
            day_of_week: dayOfWeek,
            start_time: slotTime,
            end_time: slotTime,
            is_available: newAvailability,
            slot_duration_minutes: 60,
            max_bookings_per_slot: 1
          });

        if (error) throw error;
      }

      toast.success(newAvailability ? 'Horario disponible' : 'Horario no disponible');
    } catch (error) {
      console.error('Error toggling slot:', error);
      toast.error('Error al actualizar disponibilidad');
      // Revertir cambio en UI
      const revertMap = new Map(timeSlots);
      revertMap.set(key, currentAvailability);
      setTimeSlots(revertMap);
    }
  };

  const goToPreviousWeek = () => {
    setWeekStart(addDays(weekStart, -7));
  };

  const goToNextWeek = () => {
    setWeekStart(addDays(weekStart, 7));
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Cargando calendario...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5" />
              Gestión de Disponibilidad
            </CardTitle>
            <CardDescription>
              Haz click en cada horario para marcarlo como disponible o no disponible
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={goToPreviousWeek}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium min-w-[200px] text-center">
              {format(weekDays[0], "d 'de' MMM", { locale: es })} - {format(weekDays[6], "d 'de' MMM yyyy", { locale: es })}
            </span>
            <Button variant="outline" size="icon" onClick={goToNextWeek}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <div className="min-w-[800px]">
            {/* Header con días */}
            <div className="grid grid-cols-8 gap-1 mb-2">
              <div className="text-xs font-medium text-muted-foreground p-2">
                Hora
              </div>
              {weekDays.map((day) => (
                <div
                  key={day.toISOString()}
                  className={`text-center p-2 rounded-t-lg ${
                    isSameDay(day, new Date())
                      ? 'bg-primary/10 font-semibold'
                      : 'bg-muted/50'
                  }`}
                >
                  <div className="text-xs font-medium">
                    {format(day, 'EEE', { locale: es })}
                  </div>
                  <div className="text-lg font-bold">
                    {format(day, 'd')}
                  </div>
                </div>
              ))}
            </div>

            {/* Grid de horarios */}
            {WORK_HOURS.map((hour) => (
              <div key={hour} className="grid grid-cols-8 gap-1 mb-1">
                <div className="text-sm font-medium text-muted-foreground p-2 flex items-center">
                  {hour.toString().padStart(2, '0')}:00
                </div>
                {weekDays.map((day) => {
                  const available = isSlotAvailable(day, hour);
                  const isPast = new Date(day.setHours(hour, 0, 0, 0)) < new Date();
                  
                  return (
                    <button
                      key={`${day.toISOString()}-${hour}`}
                      onClick={() => !isPast && handleToggleSlot(day, hour)}
                      disabled={isPast}
                      className={`
                        p-3 rounded-lg border-2 transition-all text-xs font-medium
                        ${isPast 
                          ? 'bg-muted/30 cursor-not-allowed opacity-50' 
                          : available
                          ? 'bg-primary border-primary text-primary-foreground hover:bg-primary/90 cursor-pointer'
                          : 'bg-background border-border hover:bg-muted cursor-pointer'
                        }
                      `}
                    >
                      {available ? 'Disponible' : 'No disp.'}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-primary"></div>
            <span>Disponible</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-background border-2"></div>
            <span>No disponible</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-muted/30"></div>
            <span>Pasado</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};