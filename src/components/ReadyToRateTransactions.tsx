import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, CheckCircle, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';

interface ReadyTransaction {
  id: string;
  service_type: string;
  both_confirmed_at: string;
  user_id: string;
  professional_id: string;
  professional?: {
    full_name: string;
    profession: string;
  };
  has_user_review: boolean;
  has_professional_review: boolean;
}

interface ReadyToRateTransactionsProps {
  isProfessional?: boolean;
  onRate?: (transactionId: string) => void;
}

export const ReadyToRateTransactions = ({ 
  isProfessional = false,
  onRate 
}: ReadyToRateTransactionsProps) => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<ReadyTransaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [professionalId, setProfessionalId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      if (isProfessional) {
        checkProfessionalId();
      } else {
        loadReadyTransactions();
      }
    }
  }, [user, isProfessional]);

  useEffect(() => {
    if (professionalId) {
      loadReadyTransactions();
    }
  }, [professionalId]);

  const checkProfessionalId = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('professionals')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (!error && data) {
      setProfessionalId(data.id);
    }
  };

  const loadReadyTransactions = async () => {
    if (!user) return;

    try {
      setLoading(true);

      let query = supabase
        .from('transactions')
        .select(`
          id,
          user_id,
          professional_id,
          service_type,
          both_confirmed_at,
          professionals!inner(full_name, profession)
        `)
        .eq('status', 'completed')
        .not('both_confirmed_at', 'is', null);

      if (isProfessional && professionalId) {
        query = query.eq('professional_id', professionalId);
      } else {
        query = query.eq('user_id', user.id);
      }

      const { data, error } = await query.order('both_confirmed_at', { ascending: false });

      if (error) throw error;

      // Check which transactions already have reviews
      const transactionsWithReviewStatus = await Promise.all(
        (data || []).map(async (transaction) => {
          // Check for user review
          const { data: userReview } = await supabase
            .from('reviews')
            .select('id')
            .eq('transaction_id', transaction.id)
            .eq('user_id', transaction.user_id)
            .maybeSingle();

          // Check for professional review
          const { data: professionalReview } = await supabase
            .from('user_ratings')
            .select('id')
            .eq('transaction_id', transaction.id)
            .eq('professional_id', transaction.professional_id)
            .maybeSingle();

          return {
            ...transaction,
            has_user_review: !!userReview,
            has_professional_review: !!professionalReview
          };
        })
      );

      // Filter out transactions that already have been rated by this user
      const unratedTransactions = transactionsWithReviewStatus.filter(t => 
        isProfessional ? !t.has_professional_review : !t.has_user_review
      );

      setTransactions(unratedTransactions);
    } catch (error) {
      console.error('Error loading ready transactions:', error);
      toast.error('Error al cargar transacciones');
    } finally {
      setLoading(false);
    }
  };

  const handleRate = (transactionId: string) => {
    if (onRate) {
      onRate(transactionId);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">Cargando...</p>
        </CardContent>
      </Card>
    );
  }

  if (transactions.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Star className="h-5 w-5 text-yellow-500" />
        <h3 className="text-lg font-semibold">Listo para Calificar</h3>
        <Badge variant="default" className="ml-2">
          {transactions.length}
        </Badge>
      </div>

      <div className="grid gap-4">
        {transactions.map((transaction) => (
          <Card 
            key={transaction.id} 
            className="border-l-4 border-l-yellow-500 hover:shadow-md transition-shadow"
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-base flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Trabajo Confirmado
                  </CardTitle>
                  <CardDescription className="mt-1">
                    {isProfessional ? (
                      <>Califica tu experiencia con este cliente</>
                    ) : (
                      <>Califica a {transaction.professional?.full_name}</>
                    )}
                  </CardDescription>
                </div>
                <Badge variant="outline" className="ml-2 whitespace-nowrap">
                  <Calendar className="h-3 w-3 mr-1" />
                  {format(new Date(transaction.both_confirmed_at), "d MMM", { locale: es })}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Servicio</p>
                <p className="font-medium">{transaction.service_type || 'Servicio general'}</p>
                {!isProfessional && transaction.professional && (
                  <p className="text-sm text-muted-foreground">
                    {transaction.professional.profession}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-1 text-yellow-500">
                  <Star className="h-4 w-4 fill-current" />
                  <Star className="h-4 w-4 fill-current" />
                  <Star className="h-4 w-4 fill-current" />
                  <Star className="h-4 w-4 fill-current" />
                  <Star className="h-4 w-4 fill-current" />
                </div>
                
                <Button 
                  onClick={() => handleRate(transaction.id)}
                  size="sm"
                  className="bg-yellow-600 hover:bg-yellow-700"
                >
                  <Star className="h-4 w-4 mr-2" />
                  Calificar Ahora
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
