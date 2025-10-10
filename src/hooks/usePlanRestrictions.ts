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
  maxAvailabilitySlots: number;
  canRateUsers: boolean;
  // Nuevas funcionalidades - Portfolio Mejorado
  canUploadVideos: boolean;
  canCreateBeforeAfter: boolean;
  canUploadCertificates: boolean;
  maxVideosPerPortfolio: number;
  maxCertificates: number;
  // Nuevas funcionalidades - Geolocalización
  canUseProximitySearch: boolean;
  canUseInteractiveMap: boolean;
  canVerifyLocation: boolean;
  proximitySearchRadius: number; // en km
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
    calendarIntegration: false,
    maxAvailabilitySlots: 5,
    canRateUsers: false,
    // Portfolio defaults
    canUploadVideos: false,
    canCreateBeforeAfter: false,
    canUploadCertificates: false,
    maxVideosPerPortfolio: 0,
    maxCertificates: 0,
    // Geolocalización defaults
    canUseProximitySearch: false,
    canUseInteractiveMap: false,
    canVerifyLocation: false,
    proximitySearchRadius: 5,
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
      
      // Check if professional has free access granted by admin
      const { data: professional } = await supabase
        .from('professionals')
        .select('has_free_access')
        .eq('user_id', user?.id)
        .single();

      // If professional has free access, grant unlimited everything
      if (professional?.has_free_access) {
        setPlanLimits({
          maxContactRequests: -1,
          maxWorkPhotos: -1,
          prioritySupport: true,
          advancedAnalytics: true,
          featuredListing: true,
          canAccessAdvancedFeatures: true,
          canReceiveMessages: true,
          canSendFiles: true,
          maxMonthlyBookings: -1,
          calendarIntegration: true,
          maxAvailabilitySlots: -1,
          canRateUsers: true,
          canUploadVideos: true,
          canCreateBeforeAfter: true,
          canUploadCertificates: true,
          maxVideosPerPortfolio: -1,
          maxCertificates: -1,
          canUseProximitySearch: true,
          canUseInteractiveMap: true,
          canVerifyLocation: true,
          proximitySearchRadius: 100,
        });
        setLoading(false);
        return;
      }
      
      const status = getSubscriptionStatus();
      
      // During trial period (including payment_reminder and payment_required), 
      // user gets FULL access to ALL features
      if (status === 'trial' || status === 'payment_reminder' || status === 'payment_required') {
        setPlanLimits({
          maxContactRequests: -1, // Unlimited
          maxWorkPhotos: -1, // Unlimited
          prioritySupport: true,
          advancedAnalytics: true,
          featuredListing: true,
          canAccessAdvancedFeatures: true,
          canReceiveMessages: true,
          canSendFiles: true,
          maxMonthlyBookings: -1, // Unlimited
          calendarIntegration: true,
          maxAvailabilitySlots: -1, // Unlimited
          canRateUsers: true,
          // Full Portfolio features during trial
          canUploadVideos: true,
          canCreateBeforeAfter: true,
          canUploadCertificates: true,
          maxVideosPerPortfolio: -1, // Unlimited
          maxCertificates: -1, // Unlimited
          // Full Geolocalización features during trial
          canUseProximitySearch: true,
          canUseInteractiveMap: true,
          canVerifyLocation: true,
          proximitySearchRadius: 100,
        });
        setLoading(false);
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
        // Set plan-specific limits based on plan name
        const isBasicPlan = plan.name === 'Plan Básico';
        const isProfessionalPlan = plan.name === 'Plan Profesional' || plan.name === 'Profesional Mensual';
        const isPremiumPlan = plan.name === 'Plan Premium';

        // Extract features from plan
        const features = Array.isArray(plan.features) ? plan.features : [];
        
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
          calendarIntegration: plan.calendar_integration,
          maxAvailabilitySlots: isBasicPlan ? 5 : -1,
          canRateUsers: !isBasicPlan,
          // Portfolio features based on plan
          canUploadVideos: features.includes('video_uploads'),
          canCreateBeforeAfter: features.includes('before_after_gallery'),
          canUploadCertificates: features.includes('digital_certificates'),
          maxVideosPerPortfolio: isPremiumPlan ? -1 : (isProfessionalPlan ? 10 : 0),
          maxCertificates: isPremiumPlan ? -1 : (isProfessionalPlan ? 5 : 0),
          // Geolocalización features based on plan
          canUseProximitySearch: features.includes('proximity_search') || features.includes('advanced_geolocation'),
          canUseInteractiveMap: features.includes('interactive_map'),
          canVerifyLocation: features.includes('advanced_geolocation'),
          proximitySearchRadius: isPremiumPlan ? 100 : (isProfessionalPlan ? 50 : 5),
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
    if (status === 'trial' || status === 'payment_reminder' || status === 'payment_required') {
      return 'Período de Prueba (Acceso Full)';
    }
    
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