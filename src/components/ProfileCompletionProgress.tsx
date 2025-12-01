import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { 
  CheckCircle2, 
  Circle, 
  Image, 
  FileText, 
  Phone, 
  MapPin, 
  Briefcase,
  Camera,
  Calendar,
  ChevronRight,
  Trophy
} from 'lucide-react';

interface CompletionItem {
  id: string;
  label: string;
  description: string;
  completed: boolean;
  icon: React.ElementType;
  action?: () => void;
  actionLabel?: string;
}

interface ProfileCompletionProgressProps {
  professionalId?: string;
  onTabChange?: (tab: string) => void;
}

export const ProfileCompletionProgress: React.FC<ProfileCompletionProgressProps> = ({ 
  professionalId,
  onTabChange 
}) => {
  const { user } = useAuth();
  const [items, setItems] = useState<CompletionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [completionPercentage, setCompletionPercentage] = useState(0);

  useEffect(() => {
    if (user) {
      checkProfileCompletion();
    }
  }, [user, professionalId]);

  const checkProfileCompletion = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Get professional data
      const { data: professional } = await supabase
        .from('professionals')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!professional) {
        setLoading(false);
        return;
      }

      // Get services count
      const { data: services } = await supabase
        .from('professional_services')
        .select('id')
        .eq('professional_id', professional.id);

      // Get work photos count
      const { data: workPhotos } = await supabase
        .from('work_photos')
        .select('id')
        .eq('professional_id', professional.id);

      // Get availability slots count
      const { data: availabilitySlots } = await supabase
        .from('availability_slots')
        .select('id')
        .eq('professional_id', professional.id);

      // Build completion checklist
      const checklist: CompletionItem[] = [
        {
          id: 'photo',
          label: 'Foto de Perfil',
          description: 'Agrega una foto profesional para generar confianza',
          completed: !!professional.image_url,
          icon: Image,
          action: () => onTabChange?.('profile'),
          actionLabel: 'Agregar foto'
        },
        {
          id: 'description',
          label: 'Descripción Profesional',
          description: 'Describe tu experiencia y especialidades',
          completed: !!professional.description && professional.description.length > 50,
          icon: FileText,
          action: () => onTabChange?.('profile'),
          actionLabel: 'Escribir descripción'
        },
        {
          id: 'phone',
          label: 'Teléfono de Contacto',
          description: 'Permite que los clientes te contacten fácilmente',
          completed: !!professional.phone,
          icon: Phone,
          action: () => onTabChange?.('profile'),
          actionLabel: 'Agregar teléfono'
        },
        {
          id: 'location',
          label: 'Ubicación',
          description: 'Especifica tu zona de trabajo para aparecer en búsquedas locales',
          completed: !!professional.location && !!professional.latitude && !!professional.longitude,
          icon: MapPin,
          action: () => onTabChange?.('profile'),
          actionLabel: 'Configurar ubicación'
        },
        {
          id: 'services',
          label: 'Servicios',
          description: 'Define los servicios que ofreces con sus precios',
          completed: (services?.length || 0) > 0,
          icon: Briefcase,
          action: () => onTabChange?.('services'),
          actionLabel: 'Agregar servicios'
        },
        {
          id: 'portfolio',
          label: 'Fotos de Trabajos',
          description: 'Muestra ejemplos de tus trabajos anteriores',
          completed: (workPhotos?.length || 0) >= 3,
          icon: Camera,
          action: () => onTabChange?.('portfolio'),
          actionLabel: 'Subir fotos'
        },
        {
          id: 'availability',
          label: 'Disponibilidad',
          description: 'Configura tus horarios disponibles',
          completed: (availabilitySlots?.length || 0) > 0,
          icon: Calendar,
          action: () => onTabChange?.('calendar'),
          actionLabel: 'Configurar horarios'
        }
      ];

      setItems(checklist);

      // Calculate completion percentage
      const completedCount = checklist.filter(item => item.completed).length;
      const percentage = Math.round((completedCount / checklist.length) * 100);
      setCompletionPercentage(percentage);

    } catch (error) {
      console.error('Error checking profile completion:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-2 bg-muted rounded"></div>
            <div className="space-y-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-12 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const completedItems = items.filter(item => item.completed).length;
  const totalItems = items.length;
  const isComplete = completedItems === totalItems;

  return (
    <Card className={isComplete ? "border-green-500 bg-green-50/50 dark:bg-green-950/10" : ""}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1">
            <CardTitle className="flex items-center gap-2">
              {isComplete ? (
                <>
                  <Trophy className="h-5 w-5 text-green-600" />
                  ¡Perfil Completo!
                </>
              ) : (
                <>
                  <Circle className="h-5 w-5" />
                  Completa tu Perfil
                </>
              )}
            </CardTitle>
            <CardDescription>
              {isComplete 
                ? 'Tu perfil está 100% completo. ¡Excelente trabajo!'
                : `${completedItems} de ${totalItems} elementos completados`
              }
            </CardDescription>
          </div>
          <Badge variant={isComplete ? "default" : "secondary"} className="text-lg px-3 py-1">
            {completionPercentage}%
          </Badge>
        </div>

        <Progress value={completionPercentage} className="h-3 mt-4" />
      </CardHeader>

      <CardContent className="space-y-2">
        {!isComplete && (
          <p className="text-sm text-muted-foreground mb-4">
            Un perfil completo aumenta tu visibilidad y genera más confianza en los clientes.
          </p>
        )}

        <div className="space-y-2">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${
                  item.completed 
                    ? 'bg-green-50/50 border-green-200 dark:bg-green-950/20 dark:border-green-900' 
                    : 'bg-muted/30 hover:bg-muted/50 border-transparent'
                }`}
              >
                <div className={`mt-0.5 ${item.completed ? 'text-green-600' : 'text-muted-foreground'}`}>
                  {item.completed ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : (
                    <Circle className="h-5 w-5" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <h4 className={`font-medium text-sm ${
                      item.completed ? 'text-green-700 dark:text-green-400' : ''
                    }`}>
                      {item.label}
                    </h4>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {item.description}
                  </p>
                </div>

                {!item.completed && item.action && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={item.action}
                    className="flex-shrink-0"
                  >
                    {item.actionLabel}
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                )}
              </div>
            );
          })}
        </div>

        {isComplete && (
          <div className="mt-4 p-4 bg-green-100 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-900">
            <p className="text-sm text-green-800 dark:text-green-300">
              <strong>¡Felicitaciones!</strong> Tu perfil está optimizado para recibir más clientes. 
              Asegúrate de mantenerlo actualizado con tus últimos trabajos y disponibilidad.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
