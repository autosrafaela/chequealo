import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Star, User, MessageCircle, Clock, DollarSign } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

interface UserRatingModalProps {
  transactionId: string;
  userId: string;
  userName: string;
  onRatingSubmitted: () => void;
}

export const UserRatingModal = ({ 
  transactionId, 
  userId, 
  userName, 
  onRatingSubmitted 
}: UserRatingModalProps) => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [ratings, setRatings] = useState({
    communication: 0,
    punctuality: 0,
    payment: 0,
    overall: 0
  });
  const [comment, setComment] = useState('');

  const handleRatingChange = (category: keyof typeof ratings, rating: number) => {
    setRatings(prev => ({ ...prev, [category]: rating }));
  };

  const handleSubmit = async () => {
    if (!user) {
      toast.error('Debes estar autenticado para calificar');
      return;
    }

    if (Object.values(ratings).some(rating => rating === 0)) {
      toast.error('Por favor completa todas las calificaciones');
      return;
    }

    setLoading(true);

    try {
      // Get professional ID
      const { data: professional, error: profError } = await supabase
        .from('professionals')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (profError) throw profError;
      if (!professional) {
        toast.error('No se encontró el perfil profesional');
        return;
      }

      const { error } = await supabase
        .from('user_ratings')
        .insert({
          professional_id: professional.id,
          user_id: userId,
          transaction_id: transactionId,
          communication_rating: ratings.communication,
          punctuality_rating: ratings.punctuality,
          payment_rating: ratings.payment,
          overall_rating: ratings.overall,
          comment: comment || null
        });

      if (error) throw error;

      toast.success('Calificación enviada exitosamente');
      setOpen(false);
      onRatingSubmitted();
      
      // Reset form
      setRatings({ communication: 0, punctuality: 0, payment: 0, overall: 0 });
      setComment('');
    } catch (error) {
      console.error('Error submitting rating:', error);
      toast.error('Error al enviar la calificación');
    } finally {
      setLoading(false);
    }
  };

  const StarRating = ({ 
    rating, 
    onRatingChange, 
    label, 
    icon: Icon 
  }: { 
    rating: number; 
    onRatingChange: (rating: number) => void; 
    label: string; 
    icon: any; 
  }) => (
    <div className="space-y-2">
      <Label className="flex items-center gap-2">
        <Icon className="h-4 w-4" />
        {label}
      </Label>
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onRatingChange(star)}
            className="focus:outline-none"
          >
            <Star
              className={`h-6 w-6 ${
                star <= rating 
                  ? 'text-yellow-400 fill-current' 
                  : 'text-gray-300'
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Star className="h-4 w-4 mr-2" />
          Calificar Cliente
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Calificar a {userName}</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Tu calificación ayudará a otros profesionales a conocer mejor a este cliente
          </p>
        </DialogHeader>

        <div className="space-y-6">
          <StarRating
            rating={ratings.communication}
            onRatingChange={(rating) => handleRatingChange('communication', rating)}
            label="Comunicación"
            icon={MessageCircle}
          />

          <StarRating
            rating={ratings.punctuality}
            onRatingChange={(rating) => handleRatingChange('punctuality', rating)}
            label="Puntualidad"
            icon={Clock}
          />

          <StarRating
            rating={ratings.payment}
            onRatingChange={(rating) => handleRatingChange('payment', rating)}
            label="Pago"
            icon={DollarSign}
          />

          <StarRating
            rating={ratings.overall}
            onRatingChange={(rating) => handleRatingChange('overall', rating)}
            label="Calificación General"
            icon={User}
          />

          <div className="space-y-2">
            <Label htmlFor="comment">Comentario (opcional)</Label>
            <Textarea
              id="comment"
              placeholder="Comparte tu experiencia trabajando con este cliente..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? 'Enviando...' : 'Enviar Calificación'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};