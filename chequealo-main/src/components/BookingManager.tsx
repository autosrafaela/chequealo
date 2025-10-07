import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { PlanRestrictionsAlert } from './PlanRestrictionsAlert';
import { useBookings } from '@/hooks/useBookings';
import { usePlanRestrictions } from '@/hooks/usePlanRestrictions';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  User, 
  Mail, 
  Phone, 
  MessageCircle,
  CheckCircle,
  XCircle,
  AlertCircle,
  MoreHorizontal
} from "lucide-react";

export const BookingManager = () => {
  const { bookings, loading, updateBookingStatus } = useBookings();
  const { planLimits } = usePlanRestrictions();
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [cancellationReason, setCancellationReason] = useState('');

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'pending': { variant: 'secondary' as const, label: 'Pendiente', icon: Clock },
      'confirmed': { variant: 'default' as const, label: 'Confirmada', icon: CheckCircle },
      'cancelled': { variant: 'destructive' as const, label: 'Cancelada', icon: XCircle },
      'completed': { variant: 'default' as const, label: 'Completada', icon: CheckCircle },
      'no_show': { variant: 'destructive' as const, label: 'No se presentó', icon: AlertCircle }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  const handleStatusChange = async () => {
    if (!selectedBooking || !newStatus) return;

    const success = await updateBookingStatus(
      selectedBooking.id, 
      newStatus as any,
      cancellationReason || undefined
    );

    if (success) {
      setShowStatusDialog(false);
      setSelectedBooking(null);
      setNewStatus('');
      setCancellationReason('');
    }
  };

  const groupBookingsByDate = (bookings: any[]) => {
    const grouped = bookings.reduce((acc: any, booking) => {
      const date = format(new Date(booking.booking_date), 'yyyy-MM-dd');
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(booking);
      return acc;
    }, {});

    // Sort by date
    return Object.keys(grouped)
      .sort()
      .reduce((acc: any, date) => {
        acc[date] = grouped[date].sort((a: any, b: any) => 
          new Date(a.booking_date).getTime() - new Date(b.booking_date).getTime()
        );
        return acc;
      }, {});
  };

  const filterBookingsByStatus = (status?: string) => {
    if (!status) return bookings;
    return bookings.filter(booking => booking.status === status);
  };

  const todayBookings = bookings.filter(booking => {
    const bookingDate = format(new Date(booking.booking_date), 'yyyy-MM-dd');
    const today = format(new Date(), 'yyyy-MM-dd');
    return bookingDate === today;
  });

  const upcomingBookings = bookings.filter(booking => {
    const bookingDate = new Date(booking.booking_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return bookingDate > today;
  });

  const pastBookings = bookings.filter(booking => {
    const bookingDate = new Date(booking.booking_date);
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    return bookingDate < today;
  });

  if (!planLimits.canAccessAdvancedFeatures) {
    return (
      <PlanRestrictionsAlert 
        featureType="contacts"
        onUpgrade={() => window.location.href = '/pricing'}
      />
    );
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Cargando reservas...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Gestión de Reservas
          </CardTitle>
          <CardDescription>
            Administra todas tus citas y reservas de clientes
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{todayBookings.length}</div>
            <div className="text-sm text-muted-foreground">Hoy</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{filterBookingsByStatus('confirmed').length}</div>
            <div className="text-sm text-muted-foreground">Confirmadas</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">{filterBookingsByStatus('pending').length}</div>
            <div className="text-sm text-muted-foreground">Pendientes</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{bookings.length}</div>
            <div className="text-sm text-muted-foreground">Total</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="today" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="today">Hoy ({todayBookings.length})</TabsTrigger>
          <TabsTrigger value="upcoming">Próximas ({upcomingBookings.length})</TabsTrigger>
          <TabsTrigger value="past">Pasadas ({pastBookings.length})</TabsTrigger>
          <TabsTrigger value="all">Todas ({bookings.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="today">
          <BookingsList 
            bookings={todayBookings} 
            onStatusChange={(booking) => {
              setSelectedBooking(booking);
              setShowStatusDialog(true);
            }}
          />
        </TabsContent>

        <TabsContent value="upcoming">
          <BookingsList 
            bookings={upcomingBookings} 
            onStatusChange={(booking) => {
              setSelectedBooking(booking);
              setShowStatusDialog(true);
            }}
          />
        </TabsContent>

        <TabsContent value="past">
          <BookingsList 
            bookings={pastBookings} 
            onStatusChange={(booking) => {
              setSelectedBooking(booking);
              setShowStatusDialog(true);
            }}
          />
        </TabsContent>

        <TabsContent value="all">
          <BookingsList 
            bookings={bookings} 
            onStatusChange={(booking) => {
              setSelectedBooking(booking);
              setShowStatusDialog(true);
            }}
          />
        </TabsContent>
      </Tabs>

      {/* Status Change Dialog */}
      <Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cambiar Estado de Reserva</DialogTitle>
            <DialogDescription>
              {selectedBooking && (
                <>
                  Cliente: {selectedBooking.client_name}
                  <br />
                  Fecha: {format(new Date(selectedBooking.booking_date), "PPP 'a las' HH:mm", { locale: es })}
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nuevo estado</Label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="confirmed">Confirmar</SelectItem>
                  <SelectItem value="cancelled">Cancelar</SelectItem>
                  <SelectItem value="completed">Marcar como completada</SelectItem>
                  <SelectItem value="no_show">Cliente no se presentó</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {(newStatus === 'cancelled' || newStatus === 'no_show') && (
              <div className="space-y-2">
                <Label>Motivo {newStatus === 'cancelled' ? 'de cancelación' : 'de ausencia'}</Label>
                <Textarea
                  value={cancellationReason}
                  onChange={(e) => setCancellationReason(e.target.value)}
                  placeholder="Describe el motivo..."
                  rows={3}
                />
              </div>
            )}

            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowStatusDialog(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleStatusChange}
                disabled={!newStatus}
                className="flex-1"
              >
                Confirmar Cambio
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const BookingsList: React.FC<{
  bookings: any[];
  onStatusChange: (booking: any) => void;
}> = ({ bookings, onStatusChange }) => {
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'pending': { variant: 'secondary' as const, label: 'Pendiente', icon: Clock },
      'confirmed': { variant: 'default' as const, label: 'Confirmada', icon: CheckCircle },
      'cancelled': { variant: 'destructive' as const, label: 'Cancelada', icon: XCircle },
      'completed': { variant: 'default' as const, label: 'Completada', icon: CheckCircle },
      'no_show': { variant: 'destructive' as const, label: 'No se presentó', icon: AlertCircle }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  if (bookings.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <CalendarIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No hay reservas</h3>
          <p className="text-muted-foreground">
            Las reservas aparecerán aquí cuando los clientes las soliciten
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {bookings.map((booking) => (
        <Card key={booking.id}>
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="space-y-3 flex-1">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{booking.client_name}</span>
                  </div>
                  {getStatusBadge(booking.status)}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {format(new Date(booking.booking_date), "PPP 'a las' HH:mm", { locale: es })}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{booking.duration_minutes} minutos</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{booking.client_email}</span>
                  </div>

                  {booking.client_phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{booking.client_phone}</span>
                    </div>
                  )}
                </div>

                {booking.professional_services && (
                  <div className="text-sm">
                    <span className="font-medium">Servicio:</span> {booking.professional_services.service_name}
                    {booking.total_amount && (
                      <span className="ml-2 text-muted-foreground">
                        (${booking.total_amount.toLocaleString()})
                      </span>
                    )}
                  </div>
                )}

                {booking.notes && (
                  <div className="text-sm">
                    <span className="font-medium">Notas:</span>
                    <p className="text-muted-foreground mt-1">{booking.notes}</p>
                  </div>
                )}

                {booking.cancellation_reason && (
                  <div className="text-sm">
                    <span className="font-medium text-red-600">Motivo de cancelación:</span>
                    <p className="text-red-600 mt-1">{booking.cancellation_reason}</p>
                  </div>
                )}

                <div className="text-xs text-muted-foreground">
                  Ref: {booking.booking_reference}
                </div>
              </div>

              <div className="flex flex-col gap-2 ml-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onStatusChange(booking)}
                  disabled={booking.status === 'completed'}
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};