import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  UserCheck, 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  MessageSquare,
  Star,
  Activity,
  Eye,
  Target,
  Zap,
  Clock
} from 'lucide-react';
import { useAnalytics } from '@/hooks/useAnalytics';
import { Skeleton } from '@/components/ui/skeleton';
import GrowthChart from './GrowthChart';
import CategoryChart from './CategoryChart';
import RevenueChart from './RevenueChart';
import RealtimeActivity from './RealtimeActivity';

const AnalyticsDashboard = () => {
  const { metrics, loading, error } = useAnalytics();

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-80" />
          <Skeleton className="h-80" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-500">
            <p>Error al cargar las métricas: {error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(1)}%`;
  };

  const getGrowthIcon = (value: number) => {
    return value >= 0 ? (
      <TrendingUp className="h-4 w-4 text-green-500" />
    ) : (
      <TrendingDown className="h-4 w-4 text-red-500" />
    );
  };

  const getGrowthColor = (value: number) => {
    return value >= 0 ? 'text-green-600' : 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Users */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Usuarios
                </p>
                <p className="text-2xl font-bold">{formatNumber(metrics.totalUsers)}</p>
                <div className="flex items-center gap-1 mt-1">
                  {getGrowthIcon(metrics.userGrowthPercentage)}
                  <span className={`text-sm ${getGrowthColor(metrics.userGrowthPercentage)}`}>
                    {formatPercentage(metrics.userGrowthPercentage)}
                  </span>
                  <span className="text-sm text-muted-foreground">vs mes anterior</span>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <Users className="h-8 w-8 text-blue-500" />
                <Badge variant="secondary" className="mt-2 text-xs">
                  +{metrics.newUsersToday} hoy
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Professionals */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Profesionales
                </p>
                <p className="text-2xl font-bold">{formatNumber(metrics.totalProfessionals)}</p>
                <div className="flex items-center gap-1 mt-1">
                  {getGrowthIcon(metrics.professionalsGrowthPercentage)}
                  <span className={`text-sm ${getGrowthColor(metrics.professionalsGrowthPercentage)}`}>
                    {formatPercentage(metrics.professionalsGrowthPercentage)}
                  </span>
                  <span className="text-sm text-muted-foreground">vs mes anterior</span>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <UserCheck className="h-8 w-8 text-green-500" />
                <Badge variant="secondary" className="mt-2 text-xs">
                  {metrics.verifiedProfessionals} verificados
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Revenue */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Ingresos Totales
                </p>
                <p className="text-2xl font-bold">{formatCurrency(metrics.subscriptionRevenue)}</p>
                <div className="flex items-center gap-1 mt-1">
                  <Target className="h-4 w-4 text-purple-500" />
                  <span className="text-sm text-muted-foreground">
                    {metrics.activeSubscriptions} suscripciones activas
                  </span>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <DollarSign className="h-8 w-8 text-green-600" />
                <Badge className="mt-2 text-xs bg-green-100 text-green-800">
                  {formatPercentage(metrics.conversionRate)} conversión
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Requests */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Solicitudes de Contacto
                </p>
                <p className="text-2xl font-bold">{formatNumber(metrics.totalContactRequests)}</p>
                <div className="flex items-center gap-1 mt-1">
                  <Clock className="h-4 w-4 text-orange-500" />
                  <span className="text-sm text-muted-foreground">
                    {metrics.averageResponseTime}h promedio respuesta
                  </span>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <MessageSquare className="h-8 w-8 text-blue-600" />
                <Badge variant="secondary" className="mt-2 text-xs">
                  +{metrics.contactRequestsToday} hoy
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Conversion Rate */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Tasa de Conversión
                </p>
                <p className="text-2xl font-bold">{formatPercentage(metrics.conversionToTransaction)}</p>
                <div className="flex items-center gap-1 mt-1">
                  <Zap className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm text-muted-foreground">
                    {metrics.completedTransactions} transacciones
                  </span>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <Target className="h-8 w-8 text-purple-500" />
                <Badge 
                  className={`mt-2 text-xs ${
                    metrics.conversionToTransaction >= 20 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}
                >
                  {metrics.conversionToTransaction >= 20 ? 'Excelente' : 'Mejorable'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Reviews & Rating */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Calificación Promedio
                </p>
                <p className="text-2xl font-bold">{metrics.averageRating.toFixed(1)} ⭐</p>
                <div className="flex items-center gap-1 mt-1">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm text-muted-foreground">
                    {metrics.totalReviews} reseñas totales
                  </span>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <Star className="h-8 w-8 text-yellow-500" />
                <Badge variant="secondary" className="mt-2 text-xs">
                  +{metrics.reviewsThisMonth} este mes
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Online Users */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Usuarios en Línea
                </p>
                <p className="text-2xl font-bold">{metrics.onlineUsers}</p>
                <div className="flex items-center gap-1 mt-1">
                  <Activity className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-green-600">Tiempo real</span>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <Eye className="h-8 w-8 text-indigo-500" />
                <div className="flex items-center gap-1 mt-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs text-muted-foreground">Activo</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Trial Subscriptions */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Período de Prueba
                </p>
                <p className="text-2xl font-bold">{metrics.trialSubscriptions}</p>
                <div className="flex items-center gap-1 mt-1">
                  <Clock className="h-4 w-4 text-blue-500" />
                  <span className="text-sm text-muted-foreground">
                    {metrics.expiredSubscriptions} expiradas
                  </span>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <Users className="h-8 w-8 text-blue-500" />
                <Badge className="mt-2 text-xs bg-blue-100 text-blue-800">
                  Potenciales clientes
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GrowthChart data={metrics.monthlyGrowth} />
        <RevenueChart data={metrics.monthlyGrowth} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <CategoryChart categories={metrics.topCategories} />
        </div>
        <RealtimeActivity activities={metrics.recentActivities} onlineUsers={metrics.onlineUsers} />
      </div>
    </div>
  );
};

export default AnalyticsDashboard;