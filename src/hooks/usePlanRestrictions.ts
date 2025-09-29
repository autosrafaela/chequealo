import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from './useSubscription';

interface PlanLimits {
  maxContactRequests: number;
  maxWorkPhotos: number;
  prioritySupport: boolean;
  advancedAnalytics: boolean;
  featuredListing: boolean;
  canAccessAdvancedFeatures: boolean;
  canReceiveMessages: boolean;
  canSendFiles: boolean;
  maxMonthlyBookings: number;
  calendarIntegration: boolean;
}

interface ExtendedSubscription {
  id: string;
  user_id: string;
  professional_id: string;
  plan_id: string;
  selected_plan_id?: string;
  status: string;
  trial_start_date: string;
  trial_end_date: string;
  payment_reminder_sent: boolean;
  payment_data_required_date: string;
  next_billing_date?: string;
  plan_selection_deadline?: string;
  subscription_plans?: {
    id: string;
    name: string;
    price: number;
    currency: string;
    billing_interval: string;
    grace_period_days: number;
  };
}

export const usePlanRestrictions = () => {
  const { user } = useAuth();
  const { subscription, getSubscriptionStatus } = useSubscription();
  const [planLimits, setPlanLimits] = useState<PlanLimits>({
    maxContactRequests: -1,
    maxWorkPhotos: -1,
    prioritySupport: true,
    advancedAnalytics: false,
    featuredListing: false,
    canAccessAdvancedFeatures: true,
    canReceiveMessages: true,
    canSendFiles: false,
    maxMonthlyBookings: -1,
    calendarIntegration: false
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (subscription) {
      fetchPlanLimits();
    }
  }, [subscription]);

  const fetchPlanLimits = async () => {
    try {
      setLoading(true);
      
      const status = getSubscriptionStatus();
      
      // During trial period, user gets full Professional plan features
      if (status === 'trial') {
        const { data: professionalPlan } = await supabase
          .from('subscription_plans')
          .select('*')
          .eq('name', 'Plan Profesional')
          .single();

        if (professionalPlan) {
          setPlanLimits({
            maxContactRequests: professionalPlan.max_contact_requests,
            maxWorkPhotos: professionalPlan.max_work_photos,
            prioritySupport: professionalPlan.priority_support,
            advancedAnalytics: professionalPlan.advanced_analytics,
            featuredListing: professionalPlan.featured_listing,
            canAccessAdvancedFeatures: true,
            canReceiveMessages: professionalPlan.can_receive_messages,
            canSendFiles: professionalPlan.can_send_files,
            maxMonthlyBookings: professionalPlan.max_monthly_bookings,
            calendarIntegration: professionalPlan.calendar_integration
          });
        }
        return;
      }

      // After trial, use selected plan or current plan
      const extendedSub = subscription as ExtendedSubscription;
      const planId = extendedSub.selected_plan_id || extendedSub.plan_id;
      
      const { data: plan, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('id', planId)
        .single();

      if (error) throw error;

      if (plan) {
        setPlanLimits({
          maxContactRequests: plan.max_contact_requests,
          maxWorkPhotos: plan.max_work_photos,
          prioritySupport: plan.priority_support,
          advancedAnalytics: plan.advanced_analytics,
          featuredListing: plan.featured_listing,
          canAccessAdvancedFeatures: status === 'active',
          canReceiveMessages: plan.can_receive_messages,
          canSendFiles: plan.can_send_files,
          maxMonthlyBookings: plan.max_monthly_bookings,
          calendarIntegration: plan.calendar_integration
        });
      }

    } catch (error) {
      console.error('Error fetching plan limits:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkContactRequestsLimit = async (): Promise<boolean> => {
    if (planLimits.maxContactRequests === -1) return true; // Unlimited

    try {
      const { data: professional } = await supabase
        .from('professionals')
        .select('id')
        .eq('user_id', user?.id)
        .single();

      if (!professional) return false;

      // Check current month's contact requests
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { data: requests, error } = await supabase
        .from('contact_requests')
        .select('id')
        .eq('professional_id', professional.id)
        .gte('created_at', startOfMonth.toISOString());

      if (error) throw error;

      return (requests?.length || 0) < planLimits.maxContactRequests;
    } catch (error) {
      console.error('Error checking contact requests limit:', error);
      return false;
    }
  };

  const checkWorkPhotosLimit = async (): Promise<boolean> => {
    if (planLimits.maxWorkPhotos === -1) return true; // Unlimited

    try {
      const { data: professional } = await supabase
        .from('professionals')
        .select('id')
        .eq('user_id', user?.id)
        .single();

      if (!professional) return false;

      const { data: photos, error } = await supabase
        .from('work_photos')
        .select('id')
        .eq('professional_id', professional.id);

      if (error) throw error;

      return (photos?.length || 0) < planLimits.maxWorkPhotos;
    } catch (error) {
      console.error('Error checking work photos limit:', error);
      return false;
    }
  };

  const getPlanName = (): string => {
    if (!subscription) return 'Sin Plan';
    
    const status = getSubscriptionStatus();
    if (status === 'trial') return 'Período de Prueba (Plan Completo)';
    
    return subscription.subscription_plans?.name || 'Plan Desconocido';
  };

  return {
    planLimits,
    loading,
    checkContactRequestsLimit,
    checkWorkPhotosLimit,
    getPlanName,
    refreshLimits: fetchPlanLimits
  };
};