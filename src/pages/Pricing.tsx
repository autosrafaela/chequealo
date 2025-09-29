import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Star, Zap, Shield, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";

const Pricing = () => {
  const features = [
    "Perfil profesional completo",
    "Galería ilimitada de trabajos",
    "Recepción de contactos sin límite",
    "Sistema de reseñas y calificaciones",
    "Notificaciones en tiempo real",
    "Estadísticas de rendimiento",
    "Soporte técnico prioritario",
    "Verificación de identidad",
    "Visibilidad en búsquedas",
    "Panel de control avanzado"
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
          <div className="max-w-4xl mx-auto">
            
            {/* Current Plan */}
            <div className="text-center mb-16">
              <Card className="relative max-w-2xl mx-auto border-2 border-primary">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-primary text-primary-foreground px-6 py-2 rounded-full text-sm font-medium">
                    Plan Actual
                  </span>
                </div>
                
                <CardHeader className="text-center pt-8">
                  <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Star className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="text-3xl">Profesional Mensual</CardTitle>
                  <CardDescription className="text-lg">
                    Todo lo que necesitás para hacer crecer tu negocio
                  </CardDescription>
                  <div className="text-center py-6">
                    <div className="text-5xl font-bold text-foreground mb-2">
                      $19.990
                      <span className="text-lg font-normal text-muted-foreground">/mes</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Después de 90 días gratuitos
                    </p>
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {features.map((feature, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <Check className="h-5 w-5 text-success flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-6 text-center">
                    <Link to="/register">
                      <Button size="lg" className="w-full md:w-auto px-8">
                        Comenzar Período Gratuito
                      </Button>
                    </Link>
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