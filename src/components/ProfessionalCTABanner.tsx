import { useState } from "react";
import { Link } from "react-router-dom";
import { Briefcase, ArrowRight, Users, Gift, TrendingUp, X } from "lucide-react";
import { Button } from "@/components/ui/button";

// Mobile sticky top banner
export const MobileCTABanner = () => {
  const [isVisible, setIsVisible] = useState(() => {
    return localStorage.getItem('hide-mobile-pro-cta') !== 'true';
  });

  const handleClose = () => {
    setIsVisible(false);
    localStorage.setItem('hide-mobile-pro-cta', 'true');
  };

  if (!isVisible) return null;

  return (
    <div className="md:hidden fixed top-16 left-0 right-0 z-40 bg-primary/95 backdrop-blur-sm px-4 py-2.5 flex items-center justify-between">
      <span className="text-white text-sm font-medium">¿Sos profesional?</span>
      <div className="flex items-center gap-2">
        <Link to="/register">
          <Button 
            size="sm" 
            className="bg-white text-primary hover:bg-white/90 h-8 px-3 text-xs font-bold"
          >
            Registrate gratis
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Button>
        </Link>
        <button
          onClick={handleClose}
          className="p-1 hover:bg-white/20 rounded-full transition-colors"
          aria-label="Cerrar"
        >
          <X className="w-4 h-4 text-white" />
        </button>
      </div>
    </div>
  );
};

// Desktop FAB bubble CTA
export const DesktopSidebarCTA = () => {
  const [isVisible, setIsVisible] = useState(() => {
    return localStorage.getItem('hide-desktop-pro-cta') !== 'true';
  });
  const [isExpanded, setIsExpanded] = useState(false);

  const handleClose = () => {
    setIsVisible(false);
    localStorage.setItem('hide-desktop-pro-cta', 'true');
  };

  if (!isVisible) return null;

  return (
    <div className="hidden lg:block fixed bottom-6 right-6 z-50">
      {isExpanded ? (
        <div className="bg-card rounded-2xl shadow-xl border border-border p-4 w-52 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <button
            onClick={handleClose}
            className="absolute top-2 right-2 p-1 hover:bg-muted rounded-full transition-colors"
            aria-label="Cerrar"
          >
            <X className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Briefcase className="w-4 h-4 text-primary" />
            </div>
            <h3 className="text-foreground font-bold text-sm">¿Sos profesional?</h3>
          </div>
          <p className="text-muted-foreground text-xs mb-3">
            Conseguí más clientes en Chequealo
          </p>
          <Link to="/register" className="w-full">
            <Button className="w-full font-bold text-xs h-8">
              Registrate gratis
            </Button>
          </Link>
        </div>
      ) : (
        <button
          onClick={() => setIsExpanded(true)}
          className="relative w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300 flex items-center justify-center group"
        >
          <Briefcase className="w-6 h-6" />
          <span className="absolute -top-1 -right-1 bg-white text-primary text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-sm border border-primary/20 whitespace-nowrap">
            Registrate
          </span>
        </button>
      )}
    </div>
  );
};

// Enhanced bottom CTA section with blobs
export const EnhancedProfessionalCTA = () => {
  return (
    <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-br from-[#667eea] to-[#764ba2] text-white relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute top-10 left-10 w-64 h-64 bg-white/10 rounded-full filter blur-[80px]" />
      <div className="absolute bottom-10 right-20 w-80 h-80 bg-white/5 rounded-full filter blur-[100px]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/[0.03] rounded-full filter blur-[120px]" />

      <div className="container mx-auto px-4 text-center relative z-10">
        {/* Icon */}
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-6">
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
              className="bg-white/90 backdrop-blur-sm text-[#667eea] hover:bg-white font-bold px-8 py-3 text-base shadow-lg"
            >
              Registrate gratis
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
          <Link to="/pricing">
            <Button 
              variant="ghost" 
              size="lg" 
              className="border-2 border-white/40 text-white hover:bg-white/20 hover:text-white font-medium px-8 py-3 text-base backdrop-blur-sm"
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
