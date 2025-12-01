import { useState, useEffect } from 'react';
import { X, ExternalLink, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const InAppBrowserBanner = () => {
  const [isInAppBrowser, setIsInAppBrowser] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  useEffect(() => {
    const userAgent = navigator.userAgent || navigator.vendor || '';
    
    // Detect Instagram, Facebook in-app browsers
    const isInstagram = /Instagram/i.test(userAgent);
    const isFacebookApp = /FBAN|FBAV/i.test(userAgent);
    
    if (isInstagram || isFacebookApp) {
      setIsInAppBrowser(true);
    }
  }, []);

  const handleCopyAndOpen = async () => {
    const currentUrl = window.location.href;
    
    try {
      await navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      setShowInstructions(true);
      
      // Try to open in external browser (works on some devices)
      // For iOS: window.open with _system
      // For Android: intent URL
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      
      if (isIOS) {
        // iOS Safari scheme
        window.location.href = `x-safari-${currentUrl}`;
      } else {
        // Android Chrome intent
        const intentUrl = `intent://${currentUrl.replace(/^https?:\/\//, '')}#Intent;scheme=https;package=com.android.chrome;end`;
        window.location.href = intentUrl;
      }
      
      // Reset copied state after 5 seconds
      setTimeout(() => {
        setCopied(false);
      }, 5000);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = currentUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setShowInstructions(true);
    }
  };

  if (!isInAppBrowser || isDismissed) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <ExternalLink className="h-5 w-5 flex-shrink-0" />
              <p className="font-bold text-base sm:text-lg">
                Para una mejor experiencia, abrí esta página en tu navegador
              </p>
            </div>
            
            {showInstructions ? (
              <div className="bg-white/20 rounded-lg p-3 mt-2">
                <div className="flex items-center gap-2 text-white font-semibold">
                  <Check className="h-5 w-5 text-green-200" />
                  <span>¡URL copiada!</span>
                </div>
                <p className="text-sm mt-1 text-white/90">
                  Ahora abrí <strong>Chrome</strong> o <strong>Safari</strong> y pegá el enlace en la barra de direcciones
                </p>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2 mt-2">
                <Button
                  onClick={handleCopyAndOpen}
                  className="bg-white text-orange-600 hover:bg-white/90 font-bold shadow-md"
                  size="sm"
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4 mr-1" />
                      Copiado
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-1" />
                      Abrir en navegador
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
          
          <button
            onClick={() => setIsDismissed(true)}
            className="p-1 hover:bg-white/20 rounded-full transition-colors flex-shrink-0"
            aria-label="Cerrar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
