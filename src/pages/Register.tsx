import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Eye, EyeOff, Mail, Lock, User, ArrowLeft, MapPin, Search, Loader2 } from "lucide-react";
import { LocationAutocomplete } from '@/components/ui/location-autocomplete';
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import Header from "@/components/Header";
import { PasswordStrengthIndicator } from '@/components/ui/password-strength-indicator';
import { validatePassword } from '@/utils/passwordValidation';
import heroProfessionals from "@/assets/hero-professionals.jpg";
import chequealoLogo from '@/assets/chequealo-transparent-logo.png';
import { 
  Wrench, Zap, Car, Sparkles, Dumbbell, Paintbrush, 
  Hammer, Flame, TreePine, Building, Heart, Laptop 
} from "lucide-react";

const Register = () => {
  const navigate = useNavigate();
  const { signUp, signIn, user, loading } = useAuth();
  const [searchParams] = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Get URL parameters
  const urlType = searchParams.get('type');
  const urlEmail = searchParams.get('email');
  const urlName = searchParams.get('name');
  const urlDni = searchParams.get('dni');
  
  const [userType, setUserType] = useState<'professional' | 'client'>(
    urlType === 'professional' ? 'professional' : 'professional'
  );
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if user is already authenticated (after OAuth)
  useEffect(() => {
    if (user && !loading) {
      // Check if user has a professional profile
      supabase
        .from('professionals')
        .select('id')
        .eq('user_id', user.id)
        .single()
        .then(({ data }) => {
          if (data) {
            // Has professional profile, go to dashboard
            navigate('/dashboard', { replace: true });
          } else {
            // New OAuth user without profile - stay on register to complete setup
            toast.success('¡Bienvenido! Por favor completa tu perfil');
          }
        });
    }
  }, [user, loading, navigate]);
  
  // Form data - prefill from URL parameters
  const [formData, setFormData] = useState({
    fullName: urlName || '',
    email: urlEmail || '',
    password: '',
    confirmPassword: '',
    description: '',
    location: '',
    phone: '+549',
    dni: urlDni || '',
    acceptTerms: false
  });

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
    { name: "Fletes y Mudanzas", icon: Building, color: "bg-orange-200 text-orange-700" },
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

  const filteredServices = serviceCategories.filter(service =>
    service.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const signUpWithGoogle = async () => {
    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      });
      
      if (error) {
        toast.error('Error al registrarse con Google: ' + error.message);
      }
    } catch (err) {
      toast.error('Error inesperado con Google Sign-Up');
    } finally {
      setIsLoading(false);
    }
  };

  const signUpWithFacebook = async () => {
    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'facebook',
        options: {
          redirectTo: `${window.location.origin}/auth`,
        }
      });
      
      if (error) {
        toast.error('Error al registrarse con Facebook: ' + error.message);
      }
    } catch (err) {
      toast.error('Error inesperado con Facebook Sign-Up');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.acceptTerms) {
      toast.error('Debes aceptar los términos y condiciones');
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }
    
    const passwordValidation = validatePassword(formData.password);
    if (!passwordValidation.isValid) {
      toast.error('La contraseña no cumple con los requisitos de seguridad');
      return;
    }
    
    if (userType === 'professional' && selectedServices.length === 0) {
      toast.error('Debes seleccionar al menos un servicio');
      return;
    }

    if (userType === 'professional' && !formData.dni.trim()) {
      toast.error('El DNI es requerido para profesionales');
      return;
    }

    setIsLoading(true);
    
    try {
      // Si es profesional, verificar que el email no esté ya registrado como profesional
      if (userType === 'professional') {
        const { data: existingProfessional } = await supabase
          .from('professionals')
          .select('id')
          .eq('email', formData.email)
          .single();
          
        if (existingProfessional) {
          toast.error('Este email ya está registrado como profesional');
          return;
        }

        // Verificar que el DNI no esté ya registrado
        if (formData.dni) {
          const { data: existingDNI } = await supabase
            .from('professionals')
            .select('id')
            .eq('dni', formData.dni)
            .single();
            
          if (existingDNI) {
            toast.error('Este DNI ya está registrado como profesional');
            return;
          }
        }
      }
      
      // Crear usuario
      const { error: signUpError } = await signUp(
        formData.email,
        formData.password,
        formData.fullName,
        formData.fullName.toLowerCase().replace(/\s+/g, '')
      );

      if (signUpError) {
        if (signUpError.message.includes('already registered')) {
          toast.error('Este email ya está registrado');
        } else {
          toast.error(signUpError.message);
        }
        return;
      }

      // Intentar iniciar sesión automáticamente
      const { error: loginError } = await signIn(formData.email, formData.password);

      if (!loginError) {
        // Ya logueado: crear perfil profesional si corresponde
        const { data: { user } } = await supabase.auth.getUser();
        if (user && userType === 'professional') {
          try {
            await supabase.from('professionals').insert({
              user_id: user.id,
              full_name: formData.fullName,
              email: formData.email,
              phone: formData.phone || '',
              dni: formData.dni || '',
              profession: selectedServices[0] || 'Profesional',
              location: formData.location || '',
              description: formData.description || '',
              availability: 'Disponible'
            });
          } catch (err) {
            console.error('Error creando perfil profesional:', err);
          }
        }

        toast.success('Cuenta creada e inicio de sesión exitoso');
        navigate('/dashboard', { replace: true });
      } else {
        // Si el proyecto requiere confirmación de email, el login fallará hasta confirmar
        toast.success('Cuenta creada. Revisa tu email para confirmar y luego inicia sesión.');
        navigate('/auth?tab=login', { replace: true });
      }

    } catch (error) {
      toast.error('Error al crear la cuenta. Inténtalo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

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
        <Button variant="ghost" className="text-white hover:bg-white/10 border-white/20">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver al inicio
        </Button>
      </Link>

      {/* Register Form */}
      <div className="relative z-10 w-full max-w-md mx-4">
        <div className="bg-card/95 backdrop-blur-sm p-8 rounded-2xl shadow-2xl border">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <img 
                src={chequealoLogo} 
                alt="Chequealo" 
                className="h-12 w-auto"
              />
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-4">Crear Cuenta</h2>
            
            {/* User Type Toggle */}
            <div className="flex bg-muted rounded-lg p-1 mb-6">
              <button
                onClick={() => setUserType('professional')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  userType === 'professional'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Soy Profesional
              </button>
              <button
                onClick={() => setUserType('client')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  userType === 'client'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Soy Cliente
              </button>
            </div>
            
            {/* Social Registration Buttons */}
            <div className="space-y-3 mb-6">
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={signUpWithGoogle}
                disabled={isLoading}
              >
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Registrarse con Google
              </Button>

              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={signUpWithFacebook}
                disabled={isLoading}
              >
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="#1877f2">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                Registrarse con Facebook
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">
                    O continúa con email
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="name" className="text-sm font-medium text-foreground">
                Nombre completo
              </Label>
              <div className="relative mt-1">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                <Input
                  id="name"
                  type="text"
                  placeholder="Tu nombre completo"
                  className="pl-10 h-12"
                  value={formData.fullName}
                  onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="email" className="text-sm font-medium text-foreground">
                Correo electrónico
              </Label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  className="pl-10 h-12"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="password" className="text-sm font-medium text-foreground">
                Contraseña
              </Label>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="pl-10 pr-10 h-12"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              
              <PasswordStrengthIndicator 
                password={formData.password}
                className="mt-2" 
              />
            </div>

            <div>
              <Label htmlFor="confirmPassword" className="text-sm font-medium text-foreground">
                Confirmar contraseña
              </Label>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="pl-10 pr-10 h-12"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
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
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>
              </div>
            )}

            {/* DNI y Ubicación para profesionales */}
            {userType === 'professional' && (
              <div className="grid grid-cols-2 gap-4">
                <LocationAutocomplete
                  value={formData.location}
                  onChange={(value) => setFormData(prev => ({ ...prev, location: value }))}
                  label="Ciudad"
                  id="location"
                  placeholder="Busca tu ciudad o provincia..."
                />
                
                <div>
                  <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
                    Teléfono
                  </Label>
                  <div className="relative mt-1">
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+549 3492 123456 (sin 0 ni 15)"
                      className="h-12 border-gray-200 focus:border-primary"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* DNI para profesionales */}
            {userType === 'professional' && (
              <div>
                <Label htmlFor="dni" className="text-sm font-medium text-gray-700">
                  DNI (requerido para profesionales)
                </Label>
                <div className="relative mt-1">
                  <Input
                    id="dni"
                    type="text"
                    placeholder="12345678"
                    className="h-12 border-gray-200 focus:border-primary"
                    value={formData.dni}
                    onChange={(e) => setFormData(prev => ({ ...prev, dni: e.target.value }))}
                    required={userType === 'professional'}
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
                <input 
                  type="checkbox" 
                  className="mr-2" 
                  checked={formData.acceptTerms}
                  onChange={(e) => setFormData(prev => ({ ...prev, acceptTerms: e.target.checked }))}
                  required
                />
                <span className="text-gray-600">
                  Acepto los{" "}
                  <Dialog>
                    <DialogTrigger asChild>
                      <button type="button" className="text-primary hover:text-primary/80 font-medium underline">
                        términos y condiciones
                      </button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[80vh]">
                      <DialogHeader>
                        <DialogTitle>Términos y Condiciones de Uso</DialogTitle>
                      </DialogHeader>
                      <ScrollArea className="h-[60vh] pr-4">
                        <div className="space-y-4 text-sm">
                          <p><strong>Última actualización:</strong> 12 de septiembre de 2025</p>
                          
                          <p>
                            Bienvenido/a a CHEQUEALO.AR (el "Sitio" y/o la "Plataforma"), operado por [Razón Social], CUIT [CUIT], con domicilio en [Domicilio legal] ("CHEQUEALO.AR", "nosotros" o "nuestro").
                            Estos Términos y Condiciones (los "Términos") regulan el acceso y uso del Sitio, de nuestras aplicaciones asociadas y de los servicios que ofrecemos (los "Servicios"). Al registrarte, acceder o utilizar la Plataforma aceptás estos Términos y nuestra Política de Privacidad.
                          </p>
                          
                          <p>Si no estás de acuerdo, no utilices la Plataforma.</p>

                          <div>
                            <h3 className="font-semibold mb-2">1) Objeto del servicio</h3>
                            <p>
                              CHEQUEALO.AR es un directorio y canal de contacto que conecta usuarios que buscan servicios ("Usuarios") con profesionales y comercios que los ofrecen ("Profesionales").
                              CHEQUEALO.AR no presta servicios profesionales, no participa en la relación contractual entre Usuarios y Profesionales, ni garantiza resultados, precios, plazos, títulos, habilitaciones o calidad.
                            </p>
                          </div>

                          <div>
                            <h3 className="font-semibold mb-2">2) Cuentas y veracidad de la información</h3>
                            <p>
                              Para usar funciones específicas (publicar, chatear, reseñar, etc.) debés crear una Cuenta con datos verdaderos, exactos y actualizados.
                            </p>
                            <p>
                              Sos responsable de la confidencialidad de tus credenciales y de toda actividad realizada desde tu Cuenta.
                            </p>
                            <p>
                              Podemos suspender o cancelar Cuentas por: uso indebido, fraude, incumplimientos, indicios de manipulación de reseñas, suplantación de identidad o disposiciones legales.
                            </p>
                          </div>

                          <div>
                            <h3 className="font-semibold mb-2">3) Rol y responsabilidades de cada parte</h3>
                            <h4 className="font-medium mb-1">3.1. Usuarios</h4>
                            <p>
                              Deben verificar de manera independiente la idoneidad del Profesional (matrículas, habilitaciones, seguros, antecedentes, etc.).
                            </p>
                            <p>
                              Son responsables de acordar con el Profesional precio, alcance, plazos, forma de pago y garantías.
                            </p>
                            <p>
                              Aceptan que cualquier trabajo, asesoramiento o producto es provisto exclusivamente por el Profesional contratado.
                            </p>
                            
                            <h4 className="font-medium mb-1 mt-3">3.2. Profesionales</h4>
                            <p>
                              Deben publicar información veraz y comprobable (títulos, matrículas, precios, promociones, disponibilidad).
                            </p>
                            <p>
                              Se comprometen a cumplir todas las leyes y normas aplicables, incluidas habilitaciones, facturación e impuestos.
                            </p>
                            <p>
                              Aceptan que son exclusivos responsables por la relación con Usuarios, por la ejecución de sus servicios y por cualquier reclamo, daño o perjuicio que pudiese derivarse.
                            </p>
                            
                            <h4 className="font-medium mb-1 mt-3">3.3. CHEQUEALO.AR</h4>
                            <p>
                              Ofrece herramientas de exhibición, búsqueda, mensajería y reseñas.
                            </p>
                            <p>
                              Puede moderar, priorizar, destacar o despublicar contenidos (p. ej., por infracciones, baja calidad, spam o reportes), sin obligación de comunicar motivos en todos los casos.
                            </p>
                            <p>
                              No interviene en pagos entre partes, salvo que se indique expresamente un procesador de pagos externo; en tal caso, regirán también los términos del tercero.
                            </p>
                          </div>

                          <div>
                            <h3 className="font-semibold mb-2">4) Publicaciones, contenidos y licencias</h3>
                            <p>
                              Al publicar textos, imágenes, logos, precios, descripciones, reseñas u otros ("Contenido"), garantizás que tenés derechos para usarlos y que no infringen derechos de terceros.
                            </p>
                            <p>
                              Nos concedés una licencia no exclusiva, gratuita, transferible y sublicenciable para alojar, reproducir, adaptar, comunicar y exhibir ese Contenido dentro de la Plataforma y con fines de promoción de CHEQUEALO.AR.
                            </p>
                            <p>
                              Está prohibido subir Contenido ilegal, difamatorio, engañoso, discriminatorio, violento, sexualmente explícito, con datos personales de terceros sin autorización, o que contenga virus o scripts maliciosos.
                            </p>
                          </div>

                          <div>
                            <h3 className="font-semibold mb-2">5) Reseñas y calificaciones</h3>
                            <p>
                              Las reseñas deben ser honestas y pertinentes a una experiencia real.
                            </p>
                            <p>
                              Se prohíbe la manipulación (autorreseñas, reseñas pagadas, presión o intercambio de beneficios).
                            </p>
                            <p>
                              CHEQUEALO.AR puede eliminar o editar reseñas que incumplan estos Términos o que contengan lenguaje ofensivo, datos sensibles o información personal de terceros.
                            </p>
                          </div>

                          <div>
                            <h3 className="font-semibold mb-2">6) Planes, precios y facturación (si aplica)</h3>
                            <p>
                              Algunos Servicios pueden ser pagos (p. ej., publicaciones destacadas, suscripciones, anuncios). Los precios se informarán antes de la contratación y pueden cambiar con notificación previa razonable.
                            </p>
                            <p>
                              Las suscripciones se renuevan automáticamente hasta que las canceles. La cancelación rige para períodos futuros y no otorga reembolsos del período en curso, salvo disposición legal o política expresa en contrario.
                            </p>
                            <p>
                              Los impuestos aplicables podrán agregarse al precio.
                            </p>
                            <p>
                              Los pagos procesados por terceros (p. ej., pasarelas de pago) se rigen por sus propios términos.
                            </p>
                          </div>

                          <div>
                            <h3 className="font-semibold mb-2">7) Privacidad y datos</h3>
                            <p>
                              El tratamiento de datos personales se describe en nuestra Política de Privacidad (parte integrante de estos Términos).
                            </p>
                            <p>
                              La Plataforma puede emplear geolocalización, cookies y tecnologías similares para mejorar resultados de búsqueda, mostrar listados relevantes y métricas de uso.
                            </p>
                          </div>

                          <div>
                            <h3 className="font-semibold mb-2">8) Prohibiciones de uso</h3>
                            <p>No podés:</p>
                            <ul className="list-disc pl-5 space-y-1">
                              <li>usar el Sitio para fines ilícitos;</li>
                              <li>extraer datos de manera masiva (scraping) sin autorización escrita;</li>
                              <li>intentar vulnerar medidas de seguridad;</li>
                              <li>revender, sublicenciar o explotar comercialmente el acceso a la Plataforma sin permiso;</li>
                              <li>publicar información falsa, desactualizada o engañosa;</li>
                              <li>infringir derechos de Propiedad Intelectual o de imagen.</li>
                            </ul>
                          </div>

                          <div>
                            <h3 className="font-semibold mb-2">9) Propiedad Intelectual</h3>
                            <p>
                              El Sitio, su código, diseño, marcas, logos, bases de datos y contenidos propios son propiedad de CHEQUEALO.AR o de sus licenciantes y están protegidos por las leyes de Propiedad Intelectual.
                            </p>
                            <p>
                              No se otorga licencia alguna sobre dichos derechos salvo lo expresamente previsto.
                            </p>
                          </div>

                          <div>
                            <h3 className="font-semibold mb-2">10) Disponibilidad, cambios y mantenimiento</h3>
                            <p>
                              Podemos modificar, actualizar, interrumpir o discontinuar la Plataforma o cualquier funcionalidad, en forma total o parcial, en cualquier momento.
                            </p>
                            <p>
                              No garantizamos disponibilidad ininterrumpida ni ausencia de errores. Implementamos buenas prácticas para minimizar interrupciones.
                            </p>
                          </div>

                          <div>
                            <h3 className="font-semibold mb-2">11) Limitación de responsabilidad</h3>
                            <p>En la máxima medida permitida por la ley aplicable:</p>
                            <p>
                              CHEQUEALO.AR no es responsable por daños directos o indirectos, lucro cesante, pérdida de chance, datos o reputación derivados del uso o imposibilidad de uso de la Plataforma o de relaciones entre Usuarios y Profesionales.
                            </p>
                            <p>
                              CHEQUEALO.AR no garantiza la veracidad, integridad o actualización de contenidos provistos por terceros (Profesionales o Usuarios).
                            </p>
                            <p>
                              Los riesgos derivados de la contratación y ejecución de servicios corren por cuenta y riesgo de Usuarios y Profesionales.
                            </p>
                          </div>

                          <div>
                            <h3 className="font-semibold mb-2">12) Indemnidad</h3>
                            <p>
                              Te comprometés a mantener indemne a CHEQUEALO.AR, sus directivos y colaboradores frente a reclamos, daños, sanciones, costos y gastos (incluidos honorarios razonables) originados por:
                              a) tu Contenido; b) tu uso de la Plataforma; c) incumplimientos a estos Términos o a la ley; d) reclamos de terceros vinculados a tus publicaciones o servicios.
                            </p>
                          </div>

                          <div>
                            <h3 className="font-semibold mb-2">13) Enlaces a terceros</h3>
                            <p>
                              La Plataforma puede contener enlaces a sitios o servicios de terceros. CHEQUEALO.AR no controla ni respalda esos contenidos y no asume responsabilidad por daños que pudieran derivarse de su uso.
                            </p>
                          </div>

                          <div>
                            <h3 className="font-semibold mb-2">14) Comunicaciones y notificaciones</h3>
                            <p>
                              Aceptás recibir notificaciones electrónicas (email, avisos en la cuenta o en la Plataforma). Se considerarán válidas cuando sean enviadas a los datos de contacto provistos por vos.
                            </p>
                          </div>

                          <div>
                            <h3 className="font-semibold mb-2">15) Cesión</h3>
                            <p>
                              Podemos ceder total o parcialmente nuestros derechos y obligaciones bajo estos Términos, notificándote por medios razonables. No podés ceder tu Cuenta sin autorización expresa.
                            </p>
                          </div>

                          <div>
                            <h3 className="font-semibold mb-2">16) Vigencia, suspensión y terminación</h3>
                            <p>
                              Estos Términos rigen mientras uses la Plataforma. Podemos suspender o terminar tu acceso si incumplís estos Términos o la ley, o si detectamos riesgos de fraude, abuso o seguridad.
                            </p>
                          </div>

                          <div>
                            <h3 className="font-semibold mb-2">17) Modificaciones a los Términos</h3>
                            <p>
                              Podemos actualizar estos Términos. Publicaremos la versión vigente con su fecha de actualización. El uso posterior a la publicación implica aceptación de los cambios.
                            </p>
                          </div>

                          <div>
                            <h3 className="font-semibold mb-2">18) Ley aplicable y jurisdicción</h3>
                            <p>
                              Estos Términos se rigen por las leyes de la República Argentina. Para cualquier controversia, las partes se someten a los tribunales competentes de [Ciudad/Provincia], con renuncia a cualquier otro fuero o jurisdicción.
                            </p>
                          </div>
                        </div>
                      </ScrollArea>
                    </DialogContent>
                  </Dialog>
                </span>
              </label>
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-semibold"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creando cuenta...
                </>
              ) : (
                'Crear cuenta'
              )}
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