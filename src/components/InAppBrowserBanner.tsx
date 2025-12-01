import { useState, useEffect } from 'react';
import { X, ExternalLink, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const InAppBrowserBanner = () => {
  const [isInAppBrowser, setIsInAppBrowser] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [browserName, setBrowserName] = useState('');

  useEffect(() => {
    const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera || '';
    
    // More comprehensive detection for in-app browsers
    const patterns = {
      instagram: /Instagram/i,
      facebook: /FBAN|FBAV|FB_IAB|FBIOS|FB4A/i,
      twitter: /Twitter/i,
      linkedin: /LinkedInApp/i,
      tiktok: /TikTok/i,
      snapchat: /Snapchat/i,
      pinterest: /Pinterest/i,
      // Generic WebView detection
      webview: /\bwv\b|WebView/i,
    };
    
    // Check for Instagram first (most common case)
    if (patterns.instagram.test(userAgent)) {
      setIsInAppBrowser(true);
      setBrowserName('Instagram');
      console.log('[InAppBrowserBanner] Detected Instagram in-app browser');
      return;
    }
    
    // Check for Facebook
    if (patterns.facebook.test(userAgent)) {
      setIsInAppBrowser(true);
      setBrowserName('Facebook');
      console.log('[InAppBrowserBanner] Detected Facebook in-app browser');
      return;
    }
    
    // Check for other social media apps
    if (patterns.twitter.test(userAgent)) {
      setIsInAppBrowser(true);
      setBrowserName('Twitter');
      console.log('[InAppBrowserBanner] Detected Twitter in-app browser');
      return;
    }
    
    if (patterns.linkedin.test(userAgent)) {
      setIsInAppBrowser(true);
      setBrowserName('LinkedIn');
      console.log('[InAppBrowserBanner] Detected LinkedIn in-app browser');
      return;
    }
    
    if (patterns.tiktok.test(userAgent)) {
      setIsInAppBrowser(true);
      setBrowserName('TikTok');
      console.log('[InAppBrowserBanner] Detected TikTok in-app browser');
      return;
    }
    
    if (patterns.snapchat.test(userAgent)) {
      setIsInAppBrowser(true);
      setBrowserName('Snapchat');
      console.log('[InAppBrowserBanner] Detected Snapchat in-app browser');
      return;
    }
    
    if (patterns.pinterest.test(userAgent)) {
      setIsInAppBrowser(true);
      setBrowserName('Pinterest');
      console.log('[InAppBrowserBanner] Detected Pinterest in-app browser');
      return;
    }
    
    // Additional check: standalone mode detection (for PWA vs browser)
    // In-app browsers often have specific characteristics
    const isStandalone = (window.navigator as any).standalone || window.matchMedia('(display-mode: standalone)').matches;
    
    // Check if it's a mobile device with WebView characteristics
    const isMobile = /Android|iPhone|iPad|iPod/i.test(userAgent);
    const isWebView = patterns.webview.test(userAgent);
    
    // Log user agent for debugging (only in development or when there's an issue)
    if (isMobile && !isStandalone) {
      console.log('[InAppBrowserBanner] User Agent:', userAgent);
    }
    
    if (isMobile && isWebView && !isStandalone) {
      setIsInAppBrowser(true);
      setBrowserName('esta app');
      console.log('[InAppBrowserBanner] Detected generic WebView');
    }
  }, []);

  const handleCopyAndOpen = async () => {
    const currentUrl = window.location.href;
    
    try {
      await navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      setShowInstructions(true);
      
      // Try to open in external browser (works on some devices)
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      
      if (isIOS) {
        // iOS Safari scheme - use googlechrome or safari
        // Note: x-safari- scheme doesn't work reliably
        // Instead, just show instructions
      } else {
        // Android Chrome intent
        const intentUrl = `intent://${currentUrl.replace(/^https?:\/\//, '')}#Intent;scheme=https;package=com.android.chrome;end`;
        try {
          window.location.href = intentUrl;
        } catch (e) {
          console.log('[InAppBrowserBanner] Intent failed, showing manual instructions');
        }
      }
      
      // Reset copied state after 10 seconds
      setTimeout(() => {
        setCopied(false);
      }, 10000);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = currentUrl;
      textArea.style.position = 'fixed';
      textArea.style.left = '-9999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
        setCopied(true);
        setShowInstructions(true);
      } catch (e) {
        console.error('[InAppBrowserBanner] Copy failed:', e);
      }
      document.body.removeChild(textArea);
    }
  };

  // Also check localStorage to not show again if dismissed recently
  useEffect(() => {
    const dismissedAt = localStorage.getItem('inAppBannerDismissed');
    if (dismissedAt) {
      const dismissedTime = parseInt(dismissedAt, 10);
      const hoursSinceDismissed = (Date.now() - dismissedTime) / (1000 * 60 * 60);
      // Don't show again for 24 hours after dismissing
      if (hoursSinceDismissed < 24) {
        setIsDismissed(true);
      }
    }
  }, []);

  const handleDismiss = () => {
    setIsDismissed(true);
    localStorage.setItem('inAppBannerDismissed', Date.now().toString());
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
                Abrí esta página en tu navegador
              </p>
            </div>
            
            <p className="text-sm text-white/90 mb-2">
              El navegador de {browserName} tiene limitaciones. Para una mejor experiencia, abrí en Chrome o Safari.
            </p>
            
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
                      Copiar enlace
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
          
          <button
            onClick={handleDismiss}
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
