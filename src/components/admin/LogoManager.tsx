import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Loader2, Sparkles, Download, Upload, Image as ImageIcon, Check, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

import chequealoFinalLogo from '@/assets/chequealo-final-logo.png';
import chequealoLogo from '@/assets/chequealo-logo.png';
import chequealoNewLogo from '@/assets/chequealo-new-logo.png';
import chequealoTransparentLogo from '@/assets/chequealo-transparent-logo.png';

const DEFAULT_PROMPT = `A modern, trustworthy app icon/logo asset for 'CHEQUEALO.NET', a professional service directory for Rafaela, Argentina. The core element is a symbolic integration of three shapes: a magnifying glass, a location pin, and a bold checkmark. The location pin forms the eye of the magnifying glass, and inside the location pin is a clean, distinct checkmark. The color palette must use only deep, trustworthy blue and energetic teal green, with clean white interior spaces. The style is strictly modern, professional, flat vector icon with soft shadow definition, suitable for app stores. The background must be solid, pure white for easy masking.`;

const currentLogos = [
  { name: 'Logo Final', src: chequealoFinalLogo, file: 'chequealo-final-logo.png' },
  { name: 'Logo Original', src: chequealoLogo, file: 'chequealo-logo.png' },
  { name: 'Logo Nuevo (Activo)', src: chequealoNewLogo, file: 'chequealo-new-logo.png' },
  { name: 'Logo Transparente', src: chequealoTransparentLogo, file: 'chequealo-transparent-logo.png' },
];

