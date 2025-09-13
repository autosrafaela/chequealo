import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface AnalyticsMetrics {
  // Growth metrics
  totalUsers: number;
  newUsersToday: number;
  newUsersThisWeek: number;
  newUsersThisMonth: number;
  userGrowthPercentage: number;
  
  // Professional metrics
  totalProfessionals: number;
  newProfessionalsToday: number;
  verifiedProfessionals: number;
  activeProfessionals: number;
  professionalsGrowthPercentage: number;
  
  // Subscription metrics
  activeSubscriptions: number;
  trialSubscriptions: number;
  expiredSubscriptions: number;
  subscriptionRevenue: number;
  conversionRate: number;
  
  // Engagement metrics
  totalContactRequests: number;
  contactRequestsToday: number;
  averageResponseTime: number;
  completedTransactions: number;
  conversionToTransaction: number;
  
  // Review metrics
  totalReviews: number;
  averageRating: number;
  reviewsThisMonth: number;
  
  // Top categories
  topCategories: { profession: string; count: number; growth: number }[];
  
  // Monthly trends
  monthlyGrowth: { month: string; users: number; professionals: number; revenue: number }[];
  
  // Real-time activity
  onlineUsers: number;
  recentActivities: { type: string; message: string; timestamp: string }[];
}

export const useAnalytics = () => {
  const [metrics, setMetrics] = useState<AnalyticsMetrics>({
    totalUsers: 0,
    newUsersToday: 0,
    newUsersThisWeek: 0,
    newUsersThisMonth: 0,
    userGrowthPercentage: 0,
    totalProfessionals: 0,
    newProfessionalsToday: 0,
    verifiedProfessionals: 0,
    activeProfessionals: 0,
    professionalsGrowthPercentage: 0,
    activeSubscriptions: 0,
    trialSubscriptions: 0,
    expiredSubscriptions: 0,
    subscriptionRevenue: 0,
    conversionRate: 0,
    totalContactRequests: 0,
    contactRequestsToday: 0,
    averageResponseTime: 0,
    completedTransactions: 0,
    conversionToTransaction: 0,
    totalReviews: 0,
    averageRating: 0,
    reviewsThisMonth: 0,
    topCategories: [],
    monthlyGrowth: [],
    onlineUsers: 0,
    recentActivities: []
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
      const lastMonth = new Date(today.getTime() - 60 * 24 * 60 * 60 * 1000);

      // Fetch all data in parallel
      const [
        usersData,
        professionalsData,
        subscriptionsData,
        contactRequestsData,
        transactionsData,
        reviewsData,
        paymentsData
      ] = await Promise.all([
        // Users
        supabase.from('profiles').select('created_at'),
        
        // Professionals
        supabase.from('professionals').select('created_at, profession, is_verified, user_id'),
        
        // Subscriptions
        supabase.from('subscriptions').select('status, created_at, professional_id, subscription_plans(price)'),
        
        // Contact Requests
        supabase.from('contact_requests').select('created_at, status, professional_id'),
        
        // Transactions
        supabase.from('transactions').select('status, created_at, completed_at'),
        
        // Reviews
        supabase.from('reviews').select('rating, created_at'),
        
        // Payments
        supabase.from('payments').select('amount, status, created_at')
      ]);

      // Process users data
      const users = usersData.data || [];
      const totalUsers = users.length;
      const newUsersToday = users.filter(u => new Date(u.created_at) >= today).length;
      const newUsersThisWeek = users.filter(u => new Date(u.created_at) >= weekAgo).length;
      const newUsersThisMonth = users.filter(u => new Date(u.created_at) >= monthAgo).length;
      const newUsersLastMonth = users.filter(u => {
        const date = new Date(u.created_at);
        return date >= lastMonth && date < monthAgo;
      }).length;
      const userGrowthPercentage = newUsersLastMonth > 0 
        ? ((newUsersThisMonth - newUsersLastMonth) / newUsersLastMonth) * 100 
        : newUsersThisMonth > 0 ? 100 : 0;

      // Process professionals data
      const professionals = professionalsData.data || [];
      const totalProfessionals = professionals.length;
      const newProfessionalsToday = professionals.filter(p => new Date(p.created_at) >= today).length;
      const verifiedProfessionals = professionals.filter(p => p.is_verified).length;
      const activeProfessionals = professionals.filter(p => p.user_id).length; // Those with active accounts
      const newProfessionalsThisMonth = professionals.filter(p => new Date(p.created_at) >= monthAgo).length;
      const newProfessionalsLastMonth = professionals.filter(p => {
        const date = new Date(p.created_at);
        return date >= lastMonth && date < monthAgo;
      }).length;
      const professionalsGrowthPercentage = newProfessionalsLastMonth > 0 
        ? ((newProfessionalsThisMonth - newProfessionalsLastMonth) / newProfessionalsLastMonth) * 100 
        : newProfessionalsThisMonth > 0 ? 100 : 0;

      // Process subscriptions data
      const subscriptions = subscriptionsData.data || [];
      const activeSubscriptions = subscriptions.filter(s => s.status === 'active').length;
      const trialSubscriptions = subscriptions.filter(s => s.status === 'trial').length;
      const expiredSubscriptions = subscriptions.filter(s => s.status === 'expired').length;
      
      // Process payments data
      const payments = paymentsData.data || [];
      const subscriptionRevenue = payments
        .filter(p => p.status === 'approved')
        .reduce((sum, p) => sum + (parseFloat(String(p.amount)) || 0), 0);

      // Conversion rate (trials to active)
      const conversionRate = trialSubscriptions > 0 
        ? (activeSubscriptions / (activeSubscriptions + trialSubscriptions)) * 100 
        : 0;

      // Process contact requests data
      const contactRequests = contactRequestsData.data || [];
      const totalContactRequests = contactRequests.length;
      const contactRequestsToday = contactRequests.filter(c => new Date(c.created_at) >= today).length;

      // Process transactions data
      const transactions = transactionsData.data || [];
      const completedTransactions = transactions.filter(t => t.status === 'completed').length;
      const conversionToTransaction = totalContactRequests > 0 
        ? (completedTransactions / totalContactRequests) * 100 
        : 0;

      // Process reviews data
      const reviews = reviewsData.data || [];
      const totalReviews = reviews.length;
      const reviewsThisMonth = reviews.filter(r => new Date(r.created_at) >= monthAgo).length;
      const averageRating = reviews.length > 0 
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length 
        : 0;

      // Top categories
      const categoryCount = professionals.reduce((acc, p) => {
        acc[p.profession] = (acc[p.profession] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      const topCategories = Object.entries(categoryCount)
        .map(([profession, count]) => ({
          profession,
          count,
          growth: Math.random() * 20 + 5 // Mock growth data
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      // Monthly growth data (last 6 months)
      const monthlyGrowth = [];
      for (let i = 5; i >= 0; i--) {
        const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const nextMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
        
        const monthUsers = users.filter(u => {
          const date = new Date(u.created_at);
          return date >= monthDate && date < nextMonth;
        }).length;
        
        const monthProfessionals = professionals.filter(p => {
          const date = new Date(p.created_at);
          return date >= monthDate && date < nextMonth;
        }).length;
        
        const monthRevenue = payments
          .filter(p => {
            const date = new Date(p.created_at);
            return date >= monthDate && date < nextMonth && p.status === 'approved';
          })
          .reduce((sum, p) => sum + (parseFloat(String(p.amount)) || 0), 0);

        monthlyGrowth.push({
          month: monthDate.toLocaleDateString('es', { month: 'short', year: 'numeric' }),
          users: monthUsers,
          professionals: monthProfessionals,
          revenue: monthRevenue
        });
      }

      // Recent activities (mock data for now)
      const recentActivities = [
        { type: 'user', message: 'Nuevo usuario registrado', timestamp: new Date().toISOString() },
        { type: 'professional', message: 'Profesional verificado', timestamp: new Date(Date.now() - 300000).toISOString() },
        { type: 'payment', message: 'Pago procesado exitosamente', timestamp: new Date(Date.now() - 600000).toISOString() },
        { type: 'review', message: 'Nueva reseña de 5 estrellas', timestamp: new Date(Date.now() - 900000).toISOString() }
      ];

      setMetrics({
        totalUsers,
        newUsersToday,
        newUsersThisWeek,
        newUsersThisMonth,
        userGrowthPercentage,
        totalProfessionals,
        newProfessionalsToday,
        verifiedProfessionals,
        activeProfessionals,
        professionalsGrowthPercentage,
        activeSubscriptions,
        trialSubscriptions,
        expiredSubscriptions,
        subscriptionRevenue,
        conversionRate,
        totalContactRequests,
        contactRequestsToday,
        averageResponseTime: 2.5, // Mock data
        completedTransactions,
        conversionToTransaction,
        totalReviews,
        averageRating,
        reviewsThisMonth,
        topCategories,
        monthlyGrowth,
        onlineUsers: Math.floor(Math.random() * 50) + 10, // Mock data
        recentActivities
      });

    } catch (error) {
      console.error('Error fetching analytics:', error);
      setError('Error al cargar las métricas');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();

    // Set up real-time updates
    const channel = supabase
      .channel('analytics-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, fetchAnalytics)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'professionals' }, fetchAnalytics)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'subscriptions' }, fetchAnalytics)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'contact_requests' }, fetchAnalytics)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'reviews' }, fetchAnalytics)
      .subscribe();

    // Refresh every 5 minutes
    const interval = setInterval(fetchAnalytics, 5 * 60 * 1000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, [fetchAnalytics]);

  return {
    metrics,
    loading,
    error,
    refetch: fetchAnalytics
  };
};