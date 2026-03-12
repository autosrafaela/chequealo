import React, { useState, useMemo } from 'react';
import { useAdvancedSearch } from '@/hooks/useAdvancedSearch';
import { SearchFilters } from '@/components/SearchFilters';
import ProfessionalCard from '@/components/ProfessionalCard';
import { ProfessionalCardSkeleton } from '@/components/ProfessionalCardSkeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search as SearchIcon, Grid, List, SlidersHorizontal, SearchX, Bell } from 'lucide-react';
import { toast } from 'sonner';
import { useSearchParams } from 'react-router-dom';
import Header from '@/components/Header';
import { SEOHead } from '@/components/SEO/SEOHead';
import { BottomNavigation } from '@/components/BottomNavigation';
import { useVipStatus } from '@/hooks/useVipStatus';

const Search = () => {
  const [searchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [notifyEmail, setNotifyEmail] = useState('');
  
  const {
    professionals,
    loading,
    filters,
    searchQuery,
    availableProfessions,
    availableLocations,
    updateFilters,
    updateSearchQuery,
    clearFilters,
    searchProfessionals
  } = useAdvancedSearch();

  const professionalIds = useMemo(() => professionals.map(p => p.id), [professionals]);
  const { data: vipMap } = useVipStatus(professionalIds);

  // Initialize search from URL params
  React.useEffect(() => {
    const queryParam = searchParams.get('q');
    const professionParam = searchParams.get('profession');
    const locationParam = searchParams.get('location');
    const cityParam = searchParams.get('city');
    const sortParam = searchParams.get('sort');
    
    // Only update if there are actual search params
    const hasSearchParams = queryParam || professionParam || locationParam || cityParam || sortParam;
    
    if (hasSearchParams) {
      const filtersToUpdate: any = {};
      if (professionParam) filtersToUpdate.profession = professionParam;
      if (locationParam) filtersToUpdate.location = locationParam;
      if (cityParam) filtersToUpdate.location = cityParam;
      if (sortParam) filtersToUpdate.sortBy = sortParam;
      
      // Update both query and filters at once
      if (queryParam) {
        updateSearchQuery(queryParam);
        if (Object.keys(filtersToUpdate).length > 0) {
          setTimeout(() => updateFilters(filtersToUpdate), 0);
        }
      } else if (Object.keys(filtersToUpdate).length > 0) {
        updateFilters(filtersToUpdate);
      }
    } else {
      // No search params, load all professionals only if needed
      if (professionals.length === 0 && !loading) {
        updateSearchQuery('');
      }
    }
  }, [searchParams]);

  return (
    <>
      <SEOHead 
        title="Buscar Profesionales - Electricistas, Plomeros y Más | Chequealo"
        description="Encontrá profesionales verificados en Argentina. Filtrá por ubicación, profesión y calificaciones. Electricistas, plomeros, albañiles y más servicios."
        canonical="/search"
      />
      <div className="min-h-screen bg-background pb-20 md:pb-0">
        <Header />
        <div className="container mx-auto px-4 py-8">
        {/* Filters Top Bar */}
        <div className="mb-6">
          <SearchFilters
            filters={filters}
            searchQuery={searchQuery}
            availableProfessions={availableProfessions}
            availableLocations={availableLocations}
            onFiltersChange={updateFilters}
            onSearchChange={updateSearchQuery}
            onClearFilters={clearFilters}
            showMobileFilters={showMobileFilters}
            onToggleMobileFilters={() => setShowMobileFilters(!showMobileFilters)}
          />
        </div>
        
        {/* Results */}
        <div className="w-full">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <h2 className="text-xl font-semibold text-foreground">
                  {loading 
                    ? 'Buscando...' 
                    : `${professionals.length} profesionales encontrados`
                  }
                </h2>
                
                {/* View Mode Toggle */}
                <div className="hidden md:flex border rounded-lg p-1">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className="p-2"
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className="p-2"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Mobile Filter Toggle */}
              <div className="md:hidden">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowMobileFilters(true)}
                >
                  <SlidersHorizontal className="h-4 w-4 mr-2" />
                  Filtros
                </Button>
              </div>
            </div>
            
            {/* Results Grid/List */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <ProfessionalCardSkeleton key={i} />
                ))}
              </div>
            ) : professionals.length > 0 ? (
              <div className={`grid gap-6 ${
                viewMode === 'list' 
                  ? 'grid-cols-1' 
                  : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
              }`}>
                {professionals.map((professional) => (
                  <ProfessionalCard
                    key={professional.id}
                    id={professional.id}
                    name={professional.full_name}
                    profession={professional.profession}
                    location={professional.location}
                    rating={professional.rating}
                    reviewCount={professional.review_count}
                    description={professional.description}
                    verified={professional.is_verified}
                    availability={professional.availability}
                    image={professional.image_url}
                    isVip={vipMap?.get(professional.id) || false}
                  />
                ))}
              </div>
            ) : (
              <Card className="border-dashed">
                <CardContent className="text-center py-12 space-y-4">
                  <SearchX className="h-14 w-14 text-muted-foreground mx-auto" />
                  <h3 className="text-xl font-semibold text-foreground">
                    No encontramos lo que buscás...
                  </h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    {searchQuery
                      ? `No hay profesionales para "${searchQuery}" todavía.`
                      : 'Intenta con otros términos de búsqueda o ajusta los filtros.'}
                  </p>

                  {searchQuery && (
                    <div className="max-w-sm mx-auto pt-2 space-y-3">
                      <p className="text-sm font-medium text-foreground">
                        ¿No lo encontraste? Dejanos tu email y te avisamos:
                      </p>
                      <form
                        className="flex gap-2"
                        onSubmit={(e) => {
                          e.preventDefault();
                          toast.success(
                            `¡Listo! Te avisaremos cuando haya profesionales de "${searchQuery}".`
                          );
                          setNotifyEmail('');
                        }}
                      >
                        <Input
                          type="email"
                          placeholder="tu@email.com"
                          value={notifyEmail}
                          onChange={(e) => setNotifyEmail(e.target.value)}
                          required
                          className="flex-1"
                        />
                        <Button type="submit" size="sm" className="gap-1.5">
                          <Bell className="h-4 w-4" />
                          Avisarme
                        </Button>
                      </form>
                    </div>
                  )}

                  <Button onClick={clearFilters} variant="outline" className="mt-2">
                    Limpiar filtros
                  </Button>
                </CardContent>
              </Card>
            )}
        </div>
      </div>
      
      {/* Bottom Navigation - Mobile Only */}
      <div className="md:hidden">
        <BottomNavigation />
      </div>
    </div>
    </>
  );
};

export default Search;