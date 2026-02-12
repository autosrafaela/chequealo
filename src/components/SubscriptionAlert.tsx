import React from 'react';
import { useSubscription } from '@/hooks/useSubscription';

export const SubscriptionAlert = () => {
  const { subscription, getSubscriptionStatus } = useSubscription();

  if (!subscription) return null;

  const status = getSubscriptionStatus();

  // Only show for non-active states
  if (status === 'active' || status === 'none') return null;

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
