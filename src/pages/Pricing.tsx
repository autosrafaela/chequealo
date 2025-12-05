import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Star, Zap, Shield, TrendingUp, Crown, Users, BarChart } from "lucide-react";
import { Link } from "react-router-dom";

const Pricing = () => {
  const plans = [
    {
      id: "basic",
      name: "Plan Básico",
      price: 8990,
      originalPrice: null,
      description: "Ideal para profesionales que empiezan",
      icon: <Users className="h-8 w-8 text-blue-500" />,
      popular: false,
      features: [
        "Perfil profesional básico",
        "Hasta 50 contactos por mes",
        "Galería de hasta 10 fotos",
        "Sistema básico de reseñas",
        "Soporte estándar por email",
        "Estadísticas básicas"
      ],
      limitations: [
        "Sin notificaciones en tiempo real",
        "Sin verificación de identidad",
        "Sin promoción en búsquedas"
      ]
    },
    {
      id: "professional",
      name: "Plan Profesional",
      price: 14990,
      originalPrice: null,
      description: "El más elegido por profesionales establecidos",
      icon: <Star className="h-8 w-8 text-primary" />,
      popular: true,
      features: [
        "Perfil profesional completo",
        "Contactos ilimitados",
        "Galería ilimitada de trabajos",
        "Sistema completo de reseñas",
        "Notificaciones en tiempo real",
        "Estadísticas detalladas",
        "Soporte prioritario",
        "Verificación de identidad",
        "Visibilidad optimizada en búsquedas"
      ],
      limitations: []
    },
    {
      id: "premium",
      name: "Plan Premium",
      price: 24990,
      originalPrice: null,
      description: "Para profesionales que buscan máxima visibilidad y crecimiento en redes",
      icon: <Crown className="h-8 w-8 text-yellow-500" />,
      popular: false,
      features: [
        "Todo del Plan Profesional",
        "Perfil destacado en búsquedas",
        "Badge Premium visible",
        "Analíticas avanzadas y reportes",
        "Promoción prioritaria",
        "Soporte 24/7 personalizado",
        "Acceso beta a nuevas funciones",
        "Gestor de cuenta dedicado"
      ],
      limitations: [],
      socialPackages: [
        {
          title: "📸 Posts Colaborador (IG Collab)",
          description: "Carouseles 'Top 5 de Rafaela' y 'Trabajo del mes'. El post sale en Chequealo y en tu perfil (doble alcance)"
        },
        {
          title: "🎬 Reels/Stories con plantilla",
          description: "4 plantillas listas: antes/después, testimonio, promo -10% con seña, urgencias 24/7. Solo subís fotos + texto"
        },
        {
          title: "⭐ Pack Stories Destacadas",
          description: "6 covers + stickers 'Verificado por Chequealo' para armar Highlights: Precios, Reseñas, Turnos, Urgencias, Trabajos, Garantía"
        },
        {
          title: "🎟️ Cupones Traqueables",
          description: "Códigos tipo CHEQ-TUEMPRESA para usar en bio y posts. Medimos con UTM el tráfico que generás"
        }
      ]
    }
  ];

  const benefits = [
    {
      icon: <TrendingUp className="h-8 w-8 text-success" />,
      title: "Más Clientes",
      description: "Acceso a miles de clientes potenciales buscando tus servicios"
    },
    {
      icon: <Shield className="h-8 w-8 text-primary" />,
      title: "Credibilidad",
      description: "Perfil verificado que genera confianza en tus clientes"
    },
    {
      icon: <Zap className="h-8 w-8 text-warning" />,
      title: "Gestión Simple",
      description: "Panel intuitivo para manejar contactos y proyectos"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-b from-primary/10 to-background">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Planes y Precios
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Hacé crecer tu negocio con Chequealo. Comenzá gratis y expandí tu alcance
          </p>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            
            {/* Plan Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-16">
              {plans.map((plan, index) => (
                <Card 
                  key={plan.id} 
                  className={`relative transition-all hover:shadow-lg ${
                    plan.popular 
                      ? 'border-2 border-primary shadow-lg scale-105' 
                      : 'border hover:border-primary/50'
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-primary text-primary-foreground px-4 py-1">
                        Más Popular
                      </Badge>
                    </div>
                  )}
                  
                  <CardHeader className="text-center pt-8">
                    <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      {plan.icon}
                    </div>
                    <CardTitle className="text-2xl">{plan.name}</CardTitle>
                    <CardDescription className="text-base">
                      {plan.description}
                    </CardDescription>
                    <div className="text-center py-6">
                      <div className="text-4xl font-bold text-foreground mb-2">
                        ${plan.price.toLocaleString()}
                        <span className="text-lg font-normal text-muted-foreground">/mes</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Después de 90 días gratuitos
                      </p>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-6">
                    <div className="space-y-3">
                      {plan.features.map((feature, featureIndex) => (
                        <div key={featureIndex} className="flex items-start space-x-3">
                          <Check className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                          <span className="text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>

                    {/* Social Media Packages - Solo para Premium */}
                    {plan.socialPackages && plan.socialPackages.length > 0 && (
                      <div className="border-t pt-4">
                        <p className="text-sm font-semibold text-primary mb-3">
                          🚀 Pack Marketing Redes Sociales:
                        </p>
                        <div className="space-y-3">
                          {plan.socialPackages.map((pkg: { title: string; description: string }, pkgIndex: number) => (
                            <div key={pkgIndex} className="bg-primary/5 rounded-lg p-3">
                              <p className="text-sm font-medium">{pkg.title}</p>
                              <p className="text-xs text-muted-foreground mt-1">{pkg.description}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="pt-6">
                      <Link to="/register">
                        <Button 
                          size="lg" 
                          className={`w-full ${
                            plan.popular 
                              ? 'bg-primary hover:bg-primary/90' 
                              : 'variant-outline'
                          }`}
                          variant={plan.popular ? 'default' : 'outline'}
                        >
                          Comenzar Período Gratuito
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {/* PRO MAX - Coming Soon Card */}
              <Card className="relative border-2 border-dashed border-muted-foreground/30 opacity-75">
                <CardHeader className="text-center pt-8">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Crown className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-2xl">PRO MAX</CardTitle>
                  <CardDescription className="text-base">
                    Para empresas y equipos grandes
                  </CardDescription>
                  <div className="text-center py-6">
                    <div className="text-3xl font-bold text-muted-foreground mb-2">
                      Próximamente
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Funcionalidades exclusivas
                    </p>
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  <div className="space-y-3 text-center">
                    <p className="text-sm text-muted-foreground">
                      Gestión de equipos múltiples
                    </p>
                    <p className="text-sm text-muted-foreground">
                      API y integraciones avanzadas
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Reportes personalizados
                    </p>
                  </div>

                  <div className="pt-6">
                    <Button 
                      size="lg" 
                      className="w-full"
                      variant="outline"
                      disabled
                    >
                      Disponible Pronto
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Trial Period Info */}
            <div className="bg-card rounded-lg p-8 mb-16">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-foreground mb-4">
                  🎉 Comenzá con 90 días completamente gratis
                </h2>
                <p className="text-lg text-muted-foreground">
                  Probá todas las funcionalidades sin costo alguno
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-success/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">📝</span>
                  </div>
                  <h3 className="font-semibold mb-2">Días 1-75</h3>
                  <p className="text-sm text-muted-foreground">
                    Período de prueba completo. Configurá tu perfil y comenzá a recibir contactos.
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-12 h-12 bg-warning/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">💳</span>
                  </div>
                  <h3 className="font-semibold mb-2">Días 75-90</h3>
                  <p className="text-sm text-muted-foreground">
                    Te recordamos agregar un método de pago para continuar sin interrupciones.
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">🚀</span>
                  </div>
                  <h3 className="font-semibold mb-2">Día 91+</h3>
                  <p className="text-sm text-muted-foreground">
                    Comenzá tu suscripción mensual y seguí creciendo tu negocio.
                  </p>
                </div>
              </div>
            </div>

            {/* Benefits */}
            <div className="mb-16">
              <h2 className="text-3xl font-bold text-center text-foreground mb-12">
                ¿Por qué elegir Chequealo?
              </h2>
              
              <div className="grid md:grid-cols-3 gap-8">
                {benefits.map((benefit, index) => (
                  <Card key={index} className="text-center">
                    <CardHeader>
                      <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        {benefit.icon}
                      </div>
                      <CardTitle>{benefit.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">{benefit.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Future Features */}
            <div className="bg-gradient-to-r from-primary/5 to-success/5 rounded-lg p-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-foreground mb-4">
                  🔮 Próximamente
                </h2>
                <p className="text-muted-foreground">
                  Estamos trabajando en nuevas funcionalidades para potenciar tu negocio
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-background/50 rounded-lg p-6">
                  <h3 className="font-semibold mb-3">📢 Publicaciones Destacadas</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Hacé que tu perfil aparezca primero en los resultados de búsqueda
                  </p>
                  <span className="text-xs bg-warning/20 text-warning-foreground px-2 py-1 rounded">
                    Próximamente
                  </span>
                </div>

                <div className="bg-background/50 rounded-lg p-6">
                  <h3 className="font-semibold mb-3">🎯 Planes Premium</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Funcionalidades avanzadas para profesionales establecidos
                  </p>
                  <span className="text-xs bg-warning/20 text-warning-foreground px-2 py-1 rounded">
                    En desarrollo
                  </span>
                </div>
              </div>
            </div>

            {/* FAQ Section */}
            <div className="mt-16 text-center">
              <h2 className="text-2xl font-bold text-foreground mb-4">
                ¿Tenés preguntas?
              </h2>
              <p className="text-muted-foreground mb-8">
                Consultá nuestras preguntas frecuentes o contactanos directamente
              </p>
              <div className="space-y-4 sm:space-y-0 sm:flex sm:justify-center sm:space-x-4">
                <Link to="/faq">
                  <Button variant="outline" size="lg">
                    Ver Preguntas Frecuentes
                  </Button>
                </Link>
                <Button size="lg" asChild>
                  <a href="tel:+5493492607224">
                    📱 +54 9 3492 60-7224
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Pricing;