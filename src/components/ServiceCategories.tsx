import { 
  Wrench, Zap, Car, Sparkles, Dumbbell, Paintbrush, 
  Hammer, Flame, TreePine, Building, Heart, Laptop, ChevronDown, ChevronUp 
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

  // Servicios ordenados por ranking de búsquedas (los más buscados primero)
  const categories = [
    { name: "Empleada Doméstica / Servicio de Limpieza", icon: Sparkles, color: "bg-teal-100 text-teal-600", rank: 1, searchTerm: "limpieza" },
    { name: "Mecánico", icon: Car, color: "bg-orange-100 text-orange-600", rank: 2, searchTerm: "mecánico" },
    { name: "Técnico de Aire Acondicionado", icon: Wrench, color: "bg-blue-100 text-blue-600", rank: 3, searchTerm: "aire acondicionado" },
    { name: "Kinesiólogo / Fisioterapeuta", icon: Heart, color: "bg-pink-100 text-pink-600", rank: 4, searchTerm: "kinesiólogo" },
    { name: "Entrenador Personal", icon: Dumbbell, color: "bg-purple-100 text-purple-600", rank: 5, searchTerm: "entrenador personal" },
    { name: "Gestor del Automotor", icon: Car, color: "bg-red-100 text-red-600", rank: 6, searchTerm: "gestor automotor" },
    { name: "Profesor de Apoyo Escolar", icon: Laptop, color: "bg-indigo-100 text-indigo-600", rank: 7, searchTerm: "profesor apoyo escolar" },
    { name: "Servicio Técnico (Línea Blanca)", icon: Wrench, color: "bg-gray-100 text-gray-600", rank: 8, searchTerm: "técnico línea blanca" },
    { name: "Limpieza de Tapizados", icon: Sparkles, color: "bg-cyan-100 text-cyan-600", rank: 9, searchTerm: "limpieza tapizados" },
    { name: "Instalador de Durlock / Yesero", icon: Hammer, color: "bg-amber-100 text-amber-600", rank: 10, searchTerm: "durlock" },
    { name: "Fumigador / Control de Plagas", icon: Building, color: "bg-green-100 text-green-600", rank: 11, searchTerm: "fumigador" },
    { name: "Profesor de Música", icon: Laptop, color: "bg-yellow-100 text-yellow-600", rank: 12, searchTerm: "profesor música" },
  ];

  const loadAllProfessions = async () => {
    try {
      setLoading(true);
      
      // Lista completa de profesiones disponibles
      const predefinedProfessions = [
        'Abogado',
        'Acompañante Terapéutico',
        'Adiestrador de Perros',
        'Agrimensor',
        'Albañil',
        'Alisadora profesional',
        'Arquitecta',
        'Asesor de Seguros',
        'Asesor Inmobiliario',
        'Auxiliares de estudio',
        'Barbero',
        'Barman / Bartender',
        'Camarógrafo',
        'Carpintero / Ebanista',
        'Catering',
        'Cerrajero',
        'Chapista y Pintor Automotor',
        'Chef a Domicilio',
        'Chofer Particular',
        'Colocador de Cerámicos',
        'Colocador de Pisos',
        'Colocador de Porcelanatos',
        'Community Manager',
        'Contador',
        'Contadora Pública',
        'Control de Plagas y Fumigación',
        'Cortinero',
        'Cuidador de Mascotas',
        'Cuidador/a de Adultos Mayores',
        'Cuidador/a de Niños (Niñera)',
        'Decorador de Interiores',
        'Desinfección y Sanitización',
        'Desarrollador Web',
        'Detailing',
        'Detailing de Autos',
        'Diseñador de Interiores',
        'Diseñador Gráfico',
        'Editor de Video',
        'Electricista',
        'Electricista Matriculado',
        'Empleada Doméstica / Servicio de Limpieza',
        'Enfermero/a',
        'Entrenador Personal',
        'Escribano',
        'Esteticista',
        'Fletero / Mudanzas',
        'Fonoaudiólogo',
        'Fotógrafo',
        'Fumigador / Control de Plagas',
        'Gestor del Automotor',
        'Gomería',
        'Herrero',
        'Herrería de Obra',
        'Ingeniero',
        'Instalador de Alarmas',
        'Instalador de Audio para Autos',
        'Instalador de Cámaras de Seguridad',
        'Instalador de Durlock / Yesero',
        'Instalador de Internet',
        'Instalador de Paneles Solares',
        'Instalador de TV',
        'Jardinero',
        'Jardinero / Paisajista',
        'Kinesiólogo / Fisioterapeuta',
        'Lavadero de Autos',
        'Limpieza de Alfombras',
        'Limpieza de Persianas',
        'Limpieza de Tanques de Agua',
        'Limpieza de Tapizados',
        'Limpieza y Mantenimiento',
        'Manicurista',
        'Maquillador Profesional',
        'Maquillador/a',
        'Maquilladora artística',
        'Maquilladora social',
        'Martillero Público',
        'Masajista',
        'Mecánico',
        'Mecánico de Motos',
        'Mensajería',
        'Nutricionista',
        'Organizador Profesional',
        'Paseador de Perros',
        'Pastelero',
        'Pedicurista',
        'Peluquero Canino',
        'Peluquero/a',
        'Personal Shopper',
        'Pintor',
        'Pintor de Obras',
        'Plomero / Gasista',
        'Podador de Árboles',
        'Polarizado de Vidrios',
        'Profesor de Apoyo Escolar',
        'Profesor de Canto',
        'Profesor de Danza',
        'Profesor de Dibujo y Pintura',
        'Profesor de Física',
        'Profesor de Idiomas',
        'Profesor de Matemáticas',
        'Profesor de Música',
        'Profesor de Música (Guitarra)',
        'Profesor de Música (Piano)',
        'Profesor de Pilates',
        'Profesor de Química',
        'Profesor de Yoga',
        'Profesor Particular',
        'Profesora de Inglés',
        'Psicólogo',
        'Psicopedagogo',
        'Pulidor de Pisos',
        'Redactor de Contenidos',
        'Remisero',
        'Reparación de Celulares',
        'Reparación de Computadoras',
        'Reparación de Electrodomésticos',
        'Repostero',
        'Servicio Técnico (Línea Blanca)',
        'Soldador',
        'Sommelier',
        'Tapicero',
        'Techista',
        'Técnico de Aire Acondicionado',
        'Técnico de PC',
        'Técnico en Calefacción',
        'Técnico en Energías Renovables',
        'Técnico en Redes',
        'Técnico en Refrigeración',
        'Terapista Ocupacional',
        'Traductor',
        'Veterinario',
        'Vidriería'
      ];
      
      // SECURITY: Using professionals_public_safe for profession list from database
      const { data: profs, error: profsError } = await supabase
        .from('professionals_public_safe')
        .select('profession');
      
      if (profsError) throw profsError;
      
      // Combinar profesiones de la BD con las predefinidas
      const dbProfessions = profs?.map(p => p.profession).filter(Boolean) || [];
      const allProfessionsList = [...new Set([...predefinedProfessions, ...dbProfessions])];
      
      // Ordenar alfabéticamente
      allProfessionsList.sort((a, b) => a.localeCompare(b, 'es'));
      setAllProfessions(allProfessionsList);

      // Load ALL services (no filter by is_active)
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
    <section className="py-16 bg-muted/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Servicios Populares
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Encontrá el profesional que necesitás entre nuestras categorías más solicitadas
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
          {categories.map((category, index) => {
            const Icon = category.icon;
            return (
              <Link
                key={index}
                to={`/search?q=${encodeURIComponent(category.searchTerm)}`}
                className="group p-4 lg:p-6 bg-card rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-105 border hover:border-primary/20 text-left block"
              >
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className={`p-3 rounded-xl ${category.color} group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-medium text-sm lg:text-base text-foreground leading-tight">
                    {category.name}
                  </h3>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="text-center mt-12 relative">
          <Button
            onClick={handleToggleAllCategories}
            variant="ghost"
            className="text-primary hover:text-primary/80 font-medium text-lg underline underline-offset-4 hover:no-underline"
            disabled={loading}
          >
            {loading ? 'Cargando...' : 
             showAllCategories ? 'Ocultar categorías' : 'Ver todas las categorías'}
            {!loading && (
              showAllCategories ? 
                <ChevronUp className="ml-2 h-5 w-5" /> : 
                <ChevronDown className="ml-2 h-5 w-5" />
            )}
          </Button>

          {/* Dropdown with all professions */}
          {showAllCategories && (
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-4 w-full max-w-4xl bg-popover rounded-2xl shadow-xl border z-50 max-h-96 overflow-y-auto">
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-4 text-center text-popover-foreground">
                  Categorías disponibles
                </h3>
                {(allProfessions.length > 0 || allServices.length > 0) ? (
                  <div className="space-y-6">
                    {allProfessions.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold text-muted-foreground mb-2">Profesiones</h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                          {allProfessions.map((profession, index) => (
                            <Link
                              key={`prof-${index}`}
                              to={`/search?q=${encodeURIComponent(profession)}`}
                              className="block p-3 rounded-lg hover:bg-accent transition-colors border hover:border-primary/20"
                              onClick={() => setShowAllCategories(false)}
                            >
                              <div className="text-sm font-medium text-popover-foreground text-center">
                                {profession}
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}

                    {allServices.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold text-muted-foreground mb-2">Servicios</h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                          {allServices.map((service, index) => (
                            <Link
                              key={`svc-${index}`}
                              to={`/search?q=${encodeURIComponent(service)}`}
                              className="block p-3 rounded-lg hover:bg-accent transition-colors border hover:border-primary/20"
                              onClick={() => setShowAllCategories(false)}
                            >
                              <div className="text-sm font-medium text-popover-foreground text-center">
                                {service}
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    No hay categorías cargadas aún. Te mostramos las más populares:
                    <div className="mt-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                      {categories.map((c, i) => (
                        <Link
                          key={`fallback-${i}`}
                          to={`/search?q=${encodeURIComponent(c.searchTerm)}`}
                          className="block p-3 rounded-lg hover:bg-accent transition-colors border hover:border-primary/20"
                          onClick={() => setShowAllCategories(false)}
                        >
                          <div className="text-sm font-medium text-popover-foreground text-center">
                            {c.name}
                          </div>
                        </Link>
                      ))}
                    </div>
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