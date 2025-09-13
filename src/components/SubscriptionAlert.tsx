import React from 'react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertCircle, CreditCard, Clock, XCircle } from "lucide-react";
import { useSubscription } from '@/hooks/useSubscription';
import { Link } from 'react-router-dom';

export const SubscriptionAlert = () => {
  const { subscription, getSubscriptionStatus, getDaysRemaining } = useSubscription();

  if (!subscription) return null;

  const status = getSubscriptionStatus();
  const daysRemaining = getDaysRemaining();

  // Don't show alert for active subscriptions
  if (status === 'active' || status === 'trial') return null;

  const getAlertContent = () => {
    switch (status) {
      case 'payment_reminder':
        return {
          variant: 'default' as const,
          icon: <Clock className="h-4 w-4" />,
          title: '¡Recordatorio de Suscripción!',
          message: `Te quedan ${daysRemaining} días de período de prueba. Configurá tu método de pago para continuar sin interrupciones.`,
          actionText: 'Configurar Pago',
          urgent: false
        };
      
      case 'payment_required':
        return {
          variant: 'destructive' as const,
          icon: <AlertCircle className="h-4 w-4" />,
          title: '¡Acción Requerida!',
          message: `Solo te quedan ${daysRemaining} días para completar tu suscripción. Después de este período, no podrás recibir nuevas solicitudes.`,
          actionText: 'Pagar Ahora',
          urgent: true
        };
      
      case 'expired':
        return {
          variant: 'destructive' as const,
          icon: <XCircle className="h-4 w-4" />,
          title: 'Suscripción Expirada',
          message: 'Tu período de prueba ha finalizado. Para volver a recibir solicitudes, renovä tu suscripción mensual.',
          actionText: 'Renovar Suscripción',
          urgent: true
        };
      
      default:
        return null;
    }
  };

  const alertContent = getAlertContent();
  if (!alertContent) return null;

  return (
    <Alert variant={alertContent.variant} className={`mb-6 ${alertContent.urgent ? 'animate-pulse' : ''}`}>
      {alertContent.icon}
      <AlertDescription className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <strong className="block sm:inline">{alertContent.title}</strong>
          <span className="block sm:inline sm:ml-2">{alertContent.message}</span>
        </div>
        <Button asChild variant={alertContent.urgent ? 'secondary' : 'outline'} size="sm" className="shrink-0">
          <Link to="/dashboard?tab=subscription" className="flex items-center gap-2">
            <CreditCard className="w-4 h-4" />
            {alertContent.actionText}
          </Link>
        </Button>
      </AlertDescription>
    </Alert>
  );
};