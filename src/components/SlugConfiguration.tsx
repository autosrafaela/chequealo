import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Check, X, Loader2, Link2, Copy, ExternalLink, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

// Rutas reservadas del sistema
const RESERVED_SLUGS = [
  'admin', 'dashboard', 'login', 'auth', 'register', 'verification',
  'search', 'ai-search', 'mensajes', 'messages', 'user-dashboard',
  'professional', 'pricing', 'planes', 'terms', 'privacy', 'instalar',
  'install', 'faq', 'how-it-works', 'test-results', 'urgencias', 'promo',
  'sena', 'mis-reservas', 'solicitudes-reservas', 'p', 'api', 'settings',
  'contacto', 'ayuda', 'help', 'about', 'home', 'inicio', 'index', 'principal'
];

interface SlugConfigurationProps {
  professionalId: string;
  currentSlug: string | null;
  onSlugUpdated?: (newSlug: string | null) => void;
}

const SlugConfiguration = ({ professionalId, currentSlug, onSlugUpdated }: SlugConfigurationProps) => {
  const [slug, setSlug] = useState(currentSlug || '');
  const [originalSlug] = useState(currentSlug || '');
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Validar y formatear el slug
  const validateSlug = (value: string): string => {
    return value
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')      // Espacios a guiones
      .replace(/[^a-z0-9-]/g, '') // Solo letras, números y guiones
      .replace(/-+/g, '-')        // Múltiples guiones a uno solo
      .replace(/^-|-$/g, '')      // Sin guiones al inicio/final
      .substring(0, 50);
  };

  // Verificar disponibilidad
  const checkAvailability = useCallback(async (slugToCheck: string) => {
    if (slugToCheck.length < 3) {
      setIsAvailable(null);
      setError(slugToCheck.length > 0 ? 'Mínimo 3 caracteres' : null);
      return;
    }

    if (slugToCheck.length > 50) {
      setIsAvailable(false);
      setError('Máximo 50 caracteres');
      return;
    }

    // Verificar formato
    if (!/^[a-z0-9][a-z0-9-]*[a-z0-9]$/.test(slugToCheck) && slugToCheck.length >= 3) {
      if (slugToCheck.startsWith('-') || slugToCheck.endsWith('-')) {
        setIsAvailable(false);
        setError('No puede empezar ni terminar con guión');
        return;
      }
    }

    // Verificar rutas reservadas
    if (RESERVED_SLUGS.includes(slugToCheck)) {
      setIsAvailable(false);
      setError('Esta URL está reservada por el sistema');
      return;
    }

    // Si es el mismo slug actual, está disponible
    if (slugToCheck === originalSlug) {
      setIsAvailable(true);
      setError(null);
      return;
    }

    setIsChecking(true);
    setError(null);

    try {
      const { data, error: queryError } = await supabase
        .from('professionals')
        .select('id')
        .eq('slug', slugToCheck)
        .neq('id', professionalId)
        .maybeSingle();

      if (queryError) {
        console.error('Error checking slug:', queryError);
        setError('Error al verificar disponibilidad');
        setIsAvailable(null);
      } else {
        setIsAvailable(!data);
        if (data) {
          setError('Esta URL ya está en uso');
        }
      }
    } catch (err) {
      console.error('Error checking slug availability:', err);
      setError('Error al verificar');
      setIsAvailable(null);
    } finally {
      setIsChecking(false);
    }
  }, [professionalId, originalSlug]);

  // Debounce para la verificación
  useEffect(() => {
    const timer = setTimeout(() => {
      if (slug) {
        checkAvailability(slug);
      } else {
        setIsAvailable(null);
        setError(null);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [slug, checkAvailability]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = validateSlug(e.target.value);
    setSlug(formatted);
  };

  const handleSave = async () => {
    if (!isAvailable && slug !== '') return;

    setIsSaving(true);

    try {
      const newSlug = slug === '' ? null : slug;
      
      const { error: updateError } = await supabase
        .from('professionals')
        .update({ slug: newSlug })
        .eq('id', professionalId);

      if (updateError) {
        console.error('Error saving slug:', updateError);
        if (updateError.code === '23505') {
          toast.error('Esta URL ya está en uso por otro profesional');
        } else if (updateError.code === '23514') {
          toast.error('Formato de URL inválido');
        } else {
          toast.error('Error al guardar la URL personalizada');
        }
        return;
      }

      toast.success(newSlug ? '¡URL personalizada guardada!' : 'URL personalizada eliminada');
      onSlugUpdated?.(newSlug);
    } catch (err) {
      console.error('Error saving slug:', err);
      toast.error('Error al guardar');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopyUrl = () => {
    if (slug) {
      navigator.clipboard.writeText(`https://chequealo.ar/${slug}`);
      toast.success('URL copiada al portapapeles');
    }
  };

  const hasChanges = slug !== (originalSlug || '');

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Link2 className="h-5 w-5" />
          URL Personalizada
        </CardTitle>
        <CardDescription>
          Elegí una dirección fácil de recordar para compartir tu perfil
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Input con prefijo */}
        <div className="space-y-2">
          <Label htmlFor="slug">Tu URL</Label>
          <div className="flex items-center gap-0">
            <div className="flex items-center h-10 px-3 bg-muted border border-r-0 rounded-l-md text-sm text-muted-foreground">
              chequealo.ar/
            </div>
            <div className="relative flex-1">
              <Input
                id="slug"
                value={slug}
                onChange={handleInputChange}
                placeholder="tu-nombre"
                className={cn(
                  "rounded-l-none pr-10",
                  isAvailable === true && "border-green-500 focus-visible:ring-green-500",
                  isAvailable === false && "border-destructive focus-visible:ring-destructive"
                )}
                maxLength={50}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {isChecking && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                {!isChecking && isAvailable === true && <Check className="h-4 w-4 text-green-500" />}
                {!isChecking && isAvailable === false && <X className="h-4 w-4 text-destructive" />}
              </div>
            </div>
          </div>
          
          {/* Mensaje de error/estado */}
          {error && (
            <p className="text-xs text-destructive">{error}</p>
          )}
          {isAvailable === true && slug && slug !== originalSlug && (
            <p className="text-xs text-green-600">¡Esta URL está disponible!</p>
          )}
        </div>

        {/* Vista previa de la URL */}
        {slug && isAvailable && (
          <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
            <ExternalLink className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <span className="text-sm font-medium truncate">
              https://chequealo.ar/{slug}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 ml-auto"
              onClick={handleCopyUrl}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Reglas */}
        <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
          <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
          <div className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
            <p>• Mínimo 3 caracteres, máximo 50</p>
            <p>• Solo letras minúsculas, números y guiones</p>
            <p>• No puede empezar ni terminar con guión</p>
          </div>
        </div>

        {/* Badge de estado actual */}
        {originalSlug && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">URL actual:</span>
            <Badge variant="secondary" className="text-xs">
              chequealo.ar/{originalSlug}
            </Badge>
          </div>
        )}

        {/* Botón guardar */}
        <Button
          onClick={handleSave}
          disabled={isSaving || (!isAvailable && slug !== '') || !hasChanges}
          className="w-full"
        >
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Guardando...
            </>
          ) : (
            'Guardar URL'
          )}
        </Button>

        {/* Opción para eliminar */}
        {originalSlug && slug !== '' && (
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-muted-foreground"
            onClick={() => setSlug('')}
          >
            Eliminar URL personalizada
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default SlugConfiguration;
