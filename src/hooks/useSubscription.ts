import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  billing_interval: string;
  grace_period_days: number;
}

interface Subscription {
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
  subscription_plans: SubscriptionPlan;
}

export const useSubscription = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const fetchSubscription = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Get professional profile first
      const { data: professional } = await supabase
        .from('professionals')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!professional) {
        setSubscription(null);
        return;
      }

      // Get subscription with proper plan relation
      const { data, error } = await supabase
        .from('subscriptions')
        .select(`
          *,
          subscription_plans!plan_id(*)
        `)
        .eq('professional_id', professional.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching subscription:', error);
        return;
      }

      setSubscription(data || null);
    } catch (error) {
      console.error('Error in fetchSubscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const createPaymentPreference = async (selectedPlanId?: string) => {
    if (!subscription) return null;

    try {
      setCreating(true);

      const { data, error } = await supabase.functions.invoke('create-payment-preference', {
        body: {
          subscriptionId: subscription.id,
          selectedPlanId: selectedPlanId,
          returnUrl: `${window.location.origin}/dashboard?payment=success`
        }
      });

      if (error) {
        throw error;
      }

      return data;
    } catch (error: any) {
      console.error('Error creating payment preference:', error);
      toast({
        title: "Error",
        description: "No se pudo crear la preferencia de pago. Intentá nuevamente.",
        variant: "destructive"
      });
      return null;
    } finally {
      setCreating(false);
    }
  };

  const updateSelectedPlan = async (planId: string) => {
    if (!subscription) return false;

    try {
      const { error } = await supabase
        .from('subscriptions')
        .update({ selected_plan_id: planId })
        .eq('id', subscription.id);

      if (error) throw error;

      await fetchSubscription();
      return true;
    } catch (error) {
      console.error('Error updating selected plan:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el plan seleccionado.",
        variant: "destructive"
      });
      return false;
    }
  };

  const getSubscriptionStatus = () => {
    if (!subscription) return 'none';

    const now = new Date();
    const trialEndDate = new Date(subscription.trial_end_date);
    const paymentRequiredDate = new Date(subscription.payment_data_required_date);

    if (subscription.status === 'expired') return 'expired';
    if (subscription.status === 'active') return 'active';
    
    if (subscription.status === 'trial') {
      if (now > trialEndDate) return 'expired';
      if (now > paymentRequiredDate) return 'payment_required';
      
      const daysSinceStart = Math.floor((now.getTime() - new Date(subscription.trial_start_date).getTime()) / (1000 * 60 * 60 * 24));
      if (daysSinceStart >= 60) return 'payment_reminder';
      
      return 'trial';
    }

    return subscription.status;
  };

  const getDaysRemaining = () => {
    if (!subscription) return 0;
    
    const now = new Date();
    const endDate = new Date(subscription.trial_end_date);
    const diffTime = endDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return Math.max(0, diffDays);
  };

  // During trial period, professionals have access to FULL plan features
  const hasFullAccessDuringTrial = () => {
    if (!subscription) return false;
    
    const status = getSubscriptionStatus();
    // During trial, payment_reminder, and payment_required states, they have FULL access
    return ['trial', 'payment_reminder', 'payment_required'].includes(status);
  };

  // After trial expires without payment, downgrade to basic plan
  const getPlanFeatures = () => {
    if (!subscription) return null;

    // During trial period (including reminder and required states), give FULL access
    if (hasFullAccessDuringTrial()) {
      return {
        name: 'Plan Full (Período de Prueba)',
        max_contact_requests: -1, // Unlimited
        max_work_photos: -1, // Unlimited
        max_monthly_bookings: -1, // Unlimited
        can_receive_messages: true,
        can_send_files: true,
        featured_listing: true,
        advanced_analytics: true,
        priority_support: true,
        calendar_integration: true
      };
    }

    // After trial expires, use selected plan or default to basic
    return subscription.subscription_plans;
  };

  useEffect(() => {
    fetchSubscription();
  }, [user]);

  return {
    subscription,
    loading,
    creating,
    fetchSubscription,
    createPaymentPreference,
    updateSelectedPlan,
    getSubscriptionStatus,
    getDaysRemaining,
    hasFullAccessDuringTrial,
    getPlanFeatures
  };
};