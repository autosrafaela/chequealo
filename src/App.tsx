import { lazy, Suspense, useEffect } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { NotificationProvider } from "@/contexts/NotificationContext";
import NotificationPopupWrapper from "@/components/NotificationPopupWrapper";
import { PWAInstallPrompt, IOSInstallInstructions } from "@/components/PWAInstallPrompt";
import { FloatingWhatsAppWidget } from "@/components/FloatingWhatsAppWidget";
import { MultipleFloatingChats } from "@/components/MultipleFloatingChats";
import { RedirectWithTracking } from "@/components/RedirectWithTracking";
import { InAppBrowserBanner } from "@/components/InAppBrowserBanner";
import { NotificationActivationBanner } from "@/components/NotificationActivationBanner";
import { UpdateNotificationBanner } from "@/components/UpdateNotificationBanner";
import { PageLoader } from "@/components/ui/page-loader";
import { initializeAudioContext } from "@/utils/notificationSound";
import { useServiceWorkerUpdate } from "@/hooks/useServiceWorkerUpdate";

// Critical path - load immediately (homepage)
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

// Lazy loaded pages - load on demand
const Search = lazy(() => import("./pages/Search"));
const AISearch = lazy(() => import("./pages/AISearch"));
const Auth = lazy(() => import("./pages/Auth"));
const Register = lazy(() => import("./pages/Register"));
const Verification = lazy(() => import("./pages/Verification"));
const ProfessionalProfile = lazy(() => import("./pages/ProfessionalProfile"));
const ProfessionalDashboard = lazy(() => import("./pages/ProfessionalDashboard"));
const UserDashboard = lazy(() => import("./pages/UserDashboard"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const SeoLanding = lazy(() => import("./pages/SeoLanding"));
const TermsOfService = lazy(() => import("./pages/TermsOfService"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const TestResults = lazy(() => import("./pages/TestResults"));
const HowItWorks = lazy(() => import("./pages/HowItWorks"));
const FAQ = lazy(() => import("./pages/FAQ"));
const Pricing = lazy(() => import("./pages/Pricing"));
const Install = lazy(() => import("./pages/Install"));

// Campaign Landing Pages - lazy loaded
const Urgencias24 = lazy(() => import("./pages/campaigns/Urgencias24"));
const PromoDescuento = lazy(() => import("./pages/campaigns/PromoDescuento"));
const SenaOnline = lazy(() => import("./pages/campaigns/SenaOnline"));

// Global audio initialization on first user interaction
const useGlobalAudioInit = () => {
  useEffect(() => {
    let initialized = false;
    
    const handleFirstInteraction = async () => {
      if (initialized) return;
      initialized = true;
      
      console.log('[App] First user interaction - initializing audio');
      await initializeAudioContext();
      
      // Remove listeners after first interaction
      document.removeEventListener('click', handleFirstInteraction, true);
      document.removeEventListener('touchstart', handleFirstInteraction, true);
      document.removeEventListener('keydown', handleFirstInteraction, true);
    };
    
    document.addEventListener('click', handleFirstInteraction, true);
    document.addEventListener('touchstart', handleFirstInteraction, true);
    document.addEventListener('keydown', handleFirstInteraction, true);
    
    return () => {
      document.removeEventListener('click', handleFirstInteraction, true);
      document.removeEventListener('touchstart', handleFirstInteraction, true);
      document.removeEventListener('keydown', handleFirstInteraction, true);
    };
  }, []);
};

const App = () => {
  useGlobalAudioInit();
  const { updateAvailable, isUpdating, updateApp } = useServiceWorkerUpdate();
  
  return (
  <NotificationProvider>
    <TooltipProvider>
      {updateAvailable && (
        <UpdateNotificationBanner onUpdate={updateApp} isUpdating={isUpdating} />
      )}
      <InAppBrowserBanner />
      <NotificationActivationBanner />
      <Toaster />
      <Sonner />
      <NotificationPopupWrapper />
      <PWAInstallPrompt />
      <IOSInstallInstructions />
      <FloatingWhatsAppWidget />
    
    <BrowserRouter>
      <MultipleFloatingChats />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Critical path - no lazy loading */}
          <Route path="/" element={<Index />} />
          
          {/* Redirects */}
          <Route path="/inicio" element={<RedirectWithTracking from="/inicio" to="/" />} />
          <Route path="/home" element={<RedirectWithTracking from="/home" to="/" />} />
          <Route path="/principal" element={<RedirectWithTracking from="/principal" to="/" />} />
          <Route path="/index" element={<RedirectWithTracking from="/index" to="/" />} />
          
          {/* Lazy loaded routes */}
          <Route path="/search" element={<Search />} />
          <Route path="/ai-search" element={<AISearch />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verification" element={<Verification />} />
          <Route path="/professional/:id" element={<ProfessionalProfile />} />
          <Route path="/dashboard" element={<ProfessionalDashboard />} />
          <Route path="/user-dashboard" element={<UserDashboard />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/instalar" element={<Install />} />
          <Route path="/terms" element={<TermsOfService />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/test-results" element={<TestResults />} />
          
          {/* Campaign Landing Pages */}
          <Route path="/urgencias" element={<Urgencias24 />} />
          <Route path="/promo" element={<PromoDescuento />} />
          <Route path="/sena" element={<SenaOnline />} />
          
          {/* SEO-friendly URLs - Must be after all other routes with 3+ segments */}
          <Route path="/p/:profession/:location/:name" element={<SeoLanding />} />
          
          {/* Catch-all - no lazy loading for fast 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
    </TooltipProvider>
  </NotificationProvider>
  );
};

export default App;
