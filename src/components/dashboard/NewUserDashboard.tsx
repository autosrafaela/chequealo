import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { DashboardHero } from './DashboardHero';
import { MetricCard } from './MetricCard';
import { 
  AlertCircle, 
  CheckCircle2, 
  Circle, 
  Eye, 
  MessageCircle,
  ChevronRight
} from 'lucide-react';
import { getMissingProfileSteps } from '@/utils/profileCompletion';

interface NewUserDashboardProps {
  professional: {
    id: string;
    full_name: string;
    image_url?: string | null;
    description?: string | null;
    phone?: string | null;
    location?: string | null;
    latitude?: number | null;
    longitude?: number | null;
  };
  completion: number;
  counts: {
    servicesCount: number;
    workPhotosCount: number;
    availabilityCount: number;
  };
  onOpenChecklist: (stepId: string) => void;
}

export function NewUserDashboard({ 
  professional, 
  completion, 
  counts,
  onOpenChecklist 
}: NewUserDashboardProps) {
  const navigate = useNavigate();
  const steps = getMissingProfileSteps(professional, counts);
  const incompleteSteps = steps.filter(s => !s.completed);
  const completedSteps = steps.filter(s => s.completed);

  return (
    <div className="space-y-6">
      {/* ZONA 1: Hero - Completar perfil */}
      <DashboardHero
        variant="warning"
        icon={AlertCircle}
        badge="PRIORIDAD"
        title="¡Completá tu perfil para aparecer en búsquedas!"
        subtitle="Los profesionales con perfil completo reciben 5x más contactos"
        actions={
          <Button 
            size="lg" 
            className="w-full sm:w-auto gap-2"
            onClick={() => incompleteSteps[0] && onOpenChecklist(incompleteSteps[0].id)}
          >
            Completar mi perfil ahora
            <ChevronRight className="h-4 w-4" />
          </Button>
        }
      >
        {/* Progress bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Progreso del perfil</span>
            <span className="font-bold text-lg">{completion}%</span>
          </div>
          <Progress value={completion} className="h-3" />
        </div>

        {/* Checklist */}
        <div className="space-y-2 mt-4">
          <p className="text-sm font-medium text-muted-foreground">Pasos faltantes:</p>
          <div className="space-y-2">
            {steps.slice(0, 5).map((step) => (
              <div 
                key={step.id}
                className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                  step.completed 
                    ? 'bg-green-50 border border-green-200' 
                    : 'bg-muted/50 hover:bg-muted cursor-pointer'
                }`}
                onClick={() => !step.completed && onOpenChecklist(step.id)}
              >
                <div className="flex items-center gap-3">
                  {step.completed ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  ) : (
                    <Circle className="h-5 w-5 text-muted-foreground" />
                  )}
                  <span className={step.completed ? 'line-through text-muted-foreground' : 'font-medium'}>
                    {step.label}
                  </span>
                </div>
                
                {!step.completed && (
                  <Button variant="ghost" size="sm" className="text-primary">
                    Completar
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>
      </DashboardHero>

      {/* ZONA 2: Métricas simplificadas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <MetricCard
          icon={Eye}
          iconColor="text-blue-500"
          label="Tu perfil fue visto"
          value={0}
          suffix="veces"
          context="💡 Completá el perfil para empezar a aparecer"
        />
        
        <MetricCard
          icon={MessageCircle}
          iconColor="text-green-500"
          label="Solicitudes recibidas"
          value={0}
          context="🎯 Aparecerás cuando tu perfil esté completo"
        />
      </div>

      {/* Tip motivacional */}
      <div className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-xl p-4 border border-primary/20">
        <p className="text-sm text-center">
          <span className="font-semibold">💡 Tip:</span> Los perfiles con foto profesional y descripción detallada 
          generan <span className="font-bold text-primary">3x más confianza</span> en los clientes.
        </p>
      </div>
    </div>
  );
}
