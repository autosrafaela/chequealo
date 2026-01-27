import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X, Download, Smartphone, Zap, Bell, Wifi, Share, Plus, Check, AlertTriangle, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import chequealoLogo from '@/assets/chequealo-new-logo.png';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

// Hook to manage PWA install state globally
export const usePWAInstall = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    console.log('[PWA Debug] Initializing PWA install hook...');
    console.log('[PWA Debug] User Agent:', navigator.userAgent);
    console.log('[PWA Debug] Is standalone:', window.matchMedia('(display-mode: standalone)').matches);
    
    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      console.log('[PWA Debug] App already installed in standalone mode');
      setIsInstalled(true);
      return;
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      console.log('[PWA Debug] ✅ beforeinstallprompt event fired!');
      console.log('[PWA Debug] Event:', e);
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      console.log('[PWA Debug] ✅ App installed successfully!');
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    console.log('[PWA Debug] Adding beforeinstallprompt listener...');
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Debug: Check if service worker is registered
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(regs => {
        console.log('[PWA Debug] Service Worker registrations:', regs.length);
        regs.forEach((reg, i) => console.log(`[PWA Debug] SW ${i}:`, reg.scope));
      });
    } else {
      console.log('[PWA Debug] Service Worker not supported');
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const triggerInstall = async () => {
    if (!deferredPrompt) return false;

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      setDeferredPrompt(null);
      return outcome === 'accepted';
    } catch (error) {
      console.error('Error showing install prompt:', error);
      return false;
    }
  };

  return { deferredPrompt, isInstalled, triggerInstall, canInstall: !!deferredPrompt && !isInstalled };
};

