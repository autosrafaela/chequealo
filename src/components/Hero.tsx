import { Button } from "@/components/ui/button";
import { Search, MapPin } from "lucide-react";
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

          {/* Search Section */}
          <div className="bg-white/95 backdrop-blur-sm p-6 rounded-2xl shadow-2xl max-w-4xl mx-auto">
            <div className="flex flex-col lg:flex-row gap-4 items-end">
              {/* Service Search */}
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ¿Qué servicio buscás?
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                  <input
                    type="text"
                    placeholder="Ej: Plomero, Electricista, Mecánico..."
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-input focus:outline-none focus:ring-2 focus:ring-primary text-base"
                  />
                </div>
              </div>

              {/* Province Select */}
              <div className="flex-1 lg:flex-none lg:w-48">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Provincia
                </label>
                <select className="w-full px-4 py-3 rounded-lg border border-input focus:outline-none focus:ring-2 focus:ring-primary text-base bg-white">
                  <option value="">Seleccionar</option>
                  <option value="santa-fe">Santa Fe</option>
                  <option value="buenos-aires">Buenos Aires</option>
                  <option value="cordoba">Córdoba</option>
                  <option value="mendoza">Mendoza</option>
                  <option value="tucuman">Tucumán</option>
                </select>
              </div>

              {/* City Select */}
              <div className="flex-1 lg:flex-none lg:w-48">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ciudad
                </label>
                <select className="w-full px-4 py-3 rounded-lg border border-input focus:outline-none focus:ring-2 focus:ring-primary text-base bg-white">
                  <option value="">Seleccionar</option>
                  <option value="rafaela">Rafaela</option>
                  <option value="santa-fe">Santa Fe</option>
                  <option value="rosario">Rosario</option>
                  <option value="esperanza">Esperanza</option>
                </select>
              </div>

              {/* Search Button */}
              <Button 
                className="w-full lg:w-auto px-8 py-3 bg-primary hover:bg-primary/90 text-base font-semibold h-12"
              >
                Buscar
              </Button>
            </div>
          </div>

          {/* Popular Searches */}
          <div className="mt-8 text-white/80">
            <p className="text-sm mb-3">Búsquedas populares:</p>
            <div className="flex flex-wrap justify-center gap-2">
              {[
                "Plomero", "Electricista", "Mecánico", "Limpieza", 
                "Jardinero", "Pintor", "Carpintero", "Gasista"
              ].map((service) => (
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