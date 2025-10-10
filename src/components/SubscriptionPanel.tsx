import React, { useState, useEffect } from 'react';
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
    getDaysRemaining,
    hasFullAccessDuringTrial,
    getPlanFeatures
  } = useSubscription();
  
  const [showPlanSelection, setShowPlanSelection] = useState(false);

  // Auto-abrir el selector de plan cuando corresponde
  useEffect(() => {
    if (loading || !subscription) return;
    const st = getSubscriptionStatus();
    if ((st === 'expired' || st === 'payment_required') && !subscription.selected_plan_id) {
      setShowPlanSelection(true);
    }
  }, [loading, subscription]);

  // Abrir modal si llega ?select_plan=1|true o &open=plan por URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sp = params.get('select_plan');
    if ((sp && ['1','true','yes'].includes(sp)) || params.get('open') === 'plan') {
      setShowPlanSelection(true);
    }
  }, []);

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
  const planFeatures = getPlanFeatures();
  const hasFullAccess = hasFullAccessDuringTrial();

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
  const canSelectPlanNow = ['trial','payment_reminder','payment_required','expired'].includes(status);
  
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
            <div className="flex items-center gap-2">
              {statusInfo.badge}
              {canSelectPlanNow && (
                <Button variant="outline" size="sm" onClick={() => setShowPlanSelection(true)}>
                  {subscription.selected_plan_id ? 'Cambiar Plan' : 'Elegir Plan'}
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Plan Actual</p>
              <p className="text-lg font-semibold">
                {hasFullAccess ? 'Plan Full (Período de Prueba)' : (
                  subscription.selected_plan_id 
                    ? subscription.subscription_plans.name 
                    : subscription.subscription_plans.name
                )}
              </p>
              {hasFullAccess && (
                <Badge variant="secondary" className="text-xs">✓ Acceso Full Activo</Badge>
              )}
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Costo Mensual</p>
              <p className="text-lg font-semibold">
                {hasFullAccess ? (
                  <span className="text-green-600">$0 (Gratis en prueba)</span>
                ) : (
                  <span>${subscription.subscription_plans.price.toLocaleString()} {subscription.subscription_plans.currency}</span>
                )}
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Estado</p>
              <p className="text-lg font-semibold flex items-center gap-2">
                {statusInfo.badge}
              </p>
            </div>
          </div>
          
          {/* Plan Selection/Change Section - Always visible during trial */}
          {hasFullAccess && (
            <div className="mt-6 space-y-4">
              <div className="border-t pt-4">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  Plan después del período de prueba
                </h4>
                <div className="bg-muted/50 p-4 rounded-lg space-y-3">
                  {subscription.selected_plan_id && subscription.selected_subscription_plan ? (
                    <>
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="font-semibold text-base">
                            {subscription.selected_subscription_plan.name}
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">
                            ${subscription.selected_subscription_plan.price.toLocaleString()} {subscription.selected_subscription_plan.currency}/mes
                          </p>
                          <p className="text-xs text-muted-foreground mt-2">
                            ✓ Este será tu plan al finalizar el período de prueba
                          </p>
                        </div>
                        <Button 
                          variant="outline"
                          size="sm"
                          onClick={() => setShowPlanSelection(true)}
                        >
                          <Settings className="w-3 h-3 mr-1" />
                          Cambiar
                        </Button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm font-medium">Sin plan seleccionado</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Elige el plan que quieres después del trial
                          </p>
                        </div>
                        <Button 
                          variant="outline"
                          size="sm"
                          onClick={() => setShowPlanSelection(true)}
                        >
                          <Settings className="w-3 h-3 mr-1" />
                          Elegir Plan
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              </div>
              
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Acceso Full Activo ({daysRemaining} días restantes)
                </h4>
                <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
                  <li>✓ Solicitudes de contacto ilimitadas</li>
                  <li>✓ Fotos de trabajos ilimitadas</li>
                  <li>✓ Reservas mensuales ilimitadas</li>
                  <li>✓ Mensajes y envío de archivos</li>
                  <li>✓ Perfil destacado y analíticas avanzadas</li>
                  <li>✓ Soporte prioritario e integración de calendario</li>
                </ul>
                <p className="text-xs text-green-600 dark:text-green-400 mt-3 font-medium">
                  💡 Seleccioná tu plan ahora para continuar sin interrupciones al finalizar el período de prueba
                </p>
              </div>
            </div>
          )}
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

      {/* Plan Selection Available Anytime */}
      {(status === 'trial' || status === 'payment_reminder' || status === 'payment_required' || status === 'expired') && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              {status === 'trial' || status === 'payment_reminder' ? 'Elegir Plan para después del Trial' : 'Completar Suscripción'}
            </CardTitle>
            <CardDescription>
              {status === 'trial' || status === 'payment_reminder' 
                ? 'Elegí ahora el plan que quieras usar cuando termine tu período de prueba. Podés pagar ahora o más tarde.'
                : 'Seleccioná un plan y completá tu pago para continuar recibiendo solicitudes.'}
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
                    disabled={
                      creating || (
                        !subscription.selected_plan_id && ['payment_required','expired'].includes(getSubscriptionStatus())
                      )
                    }
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
            <div className="space-y-4">
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
              
              <Button 
                variant="outline"
                onClick={() => setShowPlanSelection(true)}
                className="w-full"
              >
                <Settings className="w-4 h-4 mr-2" />
                Cambiar Plan
              </Button>
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