import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star, MapPin, MessageCircle, Heart, Shield, Clock, User, CheckCircle, Crown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useFavorites } from '@/hooks/useFavorites';
import { ZonaTodayBadge } from '@/components/ZonaTodayBadge';
import { useActiveProRoutes } from '@/hooks/useProRoutes';

interface Professional {
  id: string;
  full_name: string;
  profession: string;
  location: string;
  description: string;
  rating: number;
  review_count: number;
  image_url?: string;
  is_verified: boolean;
  availability: string;
  distance?: number;
}

interface EnhancedProfessionalCardProps {
  professional: Professional;
  compact?: boolean;
  showDistance?: boolean;
  featured?: boolean;
}

export const EnhancedProfessionalCard: React.FC<EnhancedProfessionalCardProps> = ({
  professional,
  compact = false,
  showDistance = true,
  featured = false
}) => {
  const navigate = useNavigate();
  const { favorites, toggleFavorite, loading: favoritesLoading } = useFavorites();
  const { data: activeRoutes } = useActiveProRoutes();
  
  const isFavorite = favorites.includes(professional.id);
  
  const activeRoute = activeRoutes?.find(r => r.professional_id === professional.id);
  const hasZonaToday = !!activeRoute;

  const handleCardClick = () => {
    navigate(`/professional/${professional.id}`);
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite(professional.id);
  };

  const handleContactClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/professional/${professional.id}#contact`);
  };

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'available': return 'bg-green-500';
      case 'busy': return 'bg-yellow-500';
      case 'unavailable': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getAvailabilityText = (availability: string) => {
    switch (availability) {
      case 'available': return 'Disponible';
      case 'busy': return 'Ocupado';
      case 'unavailable': return 'No disponible';
      default: return 'Sin especificar';
    }
  };

  return (
    <Card 
      className={`group cursor-pointer card-hover-premium border shadow-sm ${
        featured 
          ? 'border-primary/20 shadow-md h-full' 
          : 'hover:border-primary/30 hover:shadow-lg'
      } ${professional.is_verified ? 'hover:shadow-[0_20px_40px_rgba(var(--primary),0.1)]' : ''}`}
      onClick={handleCardClick}
    >
      <CardContent className={`${featured ? 'p-4 sm:p-6' : 'p-3 sm:p-4'} ${compact ? 'pb-2 sm:pb-3' : 'pb-3 sm:pb-4'} h-full`}>
        <div className="flex gap-3 sm:gap-4">
          {/* Avatar and Status - Responsive */}
          <div className="relative flex-shrink-0">
            <Avatar className={`${featured ? "h-16 w-16 sm:h-20 sm:w-20 avatar-organic-animated" : compact ? "h-10 w-10 sm:h-12 sm:w-12 avatar-organic-static" : "h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 avatar-organic-static"} transition-all duration-500 group-hover:-translate-y-1 group-hover:rotate-[10deg] group-hover:scale-110`}>
              <AvatarImage src={professional.image_url} alt={professional.full_name.toUpperCase()} />
              <AvatarFallback className="bg-gray-100 dark:bg-gray-800">
                <User className={`text-gray-400 ${featured ? 'h-8 w-8 sm:h-10 sm:w-10' : compact ? 'h-5 w-5' : 'h-6 w-6 sm:h-7 sm:w-7'}`} />
              </AvatarFallback>
            </Avatar>
            
            {/* Online Status Indicator */}
            <div className="absolute -bottom-0.5 -right-0.5 sm:-bottom-1 sm:-right-1">
              <div className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full border-2 border-background ${getAvailabilityColor(professional.availability)}`} />
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-1 sm:gap-2">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1 sm:gap-2 mb-0.5 sm:mb-1">
                  <h3 className={`text-foreground truncate uppercase ${compact ? 'text-xs sm:text-sm font-bold' : featured ? 'text-sm sm:text-base font-extrabold' : 'text-sm sm:text-base font-bold'}`}>
                    {professional.full_name}
                  </h3>
                  {professional.is_verified && (
                    <Shield className="h-3 w-3 sm:h-4 sm:w-4 text-blue-500 flex-shrink-0" />
                  )}
                </div>
                
                <p className={`text-muted-foreground mb-1 sm:mb-2 truncate ${compact ? 'text-[10px] sm:text-xs' : 'text-xs sm:text-sm'}`}>
                  {professional.profession}
                </p>
                
                {(featured || !compact) && professional.description && (
                  <p className={`text-muted-foreground mb-2 sm:mb-3 ${featured ? 'text-sm sm:text-base line-clamp-3' : 'text-xs sm:text-sm line-clamp-2 hidden sm:block'}`}>
                    {professional.description}
                  </p>
                )}
              </div>

              {/* Favorite Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleFavoriteClick}
                disabled={favoritesLoading}
                className="flex-shrink-0 p-1.5 sm:p-2 h-auto"
              >
                <Heart className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-muted-foreground'}`} />
              </Button>
            </div>

            {/* Info Row - Responsive */}
            <div className="flex items-center flex-wrap gap-2 sm:gap-3 md:gap-4 mb-2 sm:mb-3 text-xs sm:text-sm text-muted-foreground">
              {/* Rating */}
              <div className="flex items-center gap-0.5 sm:gap-1">
                <Star className="h-3 w-3 sm:h-4 sm:w-4 fill-yellow-400 text-yellow-400" />
                <span className="font-medium text-foreground text-xs sm:text-sm">
                  {professional.rating.toFixed(1)}
                </span>
                <span className="text-[10px] sm:text-xs">({professional.review_count})</span>
              </div>

              {/* Location */}
              {professional.location && (
                <div className="flex items-center gap-0.5 sm:gap-1 min-w-0">
                  <MapPin className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                  <span className="truncate text-xs sm:text-sm max-w-[80px] sm:max-w-[120px]">{professional.location}</span>
                </div>
              )}

              {/* Distance */}
              {showDistance && professional.distance && (
                <div className="flex items-center gap-0.5 sm:gap-1">
                  <span className="text-xs sm:text-sm">{professional.distance.toFixed(1)} km</span>
                </div>
              )}
            </div>

            {/* Zona Today Badge */}
            {hasZonaToday && (
              <div className="mb-2">
                <ZonaTodayBadge 
                  neighborhoods={activeRoute?.neighborhoods} 
                  compact={compact}
                />
              </div>
            )}

            {/* Badges and Status - Responsive */}
            <div className="flex items-center justify-between flex-wrap gap-1.5 sm:gap-2">
              <div className="flex items-center flex-wrap gap-1 sm:gap-2">
                <Badge variant="secondary" className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5">
                  <Clock className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-0.5 sm:mr-1" />
                  <span className="hidden sm:inline">{getAvailabilityText(professional.availability)}</span>
                  <span className="sm:hidden">{professional.availability === 'available' ? 'Disp.' : professional.availability === 'busy' ? 'Ocup.' : 'N/D'}</span>
                </Badge>
                
                {professional.is_verified && (
                  <Badge className="text-[10px] sm:text-xs bg-emerald-500 text-white hover:bg-emerald-600 px-1.5 sm:px-2 py-0.5 border-0">
                    <CheckCircle className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-0.5 sm:mr-1" />
                    Verificado
                  </Badge>
                )}
              </div>

              {/* Contact Button - Responsive */}
              {(featured || !compact) && (
                <Button
                  size={featured ? "default" : "sm"}
                  onClick={handleContactClick}
                  className={`flex items-center gap-1 sm:gap-2 bg-gradient-to-r from-green-500 to-green-700 shadow-[0_4px_15px_rgba(37,211,102,0.4)] hover:shadow-[0_0_25px_rgba(37,211,102,0.7)] hover:scale-105 transition-all duration-300 h-auto ${featured ? 'text-sm px-4 py-2 rounded-xl' : 'text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-1.5'}`}
                >
                  <MessageCircle className={featured ? "h-4 w-4" : "h-3 w-3 sm:h-4 sm:w-4"} />
                  <span className={featured ? "" : "hidden sm:inline"}>WhatsApp</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};