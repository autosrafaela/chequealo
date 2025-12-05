import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import { 
  Clock, 
  MapPin, 
  TrendingUp, 
  Users, 
  MessageCircle,
  Zap,
  Calendar,
  Target
} from 'lucide-react';

interface ProfessionalAnalyticsProps {
  professionalId: string;
}

interface HourlyData {
  hour: string;
  requests: number;
  conversions: number;
}

interface LocationData {
  location: string;
  requests: number;
  conversions: number;
  conversionRate: number;
}

interface WeeklyTrend {
  day: string;
  requests: number;
}

const COLORS = ['#f59e0b', '#3b82f6', '#10b981', '#8b5cf6', '#ef4444', '#06b6d4', '#ec4899'];

export const ProfessionalAnalytics = ({ professionalId }: ProfessionalAnalyticsProps) => {
  const [contactRequests, setContactRequests] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalyticsData();
  }, [professionalId]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);

      // Fetch contact requests with user profiles for location
      const { data: requests, error: reqError } = await supabase
        .from('contact_requests')
        .select(`
          id,
          created_at,
          status,
          type,
          is_express,
          user_id
        `)
        .eq('professional_id', professionalId)
        .order('created_at', { ascending: false });

      if (reqError) throw reqError;

      // Fetch user profiles for locations
      const userIds = [...new Set(requests?.map(r => r.user_id) || [])];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, location')
        .in('user_id', userIds);

      // Merge location data
      const requestsWithLocation = requests?.map(req => ({
        ...req,
        userLocation: profiles?.find(p => p.user_id === req.user_id)?.location || 'Sin ubicación'
      })) || [];

      setContactRequests(requestsWithLocation);

      // Fetch transactions
      const { data: txns, error: txnError } = await supabase
        .from('transactions')
        .select('*')
        .eq('professional_id', professionalId);

      if (txnError) throw txnError;
      setTransactions(txns || []);

    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate hourly distribution
  const hourlyData = useMemo((): HourlyData[] => {
    const hourCounts: Record<number, { requests: number; conversions: number }> = {};
    
    // Initialize all hours
    for (let i = 0; i < 24; i++) {
      hourCounts[i] = { requests: 0, conversions: 0 };
    }

    contactRequests.forEach(req => {
      const hour = new Date(req.created_at).getHours();
      hourCounts[hour].requests++;
      if (req.status === 'approved' || req.status === 'completed') {
        hourCounts[hour].conversions++;
      }
    });

    return Object.entries(hourCounts).map(([hour, data]) => ({
      hour: `${hour.padStart(2, '0')}:00`,
      requests: data.requests,
      conversions: data.conversions
    }));
  }, [contactRequests]);

  // Find peak hours
  const peakHours = useMemo(() => {
    const sorted = [...hourlyData].sort((a, b) => b.requests - a.requests);
    return sorted.slice(0, 3).filter(h => h.requests > 0);
  }, [hourlyData]);

  // Calculate location/neighborhood analytics
  const locationData = useMemo((): LocationData[] => {
    const locationCounts: Record<string, { requests: number; conversions: number }> = {};

    contactRequests.forEach(req => {
      const location = req.userLocation || 'Sin ubicación';
      if (!locationCounts[location]) {
        locationCounts[location] = { requests: 0, conversions: 0 };
      }
      locationCounts[location].requests++;
      if (req.status === 'approved' || req.status === 'completed') {
        locationCounts[location].conversions++;
      }
    });

    return Object.entries(locationCounts)
      .map(([location, data]) => ({
        location,
        requests: data.requests,
        conversions: data.conversions,
        conversionRate: data.requests > 0 ? Math.round((data.conversions / data.requests) * 100) : 0
      }))
      .sort((a, b) => b.requests - a.requests)
      .slice(0, 10);
  }, [contactRequests]);

  // Top converting locations
  const topConvertingLocations = useMemo(() => {
    return [...locationData]
      .filter(l => l.requests >= 2) // At least 2 requests for meaningful data
      .sort((a, b) => b.conversionRate - a.conversionRate)
      .slice(0, 5);
  }, [locationData]);

  // Weekly trend
  const weeklyTrend = useMemo((): WeeklyTrend[] => {
    const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const dayCounts: number[] = new Array(7).fill(0);

    contactRequests.forEach(req => {
      const day = new Date(req.created_at).getDay();
      dayCounts[day]++;
    });

    return days.map((day, index) => ({
      day,
      requests: dayCounts[index]
    }));
  }, [contactRequests]);

  // Express vs Regular requests
  const expressStats = useMemo(() => {
    const express = contactRequests.filter(r => r.is_express).length;
    const regular = contactRequests.length - express;
    return [
      { name: 'Express', value: express, color: '#f59e0b' },
      { name: 'Regular', value: regular, color: '#3b82f6' }
    ];
  }, [contactRequests]);

  // Key metrics
  const metrics = useMemo(() => {
    const totalRequests = contactRequests.length;
    const conversions = contactRequests.filter(r => r.status === 'approved' || r.status === 'completed').length;
    const conversionRate = totalRequests > 0 ? Math.round((conversions / totalRequests) * 100) : 0;
    const expressRequests = contactRequests.filter(r => r.is_express).length;
    
    return {
      totalRequests,
      conversions,
      conversionRate,
      expressRequests,
      avgRequestsPerDay: totalRequests > 0 ? (totalRequests / 30).toFixed(1) : '0'
    };
  }, [contactRequests]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded w-1/2 mb-2" />
                <div className="h-8 bg-muted rounded w-1/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Consultas</p>
                <p className="text-2xl font-bold">{metrics.totalRequests}</p>
              </div>
              <MessageCircle className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tasa de Conversión</p>
                <p className="text-2xl font-bold text-green-600">{metrics.conversionRate}%</p>
              </div>
              <Target className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Consultas Express</p>
                <p className="text-2xl font-bold text-amber-600">{metrics.expressRequests}</p>
              </div>
              <Zap className="h-8 w-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Promedio/día</p>
                <p className="text-2xl font-bold">{metrics.avgRequestsPerDay}</p>
              </div>
              <Calendar className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Peak Hours */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            <CardTitle>Horas Pico de Consultas</CardTitle>
          </div>
          <CardDescription>
            Horarios con mayor cantidad de solicitudes de clientes
          </CardDescription>
        </CardHeader>
        <CardContent>
          {peakHours.length > 0 ? (
            <div className="mb-4 flex flex-wrap gap-2">
              {peakHours.map((hour, index) => (
                <Badge 
                  key={hour.hour} 
                  variant={index === 0 ? "default" : "secondary"}
                  className={index === 0 ? "bg-amber-500 text-white" : ""}
                >
                  🔥 {hour.hour} - {hour.requests} consultas
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm mb-4">Sin datos suficientes aún</p>
          )}
          
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={hourlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" tick={{ fontSize: 10 }} interval={2} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="requests" fill="#3b82f6" name="Consultas" radius={[4, 4, 0, 0]} />
              <Bar dataKey="conversions" fill="#10b981" name="Conversiones" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Location Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              <CardTitle>Barrios con Más Consultas</CardTitle>
            </div>
            <CardDescription>
              Ubicaciones de donde llegan tus clientes
            </CardDescription>
          </CardHeader>
          <CardContent>
            {locationData.length > 0 ? (
              <div className="space-y-3">
                {locationData.slice(0, 5).map((loc, index) => (
                  <div key={loc.location} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-muted-foreground">
                        #{index + 1}
                      </span>
                      <span className="font-medium truncate max-w-[180px]">{loc.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{loc.requests} consultas</Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">
                Sin datos de ubicación aún
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              <CardTitle>Barrios que Más Convierten</CardTitle>
            </div>
            <CardDescription>
              Ubicaciones con mejor tasa de conversión
            </CardDescription>
          </CardHeader>
          <CardContent>
            {topConvertingLocations.length > 0 ? (
              <div className="space-y-3">
                {topConvertingLocations.map((loc, index) => (
                  <div key={loc.location} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-muted-foreground">
                        #{index + 1}
                      </span>
                      <span className="font-medium truncate max-w-[150px]">{loc.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-green-500 text-white">
                        {loc.conversionRate}% conversión
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">
                Necesitás más consultas para ver tendencias
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Weekly Trend & Express Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              <CardTitle>Tendencia Semanal</CardTitle>
            </div>
            <CardDescription>
              Días con mayor actividad
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={weeklyTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="requests" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  dot={{ fill: '#3b82f6' }}
                  name="Consultas"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-amber-500" />
              <CardTitle>Express vs Regular</CardTitle>
            </div>
            <CardDescription>
              Distribución de tipos de solicitud
            </CardDescription>
          </CardHeader>
          <CardContent>
            {metrics.totalRequests > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={expressStats}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {expressStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-muted-foreground text-center py-8">
                Sin consultas registradas aún
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tips */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30">
        <CardHeader>
          <CardTitle className="text-lg">💡 Tips para mejorar tus conversiones</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {peakHours.length > 0 && (
              <li>
                • <strong>Respondé rápido a las {peakHours[0]?.hour}</strong> - Es tu hora con más consultas
              </li>
            )}
            {topConvertingLocations.length > 0 && (
              <li>
                • <strong>Enfocate en {topConvertingLocations[0]?.location}</strong> - Es donde mejor convertís ({topConvertingLocations[0]?.conversionRate}%)
              </li>
            )}
            <li>
              • Las solicitudes <strong>Express</strong> tienen prioridad - Respondelas primero
            </li>
            <li>
              • Mantené tu perfil actualizado con fotos de trabajos recientes
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};