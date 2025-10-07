import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, X, MapPin, Star, Shield, Clock } from 'lucide-react';
import type { SearchFiltersType } from '@/hooks/useAdvancedSearch';

interface SearchFiltersProps {
  filters: SearchFiltersType;
  searchQuery: string;
  availableProfessions: string[];
  availableLocations: string[];
  onFiltersChange: (filters: Partial<SearchFiltersType>) => void;
  onSearchChange: (query: string) => void;
  onClearFilters: () => void;
  showMobileFilters: boolean;
  onToggleMobileFilters: () => void;
}

export const SearchFilters: React.FC<SearchFiltersProps> = ({
  filters,
  searchQuery,
  availableProfessions,
  availableLocations,
  onFiltersChange,
  onSearchChange,
  onClearFilters,
  showMobileFilters,
  onToggleMobileFilters
}) => {
  const hasActiveFilters = Object.keys(filters).some(key => filters[key as keyof SearchFiltersType] !== undefined);

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Buscar profesionales..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Profession Filter */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Profesión</Label>
        <Select value={filters.profession ?? 'all'} onValueChange={(value) => onFiltersChange({ profession: value === 'all' ? undefined : value })}>
          <SelectTrigger>
            <SelectValue placeholder="Todas las profesiones" />
          </SelectTrigger>
          <SelectContent className="bg-background z-50">
            <SelectItem value="all">Todas las profesiones</SelectItem>
            {availableProfessions.map((profession) => (
              <SelectItem key={profession} value={profession}>
                {profession}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Location Filter */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Ubicación</Label>
        <Select value={filters.location ?? 'all'} onValueChange={(value) => onFiltersChange({ location: value === 'all' ? undefined : value })}>
          <SelectTrigger>
            <SelectValue placeholder="Todas las ubicaciones" />
          </SelectTrigger>
          <SelectContent className="bg-background z-50">
            <SelectItem value="all">Todas las ubicaciones</SelectItem>
            {availableLocations.map((location) => (
              <SelectItem key={location} value={location}>
                {location}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Rating Filter */}
      <div className="space-y-2">
        <Label className="text-sm font-medium flex items-center gap-1">
          <Star className="h-4 w-4" />
          Calificación mínima
        </Label>
        <Select value={filters.rating?.toString() ?? 'all'} onValueChange={(value) => onFiltersChange({ rating: value === 'all' ? undefined : Number(value) })}>
          <SelectTrigger>
            <SelectValue placeholder="Cualquier calificación" />
          </SelectTrigger>
          <SelectContent className="bg-background z-50">
            <SelectItem value="all">Cualquier calificación</SelectItem>
            <SelectItem value="4">4+ estrellas</SelectItem>
            <SelectItem value="3">3+ estrellas</SelectItem>
            <SelectItem value="2">2+ estrellas</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Verified Filter */}
      <div className="space-y-2">
        <Label className="text-sm font-medium flex items-center gap-1">
          <Shield className="h-4 w-4" />
          Verificación
        </Label>
        <div className="flex items-center space-x-2">
          <Switch
            checked={filters.verified === true}
            onCheckedChange={(checked) => onFiltersChange({ verified: checked ? true : undefined })}
          />
          <span className="text-sm">Solo profesionales verificados</span>
        </div>
      </div>

      {/* Availability Filter */}
      <div className="space-y-2">
        <Label className="text-sm font-medium flex items-center gap-1">
          <Clock className="h-4 w-4" />
          Disponibilidad
        </Label>
        <Select value={filters.availability ?? 'all'} onValueChange={(value) => onFiltersChange({ availability: value === 'all' ? undefined : value })}>
          <SelectTrigger>
            <SelectValue placeholder="Cualquier disponibilidad" />
          </SelectTrigger>
          <SelectContent className="bg-background z-50">
            <SelectItem value="all">Cualquier disponibilidad</SelectItem>
            <SelectItem value="available">Disponible ahora</SelectItem>
            <SelectItem value="busy">Ocupado</SelectItem>
            <SelectItem value="unavailable">No disponible</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <Button
          variant="outline"
          onClick={onClearFilters}
          className="w-full"
        >
          <X className="h-4 w-4 mr-2" />
          Limpiar filtros
        </Button>
      )}
    </div>
  );

  return (
    <>
      {/* Top Bar Filters */}
      <div className="bg-card border rounded-lg p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-end">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Buscar profesionales..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Profession Filter */}
          <div className="w-full md:w-64">
            <Select value={filters.profession ?? 'all'} onValueChange={(value) => onFiltersChange({ profession: value === 'all' ? undefined : value })}>
              <SelectTrigger>
                <SelectValue placeholder="Todas las profesiones" />
              </SelectTrigger>
              <SelectContent className="bg-background z-50">
                <SelectItem value="all">Todas las profesiones</SelectItem>
                {availableProfessions.map((profession) => (
                  <SelectItem key={profession} value={profession}>
                    {profession}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Location Filter */}
          <div className="w-full md:w-64">
            <Select value={filters.location ?? 'all'} onValueChange={(value) => onFiltersChange({ location: value === 'all' ? undefined : value })}>
              <SelectTrigger>
                <SelectValue placeholder="Todas las ubicaciones" />
              </SelectTrigger>
              <SelectContent className="bg-background z-50">
                <SelectItem value="all">Todas las ubicaciones</SelectItem>
                {availableLocations.map((location) => (
                  <SelectItem key={location} value={location}>
                    {location}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Rating Filter */}
          <div className="w-full md:w-48">
            <Select value={filters.rating?.toString() ?? 'all'} onValueChange={(value) => onFiltersChange({ rating: value === 'all' ? undefined : Number(value) })}>
              <SelectTrigger>
                <SelectValue placeholder="Calificación mínima" />
              </SelectTrigger>
              <SelectContent className="bg-background z-50">
                <SelectItem value="all">Cualquier calificación</SelectItem>
                <SelectItem value="4">4+ estrellas</SelectItem>
                <SelectItem value="3">3+ estrellas</SelectItem>
                <SelectItem value="2">2+ estrellas</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Verified Filter */}
          <div className="w-full md:w-48">
            <Select value={filters.verified?.toString() ?? 'all'} onValueChange={(value) => onFiltersChange({ verified: value === 'all' ? undefined : value === 'true' })}>
              <SelectTrigger>
                <SelectValue placeholder="Verificación" />
              </SelectTrigger>
              <SelectContent className="bg-background z-50">
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="true">Solo verificados</SelectItem>
                <SelectItem value="false">No verificados</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Sort By Filter */}
          <div className="w-full md:w-48">
            <Select value={filters.sortBy ?? 'rating'} onValueChange={(value) => onFiltersChange({ sortBy: value as any })}>
              <SelectTrigger>
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent className="bg-background z-50">
                <SelectItem value="rating">Mejor calificados</SelectItem>
                <SelectItem value="reviews">Más reseñas</SelectItem>
                <SelectItem value="price">Precio</SelectItem>
                <SelectItem value="distance">Distancia</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <Button
              variant="outline"
              onClick={onClearFilters}
            >
              <X className="h-4 w-4 mr-2" />
              Limpiar
            </Button>
          )}
        </div>
      </div>

      {/* Mobile Filter Toggle */}
      <div className="md:hidden">
        {/* Mobile Filters Overlay */}
        {showMobileFilters && (
          <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
            <div className="fixed inset-x-0 bottom-0 z-50 max-h-[80vh] overflow-y-auto rounded-t-lg border bg-background p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Filtros</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onToggleMobileFilters}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <FilterContent />
            </div>
          </div>
        )}
      </div>
    </>
  );
};