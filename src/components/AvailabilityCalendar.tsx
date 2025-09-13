import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Calendar, Clock, Plus, X, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { format, addDays, startOfWeek, endOfWeek, isToday, isSameDay, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

interface TimeSlot {
  id: string;
  date: string;
  start_time: string;
  end_time: string;
  is_available: boolean;
  status: 'available' | 'busy' | 'blocked';
  note?: string;
}

interface AvailabilitySettings {
  monday: { enabled: boolean; start: string; end: string };
  tuesday: { enabled: boolean; start: string; end: string };
  wednesday: { enabled: boolean; start: string; end: string };
  thursday: { enabled: boolean; start: string; end: string };
  friday: { enabled: boolean; start: string; end: string };
  saturday: { enabled: boolean; start: string; end: string };
  sunday: { enabled: boolean; start: string; end: string };
}

export const AvailabilityCalendar = () => {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [availability, setAvailability] = useState<AvailabilitySettings>({
    monday: { enabled: true, start: '09:00', end: '18:00' },
    tuesday: { enabled: true, start: '09:00', end: '18:00' },
    wednesday: { enabled: true, start: '09:00', end: '18:00' },
    thursday: { enabled: true, start: '09:00', end: '18:00' },
    friday: { enabled: true, start: '09:00', end: '18:00' },
    saturday: { enabled: false, start: '09:00', end: '14:00' },
    sunday: { enabled: false, start: '09:00', end: '14:00' }
  });

  const weekDays = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

  const getWeekDays = (date: Date) => {
    const start = startOfWeek(date, { weekStartsOn: 1 }); // Start on Monday
    return Array.from({ length: 7 }, (_, i) => addDays(start, i));
  };

  const generateTimeSlots = () => {
    const days = getWeekDays(currentWeek);
    const slots: TimeSlot[] = [];

    days.forEach((day, dayIndex) => {
      const dayKey = weekDays[dayIndex === 6 ? 0 : dayIndex + 1] as keyof AvailabilitySettings;
      const daySettings = availability[dayKey];

      if (daySettings.enabled) {
        // Generate hourly slots for the day
        const startHour = parseInt(daySettings.start.split(':')[0]);
        const endHour = parseInt(daySettings.end.split(':')[0]);

        for (let hour = startHour; hour < endHour; hour++) {
          const timeString = `${hour.toString().padStart(2, '0')}:00`;
          const endTimeString = `${(hour + 1).toString().padStart(2, '0')}:00`;
          
          slots.push({
            id: `${format(day, 'yyyy-MM-dd')}-${timeString}`,
            date: format(day, 'yyyy-MM-dd'),
            start_time: timeString,
            end_time: endTimeString,
            is_available: true,
            status: 'available'
          });
        }
      }
    });

    setTimeSlots(slots);
  };

  useEffect(() => {
    generateTimeSlots();
  }, [currentWeek, availability]);

  const toggleSlotStatus = (slotId: string) => {
    setTimeSlots(prev => prev.map(slot => {
      if (slot.id === slotId) {
        const newStatus = slot.status === 'available' ? 'busy' : 
                         slot.status === 'busy' ? 'blocked' : 'available';
        return { ...slot, status: newStatus, is_available: newStatus === 'available' };
      }
      return slot;
    }));
  };

  const updateDaySettings = (day: keyof AvailabilitySettings, field: 'enabled' | 'start' | 'end', value: boolean | string) => {
    setAvailability(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value
      }
    }));
  };

  const getStatusColor = (status: TimeSlot['status']) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800 border-green-200';
      case 'busy': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'blocked': return 'bg-red-100 text-red-800 border-red-200';
    }
  };

  const getStatusIcon = (status: TimeSlot['status']) => {
    switch (status) {
      case 'available': return <CheckCircle className="h-3 w-3" />;
      case 'busy': return <Clock className="h-3 w-3" />;
      case 'blocked': return <X className="h-3 w-3" />;
    }
  };

  const saveAvailability = () => {
    // In a real app, this would save to the database
    toast.success('Disponibilidad guardada correctamente');
    setIsSettingsOpen(false);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Calendario de Disponibilidad
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Gestiona tu disponibilidad y horarios de trabajo
            </p>
          </div>
          <div className="flex gap-2">
            <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  Configurar Horarios
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Configurar Horarios de Trabajo</DialogTitle>
                  <DialogDescription>
                    Define tus horarios de trabajo para cada día de la semana
                  </DialogDescription>
                </DialogHeader>
                
                <div className="grid gap-4 py-4">
                  {Object.entries(availability).map(([day, settings], index) => (
                    <div key={day} className="grid grid-cols-4 items-center gap-4 p-3 border rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={settings.enabled}
                          onCheckedChange={(checked) => updateDaySettings(day as keyof AvailabilitySettings, 'enabled', checked)}
                        />
                        <Label className="font-medium">{dayNames[index]}</Label>
                      </div>
                      
                      <div className="space-y-1">
                        <Label className="text-xs">Desde</Label>
                        <Select 
                          value={settings.start} 
                          onValueChange={(value) => updateDaySettings(day as keyof AvailabilitySettings, 'start', value)}
                          disabled={!settings.enabled}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from({ length: 24 }, (_, i) => (
                              <SelectItem key={i} value={`${i.toString().padStart(2, '0')}:00`}>
                                {`${i.toString().padStart(2, '0')}:00`}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-1">
                        <Label className="text-xs">Hasta</Label>
                        <Select 
                          value={settings.end} 
                          onValueChange={(value) => updateDaySettings(day as keyof AvailabilitySettings, 'end', value)}
                          disabled={!settings.enabled}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from({ length: 24 }, (_, i) => (
                              <SelectItem key={i} value={`${i.toString().padStart(2, '0')}:00`}>
                                {`${i.toString().padStart(2, '0')}:00`}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <Badge variant={settings.enabled ? 'default' : 'secondary'}>
                        {settings.enabled ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </div>
                  ))}
                </div>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsSettingsOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={saveAvailability}>
                    Guardar Configuración
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Week Navigation */}
        <div className="flex items-center justify-between mb-6">
          <Button 
            variant="outline" 
            onClick={() => setCurrentWeek(prev => addDays(prev, -7))}
          >
            ← Semana Anterior
          </Button>
          <h3 className="text-lg font-semibold">
            Semana del {format(startOfWeek(currentWeek, { weekStartsOn: 1 }), 'dd MMM', { locale: es })} - {format(endOfWeek(currentWeek, { weekStartsOn: 1 }), 'dd MMM yyyy', { locale: es })}
          </h3>
          <Button 
            variant="outline" 
            onClick={() => setCurrentWeek(prev => addDays(prev, 7))}
          >
            Semana Siguiente →
          </Button>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-2">
          {/* Day Headers */}
          {getWeekDays(currentWeek).map((day, index) => (
            <div key={index} className="text-center p-3 font-medium border-b">
              <div className="text-sm text-muted-foreground">
                {dayNames[(index + 1) % 7]}
              </div>
              <div className={`text-lg ${isToday(day) ? 'text-primary font-bold' : ''}`}>
                {format(day, 'd')}
              </div>
            </div>
          ))}

          {/* Time Slots */}
          {getWeekDays(currentWeek).map((day, dayIndex) => (
            <div key={dayIndex} className="min-h-[300px] border-r last:border-r-0">
              <div className="space-y-1 p-1">
                {timeSlots
                  .filter(slot => isSameDay(parseISO(slot.date), day))
                  .map((slot) => (
                    <div
                      key={slot.id}
                      className={`p-2 rounded text-xs cursor-pointer transition-colors border ${getStatusColor(slot.status)} hover:shadow-sm`}
                      onClick={() => toggleSlotStatus(slot.id)}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{slot.start_time}</span>
                        {getStatusIcon(slot.status)}
                      </div>
                      <div className="text-xs opacity-75 mt-1">
                        {slot.status === 'available' && 'Disponible'}
                        {slot.status === 'busy' && 'Ocupado'}
                        {slot.status === 'blocked' && 'Bloqueado'}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-6 mt-6 p-4 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-100 border border-green-200 rounded"></div>
            <span className="text-sm">Disponible</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-orange-100 border border-orange-200 rounded"></div>
            <span className="text-sm">Ocupado</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-100 border border-red-200 rounded"></div>
            <span className="text-sm">Bloqueado</span>
          </div>
          <div className="text-xs text-muted-foreground">
            Haz clic en un horario para cambiar su estado
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-2 mt-4">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setTimeSlots(prev => prev.map(slot => ({ ...slot, status: 'available', is_available: true })))}
          >
            Marcar Todo Disponible
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setTimeSlots(prev => prev.map(slot => ({ ...slot, status: 'busy', is_available: false })))}
          >
            Marcar Todo Ocupado
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setCurrentWeek(new Date())}
          >
            Ir a Semana Actual
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};