import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Database, 
  Globe, 
  RefreshCw,
  Server,
  Zap
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface SystemMetrics {
  responseTime: number;
  uptime: number;
  errorRate: number;
  activeConnections: number;
  databaseHealth: 'healthy' | 'warning' | 'critical';
  apiLatency: number;
  memoryUsage: number;
  cpuUsage: number;
}

interface PerformanceData {
  timestamp: string;
  responseTime: number;
  requests: number;
  errors: number;
}

export const PerformanceMonitor = () => {
  const [metrics, setMetrics] = useState<SystemMetrics>({
    responseTime: 245,
    uptime: 99.8,
    errorRate: 0.2,
    activeConnections: 1247,
    databaseHealth: 'healthy',
    apiLatency: 180,
    memoryUsage: 68,
    cpuUsage: 42
  });

  const [performanceData, setPerformanceData] = useState<PerformanceData[]>([
    { timestamp: '12:00', responseTime: 245, requests: 1200, errors: 2 },
    { timestamp: '12:05', responseTime: 230, requests: 1150, errors: 1 },
    { timestamp: '12:10', responseTime: 267, requests: 1300, errors: 3 },
    { timestamp: '12:15', responseTime: 221, requests: 1100, errors: 0 },
    { timestamp: '12:20', responseTime: 245, requests: 1250, errors: 2 },
    { timestamp: '12:25', responseTime: 189, requests: 1000, errors: 1 },
    { timestamp: '12:30', responseTime: 234, requests: 1180, errors: 2 }
  ]);

  const [alerts, setAlerts] = useState([
    {
      id: 1,
      type: 'warning' as const,
      message: 'Uso de memoria por encima del 65%',
      timestamp: new Date(Date.now() - 5 * 60 * 1000)
    },
    {
      id: 2,
      type: 'info' as const,
      message: 'Actualizaciones de seguridad disponibles',
      timestamp: new Date(Date.now() - 30 * 60 * 1000)
    }
  ]);

  const [loading, setLoading] = useState(false);

  const refreshMetrics = async () => {
    setLoading(true);
    
    // Simulate API call to refresh metrics
    setTimeout(() => {
      setMetrics(prev => ({
        ...prev,
        responseTime: Math.floor(Math.random() * 100) + 200,
        activeConnections: Math.floor(Math.random() * 500) + 1000,
        memoryUsage: Math.floor(Math.random() * 20) + 60,
        cpuUsage: Math.floor(Math.random() * 30) + 30
      }));

      // Add new performance data point
      const now = new Date();
      const newDataPoint = {
        timestamp: now.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }),
        responseTime: Math.floor(Math.random() * 100) + 200,
        requests: Math.floor(Math.random() * 400) + 1000,
        errors: Math.floor(Math.random() * 5)
      };

      setPerformanceData(prev => [...prev.slice(-6), newDataPoint]);
      setLoading(false);
    }, 1000);
  };

  const getHealthStatus = (value: number, thresholds: { good: number; warning: number }) => {
    if (value <= thresholds.good) return { status: 'healthy', color: 'text-green-600' };
    if (value <= thresholds.warning) return { status: 'warning', color: 'text-yellow-600' };
    return { status: 'critical', color: 'text-red-600' };
  };

  const getHealthIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'critical':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default:
        return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (!loading) {
        refreshMetrics();
      }
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [loading]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Monitor de Rendimiento</h2>
          <p className="text-muted-foreground">Monitoreo en tiempo real del sistema</p>
        </div>
        <Button 
          variant="outline" 
          onClick={refreshMetrics}
          disabled={loading}
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Actualizando...' : 'Actualizar'}
        </Button>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map(alert => (
            <Alert key={alert.id} variant={alert.type === 'warning' ? 'destructive' : 'default'}>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="flex items-center justify-between">
                <span>{alert.message}</span>
                <span className="text-xs text-muted-foreground">
                  {alert.timestamp.toLocaleTimeString('es-AR')}
                </span>
              </AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      {/* System Health Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tiempo de Respuesta</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.responseTime}ms</div>
            <p className="text-xs text-muted-foreground">
              {getHealthIcon(getHealthStatus(metrics.responseTime, { good: 200, warning: 500 }).status)}
              <span className={getHealthStatus(metrics.responseTime, { good: 200, warning: 500 }).color}>
                {metrics.responseTime <= 200 ? 'Excelente' : metrics.responseTime <= 500 ? 'Bueno' : 'Lento'}
              </span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Uptime</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.uptime}%</div>
            <p className="text-xs text-muted-foreground">
              <CheckCircle className="inline h-3 w-3 text-green-600 mr-1" />
              Sistema estable
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasa de Error</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.errorRate}%</div>
            <p className="text-xs text-muted-foreground">
              {getHealthIcon(getHealthStatus(metrics.errorRate, { good: 1, warning: 5 }).status)}
              <span className={getHealthStatus(metrics.errorRate, { good: 1, warning: 5 }).color}>
                {metrics.errorRate <= 1 ? 'Muy bajo' : metrics.errorRate <= 5 ? 'Normal' : 'Alto'}
              </span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conexiones Activas</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.activeConnections.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              En tiempo real
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Performance Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Tiempo de Respuesta</CardTitle>
            <CardDescription>Últimos 30 minutos</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="timestamp" />
                <YAxis />
                <Tooltip formatter={(value) => [`${value}ms`, 'Tiempo de Respuesta']} />
                <Line 
                  type="monotone" 
                  dataKey="responseTime" 
                  stroke="#8884d8" 
                  strokeWidth={2}
                  dot={{ fill: '#8884d8' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Solicitudes por Minuto</CardTitle>
            <CardDescription>Tráfico en tiempo real</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="timestamp" />
                <YAxis />
                <Tooltip formatter={(value) => [value, 'Solicitudes']} />
                <Line 
                  type="monotone" 
                  dataKey="requests" 
                  stroke="#82ca9d" 
                  strokeWidth={2}
                  dot={{ fill: '#82ca9d' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Resource Usage */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Uso de CPU</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.cpuUsage}%</div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                style={{ width: `${metrics.cpuUsage}%` }}
              ></div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {metrics.cpuUsage <= 50 ? 'Normal' : metrics.cpuUsage <= 80 ? 'Moderado' : 'Alto'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Uso de Memoria</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.memoryUsage}%</div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${
                  metrics.memoryUsage <= 70 ? 'bg-green-600' : 
                  metrics.memoryUsage <= 85 ? 'bg-yellow-600' : 'bg-red-600'
                }`}
                style={{ width: `${metrics.memoryUsage}%` }}
              ></div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {metrics.memoryUsage <= 70 ? 'Óptimo' : metrics.memoryUsage <= 85 ? 'Precaución' : 'Crítico'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Estado de Base de Datos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {getHealthIcon(metrics.databaseHealth)}
              <Badge 
                variant={
                  metrics.databaseHealth === 'healthy' ? 'default' :
                  metrics.databaseHealth === 'warning' ? 'secondary' : 'destructive'
                }
              >
                {metrics.databaseHealth === 'healthy' ? 'Saludable' :
                 metrics.databaseHealth === 'warning' ? 'Advertencia' : 'Crítico'}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Latencia: {metrics.apiLatency}ms
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};