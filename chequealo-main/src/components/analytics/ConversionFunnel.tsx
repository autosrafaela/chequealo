import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingDown, Users, UserCheck, MessageSquare, CreditCard, Star } from 'lucide-react';

interface FunnelStep {
  step: string;
  count: number;
  percentage: number;
  icon: React.ReactNode;
  color: string;
}

interface ConversionFunnelProps {
  data: {
    visitors: number;
    signups: number;
    professionalProfiles: number;
    contactRequests: number;
    completedTransactions: number;
    reviews: number;
  };
}

const ConversionFunnel = ({ data }: ConversionFunnelProps) => {
  const funnelSteps: FunnelStep[] = [
    {
      step: 'Visitantes',
      count: data.visitors,
      percentage: 100,
      icon: <Users className="h-4 w-4" />,
      color: 'bg-blue-500'
    },
    {
      step: 'Registros',
      count: data.signups,
      percentage: data.visitors > 0 ? (data.signups / data.visitors) * 100 : 0,
      icon: <UserCheck className="h-4 w-4" />,
      color: 'bg-green-500'
    },
    {
      step: 'Perfiles Profesionales',
      count: data.professionalProfiles,
      percentage: data.signups > 0 ? (data.professionalProfiles / data.signups) * 100 : 0,
      icon: <UserCheck className="h-4 w-4" />,
      color: 'bg-purple-500'
    },
    {
      step: 'Solicitudes de Contacto',
      count: data.contactRequests,
      percentage: data.professionalProfiles > 0 ? (data.contactRequests / data.professionalProfiles) * 100 : 0,
      icon: <MessageSquare className="h-4 w-4" />,
      color: 'bg-orange-500'
    },
    {
      step: 'Transacciones Completadas',
      count: data.completedTransactions,
      percentage: data.contactRequests > 0 ? (data.completedTransactions / data.contactRequests) * 100 : 0,
      icon: <CreditCard className="h-4 w-4" />,
      color: 'bg-emerald-500'
    },
    {
      step: 'Reseñas',
      count: data.reviews,
      percentage: data.completedTransactions > 0 ? (data.reviews / data.completedTransactions) * 100 : 0,
      icon: <Star className="h-4 w-4" />,
      color: 'bg-yellow-500'
    }
  ];

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingDown className="h-5 w-5 text-purple-500" />
          Embudo de Conversión
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {funnelSteps.map((step, index) => {
            const nextStep = funnelSteps[index + 1];
            const dropoffRate = nextStep 
              ? ((step.count - nextStep.count) / step.count) * 100 
              : 0;

            return (
              <div key={step.step} className="space-y-3">
                {/* Step info */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${step.color} text-white`}>
                      {step.icon}
                    </div>
                    <div>
                      <h4 className="font-medium">{step.step}</h4>
                      <p className="text-sm text-muted-foreground">
                        {formatNumber(step.count)} usuarios
                      </p>
                    </div>
                  </div>
                  <Badge 
                    variant={step.percentage >= 20 ? "default" : "secondary"}
                    className={step.percentage >= 20 ? "bg-green-500" : ""}
                  >
                    {step.percentage.toFixed(1)}%
                  </Badge>
                </div>

                {/* Progress bar */}
                <Progress 
                  value={step.percentage} 
                  className="h-3"
                />

                {/* Dropoff indicator */}
                {nextStep && dropoffRate > 0 && (
                  <div className="flex items-center justify-center">
                    <Badge variant="outline" className="text-xs text-red-600">
                      ⬇️ {dropoffRate.toFixed(1)}% abandono
                    </Badge>
                  </div>
                )}

                {/* Separator */}
                {index < funnelSteps.length - 1 && (
                  <div className="flex justify-center">
                    <div className="w-px h-4 bg-border"></div>
                  </div>
                )}
              </div>
            );
          })}

          {/* Summary */}
          <div className="mt-6 p-4 bg-muted/50 rounded-lg">
            <h4 className="font-medium mb-2">Resumen de Conversión</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Visitante → Cliente</p>
                <p className="font-bold text-lg">
                  {data.visitors > 0 ? ((data.completedTransactions / data.visitors) * 100).toFixed(2) : 0}%
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Contacto → Transacción</p>
                <p className="font-bold text-lg">
                  {data.contactRequests > 0 ? ((data.completedTransactions / data.contactRequests) * 100).toFixed(2) : 0}%
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ConversionFunnel;