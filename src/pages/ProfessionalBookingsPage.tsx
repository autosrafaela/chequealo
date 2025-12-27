import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Booking, BookingStatus } from '@/types/booking';
import { BookingCard } from '@/components/BookingCard';
import { useBookings } from '@/hooks/useBookings';
import { Loader2 } from 'lucide-react';

export default function ProfessionalBookingsPage() {
  const navigate = useNavigate();
  const { bookings: rawBookings, loading, refreshBookings } = useBookings();
  const [activeTab, setActiveTab] = useState<'pending' | 'confirmed' | 'past'>('pending');

  // Transform raw bookings to match Booking type
  const bookings: Booking[] = rawBookings.map(b => ({
    id: b.id,
    userId: b.user_id,
    professionalId: b.professional_id,
    serviceId: b.service_id || '',
    professional: {
      id: b.professional_id,
      name: 'Profesional',
      title: '',
      avatar: '/placeholder.svg',
      phone: ''
    },
    user: {
      id: b.user_id,
      name: b.client_name,
      email: b.client_email,
      phone: b.client_phone,
      avatar: '/placeholder.svg'
    },
    service: {
      id: b.service_id || '',
      name: b.professional_services?.service_name || 'Servicio',
      duration: b.duration_minutes,
      price: b.professional_services?.price_from || 0
    },
    date: new Date(b.booking_date),
    time: new Date(b.booking_date).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }),
    status: b.status as BookingStatus,
    notes: b.notes,
    createdAt: b.created_at,
    updatedAt: b.updated_at
  }));

  const pendingBookings = bookings.filter(b => b.status === 'pending');
  const confirmedBookings = bookings.filter(b => b.status === 'confirmed');
  const pastBookings = bookings.filter(b => 
    ['completed', 'cancelled', 'rejected'].includes(b.status) ||
    new Date(b.date) < new Date()
  );

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* TopAppBar */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
        {/* Header */}
        <div className="flex items-center justify-between px-4 h-14">
          <button
            onClick={() => navigate(-1)}
            className="flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-muted text-foreground transition-colors"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          
          <h1 className="text-lg font-bold text-foreground">
            Solicitudes de Reserva
          </h1>
          
          <div className="w-10" />
        </div>

        {/* Tabs */}
        <div className="px-4">
          <div className="flex border-b border-border">
            {/* Pendientes */}
            <button
              onClick={() => setActiveTab('pending')}
              className="flex-1 flex flex-col items-center pb-3 pt-2"
            >
              <span className={`text-sm font-bold flex items-center gap-1 ${
                activeTab === 'pending' ? 'text-foreground' : 'text-muted-foreground'
              }`}>
                Pendientes
                {pendingBookings.length > 0 && (
                  <span className="bg-orange-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                    {pendingBookings.length}
                  </span>
                )}
              </span>
              <div className={`h-0.5 w-full mt-2 rounded-full ${
                activeTab === 'pending' ? 'bg-primary' : 'bg-transparent'
              }`} />
            </button>

            {/* Confirmadas */}
            <button
              onClick={() => setActiveTab('confirmed')}
              className="flex-1 flex flex-col items-center pb-3 pt-2"
            >
              <span className={`text-sm font-bold ${
                activeTab === 'confirmed' ? 'text-foreground' : 'text-muted-foreground'
              }`}>
                Confirmadas ({confirmedBookings.length})
              </span>
              <div className={`h-0.5 w-full mt-2 rounded-full ${
                activeTab === 'confirmed' ? 'bg-primary' : 'bg-transparent'
              }`} />
            </button>

            {/* Pasadas */}
            <button
              onClick={() => setActiveTab('past')}
              className="flex-1 flex flex-col items-center pb-3 pt-2"
            >
              <span className={`text-sm font-bold ${
                activeTab === 'past' ? 'text-foreground' : 'text-muted-foreground'
              }`}>
                Pasadas ({pastBookings.length})
              </span>
              <div className={`h-0.5 w-full mt-2 rounded-full ${
                activeTab === 'past' ? 'bg-primary' : 'bg-transparent'
              }`} />
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {activeTab === 'pending' && (
              <>
                {pendingBookings.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                    <span className="material-symbols-outlined text-6xl text-muted-foreground mb-4">
                      inbox
                    </span>
                    <p className="text-muted-foreground text-base">
                      No tenés solicitudes pendientes
                    </p>
                    <p className="text-muted-foreground text-sm mt-2">
                      Las nuevas reservas aparecerán acá
                    </p>
                  </div>
                ) : (
                  pendingBookings.map(booking => (
                    <BookingCard 
                      key={booking.id} 
                      booking={booking} 
                      isProfessionalView={true}
                      onStatusChange={refreshBookings}
                    />
                  ))
                )}
              </>
            )}

            {activeTab === 'confirmed' && (
              <>
                {confirmedBookings.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                    <span className="material-symbols-outlined text-6xl text-muted-foreground mb-4">
                      event_available
                    </span>
                    <p className="text-muted-foreground text-base">
                      No tenés reservas confirmadas
                    </p>
                  </div>
                ) : (
                  confirmedBookings.map(booking => (
                    <BookingCard 
                      key={booking.id} 
                      booking={booking} 
                      isProfessionalView={true}
                      onStatusChange={refreshBookings}
                    />
                  ))
                )}
              </>
            )}

            {activeTab === 'past' && (
              <>
                {pastBookings.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                    <span className="material-symbols-outlined text-6xl text-muted-foreground mb-4">
                      history
                    </span>
                    <p className="text-muted-foreground text-base">
                      No tenés reservas pasadas
                    </p>
                  </div>
                ) : (
                  pastBookings.map(booking => (
                    <BookingCard 
                      key={booking.id} 
                      booking={booking} 
                      isPast={true}
                      isProfessionalView={true}
                      onStatusChange={refreshBookings}
                    />
                  ))
                )}
              </>
            )}
          </>
        )}
      </main>
    </div>
  );
}
