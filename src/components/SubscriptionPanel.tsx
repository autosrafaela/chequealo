import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  CreditCard, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  XCircle,
  Calendar,
  Settings
} from "lucide-react";
import { useSubscription } from '@/hooks/useSubscription';
import { PlanSelectionModal } from './PlanSelectionModal';

export const SubscriptionPanel = () => {
  const { 
    subscription, 
    loading, 
    creating, 
    createPaymentPreference, 
    getSubscriptionStatus, 
    getDaysRemaining 
  } = useSubscription();
  
  const [showPlanSelection, setShowPlanSelection] = useState(false);

  const handlePayment = async (selectedPlanId?: string) => {
    const preference = await createPaymentPreference(selectedPlanId);
    
    if (preference && preference.initPoint) {
      // Redirect to MercadoPago checkout
      window.location.href = preference.initPoint;
    }
  };

  const handlePlanSelected = (planId: string) => {
    // Plan has been saved, now user can choose to pay immediately or later
    setShowPlanSelection(false);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Cargando información de suscripción...</div>
        </CardContent>
      </Card>
    );
  }

  if (!subscription) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <p className="text-muted-foreground">No se encontró información de suscripción.</p>
            <p className="text-sm text-muted-foreground mt-2">
              La suscripción se crea automáticamente al registrarte como profesional.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const status = getSubscriptionStatus();
  const daysRemaining = getDaysRemaining();

  const getStatusInfo = () => {
    switch (status) {
      case 'trial':
        return {
          badge: <Badge variant="secondary" className="gap-1"><Clock className="w-3 h-3" />Período de Prueba</Badge>,
          color: 'blue',
          icon: Clock,
          title: 'Período de Prueba Activo',
          description: `Te quedan ${daysRemaining} días de prueba gratuita`
        };
      case 'payment_reminder':
        return {
          badge: <Badge variant="outline" className="gap-1 border-orange-300 text-orange-700"><AlertCircle className="w-3 h-3" />Recordatorio</Badge>,
          color: 'orange',
          icon: AlertCircle,
          title: 'Configurá tu Método de Pago',
          description: `Te quedan ${daysRemaining} días de prueba. Configurá tu pago para continuar sin interrupciones.`
        };
      case 'payment_required':
        return {
          badge: <Badge variant="destructive" className="gap-1"><AlertCircle className="w-3 h-3" />Acción Requerida</Badge>,
          color: 'red',
          icon: AlertCircle,
          title: 'Pago Requerido',
          description: `Te quedan ${daysRemaining} días. Completá tu suscripción para evitar la suspensión.`
        };
      case 'active':
        return {
          badge: <Badge variant="default" className="gap-1 bg-green-600 hover:bg-green-700"><CheckCircle className="w-3 h-3" />Activa</Badge>,
          color: 'green',
          icon: CheckCircle,
          title: 'Suscripción Activa',
          description: 'Tu suscripción está al día. Próximo pago en ' + (subscription.next_billing_date ? new Date(subscription.next_billing_date).toLocaleDateString() : 'fecha pendiente')
        };
      case 'expired':
        return {
          badge: <Badge variant="destructive" className="gap-1"><XCircle className="w-3 h-3" />Expirada</Badge>,
          color: 'red',
          icon: XCircle,
          title: 'Suscripción Expirada',
          description: 'Tu período de prueba ha finalizado. Renovä tu suscripción para continuar.'
        };
      default:
        return {
          badge: <Badge variant="secondary">Desconocido</Badge>,
          color: 'gray',
          icon: Clock,
          title: 'Estado Desconocido',
          description: 'No se pudo determinar el estado de la suscripción'
        };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <div className="space-y-6">
      {/* Status Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <statusInfo.icon className="w-5 h-5" />
                {statusInfo.title}
              </CardTitle>
              <CardDescription>{statusInfo.description}</CardDescription>
            </div>
            {statusInfo.badge}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Plan</p>
              <p className="text-lg font-semibold">{subscription.subscription_plans.name}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Precio</p>
              <p className="text-lg font-semibold">
                ${subscription.subscription_plans.price.toLocaleString()} {subscription.subscription_plans.currency}
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Período de Prueba</p>
              <p className="text-lg font-semibold">{subscription.subscription_plans.grace_period_days} días</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Alerts */}
      {(status === 'payment_reminder' || status === 'payment_required' || status === 'expired') && (
        <Alert className={`border-${statusInfo.color}-200 bg-${statusInfo.color}-50`}>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {status === 'payment_reminder' && (
              <>
                <strong>¡No te olvides!</strong> Te quedan {daysRemaining} días de período de prueba. 
                Para continuar recibiendo solicitudes sin interrupciones, configurá tu método de pago ahora.
              </>
            )}
            {status === 'payment_required' && (
              <>
                <strong>Acción requerida:</strong> Te quedan solo {daysRemaining} días para completar tu suscripción. 
                Después de este período, no podrás recibir nuevas solicitudes.
              </>
            )}
            {status === 'expired' && (
              <>
                <strong>Suscripción expirada:</strong> Tu período de prueba ha finalizado. 
                Para volver a recibir solicitudes, debés renovar tu suscripción mensual.
              </>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Payment Action */}
      {(status === 'payment_reminder' || status === 'payment_required' || status === 'expired') && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Completar Suscripción
            </CardTitle>
            <CardDescription>
              Procesamos tu pago de forma segura a través de MercadoPago.
            </CardDescription>
          </CardHeader>
          <CardContent>
              <div className="space-y-4">
                <div className="bg-muted p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">
                      {subscription.selected_plan_id ? 'Plan Seleccionado' : subscription.subscription_plans.name}
                    </span>
                    <span className="text-lg font-bold">
                      ${subscription.subscription_plans.price.toLocaleString()} {subscription.subscription_plans.currency}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">Facturación mensual</p>
                </div>
                
                <div className="space-y-3">
                  <Button 
                    variant="outline"
                    onClick={() => setShowPlanSelection(true)}
                    className="w-full"
                    disabled={creating}
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    {subscription.selected_plan_id ? 'Cambiar Plan' : 'Seleccionar Plan'}
                  </Button>
                  
                  <Button 
                    onClick={() => handlePayment(subscription.selected_plan_id)}
                    disabled={creating}
                    size="lg" 
                    className="w-full"
                  >
                    {creating ? (
                      <>Procesando...</>
                    ) : (
                      <>
                        <CreditCard className="w-4 h-4 mr-2" />
                        Pagar con MercadoPago
                      </>
                    )}
                  </Button>
                </div>
              
              <p className="text-xs text-muted-foreground text-center">
                Al completar el pago, aceptás nuestros términos de servicio. 
                Podés cancelar tu suscripción en cualquier momento.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Subscription Details */}
      {status === 'active' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Detalles de Facturación
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Próximo pago:</span>
                <span className="font-medium">
                  {subscription.next_billing_date 
                    ? new Date(subscription.next_billing_date).toLocaleDateString('es-AR')
                    : 'Fecha pendiente'
                  }
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Método de pago:</span>
                <span className="font-medium">MercadoPago</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Estado:</span>
                <Badge variant="default" className="bg-green-600 hover:bg-green-700">
                  Activa
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Plan Selection Modal */}
      <PlanSelectionModal
        isOpen={showPlanSelection}
        onClose={() => setShowPlanSelection(false)}
        onPlanConfirmed={handlePlanSelected}
        currentPlanId={subscription?.selected_plan_id || subscription?.plan_id}
      />
    </div>
  );
};