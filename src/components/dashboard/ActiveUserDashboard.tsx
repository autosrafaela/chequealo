import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { DashboardHero } from './DashboardHero';
import { MetricCard } from './MetricCard';
import { QuickActionTile } from './QuickActionTile';
import { 
  MapPin, 
  MessageCircle, 
  Eye, 
  Star,
  Camera,
  Package,
  Settings,
  ChevronRight,
  Bell,
  Award,
  Clock,
  User
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getVisitsContext, getContactsContext } from '@/utils/profileCompletion';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface ActiveUserDashboardProps {
  professional: {
    id: string;
    full_name: string;
    profession: string;
    phone?: string | null;
    location?: string | null;
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
  const hasPendingContacts = stats.pendingRequests > 0;
  const weeklyVisits = stats.weeklyVisits || 0;
  const cityName = professional.location?.split(',')[0]?.trim() || 'tu zona';

  // Fetch recent contact requests
  const { data: recentRequests } = useQuery({
    queryKey: ['recent-requests', professional.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('contact_requests')
        .select('id, name, message, created_at, status')
        .eq('professional_id', professional.id)
        .order('created_at', { ascending: false })
        .limit(3);
      
      if (error) return [];
      return data || [];
    },
    enabled: !!professional.id
  });

  return (
    <div className="space-y-6">
      {/* ZONA 1: Acción primaria - Contactos pendientes */}
      {hasPendingContacts && (
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
      )}

      {/* ZONA 2: Widget de Visibilidad */}
      <div className={cn(
        'rounded-2xl shadow-sm p-6 transition-all duration-500 bg-card',
        isActiveInZone 
          ? 'border border-green-200 shadow-[0_0_20px_rgba(74,222,128,0.15)]' 
          : 'border-0'
      )}>
        <div className="flex items-center gap-4">
          <div className={cn(
            'p-3 rounded-full transition-colors',
            isActiveInZone ? 'bg-green-100' : 'bg-muted'
          )}>
            <MapPin className={cn('h-6 w-6', isActiveInZone ? 'text-green-600' : 'text-muted-foreground')} />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <p className="font-bold text-base text-foreground">
                {isActiveInZone ? 'EN LÍNEA' : 'FUERA DE LÍNEA'}
              </p>
              {isActiveInZone && (
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              {isActiveInZone 
                ? `Activo en ${cityName}` 
                : 'Estás invisible para los clientes'}
            </p>
          </div>

          <Switch
            checked={isActiveInZone}
            onCheckedChange={onToggleZone}
            className="scale-150"
          />
        </div>

        {!isActiveInZone && (
          <p className="text-sm text-center text-muted-foreground mt-4 bg-muted/50 p-3 rounded-lg">
            💡 Los profesionales activos reciben 3x más contactos
          </p>
        )}
      </div>

      {/* Content wrapper with grayscale when offline */}
      <div className={cn(
        'space-y-6 transition-all duration-500',
        !isActiveInZone && 'grayscale-[30%] opacity-90'
      )}>
        {/* ZONA 3: Consultas Recientes */}
        <div className="rounded-2xl shadow-sm p-6 bg-card border-0">
          <h3 className="text-lg font-semibold mb-4">Consultas Recientes</h3>
          
          {recentRequests && recentRequests.length > 0 ? (
            <div className="space-y-3">
              {recentRequests.map((req) => (
                <div 
                  key={req.id}
                  className="flex items-start gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => onTabChange('requests')}
                >
                  <div className="p-2 rounded-full bg-primary/10 shrink-0">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-foreground">{req.name}</p>
                    <p className="text-xs text-muted-foreground line-clamp-1">{req.message}</p>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                    <Clock className="h-3 w-3" />
                    {formatDistanceToNow(new Date(req.created_at), { addSuffix: true, locale: es })}
                  </div>
                </div>
              ))}
              <Button 
                variant="ghost" 
                className="w-full text-primary gap-1 mt-2"
                onClick={() => onTabChange('requests')}
              >
                Ver todas las consultas
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="mx-auto w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                <MessageCircle className="h-8 w-8 text-muted-foreground/40" />
              </div>
              <p className="text-sm text-muted-foreground mb-1">
                Aún no tenés mensajes.
              </p>
              <p className="text-xs text-muted-foreground mb-4">
                ¡Asegurate de tener tu perfil completo para atraer clientes!
              </p>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onTabChange('settings')}
              >
                Completar mi perfil
              </Button>
            </div>
          )}
        </div>

        {/* ZONA 4: Métricas clave */}
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

        {/* ZONA 5: Acciones rápidas 3x2 */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Acciones rápidas</h3>
          
          <div className="grid grid-cols-3 gap-4">
            <QuickActionTile
              icon={Eye}
              label="Mi Perfil Público"
              iconColor="text-blue-500"
              iconBg="bg-blue-50"
              onClick={() => navigate(`/professional/${professional.id}`)}
            />
            <QuickActionTile
              icon={Package}
              label="Mis Servicios"
              iconColor="text-green-500"
              iconBg="bg-green-50"
              onClick={() => onTabChange('services')}
            />
            <QuickActionTile
              icon={Camera}
              label="Galería de Trabajos"
              iconColor="text-purple-500"
              iconBg="bg-purple-50"
              onClick={() => onTabChange('portfolio')}
            />
            <QuickActionTile
              icon={MessageCircle}
              label="Mensajes"
              iconColor="text-orange-500"
              iconBg="bg-orange-50"
              onClick={() => onTabChange('messages')}
            />
            <QuickActionTile
              icon={Settings}
              label="Configuración"
              iconColor="text-gray-500"
              iconBg="bg-gray-100"
              onClick={() => onTabChange('settings')}
            />
            <QuickActionTile
              icon={Award}
              label="Mi Plan Pioneros"
              iconColor="text-amber-500"
              iconBg="bg-amber-50"
              onClick={() => onTabChange('subscription')}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
