import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, MapPin, Heart, MessageCircle, Clock, User, Shield } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface ProfessionalCardProps {
  id: string;
  name: string;
  profession: string;
  location: string;
  rating: number;
  reviewCount: number;
  description: string;
  verified?: boolean;
  availability: string;
  image?: string;
  onToggleFavorite?: (id: string) => void;
  isFavorite?: boolean;
}

const ProfessionalCard = ({
  id,
  name,
  profession,
  location,
  rating,
  reviewCount,
  description,
  verified: verifiedProp,
  availability,
  image,
  onToggleFavorite,
  isFavorite: propIsFavorite = false
}: ProfessionalCardProps) => {
  const [isFavorite, setIsFavorite] = useState(propIsFavorite);
  const [isVerified, setIsVerified] = useState(verifiedProp || false);

  useEffect(() => {
    // Check if professional is verified in database
    const checkVerification = async () => {
      try {
        const { data, error } = await supabase
          .from('professionals')
          .select('is_verified')
          .eq('user_id', id)
          .maybeSingle();

        if (!error && data) {
          setIsVerified(data.is_verified);
        }
      } catch (error) {
        console.error('Error checking verification:', error);
      }
    };

    checkVerification();
  }, [id]);

  const handleToggleFavorite = () => {
    const newFavoriteState = !isFavorite;
    setIsFavorite(newFavoriteState);
    onToggleFavorite?.(id);
  };

  // Function to get initials from name
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 hover:border-primary/20 overflow-hidden">
      {/* Card Header */}
      <div className="p-6 pb-4">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-4">
            {/* Avatar */}
            <Avatar className="w-16 h-16">
              <AvatarImage src={image} alt={`Foto de ${name}`} />
              <AvatarFallback className="bg-primary/10 text-primary font-semibold text-lg">
                {getInitials(name) || <User className="h-8 w-8" />}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-semibold text-foreground">{name}</h3>
                {isVerified && (
                  <div className="bg-emerald-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1 shadow-sm">
                    <Shield className="h-3 w-3" />
                    Verificado
                  </div>
                )}
              </div>
              <p className="text-primary font-medium">{profession}</p>
              <div className="flex items-center text-muted-foreground text-sm mt-1">
                <MapPin className="h-4 w-4 mr-1" />
                {location}
              </div>
            </div>
          </div>

          {/* Favorite Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleToggleFavorite}
            className={`p-2 ${isFavorite ? 'text-red-500' : 'text-gray-400'} hover:text-red-500`}
            title={isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
          >
            <Heart className={`h-5 w-5 ${isFavorite ? 'fill-current' : ''}`} />
          </Button>
        </div>

        {/* Rating */}
        <div className="flex items-center space-x-2 mb-3">
          <div className="flex items-center space-x-1">
            {[...Array(5)].map((_, i) => (
              <Star 
                key={i} 
                className={`h-4 w-4 ${i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
              />
            ))}
          </div>
          <span className="text-lg font-bold">{rating}</span>
          <span className="text-muted-foreground text-sm">({reviewCount} opiniones)</span>
        </div>

        {/* Description */}
        <p className="text-muted-foreground text-sm line-clamp-2 mb-4">
          {description}
        </p>

        {/* Availability */}
        <div className="flex items-center text-success text-sm mb-4">
          <Clock className="h-4 w-4 mr-1" />
          {availability}
        </div>
      </div>

      {/* Card Actions */}
      <div className="border-t border-gray-100 p-4 bg-gray-50/50">
        <div className="flex space-x-2">
          <Button variant="outline" className="flex-1 text-sm">
            <MessageCircle className="h-4 w-4 mr-1" />
            Contactar
          </Button>
          <Button className="flex-1 bg-primary hover:bg-primary/90 text-sm">
            Pedir Presupuesto
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProfessionalCard;