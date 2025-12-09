import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Bell, User, MapPin, Search, Heart, Menu, X, BarChart3, LogOut, Shield, Download } from "lucide-react";
import { usePWAInstall } from "@/components/PWAInstallPrompt";
import { Link, useNavigate } from "react-router-dom";
import FilterDropdown from "./FilterDropdown";
import NotificationCenter from "./NotificationCenter";
import FavoritesPanel from "./FavoritesPanel";
import { provinceCityMap } from "../data/provinceCityData";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import { supabase } from "@/integrations/supabase/client";
import chequealoLogo from "@/assets/chequealo-new-logo.png";

const Header = () => {
  const { user, signOut, profile } = useAuth();
  const { isAdmin } = useUserRole();
  const { canInstall, triggerInstall } = usePWAInstall();
  const navigate = useNavigate();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('latest');
  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isProfessional, setIsProfessional] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);

  useEffect(() => {
    checkIfProfessional();
  }, [user]);

  const checkIfProfessional = async () => {
    if (!user) {
      setIsProfessional(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('professionals')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error checking professional status:', error);
        return;
      }

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

  const handleProvinceChange = (provinceValue: string) => {
    console.log('Province changed to:', provinceValue);
    setSelectedProvince(provinceValue);
    setSelectedCity('');
  };

  const handleSearchTermChange = (value: string) => {
    console.log('Search term changed to:', value);
    setSearchTerm(value);
  };

  const getCitiesForProvince = (provinceValue: string) => {
    return provinceCityMap[provinceValue as keyof typeof provinceCityMap] || [];
  };

  const filterOptions = [
    { 
      value: 'latest', 
      label: 'Últimas publicaciones',
      description: 'Los profesionales agregados más recientemente'
    },
    { 
      value: 'rating', 
      label: 'Mejor puntuadas',
      description: 'Profesionales con mejores calificaciones'
    },
    { 
      value: 'price', 
      label: 'Precio',
      description: 'Ordenar por precio más conveniente'
    },
    { 
      value: 'speed', 
      label: 'Rapidez',
      description: 'Profesionales con respuesta más rápida'
    },
    { 
      value: 'quality', 
      label: 'Calidad',
      description: 'Profesionales destacados por calidad'
    }
  ];

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleRemoveFavorite = () => {};

  const handleSearch = () => {
    const params = new URLSearchParams();
    
    if (searchTerm.trim()) {
      params.append('q', searchTerm.trim());
    }
    
    if (selectedProvince) {
      params.append('location', selectedProvince);
    }
    
    if (selectedCity) {
      params.append('city', selectedCity);
    }
    
    if (selectedFilter && selectedFilter !== 'latest') {
      params.append('sort', selectedFilter);
    }
    
    const searchUrl = `/search${params.toString() ? `?${params.toString()}` : ''}`;
    navigate(searchUrl);
    setShowMobileSearch(false);
  };

  return (
    <header className="bg-navy shadow-lg border-b border-navy-light sticky top-0 z-50">
      <div className="container mx-auto px-2 sm:px-4">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Logo - Responsive */}
          <Link to="/" className="flex items-center flex-shrink-0">
            <img 
              src={chequealoLogo} 
              alt="Chequealo" 
              className="h-8 sm:h-10 md:h-12 w-auto" 
            />
          </Link>

          {/* Desktop Search Section - Hidden on mobile */}
          <div className="hidden md:flex items-center flex-1 max-w-4xl mx-4">
            {/* Location Display - Hidden on smaller screens */}
            <div className="hidden xl:flex items-center space-x-1 text-navy-foreground mr-4">
              <MapPin className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Rafaela, Santa Fe</span>
            </div>

            {/* Main Search Container */}
            <div className="flex-1 bg-card rounded-lg shadow-sm border p-1">
              <div className="flex items-center">
                {/* Search Input */}
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                  <input
                    type="text"
                    placeholder="Ej: plomero, gasista"
                    value={searchTerm}
                    onChange={(e) => handleSearchTermChange(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="w-full pl-12 pr-2 py-2.5 bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none text-sm font-medium"
                  />
                </div>

                {/* Province Select */}
                <select 
                  className="hidden lg:block px-2 py-2.5 bg-transparent border-l text-foreground text-sm focus:outline-none cursor-pointer w-32"
                  value={selectedProvince}
                  onChange={(e) => handleProvinceChange(e.target.value)}
                >
                  <option value="">Provincia</option>
                  {Object.keys(provinceCityMap).map((province) => (
                    <option key={province} value={province}>
                      {province.charAt(0).toUpperCase() + province.slice(1).replace('-', ' ')}
                    </option>
                  ))}
                </select>

                {/* City Select */}
                <select 
                  className="hidden xl:block px-2 py-2.5 bg-transparent border-l border-border text-foreground text-sm focus:outline-none cursor-pointer w-28"
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  disabled={!selectedProvince}
                >
                  <option value="">Ciudad</option>
                  {getCitiesForProvince(selectedProvince).map((city) => (
                    <option key={city} value={city.toLowerCase().replace(/\s+/g, '-')}>
                      {city}
                    </option>
                  ))}
                </select>

                {/* Search Button */}
                <Button 
                  onClick={handleSearch}
                  className="ml-2 bg-primary hover:bg-primary/90 px-4 py-2.5 h-auto rounded-md"
                >
                  <Search className="h-5 w-5" />
                  <span className="hidden lg:inline ml-2">Buscar</span>
                </Button>
              </div>
            </div>

            {/* Filter Dropdown */}
            <div className="hidden lg:block ml-2">
              <FilterDropdown
                options={filterOptions}
                selected={selectedFilter}
                onSelect={setSelectedFilter}
                placeholder="Ordenar..."
              />
            </div>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Mobile Search Button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden text-navy-foreground p-2"
              onClick={() => setShowMobileSearch(!showMobileSearch)}
            >
              <Search className="h-5 w-5" />
            </Button>

            {/* Notification Center */}
            {user && <NotificationCenter />}
            
            {/* User Menu */}
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                className="text-navy-foreground p-2"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              >
                {isUserMenuOpen ? <X className="h-5 w-5 sm:h-6 sm:w-6" /> : <Menu className="h-5 w-5 sm:h-6 sm:w-6" />}
              </Button>

              {/* User Menu Dropdown */}
              {isUserMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-72 sm:w-80 bg-popover rounded-lg shadow-lg border border-border py-2 z-[60]">
                  <div className="px-4 py-2 border-b border-border">
                    <h3 className="font-medium text-popover-foreground">Menú de Usuario</h3>
                  </div>
                
                  {/* Auth and Navigation */}
                  <div className="px-4 py-2 space-y-2 border-b border-border">
                    {user ? (
                      <>
                        <div className="text-sm text-muted-foreground mb-2">
                          Hola, <span className="uppercase font-medium">{profile?.full_name || 'Usuario'}</span>
                        </div>
                        
                        <Link to="/user-dashboard" onClick={() => setIsUserMenuOpen(false)}>
                          <Button variant="outline" size="sm" className="w-full justify-start border-blue-500 text-blue-600 hover:bg-blue-500 hover:text-white">
                            <User className="h-4 w-4 mr-2" />
                            Mi Cuenta
                          </Button>
                        </Link>

                        {(isAdmin || (user?.email?.toLowerCase() === 'autosrafaela@gmail.com')) && (
                          <Link to="/admin" onClick={() => setIsUserMenuOpen(false)}>
                            <Button variant="outline" size="sm" className="w-full justify-start border-emerald-500 text-emerald-600 hover:bg-emerald-500 hover:text-white">
                              <Shield className="h-4 w-4 mr-2" />
                              Admin
                            </Button>
                          </Link>
                        )}
                        
                        {isProfessional && (
                          <Link to="/dashboard" onClick={() => setIsUserMenuOpen(false)}>
                            <Button variant="outline" size="sm" className="w-full justify-start border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                              <BarChart3 className="h-4 w-4 mr-2" />
                              Mi Dashboard
                            </Button>
                          </Link>
                        )}
                        
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full justify-start" 
                          onClick={handleSignOut}
                        >
                          <LogOut className="h-4 w-4 mr-2" />
                          Cerrar Sesión
                        </Button>
                      </>
                    ) : (
                      <>
                        <Link to="/auth" onClick={() => setIsUserMenuOpen(false)}>
                          <Button variant="outline" size="sm" className="w-full justify-start border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                            <User className="h-4 w-4 mr-2" />
                            Iniciar Sesión
                          </Button>
                        </Link>
                        <Link to="/register" onClick={() => setIsUserMenuOpen(false)}>
                          <Button size="sm" className="w-full bg-primary hover:bg-primary/90">
                            Registrarse
                          </Button>
                        </Link>
                      </>
                    )}
                  </div>
                  
                  {/* Mobile Location Selectors */}
                  <div className="lg:hidden px-4 py-3 space-y-2 border-b border-border">
                    <p className="text-xs text-muted-foreground font-medium mb-1">Ubicación</p>
                    <select 
                      className="w-full px-3 py-2 rounded-md border border-border bg-background text-sm"
                      value={selectedProvince}
                      onChange={(e) => handleProvinceChange(e.target.value)}
                    >
                      <option value="">Seleccionar Provincia</option>
                      {Object.keys(provinceCityMap).map((province) => (
                        <option key={province} value={province}>
                          {province.charAt(0).toUpperCase() + province.slice(1).replace('-', ' ')}
                        </option>
                      ))}
                    </select>
                    <select 
                      className="w-full px-3 py-2 rounded-md border border-border bg-background text-sm"
                      value={selectedCity}
                      onChange={(e) => setSelectedCity(e.target.value)}
                      disabled={!selectedProvince}
                    >
                      <option value="">Seleccionar Ciudad</option>
                      {getCitiesForProvince(selectedProvince).map((city) => (
                        <option key={city} value={city.toLowerCase().replace(/\s+/g, '-')}>
                          {city}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Favorites */}
                  <div className="px-4 py-2 border-b border-border">
                    <FavoritesPanel />
                  </div>

                  {/* Install App Button */}
                  {canInstall && (
                    <div className="px-4 py-2 border-b border-border">
                      <Button
                        onClick={() => {
                          triggerInstall();
                          setIsUserMenuOpen(false);
                        }}
                        variant="outline"
                        size="sm"
                        className="w-full justify-start border-green-500 text-green-600 hover:bg-green-500 hover:text-white"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Instalar App
                      </Button>
                    </div>
                  )}

                  {/* Mobile Filter */}
                  <div className="lg:hidden px-4 py-2">
                    <p className="text-xs text-muted-foreground font-medium mb-1">Ordenar por</p>
                    <FilterDropdown
                      options={filterOptions}
                      selected={selectedFilter}
                      onSelect={setSelectedFilter}
                      placeholder="Ordenar por..."
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Search Expanded */}
        {showMobileSearch && (
          <div className="md:hidden pb-3 animate-in slide-in-from-top-2">
            <div className="bg-card rounded-lg shadow-sm border p-2">
              <div className="flex items-center gap-2">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Buscar profesional..."
                    value={searchTerm}
                    onChange={(e) => handleSearchTermChange(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="w-full pl-10 pr-2 py-2.5 bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none text-sm"
                    autoFocus
                  />
                </div>
                <Button 
                  onClick={handleSearch}
                  size="sm"
                  className="bg-primary hover:bg-primary/90 px-4"
                >
                  Buscar
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;