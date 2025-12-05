import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import NotificationSystem from "@/components/NotificationSystem";
import { PWAInstallPrompt, IOSInstallInstructions } from "@/components/PWAInstallPrompt";
import { FloatingWhatsAppWidget } from "@/components/FloatingWhatsAppWidget";
import { MultipleFloatingChats } from "@/components/MultipleFloatingChats";
import { RedirectWithTracking } from "@/components/RedirectWithTracking";
import { InAppBrowserBanner } from "@/components/InAppBrowserBanner";

import Index from "./pages/Index";
import Search from "./pages/Search";
import Auth from "./pages/Auth";
import Register from "./pages/Register";
import Verification from "./pages/Verification";
import ProfessionalProfile from "./pages/ProfessionalProfile";
import ProfessionalDashboard from "./pages/ProfessionalDashboard";
import UserDashboard from "./pages/UserDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import SeoLanding from "./pages/SeoLanding";
import TermsOfService from "./pages/TermsOfService";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TestResults from "./pages/TestResults";
import NotFound from "./pages/NotFound";
import HowItWorks from "./pages/HowItWorks";
import FAQ from "./pages/FAQ";
import Pricing from "./pages/Pricing";
import AISearch from "./pages/AISearch";

// Campaign Landing Pages
import Urgencias24 from "./pages/campaigns/Urgencias24";
import PromoDescuento from "./pages/campaigns/PromoDescuento";
import SenaOnline from "./pages/campaigns/SenaOnline";

const App = () => (
  <TooltipProvider>
    <InAppBrowserBanner />
    <Toaster />
    <Sonner />
    <NotificationSystem />
    <PWAInstallPrompt />
    <IOSInstallInstructions />
    <FloatingWhatsAppWidget />
    
    <BrowserRouter>
      <MultipleFloatingChats />
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/inicio" element={<RedirectWithTracking from="/inicio" to="/" />} />
        <Route path="/home" element={<RedirectWithTracking from="/home" to="/" />} />
        <Route path="/principal" element={<RedirectWithTracking from="/principal" to="/" />} />
        <Route path="/index" element={<RedirectWithTracking from="/index" to="/" />} />
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
        <Route path="/terms" element={<TermsOfService />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/test-results" element={<TestResults />} />
        {/* Campaign Landing Pages */}
        <Route path="/urgencias" element={<Urgencias24 />} />
        <Route path="/promo" element={<PromoDescuento />} />
        <Route path="/sena" element={<SenaOnline />} />
        {/* SEO-friendly URLs - Must be after all other routes with 3+ segments */}
        <Route path="/p/:profession/:location/:name" element={<SeoLanding />} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  </TooltipProvider>
);

export default App;
