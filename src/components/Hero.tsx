import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import heroProfessionals from "@/assets/hero-professionals.jpg";

const Hero = () => {
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

          {/* CTA Button */}
          <div className="mb-8">
            <Link to="/search">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-lg px-8 py-4">
                Buscar Profesionales
              </Button>
            </Link>
          </div>

          {/* Popular Searches */}
          <div className="mt-8 text-white/80">
            <p className="text-sm mb-3">Búsquedas populares:</p>
            <div className="flex flex-wrap justify-center gap-2">
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
                  className="px-4 py-1 bg-white/20 hover:bg-white/30 rounded-full text-sm transition-colors"
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