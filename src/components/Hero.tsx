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
      className="relative min-h-[70vh] flex items-center justify-center bg-cover bg-center"
      style={{ backgroundImage: `url(${heroProfessionals})` }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-navy/80 via-navy/60 to-transparent"></div>
      
      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Encontrá al <span className="text-primary">Profesional</span> que necesitás
          </h1>
          
          <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-2xl mx-auto">
            Conectamos clientes con profesionales de confianza en tu zona
          </p>

          {/* Intelligent Search Bar */}
          <div className="hero-search-bar mb-8 max-w-2xl mx-auto px-4 sm:px-0">
            <IntelligentSearch
              placeholder="Describí tu problema... Ej: 'mi aire acondicionado no enfría bien'"
              className="w-full"
            />
            
            {/* Alternative CTA */}
            <div className="mt-4">
              <Link to="/search">
                <Button variant="outline" size="sm" className="bg-white/10 border-white/30 text-white hover:bg-white/20 text-sm">
                  Ver todos los profesionales
                </Button>
              </Link>
            </div>
          </div>

          {/* Popular Searches */}
          <div className="mt-8 text-white/80 px-4 sm:px-0">
            <p className="text-sm mb-3">Búsquedas populares:</p>
            <div className="flex flex-wrap justify-center gap-2 max-w-lg mx-auto">
              {(() => {
                const allSearches = [
                  "Plomero", "Electricista", "Mecánico", "Limpieza", 
                  "Jardinero", "Pintor", "Carpintero", "Gasista",
                  "Abogado", "Contador", "Kinesiólogo", "Dentista",
                  "Veterinario", "Nutricionista", "Psicólogo", "Dermatólogo"
                ];
                // Shuffle array and take first 8
                const shuffled = [...allSearches].sort(() => 0.5 - Math.random());
                 return shuffled.slice(0, 8);
               })().map((service) => (
                 <button
                   key={service}
                   onClick={() => {
                     setSearchQuery(service);
                     const params = new URLSearchParams();
                     params.set('q', service);
                     navigate(`/search?${params.toString()}`);
                   }}
                   className="px-3 py-1 bg-white/20 hover:bg-white/30 rounded-full text-xs sm:text-sm transition-colors whitespace-nowrap"
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