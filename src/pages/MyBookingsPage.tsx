import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Booking, BookingStatus } from '@/types/booking';
import { BookingCard } from '@/components/BookingCard';
import { useBookings } from '@/hooks/useBookings';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

export default function MyBookingsPage() {
  const navigate = useNavigate();
  const { bookings: rawBookings, loading, refreshBookings } = useBookings();
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');

  // Transform raw bookings to match Booking type
  const bookings: Booking[] = rawBookings.map(b => ({
    id: b.id,
    userId: b.user_id,
    professionalId: b.professional_id,
    serviceId: b.service_id || '',
    professional: {
      id: b.professional_id,
      name: 'Profesional', // Will be loaded separately
      title: '',
      avatar: '/placeholder.svg',
      phone: b.client_phone
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

  const upcomingBookings = bookings.filter(b => 
    ['pending', 'confirmed'].includes(b.status) && 
    new Date(b.date) >= new Date()
  );

  const pastBookings = bookings.filter(b =>
    b.status === 'completed' ||
    b.status === 'cancelled' ||
    b.status === 'rejected' ||
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
            Mis Reservas
          </h1>
          
          <button className="flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-muted">
            <span className="material-symbols-outlined text-muted-foreground">help</span>
          </button>
        </div>

        {/* Tabs */}
        <div className="px-4">
          <div className="flex border-b border-border">
            {/* Tab Próximas */}
            <button
              onClick={() => setActiveTab('upcoming')}
              className="flex-1 flex flex-col items-center pb-3 pt-2"
            >
              <span className={`text-sm font-bold ${
                activeTab === 'upcoming' ? 'text-foreground' : 'text-muted-foreground'
              }`}>
                Próximas
              </span>
              <div className={`h-0.5 w-full mt-2 rounded-full ${
                activeTab === 'upcoming' ? 'bg-primary' : 'bg-transparent'
              }`} />
            </button>

            {/* Tab Pasadas */}
            <button
              onClick={() => setActiveTab('past')}
              className="flex-1 flex flex-col items-center pb-3 pt-2"
            >
              <span className={`text-sm font-bold ${
                activeTab === 'past' ? 'text-foreground' : 'text-muted-foreground'
              }`}>
                Pasadas
              </span>
              <div className={`h-0.5 w-full mt-2 rounded-full ${
                activeTab === 'past' ? 'bg-primary' : 'bg-transparent'
              }`} />
            </button>
          </div>
        </div>
      </header>

      {/* Content List */}
      <main className="flex-1">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {/* Próximas */}
            {activeTab === 'upcoming' && (
              <>
                {upcomingBookings.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                    <span className="material-symbols-outlined text-6xl text-muted-foreground mb-4">
                      event_busy
                    </span>
                    <p className="text-muted-foreground text-base">
                      No tenés reservas próximas
                    </p>
                    <p className="text-muted-foreground text-sm mt-2">
                      Explorá profesionales y agendá tu primera reserva
                    </p>
                  </div>
                ) : (
                  upcomingBookings.map(booking => (
                    <BookingCard 
                      key={booking.id} 
                      booking={booking} 
                      isPast={false}
                      onStatusChange={refreshBookings}
                    />
                  ))
                )}
              </>
            )}

            {/* Pasadas */}
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
