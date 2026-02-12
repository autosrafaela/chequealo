import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import heroProfessionals from "@/assets/hero-professionals.jpg";
import IntelligentSearch from "./IntelligentSearch";

const Hero = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <section 
      className="relative min-h-[45vh] sm:min-h-[50vh] md:min-h-[55vh] flex items-center justify-center bg-cover bg-center"
      style={{ backgroundImage: `url(${heroProfessionals})` }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-navy/90 via-navy/75 to-navy/60"></div>
      
      {/* Content */}
      <div className="relative z-10 container mx-auto px-3 sm:px-4 py-8 sm:py-12 text-center">
        <div className="max-w-3xl mx-auto">
          {/* Display title */}
          <h1 className="text-display-lg text-white mb-4 sm:mb-6 px-2">
            Encontrá al <span style={{ WebkitTextFillColor: 'transparent', background: 'linear-gradient(90deg, hsl(258 90% 76%), hsl(270 100% 85%), hsl(280 100% 80%))', WebkitBackgroundClip: 'text', backgroundClip: 'text' }}>profesional</span> ideal
          </h1>
          
          <p className="text-sm sm:text-base md:text-lg text-white/70 mb-6 sm:mb-8 max-w-xl mx-auto">
            Describí lo que necesitás y te conectamos al instante
          </p>

          {/* Glassmorphism Search Bar */}
          <div className="glass rounded-[20px] p-4 sm:p-6 max-w-2xl mx-auto">
            <IntelligentSearch
              placeholder="¿Qué necesitás? Ej: se me rompió una canilla..."
              className="w-full"
            />
            
            {/* Alternative CTA */}
            <div className="mt-3 sm:mt-4">
              <Link to="/search">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-white/60 hover:text-white hover:bg-white/10 text-xs sm:text-sm"
                >
                  O explorá todos los profesionales →
                </Button>
              </Link>
            </div>
          </div>

          {/* Popular Searches */}
          <div className="mt-6 sm:mt-8 text-white/50 px-2">
            <p className="text-xs mb-2">Populares:</p>
            <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2 max-w-lg mx-auto">
              {(() => {
                const allSearches = [
                  "Plomero", "Electricista", "Mecánico", "Limpieza", 
                  "Jardinero", "Pintor", "Carpintero", "Gasista"
                ];
                const shuffled = [...allSearches].sort(() => 0.5 - Math.random());
                return shuffled.slice(0, 5);
              })().map((service) => (
                <button
                  key={service}
                  onClick={() => {
                    setSearchQuery(service);
                    const params = new URLSearchParams();
                    params.set('q', service);
                    navigate(`/search?${params.toString()}`);
                  }}
                  className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded-full text-xs transition-colors whitespace-nowrap text-white/70 hover:text-white"
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
