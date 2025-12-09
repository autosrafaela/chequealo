import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Download, Smartphone, Zap, Bell, Wifi, Shield, Star, Check, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import chequealoLogo from '@/assets/chequealo-new-logo.png';
import { usePWAInstall } from '@/components/PWAInstallPrompt';

const Install = () => {
  const { canInstall, triggerInstall, isInstalled } = usePWAInstall();
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    setIsIOS(/iPad|iPhone|iPod/.test(navigator.userAgent));
    setIsStandalone(window.matchMedia('(display-mode: standalone)').matches);
  }, []);

  const handleInstall = async () => {
    await triggerInstall();
  };

  const features = [
    { icon: Zap, title: 'Carga instantánea', description: 'Abrí la app al instante sin esperar' },
    { icon: Bell, title: 'Notificaciones push', description: 'Recibí alertas de nuevos mensajes' },
    { icon: Wifi, title: 'Funciona offline', description: 'Navegá incluso sin conexión' },
    { icon: Shield, title: 'Seguro y privado', description: 'Tus datos siempre protegidos' },
    { icon: Star, title: 'Experiencia nativa', description: 'Se siente como una app real' },
    { icon: Smartphone, title: 'En tu pantalla', description: 'Acceso directo desde el inicio' },
  ];

  if (isStandalone) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-primary/10 to-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-8 pb-6 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="h-10 w-10 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">¡Ya tenés la app instalada!</h1>
            <p className="text-muted-foreground mb-6">
              Estás usando Chequealo como aplicación instalada.
            </p>
            <Link to="/">
              <Button className="w-full">
                Ir al inicio
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 via-background to-background">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary via-primary to-primary/90 text-white py-16 px-4">
        <div className="container mx-auto max-w-2xl text-center">
          <div className="w-24 h-24 bg-white rounded-3xl shadow-2xl flex items-center justify-center mx-auto mb-6 p-3">
            <img src={chequealoLogo} alt="Chequealo" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Instalá Chequealo
          </h1>
          <p className="text-lg text-white/90 mb-8 max-w-md mx-auto">
            Tené acceso rápido a profesionales verificados desde tu pantalla de inicio
          </p>

          {/* Main Install Button */}
          {canInstall && (
            <Button
              onClick={handleInstall}
              size="lg"
              className="bg-white text-primary hover:bg-white/90 font-semibold px-8 py-6 text-lg rounded-xl shadow-lg"
            >
              <Download className="h-6 w-6 mr-3" />
              Instalar Ahora
            </Button>
          )}

          {isIOS && !canInstall && (
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-left max-w-md mx-auto">
              <h3 className="font-semibold mb-4 text-center">Cómo instalar en iPhone/iPad:</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center font-bold text-sm">1</div>
                  <span>Tocá el botón de compartir <span className="inline-block">⬆️</span> en Safari</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center font-bold text-sm">2</div>
                  <span>Buscá "Agregar a pantalla de inicio" <span className="inline-block">➕</span></span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center font-bold text-sm">3</div>
                  <span>Confirmá tocando "Agregar" ✓</span>
                </div>
              </div>
            </div>
          )}

          {!canInstall && !isIOS && (
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 max-w-md mx-auto">
              <p className="mb-4">
                Para instalar la app, abrí este sitio en <strong>Chrome</strong> o <strong>Edge</strong> desde tu celular o computadora.
              </p>
              <p className="text-sm text-white/70">
                Si ya la tenés instalada, buscá "Chequealo" en tu pantalla de inicio.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto max-w-4xl px-4 py-12">
        <h2 className="text-2xl font-bold text-center text-foreground mb-8">
          ¿Por qué instalar la app?
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feature, index) => (
            <Card key={index} className="border-0 shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-12">
          <Link to="/">
            <Button variant="outline" size="lg">
              Volver al inicio
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Install;
