import { useState } from 'react';
import { Check, X, Clock, Receipt } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ChatQuoteCardProps {
  quote: {
    id: string;
    title: string;
    description?: string;
    amount: number;
    currency: string;
    status: 'pending' | 'accepted' | 'rejected' | 'expired';
    created_at: string;
  };
  isOwnMessage: boolean;
  isProfessional: boolean;
  onAccept?: (quoteId: string) => void;
  onReject?: (quoteId: string) => void;
}

export const ChatQuoteCard = ({
  quote,
  isOwnMessage,
  isProfessional,
  onAccept,
  onReject
}: ChatQuoteCardProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleAccept = async () => {
    if (!onAccept) return;
    setIsLoading(true);
    try {
      await onAccept(quote.id);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReject = async () => {
    if (!onReject) return;
    setIsLoading(true);
    try {
      await onReject(quote.id);
    } finally {
      setIsLoading(false);
    }
  };

  const statusConfig = {
    pending: {
      label: 'Pendiente',
      color: 'bg-amber-500/20 text-amber-700 border-amber-500/30',
      icon: Clock
    },
    accepted: {
      label: 'Aceptado',
      color: 'bg-green-500/20 text-green-700 border-green-500/30',
      icon: Check
    },
    rejected: {
      label: 'Rechazado',
      color: 'bg-red-500/20 text-red-700 border-red-500/30',
      icon: X
    },
    expired: {
      label: 'Expirado',
      color: 'bg-muted text-muted-foreground border-muted',
      icon: Clock
    }
  };

  const status = statusConfig[quote.status];
  const StatusIcon = status.icon;

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: currency || 'ARS',
      minimumFractionDigits: 2
    }).format(amount);
  };

  return (
    <div className={cn(
      "w-full max-w-[280px] rounded-xl border-2 overflow-hidden",
      "bg-gradient-to-br from-background to-muted/50",
      quote.status === 'pending' && "border-amber-500/50",
      quote.status === 'accepted' && "border-green-500/50",
      quote.status === 'rejected' && "border-red-500/30",
      quote.status === 'expired' && "border-muted"
    )}>
      {/* Header with gradient */}
      <div className={cn(
        "px-3 py-2 flex items-center justify-between",
        "bg-gradient-to-r from-amber-500/10 via-green-500/10 to-amber-500/10"
      )}>
        <div className="flex items-center gap-2">
          <Receipt className="h-4 w-4 text-primary" />
          <span className="text-xs font-medium text-foreground">
            Presupuesto Estimado
          </span>
        </div>
        <Badge className={cn("text-xs px-2 py-0.5", status.color)}>
          <StatusIcon className="h-3 w-3 mr-1" />
          {status.label}
        </Badge>
      </div>

      {/* Content */}
      <div className="p-3 space-y-2">
        <h4 className="font-semibold text-sm text-foreground">
          {quote.title}
        </h4>
        
        {quote.description && (
          <p className="text-xs text-muted-foreground">
            {quote.description}
          </p>
        )}

        <div className="text-xl font-bold text-primary">
          {formatCurrency(quote.amount, quote.currency)}
        </div>

        {/* Action button for client */}
        {!isProfessional && quote.status === 'pending' && (
          <Button
            onClick={handleAccept}
            disabled={isLoading}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
            size="sm"
          >
            <Check className="h-4 w-4 mr-2" />
            Aceptar Presupuesto
          </Button>
        )}
      </div>
    </div>
  );
};
