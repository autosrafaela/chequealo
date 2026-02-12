import Header from "@/components/Header";
import Hero from "@/components/Hero";
import ServiceCategories from "@/components/ServiceCategories";
import { LatestProfessionals } from "@/components/LatestProfessionals";
import OnboardingTour from "@/components/OnboardingTour";
import ContextualTips from "@/components/ContextualTips";
import { SimplifiedRankings } from "@/components/SimplifiedRankings";
import { HeaderCarousel } from "@/components/HeaderCarousel";
import { Button } from "@/components/ui/button";
import { MapPin, Shield, Clock, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { SEOHead, generateOrganizationSchema, generateWebsiteSchema } from "@/components/SEO/SEOHead";
import { EnableNotificationsBanner } from "@/components/EnableNotificationsBanner";
import { useAuth } from "@/contexts/AuthContext";
import { BottomNavigation } from "@/components/BottomNavigation";
import { MobileCTABanner, DesktopSidebarCTA, EnhancedProfessionalCTA } from "@/components/ProfessionalCTABanner";

const Index = () => {
  const { user } = useAuth();
  
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
      <div className="min-h-screen bg-background pb-20 md:pb-0">
        <Header />
        
        {/* Mobile CTA Banner - Sticky Top */}
        <MobileCTABanner />
        
        {/* Desktop Sidebar CTA */}
        <DesktopSidebarCTA />
      
      {/* Notifications Banner - solo para usuarios logueados */}
      {user && (
        <div className="container mx-auto px-3 sm:px-4 pt-3">
          <EnableNotificationsBanner />
        </div>
      )}
      
      {/* Hero Carousel */}
      <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
        <HeaderCarousel />
      </div>
      
      <Hero />
      <ServiceCategories />
      <LatestProfessionals />
      
      {/* Simplified Rankings - Top 3 del mes */}
      <SimplifiedRankings />
      
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

      {/* Enhanced CTA Section */}
      <EnhancedProfessionalCTA />

      {/* Footer */}
      <footer className="bg-card text-card-foreground py-12 sm:py-16 md:py-20 border-t-2">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10">
            <div>
              <h3 className="text-foreground text-base sm:text-lg font-bold mb-3 sm:mb-4">Chequealo</h3>
              <p className="text-xs sm:text-sm mb-4 sm:mb-5 text-muted-foreground">
                La plataforma líder para conectar clientes con profesionales de confianza en Argentina.
              </p>
              {/* Social Icons */}
              <div className="flex items-center gap-3">
                <a href="https://instagram.com/chequealo.ar" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-muted flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                </a>
                <a href="https://facebook.com/chequealo" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-muted flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                </a>
                <a href="https://linkedin.com/company/chequealo" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-muted flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                </a>
              </div>
            </div>

            <div>
              <h4 className="text-foreground font-bold mb-3 sm:mb-4 text-base sm:text-lg">Para Clientes</h4>
              <ul className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-muted-foreground">
                <li><Link to="/search" className="hover:text-foreground hover:underline transition-colors">Buscar profesionales</Link></li>
                <li><Link to="/how-it-works" className="hover:text-foreground hover:underline transition-colors">Cómo funciona</Link></li>
                <li><Link to="/faq" className="hover:text-foreground hover:underline transition-colors">Preguntas frecuentes</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-foreground font-bold mb-3 sm:mb-4 text-base sm:text-lg">Para Profesionales</h4>
              <ul className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-muted-foreground">
                <li><Link to="/register" className="hover:text-foreground hover:underline transition-colors">Registrarme</Link></li>
                <li><Link to="/pricing" className="hover:text-foreground hover:underline transition-colors">Planes y precios</Link></li>
                <li><Link to="/faq" className="hover:text-foreground hover:underline transition-colors">Centro de ayuda</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-foreground font-bold mb-3 sm:mb-4 text-base sm:text-lg">Legal</h4>
              <ul className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-muted-foreground">
                <li><Link to="/terms" className="hover:text-foreground hover:underline transition-colors">Términos de Servicio</Link></li>
                <li><Link to="/privacy" className="hover:text-foreground hover:underline transition-colors">Política de Privacidad</Link></li>
                <li>📱 +54 9 3492 60-7224</li>
                <li>📧 info@chequealo.ar</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border mt-8 sm:mt-10 pt-8 sm:pt-10 text-center text-xs sm:text-sm text-muted-foreground">
            <p>&copy; 2025 Chequealo. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
      
      {/* Bottom Navigation - Mobile Only */}
      <div className="md:hidden">
        <BottomNavigation />
      </div>
    </div>
    </>
  );
};

export default Index;