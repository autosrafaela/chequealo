import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Bell, User, MapPin, Search, Heart, Menu, X } from "lucide-react";
import { Link } from "react-router-dom";
import FilterDropdown from "./FilterDropdown";
import NotificationPanel from "./NotificationPanel";
import FavoritesPanel from "./FavoritesPanel";

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('latest');
  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedCity, setSelectedCity] = useState('');

  // Mapeo de provincias y sus ciudades
  const provinceCityMap = {
    'buenos-aires': ['La Plata', 'Mar del Plata', 'Bahía Blanca', 'Tandil', 'Olavarría', 'Pergamino', 'Junín', 'Azul'],
    'gba': ['Vicente López', 'San Isidro', 'Tigre', 'San Martín', 'Tres de Febrero', 'Morón', 'Ituzaingó', 'Merlo', 'Moreno', 'José C. Paz', 'Malvinas Argentinas', 'San Miguel', 'Hurlingham', 'San Fernando', 'Escobar'],
    'catamarca': ['San Fernando del Valle de Catamarca', 'Belén', 'Tinogasta', 'Andalgalá', 'Santa María'],
    'chaco': ['Resistencia', 'Barranqueras', 'Fontana', 'Puerto Vilelas', 'Presidencia Roque Sáenz Peña'],
    'chubut': ['Rawson', 'Comodoro Rivadavia', 'Puerto Madryn', 'Trelew', 'Esquel'],
    'cordoba': ['Córdoba', 'Villa Carlos Paz', 'Río Cuarto', 'San Francisco', 'Villa María', 'Alta Gracia'],
    'corrientes': ['Corrientes', 'Goya', 'Mercedes', 'Curuzú Cuatiá', 'Paso de los Libres'],
    'entre-rios': ['Paraná', 'Concordia', 'Gualeguaychú', 'Concepción del Uruguay', 'Victoria'],
    'formosa': ['Formosa', 'Clorinda', 'Pirané', 'El Colorado', 'Ingeniero Juárez'],
    'jujuy': ['San Salvador de Jujuy', 'San Pedro', 'Libertador General San Martín', 'Palpalá', 'Perico'],
    'la-pampa': ['Santa Rosa', 'General Pico', 'Toay', 'Realicó', 'Eduardo Castex'],
    'la-rioja': ['La Rioja', 'Chilecito', 'Aimogasta', 'Chamical', 'Chepes'],
    'mendoza': ['Mendoza', 'San Rafael', 'Godoy Cruz', 'Guaymallén', 'Las Heras', 'Maipú'],
    'misiones': ['Posadas', 'Oberá', 'Eldorado', 'Puerto Iguazú', 'Apóstoles'],
    'neuquen': ['Neuquén', 'Plottier', 'Cipolletti', 'San Martín de los Andes', 'Villa La Angostura'],
    'rio-negro': ['Viedma', 'San Carlos de Bariloche', 'General Roca', 'Cipolletti', 'Allen'],
    'salta': ['Salta', 'San Ramón de la Nueva Orán', 'Tartagal', 'Cafayate', 'Metán'],
    'san-juan': ['San Juan', 'Rivadavia', 'Chimbas', 'Rawson', 'Pocito'],
    'san-luis': ['San Luis', 'Villa Mercedes', 'Merlo', 'La Punta', 'Juana Koslay'],
    'santa-cruz': ['Río Gallegos', 'Caleta Olivia', 'Pico Truncado', 'Puerto Deseado', 'El Calafate'],
    'santa-fe': ['Santa Fe', 'Rosario', 'Rafaela', 'Venado Tuerto', 'Reconquista', 'Villa Constitución', 'Casilda', 'Esperanza'],
    'santiago-del-estero': ['Santiago del Estero', 'La Banda', 'Termas de Río Hondo', 'Añatuya', 'Fernández'],
    'tierra-del-fuego': ['Ushuaia', 'Río Grande', 'Tolhuin', 'Puerto Williams'],
    'tucuman': ['San Miguel de Tucumán', 'Yerba Buena', 'Tafí Viejo', 'Concepción', 'Aguilares']
  };

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

  return (
    <header className="bg-navy shadow-lg border-b border-navy-light sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="text-2xl font-bold text-white">TodoAca.ar</div>
            <MapPin className="h-6 w-6 text-primary" />
          </Link>

          {/* Desktop Navigation - Main Search Section */}
          <div className="hidden lg:flex items-center flex-1 max-w-4xl mx-8">
            {/* Location Display */}
            <div className="flex items-center space-x-1 text-navy-foreground mr-6">
              <MapPin className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Rafaela, Santa Fe</span>
            </div>

            {/* Main Search Container */}
            <div className="flex-1 bg-white rounded-lg shadow-sm border border-gray-200 p-1">
              <div className="flex items-center">
                {/* Search Input */}
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="¿Qué servicio buscás?"
                    className="w-full pl-10 pr-4 py-3 bg-transparent text-gray-700 placeholder-gray-400 focus:outline-none text-sm font-medium"
                  />
                </div>

                {/* Province Select */}
                <select 
                  className="px-3 py-3 bg-transparent border-l border-gray-200 text-gray-700 text-sm focus:outline-none cursor-pointer"
                  value={selectedProvince}
                  onChange={(e) => handleProvinceChange(e.target.value)}
                >
                  <option value="">Provincia</option>
                  <option value="buenos-aires">Buenos Aires</option>
                  <option value="gba">GBA</option>
                  <option value="catamarca">Catamarca</option>
                  <option value="chaco">Chaco</option>
                  <option value="chubut">Chubut</option>
                  <option value="cordoba">Córdoba</option>
                  <option value="corrientes">Corrientes</option>
                  <option value="entre-rios">Entre Ríos</option>
                  <option value="formosa">Formosa</option>
                  <option value="jujuy">Jujuy</option>
                  <option value="la-pampa">La Pampa</option>
                  <option value="la-rioja">La Rioja</option>
                  <option value="mendoza">Mendoza</option>
                  <option value="misiones">Misiones</option>
                  <option value="neuquen">Neuquén</option>
                  <option value="rio-negro">Río Negro</option>
                  <option value="salta">Salta</option>
                  <option value="san-juan">San Juan</option>
                  <option value="san-luis">San Luis</option>
                  <option value="santa-cruz">Santa Cruz</option>
                  <option value="santa-fe">Santa Fe</option>
                  <option value="santiago-del-estero">Santiago del Estero</option>
                  <option value="tierra-del-fuego">Tierra del Fuego</option>
                  <option value="tucuman">Tucumán</option>
                </select>

                {/* City Select */}
                <select 
                  className="px-3 py-3 bg-transparent border-l border-gray-200 text-gray-700 text-sm focus:outline-none cursor-pointer"
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
                <Button className="ml-2 bg-primary hover:bg-primary/90 px-6 py-3 h-auto rounded-md">
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Filter Dropdown */}
            <div className="ml-4">
              <FilterDropdown
                options={filterOptions}
                selected={selectedFilter}
                onSelect={setSelectedFilter}
                placeholder="Ordenar por..."
              />
            </div>
          </div>

          {/* Desktop User Actions */}
          <div className="hidden lg:flex items-center space-x-4">
            <FavoritesPanel 
              favorites={[]}
              onRemoveFavorite={handleRemoveFavorite}
            />
            
            <NotificationPanel
              notifications={[]}
              unreadCount={0}
              onMarkAsRead={handleMarkAsRead}
              onMarkAllAsRead={handleMarkAllAsRead}
            />

            <Link to="/login">
              <Button variant="outline" size="sm" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                <User className="h-4 w-4 mr-1" />
                Iniciar Sesión
              </Button>
            </Link>

            <Link to="/register">
              <Button size="sm" className="bg-primary hover:bg-primary/90">
                Registrarse
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden text-navy-foreground"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-navy-light">
            <div className="space-y-4">
              {/* Mobile Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <input
                  type="text"
                  placeholder="¿Qué servicio buscás?"
                  className="w-full pl-10 pr-4 py-2 rounded-md border border-input bg-background text-sm"
                />
              </div>

              {/* Mobile Location */}
              <div className="flex space-x-2">
                <select 
                  className="flex-1 px-3 py-2 rounded-md border border-input bg-background text-sm"
                  value={selectedProvince}
                  onChange={(e) => handleProvinceChange(e.target.value)}
                >
                  <option value="">Provincia</option>
                  <option value="buenos-aires">Buenos Aires</option>
                  <option value="gba">GBA</option>
                  <option value="catamarca">Catamarca</option>
                  <option value="chaco">Chaco</option>
                  <option value="chubut">Chubut</option>
                  <option value="cordoba">Córdoba</option>
                  <option value="corrientes">Corrientes</option>
                  <option value="entre-rios">Entre Ríos</option>
                  <option value="formosa">Formosa</option>
                  <option value="jujuy">Jujuy</option>
                  <option value="la-pampa">La Pampa</option>
                  <option value="la-rioja">La Rioja</option>
                  <option value="mendoza">Mendoza</option>
                  <option value="misiones">Misiones</option>
                  <option value="neuquen">Neuquén</option>
                  <option value="rio-negro">Río Negro</option>
                  <option value="salta">Salta</option>
                  <option value="san-juan">San Juan</option>
                  <option value="san-luis">San Luis</option>
                  <option value="santa-cruz">Santa Cruz</option>
                  <option value="santa-fe">Santa Fe</option>
                  <option value="santiago-del-estero">Santiago del Estero</option>
                  <option value="tierra-del-fuego">Tierra del Fuego</option>
                  <option value="tucuman">Tucumán</option>
                </select>
                <select 
                  className="flex-1 px-3 py-2 rounded-md border border-input bg-background text-sm"
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
              </div>

              {/* Mobile Actions */}
              <div className="space-y-2">
                <div className="w-full">
                  <FavoritesPanel 
                    favorites={[]}
                    onRemoveFavorite={handleRemoveFavorite}
                  />
                </div>
                <div className="w-full">
                  <NotificationPanel
                    notifications={[]}
                    unreadCount={0}
                    onMarkAsRead={handleMarkAsRead}
                    onMarkAllAsRead={handleMarkAllAsRead}
                  />
                </div>
                <Link to="/login" className="block">
                  <Button variant="outline" className="w-full border-primary text-primary">
                    <User className="h-4 w-4 mr-2" />
                    Iniciar Sesión
                  </Button>
                </Link>
                <Link to="/register" className="block">
                  <Button className="w-full bg-primary hover:bg-primary/90">
                    Registrarse
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;