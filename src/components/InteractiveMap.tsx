import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { usePlanRestrictions } from '@/hooks/usePlanRestrictions';
import { GeolocationService } from '@/utils/geolocationService';
import { PlanRestrictionsAlert } from './PlanRestrictionsAlert';
import { MapPin, Navigation, Search, Star, Shield } from 'lucide-react';
import { toast } from 'sonner';

interface MapProfessional {
  id: string;
  full_name: string;
  profession: string;
  location: string;
  latitude: number;
  longitude: number;
  rating: number;
  review_count: number;
  is_verified: boolean;
  image_url?: string;
  distance?: number;
}

interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export const InteractiveMap: React.FC = () => {
  const { planLimits, loading: planLoading } = usePlanRestrictions();
  const [professionals, setProfessionals] = useState<MapProfessional[]>([]);
  const [selectedProfessional, setSelectedProfessional] = useState<MapProfessional | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [mapBounds, setMapBounds] = useState<MapBounds | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);

  // Simple map visualization using CSS and positioning
  const [viewCenter, setViewCenter] = useState({ lat: -34.6037, lng: -58.3816 }); // Default to Buenos Aires
  const [zoom, setZoom] = useState(10);

  const loadProfessionalsInBounds = async (bounds?: MapBounds) => {
    if (!planLimits.canUseInteractiveMap) return;

    setLoading(true);
    try {
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
          is_verified,
          image_url
        `)
        .eq('is_blocked', false)
        .not('latitude', 'is', null)
        .not('longitude', 'is', null);

      // Filter by search query if provided
      if (searchQuery) {
        query = query.or(`profession.ilike.%${searchQuery}%,full_name.ilike.%${searchQuery}%`);
      }

      // Filter by bounds if provided
      if (bounds) {
        query = query
          .gte('latitude', bounds.south)
          .lte('latitude', bounds.north)
          .gte('longitude', bounds.west)
          .lte('longitude', bounds.east);
      }

      const { data, error } = await query.limit(50);

      if (error) throw error;

      const professionalsWithDistance = (data || []).map(prof => {
        let distance;
        if (userLocation) {
          distance = GeolocationService.calculateDistance(
            userLocation.lat,
            userLocation.lng,
            prof.latitude,
            prof.longitude
          );
        }
        return { ...prof, distance } as MapProfessional;
      });

      setProfessionals(professionalsWithDistance);
    } catch (error) {
      console.error('Error loading professionals:', error);
      toast.error('Error cargando profesionales en el mapa');
    } finally {
      setLoading(false);
    }
  };

  const getCurrentLocation = async () => {
    try {
      const location = await GeolocationService.getCurrentPosition();
      setUserLocation({ lat: location.latitude, lng: location.longitude });
      setViewCenter({ lat: location.latitude, lng: location.longitude });
      toast.success('Ubicación obtenida');
      
      // Load professionals around current location
      const bounds: MapBounds = {
        north: location.latitude + 0.1,
        south: location.latitude - 0.1,
        east: location.longitude + 0.1,
        west: location.longitude - 0.1
      };
      setMapBounds(bounds);
      loadProfessionalsInBounds(bounds);
    } catch (error: any) {
      toast.error(error.message || 'Error obteniendo ubicación');
    }
  };

  const handleSearch = () => {
    loadProfessionalsInBounds(mapBounds);
  };

  const handleProfessionalClick = (professional: MapProfessional) => {
    setSelectedProfessional(professional);
    setViewCenter({ lat: professional.latitude, lng: professional.longitude });
  };

  const calculateMapPosition = (lat: number, lng: number) => {
    // Simple conversion for demonstration - in real app would use proper map library
    const mapWidth = 800;
    const mapHeight = 600;
    
    const centerLat = viewCenter.lat;
    const centerLng = viewCenter.lng;
    const zoomFactor = zoom / 10;
    
    const x = ((lng - centerLng) * 100000 * zoomFactor) + (mapWidth / 2);
    const y = ((centerLat - lat) * 100000 * zoomFactor) + (mapHeight / 2);
    
    return { x: Math.max(0, Math.min(mapWidth - 20, x)), y: Math.max(0, Math.min(mapHeight - 20, y)) };
  };

  useEffect(() => {
    if (planLimits.canUseInteractiveMap) {
      getCurrentLocation();
    }
  }, [planLimits.canUseInteractiveMap]);

  if (planLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            <span className="ml-2">Cargando mapa...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!planLimits.canUseInteractiveMap) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Mapa Interactivo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <PlanRestrictionsAlert 
            featureType="interactive_map"
            currentUsage={0}
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Mapa Interactivo de Profesionales
          </CardTitle>
          <div className="flex gap-2">
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por profesión o nombre..."
              className="flex-1"
            />
            <Button onClick={handleSearch} disabled={loading}>
              <Search className="h-4 w-4" />
            </Button>
            <Button onClick={getCurrentLocation} variant="outline">
              <Navigation className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Simple Map Visualization */}
          <div className="relative w-full h-[600px] bg-gradient-to-br from-green-100 to-blue-100 rounded-lg border overflow-hidden">
            {/* Map background pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="grid grid-cols-20 grid-rows-15 h-full">
                {Array.from({ length: 300 }).map((_, i) => (
                  <div key={i} className="border border-gray-300"></div>
                ))}
              </div>
            </div>
            
            {/* User location marker */}
            {userLocation && (
              <div 
                className="absolute w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg z-10"
                style={{
                  left: `${calculateMapPosition(userLocation.lat, userLocation.lng).x}px`,
                  top: `${calculateMapPosition(userLocation.lat, userLocation.lng).y}px`,
                  transform: 'translate(-50%, -50%)'
                }}
                title="Tu ubicación"
              >
                <div className="absolute inset-0 bg-blue-500 rounded-full animate-ping"></div>
              </div>
            )}
            
            {/* Professional markers */}
            {professionals.map((professional) => {
              const position = calculateMapPosition(professional.latitude, professional.longitude);
              return (
                <div
                  key={professional.id}
                  className={`absolute w-8 h-8 cursor-pointer z-20 transform -translate-x-1/2 -translate-y-1/2 transition-all hover:scale-110 ${
                    selectedProfessional?.id === professional.id ? 'scale-125' : ''
                  }`}
                  style={{
                    left: `${position.x}px`,
                    top: `${position.y}px`
                  }}
                  onClick={() => handleProfessionalClick(professional)}
                  title={`${professional.full_name} - ${professional.profession}`}
                >
                  <div className={`w-8 h-8 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-white text-xs font-bold ${
                    professional.is_verified ? 'bg-green-500' : 'bg-orange-500'
                  }`}>
                    {professional.is_verified ? <Shield className="h-4 w-4" /> : <MapPin className="h-4 w-4" />}
                  </div>
                  {selectedProfessional?.id === professional.id && (
                    <div className="absolute top-10 left-1/2 transform -translate-x-1/2 bg-white p-3 rounded-lg shadow-lg border min-w-64 z-30">
                      <div className="flex items-center gap-3">
                        {professional.image_url ? (
                          <img 
                            src={professional.image_url} 
                            alt={professional.full_name}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-primary">
                              {professional.full_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                            </span>
                          </div>
                        )}
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{professional.full_name}</h4>
                            {professional.is_verified && (
                              <Badge variant="secondary" className="text-xs">
                                <Shield className="h-3 w-3 mr-1" />
                                Verificado
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{professional.profession}</p>
                          <p className="text-xs text-muted-foreground">{professional.location}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex items-center">
                              <Star className="h-3 w-3 text-yellow-500 mr-1" />
                              <span className="text-xs">{professional.rating || 0}/5</span>
                            </div>
                            <span className="text-xs text-muted-foreground">
                              ({professional.review_count || 0} reseñas)
                            </span>
                            {professional.distance && (
                              <span className="text-xs text-blue-600 font-medium">
                                📍 {professional.distance.toFixed(1)}km
                              </span>
                            )}
                          </div>
                          <Button size="sm" className="mt-2 w-full" onClick={(e) => {
                            e.stopPropagation();
                            window.location.href = `/professional/${professional.id}`;
                          }}>
                            Ver Perfil
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
            
            {/* Map controls */}
            <div className="absolute bottom-4 right-4 flex flex-col gap-2">
              <Button
                size="sm"
                variant="outline"
                className="w-10 h-10 p-0"
                onClick={() => setZoom(Math.min(20, zoom + 2))}
              >
                +
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="w-10 h-10 p-0"
                onClick={() => setZoom(Math.max(2, zoom - 2))}
              >
                -
              </Button>
            </div>
            
            {loading && (
              <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                <div className="bg-white p-4 rounded-lg shadow-lg flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                  <span>Cargando profesionales...</span>
                </div>
              </div>
            )}
          </div>
          
          <div className="mt-4 text-sm text-muted-foreground">
            <p>🟢 Verde: Profesional verificado | 🟠 Naranja: Sin verificar | 🔵 Azul: Tu ubicación</p>
            <p>Zoom: {zoom}/20 | Profesionales mostrados: {professionals.length}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};