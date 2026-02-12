import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { DashboardHero } from './DashboardHero';
import { 
  MapPin, 
  MessageCircle, 
  Eye, 
  Package,
  ChevronRight,
  Bell,
  Clock,
  User,
  Crown,
  Navigation
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { useSubscription } from '@/hooks/useSubscription';

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
  const cityName = professional.location?.split(',')[0]?.trim() || 'tu zona';
  const { getDaysRemaining, getSubscriptionStatus } = useSubscription();
  const daysRemaining = getDaysRemaining();
  const subStatus = getSubscriptionStatus();

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
      {/* ZONA 0: Subscription badge */}
      {subStatus !== 'none' && subStatus !== 'expired' && (
        <div className="flex items-center gap-2 px-1">
          <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 rounded-full px-3 py-1">
            <Crown className="h-3.5 w-3.5 text-amber-600" />
            <span className="text-xs font-semibold text-amber-800">
              Plan Pioneros: Activo — {daysRemaining} días restantes
            </span>
          </div>
        </div>
      )}

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
              onClick={() => onTabChange('messages')}
            >
              Ver mensajes ahora
              <ChevronRight className="h-4 w-4" />
            </Button>
          }
        />
      )}

      {/* ZONA 2: Widget de Visibilidad */}
      <div className={cn(
        'rounded-2xl shadow-sm p-4 transition-all duration-500 bg-card',
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
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              {isActiveInZone && <Navigation className="h-3 w-3" />}
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
          <p className="text-sm text-center text-muted-foreground mt-3 bg-muted/50 p-2 rounded-lg">
            💡 Los profesionales activos reciben 3x más contactos
          </p>
        )}
      </div>

      {/* Content wrapper with grayscale when offline */}
      <div className={cn(
        'space-y-4 transition-all duration-500',
        !isActiveInZone && 'grayscale-[30%] opacity-90'
      )}>
        {/* ZONA 3: Consultas Recientes */}
        <div className="rounded-2xl shadow-sm p-4 bg-card border-0">
          <h3 className="text-base font-semibold mb-3">Consultas Recientes</h3>
          
          {recentRequests && recentRequests.length > 0 ? (
            <div className="space-y-2">
              {recentRequests.map((req) => (
                <div 
                  key={req.id}
                  className="flex items-start gap-3 p-2 rounded-xl hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => onTabChange('messages')}
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
                className="w-full text-primary gap-1 mt-1"
                onClick={() => onTabChange('messages')}
              >
                Ver todas las consultas
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="text-center py-4">
              <div className="mx-auto w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center mb-3">
                <MessageCircle className="h-6 w-6 text-muted-foreground/40" />
              </div>
              <p className="text-sm text-muted-foreground mb-1">
                Aún no tenés mensajes.
              </p>
              <p className="text-xs text-muted-foreground mb-3">
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

        {/* ZONA 4: Acciones Rápidas - 3 botones grandes */}
        <div className="grid grid-cols-3 gap-3">
          <button
            className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-card shadow-sm hover:shadow-md transition-all hover:scale-[1.02] active:scale-95"
            onClick={() => navigate(`/professional/${professional.id}`)}
          >
            <div className="p-3 rounded-full bg-primary/10">
              <Eye className="h-6 w-6 text-primary" />
            </div>
            <span className="text-xs font-semibold text-foreground text-center leading-tight">Ver mi Perfil</span>
          </button>
          <button
            className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-card shadow-sm hover:shadow-md transition-all hover:scale-[1.02] active:scale-95"
            onClick={() => onTabChange('services')}
          >
            <div className="p-3 rounded-full bg-primary/10">
              <Package className="h-6 w-6 text-primary" />
            </div>
            <span className="text-xs font-semibold text-foreground text-center leading-tight">Mis Servicios</span>
          </button>
          <button
            className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-card shadow-sm hover:shadow-md transition-all hover:scale-[1.02] active:scale-95"
            onClick={() => onTabChange('messages')}
          >
            <div className="relative p-3 rounded-full bg-primary/10">
              <MessageCircle className="h-6 w-6 text-primary" />
              {stats.pendingRequests > 0 && (
                <span className="absolute -top-1 -right-1 min-w-5 h-5 flex items-center justify-center text-[10px] font-bold rounded-full bg-destructive text-destructive-foreground px-1">
                  {stats.pendingRequests}
                </span>
              )}
            </div>
            <span className="text-xs font-semibold text-foreground text-center leading-tight">Mensajes</span>
          </button>
        </div>
      </div>
    </div>
  );
}
