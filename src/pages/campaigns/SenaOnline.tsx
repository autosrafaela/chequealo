import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Shield, Percent, CheckCircle2, Calendar, Lock, ArrowRight } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import Header from '@/components/Header';

const SenaOnline = () => {
  const [searchParams] = useSearchParams();
  
  useEffect(() => {
    // Track UTM parameters
    const utm = {
      source: searchParams.get('utm_source'),
      medium: searchParams.get('utm_medium'),
      campaign: searchParams.get('utm_campaign'),
      content: searchParams.get('utm_content'),
    };
    
    if (utm.source) {
      console.log('Campaign tracking:', utm);
      localStorage.setItem('chequealo_utm', JSON.stringify(utm));
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-emerald-600 via-teal-500 to-cyan-500 text-white py-16 px-4">
        <div className="container mx-auto text-center">
          <Badge className="bg-white/20 text-white border-white/30 mb-4 text-lg px-4 py-2">
            <CreditCard className="h-4 w-4 mr-2 inline" />
            RESERVÁ ONLINE
          </Badge>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            Seña 20% y llevate
            <span className="block text-amber-300">10% OFF adicional</span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 opacity-90">
            Asegurá tu turno con un profesional verificado
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              asChild
              className="bg-white text-emerald-600 hover:bg-white/90 text-xl px-8 py-6 rounded-full shadow-2xl"
            >
              <Link to="/search">
                <Calendar className="h-6 w-6 mr-2" />
                Reservar Ahora
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Value Proposition */}
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-4">¿Cómo funciona?</h2>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0">
                    <span className="font-bold text-emerald-600">1</span>
                  </div>
                  <div>
                    <h3 className="font-semibold">Elegí un profesional</h3>
                    <p className="text-muted-foreground">Buscá el servicio y profesional que necesitás</p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0">
                    <span className="font-bold text-emerald-600">2</span>
                  </div>
                  <div>
                    <h3 className="font-semibold">Dejá una seña del 20%</h3>
                    <p className="text-muted-foreground">Pagás online de forma segura con MercadoPago</p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0">
                    <span className="font-bold text-emerald-600">3</span>
                  </div>
                  <div>
                    <h3 className="font-semibold">Recibí 10% de descuento</h3>
                    <p className="text-muted-foreground">Se aplica automáticamente al total del servicio</p>
                  </div>
                </div>
              </div>
            </div>
            
            <Card className="border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Ejemplo de ahorro</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b">
                  <span>Servicio de ejemplo</span>
                  <span className="font-medium">$50.000</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b text-emerald-600">
                  <span>Descuento 10%</span>
                  <span className="font-medium">-$5.000</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span>Seña online (20%)</span>
                  <span className="font-medium">$9.000</span>
                </div>
                <div className="flex justify-between items-center py-2 text-lg font-bold">
                  <span>Total final</span>
                  <span className="text-emerald-600">$45.000</span>
                </div>
                <Badge className="w-full justify-center py-2 bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200">
                  ¡Ahorrás $5.000!
                </Badge>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-12 px-4 bg-muted/30">
        <div className="container mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">¿Por qué reservar con seña?</h2>
          
          <div className="grid md:grid-cols-4 gap-6">
            <Card className="text-center">
              <CardContent className="p-6">
                <Lock className="h-10 w-10 mx-auto mb-3 text-emerald-600" />
                <h3 className="font-semibold mb-1">Pago Seguro</h3>
                <p className="text-sm text-muted-foreground">100% protegido con MercadoPago</p>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardContent className="p-6">
                <Calendar className="h-10 w-10 mx-auto mb-3 text-emerald-600" />
                <h3 className="font-semibold mb-1">Turno Garantizado</h3>
                <p className="text-sm text-muted-foreground">El profesional confirma tu fecha</p>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardContent className="p-6">
                <Percent className="h-10 w-10 mx-auto mb-3 text-emerald-600" />
                <h3 className="font-semibold mb-1">10% Descuento</h3>
                <p className="text-sm text-muted-foreground">Automático al dejar seña</p>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardContent className="p-6">
                <Shield className="h-10 w-10 mx-auto mb-3 text-emerald-600" />
                <h3 className="font-semibold mb-1">Profesionales Verificados</h3>
                <p className="text-sm text-muted-foreground">Identidad comprobada</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 text-center">
        <div className="container mx-auto max-w-2xl">
          <h2 className="text-3xl font-bold mb-4">¿Listo para ahorrar?</h2>
          <p className="text-lg text-muted-foreground mb-8">
            Encontrá el profesional ideal y asegurá tu turno con descuento
          </p>
          <Button size="lg" asChild className="text-xl px-8 py-6">
            <Link to="/search">
              Buscar Profesionales
              <ArrowRight className="h-6 w-6 ml-2" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <section className="bg-foreground text-background py-8 px-4 text-center">
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Badge variant="secondary" className="text-base">
            <CreditCard className="h-4 w-4 mr-1" />
            Seña 20%
          </Badge>
          <span className="text-2xl">+</span>
          <Badge className="bg-amber-500 text-white text-base">
            <Percent className="h-4 w-4 mr-1" />
            10% OFF
          </Badge>
        </div>
      </section>
    </div>
  );
};

export default SenaOnline;