export const PWAInstallPrompt: React.FC = () => {
  const { deferredPrompt, isInstalled, triggerInstall } = usePWAInstall();
  const [showPrompt, setShowPrompt] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (!deferredPrompt || isInstalled) return;

    // Check if user dismissed the prompt
    const dismissedAt = localStorage.getItem('pwa-install-prompt-dismissed-at');
    if (dismissedAt) {
      const dismissedTime = parseInt(dismissedAt, 10);
      const threeDaysMs = 3 * 24 * 60 * 60 * 1000; // 3 days
      if (Date.now() - dismissedTime < threeDaysMs) {
        return; // Still within the 3-day cooldown
      }
      // Clear old dismissal
      localStorage.removeItem('pwa-install-prompt-dismissed-at');
    }

    // Show prompt after 2 seconds
    const timer = setTimeout(() => {
      setIsAnimating(true);
      setShowPrompt(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, [deferredPrompt, isInstalled]);

  const handleInstall = async () => {
    const accepted = await triggerInstall();
    if (accepted) {
      setShowPrompt(false);
    }
  };

  const handleDismiss = () => {
    setIsAnimating(false);
    setTimeout(() => {
      setShowPrompt(false);
      localStorage.setItem('pwa-install-prompt-dismissed-at', Date.now().toString());
    }, 300);
  };

  if (isInstalled || !showPrompt || !deferredPrompt) {
    return null;
  }

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/50 z-[100] transition-opacity duration-300 ${isAnimating ? 'opacity-100' : 'opacity-0'}`}
        onClick={handleDismiss}
      />
      
      {/* Bottom Sheet */}
      <div 
        className={`fixed inset-x-0 bottom-0 z-[101] transition-transform duration-300 ease-out ${isAnimating ? 'translate-y-0' : 'translate-y-full'}`}
      >
        <div className="bg-gradient-to-br from-primary via-primary to-primary/90 rounded-t-3xl shadow-2xl overflow-hidden">
          {/* Handle bar */}
          <div className="flex justify-center pt-3 pb-2">
            <div className="w-12 h-1.5 bg-white/30 rounded-full" />
          </div>

          {/* Close button */}
          <button
            onClick={handleDismiss}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
          >
            <X className="h-5 w-5 text-white" />
          </button>

          <div className="px-6 pb-8 pt-2">
            {/* App Icon and Title */}
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-white rounded-2xl shadow-lg flex items-center justify-center p-2">
                <img src={chequealoLogo} alt="Chequealo" className="w-full h-full object-contain" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Instalá Chequealo</h2>
                <p className="text-white/80 text-sm">Acceso rápido desde tu pantalla</p>
              </div>
            </div>

            {/* Benefits */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="bg-white/10 rounded-xl p-3 text-center">
                <Zap className="h-6 w-6 text-yellow-300 mx-auto mb-1" />
                <span className="text-white/90 text-xs">Más rápido</span>
              </div>
              <div className="bg-white/10 rounded-xl p-3 text-center">
                <Bell className="h-6 w-6 text-yellow-300 mx-auto mb-1" />
                <span className="text-white/90 text-xs">Notificaciones</span>
              </div>
              <div className="bg-white/10 rounded-xl p-3 text-center">
                <Wifi className="h-6 w-6 text-yellow-300 mx-auto mb-1" />
                <span className="text-white/90 text-xs">Sin conexión</span>
              </div>
            </div>

            {/* Install Button */}
            <Button
              onClick={handleInstall}
              className="w-full bg-white text-primary hover:bg-white/90 font-semibold py-6 text-lg rounded-xl shadow-lg"
            >
              <Download className="h-5 w-5 mr-2" />
              Instalar Ahora
            </Button>

            {/* Later button */}
            <button
              onClick={handleDismiss}
              className="w-full text-white/70 hover:text-white text-sm mt-4 py-2"
            >
              Ahora no, gracias
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

// Enhanced iOS Install Instructions
export const IOSInstallInstructions: React.FC = () => {
  const [showInstructions, setShowInstructions] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isInStandaloneMode = window.matchMedia('(display-mode: standalone)').matches;
    
    // Check cooldown
    const dismissedAt = localStorage.getItem('ios-install-dismissed-at');
    if (dismissedAt) {
      const dismissedTime = parseInt(dismissedAt, 10);
      const threeDaysMs = 3 * 24 * 60 * 60 * 1000;
      if (Date.now() - dismissedTime < threeDaysMs) {
        return;
      }
      localStorage.removeItem('ios-install-dismissed-at');
    }

    if (isIOS && !isInStandaloneMode) {
      setTimeout(() => {
        setIsAnimating(true);
        setShowInstructions(true);
      }, 2000);
    }
  }, []);

  const handleDismiss = () => {
    setIsAnimating(false);
    setTimeout(() => {
      setShowInstructions(false);
      localStorage.setItem('ios-install-dismissed-at', Date.now().toString());
    }, 300);
  };

  if (!showInstructions) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/50 z-[100] transition-opacity duration-300 ${isAnimating ? 'opacity-100' : 'opacity-0'}`}
        onClick={handleDismiss}
      />
      
      {/* Bottom Sheet */}
      <div 
        className={`fixed inset-x-0 bottom-0 z-[101] transition-transform duration-300 ease-out ${isAnimating ? 'translate-y-0' : 'translate-y-full'}`}
      >
        <div className="bg-gradient-to-br from-primary via-primary to-primary/90 rounded-t-3xl shadow-2xl overflow-hidden max-h-[85vh] overflow-y-auto">
          {/* Handle bar */}
          <div className="flex justify-center pt-3 pb-2">
            <div className="w-12 h-1.5 bg-white/30 rounded-full" />
          </div>

          {/* Close button */}
          <button
            onClick={handleDismiss}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
          >
            <X className="h-5 w-5 text-white" />
          </button>

          <div className="px-6 pb-8 pt-2">
            {/* App Icon and Title */}
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-white rounded-2xl shadow-lg flex items-center justify-center p-2">
                <img src={chequealoLogo} alt="Chequealo" className="w-full h-full object-contain" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Instalá Chequealo</h2>
                <p className="text-white/80 text-sm">Para recibir notificaciones en tu iPhone</p>
              </div>
            </div>

            {/* Important Notice */}
            <div className="bg-amber-500/20 border border-amber-400/30 rounded-xl p-3 mb-4">
              <div className="flex items-start gap-2">
                <Bell className="h-5 w-5 text-amber-300 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-white font-semibold text-sm">¡Importante para notificaciones!</p>
                  <p className="text-white/80 text-xs mt-1">
                    En iPhone, las notificaciones push <strong>solo funcionan</strong> si instalás la app. 
                    Seguí estos pasos para no perderte ningún mensaje.
                  </p>
                </div>
              </div>
            </div>

            {/* Steps */}
            <div className="space-y-3 mb-5">
              <div className="flex items-center gap-3 bg-white/10 rounded-xl p-3">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center flex-shrink-0">
                  <Share className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-white font-medium text-sm">Paso 1: Compartir</p>
                  <p className="text-white/70 text-xs">Tocá el ícono de compartir en la barra de Safari (abajo)</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 bg-white/10 rounded-xl p-3">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center flex-shrink-0">
                  <Plus className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-white font-medium text-sm">Paso 2: Agregar a inicio</p>
                  <p className="text-white/70 text-xs">Deslizá y seleccioná "Agregar a pantalla de inicio"</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 bg-white/10 rounded-xl p-3">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center flex-shrink-0">
                  <Check className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-white font-medium text-sm">Paso 3: Confirmar</p>
                  <p className="text-white/70 text-xs">Tocá "Agregar" arriba a la derecha</p>
                </div>
              </div>
            </div>

            {/* Benefits after install */}
            <div className="grid grid-cols-3 gap-2 mb-5">
              <div className="bg-white/10 rounded-lg p-2 text-center">
                <Bell className="h-5 w-5 text-green-400 mx-auto mb-1" />
                <span className="text-white/90 text-[10px]">Notificaciones</span>
              </div>
              <div className="bg-white/10 rounded-lg p-2 text-center">
                <Zap className="h-5 w-5 text-yellow-400 mx-auto mb-1" />
                <span className="text-white/90 text-[10px]">Más rápido</span>
              </div>
              <div className="bg-white/10 rounded-lg p-2 text-center">
                <Smartphone className="h-5 w-5 text-blue-400 mx-auto mb-1" />
                <span className="text-white/90 text-[10px]">Como app nativa</span>
              </div>
            </div>

            {/* Got it button */}
            <Button
              onClick={handleDismiss}
              className="w-full bg-white text-primary hover:bg-white/90 font-semibold py-5 text-base rounded-xl shadow-lg"
            >
              ¡Entendido, voy a instalarlo!
            </Button>
            
            <button
              onClick={handleDismiss}
              className="w-full text-white/60 hover:text-white text-xs mt-3 py-2"
            >
              Ahora no
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

// iOS Installation Guide Card - For use in settings/install pages
export const IOSInstallGuideCard: React.FC = () => {
  const isIOS = typeof navigator !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isInStandaloneMode = typeof window !== 'undefined' && window.matchMedia('(display-mode: standalone)').matches;

  if (!isIOS) return null;

  if (isInStandaloneMode) {
    return (
      <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg text-green-700 dark:text-green-300">
            <Check className="h-5 w-5" />
            App Instalada Correctamente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-green-600 dark:text-green-400">
            ¡Excelente! Estás usando Chequealo como aplicación. Ahora podés activar las notificaciones push 
            desde la configuración de la app.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg text-amber-700 dark:text-amber-300">
          <AlertTriangle className="h-5 w-5" />
          Instalá la App para Notificaciones
        </CardTitle>
        <CardDescription className="text-amber-600 dark:text-amber-400">
          En iPhone, las notificaciones push solo funcionan si instalás la app
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
              <Share className="h-4 w-4 text-primary-foreground" />
            </div>
            <div>
              <p className="font-medium text-sm">1. Abrí el menú compartir</p>
              <p className="text-xs text-muted-foreground">Tocá el ícono de compartir en la barra de Safari (abajo en el centro)</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
              <Plus className="h-4 w-4 text-primary-foreground" />
            </div>
            <div>
              <p className="font-medium text-sm">2. Agregá a pantalla de inicio</p>
              <p className="text-xs text-muted-foreground">Deslizá hacia abajo y seleccioná "Agregar a pantalla de inicio"</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
              <Check className="h-4 w-4 text-primary-foreground" />
            </div>
            <div>
              <p className="font-medium text-sm">3. Confirmá la instalación</p>
              <p className="text-xs text-muted-foreground">Tocá "Agregar" en la esquina superior derecha</p>
            </div>
          </div>
        </div>

        <div className="bg-blue-100 dark:bg-blue-900/30 rounded-lg p-3 mt-4">
          <p className="text-xs text-blue-700 dark:text-blue-300">
            <strong>💡 Tip:</strong> Una vez instalada, abrí la app desde el ícono en tu pantalla de inicio 
            y activá las notificaciones cuando te lo solicite. ¡Así no te perderás ningún mensaje!
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2">
          <ExternalLink className="h-3 w-3" />
          <span>Requisitos: iOS 16.4 o superior, Safari</span>
        </div>
      </CardContent>
    </Card>
  );
};