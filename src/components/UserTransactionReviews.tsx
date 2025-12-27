import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Star, MessageSquare, CheckCircle, Clock, User } from 'lucide-react';
import { WriteReviewModal } from './WriteReviewModal';

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
    image_url?: string;
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
            .select('full_name, profession, image_url')
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
    setShowReviewModal(true);
  };

  const handleReviewSubmitted = () => {
    setShowReviewModal(false);
    setSelectedTransaction(null);
    loadUserTransactions();
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
                        <span className="uppercase">{transaction.professionals?.full_name}</span> - {transaction.professionals?.profession}
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
        {selectedTransaction && selectedTransaction.professionals && (
          <WriteReviewModal
            isOpen={showReviewModal}
            onClose={() => {
              setShowReviewModal(false);
              setSelectedTransaction(null);
            }}
            professional={{
              id: selectedTransaction.professional_id,
              full_name: selectedTransaction.professionals.full_name,
              profession: selectedTransaction.professionals.profession,
              image_url: selectedTransaction.professionals.image_url
            }}
            transactionId={selectedTransaction.id}
            serviceType={selectedTransaction.service_type}
            onReviewSubmitted={handleReviewSubmitted}
          />
        )}
      </CardContent>
    </Card>
  );
};