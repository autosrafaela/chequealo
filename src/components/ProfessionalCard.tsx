import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, MapPin, Heart, Clock, User, Shield, Eye, MessageCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useFavorites } from "@/hooks/useFavorites";
import { ContactRequestDialog } from "@/components/ContactRequestDialog";

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
}: ProfessionalCardProps) => {
  const navigate = useNavigate();
  const { toggleFavorite, isFavorite } = useFavorites();
  const [isVerified, setIsVerified] = useState(verifiedProp || false);

  useEffect(() => {
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!isUUID.test(id)) {
      setIsVerified(verifiedProp || false);
      return;
    }

    const checkVerification = async () => {
      try {
        const { data, error } = await supabase
          .from('professionals_public')
          .select('is_verified')
          .eq('id', id)
          .maybeSingle();

        if (!error && data) {
          setIsVerified(data.is_verified);
        } else {
          setIsVerified(verifiedProp || false);
        }
      } catch (error) {
        console.error('Error checking verification:', error);
      }
    };

    checkVerification();
  }, [id, verifiedProp]);

  const handleToggleFavorite = () => {
    toggleFavorite(id);
  };

  const handleViewProfile = () => {
    navigate(`/professional/${id}`);
  };

  const handleWhatsAppClick = () => {
    // Navigate to profile with contact section focus
    navigate(`/professional/${id}?contact=whatsapp`);
  };

  const isCurrentlyFavorite = isFavorite(id);

  return (
    <div className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 hover:border-primary/20 overflow-hidden">
      {/* Card Header */}
      <div className="p-6 pb-4">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-4">
            {/* Avatar */}
            <Avatar className="w-16 h-16">
              <AvatarImage src={image} alt={name.toUpperCase()} />
              <AvatarFallback className="bg-muted text-muted-foreground">
                <User className="h-8 w-8" />
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-semibold text-foreground uppercase">{name}</h3>
                {isVerified && (
                  <div className="bg-emerald-500 rounded-full p-0.5 flex-shrink-0">
                    <Shield className="h-3.5 w-3.5 text-white" />
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
            className={`p-2 ${isCurrentlyFavorite ? 'text-red-500' : 'text-gray-400'} hover:text-red-500`}
            title={isCurrentlyFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
          >
            <Heart className={`h-5 w-5 ${isCurrentlyFavorite ? 'fill-current' : ''}`} />
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
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center text-success text-sm">
            <Clock className="h-4 w-4 mr-1" />
            {availability}
          </div>
          
          {isVerified && (
            <div className="bg-emerald-500 text-white text-xs px-3 py-1 rounded-full font-medium">
              ✓ Verificado
            </div>
          )}
        </div>
      </div>

      {/* Card Actions */}
      <div className="border-t border-gray-100 p-4 bg-gray-50/50">
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            className="flex-1 text-sm"
            onClick={handleViewProfile}
          >
            <Eye className="h-4 w-4 mr-1" />
            Ver Perfil
          </Button>
          <Button
            className="bg-green-600 hover:bg-green-700 text-white text-sm px-3"
            onClick={handleWhatsAppClick}
          >
            <MessageCircle className="h-4 w-4 mr-1" />
            WhatsApp
          </Button>
          <ContactRequestDialog 
            professionalId={id}
            professionalName={name}
            type="quote"
          />
        </div>
      </div>
    </div>
  );
};

export default ProfessionalCard;
