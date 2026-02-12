import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { DashboardHero } from './DashboardHero';
import { MetricCard } from './MetricCard';
import { QuickActionTile } from './QuickActionTile';
import { QuickActionButton } from './QuickActionButton';
import { ProfessionModal } from './ProfessionModal';
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
  Bell
} from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { getVisitsContext, getContactsContext } from '@/utils/profileCompletion';
import { supabase } from '@/integrations/supabase/client';

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
  onProfessionalUpdate?: (profession: string) => void;
}

export function ActiveUserDashboard({ 
  professional, 
  stats, 
  completion,
  isActiveInZone,
  onToggleZone,
  onTabChange,
  onProfessionalUpdate
}: ActiveUserDashboardProps) {
  const navigate = useNavigate();
  const [showProfessionModal, setShowProfessionModal] = useState(false);
  const hasPendingContacts = stats.pendingRequests > 0;
  const weeklyVisits = stats.weeklyVisits || 0;

  // Obtener profesiones del profesional
  const { data: professions } = useQuery({
    queryKey: ['professional-professions', professional.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('professional_professions')
        .select('profession, is_primary')
        .eq('professional_id', professional.id)
        .order('is_primary', { ascending: false });
      
      if (error) return [];
      return data || [];
    },
    enabled: !!professional.id
  });

  const getProfessionsDisplay = () => {
    if (!professions || professions.length === 0) {
      return professional.profession || 'Sin definir';
    }
    if (professions.length === 1) {
      return professions[0].profession;
    }
    return professions.map(p => p.profession).join(', ');
  };

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
          className={isActiveInZone 
            ? 'border-2 border-green-400 shadow-[0_0_15px_rgba(74,222,128,0.3)] transition-all duration-500' 
            : 'transition-all duration-500'}
        >
          {/* Toggle grande */}
          <div className="flex items-center justify-between p-4 bg-background/50 rounded-xl border">
            <div className="flex items-center gap-3 flex-1">
              {isActiveInZone && (
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500" />
                </span>
              )}
              <div>
                <p className="font-bold text-base text-foreground">
                  {isActiveInZone ? 'EN LÍNEA' : 'FUERA DE LÍNEA'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {isActiveInZone 
                    ? '✅ Tu perfil está destacado en búsquedas' 
                    : '⏸️ No aparecés en búsquedas cercanas'}
                </p>
              </div>
            </div>
            <Switch
              checked={isActiveInZone}
              onCheckedChange={onToggleZone}
              className="scale-150"
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
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <QuickActionTile
            icon={Eye}
            label="Ver Perfil"
            iconColor="text-blue-500"
            onClick={() => navigate(`/professional/${professional.id}`)}
          />
          <QuickActionTile
            icon={Package}
            label="Servicios"
            iconColor="text-green-500"
            onClick={() => onTabChange('services')}
          />
          <QuickActionTile
            icon={Camera}
            label="Portfolio"
            iconColor="text-purple-500"
            onClick={() => onTabChange('portfolio')}
          />
          <QuickActionTile
            icon={MessageCircle}
            label="Mensajes"
            iconColor="text-orange-500"
            onClick={() => onTabChange('messages')}
          />
          <QuickActionTile
            icon={Settings}
            label="Configuración"
            iconColor="text-gray-500"
            onClick={() => onTabChange('settings')}
          />
          <QuickActionTile
            icon={Briefcase}
            label="Mi Profesión"
            iconColor="text-amber-500"
            description={getProfessionsDisplay()}
            onClick={() => setShowProfessionModal(true)}
          />
        </div>
      </div>

      {/* Modal de Profesión */}
      <ProfessionModal
        open={showProfessionModal}
        onOpenChange={setShowProfessionModal}
        professionalId={professional.id}
      />

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
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
