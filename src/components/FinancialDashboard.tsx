import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  DollarSign, 
  TrendingUp, 
  Calendar, 
  CheckCircle,
  Clock,
  Play,
  XCircle
} from "lucide-react";
import { useTransactions } from '@/hooks/useTransactions';
import { useSubscription } from '@/hooks/useSubscription';

export const FinancialDashboard = () => {
  const { stats, loading: transactionsLoading } = useTransactions();
  const { subscription, loading: subscriptionLoading } = useSubscription();

  if (transactionsLoading || subscriptionLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse space-y-3">
                <div className="h-4 bg-muted rounded w-1/2"></div>
                <div className="h-8 bg-muted rounded w-3/4"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getStatusProgress = () => {
    if (stats.total === 0) return 0;
    return (stats.completed / stats.total) * 100;
  };

  return (
    <div className="space-y-6">
      {/* Revenue Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Ingresos Totales
                </p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(stats.totalRevenue)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
            <div className="mt-4">
              <p className="text-xs text-muted-foreground">
                De {stats.completed} trabajos completados
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Promedio por Trabajo
                </p>
                <p className="text-2xl font-bold">
                  {formatCurrency(stats.averageTransaction)}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-500" />
            </div>
            <div className="mt-4">
              <p className="text-xs text-muted-foreground">
                Basado en trabajos completados
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Trabajos Activos
                </p>
                <p className="text-2xl font-bold text-orange-600">
                  {stats.pending + stats.inProgress}
                </p>
              </div>
              <Clock className="h-8 w-8 text-orange-500" />
            </div>
            <div className="mt-4">
              <div className="flex gap-2">
                <Badge variant="secondary" className="text-xs">
                  {stats.pending} Pendientes
                </Badge>
                <Badge variant="default" className="text-xs">
                  {stats.inProgress} En Progreso
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Tasa de Finalización
                </p>
                <p className="text-2xl font-bold">
                  {getStatusProgress().toFixed(1)}%
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
            <div className="mt-4">
              <Progress value={getStatusProgress()} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transaction Status Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Estado de Trabajos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <Clock className="h-6 w-6 text-gray-500" />
              </div>
              <p className="text-2xl font-bold text-gray-700">{stats.pending}</p>
              <p className="text-sm text-muted-foreground">Pendientes</p>
            </div>

            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <Play className="h-6 w-6 text-blue-500" />
              </div>
              <p className="text-2xl font-bold text-blue-700">{stats.inProgress}</p>
              <p className="text-sm text-muted-foreground">En Progreso</p>
            </div>

            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <CheckCircle className="h-6 w-6 text-green-500" />
              </div>
              <p className="text-2xl font-bold text-green-700">{stats.completed}</p>
              <p className="text-sm text-muted-foreground">Completados</p>
            </div>

            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <XCircle className="h-6 w-6 text-red-500" />
              </div>
              <p className="text-2xl font-bold text-red-700">{stats.cancelled}</p>
              <p className="text-sm text-muted-foreground">Cancelados</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Subscription Status */}
      {subscription && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Estado de Suscripción
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Plan Actual</p>
                <p className="text-lg font-semibold">{subscription.subscription_plans?.name}</p>
              </div>
              
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Costo Mensual</p>
                <p className="text-lg font-semibold text-green-600">
                  {formatCurrency(subscription.subscription_plans?.price || 0)}
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Estado</p>
                <Badge variant={subscription.status === 'active' ? 'default' : 'secondary'}>
                  {subscription.status === 'active' ? 'Activa' : 
                   subscription.status === 'trial' ? 'Período de Prueba' : 
                   subscription.status}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};