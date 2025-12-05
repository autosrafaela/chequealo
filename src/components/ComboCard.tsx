import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Package, Check, CreditCard, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface Combo {
  id: string;
  professional_id: string;
  title: string;
  description: string | null;
  includes: string[];
  price_from: number;
  deposit_amount: number | null;
  deposit_percentage: number;
}

interface ComboCardProps {
  combo: Combo;
  professionalName: string;
  onReserve?: () => void;
}

export const ComboCard = ({ combo, professionalName, onReserve }: ComboCardProps) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleReserve = async () => {
    if (!user) {
      toast.error('Iniciá sesión para reservar');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-payment-preference', {
        body: {
          items: [{
            title: `Seña: ${combo.title}`,
            description: `Reserva de combo con ${professionalName}`,
            quantity: 1,
            unit_price: combo.deposit_amount || (combo.price_from * combo.deposit_percentage / 100),
          }],
          metadata: {
            type: 'combo_deposit',
            combo_id: combo.id,
            professional_id: combo.professional_id,
            user_id: user.id,
          },
        },
      });

      if (error) throw error;

      if (data?.init_point) {
        window.open(data.init_point, '_blank');
        onReserve?.();
      }
    } catch (error) {
      console.error('Error creating payment:', error);
      toast.error('Error al procesar el pago');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="overflow-hidden border-2 border-primary/20 hover:border-primary/40 transition-colors">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Package className="h-5 w-5 text-primary" />
          </div>
          
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-foreground mb-1">{combo.title}</h4>
            
            {combo.description && (
              <p className="text-sm text-muted-foreground mb-2">{combo.description}</p>
            )}

            <div className="space-y-1 mb-3">
              {combo.includes.map((item, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <Check className="h-3 w-3 text-success flex-shrink-0" />
                  <span className="text-muted-foreground">{item}</span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between gap-2">
              <div>
                <Badge variant="secondary" className="font-bold text-base">
                  Desde ${combo.price_from.toLocaleString('es-AR')}
                </Badge>
                <p className="text-xs text-muted-foreground mt-1">
                  Seña: ${(combo.deposit_amount || (combo.price_from * combo.deposit_percentage / 100)).toLocaleString('es-AR')}
                </p>
              </div>
              
              <Button 
                size="sm" 
                onClick={handleReserve}
                disabled={loading}
                className="gap-1"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CreditCard className="h-4 w-4" />
                )}
                Reservar
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ComboCard;
