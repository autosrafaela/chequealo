import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface TransactionConfirmationCardProps {
  transaction: {
    id: string;
    service_type: string;
    started_at: string;
    user_confirmed_completion: boolean | null;
    professional_confirmed_completion: boolean | null;
    user_confirmed_at: string | null;
    professional_confirmed_at: string | null;
    professional?: {
      full_name: string;
      profession: string;
    };
  };
  isProfessional: boolean;
  onConfirm: (transactionId: string, completed: boolean) => void;
  disabled?: boolean;
}

export const TransactionConfirmationCard = ({
  transaction,
  isProfessional,
  onConfirm,
  disabled = false
}: TransactionConfirmationCardProps) => {
  const hasConfirmed = isProfessional 
    ? transaction.professional_confirmed_completion !== null
    : transaction.user_confirmed_completion !== null;

  const otherPartyConfirmed = isProfessional
    ? transaction.user_confirmed_completion
    : transaction.professional_confirmed_completion;

  const myConfirmation = isProfessional
    ? transaction.professional_confirmed_completion
    : transaction.user_confirmed_completion;

  const confirmationDate = isProfessional
    ? transaction.professional_confirmed_at
    : transaction.user_confirmed_at;

  return (
    <Card className="border-l-4 border-l-primary">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-primary" />
              Confirmación Pendiente
            </CardTitle>
            <CardDescription className="mt-1">
              {isProfessional ? (
                <>Confirma si completaste este trabajo</>
              ) : (
                <>Confirma si {transaction.professional?.full_name} completó el trabajo</>
              )}
            </CardDescription>
          </div>
          <Badge variant="outline" className="ml-2">
            <Clock className="h-3 w-3 mr-1" />
            {format(new Date(transaction.started_at), "d 'de' MMMM", { locale: es })}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div>
          <p className="font-medium text-sm text-muted-foreground mb-1">Servicio</p>
          <p className="font-semibold">{transaction.service_type || 'Servicio general'}</p>
          {!isProfessional && transaction.professional && (
            <p className="text-sm text-muted-foreground">
              con {transaction.professional.full_name} ({transaction.professional.profession})
            </p>
          )}
        </div>

        {/* Status indicators */}
        <div className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
          <div className="flex-1">
            <div className="flex items-center gap-2 text-sm">
              {isProfessional ? (
                <>
                  <span className="font-medium">Usuario:</span>
                  {otherPartyConfirmed === true && (
                    <>
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-green-600">Confirmó</span>
                    </>
                  )}
                  {otherPartyConfirmed === false && (
                    <>
                      <XCircle className="h-4 w-4 text-red-600" />
                      <span className="text-red-600">No completado</span>
                    </>
                  )}
                  {otherPartyConfirmed === null && (
                    <>
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">Pendiente</span>
                    </>
                  )}
                </>
              ) : (
                <>
                  <span className="font-medium">Profesional:</span>
                  {otherPartyConfirmed === true && (
                    <>
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-green-600">Confirmó</span>
                    </>
                  )}
                  {otherPartyConfirmed === false && (
                    <>
                      <XCircle className="h-4 w-4 text-red-600" />
                      <span className="text-red-600">No completado</span>
                    </>
                  )}
                  {otherPartyConfirmed === null && (
                    <>
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">Pendiente</span>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {hasConfirmed ? (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              {myConfirmation ? (
                <>
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="font-semibold text-green-800">Tu respuesta: Trabajo completado</span>
                </>
              ) : (
                <>
                  <XCircle className="h-5 w-5 text-red-600" />
                  <span className="font-semibold text-red-800">Tu respuesta: Trabajo no completado</span>
                </>
              )}
            </div>
            {confirmationDate && (
              <p className="text-sm text-muted-foreground">
                Confirmado el {format(new Date(confirmationDate), "d 'de' MMMM 'a las' HH:mm", { locale: es })}
              </p>
            )}
            {otherPartyConfirmed === null && (
              <p className="text-sm text-muted-foreground mt-2">
                Esperando confirmación de la otra parte...
              </p>
            )}
            {otherPartyConfirmed !== null && myConfirmation === otherPartyConfirmed && (
              <p className="text-sm font-medium text-green-700 mt-2">
                ✓ ¡Ambos están de acuerdo! Ya pueden calificarse mutuamente.
              </p>
            )}
            {otherPartyConfirmed !== null && myConfirmation !== otherPartyConfirmed && (
              <p className="text-sm font-medium text-yellow-700 mt-2">
                ⚠ Las respuestas no coinciden. Por favor, revisen la situación.
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm font-medium">
              {isProfessional 
                ? '¿Completaste este trabajo?' 
                : '¿Este profesional completó el trabajo?'}
            </p>
            <div className="flex gap-3">
              <Button
                onClick={() => onConfirm(transaction.id, true)}
                disabled={disabled}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Sí, se completó
              </Button>
              <Button
                onClick={() => onConfirm(transaction.id, false)}
                disabled={disabled}
                variant="outline"
                className="flex-1 border-red-200 text-red-600 hover:bg-red-50"
              >
                <XCircle className="h-4 w-4 mr-2" />
                No se completó
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
