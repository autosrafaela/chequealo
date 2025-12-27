import React from 'react';
import { Booking, BookingStatus } from '@/types/booking';
import { useBookings } from '@/hooks/useBookings';
import { toast } from 'sonner';

interface BookingCardProps {
  booking: Booking;
  isPast?: boolean;
  isProfessionalView?: boolean;
  onStatusChange?: () => void;
}

export function BookingCard({ 
  booking, 
  isPast = false, 
  isProfessionalView = false,
  onStatusChange 
}: BookingCardProps) {
  const { updateBookingStatus } = useBookings();

  const getStatusConfig = (status: BookingStatus) => {
    const configs = {
      pending: { 
        label: 'Pendiente', 
        bgClass: 'bg-orange-100 dark:bg-orange-900/30',
        textClass: 'text-orange-700 dark:text-orange-300'
      },
      confirmed: { 
        label: 'Confirmada', 
        bgClass: 'bg-green-100 dark:bg-green-900/30',
        textClass: 'text-green-700 dark:text-green-300'
      },
      cancelled: { 
        label: 'Cancelada', 
        bgClass: 'bg-red-100 dark:bg-red-900/30',
        textClass: 'text-red-700 dark:text-red-300'
      },
      completed: { 
        label: 'Completada', 
        bgClass: 'bg-blue-100 dark:bg-blue-900/30',
        textClass: 'text-blue-700 dark:text-blue-300'
      },
      rejected: { 
        label: 'Rechazada', 
        bgClass: 'bg-gray-100 dark:bg-gray-900/30',
        textClass: 'text-gray-700 dark:text-gray-300'
      }
    };
    return configs[status] || configs.pending;
  };

  const getServiceIcon = (serviceName: string): string => {
    const iconMap: Record<string, string> = {
      'dermatolog': 'medical_services',
      'doctor': 'medical_services',
      'medic': 'medical_services',
      'corte': 'content_cut',
      'barba': 'content_cut',
      'peluquer': 'content_cut',
      'mecanico': 'build',
      'aceite': 'build',
      'reparacion': 'build',
      'yoga': 'self_improvement',
      'fitness': 'self_improvement',
      'limpieza': 'cleaning_services',
      'plomer': 'plumbing',
      'electric': 'electrical_services',
      'default': 'work'
    };

    const lowerName = serviceName.toLowerCase();
    const key = Object.keys(iconMap).find(k => lowerName.includes(k));
    return iconMap[key || 'default'];
  };

  const formatDate = (date: Date | string): string => {
    const d = new Date(date);
    const day = d.getDate();
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    return `${day} ${months[d.getMonth()]}`;
  };

  const statusConfig = getStatusConfig(booking.status);
  const serviceIcon = getServiceIcon(booking.service.name);
  
  // Determine which person to show based on view
  const displayPerson = isProfessionalView 
    ? { name: booking.user?.name || 'Cliente', avatar: booking.user?.avatar, phone: booking.user?.phone }
    : { name: booking.professional.name, avatar: booking.professional.avatar, phone: booking.professional.phone };

  const handleCancel = async () => {
    if (window.confirm('¿Estás seguro que querés cancelar esta reserva?')) {
      const success = await updateBookingStatus(booking.id, 'cancelled');
      if (success) {
        toast.success('Reserva cancelada');
        onStatusChange?.();
      }
    }
  };

  const handleConfirm = async () => {
    const success = await updateBookingStatus(booking.id, 'confirmed');
    if (success) {
      toast.success('Reserva confirmada');
      onStatusChange?.();
    }
  };

  const handleReject = async () => {
    if (window.confirm('¿Estás seguro que querés rechazar esta reserva?')) {
      const success = await updateBookingStatus(booking.id, 'rejected');
      if (success) {
        toast.success('Reserva rechazada');
        onStatusChange?.();
      }
    }
  };

  const handleWhatsApp = () => {
    const phone = displayPerson.phone?.replace(/[^0-9]/g, '');
    if (phone) {
      const message = encodeURIComponent(
        `Hola ${displayPerson.name}, es sobre mi reserva del ${formatDate(booking.date)} a las ${booking.time}`
      );
      window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
    } else {
      toast.error('Teléfono no disponible');
    }
  };

  const handleCall = () => {
    if (displayPerson.phone) {
      window.location.href = `tel:${displayPerson.phone}`;
    } else {
      toast.error('Teléfono no disponible');
    }
  };

  return (
    <div className="flex flex-col bg-card p-4 border-b border-border hover:bg-muted/50 transition-colors cursor-pointer">
      {/* Main content */}
      <div className="flex items-start gap-4">
        {/* Avatar con badge de servicio */}
        <div className="relative flex-shrink-0">
          <div
            className="bg-center bg-no-repeat bg-cover rounded-full h-14 w-14 border-2 border-border"
            style={{
              backgroundImage: `url("${displayPerson.avatar || '/placeholder.svg'}")`
            }}
          />
          <div className="absolute -bottom-1 -right-1 bg-card rounded-full p-0.5 shadow-sm">
            <div className="bg-primary/10 rounded-full p-1">
              <span className="material-symbols-outlined text-primary text-[18px]">
                {serviceIcon}
              </span>
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          {/* Header: nombre + badge */}
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="text-foreground text-base font-bold truncate">
                {displayPerson.name}
              </h3>
              <p className="text-muted-foreground text-sm truncate">
                {booking.service.name}
              </p>
            </div>
            
            {/* Badge de estado */}
            <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-bold leading-none flex-shrink-0 ${statusConfig.bgClass} ${statusConfig.textClass}`}>
              {statusConfig.label}
            </span>
          </div>

          {/* Fecha y hora */}
          <div className="flex items-center gap-4 mt-2">
            <div className="flex items-center gap-1 text-muted-foreground text-sm">
              <span className="material-symbols-outlined text-[18px]">calendar_today</span>
              {formatDate(booking.date)}
            </div>
            <div className="flex items-center gap-1 text-muted-foreground text-sm">
              <span className="material-symbols-outlined text-[18px]">schedule</span>
              {booking.time}
            </div>
          </div>
        </div>
      </div>

      {/* Actions footer */}
      {!isPast && booking.status !== 'cancelled' && booking.status !== 'rejected' && (
        <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-border">
          {/* USUARIO: Cancelar + Contactar */}
          {!isProfessionalView && (
            <>
              <button
                onClick={handleCancel}
                className="flex items-center justify-center rounded-lg px-4 py-2 text-destructive hover:bg-destructive/10 text-sm font-bold transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleWhatsApp}
                className="flex items-center justify-center rounded-lg px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-bold ml-2 transition-colors shadow-sm"
              >
                <span className="material-symbols-outlined text-[18px] mr-1">chat</span>
                Contactar
              </button>
            </>
          )}

          {/* PROFESIONAL: Confirmar/Rechazar si está pending */}
          {isProfessionalView && booking.status === 'pending' && (
            <>
              <button
                onClick={handleReject}
                className="flex items-center justify-center rounded-lg px-4 py-2 text-destructive hover:bg-destructive/10 text-sm font-bold transition-colors"
              >
                Rechazar
              </button>
              <button
                onClick={handleConfirm}
                className="flex items-center justify-center rounded-lg px-4 py-2 bg-green-600 text-white hover:bg-green-700 text-sm font-bold ml-2 transition-colors shadow-sm"
              >
                <span className="material-symbols-outlined text-[18px] mr-1">check</span>
                Confirmar
              </button>
            </>
          )}

          {/* PROFESIONAL: Botones para confirmadas */}
          {isProfessionalView && booking.status === 'confirmed' && (
            <>
              <button
                onClick={handleCancel}
                className="flex items-center justify-center rounded-lg px-4 py-2 text-destructive hover:bg-destructive/10 text-sm font-bold transition-colors"
              >
                Cancelar
              </button>
              {displayPerson.phone && (
                <button
                  onClick={handleCall}
                  className="flex items-center justify-center rounded-lg px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-bold ml-2 transition-colors shadow-sm"
                >
                  <span className="material-symbols-outlined text-[18px] mr-1">call</span>
                  Llamar
                </button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
