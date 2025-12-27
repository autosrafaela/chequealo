import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { DashboardHero } from './DashboardHero';
import { 
  AlertTriangle, 
  TrendingDown, 
  MessageCircle,
  Eye,
  Users,
  ChevronRight,
  Sparkles
} from 'lucide-react';

interface InactiveUserDashboardProps {
  professional: {
    id: string;
    full_name: string;
  };
  stats: {
    pendingRequests: number;
    totalRequests: number;
  };
  daysSinceLastLogin: number;
  onReactivate: () => void;
  onTabChange: (tab: string) => void;
}

export function InactiveUserDashboard({ 
  professional, 
  stats,
  daysSinceLastLogin,
  onReactivate,
  onTabChange
}: InactiveUserDashboardProps) {
  const navigate = useNavigate();
  const missedOpportunities = stats.pendingRequests || 0;
  const firstName = professional.full_name?.split(' ')[0] || 'Profesional';

  return (
    <div className="space-y-6">
      {/* ZONA 1: Re-engagement */}
      <DashboardHero
        variant="danger"
        icon={AlertTriangle}
        title={`¡Te extrañamos, ${firstName}!`}
        subtitle={`No has ingresado en ${daysSinceLastLogin} días`}
      >
        {missedOpportunities > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 space-y-2">
            <p className="font-semibold text-red-700 flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              {missedOpportunities} persona{missedOpportunities > 1 ? 's' : ''} te buscaron mientras estabas ausente
            </p>
            <p className="text-sm text-red-600">
              Perdiste oportunidades de trabajo porque tu perfil estaba inactivo
            </p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 mt-4">
          <Button 
            size="lg" 
            className="flex-1 gap-2"
            onClick={onReactivate}
          >
            <Sparkles className="h-4 w-4" />
            Reactivar mi perfil ahora
          </Button>
          {missedOpportunities > 0 && (
            <Button 
              size="lg" 
              variant="outline"
              className="flex-1 gap-2"
              onClick={() => onTabChange('requests')}
            >
              Ver solicitudes
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </DashboardHero>

      {/* ZONA 2: Lo que se perdió */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-muted-foreground">
          Lo que te perdiste:
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-red-200 bg-red-50/50">
            <CardContent className="p-5 text-center">
              <TrendingDown className="h-8 w-8 text-red-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-red-600">-30%</p>
              <p className="text-sm text-muted-foreground">Caída en visibilidad</p>
            </CardContent>
          </Card>
          
          <Card className="border-orange-200 bg-orange-50/50">
            <CardContent className="p-5 text-center">
              <MessageCircle className="h-8 w-8 text-orange-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-orange-600">{missedOpportunities}</p>
              <p className="text-sm text-muted-foreground">Contactos no respondidos</p>
            </CardContent>
          </Card>
          
          <Card className="border-blue-200 bg-blue-50/50">
            <CardContent className="p-5 text-center">
              <Users className="h-8 w-8 text-blue-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-blue-600">+15</p>
              <p className="text-sm text-muted-foreground">Competidores activos</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ZONA 3: Tips de reactivación */}
      <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
        <CardContent className="p-6">
          <h4 className="font-semibold mb-4 flex items-center gap-2">
            💡 Para volver a destacar:
          </h4>
          
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold shrink-0">
                1
              </div>
              <p className="text-sm">
                Activá <strong>"Estoy en la zona hoy"</strong> para aparecer primero
              </p>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold shrink-0">
                2
              </div>
              <p className="text-sm">
                Respondé las solicitudes pendientes <strong>cuanto antes</strong>
              </p>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold shrink-0">
                3
              </div>
              <p className="text-sm">
                Actualizá tu portfolio con <strong>trabajos recientes</strong>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
