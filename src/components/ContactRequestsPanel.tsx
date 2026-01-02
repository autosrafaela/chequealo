import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useContactRequests } from "@/hooks/useContactRequests";
import { MessageCircle, CheckCheck } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { SimplifiedRequestList } from "@/components/messages/SimplifiedRequestList";
import { NotificationBadge } from "@/components/notifications/NotificationBadge";

export const ContactRequestsPanel = () => {
  const { requests, loading, updateRequestStatus } = useContactRequests();
  const navigate = useNavigate();
  const location = useLocation();

  const pendingCount = requests.filter(r => r.status === 'pending').length;

  const handleContact = (requestId: string) => {
    updateRequestStatus(requestId, 'contacted');
  };

  const handleArchive = (requestId: string) => {
    updateRequestStatus(requestId, 'closed');
  };

  const handleMarkAsRead = (requestId: string) => {
    // Mark as contacted when read
    updateRequestStatus(requestId, 'contacted');
  };

  const handleOpenChat = (requestId: string) => {
    const params = new URLSearchParams();
    params.set('tab', 'messages');
    params.set('contactRequestId', requestId);
    navigate(`${location.pathname}?${params.toString()}`, { replace: true });
  };

  const handleMarkAllAsRead = () => {
    requests
      .filter(r => r.status === 'pending')
      .forEach(r => updateRequestStatus(r.id, 'contacted'));
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Solicitudes de Contacto</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse">
                <div className="flex items-start gap-3 p-4 border rounded-lg">
                  <div className="w-12 h-12 bg-muted rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded w-1/3" />
                    <div className="h-3 bg-muted rounded w-2/3" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Solicitudes
            <NotificationBadge count={pendingCount} size="sm" />
          </CardTitle>
          
          {pendingCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllAsRead}
              className="text-xs"
            >
              <CheckCheck className="h-4 w-4 mr-1" />
              Marcar todas
            </Button>
          )}
        </div>
        {requests.length > 0 && (
          <p className="text-sm text-muted-foreground">
            {requests.length} solicitud{requests.length !== 1 && 'es'}
            {pendingCount > 0 && ` · ${pendingCount} pendiente${pendingCount !== 1 ? 's' : ''}`}
          </p>
        )}
      </CardHeader>
      <CardContent className="p-0">
        <SimplifiedRequestList
          requests={requests}
          onContact={handleContact}
          onArchive={handleArchive}
          onMarkAsRead={handleMarkAsRead}
          onOpenChat={handleOpenChat}
        />
      </CardContent>
    </Card>
  );
};