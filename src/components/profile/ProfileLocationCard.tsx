import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Clock, ChevronRight } from 'lucide-react';

interface ProfileLocationCardProps {
  location?: string | null;
  availability?: string | null;
}

export function ProfileLocationCard({ location, availability }: ProfileLocationCardProps) {
  const isOpenNow = availability?.toLowerCase().includes('disponible') || 
                    availability?.toLowerCase().includes('abierto');

  return (
    <Card className="rounded-2xl border-0 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg font-bold">
          <MapPin className="w-5 h-5 text-primary" />
          Ubicación y Horarios
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Dirección */}
        {location && (
          <div className="flex items-start gap-3">
            <div className="p-2 bg-muted rounded-lg">
              <MapPin className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-foreground">{location}</p>
            </div>
          </div>
        )}

        {/* Horario */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-muted rounded-lg">
              <Clock className="w-4 h-4 text-muted-foreground" />
            </div>
            <div>
              {isOpenNow ? (
                <>
                  <p className="font-medium text-success">Abierto ahora</p>
                  <p className="text-xs text-muted-foreground">{availability}</p>
                </>
              ) : (
                <>
                  <p className="font-medium text-muted-foreground">Horario</p>
                  <p className="text-xs text-muted-foreground">{availability || 'No especificado'}</p>
                </>
              )}
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </div>
      </CardContent>
    </Card>
  );
}
