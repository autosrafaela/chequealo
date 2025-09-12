import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Filter, Grid, List, SlidersHorizontal } from "lucide-react";
import Header from "@/components/Header";
import ProfessionalCard from "@/components/ProfessionalCard";
import FilterDropdown from "@/components/FilterDropdown";
import { supabase } from "@/integrations/supabase/client";
import { useSearchParams } from "react-router-dom";

const Search = () => {
  const [searchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('latest');
  const [favorites, setFavorites] = useState<string[]>([]);
  const searchQuery = searchParams.get('q') || '';

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

  const [professionals, setProfessionals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    const loadProfessionals = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('professionals')
          .select('*')
          .order('created_at', { ascending: false });
        if (error) throw error;
        const mapped = (data || []).map((p) => ({
          id: p.id,
          name: p.full_name,
          profession: p.profession,
          location: p.location || '',
          rating: Number(p.rating || 0),
          reviewCount: p.review_count || 0,
          description: p.description || '',
          verified: !!p.is_verified,
          availability: p.availability || 'Disponible',
          image: p.image_url || undefined,
        }));
        setProfessionals(mapped);
      } catch (e: any) {
        console.error('Error loading professionals:', e);
        setLoadError('No se pudieron cargar los profesionales');
      } finally {
        setLoading(false);
      }
    };
    loadProfessionals();
  }, []);


  const filteredAndSortedProfessionals = useMemo(() => {
    // Filter by search query first
    let filtered = professionals;
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = professionals.filter(prof => 
        prof.name.toLowerCase().includes(query) ||
        prof.profession.toLowerCase().includes(query) ||
        prof.description.toLowerCase().includes(query) ||
        prof.location.toLowerCase().includes(query)
      );
    }

    // Then sort
    const list = [...filtered];
    switch (sortBy) {
      case 'rating':
        return list.sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount);
      case 'quality':
        // Aproximación: más calidad = mejor combinación de rating y cantidad de reseñas
        return list.sort((a, b) => (b.rating * b.reviewCount) - (a.rating * a.reviewCount));
      case 'speed': {
        // Prioriza disponibilidad más inmediata
        const score = (a: string) => {
          const map: Record<string, number> = {
            'Disponible ahora': 4,
            'Disponible hoy': 3,
            'Disponible mañana': 2,
            'Disponible esta semana': 1,
            'Disponible próxima semana': 0,
          };
          return map[a] ?? 0;
        };
        return list.sort((a, b) => score(b.availability) - score(a.availability));
      }
      case 'price':
        // Sin dato de precio, usamos orden alfabético como aproximación visible
        return list.sort((a, b) => a.name.localeCompare(b.name));
      case 'latest':
      default:
        return filtered; // orden original como "Últimas publicaciones"
    }
  }, [sortBy, professionals, searchQuery]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Search Header */}
        <div className="mb-8">
          <div className="bg-navy text-navy-foreground px-4 py-2 rounded-lg inline-block mb-4">
            <span className="text-sm">
              {searchQuery ? `Búsqueda: "${searchQuery}"` : 'Todas las publicaciones'}
            </span>
            <span className="font-semibold ml-2">{filteredAndSortedProfessionals.length} resultado(s)</span>
          </div>

          {/* Filters and Controls */}
          <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center bg-white p-4 rounded-xl shadow-sm">
            <div></div>

            <div className="flex items-center gap-2">
              <FilterDropdown
                options={sortOptions}
                selected={sortBy}
                onSelect={setSortBy}
                placeholder="Filtros y Ordenamiento"
              />
              
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
        {loading ? (
          <div className="text-center text-muted-foreground py-12">
            Cargando profesionales...
          </div>
        ) : (
          <div className={`grid gap-6 ${
            viewMode === 'grid' 
              ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3' 
              : 'grid-cols-1'
          }`}>
            {filteredAndSortedProfessionals.length > 0 ? (
              filteredAndSortedProfessionals.map((professional) => (
                <ProfessionalCard
                  key={professional.id}
                  {...professional}
                  onToggleFavorite={handleToggleFavorite}
                  isFavorite={favorites.includes(professional.id)}
                />
              ))
            ) : (
              <div className="text-center text-muted-foreground py-12 col-span-full">
                {searchQuery ? 
                  `No se encontraron profesionales para "${searchQuery}".` :
                  'No se encontraron profesionales.'
                }
              </div>
            )}
          </div>
        )}

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