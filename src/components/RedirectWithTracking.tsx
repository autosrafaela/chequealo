import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface RedirectWithTrackingProps {
  from: string;
  to: string;
}

export const RedirectWithTracking = ({ from, to }: RedirectWithTrackingProps) => {
  useEffect(() => {
    const trackRedirect = async () => {
      try {
        // Capturar información adicional
        const referrer = document.referrer;
        const userAgent = navigator.userAgent;
        const timestamp = new Date().toISOString();

        // Registrar el evento de redirección
        await supabase.from('redirect_analytics').insert({
          from_path: from,
          to_path: to,
          referrer: referrer || null,
          user_agent: userAgent,
          timestamp: timestamp
        });

        console.log(`Redirect tracked: ${from} -> ${to}`);
      } catch (error) {
        console.error('Error tracking redirect:', error);
        // No bloqueamos la redirección si falla el tracking
      }
    };

    trackRedirect();
  }, [from, to]);

  return <Navigate to={to} replace />;
};
