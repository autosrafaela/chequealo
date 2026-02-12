import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Bell, User, MapPin, Search, Heart, Menu, X, BarChart3, LogOut, Shield, Download, MessageCircle, Newspaper } from "lucide-react";
import { usePWAInstall } from "@/components/PWAInstallPrompt";
import { Link, useNavigate } from "react-router-dom";
import FilterDropdown from "./FilterDropdown";
import NotificationCenter from "./NotificationCenter";
import FavoritesPanel from "./FavoritesPanel";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import { supabase } from "@/integrations/supabase/client";
import chequealoLogo from "@/assets/chequealo-new-logo.png";

const filterOptions = [
  { value: 'latest', label: 'Últimas publicaciones', description: 'Los profesionales agregados más recientemente' },
  { value: 'rating', label: 'Mejor puntuadas', description: 'Profesionales con mejores calificaciones' },
  { value: 'price', label: 'Precio', description: 'Ordenar por precio más conveniente' },
  { value: 'speed', label: 'Rapidez', description: 'Profesionales con respuesta más rápida' },
  { value: 'quality', label: 'Calidad', description: 'Profesionales destacados por calidad' },
];

const Header = () => {
  const { user, signOut, profile } = useAuth();
  const { isAdmin } = useUserRole();
  const { canInstall, triggerInstall } = usePWAInstall();
  const navigate = useNavigate();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('latest');
  const [isProfessional, setIsProfessional] = useState(false);

  useEffect(() => {
    checkIfProfessional();
  }, [user]);

  const checkIfProfessional = async () => {
    if (!user) { setIsProfessional(false); return; }
    try {
      const { data } = await supabase.from('professionals').select('id').eq('user_id', user.id).maybeSingle();
      setIsProfessional(!!data);
    } catch (error) {
      console.error('Error checking professional status:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
      setIsUserMenuOpen(false);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleSuggestionContact = () => {
    const adminPhone = '5493492607224';
    const msg = encodeURIComponent('Hola! Tengo una sugerencia para Chequealo: ');
    const isMobile = /Android|iPhone|iPad|iPod|Windows Phone|webOS|BlackBerry/i.test(navigator.userAgent);
    const candidates = isMobile
      ? [`whatsapp://send?phone=${adminPhone}&text=${msg}`, `https://wa.me/${adminPhone}?text=${msg}`]
      : [`https://wa.me/${adminPhone}?text=${msg}`, `https://web.whatsapp.com/send?phone=${adminPhone}&text=${msg}`];
    let opened = false;
    for (const url of candidates) {
      const w = window.open(url, '_blank');
      if (w) { opened = true; break; }
    }
    if (!opened) window.location.href = candidates[0];
    setIsUserMenuOpen(false);
  };

  return (
    <header className="bg-white/80 backdrop-blur-xl border-b border-black/5 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 sm:h-[4.5rem]">
          {/* Logo + Badge */}
          <Link to="/" className="flex items-center flex-shrink-0 gap-3">
            <img src={chequealoLogo} alt="Chequealo" className="h-8 sm:h-10 md:h-11 w-auto" />
            <span className="hidden sm:inline-flex bg-gradient-to-r from-amber-400 to-orange-400 text-black text-[10px] sm:text-xs font-bold px-3 py-1 rounded-full tracking-wide">
              PIONEROS
            </span>
          </Link>

          {/* Center: Location (desktop only) */}
          <div className="hidden md:flex items-center gap-1.5 text-muted-foreground">
            <MapPin className="h-3.5 w-3.5 text-primary" />
            <span className="text-sm font-medium">Rafaela, Santa Fe</span>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-1">
            {/* Search icon */}
            <Button
              variant="ghost"
              size="sm"
              className="text-foreground p-2 hover:bg-black/5"
              onClick={() => navigate('/search')}
            >
              <Search className="h-5 w-5" />
            </Button>

            {/* Notifications */}
            {user && <NotificationCenter />}

            {/* Hamburger */}
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                className="text-foreground p-2 hover:bg-black/5"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              >
                {isUserMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>

              {isUserMenuOpen && (
                <div className="absolute right-0 top-full mt-3 w-80 bg-white rounded-2xl shadow-2xl border border-black/5 py-3 z-[60]">
                  {/* Auth section */}
                  <div className="px-5 py-3 border-b border-black/5">
                    {user ? (
                      <div className="space-y-2.5">
                        <p className="text-sm text-muted-foreground">
                          Hola, <span className="font-semibold text-foreground">{profile?.full_name || 'Usuario'}</span>
                        </p>
                        <Link to="/user-dashboard" onClick={() => setIsUserMenuOpen(false)}>
                          <Button variant="outline" size="sm" className="w-full justify-start">
                            <User className="h-4 w-4 mr-2" /> Mi Cuenta
                          </Button>
                        </Link>
                        {(isAdmin || user?.email?.toLowerCase() === 'autosrafaela@gmail.com') && (
                          <Link to="/admin" onClick={() => setIsUserMenuOpen(false)}>
                            <Button variant="outline" size="sm" className="w-full justify-start">
                              <Shield className="h-4 w-4 mr-2" /> Admin
                            </Button>
                          </Link>
                        )}
                        {isProfessional && (
                          <Link to="/dashboard" onClick={() => setIsUserMenuOpen(false)}>
                            <Button variant="outline" size="sm" className="w-full justify-start">
                              <BarChart3 className="h-4 w-4 mr-2" /> Mi Dashboard
                            </Button>
                          </Link>
                        )}
                        <Button variant="outline" size="sm" className="w-full justify-start" onClick={handleSignOut}>
                          <LogOut className="h-4 w-4 mr-2" /> Cerrar Sesión
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-2.5">
                        <Link to="/auth" onClick={() => setIsUserMenuOpen(false)}>
                          <Button variant="outline" size="sm" className="w-full justify-start">
                            <User className="h-4 w-4 mr-2" /> Iniciar Sesión
                          </Button>
                        </Link>
                        <Link to="/register" onClick={() => setIsUserMenuOpen(false)}>
                          <Button size="sm" className="w-full bg-primary hover:bg-primary/90">Registrarse</Button>
                        </Link>
                      </div>
                    )}
                  </div>

                  {/* Quick actions */}
                  <div className="px-5 py-3 space-y-2 border-b border-black/5">
                    <Button variant="ghost" size="sm" className="w-full justify-start text-foreground hover:bg-black/5" onClick={handleSuggestionContact}>
                      <MessageCircle className="h-4 w-4 mr-2 text-green-500" /> Sugerencias
                    </Button>
                    <Link to="/search?sort=latest" onClick={() => setIsUserMenuOpen(false)}>
                      <Button variant="ghost" size="sm" className="w-full justify-start text-foreground hover:bg-black/5">
                        <Newspaper className="h-4 w-4 mr-2 text-primary" /> Publicaciones
                      </Button>
                    </Link>
                  </div>

                  {/* Favorites */}
                  <div className="px-5 py-3 border-b border-black/5">
                    <FavoritesPanel />
                  </div>

                  {/* Filter */}
                  <div className="px-5 py-3 border-b border-black/5">
                    <p className="text-xs text-muted-foreground font-medium mb-2">Ordenar por</p>
                    <FilterDropdown options={filterOptions} selected={selectedFilter} onSelect={setSelectedFilter} placeholder="Ordenar por..." />
                  </div>

                  {/* Install */}
                  {canInstall && (
                    <div className="px-5 py-3">
                      <Button onClick={() => { triggerInstall(); setIsUserMenuOpen(false); }} variant="outline" size="sm" className="w-full justify-start">
                        <Download className="h-4 w-4 mr-2 text-green-500" /> Instalar App
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
