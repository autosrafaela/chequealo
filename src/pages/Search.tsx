import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Filter, Grid, List, SlidersHorizontal } from "lucide-react";
import Header from "@/components/Header";
import ProfessionalCard from "@/components/ProfessionalCard";
import FilterDropdown from "@/components/FilterDropdown";

const Search = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('latest');
  const [favorites, setFavorites] = useState<string[]>([]);

  const handleToggleFavorite = (id: string) => {
    setFavorites(prev => 
      prev.includes(id) 
        ? prev.filter(fav => fav !== id)
        : [...prev, id]
    );
  };

  const sortOptions = [
    { 
      value: 'latest', 
      label: 'Últimas publicaciones',
      description: 'Los profesionales agregados más recientemente'
    },
    { 
      value: 'rating', 
      label: 'Mejor puntuadas',
      description: 'Profesionales con mejores calificaciones'
    },
    { 
      value: 'price', 
      label: 'Precio',
      description: 'Ordenar por precio más conveniente'
    },
    { 
      value: 'speed', 
      label: 'Rapidez',
      description: 'Profesionales con respuesta más rápida'
    },
    { 
      value: 'quality', 
      label: 'Calidad',
      description: 'Profesionales destacados por calidad'
    }
  ];

  // Mock data
  const professionals = [
    {
      id: "1",
      name: "Ana Rodríguez",
      profession: "Contadora Pública",
      location: "Rafaela, Santa Fe",
      rating: 4.8,
      reviewCount: 15,
      description: "Balances, liquidación de impuestos y asesoría contable. Más de 10 años de experiencia.",
      verified: true,
      availability: "Disponible hoy"
    },
    {
      id: "2",
      name: "José Martínez",
      profession: "Plomero / Gasista",
      location: "Rafaela, Santa Fe",
      rating: 4.2,
      reviewCount: 8,
      description: "Reparaciones de plomería, instalaciones sanitarias y gas domiciliario. Servicio las 24hs.",
      verified: true,
      availability: "Disponible mañana"
    },
    {
      id: "3",
      name: "Laura Gómez",
      profession: "Electricista Domiciliaria",
      location: "Rafaela, Santa Fe",
      rating: 5.0,
      reviewCount: 12,
      description: "Instalaciones eléctricas seguras y certificadas. Urgencias 24hs. Presupuestos sin cargo.",
      verified: true,
      availability: "Disponible ahora"
    },
    {
      id: "4",
      name: "Carlos Fernández",
      profession: "Mecánico Automotriz",
      location: "Rafaela, Santa Fe",
      rating: 4.5,
      reviewCount: 23,
      description: "Reparación integral, inyección electrónica y servicios rápidos. Taller equipado.",
      verified: false,
      availability: "Disponible esta semana"
    },
    {
      id: "5",
      name: "María López",
      profession: "Abogada",
      location: "Rafaela, Santa Fe",
      rating: 4.7,
      reviewCount: 18,
      description: "Asesoramiento legal en derecho civil y comercial. Consultas presenciales y virtuales.",
      verified: true,
      availability: "Disponible próxima semana"
    },
    {
      id: "6",
      name: "Maximiliano Bustamante",
      profession: "Gestor del Automotor / Mandatario",
      location: "Rafaela, Santa Fe",
      rating: 4.3,
      reviewCount: 7,
      description: "Trámites registrales: transferencias, informes de dominio, inscripciones.",
      verified: true,
      availability: "Disponible hoy"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Search Header */}
        <div className="mb-8">
          <div className="bg-navy text-navy-foreground px-4 py-2 rounded-lg inline-block mb-4">
            <span className="text-sm">Búsqueda:</span>
            <span className="font-semibold ml-2">6 resultado(s)</span>
          </div>
          
          {/* Filters and Controls */}
          <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center bg-white p-4 rounded-xl shadow-sm">
            <div className="flex flex-wrap gap-2">
              <FilterDropdown
                options={sortOptions}
                selected={sortBy}
                onSelect={setSortBy}
                placeholder="Ordenar por..."
              />
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <SlidersHorizontal className="h-4 w-4 mr-1" />
                Filtros
              </Button>
              
              <div className="flex rounded-lg overflow-hidden border">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="rounded-none"
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="rounded-none"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Results Grid */}
        <div className={`grid gap-6 ${
          viewMode === 'grid' 
            ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3' 
            : 'grid-cols-1'
        }`}>
          {professionals.map((professional) => (
            <ProfessionalCard
              key={professional.id}
              {...professional}
              onToggleFavorite={handleToggleFavorite}
              isFavorite={favorites.includes(professional.id)}
            />
          ))}
        </div>

        {/* Pagination */}
        <div className="flex justify-center mt-12">
          <div className="flex space-x-2">
            <Button variant="outline" disabled>
              Anterior
            </Button>
            <Button variant="default" className="bg-primary">1</Button>
            <Button variant="outline">2</Button>
            <Button variant="outline">3</Button>
            <Button variant="outline">
              Siguiente
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Search;