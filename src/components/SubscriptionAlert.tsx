import React, { useState, useEffect } from 'react';
import { useSubscription } from '@/hooks/useSubscription';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export const SubscriptionAlert = () => {
  const { user } = useAuth();
  const { subscription, getSubscriptionStatus } = useSubscription();
  const [hasFreeAccess, setHasFreeAccess] = useState(false);

  useEffect(() => {
    if (!user) return;
    const checkFreeAccess = async () => {
      const { data } = await supabase
        .from('professionals')
        .select('has_free_access')
        .eq('user_id', user.id)
        .maybeSingle();
      setHasFreeAccess(data?.has_free_access ?? false);
    };
    checkFreeAccess();
  }, [user]);

  if (!subscription) return null;

  const status = getSubscriptionStatus();

  // Only show Pioneros banner for professionals with has_free_access
  if (!hasFreeAccess) return null;
  if (status === 'active') return null;

  return (
    <div className="mb-6 flex items-center gap-3 p-4 rounded-xl border border-amber-200 bg-gradient-to-r from-amber-50 to-yellow-50">
      <span className="text-2xl">✨</span>
      <div className="flex-1">
        <span className="font-semibold text-amber-900">
          ¡Bienvenido al Programa Pioneros!
        </span>
        <p className="text-sm text-amber-800 mt-0.5">
          Tenés acceso premium bonificado por 365 días
        </p>
      </div>
    </div>
  );
};
