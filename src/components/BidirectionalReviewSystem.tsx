import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Star, User, UserCheck, MessageSquare } from 'lucide-react';

interface BidirectionalReviewSystemProps {
  transactionId: string;
  userId: string;
  professionalId: string;
  userName: string;
  professionalName: string;
  serviceType: string;
  onReviewsUpdated?: () => void;
}

interface Review {
  id: string;
  rating: number;
  comment?: string;
  service_provided?: string;
  created_at: string;
}

interface UserRating {
  id: string;
  communication_rating: number;
  punctuality_rating: number;
  payment_rating: number;
  overall_rating: number;
  comment?: string;
  created_at: string;
}

export const BidirectionalReviewSystem: React.FC<BidirectionalReviewSystemProps> = ({
  transactionId,
  userId,
  professionalId,
  userName,
  professionalName,
  serviceType,
  onReviewsUpdated
}) => {
  const { user } = useAuth();
  const [userReview, setUserReview] = useState<Review | null>(null);
  const [professionalRating, setProfessionalRating] = useState<UserRating | null>(null);
  const [loading, setLoading] = useState(true);
  const [showUserReviewModal, setShowUserReviewModal] = useState(false);
  const [showProfessionalRatingModal, setShowProfessionalRatingModal] = useState(false);

  // User review form state
  const [userReviewForm, setUserReviewForm] = useState({
    rating: 0,
    comment: '',
    service_provided: serviceType
  });

  // Professional rating form state
  const [professionalRatingForm, setProfessionalRatingForm] = useState({
    communication_rating: 0,
    punctuality_rating: 0,
    payment_rating: 0,
    overall_rating: 0,
    comment: ''
  });

  useEffect(() => {
    loadExistingReviews();
  }, [transactionId]);

  const loadExistingReviews = async () => {
    try {
      setLoading(true);

      // Load user's review of professional
      const { data: reviewData, error: reviewError } = await supabase
        .from('reviews')
        .select('*')
        .eq('transaction_id', transactionId)
        .eq('user_id', userId)
        .eq('professional_id', professionalId)
        .maybeSingle();

      if (reviewError) throw reviewError;
      setUserReview(reviewData);

      // Load professional's rating of user
      const { data: ratingData, error: ratingError } = await supabase
        .from('user_ratings')
        .select('*')
        .eq('transaction_id', transactionId)
        .eq('user_id', userId)
        .eq('professional_id', professionalId)
        .maybeSingle();

      if (ratingError) throw ratingError;
      setProfessionalRating(ratingData);

    } catch (error) {
      console.error('Error loading reviews:', error);
      toast.error('Error al cargar las reseñas');
    } finally {
      setLoading(false);
    }
  };

  const submitUserReview = async () => {
    if (!user || userReviewForm.rating === 0) {
      toast.error('Por favor selecciona una calificación');
      return;
    }

    try {
      const { error } = await supabase
        .from('reviews')
        .insert({
          user_id: userId,
          professional_id: professionalId,
          transaction_id: transactionId,
          rating: userReviewForm.rating,
          comment: userReviewForm.comment || null,
          service_provided: userReviewForm.service_provided,
          is_transaction_verified: true
        });

      if (error) throw error;

      toast.success('Reseña enviada correctamente');
      setShowUserReviewModal(false);
      loadExistingReviews();
      onReviewsUpdated?.();
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('Error al enviar la reseña');
    }
  };

  const submitProfessionalRating = async () => {
    if (!user || professionalRatingForm.overall_rating === 0) {
      toast.error('Por favor completa la calificación general');
      return;
    }

    try {
      // Get professional record
      const { data: professional, error: profError } = await supabase
        .from('professionals')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (profError) throw profError;
      if (!professional) throw new Error('Perfil profesional no encontrado');

      const { error } = await supabase
        .from('user_ratings')
        .insert({
          professional_id: professional.id,
          user_id: userId,
          transaction_id: transactionId,
          communication_rating: professionalRatingForm.communication_rating,
          punctuality_rating: professionalRatingForm.punctuality_rating,
          payment_rating: professionalRatingForm.payment_rating,
          overall_rating: professionalRatingForm.overall_rating,
          comment: professionalRatingForm.comment || null
        });

      if (error) throw error;

      toast.success('Calificación del cliente enviada correctamente');
      setShowProfessionalRatingModal(false);
      loadExistingReviews();
      onReviewsUpdated?.();
    } catch (error) {
      console.error('Error submitting user rating:', error);
      toast.error('Error al enviar la calificación');
    }
  };

  const renderStars = (rating: number, interactive: boolean = false, onChange?: (rating: number) => void) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-5 w-5 ${
              star <= rating 
                ? 'text-yellow-400 fill-yellow-400' 
                : 'text-gray-300'
            } ${interactive ? 'cursor-pointer hover:text-yellow-400' : ''}`}
            onClick={interactive && onChange ? () => onChange(star) : undefined}
          />
        ))}
      </div>
    );
  };

  const isProfessional = user?.id !== userId; // If current user is not the client, they're the professional

  if (loading) {
    return <div className="text-center p-4">Cargando reseñas...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Sistema de Reseñas Bidireccional
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* User Review Section */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <h4 className="font-medium">Reseña del Cliente</h4>
            </div>
            
            {userReview ? (
              <div className="p-3 border rounded-lg space-y-2">
                <div className="flex items-center gap-2">
                  {renderStars(userReview.rating)}
                  <Badge variant="secondary">Completada</Badge>
                </div>
                {userReview.comment && (
                  <p className="text-sm text-muted-foreground">{userReview.comment}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  {new Date(userReview.created_at).toLocaleDateString()}
                </p>
              </div>
            ) : (
              <div className="p-3 border rounded-lg space-y-2">
                {user?.id === userId ? (
                  <Dialog open={showUserReviewModal} onOpenChange={setShowUserReviewModal}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        Calificar Profesional
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Calificar a {professionalName}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>Calificación *</Label>
                          {renderStars(userReviewForm.rating, true, (rating) => 
                            setUserReviewForm(prev => ({ ...prev, rating }))
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="service">Servicio Recibido</Label>
                          <Select
                            value={userReviewForm.service_provided}
                            onValueChange={(value) => setUserReviewForm(prev => ({ ...prev, service_provided: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value={serviceType}>{serviceType}</SelectItem>
                              <SelectItem value="Consultoría">Consultoría</SelectItem>
                              <SelectItem value="Instalación">Instalación</SelectItem>
                              <SelectItem value="Reparación">Reparación</SelectItem>
                              <SelectItem value="Mantenimiento">Mantenimiento</SelectItem>
                              <SelectItem value="Otro">Otro</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="comment">Comentario (opcional)</Label>
                          <Textarea
                            id="comment"
                            placeholder="Comparte tu experiencia..."
                            value={userReviewForm.comment}
                            onChange={(e) => setUserReviewForm(prev => ({ ...prev, comment: e.target.value }))}
                            rows={3}
                          />
                        </div>

                        <div className="flex justify-end space-x-2">
                          <Button variant="outline" onClick={() => setShowUserReviewModal(false)}>
                            Cancelar
                          </Button>
                          <Button onClick={submitUserReview}>
                            Enviar Reseña
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                ) : (
                  <p className="text-sm text-muted-foreground">Esperando reseña del cliente</p>
                )}
              </div>
            )}
          </div>

          {/* Professional Rating Section */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <UserCheck className="h-4 w-4" />
              <h4 className="font-medium">Calificación del Profesional</h4>
            </div>
            
            {professionalRating ? (
              <div className="p-3 border rounded-lg space-y-2">
                <div className="flex items-center gap-2">
                  {renderStars(professionalRating.overall_rating)}
                  <Badge variant="secondary">Completada</Badge>
                </div>
                <div className="text-xs space-y-1">
                  <div>Comunicación: {renderStars(professionalRating.communication_rating)}</div>
                  <div>Puntualidad: {renderStars(professionalRating.punctuality_rating)}</div>
                  <div>Pago: {renderStars(professionalRating.payment_rating)}</div>
                </div>
                {professionalRating.comment && (
                  <p className="text-sm text-muted-foreground">{professionalRating.comment}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  {new Date(professionalRating.created_at).toLocaleDateString()}
                </p>
              </div>
            ) : (
              <div className="p-3 border rounded-lg space-y-2">
                {isProfessional ? (
                  <Dialog open={showProfessionalRatingModal} onOpenChange={setShowProfessionalRatingModal}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        Calificar Cliente
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Calificar a {userName}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-3">
                          <div className="space-y-2">
                            <Label>Comunicación</Label>
                            {renderStars(professionalRatingForm.communication_rating, true, (rating) => 
                              setProfessionalRatingForm(prev => ({ ...prev, communication_rating: rating }))
                            )}
                          </div>

                          <div className="space-y-2">
                            <Label>Puntualidad</Label>
                            {renderStars(professionalRatingForm.punctuality_rating, true, (rating) => 
                              setProfessionalRatingForm(prev => ({ ...prev, punctuality_rating: rating }))
                            )}
                          </div>

                          <div className="space-y-2">
                            <Label>Pago</Label>
                            {renderStars(professionalRatingForm.payment_rating, true, (rating) => 
                              setProfessionalRatingForm(prev => ({ ...prev, payment_rating: rating }))
                            )}
                          </div>

                          <div className="space-y-2">
                            <Label>Calificación General *</Label>
                            {renderStars(professionalRatingForm.overall_rating, true, (rating) => 
                              setProfessionalRatingForm(prev => ({ ...prev, overall_rating: rating }))
                            )}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="comment">Comentario (opcional)</Label>
                          <Textarea
                            id="comment"
                            placeholder="Comparte tu experiencia con este cliente..."
                            value={professionalRatingForm.comment}
                            onChange={(e) => setProfessionalRatingForm(prev => ({ ...prev, comment: e.target.value }))}
                            rows={3}
                          />
                        </div>

                        <div className="flex justify-end space-x-2">
                          <Button variant="outline" onClick={() => setShowProfessionalRatingModal(false)}>
                            Cancelar
                          </Button>
                          <Button onClick={submitProfessionalRating}>
                            Enviar Calificación
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                ) : (
                  <p className="text-sm text-muted-foreground">Esperando calificación del profesional</p>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};