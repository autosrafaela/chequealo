import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { DashboardHero } from './DashboardHero';
import { MetricCard } from './MetricCard';
import { QuickActionTile } from './QuickActionTile';
import { QuickActionButton } from './QuickActionButton';
import { 
  MapPin, 
  MessageCircle, 
  Eye, 
  Star,
  Camera,
  Package,
  Calendar,
  Settings,
  BarChart3,
  CreditCard,
  Briefcase,
  ChevronRight,
  Bell,
  AlertTriangle
} from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { getVisitsContext, getContactsContext } from '@/utils/profileCompletion';

interface ActiveUserDashboardProps {
  professional: {
    id: string;
    full_name: string;
    profession: string;
    phone?: string | null;
  };
  stats: {
    pendingRequests: number;
    totalRequests: number;
    totalReviews: number;
    averageRating: number;
    weeklyVisits?: number;
    lastMonthContacts?: number;
  };
  completion: number;
  isActiveInZone: boolean;
  onToggleZone: (active: boolean) => void;
  onTabChange: (tab: string) => void;
}

export function ActiveUserDashboard({ 
  professional, 
  stats, 
  completion,
  isActiveInZone,
  onToggleZone,
  onTabChange
}: ActiveUserDashboardProps) {
  const navigate = useNavigate();
  const hasPendingContacts = stats.pendingRequests > 0;
  const weeklyVisits = stats.weeklyVisits || 0;

  return (
    <div className="space-y-6">
      {/* ZONA 1: Acción primaria dinámica */}
      {hasPendingContacts ? (
        /* CASO A: Tiene contactos pendientes → Prioridad MÁXIMA */
        <DashboardHero
          variant="danger"
          icon={Bell}
          badge="URGENTE"
          title={`¡Tenés ${stats.pendingRequests} solicitud${stats.pendingRequests > 1 ? 'es' : ''} esperando!`}
          subtitle="Responder rápido aumenta un 70% las probabilidades de cerrar el trabajo"
          actions={
            <Button 
              size="lg" 
              className="w-full sm:w-auto gap-2"
              onClick={() => onTabChange('requests')}
            >
              Ver solicitudes ahora
              <ChevronRight className="h-4 w-4" />
            </Button>
          }
        />
      ) : (
        /* CASO B: Sin contactos pendientes → Enfoque en visibilidad */
        <DashboardHero
          variant={isActiveInZone ? 'success' : 'primary'}
          icon={MapPin}
          title="¿Estás trabajando en la zona hoy?"
          subtitle="Activá tu visibilidad para aparecer primero en búsquedas cercanas"
        >
          {/* Toggle grande */}
          <div className="flex items-center justify-between p-4 bg-background/50 rounded-xl border">
            <div className="flex-1">
              <p className="font-semibold text-foreground">Estoy en la zona hoy</p>
              <p className="text-sm text-muted-foreground">
                {isActiveInZone 
                  ? '✅ Tu perfil está destacado' 
                  : '⏸️ Estás invisible en búsquedas'}
              </p>
            </div>
            <Switch
              checked={isActiveInZone}
              onCheckedChange={onToggleZone}
              className="scale-125"
            />
          </div>
          
          {!isActiveInZone && (
            <p className="text-sm text-center text-muted-foreground bg-primary/5 p-3 rounded-lg">
              💡 Los profesionales activos reciben 3x más contactos
            </p>
          )}
        </DashboardHero>
      )}

      {/* ZONA 2: Métricas clave con contexto */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard
          icon={Eye}
          iconColor="text-blue-500"
          label="Visitas esta semana"
          value={weeklyVisits}
          trend={weeklyVisits > 0 ? { value: 15 } : undefined}
          context={getVisitsContext(weeklyVisits)}
          onClick={() => onTabChange('analytics')}
        />
        
        <MetricCard
          icon={MessageCircle}
          iconColor="text-green-500"
          label="Solicitudes este mes"
          value={stats.totalRequests}
          badge={stats.pendingRequests > 0 ? {
            text: `${stats.pendingRequests} nuevas`,
            variant: 'destructive'
          } : undefined}
          context={getContactsContext(stats.totalRequests, stats.lastMonthContacts || 0)}
          onClick={() => onTabChange('requests')}
        />
        
        <MetricCard
          icon={Star}
          iconColor="text-yellow-500"
          label="Calificación promedio"
          value={stats.averageRating.toFixed(1)}
          suffix="/ 5.0"
          context={`Basado en ${stats.totalReviews} reseñas`}
          onClick={() => navigate(`/professional/${professional.id}#reviews`)}
        />
      </div>

      {/* Link a estadísticas completas */}
      <div className="text-center">
        <Button 
          variant="link" 
          className="text-primary gap-1"
          onClick={() => onTabChange('analytics')}
        >
          Ver estadísticas completas
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* ZONA 3: Accesos rápidos */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Acciones rápidas</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <QuickActionTile
            icon={Eye}
            label="Ver Perfil"
            onClick={() => navigate(`/professional/${professional.id}`)}
          />
          <QuickActionTile
            icon={Package}
            label="Servicios"
            onClick={() => onTabChange('services')}
          />
          <QuickActionTile
            icon={Camera}
            label="Portfolio"
            onClick={() => onTabChange('portfolio')}
          />
          <QuickActionTile
            icon={MessageCircle}
            label="Mensajes"
            onClick={() => onTabChange('messages')}
          />
        </div>
      </div>

      {/* Acordeón con opciones menos usadas */}
      <Collapsible>
        <CollapsibleTrigger asChild>
          <Button variant="outline" className="w-full gap-2">
            Más opciones
            <ChevronRight className="h-4 w-4" />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 p-4 bg-muted/30 rounded-lg">
            <QuickActionButton
              icon={BarChart3}
              label="Analytics"
              onClick={() => onTabChange('analytics')}
            />
            <QuickActionButton
              icon={Star}
              label="Gestionar Reseñas"
              onClick={() => onTabChange('reviews')}
            />
            <QuickActionButton
              icon={Briefcase}
              label="Combos"
              onClick={() => onTabChange('combos')}
            />
            <QuickActionButton
              icon={Calendar}
              label="Calendario"
              onClick={() => onTabChange('calendar')}
            />
            <QuickActionButton
              icon={CreditCard}
              label="Finanzas"
              onClick={() => onTabChange('financial')}
            />
            <QuickActionButton
              icon={Settings}
              label="Configuración"
              onClick={() => onTabChange('settings')}
            />
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
