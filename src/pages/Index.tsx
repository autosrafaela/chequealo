import Header from "@/components/Header";
import Hero from "@/components/Hero";
import ServiceCategories from "@/components/ServiceCategories";
import { LatestProfessionals } from "@/components/LatestProfessionals";
import OnboardingTour from "@/components/OnboardingTour";
import ContextualTips from "@/components/ContextualTips";
import BadgeSystem from "@/components/BadgeSystem";
import RankingSystem from "@/components/RankingSystem";
import { WeeklyRankings } from "@/components/WeeklyRankings";
import { HeaderCarousel } from "@/components/HeaderCarousel";
import { Button } from "@/components/ui/button";
import { MapPin, Shield, Clock, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { SEOHead, generateOrganizationSchema, generateWebsiteSchema } from "@/components/SEO/SEOHead";

const Index = () => {
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      generateOrganizationSchema(),
      generateWebsiteSchema()
    ]
  };
  return (
    <>
      <SEOHead 
        title="Chequealo - Encontrá Profesionales de Confianza en Argentina"
        description="Plataforma líder para encontrar profesionales verificados en Argentina. Electricistas, plomeros, albañiles y más servicios de confianza con reseñas reales."
        canonical="/"
        structuredData={structuredData}
      />
      <div className="min-h-screen bg-background">
        <Header />
      
      {/* Hero Carousel */}
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6">
        <HeaderCarousel />
      </div>
      
      <Hero />
      <ServiceCategories />
      <LatestProfessionals />
      
      {/* Gamification Section */}
      <section className="py-8 sm:py-12 md:py-16 bg-muted/30">
        <div className="container mx-auto px-3 sm:px-4">
          <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-center mb-6 sm:mb-8">
            🏆 Rankings y Logros
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            <WeeklyRankings maxItems={5} showFilters={true} />
            <BadgeSystem compact={true} />
            <RankingSystem limit={5} />
          </div>
        </div>
      </section>
      
      {/* UX Enhancement Components */}
      <OnboardingTour />
      <ContextualTips />
      
      {/* Features Section */}
      <section className="py-8 sm:py-12 md:py-16 bg-card">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="text-center mb-6 sm:mb-8 md:mb-12">
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-2 sm:mb-4">
              ¿Por qué elegir Chequealo?
            </h2>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto px-2">
              La plataforma más confiable para conectar con profesionales verificados
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
            <div className="text-center">
              <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-primary/10 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <MapPin className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 text-primary" />
              </div>
              <h3 className="text-sm sm:text-base md:text-lg lg:text-xl font-semibold mb-1 sm:mb-2">Cercanos</h3>
              <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">Encontrá servicios en tu zona</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-success/10 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <Shield className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 text-success" />
              </div>
              <h3 className="text-sm sm:text-base md:text-lg lg:text-xl font-semibold mb-1 sm:mb-2">Verificados</h3>
              <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">Profesionales validados</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-warning/10 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <Clock className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 text-warning" />
              </div>
              <h3 className="text-sm sm:text-base md:text-lg lg:text-xl font-semibold mb-1 sm:mb-2">Rápido</h3>
              <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">Respuestas en tiempo récord</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-warning/10 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <Star className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 text-warning" />
              </div>
              <h3 className="text-sm sm:text-base md:text-lg lg:text-xl font-semibold mb-1 sm:mb-2">Calidad</h3>
              <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">Reseñas de clientes reales</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-8 sm:py-12 md:py-16 bg-navy text-navy-foreground">
        <div className="container mx-auto px-3 sm:px-4 text-center">
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-4 sm:mb-6">
            ¿Sos un profesional?
          </h2>
          <p className="text-sm sm:text-base md:text-lg lg:text-xl mb-6 sm:mb-8 max-w-2xl mx-auto opacity-90 px-2">
            Uníte a nuestra plataforma y conectá con miles de clientes
          </p>
          <div className="space-y-3 sm:space-y-0 sm:flex sm:justify-center">
            <Link to="/register">
              <Button size="default" className="bg-primary hover:bg-primary/90 px-6 sm:px-8 py-2.5 sm:py-3 text-sm sm:text-base">
                Registrarme como Profesional
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card text-card-foreground py-8 sm:py-10 md:py-12 border-t">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            <div>
              <h3 className="text-foreground text-base sm:text-lg font-semibold mb-3 sm:mb-4">Chequealo</h3>
              <p className="text-xs sm:text-sm mb-3 sm:mb-4 text-muted-foreground">
                La plataforma líder para conectar clientes con profesionales de confianza en Argentina.
              </p>
            </div>

            <div>
              <h4 className="text-foreground font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Para Clientes</h4>
              <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-muted-foreground">
                <li><Link to="/search" className="hover:text-foreground transition-colors">Buscar profesionales</Link></li>
                <li><Link to="/how-it-works" className="hover:text-foreground transition-colors">Cómo funciona</Link></li>
                <li><Link to="/faq" className="hover:text-foreground transition-colors">Preguntas frecuentes</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-foreground font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Para Profesionales</h4>
              <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-muted-foreground">
                <li><Link to="/register" className="hover:text-foreground transition-colors">Registrarme</Link></li>
                <li><Link to="/pricing" className="hover:text-foreground transition-colors">Planes y precios</Link></li>
                <li><Link to="/faq" className="hover:text-foreground transition-colors">Centro de ayuda</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-foreground font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Legal</h4>
              <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-muted-foreground">
                <li><Link to="/terms" className="hover:text-foreground transition-colors">Términos de Servicio</Link></li>
                <li><Link to="/privacy" className="hover:text-foreground transition-colors">Política de Privacidad</Link></li>
                <li>📱 +54 9 3492 60-7224</li>
                <li>📧 info@chequealo.ar</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border mt-6 sm:mt-8 pt-6 sm:pt-8 text-center text-xs sm:text-sm text-muted-foreground">
            <p>&copy; 2024 Chequealo. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
    </>
  );
};

export default Index;