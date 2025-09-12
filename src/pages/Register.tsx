import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Mail, Lock, User, ArrowLeft, MapPin, Search } from "lucide-react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import heroProfessionals from "@/assets/hero-professionals.jpg";
import { 
  Wrench, Zap, Car, Sparkles, Dumbbell, Paintbrush, 
  Hammer, Flame, TreePine, Building, Heart, Laptop 
} from "lucide-react";

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [userType, setUserType] = useState<'professional' | 'client'>('client');
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Servicios disponibles para profesionales - Lista completa
  const serviceCategories = [
    { name: "Abogado", icon: Laptop, color: "bg-slate-100 text-slate-600" },
    { name: "Albañil", icon: Building, color: "bg-gray-200 text-gray-700" },
    { name: "Arquitecto / Maestro Mayor de Obras", icon: Building, color: "bg-blue-100 text-blue-600" },
    { name: "Carpintero", icon: Hammer, color: "bg-amber-100 text-amber-600" },
    { name: "Catering / Cocinero", icon: Sparkles, color: "bg-orange-100 text-orange-600" },
    { name: "Community Manager", icon: Laptop, color: "bg-purple-100 text-purple-600" },
    { name: "Contador Público", icon: Laptop, color: "bg-green-100 text-green-600" },
    { name: "Cuidador de Adultos", icon: Heart, color: "bg-pink-100 text-pink-600" },
    { name: "Decorador de Eventos", icon: Sparkles, color: "bg-violet-100 text-violet-600" },
    { name: "Detailing Automotor", icon: Car, color: "bg-blue-200 text-blue-700" },
    { name: "Diseñador Gráfico", icon: Paintbrush, color: "bg-indigo-100 text-indigo-600" },
    { name: "DJ / Sonido", icon: Laptop, color: "bg-red-100 text-red-600" },
    { name: "Electricista", icon: Zap, color: "bg-yellow-200 text-yellow-700" },
    { name: "Electricista del Automotor", icon: Zap, color: "bg-yellow-100 text-yellow-600" },
    { name: "Empleada Doméstica / Servicio de Limpieza", icon: Sparkles, color: "bg-teal-100 text-teal-600" },
    { name: "Entrenador Personal", icon: Dumbbell, color: "bg-purple-100 text-purple-600" },
    { name: "Escribano", icon: Laptop, color: "bg-gray-100 text-gray-600" },
    { name: "Esteticista / Cosmetóloga", icon: Heart, color: "bg-pink-200 text-pink-700" },
    { name: "Fiestas y Mudanzas", icon: Building, color: "bg-orange-200 text-orange-700" },
    { name: "Fotógrafo / Videógrafo", icon: Laptop, color: "bg-cyan-100 text-cyan-600" },
    { name: "Fumigador / Control de Plagas", icon: Building, color: "bg-green-100 text-green-600" },
    { name: "Gasista / Plomero", icon: Flame, color: "bg-red-200 text-red-700" },
    { name: "Gestor de Trámites", icon: Laptop, color: "bg-blue-100 text-blue-600" },
    { name: "Gestor del Automotor", icon: Car, color: "bg-red-100 text-red-600" },
    { name: "Gomero", icon: Car, color: "bg-gray-100 text-gray-600" },
    { name: "Herrero", icon: Hammer, color: "bg-gray-200 text-gray-700" },
    { name: "Instalador de Cámaras", icon: Wrench, color: "bg-slate-100 text-slate-600" },
    { name: "Instalador de Durlock / Yesero", icon: Hammer, color: "bg-amber-100 text-amber-600" },
    { name: "Jardinero / Paisajista", icon: TreePine, color: "bg-green-300 text-green-800" },
    { name: "Kinesiólogo / Fisioterapeuta", icon: Heart, color: "bg-pink-100 text-pink-600" },
    { name: "Lavadero de Autos", icon: Car, color: "bg-cyan-200 text-cyan-700" },
    { name: "Limpieza de Tapizados", icon: Sparkles, color: "bg-cyan-100 text-cyan-600" },
    { name: "Manicura / Pedicura", icon: Heart, color: "bg-rose-100 text-rose-600" },
    { name: "Maquillador/a", icon: Heart, color: "bg-pink-200 text-pink-700" },
    { name: "Musicista Terapéutico", icon: Laptop, color: "bg-purple-200 text-purple-700" },
    { name: "Mecánico", icon: Car, color: "bg-orange-100 text-orange-600" },
    { name: "Médico (Clínica, Pediatría, etc.)", icon: Heart, color: "bg-blue-100 text-blue-600" },
    { name: "Nutricionista", icon: Heart, color: "bg-green-200 text-green-700" },
    { name: "Peluquero / Barbero", icon: Heart, color: "bg-violet-200 text-violet-700" },
    { name: "Pintor", icon: Paintbrush, color: "bg-green-200 text-green-700" },
    { name: "Pintor de Autos / Chapista", icon: Paintbrush, color: "bg-orange-200 text-orange-700" },
    { name: "Profesor de Apoyo Escolar", icon: Laptop, color: "bg-indigo-100 text-indigo-600" },
    { name: "Profesor de Idiomas", icon: Laptop, color: "bg-blue-200 text-blue-700" },
    { name: "Profesor de Música", icon: Laptop, color: "bg-yellow-100 text-yellow-600" },
    { name: "Psicólogo", icon: Heart, color: "bg-teal-200 text-teal-700" },
    { name: "Servicio de Grúa / Remolque", icon: Car, color: "bg-red-200 text-red-700" },
    { name: "Servicio Técnico (Línea Blanca)", icon: Wrench, color: "bg-gray-100 text-gray-600" },
    { name: "Serigrafía / Impermeabilización", icon: Paintbrush, color: "bg-indigo-200 text-indigo-700" },
    { name: "Técnico de Aire Acondicionado", icon: Wrench, color: "bg-blue-100 text-blue-600" },
    { name: "Técnico de Celulares", icon: Wrench, color: "bg-slate-200 text-slate-700" },
    { name: "Técnico de PC", icon: Laptop, color: "bg-gray-200 text-gray-700" },
  ];

  const handleServiceToggle = (serviceName: string) => {
    setSelectedServices(prev => {
      if (prev.includes(serviceName)) {
        return prev.filter(s => s !== serviceName);
      } else if (prev.length < 3) {
        return [...prev, serviceName];
      }
      return prev;
    });
  };

  // Filtrar servicios basándose en el término de búsqueda
  const filteredServices = serviceCategories.filter(service =>
    service.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <Header />
      <div 
        className="min-h-screen flex items-center justify-center bg-cover bg-center relative"
        style={{ backgroundImage: `url(${heroProfessionals})` }}
      >
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-navy/80 via-navy/70 to-navy/60"></div>
      
      {/* Back to Home */}
      <Link to="/" className="absolute top-6 left-6 z-20">
        <Button variant="ghost" className="text-white hover:bg-white/10">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver al inicio
        </Button>
      </Link>

      {/* Register Form */}
      <div className="relative z-10 w-full max-w-md mx-4">
        <div className="bg-white/95 backdrop-blur-sm p-8 rounded-2xl shadow-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-navy mb-2">TodoAca.ar</h1>
            <h2 className="text-xl font-semibold text-foreground mb-4">Crear Cuenta</h2>
            
            {/* User Type Toggle */}
            <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
              <button
                onClick={() => setUserType('professional')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  userType === 'professional'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Soy Profesional
              </button>
              <button
                onClick={() => setUserType('client')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  userType === 'client'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Soy Cliente
              </button>
            </div>
          </div>

          {/* Form */}
          <form className="space-y-6">
            <div>
              <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                Nombre completo
              </Label>
              <div className="relative mt-1">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  id="name"
                  type="text"
                  placeholder="Tu nombre completo"
                  className="pl-10 h-12 border-gray-200 focus:border-primary"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                Correo electrónico
              </Label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  className="pl-10 h-12 border-gray-200 focus:border-primary"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                Contraseña
              </Label>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="pl-10 pr-10 h-12 border-gray-200 focus:border-primary"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div>
              <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                Confirmar contraseña
              </Label>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="pl-10 pr-10 h-12 border-gray-200 focus:border-primary"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Descripción para profesionales */}
            {userType === 'professional' && (
              <div>
                <Label htmlFor="description" className="text-sm font-medium text-gray-700">
                  Descripción (Sobre Mí)
                </Label>
                <div className="relative mt-1">
                  <textarea
                    id="description"
                    placeholder="Contános sobre tu experiencia, especialidades y qué te hace único..."
                    className="w-full h-20 px-3 py-2 border border-gray-200 rounded-md focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none text-sm"
                  />
                </div>
              </div>
            )}

            {/* Ubicación para profesionales */}
            {userType === 'professional' && (
              <div>
                <Label htmlFor="location" className="text-sm font-medium text-gray-700">
                  Ciudad
                </Label>
                <div className="relative mt-1">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    id="location"
                    type="text"
                    placeholder="Ej: Santa Fe, Argentina"
                    className="pl-10 h-12 border-gray-200 focus:border-primary"
                  />
                </div>
              </div>
            )}

            {/* Selección de servicios para profesionales */}
            {userType === 'professional' && (
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-3 block">
                  Elegí hasta 3 servicios que ofrecés ({selectedServices.length}/3)
                </Label>
                
                {/* Campo de búsqueda */}
                <div className="relative mb-3">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    type="text"
                    placeholder="Buscar servicios..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 h-10 border-gray-200 focus:border-primary text-sm"
                  />
                </div>

                <div className="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto p-2 border border-gray-200 rounded-lg bg-white">
                  {filteredServices.length > 0 ? (
                    filteredServices.map((category, index) => {
                      const Icon = category.icon;
                      const isSelected = selectedServices.includes(category.name);
                      const isDisabled = selectedServices.length >= 3 && !isSelected;
                      
                      return (
                        <button
                          key={index}
                          type="button"
                          onClick={() => handleServiceToggle(category.name)}
                          disabled={isDisabled}
                          className={`p-3 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-3 text-left ${
                            isSelected
                              ? 'bg-primary text-primary-foreground border border-primary shadow-md'
                              : isDisabled
                              ? 'bg-gray-50 text-gray-400 cursor-not-allowed border border-gray-100'
                              : 'bg-white border border-gray-200 hover:border-primary hover:bg-primary/5 text-gray-700 hover:shadow-sm'
                          }`}
                        >
                          <div className={`p-1.5 rounded-md ${isSelected ? 'bg-white/20' : category.color}`}>
                            <Icon className="h-4 w-4 flex-shrink-0" />
                          </div>
                          <span className="flex-1">{category.name}</span>
                        </button>
                      );
                    })
                  ) : (
                    <div className="p-4 text-center text-gray-500 text-sm">
                      No se encontraron servicios que coincidan con "{searchTerm}"
                    </div>
                  )}
                </div>
                {selectedServices.length > 0 && (
                  <div className="mt-2 text-xs text-gray-600">
                    Seleccionados: {selectedServices.join(', ')}
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center text-sm">
              <label className="flex items-center">
                <input type="checkbox" className="mr-2" />
                <span className="text-gray-600">
                  Acepto los{" "}
                  <button type="button" className="text-primary hover:text-primary/80 font-medium">
                    términos y condiciones
                  </button>
                </span>
              </label>
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-semibold"
            >
              Crear cuenta
            </Button>
          </form>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-gray-600 mb-4">¿Ya tenés cuenta?</p>
            <Link to="/login">
              <Button variant="outline" className="w-full border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                Iniciar Sesión
              </Button>
            </Link>
          </div>
        </div>
      </div>
      </div>
    </>
  );
};

export default Register;