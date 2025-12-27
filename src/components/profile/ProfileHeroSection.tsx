import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Star, Shield, User } from 'lucide-react';
import defaultAvatar from '@/assets/default-avatar.png';

interface Professional {
  id: string;
  full_name: string;
  profession: string;
  location?: string | null;
  image_url?: string | null;
  is_verified?: boolean;
  rating?: number | null;
  review_count?: number | null;
  availability?: string | null;
}

interface ProfileHeroSectionProps {
  professional: Professional;
}

export function ProfileHeroSection({ professional }: ProfileHeroSectionProps) {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const isAvailable = professional.availability?.toLowerCase().includes('disponible') || 
                      professional.availability?.toLowerCase().includes('abierto');

  return (
    <div className="flex flex-col items-center text-center py-6 px-4">
      {/* Avatar con badge de disponibilidad */}
      <div className="relative mb-4">
        <Avatar className="w-32 h-32 border-4 border-background shadow-lg">
          <AvatarImage 
            src={professional.image_url || defaultAvatar} 
            alt={`Foto de ${professional.full_name}`}
            className="object-cover"
          />
          <AvatarFallback className="bg-primary/10 text-primary font-bold text-4xl">
            {getInitials(professional.full_name) || <User className="h-16 w-16" />}
          </AvatarFallback>
        </Avatar>
        
        {/* Badge de disponibilidad */}
        {isAvailable && (
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2">
            <Badge className="bg-success text-success-foreground border-2 border-background px-3 py-1 text-xs font-semibold shadow-md">
              Disponible
            </Badge>
          </div>
        )}
      </div>

      {/* Nombre y verificación */}
      <div className="flex items-center gap-2 mb-1">
        <h1 className="text-2xl font-bold text-foreground">{professional.full_name}</h1>
        {professional.is_verified && (
          <Badge className="bg-success/10 text-success border-success/20 px-2">
            <Shield className="h-3 w-3 mr-1" />
            Verificado
          </Badge>
        )}
      </div>

      {/* Especialidad */}
      <p className="text-lg text-primary font-medium mb-2">
        {professional.profession}
      </p>

      {/* Rating destacado */}
      <div className="flex items-center gap-2 bg-warning/10 px-4 py-2 rounded-full">
        <Star className="w-5 h-5 text-warning fill-current" />
        <span className="text-xl font-bold text-foreground">
          {(professional.rating || 0).toFixed(1)}
        </span>
        <span className="text-sm text-muted-foreground">
          ({professional.review_count || 0} reseñas)
        </span>
      </div>
    </div>
  );
}
