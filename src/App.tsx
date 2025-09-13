import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import NotificationSystem from "@/components/NotificationSystem";
import { PWAInstallPrompt, IOSInstallInstructions } from "@/components/PWAInstallPrompt";
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
import NotFound from "./pages/NotFound";

const App = () => (
  <TooltipProvider>
    <Toaster />
    <Sonner />
    <NotificationSystem />
    <PWAInstallPrompt />
    <IOSInstallInstructions />
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/search" element={<Search />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verification" element={<Verification />} />
        <Route path="/professional/:id" element={<ProfessionalProfile />} />
        <Route path="/dashboard" element={<ProfessionalDashboard />} />
        <Route path="/user-dashboard" element={<UserDashboard />} />
        <Route path="/admin" element={<AdminDashboard />} />
        {/* SEO-friendly URLs */}
        <Route path="/:profession/:location/:name" element={<SeoLanding />} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  </TooltipProvider>
);

export default App;
