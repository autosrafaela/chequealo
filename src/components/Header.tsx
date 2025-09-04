import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Bell, User, MapPin, Search, Heart, Menu, X } from "lucide-react";
import { Link } from "react-router-dom";

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
                <select className="px-3 py-3 bg-transparent border-l border-gray-200 text-gray-700 text-sm focus:outline-none cursor-pointer">
                  <option value="">Provincia</option>
                  <option value="santa-fe">Santa Fe</option>
                  <option value="buenos-aires">Buenos Aires</option>
                  <option value="cordoba">Córdoba</option>
                  <option value="mendoza">Mendoza</option>
                </select>

                {/* City Select */}
                <select className="px-3 py-3 bg-transparent border-l border-gray-200 text-gray-700 text-sm focus:outline-none cursor-pointer">
                  <option value="">Ciudad</option>
                  <option value="rafaela">Rafaela</option>
                  <option value="santa-fe">Santa Fe</option>
                  <option value="rosario">Rosario</option>
                  <option value="esperanza">Esperanza</option>
                </select>

                {/* Search Button */}
                <Button className="ml-2 bg-primary hover:bg-primary/90 px-6 py-3 h-auto rounded-md">
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Filter Button */}
            <Button variant="outline" className="ml-4 text-navy-foreground border-gray-300 hover:bg-white hover:text-gray-700">
              Últimas publicaciones
            </Button>
          </div>

          {/* Desktop User Actions */}
          <div className="hidden lg:flex items-center space-x-4">
            <Button variant="ghost" size="sm" className="text-navy-foreground hover:text-primary">
              <Heart className="h-4 w-4 mr-1" />
              Favoritos
            </Button>
            
            <Button variant="ghost" size="sm" className="text-navy-foreground hover:text-primary">
              <Bell className="h-4 w-4 mr-1" />
              Notificaciones
            </Button>

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
                <select className="flex-1 px-3 py-2 rounded-md border border-input bg-background text-sm">
                  <option>Provincia</option>
                  <option>Santa Fe</option>
                  <option>Buenos Aires</option>
                </select>
                <select className="flex-1 px-3 py-2 rounded-md border border-input bg-background text-sm">
                  <option>Ciudad</option>
                  <option>Rafaela</option>
                  <option>Santa Fe</option>
                </select>
              </div>

              {/* Mobile Actions */}
              <div className="space-y-2">
                <Button variant="ghost" className="w-full justify-start text-navy-foreground">
                  <Heart className="h-4 w-4 mr-2" />
                  Favoritos
                </Button>
                <Button variant="ghost" className="w-full justify-start text-navy-foreground">
                  <Bell className="h-4 w-4 mr-2" />
                  Notificaciones
                </Button>
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