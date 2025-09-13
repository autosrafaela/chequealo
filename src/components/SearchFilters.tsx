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
          <SelectContent>
            <SelectItem value="all">Todas las profesiones</SelectItem>
            {availableProfessions.map((profession) => (
              <SelectItem key={profession} value={profession}>
                {profession}
              </SelectItem>
            ))}
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
      {/* Desktop Filters */}
      <div className="hidden md:block">
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <FilterContent />
          </CardContent>
        </Card>
      </div>

      {/* Mobile Filter Toggle */}
      <div className="md:hidden">
        <Button
          variant="outline"
          onClick={onToggleMobileFilters}
          className="w-full mb-4"
        >
          <Filter className="h-4 w-4 mr-2" />
          Filtros
        </Button>

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