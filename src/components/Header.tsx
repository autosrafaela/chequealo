import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Bell, User, MapPin, Search, Heart, Menu, X } from "lucide-react";
import { Link } from "react-router-dom";
import FilterDropdown from "./FilterDropdown";
import NotificationPanel from "./NotificationPanel";
import FavoritesPanel from "./FavoritesPanel";
import { provinceCityMap } from "../data/provinceCityData";

const Header = () => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('latest');
  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const handleProvinceChange = (provinceValue: string) => {
    setSelectedProvince(provinceValue);
    setSelectedCity(''); // Reset city when province changes
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

  // Mock notification handlers
  const handleMarkAsRead = (id: string) => {
    console.log('Marking notification as read:', id);
  };

  const handleMarkAllAsRead = () => {
    console.log('Marking all notifications as read');
  };

  const handleRemoveFavorite = (id: string) => {
    console.log('Removing favorite:', id);
  };

  const handleSearch = () => {
    console.log('Searching for:', searchTerm, 'in', selectedProvince, selectedCity);
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
          <div className="flex items-center flex-1 max-w-4xl mx-8">
            {/* Location Display - Hidden on small screens */}
            <div className="hidden xl:flex items-center space-x-1 text-navy-foreground mr-6">
              <MapPin className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Rafaela, Santa Fe</span>
            </div>

            {/* Main Search Container */}
            <div className="flex-1 bg-white rounded-lg shadow-sm border border-gray-200 p-1">
              <div className="flex items-center">
                {/* Search Input for Service/Professional */}
                <div className="flex-1 relative">
                  <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    placeholder="Ej: plomero, grúa, veterinario..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-16 pr-4 py-4 bg-transparent text-gray-700 placeholder-gray-400 focus:outline-none text-sm font-medium"
                  />
                </div>

                {/* Province Select - Hidden on small screens */}
                <select 
                  className="hidden md:block px-3 py-3 bg-transparent border-l border-gray-200 text-gray-700 text-sm focus:outline-none cursor-pointer"
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

                {/* City Select - Hidden on small screens */}
                <select 
                  className="hidden lg:block px-3 py-3 bg-transparent border-l border-gray-200 text-gray-700 text-sm focus:outline-none cursor-pointer"
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

            {/* Filter Dropdown - Hidden on small screens */}
            <div className="hidden lg:block ml-4">
              <FilterDropdown
                options={filterOptions}
                selected={selectedFilter}
                onSelect={setSelectedFilter}
                placeholder="Ordenar por..."
              />
            </div>
          </div>

          {/* User Menu Button (Hamburger) */}
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
                
                {/* Auth Buttons - Moved to top */}
                <div className="px-4 py-2 space-y-2 border-b border-gray-100">
                  <Link to="/login" onClick={() => setIsUserMenuOpen(false)}>
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

                {/* Favorites - Moved down */}
                <div className="px-4 py-2 bg-white">
                  <FavoritesPanel 
                    favorites={[]}
                    onRemoveFavorite={handleRemoveFavorite}
                  />
                </div>
                
                {/* Notifications - Moved down */}
                <div className="px-4 py-2 bg-white">
                  <NotificationPanel
                    notifications={[]}
                    unreadCount={0}
                    onMarkAsRead={handleMarkAsRead}
                    onMarkAllAsRead={handleMarkAllAsRead}
                  />
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
    </header>
  );
};

export default Header;