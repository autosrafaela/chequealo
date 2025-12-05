import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Gift, Tag, Percent, CheckCircle2, Copy, Sparkles, MessageCircle } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import Header from '@/components/Header';
import { useCampaignTracking } from '@/hooks/useCampaignTracking';

const CAMPAIGN_ID = 'cheq10';

const PromoDescuento = () => {
  const [searchParams] = useSearchParams();
  const [copied, setCopied] = useState(false);
  const cupon = searchParams.get('cupon') || 'CHEQ10';
  const { trackWhatsAppClick, trackPageView, trackEvent } = useCampaignTracking();
  
  useEffect(() => {
    trackPageView(CAMPAIGN_ID);
    localStorage.setItem('chequealo_cupon', cupon);
  }, [trackPageView, cupon]);

  const handleCopyCupon = () => {
    navigator.clipboard.writeText(cupon);
    setCopied(true);
    toast.success('¡Cupón copiado!');
    trackEvent({ eventType: 'cta_click', campaign: CAMPAIGN_ID, metadata: { action: 'copy_coupon', coupon: cupon } });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsAppClick = () => {
    trackWhatsAppClick(CAMPAIGN_ID, undefined, '5493424000000');
    const message = encodeURIComponent(`Hola! Quiero usar mi cupón ${cupon} para obtener 10% de descuento.`);
    window.open(`https://wa.me/5493424000000?text=${message}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section - Promo focused */}
      <section className="relative bg-gradient-to-br from-violet-600 via-purple-500 to-fuchsia-500 text-white py-16 px-4 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full blur-xl" />
          <div className="absolute bottom-10 right-10 w-32 h-32 bg-white/10 rounded-full blur-xl" />
        </div>
        
        <div className="container mx-auto relative z-10 text-center">
          <Badge className="bg-amber-400 text-amber-900 mb-4 text-lg px-4 py-2">
            <Gift className="h-4 w-4 mr-2 inline" />
            OFERTA ESPECIAL
          </Badge>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            10% OFF en tu Primer Servicio
          </h1>
          <p className="text-xl md:text-2xl mb-8 opacity-90">
            Usá el código y ahorrá en cualquier profesional
          </p>
          
          {/* Coupon Box */}
          <Card className="max-w-md mx-auto bg-white/95 text-foreground border-4 border-dashed border-amber-400">
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground mb-2">Tu código de descuento</p>
              <div className="flex items-center gap-2">
                <Input 
                  value={cupon} 
                  readOnly 
                  className="text-center text-2xl font-bold tracking-widest bg-amber-50 border-amber-200"
                />
                <Button 
                  onClick={handleCopyCupon}
                  variant="outline"
                  size="icon"
                  className={copied ? 'bg-green-100 border-green-300' : ''}
                >
                  {copied ? <CheckCircle2 className="h-5 w-5 text-green-600" /> : <Copy className="h-5 w-5" />}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Válido por 30 días • Un uso por cliente
              </p>
            </CardContent>
          </Card>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <Button 
              size="lg" 
              onClick={handleWhatsAppClick}
              className="bg-green-500 hover:bg-green-600 text-white text-xl px-8 py-6 rounded-full"
            >
              <MessageCircle className="h-6 w-6 mr-2" />
              Consultar por WhatsApp
            </Button>
            <Button 
              size="lg" 
              asChild
              className="bg-white text-purple-600 hover:bg-white/90 text-xl px-8 py-6 rounded-full shadow-2xl"
            >
              <Link to="/search">
                <Sparkles className="h-6 w-6 mr-2" />
                Buscar Profesionales
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-3xl">
          <h2 className="text-2xl font-bold text-center mb-8">¿Cómo usar tu cupón?</h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="text-center">
              <CardHeader>
                <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mx-auto mb-2">
                  <span className="text-2xl font-bold text-purple-600">1</span>
                </div>
                <CardTitle className="text-lg">Elegí un profesional</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Buscá el servicio que necesitás y contactá al profesional
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardHeader>
                <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mx-auto mb-2">
                  <span className="text-2xl font-bold text-purple-600">2</span>
                </div>
                <CardTitle className="text-lg">Mencioná el código</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Decile al profesional tu código <strong>{cupon}</strong> al contratar
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardHeader>
                <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mx-auto mb-2">
                  <span className="text-2xl font-bold text-purple-600">3</span>
                </div>
                <CardTitle className="text-lg">¡Ahorrá 10%!</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  El descuento se aplica directamente al precio final
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-12 px-4 bg-muted/30">
        <div className="container mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">Válido en todas las categorías</h2>
          
          <div className="flex flex-wrap justify-center gap-3">
            {[
              'Plomería', 'Electricidad', 'Albañilería', 'Pintura',
              'Carpintería', 'Cerrajería', 'Gasista', 'Limpieza',
              'Jardinería', 'Aire Acondicionado', 'Mudanzas', 'Herrería'
            ].map((cat, i) => (
              <Badge key={i} variant="secondary" className="text-base px-4 py-2">
                {cat}
              </Badge>
            ))}
          </div>
          
          <div className="mt-8 text-center">
            <Button size="lg" asChild>
              <Link to="/search">
                Ver todos los profesionales
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <section className="bg-foreground text-background py-8 px-4 text-center">
        <p className="flex items-center justify-center gap-2 text-xl">
          <Tag className="h-5 w-5" />
          Código: <strong>{cupon}</strong>
          <Percent className="h-5 w-5" />
          10% descuento
        </p>
      </section>
    </div>
  );
};

export default PromoDescuento;
