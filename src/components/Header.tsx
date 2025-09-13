import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Bell, User, MapPin, Search, Heart, Menu, X, BarChart3, LogOut, Shield } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import FilterDropdown from "./FilterDropdown";
import NotificationCenter from "./NotificationCenter";
import FavoritesPanel from "./FavoritesPanel";
import { provinceCityMap } from "../data/provinceCityData";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import { supabase } from "@/integrations/supabase/client";

const Header = () => {
  const { user, signOut, profile } = useAuth();
  const { isAdmin } = useUserRole();
  const navigate = useNavigate();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('latest');
  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isProfessional, setIsProfessional] = useState(false);

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
    setSelectedCity(''); // Reset city when province changes
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

  // Handle Enter key press in search input
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Remove unused handlers  
  const handleRemoveFavorite = () => {
    // This is now handled by the FavoritesPanel itself
  };

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
  };

  return (
    <header className="bg-navy shadow-lg border-b border-navy-light sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="text-2xl font-bold text-white">TodoAca.ar</div>
            <MapPin className="h-6 w-6 text-primary" />
          </Link>

          {/* Main Search Section */}
          <div className="flex items-center flex-1 max-w-5xl mx-4">
            {/* Location Display - Hidden on small screens */}
            <div className="hidden xl:flex items-center space-x-1 text-navy-foreground mr-4">
              <MapPin className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Rafaela, Santa Fe</span>
            </div>

            {/* Main Search Container - Increased width */}
            <div className="flex-1 bg-white rounded-lg shadow-sm border border-gray-200 p-1">
              <div className="flex items-center">
                {/* Search Input for Service/Professional - Increased space */}
                <div className="flex-1 relative">
                  <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 text-gray-400 h-6 w-6" />
                  <input
                    type="text"
                    placeholder="Ej: plomero, gasista, grúa"
                    value={searchTerm}
                    onChange={(e) => handleSearchTermChange(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="w-full pl-16 pr-4 py-3 bg-transparent text-gray-700 placeholder-gray-400 focus:outline-none text-sm font-medium"
                  />
                </div>

                {/* Province Select - Reduced space */}
                <select 
                  className="hidden md:block px-2 py-3 bg-transparent border-l border-gray-200 text-gray-700 text-sm focus:outline-none cursor-pointer flex-1"
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

                {/* City Select - Reduced space */}
                <select 
                  className="hidden lg:block px-2 py-3 bg-transparent border-l border-gray-200 text-gray-700 text-sm focus:outline-none cursor-pointer flex-1"
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
                  className="ml-2 bg-primary hover:bg-primary/90 px-8 py-3 h-auto rounded-md"
                >
                  <Search className="h-6 w-6" />
                  <span className="hidden sm:inline ml-2">Buscar</span>
                </Button>
              </div>
            </div>

            {/* Filter Dropdown - Reduced space */}
            <div className="hidden lg:block ml-2">
              <FilterDropdown
                options={filterOptions}
                selected={selectedFilter}
                onSelect={setSelectedFilter}
                placeholder="Ordenar por..."
              />
            </div>
          </div>

          {/* User Menu Button (Hamburger) */}
          <div className="flex items-center gap-2">
            {/* Notification Center */}
            {user && (
              <NotificationCenter />
            )}
            
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                className="text-navy-foreground"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              >
                {isUserMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>

              {/* User Menu Dropdown */}
              {isUserMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-[60]">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <h3 className="font-medium text-gray-900">Menú de Usuario</h3>
                  </div>
                
                {/* Auth and Professional Navigation */}
                <div className="px-4 py-2 space-y-2 border-b border-gray-100">
                  {user ? (
                    <>
                      <div className="text-sm text-gray-600 mb-2">
                        Hola, {profile?.full_name || 'Usuario'}
                      </div>
                      
                      <Link to="/user-dashboard" onClick={() => setIsUserMenuOpen(false)}>
                        <Button variant="outline" size="sm" className="w-full border-blue-500 text-blue-600 hover:bg-blue-500 hover:text-white">
                          <User className="h-4 w-4 mr-2" />
                          Mi Cuenta
                        </Button>
                      </Link>
                      
                      {isProfessional && (
                        <Link to="/dashboard" onClick={() => setIsUserMenuOpen(false)}>
                          <Button variant="outline" size="sm" className="w-full border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                            <BarChart3 className="h-4 w-4 mr-2" />
                            Mi Dashboard
                          </Button>
                        </Link>
                      )}
                      
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full" 
                        onClick={handleSignOut}
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Cerrar Sesión
                      </Button>
                    </>
                  ) : (
                    <>
                      <Link to="/auth" onClick={() => setIsUserMenuOpen(false)}>
                        <Button variant="outline" size="sm" className="w-full border-primary text-primary hover:bg-primary hover:text-primary-foreground">
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
                <div className="md:hidden px-4 py-2 space-y-2 border-b border-gray-100">
                  <select 
                    className="w-full px-3 py-2 rounded-md border border-gray-200 bg-white text-sm"
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
                    className="w-full px-3 py-2 rounded-md border border-gray-200 bg-white text-sm"
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

                {/* Favorites - Now uses real data */}
                <div className="px-4 py-2 bg-white">
                  <FavoritesPanel />
                </div>

                {/* Mobile Filter */}
                <div className="lg:hidden px-4 py-2 border-t border-gray-100 bg-white">
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
      </div>
    </header>
  );
};

export default Header;