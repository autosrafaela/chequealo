import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { supabase } from '@/integrations/supabase/client';
import { usePlanRestrictions } from '@/hooks/usePlanRestrictions';
import { GeolocationService, LocationCoordinates } from '@/utils/geolocationService';
import { toast } from 'sonner';
import { MapPin, Navigation, Loader2, Search } from 'lucide-react';
import { PlanRestrictionsAlert } from './PlanRestrictionsAlert';

interface Professional {
  id: string;
  full_name: string;
  profession: string;
  location: string;
  latitude?: number | null;
  longitude?: number | null;
  distance?: number;
  rating: number;
  review_count: number;
  image_url?: string | null;
  is_verified: boolean;
}

interface ProximitySearchProps {
  onResultsChange?: (professionals: Professional[]) => void;
}

export const ProximitySearch: React.FC<ProximitySearchProps> = ({ onResultsChange }) => {
  const { planLimits, loading: planLoading } = usePlanRestrictions();
  const [userLocation, setUserLocation] = useState<LocationCoordinates | null>(null);
  const [searchRadius, setSearchRadius] = useState([10]);
  const [profession, setProfession] = useState('');
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [useCurrentLocation, setUseCurrentLocation] = useState(false);
  const [manualLocation, setManualLocation] = useState('');

  const getCurrentLocation = async () => {
    if (!planLimits.canUseProximitySearch) {
      toast.error('Tu plan no incluye búsqueda por proximidad');
      return;
    }

    setLocationLoading(true);
    try {
      const location = await GeolocationService.getCurrentPosition();
      setUserLocation(location);
      setUseCurrentLocation(true);
      
      // Get location name
      const locationName = await GeolocationService.reverseGeocode(
        location.latitude, 
        location.longitude
      );
      setManualLocation(locationName);
      
      toast.success('Ubicación obtenida correctamente');
    } catch (error: any) {
      toast.error(error.message || 'Error al obtener ubicación');
      setUseCurrentLocation(false);
    } finally {
      setLocationLoading(false);
    }
  };

  const searchProfessionals = async () => {
    if (!planLimits.canUseProximitySearch) {
      toast.error('Tu plan no incluye búsqueda por proximidad');
      return;
    }

    if (!userLocation && !manualLocation) {
      toast.error('Debes especificar una ubicación');
      return;
    }

    setLoading(true);
    try {
      // SECURITY: Query professionals table but exclude sensitive fields (email, phone, dni)
      // Note: latitude/longitude are needed for proximity calculations
      let query = supabase
        .from('professionals')
        .select(`
          id,
          full_name,
          profession,
          location,
          latitude,
          longitude,
          rating,
          review_count,
          image_url,
          is_verified
        `)
        .eq('is_blocked', false);

      if (profession) {
        query = query.ilike('profession', `%${profession}%`);
      }

      const { data, error } = await query;

      if (error) throw error;

      let filteredProfessionals: Professional[] = (data || []).map(prof => ({
        ...prof,
        image_url: prof.image_url || null,
        latitude: prof.latitude || null,
        longitude: prof.longitude || null,
      }));

      // Filter by proximity if we have user location
      if (userLocation) {
        filteredProfessionals = filteredProfessionals
          .map(prof => {
            if (prof.latitude && prof.longitude) {
              const distance = GeolocationService.calculateDistance(
                userLocation.latitude,
                userLocation.longitude,
                prof.latitude,
                prof.longitude
              );
              return { ...prof, distance } as Professional;
            }
            return prof as Professional;
          })
          .filter(prof => {
            // If professional has no coordinates, keep them (manual location)
            if (!prof.latitude || !prof.longitude) return true;
            // Filter by radius
            return prof.distance !== undefined && prof.distance <= searchRadius[0];
          })
          .sort((a, b) => {
            // Sort by distance, then by rating
            if (a.distance !== undefined && b.distance !== undefined) {
              return a.distance - b.distance;
            }
            return (b.rating || 0) - (a.rating || 0);
          });
      }

      // Limit results based on plan
      const maxResults = planLimits.proximitySearchRadius === 100 ? 50 : 
                        planLimits.proximitySearchRadius === 50 ? 25 : 10;
      
      filteredProfessionals = filteredProfessionals.slice(0, maxResults);

      setProfessionals(filteredProfessionals);
      onResultsChange?.(filteredProfessionals);
      
      toast.success(`${filteredProfessionals.length} profesionales encontrados`);
    } catch (error) {
      console.error('Error searching professionals:', error);
      toast.error('Error en la búsqueda');
    } finally {
      setLoading(false);
    }
  };

  const formatDistance = (distance?: number) => {
    if (distance === undefined) return 'Distancia no disponible';
    return distance < 1 
      ? `${Math.round(distance * 1000)}m`
      : `${distance.toFixed(1)}km`;
  };

  if (planLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2">Cargando...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!planLimits.canUseProximitySearch) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Búsqueda por Proximidad
          </CardTitle>
        </CardHeader>
        <CardContent>
          <PlanRestrictionsAlert 
            featureType="proximity_search"
            currentUsage={0}
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Búsqueda por Proximidad
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Encuentra profesionales cerca de tu ubicación
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Location Controls */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Switch
                id="use-location"
                checked={useCurrentLocation}
                onCheckedChange={setUseCurrentLocation}
              />
              <Label htmlFor="use-location">Usar mi ubicación actual</Label>
            </div>

            {useCurrentLocation ? (
              <div className="flex gap-2">
                <Button
                  onClick={getCurrentLocation}
                  disabled={locationLoading}
                  variant="outline"
                  className="flex-1"
                >
                  {locationLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Navigation className="h-4 w-4 mr-2" />
                  )}
                  {locationLoading ? 'Obteniendo...' : 'Obtener Ubicación'}
                </Button>
                {userLocation && (
                  <div className="flex-1 px-3 py-2 bg-green-50 border border-green-200 rounded text-sm text-green-700">
                    ✓ Ubicación obtenida: {manualLocation}
                  </div>
                )}
              </div>
            ) : (
              <div>
                <Label>Ubicación Manual</Label>
                <Input
                  value={manualLocation}
                  onChange={(e) => setManualLocation(e.target.value)}
                  placeholder="Ingresa ciudad, barrio o dirección"
                />
              </div>
            )}
          </div>

          {/* Search Controls */}
          <div className="space-y-3">
            <div>
              <Label>Profesión (opcional)</Label>
              <Input
                value={profession}
                onChange={(e) => setProfession(e.target.value)}
                placeholder="Ej: Plomero, Electricista, etc."
              />
            </div>

            <div>
              <Label>Radio de búsqueda: {searchRadius[0]}km</Label>
              <Slider
                value={searchRadius}
                onValueChange={setSearchRadius}
                max={Math.min(planLimits.proximitySearchRadius, 100)}
                min={1}
                step={1}
                className="mt-2"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>1km</span>
                <span>{Math.min(planLimits.proximitySearchRadius, 100)}km</span>
              </div>
            </div>
          </div>

          <Button
            onClick={searchProfessionals}
            disabled={loading || (!userLocation && !manualLocation)}
            className="w-full"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Search className="h-4 w-4 mr-2" />
            )}
            {loading ? 'Buscando...' : 'Buscar Profesionales'}
          </Button>
        </CardContent>
      </Card>

      {/* Results */}
      {professionals.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Resultados ({professionals.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {professionals.map((prof) => (
                <div key={prof.id} className="flex items-center gap-4 p-4 border rounded-lg">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    {prof.image_url ? (
                      <img 
                        src={prof.image_url} 
                        alt={prof.full_name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-sm font-medium text-primary">
                        {prof.full_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{prof.full_name}</h4>
                      {prof.is_verified && (
                        <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs">✓</span>
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{prof.profession}</p>
                    <p className="text-xs text-muted-foreground">{prof.location}</p>
                    <div className="flex items-center gap-4 mt-1">
                      <span className="text-xs">⭐ {prof.rating || 0}/5</span>
                      <span className="text-xs">({prof.review_count || 0} reseñas)</span>
                      {prof.distance !== undefined && (
                        <span className="text-xs text-blue-600 font-medium">
                          📍 {formatDistance(prof.distance)}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <Button size="sm" variant="outline">
                    Ver Perfil
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
