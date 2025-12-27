import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useBookings } from '@/hooks/useBookings';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface Service {
  id: string;
  service_name: string;
  price_from?: number;
  price_to?: number;
  description?: string;
}

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  professionalId: string;
  professionalName: string;
  professionalAvatar?: string;
  services: Service[];
}

export function BookingModal({
  isOpen,
  onClose,
  professionalId,
  professionalName,
  professionalAvatar,
  services
}: BookingModalProps) {
  const { user, profile } = useAuth();
  const { createBooking, getAvailableSlots, creating } = useBookings();
  
  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    notes: ''
  });

  // Pre-fill form with user data
  useEffect(() => {
    if (user && profile) {
      setFormData(prev => ({
        ...prev,
        name: profile.full_name || '',
        email: user.email || '',
        phone: ''
      }));
    }
  }, [user, profile]);

  // Fetch available times when date changes
  useEffect(() => {
    if (selectedDate && professionalId) {
      fetchAvailableTimes();
    }
  }, [selectedDate, professionalId]);

  const fetchAvailableTimes = async () => {
    if (!selectedDate) return;
    
    setLoadingSlots(true);
    try {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      const slots = await getAvailableSlots(professionalId, dateStr);
      
      // Generate time slots from availability
      const times: string[] = [];
      slots.forEach(slot => {
        const [startHour, startMin] = slot.start_time.split(':').map(Number);
        const [endHour, endMin] = slot.end_time.split(':').map(Number);
        
        let currentHour = startHour;
        let currentMin = startMin;
        
        while (currentHour < endHour || (currentHour === endHour && currentMin < endMin)) {
          times.push(`${String(currentHour).padStart(2, '0')}:${String(currentMin).padStart(2, '0')}`);
          currentMin += slot.slot_duration_minutes || 30;
          if (currentMin >= 60) {
            currentHour += Math.floor(currentMin / 60);
            currentMin = currentMin % 60;
          }
        }
      });
      
      // If no slots configured, provide default times
      if (times.length === 0) {
        const defaultTimes = [
          '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
          '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00'
        ];
        setAvailableTimes(defaultTimes);
      } else {
        setAvailableTimes(times);
      }
    } catch (error) {
      console.error('Error fetching slots:', error);
      // Provide default times on error
      setAvailableTimes([
        '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
        '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00'
      ]);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedService || !selectedDate || !selectedTime) {
      toast.error('Por favor completá todos los campos');
      return;
    }

    if (!formData.name || !formData.email) {
      toast.error('Nombre y email son requeridos');
      return;
    }

    const service = services.find(s => s.id === selectedService);
    const bookingDateTime = format(selectedDate, 'yyyy-MM-dd') + 'T' + selectedTime + ':00';

    const result = await createBooking({
      professional_id: professionalId,
      service_id: selectedService,
      booking_date: bookingDateTime,
      duration_minutes: 30,
      notes: formData.notes,
      client_name: formData.name,
      client_email: formData.email,
      client_phone: formData.phone,
      total_amount: service?.price_from
    });

    if (result) {
      toast.success('¡Reserva creada exitosamente!');
      onClose();
      resetForm();
    }
  };

  const resetForm = () => {
    setStep(1);
    setSelectedService('');
    setSelectedDate(undefined);
    setSelectedTime('');
    setFormData({
      name: profile?.full_name || '',
      email: user?.email || '',
      phone: '',
      notes: ''
    });
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const canProceedStep1 = selectedService !== '';
  const canProceedStep2 = selectedDate && selectedTime;
  const canSubmit = canProceedStep1 && canProceedStep2 && formData.name && formData.email;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div
              className="bg-center bg-no-repeat bg-cover rounded-full h-10 w-10 border-2 border-border"
              style={{ backgroundImage: `url("${professionalAvatar || '/placeholder.svg'}")` }}
            />
            <div>
              <p className="text-base font-bold">Reservar con {professionalName}</p>
              <p className="text-sm text-muted-foreground font-normal">Paso {step} de 3</p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Step 1: Select Service */}
          {step === 1 && (
            <div className="space-y-4">
              <Label className="text-base font-semibold">Seleccioná un servicio</Label>
              <div className="space-y-2">
                {services.length > 0 ? (
                  services.map(service => (
                    <div
                      key={service.id}
                      onClick={() => setSelectedService(service.id)}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        selectedService === service.id
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-bold text-foreground">{service.service_name}</p>
                          {service.description && (
                            <p className="text-sm text-muted-foreground mt-1">{service.description}</p>
                          )}
                        </div>
                        <p className="font-bold text-primary">
                          {service.price_from ? `$${service.price_from.toLocaleString()}` : 'Consultar'}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-center py-4">
                    No hay servicios disponibles
                  </p>
                )}
              </div>
              
              <Button
                className="w-full"
                disabled={!canProceedStep1}
                onClick={() => setStep(2)}
              >
                Continuar
              </Button>
            </div>
          )}

          {/* Step 2: Select Date & Time */}
          {step === 2 && (
            <div className="space-y-4">
              <Label className="text-base font-semibold">Elegí fecha y hora</Label>
              
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                disabled={(date) => date < new Date() || date.getDay() === 0}
                locale={es}
                className="rounded-xl border"
              />

              {selectedDate && (
                <div className="space-y-2">
                  <Label>Horarios disponibles</Label>
                  {loadingSlots ? (
                    <div className="flex justify-center py-4">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                  ) : (
                    <div className="grid grid-cols-4 gap-2">
                      {availableTimes.map(time => (
                        <button
                          key={time}
                          onClick={() => setSelectedTime(time)}
                          className={`p-2 rounded-lg text-sm font-medium transition-all ${
                            selectedTime === time
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted hover:bg-muted/80 text-foreground'
                          }`}
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => setStep(1)}>
                  Atrás
                </Button>
                <Button
                  className="flex-1"
                  disabled={!canProceedStep2}
                  onClick={() => setStep(3)}
                >
                  Continuar
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Contact Details */}
          {step === 3 && (
            <div className="space-y-4">
              <Label className="text-base font-semibold">Tus datos de contacto</Label>
              
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre completo *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Tu nombre"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="tu@email.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Teléfono (opcional)</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="+54 11 1234 5678"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notas adicionales (opcional)</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Algún detalle que quieras mencionar..."
                    rows={3}
                  />
                </div>
              </div>

              {/* Summary */}
              <div className="bg-muted rounded-xl p-4 space-y-2">
                <p className="font-bold text-sm">Resumen de tu reserva</p>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>📅 {selectedDate && format(selectedDate, "EEEE d 'de' MMMM", { locale: es })}</p>
                  <p>🕐 {selectedTime} hs</p>
                  <p>💼 {services.find(s => s.id === selectedService)?.service_name}</p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => setStep(2)}>
                  Atrás
                </Button>
                <Button
                  className="flex-1"
                  disabled={!canSubmit || creating}
                  onClick={handleSubmit}
                >
                  {creating ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  Confirmar Reserva
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
