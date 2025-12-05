import { useState, useEffect } from 'react';
import { Calendar, Clock, Check, Loader2, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useProfessionalAgenda, useBookSlot, BLOCK_LABELS, BLOCK_TIMES, AgendaSlot } from '@/hooks/useAgendaSlots';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format, addDays, isToday, isTomorrow } from 'date-fns';
import { es } from 'date-fns/locale';

interface PublicAgendaGridProps {
  professionalId: string;
  professionalName: string;
  depositAmount?: number;
}

export const PublicAgendaGrid = ({ professionalId, professionalName, depositAmount = 0 }: PublicAgendaGridProps) => {
  const { user } = useAuth();
  const { data: slots, isLoading, refetch } = useProfessionalAgenda(professionalId);
  const { holdSlot, confirmBooking, cancelHold } = useBookSlot();
  
  const [selectedSlot, setSelectedSlot] = useState<AgendaSlot | null>(null);
  const [showBookingDialog, setShowBookingDialog] = useState(false);
  const [holdTimeRemaining, setHoldTimeRemaining] = useState<number>(0);
  const [bookingForm, setBookingForm] = useState({
    name: '',
    email: '',
    phone: '',
    notes: '',
  });
  const [isProcessing, setIsProcessing] = useState(false);

  // Group slots by date
  const slotsByDate = (slots || []).reduce((acc, slot) => {
    if (!acc[slot.slot_date]) {
      acc[slot.slot_date] = [];
    }
    acc[slot.slot_date].push(slot);
    return acc;
  }, {} as Record<string, AgendaSlot[]>);

  // Get dates to show (today + next 6 days)
  const datesToShow = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(new Date(), i);
    return format(date, 'yyyy-MM-dd');
  });

  // Countdown timer for hold
  useEffect(() => {
    if (!selectedSlot?.hold_expires_at) return;

    const interval = setInterval(() => {
      const expires = new Date(selectedSlot.hold_expires_at!);
      const now = new Date();
      const remaining = Math.max(0, Math.floor((expires.getTime() - now.getTime()) / 1000));
      setHoldTimeRemaining(remaining);

      if (remaining === 0) {
        setSelectedSlot(null);
        setShowBookingDialog(false);
        toast.error('El tiempo de reserva expiró');
        refetch();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [selectedSlot?.hold_expires_at, refetch]);

  const handleSlotClick = async (slot: AgendaSlot) => {
    if (slot.status !== 'available') return;
    
    if (!user) {
      toast.error('Debes iniciar sesión para reservar');
      return;
    }

    try {
      const result = await holdSlot.mutateAsync(slot.id);
      setSelectedSlot(result as AgendaSlot);
      setShowBookingDialog(true);
      setHoldTimeRemaining(15 * 60); // 15 minutes in seconds
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleCancelHold = async () => {
    if (selectedSlot) {
      await cancelHold.mutateAsync(selectedSlot.id);
    }
    setSelectedSlot(null);
    setShowBookingDialog(false);
    setBookingForm({ name: '', email: '', phone: '', notes: '' });
  };

  const handleConfirmBooking = async () => {
    if (!selectedSlot || !bookingForm.name || !bookingForm.email) {
      toast.error('Completá nombre y email');
      return;
    }

    setIsProcessing(true);
    try {
      const slotDeposit = selectedSlot.deposit_amount || depositAmount;
      
      if (slotDeposit > 0) {
        // Create MercadoPago preference for deposit
        const { data, error } = await supabase.functions.invoke('create-agenda-payment', {
          body: {
            slotId: selectedSlot.id,
            amount: slotDeposit,
            professionalName,
            slotDate: selectedSlot.slot_date,
            blockType: selectedSlot.block_type,
            buyerName: bookingForm.name,
            buyerEmail: bookingForm.email,
          },
        });

        if (error) throw error;

        // Redirect to MercadoPago
        if (data?.init_point) {
          // Save booking info temporarily
          localStorage.setItem('pending_agenda_booking', JSON.stringify({
            slotId: selectedSlot.id,
            ...bookingForm,
          }));
          window.location.href = data.init_point;
        }
      } else {
        // No deposit required, confirm directly
        await confirmBooking.mutateAsync({
          slotId: selectedSlot.id,
          name: bookingForm.name,
          email: bookingForm.email,
          phone: bookingForm.phone,
          notes: bookingForm.notes,
        });
        setShowBookingDialog(false);
        setSelectedSlot(null);
        setBookingForm({ name: '', email: '', phone: '', notes: '' });
      }
    } catch (error) {
      console.error('Booking error:', error);
      toast.error('Error al procesar la reserva');
    } finally {
      setIsProcessing(false);
    }
  };

  const formatDateLabel = (dateStr: string) => {
    const date = new Date(dateStr + 'T12:00:00');
    if (isToday(date)) return 'Hoy';
    if (isTomorrow(date)) return 'Mañana';
    return format(date, 'EEE d', { locale: es });
  };

  const getSlotStatus = (slot: AgendaSlot | undefined) => {
    if (!slot) return 'unavailable';
    if (slot.status === 'booked') return 'booked';
    if (slot.status === 'hold') return 'hold';
    return 'available';
  };

  const getSlotStyle = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700 hover:bg-green-200 dark:hover:bg-green-800/50 cursor-pointer';
      case 'booked':
        return 'bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-700 opacity-60';
      case 'hold':
        return 'bg-yellow-100 dark:bg-yellow-900/30 border-yellow-300 dark:border-yellow-700 opacity-60';
      default:
        return 'bg-muted border-muted-foreground/20 opacity-40';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const hasAnySlots = Object.keys(slotsByDate).length > 0;

  if (!hasAnySlots) {
    return null; // Don't show anything if no agenda slots configured
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Agenda de Turnos
          </CardTitle>
          <CardDescription>
            Seleccioná un bloque disponible para reservar
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Legend */}
          <div className="flex flex-wrap gap-4 mb-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-green-200 dark:bg-green-800 border border-green-400" />
              <span>Disponible</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-red-200 dark:bg-red-800 border border-red-400" />
              <span>Reservado</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-muted border" />
              <span>No disponible</span>
            </div>
          </div>

          {/* Grid */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[500px]">
              <thead>
                <tr>
                  <th className="text-left p-2 text-sm font-medium text-muted-foreground">Bloque</th>
                  {datesToShow.map(date => (
                    <th key={date} className="p-2 text-center">
                      <div className="text-sm font-medium">{formatDateLabel(date)}</div>
                      <div className="text-xs text-muted-foreground">
                        {format(new Date(date + 'T12:00:00'), 'd/M')}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(['morning', 'afternoon', 'evening'] as const).map(blockType => (
                  <tr key={blockType}>
                    <td className="p-2">
                      <div className="text-sm font-medium">{BLOCK_LABELS[blockType].split(' ')[0]}</div>
                      <div className="text-xs text-muted-foreground">{BLOCK_TIMES[blockType]}</div>
                    </td>
                    {datesToShow.map(date => {
                      const slot = slotsByDate[date]?.find(s => s.block_type === blockType);
                      const status = getSlotStatus(slot);
                      
                      return (
                        <td key={`${date}-${blockType}`} className="p-1">
                          <button
                            onClick={() => slot && status === 'available' && handleSlotClick(slot)}
                            disabled={status !== 'available'}
                            className={`w-full h-12 rounded-lg border-2 transition-all ${getSlotStyle(status)}`}
                          >
                            {status === 'available' && (
                              <Check className="h-4 w-4 mx-auto text-green-600 dark:text-green-400" />
                            )}
                            {status === 'booked' && (
                              <span className="text-xs text-red-600 dark:text-red-400">Ocupado</span>
                            )}
                            {status === 'hold' && (
                              <Clock className="h-4 w-4 mx-auto text-yellow-600 dark:text-yellow-400" />
                            )}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Booking Dialog */}
      <Dialog open={showBookingDialog} onOpenChange={(open) => !open && handleCancelHold()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reservar Turno</DialogTitle>
            <DialogDescription>
              {selectedSlot && (
                <>
                  {format(new Date(selectedSlot.slot_date + 'T12:00:00'), "EEEE d 'de' MMMM", { locale: es })} - {BLOCK_LABELS[selectedSlot.block_type]}
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          {/* Countdown Timer */}
          {holdTimeRemaining > 0 && (
            <div className="flex items-center gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <span className="text-sm">
                Tenés <strong>{Math.floor(holdTimeRemaining / 60)}:{(holdTimeRemaining % 60).toString().padStart(2, '0')}</strong> para completar la reserva
              </span>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Nombre completo *</Label>
              <Input
                id="name"
                value={bookingForm.name}
                onChange={(e) => setBookingForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Tu nombre"
              />
            </div>
            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={bookingForm.email}
                onChange={(e) => setBookingForm(prev => ({ ...prev, email: e.target.value }))}
                placeholder="tu@email.com"
              />
            </div>
            <div>
              <Label htmlFor="phone">Teléfono (opcional)</Label>
              <Input
                id="phone"
                value={bookingForm.phone}
                onChange={(e) => setBookingForm(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="+54 9 ..."
              />
            </div>
            <div>
              <Label htmlFor="notes">Notas (opcional)</Label>
              <Textarea
                id="notes"
                value={bookingForm.notes}
                onChange={(e) => setBookingForm(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Describí brevemente qué necesitás..."
                rows={2}
              />
            </div>

            {selectedSlot && (selectedSlot.deposit_amount || depositAmount) > 0 && (
              <div className="p-3 bg-primary/5 rounded-lg border">
                <p className="text-sm font-medium">
                  Seña requerida: <span className="text-primary">${selectedSlot.deposit_amount || depositAmount}</span>
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Serás redirigido a MercadoPago para completar el pago
                </p>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={handleCancelHold}>
              Cancelar
            </Button>
            <Button 
              onClick={handleConfirmBooking}
              disabled={isProcessing || !bookingForm.name || !bookingForm.email}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Procesando...
                </>
              ) : (selectedSlot?.deposit_amount || depositAmount) > 0 ? (
                'Pagar seña y reservar'
              ) : (
                'Confirmar reserva'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
