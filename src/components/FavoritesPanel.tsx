import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Heart, X, MapPin, Star, Mail } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { WhatsAppContactButton } from "@/components/WhatsAppContactButton";
import { supabase } from "@/integrations/supabase/client";
import { useFavorites } from "@/hooks/useFavorites";
import { useAuth } from "@/contexts/AuthContext";
import { useProfessionalContact } from "@/hooks/useProfessionalContact";

interface FavoriteProfessional {
  id: string;
  full_name: string;
  profession: string;
  location: string;
  rating: number;
  review_count: number;
  is_verified: boolean;
  created_at: string;
}

interface FavoritesPanelProps {
  favorites?: FavoriteProfessional[];
  onRemoveFavorite?: (id: string) => void;
}

const FavoritesPanel = ({ favorites: propFavorites = [], onRemoveFavorite: propOnRemoveFavorite }: FavoritesPanelProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [realFavorites, setRealFavorites] = useState<FavoriteProfessional[]>([]);
  const [loading, setLoading] = useState(false);
  const [contactInfos, setContactInfos] = useState<{ [key: string]: { phone: string | null; email: string | null } }>({});
  const navigate = useNavigate();
  const { user } = useAuth();
  const { favorites: favoriteIds, toggleFavorite } = useFavorites();
  const { getContactInfo } = useProfessionalContact();

  const fetchFavoriteDetails = useCallback(async () => {
    if (favoriteIds.length === 0) {
      setRealFavorites([]);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('professionals_public')
        .select('*')
        .in('id', favoriteIds);

      if (error) throw error;
      setRealFavorites(data || []);

      // Get contact info for each favorite
      const contacts: { [key: string]: { phone: string | null; email: string | null } } = {};
      if (data) {
        for (const professional of data) {
          const contactInfo = await getContactInfo(professional.id);
          if (contactInfo) {
            contacts[professional.id] = contactInfo;
          }
        }
      }
      setContactInfos(contacts);
    } catch (error) {
      console.error('Error fetching favorite details:', error);
      setRealFavorites([]);
    } finally {
      setLoading(false);
    }
  }, [favoriteIds, getContactInfo]);

  useEffect(() => {
    if (favoriteIds.length > 0 && user) {
      fetchFavoriteDetails();
    } else {
      setRealFavorites([]);
      setContactInfos({});
    }
  }, [favoriteIds, user, fetchFavoriteDetails]);

  const handleRemoveFavorite = async (professionalId: string) => {
    try {
      await toggleFavorite(professionalId);
    } catch (error) {
      console.error('Error removing favorite:', error);
    }
  };

  const handleViewProfile = (professionalId: string) => {
    navigate(`/professional/${professionalId}`);
    setIsOpen(false);
  };

  const handleEmailContact = (email: string, name: string) => {
    const subject = encodeURIComponent(`Contacto desde Chequealo - ${name}`);
    const body = encodeURIComponent(`Hola ${name}! Te contacto desde Chequealo. Me interesa conocer más sobre tus servicios.`);
    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Hoy';
    if (diffInDays === 1) return 'Ayer';
    if (diffInDays < 7) return `Hace ${diffInDays} días`;
    if (diffInDays < 30) return `Hace ${Math.floor(diffInDays / 7)} semanas`;
    return `Hace ${Math.floor(diffInDays / 30)} meses`;
  };

  const favoritesToShow = user ? realFavorites : [];

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="text-gray-700 hover:text-red-600 hover:bg-red-50 w-full justify-start bg-white">
          <Heart className="h-4 w-4 mr-2 text-red-500" />
          <span className="font-medium">Favoritos ({favoritesToShow.length})</span>
        </Button>
      </SheetTrigger>
      
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Mis Favoritos</SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          {favoritesToShow.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Heart className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No tienes profesionales guardados</p>
              <p className="text-sm mt-2">Guarda tus profesionales favoritos para acceder rápidamente</p>
            </div>
          ) : (
            favoritesToShow.map((professional) => (
              <div
                key={professional.id}
                className="p-4 rounded-lg border bg-white hover:bg-gray-50 transition-all cursor-pointer hover:shadow-md"
                onClick={() => handleViewProfile(professional.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="font-semibold text-gray-900">{professional.full_name}</h3>
                      {professional.is_verified && (
                        <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                          ✓ Verificado
                        </Badge>
                      )}
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-2">{professional.profession}</p>
                    
                    <div className="flex items-center space-x-4 mb-2">
                      <div className="flex items-center space-x-1">
                        <MapPin className="h-3 w-3 text-gray-400" />
                        <span className="text-xs text-gray-500">{professional.location}</span>
                      </div>
                      
                      <div className="flex items-center space-x-1">
                        <Star className="h-3 w-3 text-yellow-400 fill-current" />
                        <span className="text-xs font-medium">{professional.rating}</span>
                        <span className="text-xs text-gray-500">({professional.review_count})</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 mb-3">
                      {contactInfos[professional.id]?.phone && (
                        <div className="flex-1" onClick={(e) => e.stopPropagation()}>
                          <WhatsAppContactButton 
                            phone={contactInfos[professional.id].phone || undefined}
                            professionalName={professional.full_name}
                          />
                        </div>
                      )}
                      {contactInfos[professional.id]?.email && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 px-2"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEmailContact(contactInfos[professional.id].email!, professional.full_name);
                          }}
                        >
                          <Mail className="h-3 w-3 mr-1" />
                          <span className="text-xs">Email</span>
                        </Button>
                      )}
                    </div>

                    <p className="text-xs text-gray-400">Guardado {formatDate(professional.created_at)}</p>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveFavorite(professional.id);
                    }}
                    className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>

        {favoritesToShow.length > 0 && (
          <div className="mt-6 pt-4 border-t">
            <Button variant="outline" className="w-full">
              Ver todos los favoritos
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default FavoritesPanel;