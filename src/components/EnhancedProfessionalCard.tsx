import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star, MapPin, MessageCircle, Heart, Shield, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useFavorites } from '@/hooks/useFavorites';

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
  phone?: string;
  email: string;
  distance?: number;
}

interface EnhancedProfessionalCardProps {
  professional: Professional;
  compact?: boolean;
  showDistance?: boolean;
}

export const EnhancedProfessionalCard: React.FC<EnhancedProfessionalCardProps> = ({
  professional,
  compact = false,
  showDistance = true
}) => {
  const navigate = useNavigate();
  const { favorites, toggleFavorite, loading: favoritesLoading } = useFavorites();
  
  const isFavorite = favorites.includes(professional.id);

  const handleCardClick = () => {
    navigate(`/professional/${professional.id}`);
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite(professional.id);
  };

  const handleContactClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Open WhatsApp directly if phone is available
    if (professional.phone) {
      const cleanPhone = professional.phone.replace(/\D/g, '');
      let whatsappNumber = cleanPhone;
      if (!cleanPhone.startsWith('54')) {
        if (cleanPhone.startsWith('9') || cleanPhone.length === 10) {
          whatsappNumber = `54${cleanPhone}`;
        } else if (cleanPhone.length === 8 || cleanPhone.length === 7) {
          whatsappNumber = `5411${cleanPhone}`;
        }
      }
      const message = `Hola ${professional.full_name}! Te contacto desde Chequealo. Me interesa conocer más sobre tus servicios.`;
      const encodedText = encodeURIComponent(message);
      const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedText}`;
      window.open(whatsappUrl, '_blank');
    } else {
      // Navigate to professional profile contact section
      navigate(`/professional/${professional.id}#contact`);
    }
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
      className="group cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-1"
      onClick={handleCardClick}
    >
      <CardContent className={`p-4 ${compact ? 'pb-3' : 'pb-4'}`}>
        <div className="flex gap-4">
          {/* Avatar and Status */}
          <div className="relative flex-shrink-0">
            <Avatar className={compact ? "h-12 w-12" : "h-16 w-16"}>
              <AvatarImage src={professional.image_url} alt={professional.full_name} />
              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                {professional.full_name.split(' ').map(n => n[0]).join('').toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            {/* Online Status Indicator */}
            <div className="absolute -bottom-1 -right-1">
              <div className={`w-4 h-4 rounded-full border-2 border-background ${getAvailabilityColor(professional.availability)}`} />
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className={`font-semibold text-foreground truncate ${compact ? 'text-sm' : 'text-base'}`}>
                    {professional.full_name}
                  </h3>
                  {professional.is_verified && (
                    <Shield className="h-4 w-4 text-blue-500 flex-shrink-0" />
                  )}
                </div>
                
                <p className={`text-muted-foreground mb-2 ${compact ? 'text-xs' : 'text-sm'}`}>
                  {professional.profession}
                </p>
                
                {!compact && professional.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
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
                className="flex-shrink-0 p-2"
              >
                <Heart className={`h-4 w-4 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-muted-foreground'}`} />
              </Button>
            </div>

            {/* Info Row */}
            <div className="flex items-center gap-4 mb-3 text-sm text-muted-foreground">
              {/* Rating */}
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="font-medium text-foreground">
                  {professional.rating.toFixed(1)}
                </span>
                <span>({professional.review_count})</span>
              </div>

              {/* Location */}
              {professional.location && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span className="truncate">{professional.location}</span>
                </div>
              )}

              {/* Distance */}
              {showDistance && professional.distance && (
                <div className="flex items-center gap-1">
                  <span>{professional.distance.toFixed(1)} km</span>
                </div>
              )}
            </div>

            {/* Badges and Status */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  <Clock className="h-3 w-3 mr-1" />
                  {getAvailabilityText(professional.availability)}
                </Badge>
                
                {professional.is_verified && (
                  <Badge variant="outline" className="text-xs">
                    Verificado
                  </Badge>
                )}
              </div>

              {/* Contact Button */}
              {!compact && (
                <Button
                  size="sm"
                  onClick={handleContactClick}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                >
                  <MessageCircle className="h-4 w-4" />
                  WhatsApp
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};