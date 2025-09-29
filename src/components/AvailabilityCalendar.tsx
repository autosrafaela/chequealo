import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { PlanRestrictionsAlert } from './PlanRestrictionsAlert';
import { usePlanRestrictions } from '@/hooks/usePlanRestrictions';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { 
  Clock, 
  Plus, 
  Trash2, 
  Calendar as CalendarIcon,
  Settings
} from "lucide-react";

interface AvailabilitySlot {
  id?: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_available: boolean;
  slot_duration_minutes: number;
  max_bookings_per_slot: number;
}

const DAYS_OF_WEEK = [
  { value: 0, label: 'Domingo' },
  { value: 1, label: 'Lunes' },
  { value: 2, label: 'Martes' },
  { value: 3, label: 'Miércoles' },
  { value: 4, label: 'Jueves' },
  { value: 5, label: 'Viernes' },
  { value: 6, label: 'Sábado' }
];

export const AvailabilityCalendar = () => {
  const { user } = useAuth();
  const { planLimits } = usePlanRestrictions();
  const [availabilitySlots, setAvailabilitySlots] = useState<AvailabilitySlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [professionalId, setProfessionalId] = useState<string | null>(null);

  const [newSlot, setNewSlot] = useState<AvailabilitySlot>({
    day_of_week: 1,
    start_time: '09:00',
    end_time: '17:00',
    is_available: true,
    slot_duration_minutes: 60,
    max_bookings_per_slot: 1
  });

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
      const { data: slots, error } = await supabase
        .from('availability_slots')
        .select('*')
        .eq('professional_id', professionalId)
        .order('day_of_week', { ascending: true })
        .order('start_time', { ascending: true });

      if (error) throw error;
      setAvailabilitySlots(slots || []);
    } catch (error) {
      console.error('Error fetching availability slots:', error);
      toast.error('Error al cargar horarios disponibles');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSlot = async () => {
    if (!professionalId) return;

    // Check plan restrictions for advanced availability features
    if (!planLimits.calendarIntegration && availabilitySlots.length >= 5) {
      toast.error('Tu plan actual solo permite 5 horarios básicos. Actualiza para más opciones.');
      return;
    }

    try {
      const { error } = await supabase
        .from('availability_slots')
        .insert({
          ...newSlot,
          professional_id: professionalId
        });

      if (error) throw error;

      toast.success('Horario agregado exitosamente');
      fetchAvailabilitySlots();
      
      // Reset form
      setNewSlot({
        day_of_week: 1,
        start_time: '09:00',
        end_time: '17:00',
        is_available: true,
        slot_duration_minutes: 60,
        max_bookings_per_slot: 1
      });
    } catch (error) {
      console.error('Error adding availability slot:', error);
      toast.error('Error al agregar horario');
    }
  };

  const handleDeleteSlot = async (slotId: string) => {
    try {
      const { error } = await supabase
        .from('availability_slots')
        .delete()
        .eq('id', slotId);

      if (error) throw error;

      toast.success('Horario eliminado exitosamente');
      fetchAvailabilitySlots();
    } catch (error) {
      console.error('Error deleting slot:', error);
      toast.error('Error al eliminar horario');
    }
  };

  const handleToggleSlotAvailability = async (slotId: string, isAvailable: boolean) => {
    try {
      const { error } = await supabase
        .from('availability_slots')
        .update({ is_available: isAvailable })
        .eq('id', slotId);

      if (error) throw error;

      toast.success('Disponibilidad actualizada');
      fetchAvailabilitySlots();
    } catch (error) {
      console.error('Error updating slot availability:', error);
      toast.error('Error al actualizar disponibilidad');
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Cargando horarios disponibles...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5" />
            Gestión de Disponibilidad Avanzada
          </CardTitle>
          <CardDescription>
            Configura tus horarios disponibles de forma detallada
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {!planLimits.calendarIntegration && (
            <PlanRestrictionsAlert 
              featureType="advanced_availability"
              currentUsage={availabilitySlots.length}
            />
          )}

          {/* Agregar nuevo horario */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 border rounded-lg">
            <div>
              <Label htmlFor="day">Día de la semana</Label>
              <Select 
                value={newSlot.day_of_week.toString()} 
                onValueChange={(value) => setNewSlot({...newSlot, day_of_week: parseInt(value)})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar día" />
                </SelectTrigger>
                <SelectContent>
                  {DAYS_OF_WEEK.map(day => (
                    <SelectItem key={day.value} value={day.value.toString()}>
                      {day.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="start_time">Hora inicio</Label>
              <Input
                type="time"
                value={newSlot.start_time}
                onChange={(e) => setNewSlot({...newSlot, start_time: e.target.value})}
              />
            </div>

            <div>
              <Label htmlFor="end_time">Hora fin</Label>
              <Input
                type="time"
                value={newSlot.end_time}
                onChange={(e) => setNewSlot({...newSlot, end_time: e.target.value})}
              />
            </div>

            {planLimits.calendarIntegration && (
              <>
                <div>
                  <Label htmlFor="duration">Duración (min)</Label>
                  <Select 
                    value={newSlot.slot_duration_minutes.toString()}
                    onValueChange={(value) => setNewSlot({...newSlot, slot_duration_minutes: parseInt(value)})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30 minutos</SelectItem>
                      <SelectItem value="60">1 hora</SelectItem>
                      <SelectItem value="90">1.5 horas</SelectItem>
                      <SelectItem value="120">2 horas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="max_bookings">Máx. reservas simultáneas</Label>
                  <Input
                    type="number"
                    min="1"
                    max="10"
                    value={newSlot.max_bookings_per_slot}
                    onChange={(e) => setNewSlot({...newSlot, max_bookings_per_slot: parseInt(e.target.value)})}
                  />
                </div>
              </>
            )}

            <div className="flex items-center space-x-2">
              <Switch
                checked={newSlot.is_available}
                onCheckedChange={(checked) => setNewSlot({...newSlot, is_available: checked})}
              />
              <Label>Disponible</Label>
            </div>

            <div className="md:col-span-2 lg:col-span-3">
              <Button onClick={handleAddSlot} className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Agregar Horario
              </Button>
            </div>
          </div>

          {/* Lista de horarios existentes */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Horarios Configurados</h3>
            {availabilitySlots.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No tienes horarios configurados aún
              </div>
            ) : (
              <div className="grid gap-4">
                {availabilitySlots.map((slot) => (
                  <Card key={slot.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <Badge variant="outline">
                            {DAYS_OF_WEEK.find(d => d.value === slot.day_of_week)?.label}
                          </Badge>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            <span>{slot.start_time} - {slot.end_time}</span>
                          </div>
                          {planLimits.calendarIntegration && (
                            <>
                              <Badge variant="secondary">
                                {slot.slot_duration_minutes}min
                              </Badge>
                              <Badge variant="secondary">
                                Máx: {slot.max_bookings_per_slot}
                              </Badge>
                            </>
                          )}
                          <Badge variant={slot.is_available ? "default" : "destructive"}>
                            {slot.is_available ? "Disponible" : "No disponible"}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={slot.is_available}
                            onCheckedChange={(checked) => handleToggleSlotAvailability(slot.id!, checked)}
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteSlot(slot.id!)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};