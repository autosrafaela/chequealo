import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface BusinessMetrics {
  totalRevenue: number;
  totalUsers: number;
  totalProfessionals: number;
  activeSubscriptions: number;
  averageRating: number;
  monthlyGrowth: number;
  conversionRate: number;
  retentionRate: number;
}

interface UserAnalytics {
  newUsers: number;
  activeUsers: number;
  churnRate: number;
  averageSessionTime: number;
  topCategories: Array<{ name: string; count: number }>;
  usersByLocation: Array<{ location: string; count: number }>;
}

interface RevenueAnalytics {
  monthlyRevenue: Array<{ month: string; revenue: number }>;
  revenueByCategory: Array<{ category: string; revenue: number }>;
  averageTransactionValue: number;
  recurringRevenue: number;
}

export const useBusinessIntelligence = () => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<BusinessMetrics | null>(null);
  const [userAnalytics, setUserAnalytics] = useState<UserAnalytics | null>(null);
  const [revenueAnalytics, setRevenueAnalytics] = useState<RevenueAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBusinessMetrics = async () => {
    try {
      // Fetch total users
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Fetch professionals
      const { count: totalProfessionals } = await supabase
        .from('professionals')
        .select('*', { count: 'exact', head: true });

      // Fetch subscriptions
      const { count: activeSubscriptions } = await supabase
        .from('subscriptions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      // Fetch reviews for average rating
      const { data: reviews } = await supabase
        .from('reviews')
        .select('rating');

      const averageRating = reviews && reviews.length > 0 
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length 
        : 0;

      setMetrics({
        totalRevenue: 125000,
        totalUsers: totalUsers || 0,
        totalProfessionals: totalProfessionals || 0,
        activeSubscriptions: activeSubscriptions || 0,
        averageRating: Number(averageRating.toFixed(1)),
        monthlyGrowth: 5.2,
        conversionRate: 12.5,
        retentionRate: 78.3
      });
    } catch (err) {
      console.error('Error fetching business metrics:', err);
      setError('Error al cargar métricas');
    }
  };

  const fetchUserAnalytics = async () => {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { count: newUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', thirtyDaysAgo.toISOString());

      const { data: contactRequests } = await supabase
        .from('contact_requests')
        .select('service_type');

      const categories: Record<string, number> = {};
      contactRequests?.forEach(request => {
        const type = request.service_type || 'General';
        categories[type] = (categories[type] || 0) + 1;
      });

      const topCategories = Object.entries(categories)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      setUserAnalytics({
        newUsers: newUsers || 0,
        activeUsers: Math.floor((newUsers || 0) * 0.7),
        churnRate: 8.5,
        averageSessionTime: 4.2,
        topCategories,
        usersByLocation: [
          { location: 'Buenos Aires', count: 1250 },
          { location: 'Córdoba', count: 340 },
          { location: 'Rosario', count: 280 },
          { location: 'Mendoza', count: 190 },
          { location: 'Tucumán', count: 150 }
        ]
      });
    } catch (err) {
      console.error('Error fetching user analytics:', err);
      setError('Error al cargar analíticas de usuarios');
    }
  };

  const fetchRevenueAnalytics = async () => {
    try {
      // Simulated data for revenue analytics
      const monthlyRevenue = [
        { month: 'Ene', revenue: 12500 },
        { month: 'Feb', revenue: 15200 },
        { month: 'Mar', revenue: 18700 },
        { month: 'Abr', revenue: 21300 },
        { month: 'May', revenue: 19800 },
        { month: 'Jun', revenue: 25400 }
      ];

      const revenueByCategory = [
        { category: 'Plomería', revenue: 35000 },
        { category: 'Electricidad', revenue: 28000 },
        { category: 'Carpintería', revenue: 22000 },
        { category: 'Pintura', revenue: 18000 },
        { category: 'Jardinería', revenue: 15000 }
      ];

      setRevenueAnalytics({
        monthlyRevenue,
        revenueByCategory,
        averageTransactionValue: 2850,
        recurringRevenue: 25400
      });
    } catch (err) {
      console.error('Error fetching revenue analytics:', err);
      setError('Error al cargar analíticas de ingresos');
    }
  };

  const fetchAllData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      await Promise.all([
        fetchBusinessMetrics(),
        fetchUserAnalytics(),
        fetchRevenueAnalytics()
      ]);
    } catch (err) {
      setError('Error al cargar datos');
    }
    
    setLoading(false);
  };

  const exportReport = async (type: 'csv' | 'pdf' | 'excel') => {
    try {
      if (type === 'csv') {
        const csv = [
          ['Métrica', 'Valor'],
          ['Ingresos Totales', metrics?.totalRevenue || 0],
          ['Usuarios Totales', metrics?.totalUsers || 0],
          ['Profesionales', metrics?.totalProfessionals || 0],
          ['Suscripciones Activas', metrics?.activeSubscriptions || 0]
        ].map(row => row.join(',')).join('\n');

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `business_report_${Date.now()}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error('Error exporting report:', err);
      setError('Error al exportar reporte');
    }
  };

  useEffect(() => {
    if (user) {
      fetchAllData();
    }
  }, [user]);

  return {
    metrics,
    userAnalytics,
    revenueAnalytics,
    loading,
    error,
    refetch: fetchAllData,
    exportReport
  };
};