import React, { useState } from 'react';
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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const PROFESSIONS = [
  { value: 'Plomero', icon: '🔧' },
  { value: 'Electricista', icon: '⚡' },
  { value: 'Gasista', icon: '🔥' },
  { value: 'Pintor', icon: '🎨' },
  { value: 'Albañil', icon: '🧱' },
  { value: 'Carpintero', icon: '🪚' },
  { value: 'Cerrajero', icon: '🔑' },
  { value: 'Jardinero', icon: '🌱' },
  { value: 'Limpieza', icon: '🧹' },
  { value: 'Mudanza', icon: '📦' },
  { value: 'Técnico PC', icon: '💻' },
  { value: 'Aire Acondicionado', icon: '❄️' },
  { value: 'Otro', icon: '🛠️' },
];

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
  const [savingProfession, setSavingProfession] = useState(false);
  const hasPendingContacts = stats.pendingRequests > 0;
  const weeklyVisits = stats.weeklyVisits || 0;

  const handleProfessionChange = async (newProfession: string) => {
    setSavingProfession(true);
    try {
      const { error } = await supabase
        .from('professionals')
        .update({ profession: newProfession, updated_at: new Date().toISOString() })
        .eq('id', professional.id);

      if (error) throw error;
      
      onProfessionalUpdate?.(newProfession);
      toast.success('Profesión actualizada');
      setShowProfessionModal(false);
    } catch (error) {
      toast.error('Error al actualizar la profesión');
    } finally {
      setSavingProfession(false);
    }
  };

  const getCurrentProfessionIcon = () => {
    const found = PROFESSIONS.find(p => p.value === professional.profession);
    return found?.icon || '🛠️';
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
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
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
          <QuickActionTile
            icon={Settings}
            label="Configuración"
            onClick={() => onTabChange('settings')}
          />
          <QuickActionTile
            icon={Briefcase}
            label="Mi Profesión"
            description={professional.profession || 'Sin definir'}
            onClick={() => setShowProfessionModal(true)}
          />
        </div>
      </div>

      {/* Modal de Profesión */}
      <Dialog open={showProfessionModal} onOpenChange={setShowProfessionModal}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Cambiar profesión</DialogTitle>
          </DialogHeader>
          
          <div className="grid grid-cols-2 gap-2 mt-4 max-h-[60vh] overflow-y-auto">
            {PROFESSIONS.map((profession) => (
              <button
                key={profession.value}
                onClick={() => handleProfessionChange(profession.value)}
                disabled={savingProfession}
                className={cn(
                  "flex items-center gap-2 p-3 rounded-lg border text-left transition-all disabled:opacity-50",
                  professional.profession === profession.value
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-border hover:border-primary/50 hover:bg-muted/50"
                )}
              >
                <span className="text-lg">{profession.icon}</span>
                <span className="text-sm font-medium">{profession.value}</span>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

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
