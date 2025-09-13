import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useContactRequests, ContactRequest } from "@/hooks/useContactRequests";
import { MessageCircle, Calculator, Mail, Calendar, User, Clock } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { WhatsAppContactButton } from "@/components/WhatsAppContactButton";

export const ContactRequestsPanel = () => {
  const { requests, loading, updateRequestStatus } = useContactRequests();

  const getStatusColor = (status: ContactRequest['status']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'contacted': return 'bg-blue-100 text-blue-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: ContactRequest['status']) => {
    switch (status) {
      case 'pending': return 'Pendiente';
      case 'contacted': return 'Contactado';
      case 'closed': return 'Cerrado';
      default: return 'Desconocido';
    }
  };

  const getTypeIcon = (type: ContactRequest['type']) => {
    return type === 'contact' ? MessageCircle : Calculator;
  };

  const getTypeText = (type: ContactRequest['type']) => {
    return type === 'contact' ? 'Contacto' : 'Presupuesto';
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Solicitudes de Contacto</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Cargando solicitudes...</p>
        </CardContent>
      </Card>
    );
  }

  if (requests.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Solicitudes de Contacto</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No tienes solicitudes de contacto aún</p>
            <p className="text-sm text-muted-foreground">Las solicitudes aparecerán aquí cuando los clientes te contacten</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          Solicitudes de Contacto ({requests.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {requests.map((request) => {
          const TypeIcon = getTypeIcon(request.type);
          
          return (
            <div key={request.id} className="border rounded-lg p-4 space-y-3">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <TypeIcon className="h-4 w-4 text-primary" />
                  <span className="font-medium">{getTypeText(request.type)}</span>
                  <Badge className={getStatusColor(request.status)}>
                    {getStatusText(request.status)}
                  </Badge>
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Calendar className="h-3 w-3 mr-1" />
                  {format(new Date(request.created_at), 'dd/MM/yyyy', { locale: es })}
                </div>
              </div>

              {/* Contact Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <User className="h-3 w-3 text-muted-foreground" />
                  <span className="font-medium">{request.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-3 w-3 text-muted-foreground" />
                  <a href={`mailto:${request.email}`} className="text-primary hover:underline">
                    {request.email}
                  </a>
                </div>
                {request.phone && (
                  <div className="space-y-2">
                    <div className="text-xs text-muted-foreground mb-1">Contactar por:</div>
                    <WhatsAppContactButton 
                      phone={request.phone}
                      professionalName={request.name}
                      message={`Hola ${request.name}! Recibí tu solicitud desde Chequealo. Te contacto para coordinar el servicio de ${request.service_type || 'tu servicio'}.`}
                    />
                  </div>
                )}
                {request.service_type && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-3 w-3 text-muted-foreground" />
                    <span>{request.service_type}</span>
                  </div>
                )}
              </div>

              {/* Budget Range for quotes */}
              {request.type === 'quote' && request.budget_range && (
                <div className="text-sm">
                  <span className="font-medium text-muted-foreground">Presupuesto: </span>
                  <span className="text-primary font-medium">{request.budget_range}</span>
                </div>
              )}

              {/* Message */}
              <div className="space-y-2">
                <div className="text-sm font-medium text-muted-foreground">Mensaje:</div>
                <div className="text-sm bg-gray-50 p-3 rounded border">
                  {request.message}
                </div>
              </div>

              <Separator />

              {/* Actions */}
              <div className="flex gap-2">
                {request.status === 'pending' && (
                  <Button
                    size="sm"
                    onClick={() => updateRequestStatus(request.id, 'contacted')}
                    className="flex-1"
                  >
                    Marcar como Contactado
                  </Button>
                )}
                {request.status === 'contacted' && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => updateRequestStatus(request.id, 'closed')}
                    className="flex-1"
                  >
                    Cerrar Solicitud
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  asChild
                  className="flex-1"
                >
                  <a href={`mailto:${request.email}?subject=Re: ${getTypeText(request.type)} - Chequealo`}>
                    Responder por Email
                  </a>
                </Button>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};