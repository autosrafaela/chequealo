import React, { useRef, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star, CheckCircle, User, Camera, ImageIcon } from 'lucide-react';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
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
  professions?: Array<{ profession: string; is_primary: boolean }>;
}

interface ProfileHeroSectionProps {
  professional: Professional;
  isOwner?: boolean;
  onPhotoUpload?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function ProfileHeroSection({ professional, isOwner, onPhotoUpload }: ProfileHeroSectionProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const [showPhotoMenu, setShowPhotoMenu] = useState(false);
  const isAvailable = professional.availability?.toLowerCase().includes('disponible') || 
                      professional.availability?.toLowerCase().includes('abierto');

  const getProfessionDisplay = () => {
    if (professional.professions && professional.professions.length > 0) {
      return professional.professions
        .sort((a, b) => (a.is_primary === b.is_primary ? 0 : a.is_primary ? -1 : 1))
        .map(p => p.profession)
        .join(' • ');
    }
    return professional.profession;
  };

  return (
    <div className="flex flex-col items-center text-center py-6 px-4">
      {/* Avatar with verified badge overlay */}
      <div className="relative mb-4">
        <Avatar className="w-36 h-36 border-4 border-white shadow-xl">
          <AvatarImage 
            src={professional.image_url || defaultAvatar} 
            alt={`Foto de ${professional.full_name}`}
            className="object-cover"
          />
          <AvatarFallback className="bg-primary/10 text-primary font-bold text-4xl">
            <User className="h-16 w-16" />
          </AvatarFallback>
        </Avatar>
        
        {/* Camera upload button for owner */}
        {isOwner && onPhotoUpload && (
          <>
            <button
              onClick={() => setShowPhotoMenu(true)}
              className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-2 border-2 border-white shadow-md hover:bg-primary/90 transition-colors z-10"
              aria-label="Cambiar foto de perfil"
            >
              <Camera className="w-4 h-4" />
            </button>
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(e) => { onPhotoUpload(e); setShowPhotoMenu(false); }}
            />
            <input
              ref={galleryInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => { onPhotoUpload(e); setShowPhotoMenu(false); }}
            />
          </>
        )}

        {/* Verified badge - circular overlay */}
        {professional.is_verified && !isOwner && (
          <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white rounded-full p-1.5 border-2 border-white shadow-md">
            <CheckCircle className="w-5 h-5" />
          </div>
        )}
        {professional.is_verified && isOwner && (
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-emerald-500 text-white rounded-full p-1 border-2 border-white shadow-md">
            <CheckCircle className="w-4 h-4" />
          </div>
        )}

        {/* Availability indicator */}
        {isAvailable && (
          <div className="absolute -bottom-1 left-0">
            <span className="bg-emerald-500 text-white border-2 border-white px-2.5 py-0.5 text-xs font-semibold rounded-full shadow-sm">
              Disponible
            </span>
          </div>
        )}
      </div>

      {/* Name - bold uppercase */}
      <h1 className="text-2xl font-bold text-foreground uppercase">
        {professional.full_name}
      </h1>

      {/* Profession */}
      <p className="text-lg text-primary font-medium mb-2">
        {getProfessionDisplay()}
      </p>

      {/* Rating - subtle */}
      <div className="flex items-center gap-1.5">
        <Star className="w-4 h-4 text-amber-400 fill-current" />
        <span className="text-base font-semibold text-foreground">
          {(professional.rating || 0).toFixed(1)}
        </span>
        <span className="text-sm text-muted-foreground">
          ({professional.review_count || 0} reseñas)
        </span>
      </div>

      {/* Photo menu drawer */}
      {isOwner && onPhotoUpload && (
        <Drawer open={showPhotoMenu} onOpenChange={setShowPhotoMenu}>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Cambiar foto de perfil</DrawerTitle>
            </DrawerHeader>
            <div className="p-4 pb-8 space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start gap-3 h-12 text-base"
                onClick={() => { cameraInputRef.current?.click(); }}
              >
                <Camera className="w-5 h-5" />
                Sacar Foto
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start gap-3 h-12 text-base"
                onClick={() => { galleryInputRef.current?.click(); }}
              >
                <ImageIcon className="w-5 h-5" />
                Buscar en Galería
              </Button>
              <Button
                variant="ghost"
                className="w-full h-10 text-muted-foreground"
                onClick={() => setShowPhotoMenu(false)}
              >
                Cancelar
              </Button>
            </div>
          </DrawerContent>
        </Drawer>
      )}
    </div>
  );
}
