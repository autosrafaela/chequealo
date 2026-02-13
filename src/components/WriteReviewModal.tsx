import React, { useState, useRef } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Star, Camera, X } from 'lucide-react';

interface WriteReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  professional: {
    id: string;
    full_name: string;
    profession: string;
    category?: string;
    image_url?: string;
  };
  transactionId?: string;
  serviceType?: string;
  onReviewSubmitted: () => void;
}

const RATING_LABELS: Record<number, string> = {
  1: 'Muy malo',
  2: 'Malo',
  3: 'Regular',
  4: 'Muy bueno',
  5: 'Excelente'
};

export const WriteReviewModal: React.FC<WriteReviewModalProps> = ({
  isOpen,
  onClose,
  professional,
  transactionId,
  serviceType,
  onReviewSubmitted
}) => {
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const displayRating = hoverRating || rating;
  const isCommentValid = comment.trim().length >= 10;

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const remainingSlots = 3 - photos.length;
    const newFiles = files.slice(0, remainingSlots);

    if (files.length > remainingSlots) {
      toast.info(`Solo puedes agregar ${remainingSlots} foto(s) más`);
    }

    // Create previews
    newFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotoPreviews(prev => [...prev, e.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });

    setPhotos(prev => [...prev, ...newFiles]);
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
    setPhotoPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!user) {
      toast.error('Debes iniciar sesión');
      return;
    }

    if (rating === 0) {
      toast.error('Por favor selecciona una calificación');
      return;
    }

    if (comment.trim() && comment.trim().length < 10) {
      toast.error('El comentario debe tener al menos 10 caracteres');
      return;
    }

    setIsSubmitting(true);

    try {
      // Upload photos if any
      const photoUrls: string[] = [];
      
      for (const photo of photos) {
        const fileExt = photo.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('work-photos')
          .upload(fileName, photo);

        if (uploadError) {
          console.error('Error uploading photo:', uploadError);
          continue;
        }

        const { data: urlData } = supabase.storage
          .from('work-photos')
          .getPublicUrl(fileName);

        if (urlData?.publicUrl) {
          photoUrls.push(urlData.publicUrl);
        }
      }

      // Insert review
      const { error } = await supabase
        .from('reviews')
        .insert({
          user_id: user.id,
          professional_id: professional.id,
          transaction_id: transactionId || null,
          rating,
          comment: comment.trim() || null,
          service_provided: serviceType || null,
          is_transaction_verified: !!transactionId
        });

      if (error) throw error;

      toast.success('¡Gracias por tu opinión! Ayudas a la comunidad de Rafaela');
      onReviewSubmitted();
      handleClose();
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('Error al publicar la reseña');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setRating(0);
    setHoverRating(0);
    setComment('');
    setPhotos([]);
    setPhotoPreviews([]);
    onClose();
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="p-0 gap-0 max-w-md overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <button 
            onClick={handleClose}
            className="text-primary font-medium text-sm hover:underline"
          >
            Cancelar
          </button>
          <span className="font-semibold text-foreground">Escribir Reseña</span>
          <div className="w-16" />
        </div>

        <div className="p-4 space-y-6">
          {/* Professional Card */}
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={professional.image_url} alt={professional.full_name} />
              <AvatarFallback className="bg-primary/10 text-primary font-medium">
                {getInitials(professional.full_name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-medium text-foreground">{professional.full_name}</h3>
              <p className="text-sm text-muted-foreground">
                {professional.profession}
                {professional.category && ` • ${professional.category}`}
              </p>
            </div>
          </div>

          {/* Rating Section */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Califica tu experiencia
            </label>
            <div className="flex flex-col items-center gap-2 py-2">
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className="p-1 transition-transform hover:scale-110"
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(star)}
                  >
                    <Star
                      className={`h-8 w-8 transition-colors ${
                        star <= displayRating
                          ? 'text-yellow-400 fill-yellow-400'
                          : 'text-muted-foreground/30'
                      }`}
                    />
                  </button>
                ))}
              </div>
              {displayRating > 0 && (
                <span className="text-sm font-medium text-muted-foreground">
                  {RATING_LABELS[displayRating]}
                </span>
              )}
            </div>
          </div>

          {/* Comment Section */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Tu opinión
            </label>
            <Textarea
              placeholder="¿Qué te pareció el servicio? ¿Fue puntual? ¿Lo recomendarías? Cuéntanos más detalles..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              className="resize-none"
            />
            <p className={`text-xs ${comment.length > 0 && !isCommentValid ? 'text-destructive' : 'text-muted-foreground'}`}>
              {comment.length > 0 ? `${comment.length} caracteres` : 'Mínimo 10 caracteres'}
            </p>
          </div>

          {/* Photo Upload Section */}
          <div className="space-y-3">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handlePhotoSelect}
            />
            
            {/* Photo Previews */}
            {photoPreviews.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                {photoPreviews.map((preview, index) => (
                  <div key={index} className="relative">
                    <img
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      className="w-20 h-20 object-cover rounded-lg border"
                    />
                    <button
                      type="button"
                      onClick={() => removePhoto(index)}
                      className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-0.5"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {photos.length < 3 && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <Camera className="h-5 w-5" />
                <div className="text-left">
                  <span className="block font-medium">Agregar fotos</span>
                  <span className="text-xs">Opcional. Máximo 3 fotos.</span>
                </div>
              </button>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <div className="p-4 border-t">
          <Button
            className="w-full"
            onClick={handleSubmit}
            disabled={rating === 0 || isSubmitting || (comment.length > 0 && !isCommentValid)}
          >
            {isSubmitting ? 'Publicando...' : 'Publicar Reseña'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
