import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Phone, Clock, Shield, Zap, CheckCircle2, MessageCircle } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import Header from '@/components/Header';

const Urgencias24 = () => {
  const [searchParams] = useSearchParams();
  
  useEffect(() => {
    // Track UTM parameters
    const utm = {
      source: searchParams.get('utm_source'),
      medium: searchParams.get('utm_medium'),
      campaign: searchParams.get('utm_campaign'),
      content: searchParams.get('utm_content'),
      term: searchParams.get('utm_term'),
    };
    
    if (utm.source) {
      console.log('Campaign tracking:', utm);
      // Store in localStorage for conversion tracking
      localStorage.setItem('chequealo_utm', JSON.stringify(utm));
    }
  }, [searchParams]);

  const handleWhatsAppClick = () => {
    const message = encodeURIComponent('Hola! Necesito un servicio URGENTE 24/7. Vi su publicidad en redes.');
    window.open(`https://wa.me/5493424000000?text=${message}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section - Urgency focused */}
      <section className="relative bg-gradient-to-br from-red-600 via-orange-500 to-amber-500 text-white py-16 px-4">
        <div className="absolute inset-0 bg-black/20" />
        <div className="container mx-auto relative z-10 text-center">
          <Badge className="bg-white/20 text-white border-white/30 mb-4 text-lg px-4 py-2">
            <Zap className="h-4 w-4 mr-2 inline" />
            SERVICIO 24/7
          </Badge>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            ¿Urgencia en Casa?
          </h1>
          <p className="text-xl md:text-2xl mb-2 opacity-90">
            Profesionales verificados disponibles AHORA
          </p>
          <p className="text-lg opacity-80 mb-8">
            Plomeros • Electricistas • Cerrajeros • Gasistas
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              size="lg" 
              onClick={handleWhatsAppClick}
              className="bg-green-500 hover:bg-green-600 text-white text-xl px-8 py-6 rounded-full shadow-2xl animate-pulse"
            >
              <MessageCircle className="h-6 w-6 mr-2" />
              WhatsApp AHORA
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              asChild
              className="border-white text-white hover:bg-white hover:text-orange-600 text-xl px-8 py-6 rounded-full"
            >
              <Link to="/search">
                <Phone className="h-6 w-6 mr-2" />
                Ver Profesionales
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-12 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="border-2 border-green-200 bg-green-50 dark:bg-green-950/20">
              <CardContent className="p-6 text-center">
                <Clock className="h-12 w-12 mx-auto mb-4 text-green-600" />
                <h3 className="text-xl font-bold mb-2">Respuesta Inmediata</h3>
                <p className="text-muted-foreground">
                  Profesionales responden en menos de 15 minutos
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-2 border-blue-200 bg-blue-50 dark:bg-blue-950/20">
              <CardContent className="p-6 text-center">
                <Shield className="h-12 w-12 mx-auto mb-4 text-blue-600" />
                <h3 className="text-xl font-bold mb-2">100% Verificados</h3>
                <p className="text-muted-foreground">
                  Todos los profesionales pasan por verificación de identidad
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-2 border-amber-200 bg-amber-50 dark:bg-amber-950/20">
              <CardContent className="p-6 text-center">
                <Zap className="h-12 w-12 mx-auto mb-4 text-amber-600" />
                <h3 className="text-xl font-bold mb-2">Precios Justos</h3>
                <p className="text-muted-foreground">
                  Sin sorpresas, presupuesto antes de empezar
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Services List */}
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-2xl">
          <h2 className="text-2xl font-bold text-center mb-8">Servicios de Urgencia</h2>
          
          <div className="space-y-4">
            {[
              'Pérdidas de agua y cañerías',
              'Cortes eléctricos y cortocircuitos',
              'Cerraduras trabadas o rotas',
              'Fugas de gas',
              'Desagotes tapados',
              'Calefones y termotanques',
            ].map((service, i) => (
              <div key={i} className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
                <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                <span className="font-medium">{service}</span>
              </div>
            ))}
          </div>
          
          <div className="mt-8 text-center">
            <Button 
              size="lg" 
              onClick={handleWhatsAppClick}
              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-xl px-8 py-6"
            >
              <MessageCircle className="h-6 w-6 mr-2" />
              Solicitar Urgencia por WhatsApp
            </Button>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="bg-foreground text-background py-8 px-4 text-center">
        <p className="text-lg mb-2">¿Emergencia ahora mismo?</p>
        <p className="text-2xl font-bold">Llamá o escribí las 24 horas</p>
      </section>
    </div>
  );
};

export default Urgencias24;