export const LogoManager: React.FC = () => {
  const [prompt, setPrompt] = useState(DEFAULT_PROMPT);
  const [generating, setGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [savedLogos, setSavedLogos] = useState<{ name: string; url: string }[]>([]);
  const [activeLogoUrl, setActiveLogoUrl] = useState<string | null>(null);
  const [deletingLogo, setDeletingLogo] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('active_logo_url');
    if (stored) setActiveLogoUrl(stored);
    fetchSavedLogos();
  }, []);

  const fetchSavedLogos = async () => {
    const { data, error } = await supabase.storage.from('logos').list('generated', {
      sortBy: { column: 'created_at', order: 'desc' },
    });
    if (error) {
      console.error('Error fetching logos:', error);
      return;
    }
    const logos = (data || [])
      .filter(f => f.name !== '.emptyFolderPlaceholder')
      .map(f => ({
        name: f.name,
        url: supabase.storage.from('logos').getPublicUrl(`generated/${f.name}`).data.publicUrl,
      }));
    setSavedLogos(logos);
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error('Ingresá un prompt para generar el logo');
      return;
    }
    setGenerating(true);
    setGeneratedImage(null);
    try {
      const { data, error } = await supabase.functions.invoke('generate-logo', {
        body: { prompt },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      if (!data?.imageUrl) throw new Error('No se generó ninguna imagen');
      setGeneratedImage(data.imageUrl);
      toast.success('¡Logo generado exitosamente!');
    } catch (err: any) {
      console.error('Error generating logo:', err);
      toast.error(err.message || 'Error al generar el logo');
    } finally {
      setGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!generatedImage) return;
    setSaving(true);
    try {
      // Convert base64 to blob
      const base64Data = generatedImage.split(',')[1];
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'image/png' });

      const fileName = `logo-${Date.now()}.png`;
      const { error } = await supabase.storage
        .from('logos')
        .upload(`generated/${fileName}`, blob, { contentType: 'image/png' });

      if (error) throw error;

      toast.success('Logo guardado en el storage');
      fetchSavedLogos();
    } catch (err: any) {
      console.error('Error saving logo:', err);
      toast.error(err.message || 'Error al guardar el logo');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (logoName: string, logoUrl: string) => {
    setDeletingLogo(logoName);
    try {
      const { error } = await supabase.storage.from('logos').remove([`generated/${logoName}`]);
      if (error) throw error;
      if (activeLogoUrl === logoUrl) {
        localStorage.removeItem('active_logo_url');
        setActiveLogoUrl(null);
      }
      toast.success('Logo eliminado');
      fetchSavedLogos();
    } catch (err: any) {
      console.error('Error deleting logo:', err);
      toast.error(err.message || 'Error al eliminar el logo');
    } finally {
      setDeletingLogo(null);
    }
  };

  const handleActivateLogo = (url: string | null) => {
    if (url) {
      localStorage.setItem('active_logo_url', url);
      setActiveLogoUrl(url);
      toast.success('Logo activado. Recargá la página para ver el cambio en el header.');
    } else {
      localStorage.removeItem('active_logo_url');
      setActiveLogoUrl(null);
      toast.info('Logo desactivado. Se usará el logo por defecto.');
    }
  };

  const handleDownload = () => {
    if (!generatedImage) return;
    const link = document.createElement('a');
    link.href = generatedImage;
    link.download = `chequealo-logo-${Date.now()}.png`;
    link.click();
  };

  return (
    <div className="space-y-6">
      {/* Current Logos Gallery */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Logos Actuales del Proyecto
          </CardTitle>
          <CardDescription>Archivos de logo en src/assets/</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {currentLogos.map((logo) => (
              <div key={logo.file} className="border rounded-xl p-4 flex flex-col items-center gap-2 bg-muted/30">
                <img src={logo.src} alt={logo.name} className="h-16 w-auto object-contain" />
                <span className="text-xs text-muted-foreground text-center">{logo.name}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* AI Logo Generator */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Generar Logo con IA
          </CardTitle>
          <CardDescription>Usá Gemini para crear variaciones del logo</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Prompt de generación</Label>
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={4}
              className="mt-1"
              placeholder="Describí cómo querés el logo..."
            />
          </div>

          <Button onClick={handleGenerate} disabled={generating} className="w-full sm:w-auto">
            {generating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Generando...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Generar Logo
              </>
            )}
          </Button>

          {generatedImage && (
            <div className="border rounded-xl p-6 bg-muted/30 space-y-4">
              <p className="text-sm font-medium">Preview del logo generado:</p>
              <div className="flex justify-center">
                <img
                  src={generatedImage}
                  alt="Logo generado"
                  className="max-h-48 w-auto rounded-lg shadow-md"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <Button onClick={handleSave} disabled={saving} variant="default">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
                  Guardar en Storage
                </Button>
                <Button onClick={handleDownload} variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Descargar
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Saved Logos & Activation */}
      <Card>
        <CardHeader>
          <CardTitle>Logos Guardados</CardTitle>
          <CardDescription>Activá uno para usarlo en toda la app o eliminá los que no te gusten</CardDescription>
        </CardHeader>
        <CardContent>
          {savedLogos.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No hay logos guardados aún. Generá uno arriba y guardalo.</p>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 border rounded-lg bg-muted/20">
                <Switch
                  checked={!activeLogoUrl}
                  onCheckedChange={(checked) => {
                    if (checked) handleActivateLogo(null);
                  }}
                />
                <Label className="text-sm">Usar logo por defecto (chequealo-new-logo.png)</Label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {savedLogos.map((logo) => {
                  const isActive = activeLogoUrl === logo.url;
                  const isDeleting = deletingLogo === logo.name;
                  return (
                    <div
                      key={logo.name}
                      className={`border rounded-xl p-4 flex flex-col items-center gap-3 transition-all ${
                        isActive ? 'border-primary bg-primary/5 ring-2 ring-primary/20' : 'bg-muted/30'
                      }`}
                    >
                      <img src={logo.url} alt={logo.name} className="h-20 w-auto object-contain" />
                      <span className="text-xs text-muted-foreground truncate max-w-full">{logo.name}</span>
                      <div className="flex gap-2 w-full">
                        <Button
                          size="sm"
                          variant={isActive ? 'default' : 'outline'}
                          onClick={() => handleActivateLogo(isActive ? null : logo.url)}
                          className="flex-1"
                        >
                          {isActive ? (
                            <>
                              <Check className="h-3 w-3 mr-1" />
                              Activo
                            </>
                          ) : (
                            'Activar'
                          )}
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="destructive" disabled={isDeleting} className="px-2">
                              {isDeleting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>¿Eliminar este logo?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta acción no se puede deshacer. El logo será eliminado del storage permanentemente.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(logo.name, logo.url)}>
                                Eliminar
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
