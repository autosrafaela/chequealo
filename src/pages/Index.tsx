import Header from "@/components/Header";
import Hero from "@/components/Hero";
import ServiceCategories from "@/components/ServiceCategories";
import { LatestProfessionals } from "@/components/LatestProfessionals";
import OnboardingTour from "@/components/OnboardingTour";
import ContextualTips from "@/components/ContextualTips";
import BadgeSystem from "@/components/BadgeSystem";
import RankingSystem from "@/components/RankingSystem";
import { Button } from "@/components/ui/button";
import { MapPin, Shield, Clock, Star } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Hero />
      <ServiceCategories />
      <LatestProfessionals />
      
      {/* Gamification Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-8">
            <BadgeSystem compact={true} />
            <RankingSystem limit={5} />
          </div>
        </div>
      </section>
      
      {/* UX Enhancement Components */}
      <OnboardingTour />
      <ContextualTips />
      
      {/* Features Section */}
      <section className="py-16 bg-card">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              ¿Por qué elegir Chequealo?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              La plataforma más confiable para conectar con profesionales verificados
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <MapPin className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Profesionales Cercanos</h3>
              <p className="text-muted-foreground">Encontrá servicios en tu zona con geolocalización precisa</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-success/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-success" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Verificados</h3>
              <p className="text-muted-foreground">Todos nuestros profesionales están verificados y validados</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-warning/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8 text-warning" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Respuesta Rápida</h3>
              <p className="text-muted-foreground">Obtené presupuestos y respuestas en tiempo récord</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-warning/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Star className="h-8 w-8 text-warning" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Calidad Garantizada</h3>
              <p className="text-muted-foreground">Sistema de calificaciones y reseñas de clientes reales</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-navy text-navy-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            ¿Sos un profesional?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
            Uníte a nuestra plataforma y conectá con miles de clientes que buscan tus servicios
          </p>
          <div className="space-y-4 sm:space-y-0 sm:flex sm:justify-center">
            <Link to="/register">
              <Button size="lg" className="bg-primary hover:bg-primary/90 px-8 py-3">
                Registrarme como Profesional
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card text-card-foreground py-12 border-t">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div>
              <h3 className="text-foreground text-lg font-semibold mb-4">Chequealo</h3>
              <p className="text-sm mb-4 text-muted-foreground">
                La plataforma líder para conectar clientes con profesionales de confianza en Argentina.
              </p>
            </div>

            <div>
              <h4 className="text-foreground font-semibold mb-4">Para Clientes</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/search" className="hover:text-foreground transition-colors">Buscar profesionales</Link></li>
                <li><Link to="/how-it-works" className="hover:text-foreground transition-colors">Cómo funciona</Link></li>
                <li><Link to="/faq" className="hover:text-foreground transition-colors">Preguntas frecuentes</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-foreground font-semibold mb-4">Para Profesionales</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/register" className="hover:text-foreground transition-colors">Registrarme</Link></li>
                <li><Link to="/pricing" className="hover:text-foreground transition-colors">Planes y precios</Link></li>
                <li><Link to="/faq" className="hover:text-foreground transition-colors">Centro de ayuda</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-foreground font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/terms" className="hover:text-foreground transition-colors">Términos de Servicio</Link></li>
                <li><Link to="/privacy" className="hover:text-foreground transition-colors">Política de Privacidad</Link></li>
                <li>📱 +54 9 3492 60-7224</li>
                <li>📧 info@chequealo.ar</li>
              </ul>
            </div>
          </div>

          <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2024 Chequealo. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
