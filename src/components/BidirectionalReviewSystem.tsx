import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { PlanRestrictionsAlert } from './PlanRestrictionsAlert';
import { usePlanRestrictions } from '@/hooks/usePlanRestrictions';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { 
  Star, 
  MessageCircle, 
  User, 
  Calendar as CalendarIcon,
  TrendingUp,
  Award,
  Target,
  Clock
} from "lucide-react";

interface Review {
  id: string;
  rating: number;
  comment: string;
  created_at: string;
  user_id: string;
  professional_id: string;
  service_provided: string;
  profiles?: {
    full_name: string;
  };
}

interface UserRating {
  id: string;
  overall_rating: number;
  communication_rating: number;
  punctuality_rating: number;
  payment_rating: number;
  comment: string;
  created_at: string;
  user_id: string;
  professional_id: string;
  transaction_id: string;
  profiles?: {
    full_name: string;
  };
}

interface Transaction {
  id: string;
  user_id: string;
  professional_id: string;
  status: string;
  service_type: string;
  completed_at: string;
  profiles?: {
    full_name: string;
  };
}

export const BidirectionalReviewSystem = () => {
  const { user } = useAuth();
  const { planLimits } = usePlanRestrictions();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [userRatings, setUserRatings] = useState<UserRating[]>([]);
  const [completedTransactions, setCompletedTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [professionalId, setProfessionalId] = useState<string | null>(null);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [showRatingDialog, setShowRatingDialog] = useState(false);
  
  const [newUserRating, setNewUserRating] = useState({
    overall_rating: 5,
    communication_rating: 5,
    punctuality_rating: 5,
    payment_rating: 5,
    comment: ''
  });

  useEffect(() => {
    fetchProfessionalData();
  }, [user]);

  useEffect(() => {
    if (professionalId) {
      fetchReviewsAndRatings();
      fetchCompletedTransactions();
    }
  }, [professionalId]);

  const fetchProfessionalData = async () => {
    if (!user) return;

    try {
      const { data: professional } = await supabase
        .from('professionals')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (professional) {
        setProfessionalId(professional.id);
      }
    } catch (error) {
      console.error('Error fetching professional data:', error);
    }
  };

  const fetchReviewsAndRatings = async () => {
    if (!professionalId) return;

    try {
      setLoading(true);

      // Fetch reviews received by the professional
      const { data: reviewsData } = await supabase
        .from('reviews')
        .select('*')
        .eq('professional_id', professionalId)
        .order('created_at', { ascending: false });

      // Fetch user ratings given by the professional
      const { data: ratingsData } = await supabase
        .from('user_ratings')
        .select('*')
        .eq('professional_id', professionalId)
        .order('created_at', { ascending: false });

      setReviews(reviewsData || []);
      setUserRatings(ratingsData || []);
    } catch (error) {
      console.error('Error fetching reviews and ratings:', error);
      toast.error('Error al cargar reseñas y calificaciones');
    } finally {
      setLoading(false);
    }
  };

  const fetchCompletedTransactions = async () => {
    if (!professionalId) return;

    try {
      // Fetch completed transactions without user ratings
      const { data: transactionsData } = await supabase
        .from('transactions')
        .select('*')
        .eq('professional_id', professionalId)
        .eq('status', 'completed')
        .order('completed_at', { ascending: false });

      if (transactionsData) {
        // Filter out transactions that already have user ratings
        const ratedTransactionIds = userRatings.map(r => r.transaction_id);
        const unratedTransactions = transactionsData.filter(
          t => !ratedTransactionIds.includes(t.id)
        );
        setCompletedTransactions(unratedTransactions);
      }
    } catch (error) {
      console.error('Error fetching completed transactions:', error);
    }
  };

  const handleSubmitUserRating = async () => {
    if (!selectedTransaction || !professionalId) return;

    // Check plan restrictions
    if (!planLimits.canRateUsers) {
      toast.error('Tu plan actual no permite calificar clientes. Actualiza tu plan.');
      return;
    }

    if (!planLimits.advancedAnalytics && userRatings.length >= 10) {
      toast.error('Tu plan actual solo permite 10 calificaciones de clientes. Actualiza tu plan.');
      return;
    }

    try {
      const { error } = await supabase
        .from('user_ratings')
        .insert({
          ...newUserRating,
          user_id: selectedTransaction.user_id,
          professional_id: professionalId,
          transaction_id: selectedTransaction.id
        });

      if (error) throw error;

      toast.success('Calificación enviada exitosamente');
      setShowRatingDialog(false);
      setSelectedTransaction(null);
      fetchReviewsAndRatings();
      fetchCompletedTransactions();
      
      // Reset form
      setNewUserRating({
        overall_rating: 5,
        communication_rating: 5,
        punctuality_rating: 5,
        payment_rating: 5,
        comment: ''
      });
    } catch (error) {
      console.error('Error submitting user rating:', error);
      toast.error('Error al enviar calificación');
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const renderStarSelector = (value: number, onChange: (value: number) => void) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className="focus:outline-none"
          >
            <Star
              className={`w-5 h-5 transition-colors ${
                star <= value ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300 hover:text-yellow-200'
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Cargando sistema de calificaciones...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5" />
            Sistema de Calificaciones Bidireccional
          </CardTitle>
          <CardDescription>
            Gestiona las reseñas que recibes y califica a tus clientes
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!planLimits.canRateUsers && (
            <PlanRestrictionsAlert 
              featureType="bidirectional_reviews"
              currentUsage={userRatings.length}
            />
          )}

          <Tabs defaultValue="received-reviews" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="received-reviews">Reseñas Recibidas</TabsTrigger>
              <TabsTrigger value="given-ratings">Calificaciones Dadas</TabsTrigger>
              <TabsTrigger value="pending-ratings">Pendientes</TabsTrigger>
            </TabsList>

            <TabsContent value="received-reviews" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Reseñas de Clientes ({reviews.length})</h3>
                <Badge variant="outline">
                  <Star className="w-4 h-4 mr-1" />
                  {reviews.length > 0 ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1) : '0.0'}
                </Badge>
              </div>

              {reviews.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Aún no tienes reseñas de clientes
                </div>
              ) : (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <Card key={review.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4" />
                              <span className="font-medium">{review.profiles?.full_name || 'Cliente'}</span>
                              {renderStars(review.rating)}
                            </div>
                            {review.service_provided && (
                              <Badge variant="secondary">{review.service_provided}</Badge>
                            )}
                            <p className="text-sm text-muted-foreground">{review.comment}</p>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {format(new Date(review.created_at), 'dd/MM/yyyy', { locale: es })}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="given-ratings" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Calificaciones Dadas ({userRatings.length})</h3>
                {!planLimits.advancedAnalytics && (
                  <Badge variant="outline">Máximo: 10</Badge>
                )}
              </div>

              {userRatings.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Aún no has calificado a ningún cliente
                </div>
              ) : (
                <div className="space-y-4">
                  {userRatings.map((rating) => (
                    <Card key={rating.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="space-y-3">
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4" />
                              <span className="font-medium">{rating.profiles?.full_name || 'Cliente'}</span>
                            </div>
                            
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div className="flex items-center gap-2">
                                <TrendingUp className="w-4 h-4" />
                                <span>General:</span>
                                {renderStars(rating.overall_rating)}
                              </div>
                              <div className="flex items-center gap-2">
                                <MessageCircle className="w-4 h-4" />
                                <span>Comunicación:</span>
                                {renderStars(rating.communication_rating)}
                              </div>
                              <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4" />
                                <span>Puntualidad:</span>
                                {renderStars(rating.punctuality_rating)}
                              </div>
                              <div className="flex items-center gap-2">
                                <Target className="w-4 h-4" />
                                <span>Pago:</span>
                                {renderStars(rating.payment_rating)}
                              </div>
                            </div>
                            
                            {rating.comment && (
                              <p className="text-sm text-muted-foreground">{rating.comment}</p>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {format(new Date(rating.created_at), 'dd/MM/yyyy', { locale: es })}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="pending-ratings" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Transacciones Completadas Pendientes de Calificar</h3>
                <Badge variant="outline">{completedTransactions.length} pendientes</Badge>
              </div>

              {completedTransactions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No tienes transacciones pendientes de calificar
                </div>
              ) : (
                <div className="space-y-4">
                  {completedTransactions.map((transaction) => (
                    <Card key={transaction.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4" />
                              <span className="font-medium">{transaction.profiles?.full_name || 'Cliente'}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <CalendarIcon className="w-4 h-4" />
                              <span>Completado: {format(new Date(transaction.completed_at), 'dd/MM/yyyy', { locale: es })}</span>
                            </div>
                            {transaction.service_type && (
                              <Badge variant="secondary">{transaction.service_type}</Badge>
                            )}
                          </div>
                          <Dialog open={showRatingDialog && selectedTransaction?.id === transaction.id} onOpenChange={setShowRatingDialog}>
                            <DialogTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => setSelectedTransaction(transaction)}
                                disabled={!planLimits.canRateUsers || (!planLimits.advancedAnalytics && userRatings.length >= 10)}
                              >
                                <Star className="w-4 h-4 mr-2" />
                                Calificar Cliente
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-md">
                              <DialogHeader>
                                <DialogTitle>Calificar Cliente</DialogTitle>
                                <DialogDescription>
                                  Califica tu experiencia con {selectedTransaction?.profiles?.full_name || 'este cliente'}
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <Label>Calificación General</Label>
                                  {renderStarSelector(newUserRating.overall_rating, (rating) =>
                                    setNewUserRating({...newUserRating, overall_rating: rating})
                                  )}
                                </div>
                                
                                <div>
                                  <Label>Comunicación</Label>
                                  {renderStarSelector(newUserRating.communication_rating, (rating) =>
                                    setNewUserRating({...newUserRating, communication_rating: rating})
                                  )}
                                </div>
                                
                                <div>
                                  <Label>Puntualidad</Label>
                                  {renderStarSelector(newUserRating.punctuality_rating, (rating) =>
                                    setNewUserRating({...newUserRating, punctuality_rating: rating})
                                  )}
                                </div>
                                
                                <div>
                                  <Label>Cumplimiento de Pago</Label>
                                  {renderStarSelector(newUserRating.payment_rating, (rating) =>
                                    setNewUserRating({...newUserRating, payment_rating: rating})
                                  )}
                                </div>
                                
                                <div>
                                  <Label htmlFor="comment">Comentario (opcional)</Label>
                                  <Textarea
                                    id="comment"
                                    placeholder="Describe tu experiencia con este cliente..."
                                    value={newUserRating.comment}
                                    onChange={(e) => setNewUserRating({...newUserRating, comment: e.target.value})}
                                  />
                                </div>
                                
                                <div className="flex gap-2">
                                  <Button onClick={handleSubmitUserRating} className="flex-1">
                                    Enviar Calificación
                                  </Button>
                                  <Button 
                                    variant="outline" 
                                    onClick={() => {
                                      setShowRatingDialog(false);
                                      setSelectedTransaction(null);
                                    }}
                                  >
                                    Cancelar
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};