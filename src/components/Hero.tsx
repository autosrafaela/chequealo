import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { useState } from "react";
import heroProfessionals from "@/assets/hero-professionals.jpg";

const Hero = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Navigate to search page with query parameter (empty query shows all results)
    const params = new URLSearchParams();
    if (searchQuery.trim()) {
      params.set('q', searchQuery.trim());
    }
    navigate(`/search?${params.toString()}`);
  };

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

          {/* Search Bar */}
          <div className="mb-8 max-w-2xl mx-auto px-4 sm:px-0">
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 sm:gap-2">
              <div className="flex-1 relative">
                <Input
                  type="text"
                  placeholder="¿Qué servicio necesitás? Ej: plomero, electricista..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-12 sm:h-14 text-base sm:text-lg px-4 sm:px-6 pr-12 bg-white/95 border-0 rounded-full placeholder:text-gray-500 w-full"
                />
                <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 sm:h-6 sm:w-6 text-gray-400" />
              </div>
              <Button 
                type="submit"
                size="lg" 
                className="bg-primary hover:bg-primary/90 text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 h-12 sm:h-14 rounded-full w-full sm:w-auto whitespace-nowrap"
              >
                Buscar
              </Button>
            </form>
            
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