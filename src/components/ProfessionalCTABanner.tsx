import { Link } from "react-router-dom";
import { Briefcase, ArrowRight, Users, Gift, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";

// Mobile sticky top banner
export const MobileCTABanner = () => {
  return (
    <div className="md:hidden fixed top-16 left-0 right-0 z-40 bg-primary/95 backdrop-blur-sm px-4 py-2.5 flex items-center justify-between">
      <span className="text-white text-sm font-medium">¿Sos profesional?</span>
      <Link to="/register">
        <Button 
          size="sm" 
          className="bg-white text-primary hover:bg-white/90 h-8 px-3 text-xs font-bold"
        >
          Registrate gratis
          <ArrowRight className="w-3.5 h-3.5 ml-1" />
        </Button>
      </Link>
    </div>
  );
};

// Desktop sticky lateral CTA
export const DesktopSidebarCTA = () => {
  return (
    <div className="hidden lg:flex fixed right-6 top-1/2 -translate-y-1/2 z-50 flex-col items-center bg-card rounded-2xl shadow-xl border border-border p-5 w-56">
      {/* Icon */}
      <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
        <Briefcase className="w-7 h-7 text-primary" />
      </div>
      
      {/* Text */}
      <h3 className="text-foreground font-bold text-base mb-1 text-center">
        ¿Sos profesional?
      </h3>
      <p className="text-muted-foreground text-xs text-center mb-4">
        Conseguí más clientes en Chequealo
      </p>
      
      {/* Button */}
      <Link to="/register" className="w-full">
        <Button className="w-full font-bold text-sm">
          Registrate gratis
        </Button>
      </Link>
    </div>
  );
};

// Enhanced bottom CTA section
export const EnhancedProfessionalCTA = () => {
  return (
    <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-br from-primary to-primary-dark text-white">
      <div className="container mx-auto px-4 text-center">
        {/* Icon */}
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-6">
          <Briefcase className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
        </div>
        
        {/* Title */}
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
          ¿Sos un profesional?
        </h2>
        
        {/* Subtitle */}
        <p className="text-base sm:text-lg md:text-xl mb-8 max-w-2xl mx-auto opacity-90">
          Uní tu negocio y empezá a conectar con miles de clientes que buscan tus servicios cada día
        </p>
        
        {/* Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
          <Link to="/register">
            <Button 
              size="lg" 
              className="bg-white text-primary hover:bg-white/90 font-bold px-8 py-3 text-base"
            >
              Registrate gratis
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
          <Link to="/pricing">
            <Button 
              variant="outline" 
              size="lg" 
              className="border-white/30 text-white hover:bg-white/10 font-medium px-8 py-3 text-base"
            >
              Más información
            </Button>
          </Link>
        </div>
        
        {/* Benefits */}
        <div className="flex flex-wrap justify-center gap-6 sm:gap-10">
          <div className="flex items-center gap-2 text-white/90">
            <Gift className="w-5 h-5" />
            <span className="text-sm font-medium">Sin comisiones</span>
          </div>
          <div className="flex items-center gap-2 text-white/90">
            <Users className="w-5 h-5" />
            <span className="text-sm font-medium">Registro gratuito</span>
          </div>
          <div className="flex items-center gap-2 text-white/90">
            <TrendingUp className="w-5 h-5" />
            <span className="text-sm font-medium">Más clientes</span>
          </div>
        </div>
      </div>
    </section>
  );
};
