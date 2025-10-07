import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Star, MessageSquare, CheckCircle, Clock, User } from 'lucide-react';

interface Transaction {
  id: string;
  professional_id: string;
  service_type?: string;
  amount?: number;
  status: string;
  completed_at?: string;
  created_at: string;
  professionals?: {
    full_name: string;
    profession: string;
  } | null;
}

interface Review {
  id: string;
  rating: number;
  comment?: string;
  service_provided?: string;
  created_at: string;
}

export const UserTransactionReviews = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [reviews, setReviews] = useState<{ [key: string]: Review }>({});
  const [loading, setLoading] = useState(true);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [reviewForm, setReviewForm] = useState({
    rating: 0,
    comment: '',
    service_provided: ''
  });

  useEffect(() => {
    if (user) {
      loadUserTransactions();
    }
  }, [user]);

  const loadUserTransactions = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Get user's completed transactions
      const { data: transactionData, error: transactionError } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'completed')
        .order('completed_at', { ascending: false });

      if (transactionError) throw transactionError;

      // Get professional data for each transaction
      const transactionsWithProfessionals = await Promise.all(
        (transactionData || []).map(async (transaction) => {
          const { data: professional } = await supabase
            .from('professionals')
            .select('full_name, profession')
            .eq('id', transaction.professional_id)
            .maybeSingle();

          return {
            ...transaction,
            professionals: professional
          };
        })
      );

      setTransactions(transactionsWithProfessionals);

      // Get existing reviews for these transactions
      if (transactionData && transactionData.length > 0) {
        const transactionIds = transactionData.map(t => t.id);
        const { data: reviewData, error: reviewError } = await supabase
          .from('reviews')
          .select('*')
          .in('transaction_id', transactionIds)
          .eq('user_id', user.id);

        if (reviewError) throw reviewError;

        const reviewsMap: { [key: string]: Review } = {};
        reviewData?.forEach(review => {
          if (review.transaction_id) {
            reviewsMap[review.transaction_id] = review;
          }
        });
        setReviews(reviewsMap);
      }

    } catch (error) {
      console.error('Error loading user transactions:', error);
      toast.error('Error al cargar tus trabajos');
    } finally {
      setLoading(false);
    }
  };

  const openReviewModal = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setReviewForm({
      rating: 0,
      comment: '',
      service_provided: transaction.service_type || ''
    });
    setShowReviewModal(true);
  };

  const submitReview = async () => {
    if (!user || !selectedTransaction || reviewForm.rating === 0) {
      toast.error('Por favor selecciona una calificación');
      return;
    }

    try {
      const { error } = await supabase
        .from('reviews')
        .insert({
          user_id: user.id,
          professional_id: selectedTransaction.professional_id,
          transaction_id: selectedTransaction.id,
          rating: reviewForm.rating,
          comment: reviewForm.comment || null,
          service_provided: reviewForm.service_provided,
          is_transaction_verified: true
        });

      if (error) throw error;

      toast.success('Reseña enviada correctamente');
      setShowReviewModal(false);
      setSelectedTransaction(null);
      loadUserTransactions();
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('Error al enviar la reseña');
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Cargando trabajos completados...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Reseñas de Servicios
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Califica los servicios que has recibido
        </p>
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <CheckCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p>No tienes servicios completados para reseñar</p>
          </div>
        ) : (
          <div className="space-y-4">
            {transactions.map((transaction) => {
              const existingReview = reviews[transaction.id];
              
              return (
                <div key={transaction.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <h4 className="font-medium">{transaction.service_type}</h4>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <User className="h-3 w-3" />
                        {transaction.professionals?.full_name} - {transaction.professionals?.profession}
                      </div>
                      {transaction.amount && (
                        <div className="text-sm font-semibold text-green-600">
                          {formatCurrency(transaction.amount)}
                        </div>
                      )}
                      <div className="text-xs text-muted-foreground">
                        <Clock className="h-3 w-3 inline mr-1" />
                        Completado: {transaction.completed_at 
                          ? new Date(transaction.completed_at).toLocaleDateString('es-AR')
                          : new Date(transaction.created_at).toLocaleDateString('es-AR')
                        }
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {existingReview ? (
                        <div className="text-right space-y-1">
                          <div className="flex items-center gap-2">
                            {renderStars(existingReview.rating)}
                            <Badge variant="secondary">Reseñado</Badge>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(existingReview.created_at).toLocaleDateString('es-AR')}
                          </div>
                        </div>
                      ) : (
                        <Button 
                          size="sm" 
                          onClick={() => openReviewModal(transaction)}
                        >
                          Dejar Reseña
                        </Button>
                      )}
                    </div>
                  </div>

                  {existingReview?.comment && (
                    <div className="mt-2 p-2 bg-muted rounded text-sm">
                      <p>"{existingReview.comment}"</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Review Modal */}
        <Dialog open={showReviewModal} onOpenChange={setShowReviewModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                Reseñar a {selectedTransaction?.professionals?.full_name}
              </DialogTitle>
            </DialogHeader>
            {selectedTransaction && (
              <div className="space-y-4">
                <div className="p-3 bg-muted rounded-lg">
                  <p className="font-medium">{selectedTransaction.service_type}</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedTransaction.professionals?.profession}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Calificación *</Label>
                  {renderStars(reviewForm.rating, true, (rating) => 
                    setReviewForm(prev => ({ ...prev, rating }))
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="service">Servicio Recibido</Label>
                  <Select
                    value={reviewForm.service_provided}
                    onValueChange={(value) => setReviewForm(prev => ({ ...prev, service_provided: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={selectedTransaction.service_type || 'Servicio'}>
                        {selectedTransaction.service_type || 'Servicio'}
                      </SelectItem>
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
                    placeholder="Comparte tu experiencia con este profesional..."
                    value={reviewForm.comment}
                    onChange={(e) => setReviewForm(prev => ({ ...prev, comment: e.target.value }))}
                    rows={4}
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setShowReviewModal(false);
                      setSelectedTransaction(null);
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button onClick={submitReview}>
                    Enviar Reseña
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};