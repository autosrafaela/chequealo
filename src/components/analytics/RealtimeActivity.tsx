import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Activity, 
  Users, 
  UserCheck, 
  DollarSign, 
  Star, 
  MessageSquare,
  Eye,
  Clock
} from 'lucide-react';

interface RealtimeActivityProps {
  activities: { type: string; message: string; timestamp: string }[];
  onlineUsers: number;
}

const RealtimeActivity = ({ activities, onlineUsers }: RealtimeActivityProps) => {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'user':
        return <Users className="h-4 w-4 text-blue-500" />;
      case 'professional':
        return <UserCheck className="h-4 w-4 text-green-500" />;
      case 'payment':
        return <DollarSign className="h-4 w-4 text-green-600" />;
      case 'review':
        return <Star className="h-4 w-4 text-yellow-500" />;
      case 'contact':
        return <MessageSquare className="h-4 w-4 text-purple-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'user':
        return 'bg-blue-100 text-blue-800';
      case 'professional':
        return 'bg-green-100 text-green-800';
      case 'payment':
        return 'bg-green-100 text-green-800';
      case 'review':
        return 'bg-yellow-100 text-yellow-800';
      case 'contact':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const activityTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - activityTime.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Ahora mismo';
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;
    return `${Math.floor(diffInMinutes / 1440)}d`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-green-500" />
          Actividad en Tiempo Real
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Online Users Indicator */}
        <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <Eye className="h-4 w-4 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-green-800">Usuarios en línea</p>
              <p className="text-xs text-green-600">Actualizándose en tiempo real</p>
            </div>
          </div>
          <Badge className="bg-green-500 text-white font-bold">
            {onlineUsers}
          </Badge>
        </div>

        {/* Recent Activities */}
        <div>
          <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Actividad Reciente
          </h4>
          
          <ScrollArea className="h-64">
            <div className="space-y-3">
              {activities.map((activity, index) => (
                <div 
                  key={index} 
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-shrink-0 mt-0.5">
                    {getActivityIcon(activity.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground">{activity.message}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge 
                        variant="secondary" 
                        className={`text-xs ${getActivityColor(activity.type)}`}
                      >
                        {activity.type}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatTimeAgo(activity.timestamp)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              
              {activities.length === 0 && (
                <div className="text-center py-6 text-muted-foreground">
                  <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No hay actividad reciente</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Activity Summary */}
        <div className="grid grid-cols-2 gap-3 pt-3 border-t">
          <div className="text-center">
            <p className="text-lg font-bold text-primary">{activities.length}</p>
            <p className="text-xs text-muted-foreground">Eventos hoy</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-green-600">98%</p>
            <p className="text-xs text-muted-foreground">Disponibilidad</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RealtimeActivity;