import React, { useState } from 'react';
import { useAdvancedSearch } from '@/hooks/useAdvancedSearch';
import { SearchFilters } from '@/components/SearchFilters';
import ProfessionalCard from '@/components/ProfessionalCard';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Search as SearchIcon, Grid, List, SlidersHorizontal } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import Header from '@/components/Header';

const Search = () => {
  const [searchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  
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
    <div className="min-h-screen bg-background">
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
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        <div className="w-16 h-16 bg-muted rounded-full"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-muted rounded w-3/4"></div>
                          <div className="h-3 bg-muted rounded w-1/2"></div>
                          <div className="h-3 bg-muted rounded w-full"></div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
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
                  />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <SearchIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">
                    No se encontraron profesionales
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Intenta con otros términos de búsqueda o ajusta los filtros
                  </p>
                  <Button onClick={clearFilters} variant="outline">
                    Limpiar filtros
                  </Button>
                </CardContent>
              </Card>
            )}
        </div>
      </div>
    </div>
  );
};

export default Search;