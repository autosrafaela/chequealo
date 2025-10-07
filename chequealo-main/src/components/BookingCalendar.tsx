import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { PlanRestrictionsAlert } from './PlanRestrictionsAlert';
import { useBookings } from '@/hooks/useBookings';
import { usePlanRestrictions } from '@/hooks/usePlanRestrictions';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Calendar as CalendarIcon, Clock, User, Mail, Phone, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from 'sonner';

interface BookingCalendarProps {
  professionalId: string;
  services?: Array<{
    id: string;
    service_name: string;
    price_from: number;
    price_to: number;
  }>;
  onBookingCreated?: () => void;
}

export const BookingCalendar: React.FC<BookingCalendarProps> = ({ 
  professionalId, 
  services = [], 
  onBookingCreated 
}) => {
  const { createBooking, getAvailableSlots, creating, checkBookingLimits } = useBookings();
  const { planLimits } = usePlanRestrictions();
  
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [availableSlots, setAvailableSlots] = useState<any[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<any>(null);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [canCreateBooking, setCanCreateBooking] = useState(true);
  
  const [bookingForm, setBookingForm] = useState({
    service_id: '',
    duration_minutes: 60,
    notes: '',
    client_name: '',
    client_email: '',
    client_phone: '',
    total_amount: 0
  });

  useEffect(() => {
    if (selectedDate) {
      loadAvailableSlots();
    }
  }, [selectedDate, professionalId]);

  useEffect(() => {
    checkLimits();
  }, []);

  const checkLimits = async () => {
    const canBook = await checkBookingLimits();
    setCanCreateBooking(canBook);
  };

  const loadAvailableSlots = async () => {
    if (!selectedDate) return;
    
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    const slots = await getAvailableSlots(professionalId, dateStr);
    setAvailableSlots(slots);
  };

  const handleSlotSelect = (slot: any) => {
    setSelectedSlot(slot);
    setShowBookingForm(true);
    
    // Set default duration from slot
    setBookingForm(prev => ({
      ...prev,
      duration_minutes: slot.slot_duration_minutes
    }));
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedDate || !selectedSlot) {
      toast.error('Por favor selecciona una fecha y horario');
      return;
    }

    if (!canCreateBooking) {
      toast.error('Has alcanzado el límite de reservas para tu plan');
      return;
    }

    // Create booking date/time
    const bookingDateTime = new Date(selectedDate);
    const [hours, minutes] = selectedSlot.start_time.split(':');
    bookingDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

    const bookingData = {
      professional_id: professionalId,
      service_id: bookingForm.service_id || undefined,
      booking_date: bookingDateTime.toISOString(),
      duration_minutes: bookingForm.duration_minutes,
      notes: bookingForm.notes,
      client_name: bookingForm.client_name,
      client_email: bookingForm.client_email,
      client_phone: bookingForm.client_phone || undefined,
      total_amount: bookingForm.total_amount || undefined
    };

    const result = await createBooking(bookingData);
    
    if (result) {
      setShowBookingForm(false);
      setSelectedSlot(null);
      setBookingForm({
        service_id: '',
        duration_minutes: 60,
        notes: '',
        client_name: '',
        client_email: '',
        client_phone: '',
        total_amount: 0
      });
      
      if (onBookingCreated) {
        onBookingCreated();
      }
      
      // Reload available slots
      loadAvailableSlots();
    }
  };

  const generateTimeSlots = (slot: any) => {
    const slots = [];
    const startTime = new Date(`2000-01-01T${slot.start_time}`);
    const endTime = new Date(`2000-01-01T${slot.end_time}`);
    const duration = slot.slot_duration_minutes;

    while (startTime < endTime) {
      const timeStr = format(startTime, 'HH:mm');
      const endTimeStr = format(new Date(startTime.getTime() + duration * 60000), 'HH:mm');
      
      slots.push({
        ...slot,
        time_slot: `${timeStr} - ${endTimeStr}`,
        start_time: timeStr
      });
      
      startTime.setMinutes(startTime.getMinutes() + duration);
    }

    return slots;
  };

  // Check if booking system is available for current plan
  if (!planLimits.canAccessAdvancedFeatures) {
    return (
      <PlanRestrictionsAlert 
        featureType="contacts"
        onUpgrade={() => {
          // Handle upgrade logic
          window.location.href = '/pricing';
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Reservar Cita
          </CardTitle>
          <CardDescription>
            Selecciona una fecha y horario disponible para tu cita
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Plan Limits Warning */}
          {!canCreateBooking && (
            <PlanRestrictionsAlert 
              featureType="contacts"
              onUpgrade={() => window.location.href = '/pricing'}
            />
          )}

          {/* Date Selection */}
          <div className="space-y-2">
            <Label>Fecha de la cita</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !selectedDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? format(selectedDate, "PPP", { locale: es }) : "Seleccionar fecha"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  disabled={(date) => date < new Date()}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Available Time Slots */}
          {selectedDate && (
            <div className="space-y-3">
              <Label>Horarios disponibles</Label>
              {availableSlots.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No hay horarios disponibles para esta fecha
                </p>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {availableSlots.map((slot) => 
                    generateTimeSlots(slot).map((timeSlot, index) => (
                      <Button
                        key={`${slot.id}-${index}`}
                        variant="outline"
                        className="text-sm"
                        onClick={() => handleSlotSelect(timeSlot)}
                        disabled={!canCreateBooking}
                      >
                        <Clock className="w-3 h-3 mr-1" />
                        {timeSlot.time_slot}
                      </Button>
                    ))
                  )}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Booking Form Dialog */}
      <Dialog open={showBookingForm} onOpenChange={setShowBookingForm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmar Reserva</DialogTitle>
            <DialogDescription>
              {selectedDate && selectedSlot && (
                <>
                  Fecha: {format(selectedDate, "PPP", { locale: es })}
                  <br />
                  Horario: {selectedSlot.time_slot}
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleBookingSubmit} className="space-y-4">
            {/* Service Selection */}
            {services.length > 0 && (
              <div className="space-y-2">
                <Label htmlFor="service">Servicio (opcional)</Label>
                <Select
                  value={bookingForm.service_id}
                  onValueChange={(value) => {
                    setBookingForm(prev => ({ ...prev, service_id: value }));
                    
                    // Auto-fill price if service selected
                    const service = services.find(s => s.id === value);
                    if (service) {
                      setBookingForm(prev => ({ 
                        ...prev, 
                        total_amount: service.price_from 
                      }));
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar servicio" />
                  </SelectTrigger>
                  <SelectContent>
                    {services.map((service) => (
                      <SelectItem key={service.id} value={service.id}>
                        {service.service_name} - ${service.price_from.toLocaleString()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Client Information */}
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="client_name">Nombre completo *</Label>
                <Input
                  id="client_name"
                  value={bookingForm.client_name}
                  onChange={(e) => setBookingForm(prev => ({ ...prev, client_name: e.target.value }))}
                  required
                  placeholder="Tu nombre completo"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="client_email">Email *</Label>
                <Input
                  id="client_email"
                  type="email"
                  value={bookingForm.client_email}
                  onChange={(e) => setBookingForm(prev => ({ ...prev, client_email: e.target.value }))}
                  required
                  placeholder="tu@email.com"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="client_phone">Teléfono</Label>
                <Input
                  id="client_phone"
                  value={bookingForm.client_phone}
                  onChange={(e) => setBookingForm(prev => ({ ...prev, client_phone: e.target.value }))}
                  placeholder="Ej: +54 9 11 1234-5678"
                />
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notas adicionales</Label>
              <Textarea
                id="notes"
                value={bookingForm.notes}
                onChange={(e) => setBookingForm(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Detalles sobre la cita, requerimientos especiales, etc."
                rows={3}
              />
            </div>

            {/* Duration */}
            <div className="space-y-2">
              <Label htmlFor="duration">Duración (minutos)</Label>
              <Input
                id="duration"
                type="number"
                min="15"
                max="480"
                step="15"
                value={bookingForm.duration_minutes}
                onChange={(e) => setBookingForm(prev => ({ ...prev, duration_minutes: parseInt(e.target.value) }))}
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowBookingForm(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={creating || !canCreateBooking}
                className="flex-1"
              >
                {creating ? 'Creando...' : 'Confirmar Reserva'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};