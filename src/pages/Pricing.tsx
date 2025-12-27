import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Check, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { SEOHead, generateBreadcrumbSchema } from "@/components/SEO/SEOHead";

interface PricingPlan {
  id: 'basic' | 'premium' | 'pro';
  name: string;
  tagline: string;
  price: {
    monthly: number;
    annual: number;
    currency: string;
  };
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
    price: {
      monthly: 5990,
      annual: 59900,
      currency: 'ARS'
    },
    features: [
      'Perfil profesional visible',
      'Hasta 10 contactos/mes',
      'Aparecés en búsquedas',
      'Gestión básica de reservas',
      'Soporte por email'
    ],
    cta: 'Elegir Básico',
    isPopular: false
  },
  {
    id: 'premium',
    name: 'Premium',
    tagline: 'Recibí más solicitudes cada semana',
    price: {
      monthly: 12990,
      annual: 129900,
      currency: 'ARS'
    },
    badge: 'MÁS ELEGIDO',
    features: [
      'Todo de Básico',
      'Contactos ilimitados',
      'Prioridad en resultados',
      'WhatsApp destacado',
      'Soporte prioritario'
    ],
    cta: 'Elegir Premium',
    isPopular: true
  },
  {
    id: 'pro',
    name: 'Pro',
    tagline: 'Máxima visibilidad en tu zona',
    price: {
      monthly: 19990,
      annual: 199900,
      currency: 'ARS'
    },
    features: [
      'Todo de Premium',
      'Badge "Top Profesional"',
      'Destacado en portada',
      'Analíticas de rendimiento',
      'Acceso anticipado a funciones'
    ],
    cta: 'Elegir Pro',
    isPopular: false
  }
];

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(price);
};

const calculateSavings = (monthly: number, annual: number) => {
  const yearlyFromMonthly = monthly * 12;
  const savings = yearlyFromMonthly - annual;
  return formatPrice(savings);
};

const Pricing = () => {
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Inicio', url: '/' },
    { name: 'Planes y Precios', url: '/pricing' }
  ]);

  return (
    <>
      <SEOHead 
        title="Planes y Precios - Chequealo | Suscripción para Profesionales"
        description="Conocé los planes de Chequealo para profesionales. Planes desde $5.990/mes. Aumentá tu visibilidad y conseguí más clientes."
        canonical="/pricing"
        structuredData={breadcrumbSchema}
      />
      <div className="min-h-screen bg-gradient-to-b from-muted/50 to-background">
        <Header />
      
        {/* Hero Section */}
        <section className="pt-12 pb-8 md:pt-20 md:pb-12">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4">
              Planes y Precios
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Maximizá tu negocio - Elegí tu plan ideal
            </p>
          </div>
        </section>

        {/* Pricing Cards */}
        <section className="py-8 md:py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              {/* Grid de planes - Premium en mobile primero */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-4 items-start lg:items-center">
                {/* Orden en mobile: Premium primero, luego Básico, luego Pro */}
                {[pricingPlans[1], pricingPlans[0], pricingPlans[2]].map((plan, index) => {
                  // En desktop: index 0 = Premium (centro), pero en el grid lo renderizamos en orden
                  // Reordenamos para desktop: Básico, Premium, Pro
                  const desktopOrder = index === 0 ? 'lg:order-2' : index === 1 ? 'lg:order-1' : 'lg:order-3';
                  
                  return (
                    <div
                      key={plan.id}
                      className={`relative rounded-2xl bg-card border-2 transition-all duration-300 ${
                        plan.isPopular
                          ? 'border-primary shadow-2xl lg:scale-110 z-10'
                          : 'border-border hover:border-primary/50 hover:shadow-lg'
                      } ${desktopOrder}`}
                    >
                      {/* Badge "Más elegido" */}
                      {plan.badge && (
                        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-20">
                          <div className="bg-gradient-to-r from-primary to-blue-600 text-white text-sm font-bold px-4 py-1.5 rounded-full shadow-lg flex items-center gap-1">
                            <Star className="w-3.5 h-3.5 fill-current" />
                            {plan.badge}
                          </div>
                        </div>
                      )}

                      <div className="p-6 lg:p-8">
                        {/* Header */}
                        <div className="text-center mb-6">
                          <h2 className={`text-2xl font-bold mb-1 ${
                            plan.isPopular ? 'text-primary' : 'text-foreground'
                          }`}>
                            {plan.name}
                          </h2>
                          <p className="text-muted-foreground text-sm">
                            {plan.tagline}
                          </p>
                        </div>

                        {/* Precio */}
                        <div className="text-center mb-6">
                          <div className="flex items-baseline justify-center gap-1">
                            <span className={`text-4xl font-bold ${
                              plan.isPopular ? 'text-primary' : 'text-foreground'
                            }`}>
                              {formatPrice(plan.price.monthly)}
                            </span>
                            <span className="text-muted-foreground">/mes</span>
                          </div>
                          
                          {/* Precio anual con ahorro */}
                          <div className="mt-2 space-y-1">
                            <p className="text-sm text-muted-foreground">
                              o {formatPrice(plan.price.annual)}/año
                            </p>
                            <p className="text-xs font-semibold text-green-600 dark:text-green-400">
                              Ahorrás {calculateSavings(plan.price.monthly, plan.price.annual)}
                            </p>
                          </div>
                        </div>

                        {/* Features */}
                        <ul className="space-y-3 mb-8">
                          {plan.features.map((feature, featureIndex) => (
                            <li key={featureIndex} className="flex items-start gap-3">
                              <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${
                                plan.isPopular 
                                  ? 'bg-primary/10' 
                                  : 'bg-green-100 dark:bg-green-900/30'
                              }`}>
                                <Check className={`w-3 h-3 ${
                                  plan.isPopular 
                                    ? 'text-primary' 
                                    : 'text-green-600 dark:text-green-400'
                                }`} />
                              </div>
                              <span className="text-sm text-foreground">{feature}</span>
                            </li>
                          ))}
                        </ul>

                        {/* CTA */}
                        <Link to="/register" className="block">
                          <Button
                            className={`w-full font-bold ${
                              plan.isPopular
                                ? 'h-12 text-base shadow-lg'
                                : 'h-11'
                            }`}
                            variant={plan.isPopular ? 'default' : 'outline'}
                            size="lg"
                          >
                            {plan.cta}
                          </Button>
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Todos los planes incluyen */}
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-xl md:text-2xl font-bold text-foreground mb-8">
                Todos los planes incluyen:
              </h2>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                {[
                  'Sin comisiones por contacto',
                  'Cancelá cuando quieras',
                  'Actualizaciones automáticas',
                  'Seguridad de datos',
                  'Capacitación inicial',
                  'Sin costos ocultos'
                ].map((benefit, index) => (
                  <div key={index} className="flex items-center gap-2 text-left">
                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                      <Check className="w-3 h-3 text-green-600 dark:text-green-400" />
                    </div>
                    <span className="text-sm text-muted-foreground">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA Final */}
        <section className="py-12 md:py-16 bg-card border-t border-border">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4">
              ¿Necesitás ayuda para elegir?
            </h2>
            <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
              Nuestro equipo está disponible para ayudarte a encontrar el plan perfecto para tu negocio
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <a href="https://wa.me/5493492607224?text=Hola,%20quiero%20información%20sobre%20los%20planes" target="_blank" rel="noopener noreferrer">
                  Hablá con un asesor
                </a>
              </Button>
              <Link to="/faq">
                <Button variant="outline" size="lg">
                  Ver Preguntas Frecuentes
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default Pricing;
