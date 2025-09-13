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
  status: string;
  trial_start_date: string;
  trial_end_date: string;
  payment_reminder_sent: boolean;
  payment_data_required_date: string;
  next_billing_date?: string;
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
        .single();

      if (!professional) {
        setSubscription(null);
        return;
      }

      // Get subscription
      const { data, error } = await supabase
        .from('subscriptions')
        .select(`
          *,
          subscription_plans!inner(*)
        `)
        .eq('professional_id', professional.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

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

  const createPaymentPreference = async () => {
    if (!subscription) return null;

    try {
      setCreating(true);

      const { data, error } = await supabase.functions.invoke('create-payment-preference', {
        body: {
          subscriptionId: subscription.id,
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

  useEffect(() => {
    fetchSubscription();
  }, [user]);

  return {
    subscription,
    loading,
    creating,
    fetchSubscription,
    createPaymentPreference,
    getSubscriptionStatus,
    getDaysRemaining
  };
};