import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, MapPin, Heart, Clock, User, Shield, Eye, MessageCircle, Crown } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useFavorites } from "@/hooks/useFavorites";
import { useAuth } from "@/contexts/AuthContext";
import { WriteReviewModal } from "@/components/WriteReviewModal";
import { toast } from "sonner";

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
  const { user } = useAuth();
  const [isVerified, setIsVerified] = useState(verifiedProp || false);
  const [showReviewModal, setShowReviewModal] = useState(false);

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
    navigate(`/professional/${id}?contact=whatsapp`);
  };

  const isCurrentlyFavorite = isFavorite(id);

  return (
    <>
      <div className="bg-background rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 border border-border hover:border-primary/20 overflow-hidden">
        {/* Card Header */}
        <div className="p-6 pb-4">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-4">
              {/* Avatar with verified overlay */}
              <div className="relative flex-shrink-0">
                <Avatar className="w-20 h-20 ring-2 ring-primary/20">
                  <AvatarImage src={image} alt={name.toUpperCase()} />
                  <AvatarFallback className="bg-muted text-muted-foreground">
                    <User className="h-10 w-10" />
                  </AvatarFallback>
                </Avatar>
                {isVerified && (
                  <div className="absolute -top-1 -right-1 bg-emerald-500 rounded-full p-1 shadow-md border-2 border-background">
                    <Shield className="h-3 w-3 text-white" />
                  </div>
                )}
              </div>
              
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-foreground uppercase">{name}</h3>
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
              className={`p-2 ${isCurrentlyFavorite ? 'text-red-500' : 'text-muted-foreground'} hover:text-red-500`}
              title={isCurrentlyFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
            >
              <Heart className={`h-5 w-5 ${isCurrentlyFavorite ? 'fill-current' : ''}`} />
            </Button>
          </div>

          {/* Rating + Dejar Reseña */}
          <div className="flex items-center flex-wrap gap-x-2 gap-y-1 mb-3">
            <div className="flex items-center space-x-1">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  className={`h-4 w-4 ${i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-muted-foreground/30'}`} 
                />
              ))}
            </div>
            <span className="text-lg font-bold text-foreground">{rating}</span>
            <span className="text-muted-foreground text-sm">({reviewCount} opiniones)</span>
            {user && (
              <>
                <span className="text-muted-foreground">·</span>
                <button 
                  onClick={() => setShowReviewModal(true)} 
                  className="text-primary text-sm font-medium hover:underline"
                >
                  Dejar Reseña
                </button>
              </>
            )}
          </div>

          {/* Description */}
          <p className="text-muted-foreground text-sm line-clamp-2 mb-4">
            {description}
          </p>

          {/* Availability */}
          <div className="flex items-center text-emerald-600 text-sm">
            <Clock className="h-4 w-4 mr-1" />
            {availability}
          </div>
        </div>

        {/* Card Actions */}
        <div className="border-t border-border p-4">
          <div className="flex gap-2">
            <Button 
              className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl shadow-md"
              onClick={handleViewProfile}
            >
              <Eye className="h-4 w-4 mr-2" />
              Ver Perfil Profesional
            </Button>
            <Button
              size="icon"
              variant="outline"
              className="rounded-xl border-green-200 hover:bg-green-50 text-green-600"
              onClick={handleWhatsAppClick}
            >
              <MessageCircle className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Review Modal */}
      <WriteReviewModal
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        professional={{
          id,
          full_name: name,
          profession,
          image_url: image,
        }}
        onReviewSubmitted={() => {
          setShowReviewModal(false);
        }}
      />
    </>
  );
};

export default ProfessionalCard;
