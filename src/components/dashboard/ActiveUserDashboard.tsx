import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { 
  MapPin, 
  Eye, 
  Package,
  Crown,
  Navigation
} from 'lucide-react';
import { cn } from '@/lib/utils';
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
  const cityName = professional.location?.split(',')[0]?.trim() || 'tu zona';
  const { getDaysRemaining, getSubscriptionStatus } = useSubscription();
  const daysRemaining = getDaysRemaining();
  const subStatus = getSubscriptionStatus();

  return (
    <div className="space-y-6">
      {/* Subscription badge */}
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

      {/* Visibility Widget */}
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

      {/* Quick Actions - 2 buttons */}
      <div className={cn(
        'space-y-4 transition-all duration-500',
        !isActiveInZone && 'grayscale-[30%] opacity-90'
      )}>
        <div className="grid grid-cols-2 gap-3">
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
        </div>
      </div>
    </div>
  );
}
