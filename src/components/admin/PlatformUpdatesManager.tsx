import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Trash2, Eye, EyeOff, Rocket, Zap, Wrench, Megaphone, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { UPDATE_TYPES, PlatformUpdate } from '@/hooks/usePlatformUpdates';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

const PlatformUpdatesManager = () => {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'feature' | 'improvement' | 'fix' | 'announcement'>('feature');
  const [link, setLink] = useState('');
  const [customIcon, setCustomIcon] = useState('');

  // Fetch all updates (including inactive)
  const { data: updates = [], isLoading } = useQuery({
    queryKey: ['platform-updates-admin'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('platform_updates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as PlatformUpdate[];
    },
  });

  // Create update mutation
  const createMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('platform_updates')
        .insert({
          title,
          description,
          type,
          link: link || null,
          icon: customIcon || UPDATE_TYPES[type].icon,
          is_active: true,
          publish_at: new Date().toISOString(),
        });

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Actualización publicada correctamente');
      queryClient.invalidateQueries({ queryKey: ['platform-updates'] });
      // Reset form
      setTitle('');
      setDescription('');
      setLink('');
      setCustomIcon('');
    },
    onError: (error) => {
      console.error('Error creating update:', error);
      toast.error('Error al publicar la actualización');
    },
  });

  // Toggle active status
  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const { error } = await supabase
        .from('platform_updates')
        .update({ is_active: isActive })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform-updates'] });
      toast.success('Estado actualizado');
    },
  });

  // Delete update
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('platform_updates')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform-updates'] });
      toast.success('Actualización eliminada');
    },
  });

  const handlePublish = () => {
    if (!title.trim() || !description.trim()) {
      toast.error('Título y descripción son requeridos');
      return;
    }
    createMutation.mutate();
  };

  const getTypeIcon = (updateType: string) => {
    switch (updateType) {
      case 'feature': return <Rocket className="h-4 w-4" />;
      case 'improvement': return <Zap className="h-4 w-4" />;
      case 'fix': return <Wrench className="h-4 w-4" />;
      case 'announcement': return <Megaphone className="h-4 w-4" />;
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Create Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Megaphone className="h-5 w-5" />
            Publicar Nueva Actualización
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Tipo de actualización</Label>
            <Select value={type} onValueChange={(v: any) => setType(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="feature">
                  <span className="flex items-center gap-2">🚀 Nueva funcionalidad</span>
                </SelectItem>
                <SelectItem value="improvement">
                  <span className="flex items-center gap-2">⚡ Mejora</span>
                </SelectItem>
                <SelectItem value="fix">
                  <span className="flex items-center gap-2">🔧 Corrección</span>
                </SelectItem>
                <SelectItem value="announcement">
                  <span className="flex items-center gap-2">📢 Anuncio</span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Título</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: ¡Nueva función de mensajería!"
              maxLength={200}
            />
          </div>

          <div>
            <Label>Descripción</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe la actualización..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Emoji personalizado (opcional)</Label>
              <Input
                value={customIcon}
                onChange={(e) => setCustomIcon(e.target.value)}
                placeholder="Ej: 🎉"
                maxLength={10}
              />
            </div>

            <div>
              <Label>Link (opcional)</Label>
              <Input
                value={link}
                onChange={(e) => setLink(e.target.value)}
                placeholder="Ej: /mensajes o https://..."
              />
            </div>
          </div>

          <Button 
            onClick={handlePublish} 
            disabled={!title.trim() || !description.trim() || createMutation.isPending}
            className="w-full"
          >
            {createMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Publicando...
              </>
            ) : (
              'Publicar actualización'
            )}
          </Button>

          {/* Preview */}
          {(title || description) && (
            <div className="mt-4 p-4 border rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground mb-2">Preview:</p>
              <div className="flex gap-3">
                <span className="text-2xl">{customIcon || UPDATE_TYPES[type].icon}</span>
                <div className="flex-1">
                  <p className="font-medium">{title || 'Título de la actualización'}</p>
                  <p className="text-sm text-muted-foreground">{description || 'Descripción...'}</p>
                  <Badge className={cn("mt-1", UPDATE_TYPES[type].color)}>
                    {UPDATE_TYPES[type].label}
                  </Badge>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Updates List */}
      <Card>
        <CardHeader>
          <CardTitle>Historial de Actualizaciones</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : updates.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No hay actualizaciones publicadas
            </p>
          ) : (
            <div className="space-y-4">
              {updates.map((update) => (
                <div 
                  key={update.id} 
                  className={cn(
                    "flex items-start gap-3 p-4 rounded-lg border",
                    !update.is_active && "opacity-60 bg-muted/50"
                  )}
                >
                  <span className="text-2xl">{update.icon || UPDATE_TYPES[update.type]?.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium">{update.title}</p>
                      <Badge className={cn("text-xs", UPDATE_TYPES[update.type]?.color)}>
                        {getTypeIcon(update.type)}
                        <span className="ml-1">{UPDATE_TYPES[update.type]?.label}</span>
                      </Badge>
                      {!update.is_active && (
                        <Badge variant="secondary">Inactiva</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{update.description}</p>
                    {update.link && (
                      <p className="text-xs text-primary mt-1">Link: {update.link}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-2">
                      {formatDistanceToNow(new Date(update.publish_at), { addSuffix: true, locale: es })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => toggleActiveMutation.mutate({ 
                        id: update.id, 
                        isActive: !update.is_active 
                      })}
                      title={update.is_active ? 'Desactivar' : 'Activar'}
                    >
                      {update.is_active ? (
                        <Eye className="h-4 w-4" />
                      ) : (
                        <EyeOff className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        if (confirm('¿Eliminar esta actualización?')) {
                          deleteMutation.mutate(update.id);
                        }
                      }}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PlatformUpdatesManager;
