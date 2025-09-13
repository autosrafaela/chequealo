import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Shield, 
  CheckCircle, 
  XCircle, 
  Eye, 
  AlertTriangle,
  Clock,
  User,
  Flag
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ModerationItem {
  id: string;
  type: 'work_photo' | 'professional_profile' | 'review';
  content: any;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  priority: 'low' | 'medium' | 'high';
}

const ModerationQueue = () => {
  const [items, setItems] = useState<ModerationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<ModerationItem | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'high_priority'>('pending');

  useEffect(() => {
    fetchModerationItems();
  }, [filter]);

  const fetchModerationItems = async () => {
    try {
      setLoading(true);
      
      // Fetch work photos for moderation
      const { data: workPhotos, error: workPhotosError } = await supabase
        .from('work_photos')
        .select(`
          *,
          professionals(full_name, profession)
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      if (workPhotosError) throw workPhotosError;

      // Transform data for moderation queue
      const moderationItems: ModerationItem[] = (workPhotos || []).map(photo => ({
        id: photo.id,
        type: 'work_photo' as const,
        content: {
          image_url: photo.image_url,
          caption: photo.caption,
          work_type: photo.work_type,
          professional_name: photo.professionals?.full_name,
          profession: photo.professionals?.profession
        },
        status: 'pending' as const, // Mock status for demo
        created_at: photo.created_at,
        priority: Math.random() > 0.7 ? 'high' : Math.random() > 0.4 ? 'medium' : 'low' as any
      }));

      // Apply filters
      let filteredItems = moderationItems;
      if (filter === 'pending') {
        filteredItems = moderationItems.filter(item => item.status === 'pending');
      } else if (filter === 'high_priority') {
        filteredItems = moderationItems.filter(item => item.priority === 'high');
      }

      setItems(filteredItems);
    } catch (error) {
      console.error('Error fetching moderation items:', error);
      toast.error('Error al cargar elementos para moderar');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (item: ModerationItem) => {
    try {
      // Here you would update the item status in the database
      toast.success(`${item.type} aprobado exitosamente`);
      
      // Remove from pending list
      setItems(prev => prev.filter(i => i.id !== item.id));
      setSelectedItem(null);
    } catch (error) {
      console.error('Error approving item:', error);
      toast.error('Error al aprobar elemento');
    }
  };

  const handleReject = async (item: ModerationItem) => {
    if (!rejectionReason.trim()) {
      toast.error('Por favor proporciona una razón para el rechazo');
      return;
    }

    try {
      // Here you would update the item status and add rejection reason
      toast.success(`${item.type} rechazado`);
      
      // Remove from pending list
      setItems(prev => prev.filter(i => i.id !== item.id));
      setSelectedItem(null);
      setRejectionReason('');
    } catch (error) {
      console.error('Error rejecting item:', error);
      toast.error('Error al rechazar elemento');
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500 text-white';
      case 'medium': return 'bg-yellow-500 text-white';
      default: return 'bg-green-500 text-white';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return <AlertTriangle className="h-3 w-3" />;
      case 'medium': return <Clock className="h-3 w-3" />;
      default: return <CheckCircle className="h-3 w-3" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'work_photo': return <Eye className="h-4 w-4" />;
      case 'professional_profile': return <User className="h-4 w-4" />;
      case 'review': return <Flag className="h-4 w-4" />;
      default: return <Shield className="h-4 w-4" />;
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const itemTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - itemTime.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Ahora mismo';
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;
    return `${Math.floor(diffInMinutes / 1440)}d`;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Cargando elementos para moderar...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Queue List */}
      <div className="lg:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-orange-500" />
              Cola de Moderación ({items.length})
            </CardTitle>
            
            {/* Filters */}
            <div className="flex gap-2">
              <Button
                variant={filter === 'pending' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('pending')}
              >
                Pendientes
              </Button>
              <Button
                variant={filter === 'high_priority' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('high_priority')}
              >
                Alta Prioridad
              </Button>
              <Button
                variant={filter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('all')}
              >
                Todos
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-96">
              {items.map((item) => (
                <div
                  key={item.id}
                  className={`p-4 border-b cursor-pointer transition-colors ${
                    selectedItem?.id === item.id ? 'bg-muted' : 'hover:bg-muted/50'
                  }`}
                  onClick={() => setSelectedItem(item)}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      {getTypeIcon(item.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className={getPriorityColor(item.priority)}>
                          <div className="flex items-center gap-1">
                            {getPriorityIcon(item.priority)}
                            {item.priority}
                          </div>
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {item.type.replace('_', ' ')}
                        </Badge>
                      </div>
                      
                      <p className="text-sm font-medium truncate">
                        {item.content.professional_name || 'Contenido para revisar'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {item.content.profession || item.content.caption || 'Sin descripción'}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatTimeAgo(item.created_at)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              
              {items.length === 0 && (
                <div className="p-6 text-center text-muted-foreground">
                  <Shield className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No hay elementos para moderar</p>
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Detail View */}
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>
              {selectedItem ? 'Revisar Contenido' : 'Selecciona un elemento para revisar'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedItem ? (
              <div className="space-y-6">
                {/* Content Preview */}
                <div>
                  <h4 className="font-medium mb-3">Contenido a Revisar</h4>
                  
                  {selectedItem.type === 'work_photo' && (
                    <div className="space-y-3">
                      <img
                        src={selectedItem.content.image_url}
                        alt="Foto de trabajo"
                        className="max-w-full h-64 object-cover rounded-lg border"
                      />
                      <div>
                        <p><strong>Profesional:</strong> {selectedItem.content.professional_name}</p>
                        <p><strong>Profesión:</strong> {selectedItem.content.profession}</p>
                        <p><strong>Tipo de trabajo:</strong> {selectedItem.content.work_type || 'No especificado'}</p>
                        <p><strong>Descripción:</strong> {selectedItem.content.caption || 'Sin descripción'}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Moderation Actions */}
                <div className="space-y-4">
                  <h4 className="font-medium">Acciones de Moderación</h4>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      onClick={() => handleApprove(selectedItem)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Aprobar
                    </Button>
                    
                    <Button
                      variant="destructive"
                      onClick={() => handleReject(selectedItem)}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Rechazar
                    </Button>
                  </div>

                  {/* Rejection Reason */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Razón del rechazo (opcional)
                    </label>
                    <Textarea
                      placeholder="Explica por qué este contenido debe ser rechazado..."
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      rows={3}
                    />
                  </div>
                </div>

                {/* Item Details */}
                <div className="pt-4 border-t">
                  <h4 className="font-medium mb-2">Detalles del Elemento</h4>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p><strong>ID:</strong> {selectedItem.id}</p>
                    <p><strong>Tipo:</strong> {selectedItem.type}</p>
                    <p><strong>Prioridad:</strong> {selectedItem.priority}</p>
                    <p><strong>Creado:</strong> {new Date(selectedItem.created_at).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Eye className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Selecciona un elemento de la cola para comenzar la revisión</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ModerationQueue;