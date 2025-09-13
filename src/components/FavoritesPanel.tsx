import { useState, useEffect } from "react";
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

interface FavoriteProfessional {
  id: string;
  name: string;
  profession: string;
  location: string;
  rating: number;
  reviewCount: number;
  verified: boolean;
  phone?: string;
  email?: string;
  addedDate: string;
}

interface FavoritesPanelProps {
  favorites: FavoriteProfessional[];
  onRemoveFavorite: (id: string) => void;
}

const FavoritesPanel = ({ favorites = [], onRemoveFavorite }: FavoritesPanelProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  // Mock data for demonstration
  const mockFavorites: FavoriteProfessional[] = [
    {
      id: '1',
      name: 'Ana Rodríguez',
      profession: 'Contadora Pública',
      location: 'Rafaela, Santa Fe',
      rating: 4.8,
      reviewCount: 15,
      verified: true,
      phone: '+54 3492 123456',
      email: 'ana.rodriguez@email.com',
      addedDate: 'Hace 2 días'
    },
    {
      id: '3',
      name: 'Laura Gómez',
      profession: 'Electricista Domiciliaria',
      location: 'Rafaela, Santa Fe',
      rating: 5.0,
      reviewCount: 12,
      verified: true,
      phone: '+54 3492 789012',
      addedDate: 'Hace 1 semana'
    },
    {
      id: '5',
      name: 'María López',
      profession: 'Abogada',
      location: 'Rafaela, Santa Fe',
      rating: 4.7,
      reviewCount: 18,
      verified: true,
      phone: '+54 3492 345678',
      addedDate: 'Hace 2 semanas'
    }
  ];

  const handleViewProfile = (professionalId: string) => {
    navigate(`/professional/${professionalId}`);
    setIsOpen(false);
  };

  const handleEmailContact = (email: string, name: string) => {
    const subject = encodeURIComponent(`Contacto desde TodoAca.ar - ${name}`);
    const body = encodeURIComponent(`Hola ${name}! Te contacto desde TodoAca.ar. Me interesa conocer más sobre tus servicios.`);
    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
  };

  const favoritesToShow = favorites.length > 0 ? favorites : mockFavorites;

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
                      <h3 className="font-semibold text-gray-900">{professional.name}</h3>
                      {professional.verified && (
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
                        <span className="text-xs text-gray-500">({professional.reviewCount})</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 mb-3">
                      {professional.phone && (
                        <div className="flex-1" onClick={(e) => e.stopPropagation()}>
                          <WhatsAppContactButton 
                            phone={professional.phone}
                            professionalName={professional.name}
                          />
                        </div>
                      )}
                      {professional.email && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 px-2"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEmailContact(professional.email!, professional.name);
                          }}
                        >
                          <Mail className="h-3 w-3 mr-1" />
                          <span className="text-xs">Email</span>
                        </Button>
                      )}
                    </div>

                    <p className="text-xs text-gray-400">Guardado {professional.addedDate}</p>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveFavorite(professional.id);
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