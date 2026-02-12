import { 
  Wrench, Zap, Car, Sparkles, Dumbbell, Paintbrush, 
  Hammer, Flame, TreePine, Building, Heart, Laptop, ChevronDown, ChevronUp, Scissors 
} from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

const ServiceCategories = () => {
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [allProfessions, setAllProfessions] = useState<string[]>([]);
  const [allServices, setAllServices] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const categories = [
    { name: "Empleada Doméstica / Limpieza", icon: Sparkles, color: "bg-teal-100 text-teal-600", rank: 1, searchTerm: "limpieza" },
    { name: "Mecánico", icon: Car, color: "bg-orange-100 text-orange-600", rank: 2, searchTerm: "mecánico" },
    { name: "Técnico Aire Acond.", icon: Wrench, color: "bg-blue-100 text-blue-600", rank: 3, searchTerm: "aire acondicionado" },
    { name: "Kinesiólogo", icon: Heart, color: "bg-pink-100 text-pink-600", rank: 4, searchTerm: "kinesiólogo" },
    { name: "Entrenador Personal", icon: Dumbbell, color: "bg-purple-100 text-purple-600", rank: 5, searchTerm: "entrenador personal" },
    { name: "Gestor Automotor", icon: Car, color: "bg-red-100 text-red-600", rank: 6, searchTerm: "gestor automotor" },
    { name: "Profesor Apoyo", icon: Laptop, color: "bg-indigo-100 text-indigo-600", rank: 7, searchTerm: "profesor apoyo escolar" },
    { name: "Servicio Técnico", icon: Wrench, color: "bg-gray-100 text-gray-600", rank: 8, searchTerm: "técnico línea blanca" },
    { name: "Limpieza Tapizados", icon: Sparkles, color: "bg-cyan-100 text-cyan-600", rank: 9, searchTerm: "limpieza tapizados" },
    { name: "Durlock / Yesero", icon: Hammer, color: "bg-amber-100 text-amber-600", rank: 10, searchTerm: "durlock" },
    { name: "Fumigador", icon: Building, color: "bg-green-100 text-green-600", rank: 11, searchTerm: "fumigador" },
    { name: "Automatización IA", icon: Laptop, color: "bg-violet-100 text-violet-600", rank: 12, searchTerm: "automatización ia" },
  ];

  const loadAllProfessions = async () => {
    try {
      setLoading(true);
      
      const predefinedProfessions = [
        'Abogado', 'Acompañante Terapéutico', 'Adiestrador de Perros', 'Agrimensor',
        'Albañil', 'Alisadora profesional', 'Arquitecta', 'Asesor de Seguros',
        'Asesor Inmobiliario', 'Automatización con IA', 'Barbero', 'Barman / Bartender',
        'Camarógrafo', 'Carpintero / Ebanista', 'Catering', 'Cerrajero',
        'Chapista y Pintor Automotor', 'Chef a Domicilio', 'Chofer Particular',
        'Colocador de Cerámicos', 'Colocador de Pisos', 'Community Manager',
        'Contador', 'Control de Plagas', 'Cortinero', 'Cuidador de Mascotas',
        'Decorador de Interiores', 'Desarrollador Web', 'Diseñador Gráfico',
        'Editor de Video', 'Electricista', 'Empleada Doméstica', 'Enfermero/a',
        'Entrenador Personal', 'Escribano', 'Esteticista', 'Fletero / Mudanzas',
        'Fonoaudiólogo', 'Fotógrafo', 'Fumigador', 'Gestor del Automotor',
        'Herrero', 'Ingeniero', 'Instalador de Alarmas', 'Instalador de Cámaras',
        'Jardinero', 'Kinesiólogo', 'Lavadero de Autos', 'Limpieza de Alfombras',
        'Manicurista', 'Maquillador/a', 'Masajista', 'Mecánico', 'Mecánico de Motos',
        'Nutricionista', 'Paseador de Perros', 'Pastelero', 'Peluquero Canino',
        'Peluquero/a', 'Pintor', 'Plomero / Gasista', 'Podador de Árboles',
        'Profesor de Idiomas', 'Profesor de Música', 'Profesor de Yoga',
        'Psicólogo', 'Psicopedagogo', 'Reparación de Celulares', 'Reparación de Computadoras',
        'Repostero', 'Soldador', 'Tapicero', 'Techista', 'Técnico de Aire Acondicionado',
        'Técnico de PC', 'Técnico en Refrigeración', 'Traductor', 'Veterinario', 'Vidriería'
      ];
      
      const { data: profs, error: profsError } = await supabase
        .from('professionals_public_safe')
        .select('profession');
      
      if (profsError) throw profsError;
      
      const dbProfessions = profs?.map(p => p.profession).filter(Boolean) || [];
      const allProfessionsList = [...new Set([...predefinedProfessions, ...dbProfessions])];
      allProfessionsList.sort((a, b) => a.localeCompare(b, 'es'));
      setAllProfessions(allProfessionsList);

      const { data: services, error: servicesError } = await supabase
        .from('professional_services')
        .select('service_name')
        .order('service_name');
      
      if (servicesError) throw servicesError;
      
      const uniqueServices = Array.from(new Set(services?.map(s => s.service_name).filter(Boolean) || []));
      setAllServices(uniqueServices);
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAllCategories = async () => {
    if (!showAllCategories && allProfessions.length === 0) {
      await loadAllProfessions();
    }
    setShowAllCategories(!showAllCategories);
  };

  return (
    <section className="py-8 sm:py-12 md:py-16 bg-muted/50">
      <div className="container mx-auto px-3 sm:px-4">
        <div className="text-center mb-6 sm:mb-8 md:mb-12">
          <h2 className="text-display text-foreground mb-2 sm:mb-3" style={{ fontSize: 'clamp(1.5rem, 3vw + 0.5rem, 2.5rem)' }}>
            Servicios Populares
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto">
            Encontrá el profesional que necesitás
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4 lg:gap-6">
          {categories.map((category, index) => {
            const Icon = category.icon;
            return (
              <Link
                key={index}
                to={`/search?q=${encodeURIComponent(category.searchTerm)}`}
                className="group p-3 sm:p-4 lg:p-6 bg-card rounded-xl sm:rounded-2xl shadow-sm card-hover-premium border hover:border-primary/30 text-left block"
              >
                <div className="flex flex-col items-center text-center space-y-2 sm:space-y-3">
                  <div className={`p-2 sm:p-3 rounded-lg sm:rounded-xl ${category.color} group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
                  </div>
                  <h3 className="font-medium text-xs sm:text-sm lg:text-base text-foreground leading-tight line-clamp-2">
                    {category.name}
                  </h3>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="text-center mt-6 sm:mt-8 md:mt-12 relative">
          <Button
            onClick={handleToggleAllCategories}
            variant="ghost"
            className="text-primary hover:text-primary/80 font-medium text-sm sm:text-base md:text-lg underline underline-offset-4 hover:no-underline"
            disabled={loading}
          >
            {loading ? 'Cargando...' : 
             showAllCategories ? 'Ocultar categorías' : 'Ver todas las categorías'}
            {!loading && (
              showAllCategories ? 
                <ChevronUp className="ml-1 sm:ml-2 h-4 w-4 sm:h-5 sm:w-5" /> : 
                <ChevronDown className="ml-1 sm:ml-2 h-4 w-4 sm:h-5 sm:w-5" />
            )}
          </Button>

          {/* Dropdown with all professions */}
          {showAllCategories && (
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-4 w-[calc(100vw-2rem)] sm:w-full max-w-4xl bg-popover rounded-xl sm:rounded-2xl shadow-xl border z-50 max-h-80 sm:max-h-96 overflow-y-auto">
              <div className="p-4 sm:p-6">
                <h3 className="text-base sm:text-lg md:text-xl font-semibold mb-3 sm:mb-4 text-center text-popover-foreground">
                  Categorías disponibles
                </h3>
                {(allProfessions.length > 0 || allServices.length > 0) ? (
                  <div className="space-y-4 sm:space-y-6">
                    {allProfessions.length > 0 && (
                      <div>
                        <h4 className="text-xs sm:text-sm font-semibold text-muted-foreground mb-2">Profesiones</h4>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
                          {allProfessions.map((profession, index) => (
                            <Link
                              key={`prof-${index}`}
                              to={`/search?q=${encodeURIComponent(profession)}`}
                              className="block p-2 sm:p-3 rounded-lg hover:bg-accent transition-colors border hover:border-primary/20"
                              onClick={() => setShowAllCategories(false)}
                            >
                              <div className="text-xs sm:text-sm font-medium text-popover-foreground text-center truncate">
                                {profession}
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}

                    {allServices.length > 0 && (
                      <div>
                        <h4 className="text-xs sm:text-sm font-semibold text-muted-foreground mb-2">Servicios</h4>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
                          {allServices.map((service, index) => (
                            <Link
                              key={`svc-${index}`}
                              to={`/search?q=${encodeURIComponent(service)}`}
                              className="block p-2 sm:p-3 rounded-lg hover:bg-accent transition-colors border hover:border-primary/20"
                              onClick={() => setShowAllCategories(false)}
                            >
                              <div className="text-xs sm:text-sm font-medium text-popover-foreground text-center truncate">
                                {service}
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground py-6 sm:py-8">
                    <p className="text-sm">No hay categorías cargadas aún.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default ServiceCategories;