import { Link } from "react-router-dom";
import { ArrowRight, Users, Gift, TrendingUp, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";

// Mobile sticky top banner - HIDDEN per design decision
export const MobileCTABanner = () => {
  return null;
};

// Desktop FAB bubble CTA - HIDDEN per design decision
export const DesktopSidebarCTA = () => {
  return null;
};

// Enhanced bottom CTA section with dark navy + dot pattern
export const EnhancedProfessionalCTA = () => {
  return (
    <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-br from-[#0f172a] to-[#1e293b] text-white relative overflow-hidden">
      {/* Dot pattern overlay */}
      <div 
        className="absolute inset-0" 
        style={{ 
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.05) 1px, transparent 0)', 
          backgroundSize: '20px 20px' 
        }} 
      />
      
      {/* Decorative blobs */}
      <div className="absolute top-10 left-10 w-64 h-64 bg-blue-500/10 rounded-full filter blur-[80px]" />
      <div className="absolute bottom-10 right-20 w-80 h-80 bg-indigo-500/5 rounded-full filter blur-[100px]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-400/[0.03] rounded-full filter blur-[120px]" />

      <div className="container mx-auto px-4 text-center relative z-10">
        {/* Icon */}
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 flex items-center justify-center mx-auto mb-6">
          <Rocket className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
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
              className="bg-gradient-to-r from-amber-400 to-orange-500 text-black font-bold px-8 py-3 text-base shadow-[0_0_20px_rgba(251,191,36,0.4)] hover:shadow-[0_0_30px_rgba(251,191,36,0.6)] hover:scale-105 transition-all duration-300 border-0"
            >
              Registrate gratis
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
          <Link to="/pricing">
            <Button 
              variant="ghost" 
              size="lg" 
              className="border-2 border-white/20 text-white hover:bg-white/10 hover:text-white font-medium px-8 py-3 text-base backdrop-blur-sm"
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
