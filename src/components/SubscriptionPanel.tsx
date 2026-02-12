import React from 'react';
import { Button } from "@/components/ui/button";
import { Check, Star, Calendar, Crown } from "lucide-react";
import { useSubscription } from '@/hooks/useSubscription';

interface PricingPlan {
  id: 'basic' | 'premium' | 'pro';
  name: string;
  tagline: string;
  price: { monthly: number; annual: number; currency: string };
  badge?: string;
  features: string[];
  cta: string;
  isPopular?: boolean;
}

const pricingPlans: PricingPlan[] = [
  {
    id: 'basic',
    name: 'Básico',
    tagline: 'Para empezar',
    price: { monthly: 5990, annual: 59900, currency: 'ARS' },
    features: [
      'Perfil profesional visible',
      'Hasta 10 contactos/mes',
      'Aparecés en búsquedas',
      'Gestión básica de reservas',
      'Soporte por email'
    ],
    cta: 'Elegir Básico',
  },
  {
    id: 'premium',
    name: 'Premium',
    tagline: 'Recibí más solicitudes cada semana',
    price: { monthly: 12990, annual: 129900, currency: 'ARS' },
    badge: 'MÁS ELEGIDO',
    features: [
      'Todo de Básico',
      'Contactos ilimitados',
      'Prioridad en resultados',
      'WhatsApp destacado',
      'Soporte prioritario'
    ],
    cta: 'Elegir Premium',
    isPopular: true,
  },
  {
    id: 'pro',
    name: 'Pro',
    tagline: 'Máxima visibilidad en tu zona',
    price: { monthly: 19990, annual: 199900, currency: 'ARS' },
    features: [
      'Todo de Premium',
      'Badge "Top Profesional"',
      'Destacado en portada',
      'Analíticas de rendimiento',
      'Acceso anticipado a funciones'
    ],
    cta: 'Elegir Pro',
  }
];

const formatPrice = (price: number) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(price);

export const SubscriptionPanel = () => {
  const { subscription, loading, getSubscriptionStatus, getDaysRemaining } = useSubscription();

  if (loading) {
    return <div className="text-center py-12 text-muted-foreground">Cargando información de suscripción...</div>;
  }

  if (!subscription) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No se encontró información de suscripción.</p>
        <p className="text-sm text-muted-foreground mt-2">La suscripción se crea automáticamente al registrarte como profesional.</p>
      </div>
    );
  }

  const status = getSubscriptionStatus();
  const daysRemaining = getDaysRemaining();
  const isPionero = ['trial', 'payment_reminder', 'payment_required'].includes(status);
  // During Pioneros program, the user gets Premium-level access
  const currentPlanId: PricingPlan['id'] = isPionero ? 'premium' : 'basic';

  const trialEndDate = subscription.trial_end_date
    ? new Date(subscription.trial_end_date).toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })
    : null;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Planes y Precios</h2>
        <p className="text-muted-foreground mt-1">Tu plan actual y opciones disponibles</p>
      </div>

      {/* Pricing Cards Grid - Premium first on mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-4 items-start lg:items-center">
        {[pricingPlans[1], pricingPlans[0], pricingPlans[2]].map((plan, index) => {
          const desktopOrder = index === 0 ? 'lg:order-2' : index === 1 ? 'lg:order-1' : 'lg:order-3';
          const isCurrentPlan = plan.id === currentPlanId;

          return (
            <div
              key={plan.id}
              className={`relative rounded-2xl bg-card border-2 transition-all duration-300 ${
                plan.isPopular
                  ? 'border-primary shadow-2xl lg:scale-110 z-10'
                  : 'border-border hover:border-primary/50 hover:shadow-lg'
              } ${desktopOrder}`}
            >
              {/* Badge TU PLAN ACTUAL */}
              {isCurrentPlan && (
                <div className="absolute -top-4 right-4 z-20">
                  <div className="bg-primary text-primary-foreground text-xs font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1">
                    <Crown className="w-3 h-3" />
                    TU PLAN ACTUAL
                  </div>
                </div>
              )}

              {/* Badge MÁS ELEGIDO */}
              {plan.badge && !isCurrentPlan && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-20">
                  <div className="bg-gradient-to-r from-primary to-blue-600 text-white text-sm font-bold px-4 py-1.5 rounded-full shadow-lg flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    {plan.badge}
                  </div>
                </div>
              )}

              {/* When both badges needed (current + popular) */}
              {plan.badge && isCurrentPlan && (
                <div className="absolute -top-4 left-4 z-20">
                  <div className="bg-gradient-to-r from-primary to-blue-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1">
                    <Star className="w-3 h-3 fill-current" />
                    {plan.badge}
                  </div>
                </div>
              )}

              <div className="p-6 lg:p-8">
                {/* Header */}
                <div className="text-center mb-6">
                  <h3 className={`text-2xl font-bold mb-1 ${plan.isPopular ? 'text-primary' : 'text-foreground'}`}>
                    {plan.name}
                  </h3>
                  <p className="text-muted-foreground text-sm">{plan.tagline}</p>
                </div>

                {/* Price */}
                <div className="text-center mb-6">
                  {isPionero && isCurrentPlan ? (
                    <>
                      <div className="flex items-baseline justify-center gap-2">
                        <span className="text-lg text-muted-foreground line-through">
                          {formatPrice(plan.price.monthly)}
                        </span>
                        <span className="text-4xl font-bold text-green-600">$0</span>
                      </div>
                      <p className="text-sm font-semibold text-green-600 mt-2">
                        Bonificado por ser Miembro Fundador
                      </p>
                    </>
                  ) : (
                    <div className="flex items-baseline justify-center gap-1">
                      <span className={`text-4xl font-bold ${plan.isPopular ? 'text-primary' : 'text-foreground'}`}>
                        {formatPrice(plan.price.monthly)}
                      </span>
                      <span className="text-muted-foreground">/mes</span>
                    </div>
                  )}
                </div>

                {/* Features */}
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${
                        plan.isPopular ? 'bg-primary/10' : 'bg-green-100 dark:bg-green-900/30'
                      }`}>
                        <Check className={`w-3 h-3 ${plan.isPopular ? 'text-primary' : 'text-green-600 dark:text-green-400'}`} />
                      </div>
                      <span className="text-sm text-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <Button
                  className={`w-full font-bold rounded-full ${plan.isPopular ? 'h-12 text-base shadow-lg' : 'h-11'}`}
                  variant={isCurrentPlan ? 'default' : 'outline'}
                  size="lg"
                  disabled={isCurrentPlan}
                >
                  {isCurrentPlan ? 'Tu Plan Actual' : plan.cta}
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Expiration Section */}
      {trialEndDate && (
        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-foreground">
                Próximo Vencimiento: {trialEndDate}
              </p>
              {isPionero && (
                <p className="text-sm text-muted-foreground mt-1">
                  Programa Pioneros — Acceso bonificado por {daysRemaining} días más
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
