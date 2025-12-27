import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Shield, Star, CheckCircle } from "lucide-react";
import heroProfessionals from "@/assets/hero-professionals.jpg";
import IntelligentSearch from "./IntelligentSearch";

const Hero = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <section 
      className="relative min-h-[40vh] sm:min-h-[45vh] md:min-h-[50vh] max-h-[50vh] sm:max-h-[55vh] md:max-h-[60vh] flex items-center justify-center bg-cover bg-center"
      style={{ backgroundImage: `url(${heroProfessionals})` }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-navy/85 via-navy/70 to-navy/50 sm:to-transparent"></div>
      
      {/* Content */}
      <div className="relative z-10 container mx-auto px-3 sm:px-4 py-6 sm:py-8 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-3 sm:mb-4 leading-tight">
            Encontrá al <span className="text-primary">Profesional</span> que necesitás
          </h1>
          
          <p className="text-sm sm:text-base md:text-lg lg:text-xl text-white/90 mb-4 sm:mb-5 max-w-2xl mx-auto px-2">
            Conectamos clientes con profesionales de confianza en tu zona
          </p>
          
          {/* USPs inline */}
          <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mb-4 sm:mb-6">
            <div className="flex items-center gap-1.5 bg-white/15 backdrop-blur-sm px-3 py-1.5 rounded-full">
              <Shield className="w-4 h-4 text-green-400" />
              <span className="text-white text-xs sm:text-sm font-medium">Verificados</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white/15 backdrop-blur-sm px-3 py-1.5 rounded-full">
              <Star className="w-4 h-4 text-yellow-400" />
              <span className="text-white text-xs sm:text-sm font-medium">Reviews reales</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white/15 backdrop-blur-sm px-3 py-1.5 rounded-full">
              <CheckCircle className="w-4 h-4 text-primary" />
              <span className="text-white text-xs sm:text-sm font-medium">100% confiable</span>
            </div>
          </div>

          {/* Intelligent Search Bar */}
          <div className="hero-search-bar mb-6 sm:mb-8 max-w-2xl mx-auto px-2 sm:px-4">
            <IntelligentSearch
              placeholder="Describí tu problema..."
              className="w-full"
            />
            
            {/* Alternative CTA */}
            <div className="mt-3 sm:mt-4">
              <Link to="/search">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="bg-white/10 border-white/30 text-white hover:bg-white/20 text-xs sm:text-sm px-3 sm:px-4"
                >
                  Ver todos los profesionales
                </Button>
              </Link>
            </div>
          </div>

          {/* Popular Searches - Responsive */}
          <div className="mt-4 sm:mt-6 text-white/80 px-2 sm:px-0">
            <p className="text-xs sm:text-sm mb-2">Búsquedas populares:</p>
            <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2 max-w-lg mx-auto">
              {(() => {
                const allSearches = [
                  "Plomero", "Electricista", "Mecánico", "Limpieza", 
                  "Jardinero", "Pintor", "Carpintero", "Gasista"
                ];
                const shuffled = [...allSearches].sort(() => 0.5 - Math.random());
                return shuffled.slice(0, 6);
              })().map((service) => (
                <button
                  key={service}
                  onClick={() => {
                    setSearchQuery(service);
                    const params = new URLSearchParams();
                    params.set('q', service);
                    navigate(`/search?${params.toString()}`);
                  }}
                  className="px-2.5 sm:px-3 py-1 sm:py-1.5 bg-white/20 hover:bg-white/30 rounded-full text-xs sm:text-sm transition-colors whitespace-nowrap"
                >
                  {service}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;