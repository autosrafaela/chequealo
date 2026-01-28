import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, RefreshCw, Star, X, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface ProfessionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  professionalId: string;
}

interface ProfessionalProfession {
  id: string;
  profession: string;
  is_primary: boolean;
  created_at: string;
}

export function ProfessionModal({ open, onOpenChange, professionalId }: ProfessionModalProps) {
  const [newProfession, setNewProfession] = useState('');
  const [step, setStep] = useState<'input' | 'confirm'>('input');
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  // Obtener profesiones actuales del profesional
  const { data: currentProfessions, isLoading: loadingProfessions } = useQuery({
    queryKey: ['professional-professions', professionalId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('professional_professions')
        .select('*')
        .eq('professional_id', professionalId)
        .order('is_primary', { ascending: false });
      
      if (error) throw error;
      return (data || []) as ProfessionalProfession[];
    },
    enabled: open && !!professionalId
  });

  // Sugerencias de profesiones existentes en la plataforma
  const { data: suggestions } = useQuery({
    queryKey: ['profession-suggestions', newProfession],
    queryFn: async () => {
      if (newProfession.length < 2) return [];
      const { data, error } = await supabase
        .from('professional_professions')
        .select('profession')
        .ilike('profession', `%${newProfession}%`)
        .limit(10);
      
      if (error) return [];
      const unique = [...new Set(data?.map(p => p.profession) || [])];
      return unique.filter(s => s.toLowerCase() !== newProfession.toLowerCase()).slice(0, 5);
    },
    enabled: newProfession.length >= 2
  });

  const handleAddProfession = async () => {
    if (!newProfession.trim() || loading) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('professional_professions')
        .insert({
          professional_id: professionalId,
          profession: newProfession.trim(),
          is_primary: !currentProfessions || currentProfessions.length === 0
        });

      if (error) {
        if (error.code === '23505') {
          toast.error('Ya tenés esta profesión agregada');
        } else {
          throw error;
        }
      } else {
        toast.success('Profesión agregada');
        queryClient.invalidateQueries({ queryKey: ['professional-professions', professionalId] });
        queryClient.invalidateQueries({ queryKey: ['professional', professionalId] });
        resetModal();
      }
    } catch (error) {
      console.error('Error adding profession:', error);
      toast.error('Error al agregar la profesión');
    } finally {
      setLoading(false);
    }
  };

  const handleReplaceProfession = async () => {
    if (!newProfession.trim() || loading) return;
    
    setLoading(true);
    try {
      // Eliminar todas las anteriores
      await supabase
        .from('professional_professions')
        .delete()
        .eq('professional_id', professionalId);

      // Agregar la nueva como principal
      const { error } = await supabase
        .from('professional_professions')
        .insert({
          professional_id: professionalId,
          profession: newProfession.trim(),
          is_primary: true
        });

      if (error) throw error;

      // También actualizar la columna profession en professionals para compatibilidad
      await supabase
        .from('professionals')
        .update({ profession: newProfession.trim() })
        .eq('id', professionalId);

      toast.success('Profesión actualizada');
      queryClient.invalidateQueries({ queryKey: ['professional-professions', professionalId] });
      queryClient.invalidateQueries({ queryKey: ['professional', professionalId] });
      resetModal();
    } catch (error) {
      console.error('Error replacing profession:', error);
      toast.error('Error al actualizar la profesión');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveProfession = async (professionId: string) => {
    try {
      const { error } = await supabase
        .from('professional_professions')
        .delete()
        .eq('id', professionId);

      if (error) throw error;

      toast.success('Profesión eliminada');
      queryClient.invalidateQueries({ queryKey: ['professional-professions', professionalId] });
      queryClient.invalidateQueries({ queryKey: ['professional', professionalId] });
    } catch (error) {
      console.error('Error removing profession:', error);
      toast.error('Error al eliminar la profesión');
    }
  };

  const handleSetPrimary = async (professionId: string) => {
    try {
      // Primero quitar is_primary de todas
      await supabase
        .from('professional_professions')
        .update({ is_primary: false })
        .eq('professional_id', professionalId);

      // Luego establecer la nueva principal
      const { error } = await supabase
        .from('professional_professions')
        .update({ is_primary: true })
        .eq('id', professionId);

      if (error) throw error;

      toast.success('Profesión principal actualizada');
      queryClient.invalidateQueries({ queryKey: ['professional-professions', professionalId] });
      queryClient.invalidateQueries({ queryKey: ['professional', professionalId] });
    } catch (error) {
      console.error('Error setting primary profession:', error);
      toast.error('Error al cambiar la profesión principal');
    }
  };

  const resetModal = () => {
    onOpenChange(false);
    setNewProfession('');
    setStep('input');
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) resetModal();
      else onOpenChange(true);
    }}>
      <DialogContent className="max-w-sm">
        {step === 'input' ? (
          <>
            <DialogHeader>
              <DialogTitle>¿Qué profesión querés agregar?</DialogTitle>
              <DialogDescription>
                Escribí tu profesión o servicio
              </DialogDescription>
            </DialogHeader>

            {/* Profesiones actuales */}
            {loadingProfessions ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : currentProfessions && currentProfessions.length > 0 && (
              <div className="space-y-2 mt-2">
                <span className="text-sm text-muted-foreground">Actuales:</span>
                <div className="flex flex-wrap gap-2">
                  {currentProfessions.map((p) => (
                    <Badge 
                      key={p.id} 
                      variant={p.is_primary ? "default" : "secondary"}
                      className="flex items-center gap-1 pr-1"
                    >
                      {p.profession}
                      {p.is_primary && <Star className="h-3 w-3 ml-1 fill-current" />}
                      <button
                        onClick={() => handleRemoveProfession(p.id)}
                        className="ml-1 p-0.5 rounded-full hover:bg-background/20"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                {currentProfessions.length > 1 && (
                  <p className="text-xs text-muted-foreground">
                    Hacé click en una profesión para hacerla principal
                  </p>
                )}
              </div>
            )}

            {/* Input con sugerencias */}
            <div className="mt-4 space-y-2">
              <Input
                value={newProfession}
                onChange={(e) => setNewProfession(e.target.value)}
                placeholder="Ej: Electricista, Diseñador gráfico, Chef..."
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && newProfession.trim().length >= 2) {
                    setStep('confirm');
                  }
                }}
              />

              {/* Sugerencias */}
              {suggestions && suggestions.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {suggestions.map((s) => (
                    <button
                      key={s}
                      onClick={() => setNewProfession(s)}
                      className="text-xs px-2 py-1 bg-muted rounded-full hover:bg-primary/10 transition-colors"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <Button
              onClick={() => setStep('confirm')}
              disabled={newProfession.trim().length < 2}
              className="w-full mt-4"
            >
              Continuar
            </Button>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>¿Qué querés hacer?</DialogTitle>
              <DialogDescription>
                Vas a agregar: <strong>{newProfession}</strong>
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 mt-4">
              {/* Opción Agregar */}
              <button
                onClick={handleAddProfession}
                disabled={loading}
                className={cn(
                  "w-full p-4 border rounded-lg text-left hover:border-primary hover:bg-primary/5 transition-all",
                  loading && "opacity-50 cursor-not-allowed"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-full">
                    {loading ? (
                      <Loader2 className="h-5 w-5 text-green-600 animate-spin" />
                    ) : (
                      <Plus className="h-5 w-5 text-green-600" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium">Agregar profesión</p>
                    <p className="text-sm text-muted-foreground">
                      Mantener las anteriores y sumar esta nueva
                    </p>
                  </div>
                </div>
              </button>

              {/* Opción Reemplazar */}
              {currentProfessions && currentProfessions.length > 0 && (
                <button
                  onClick={handleReplaceProfession}
                  disabled={loading}
                  className={cn(
                    "w-full p-4 border rounded-lg text-left hover:border-destructive hover:bg-destructive/5 transition-all",
                    loading && "opacity-50 cursor-not-allowed"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-full">
                      {loading ? (
                        <Loader2 className="h-5 w-5 text-red-600 animate-spin" />
                      ) : (
                        <RefreshCw className="h-5 w-5 text-red-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">Reemplazar profesión</p>
                      <p className="text-sm text-muted-foreground">
                        Eliminar las anteriores y usar solo esta
                      </p>
                    </div>
                  </div>
                </button>
              )}
            </div>

            <Button
              variant="ghost"
              onClick={() => setStep('input')}
              className="w-full mt-2"
              disabled={loading}
            >
              Volver
            </Button>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
