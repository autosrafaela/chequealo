import { useState } from 'react';
import { Calendar, Clock, Plus, Trash2, DollarSign } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAgendaManager, BLOCK_LABELS, BLOCK_TIMES } from '@/hooks/useAgendaSlots';
import { format, addDays } from 'date-fns';
import { es } from 'date-fns/locale';

export const AgendaManager = () => {
  const { mySlots, isLoading, toggleSlot, updateDeposit } = useAgendaManager();
  const [defaultDeposit, setDefaultDeposit] = useState(500);
  const [selectedDays, setSelectedDays] = useState<number>(7);

  // Generate next N days
  const daysToShow = Array.from({ length: selectedDays }, (_, i) => {
    const date = addDays(new Date(), i);
    return {
      date: format(date, 'yyyy-MM-dd'),
      label: format(date, 'EEE d/M', { locale: es }),
      isWeekend: date.getDay() === 0 || date.getDay() === 6,
    };
  });

  const getSlotForDateBlock = (date: string, blockType: string) => {
    return mySlots?.find(s => s.slot_date === date && s.block_type === blockType);
  };

  const handleToggleSlot = (date: string, blockType: string) => {
    toggleSlot.mutate({ date, blockType, depositAmount: defaultDeposit });
  };

  const getSlotStatusBadge = (status: string) => {
    switch (status) {
      case 'booked':
        return <Badge variant="destructive" className="text-xs">Reservado</Badge>;
      case 'hold':
        return <Badge variant="outline" className="text-xs bg-yellow-100">En espera</Badge>;
      default:
        return <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">Disponible</Badge>;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/4" />
            <div className="h-32 bg-muted rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          Gestionar Agenda Pública
        </CardTitle>
        <CardDescription>
          Configurá los bloques horarios disponibles para que los clientes puedan reservar
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Settings */}
        <div className="flex flex-wrap gap-4 p-4 bg-muted/50 rounded-lg">
          <div className="flex-1 min-w-[200px]">
            <Label htmlFor="defaultDeposit" className="text-sm">
              Seña por defecto ($)
            </Label>
            <div className="flex items-center gap-2 mt-1">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <Input
                id="defaultDeposit"
                type="number"
                value={defaultDeposit}
                onChange={(e) => setDefaultDeposit(Number(e.target.value))}
                className="w-32"
                min={0}
              />
            </div>
          </div>
          <div className="flex-1 min-w-[200px]">
            <Label className="text-sm">Días a mostrar</Label>
            <div className="flex gap-2 mt-1">
              {[7, 14, 30].map(days => (
                <Button
                  key={days}
                  size="sm"
                  variant={selectedDays === days ? "default" : "outline"}
                  onClick={() => setSelectedDays(days)}
                >
                  {days} días
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Quick add all blocks for a week */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              daysToShow.slice(0, 7).forEach(day => {
                if (!day.isWeekend) {
                  ['morning', 'afternoon'].forEach(block => {
                    const existing = getSlotForDateBlock(day.date, block);
                    if (!existing) {
                      toggleSlot.mutate({ date: day.date, blockType: block, depositAmount: defaultDeposit });
                    }
                  });
                }
              });
            }}
          >
            <Plus className="h-4 w-4 mr-1" />
            Agregar Lun-Vie (mañana/tarde)
          </Button>
        </div>

        {/* Grid */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2 text-sm font-medium text-muted-foreground w-32">
                  Bloque
                </th>
                {daysToShow.map(day => (
                  <th 
                    key={day.date} 
                    className={`p-2 text-center text-sm ${day.isWeekend ? 'bg-muted/50' : ''}`}
                  >
                    <div className="font-medium">{day.label}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(['morning', 'afternoon', 'evening'] as const).map(blockType => (
                <tr key={blockType} className="border-b">
                  <td className="p-2">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="text-sm font-medium">{BLOCK_LABELS[blockType].split(' ')[0]}</div>
                        <div className="text-xs text-muted-foreground">{BLOCK_TIMES[blockType]}</div>
                      </div>
                    </div>
                  </td>
                  {daysToShow.map(day => {
                    const slot = getSlotForDateBlock(day.date, blockType);
                    
                    return (
                      <td 
                        key={`${day.date}-${blockType}`} 
                        className={`p-1 text-center ${day.isWeekend ? 'bg-muted/50' : ''}`}
                      >
                        {slot ? (
                          <div className="space-y-1">
                            {getSlotStatusBadge(slot.status)}
                            {slot.status === 'available' && (
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                                onClick={() => handleToggleSlot(day.date, blockType)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            )}
                            {slot.status === 'booked' && slot.booked_by_name && (
                              <div className="text-xs text-muted-foreground truncate max-w-[80px]" title={slot.booked_by_name}>
                                {slot.booked_by_name}
                              </div>
                            )}
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 w-8 p-0"
                            onClick={() => handleToggleSlot(day.date, blockType)}
                            disabled={toggleSlot.isPending}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-green-100 text-green-800">Disponible</Badge>
            <span>Click en X para eliminar</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="destructive">Reservado</Badge>
            <span>No se puede modificar</span>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" className="h-6 w-6 p-0">
              <Plus className="h-3 w-3" />
            </Button>
            <span>Click para agregar</span>
          </div>
        </div>

        {/* Stats */}
        {mySlots && mySlots.length > 0 && (
          <div className="grid grid-cols-3 gap-4 p-4 bg-muted/30 rounded-lg">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {mySlots.filter(s => s.status === 'available').length}
              </div>
              <div className="text-xs text-muted-foreground">Disponibles</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {mySlots.filter(s => s.status === 'booked').length}
              </div>
              <div className="text-xs text-muted-foreground">Reservados</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {mySlots.filter(s => s.status === 'hold').length}
              </div>
              <div className="text-xs text-muted-foreground">En espera</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
