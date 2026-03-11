import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Eye, EyeOff, ArrowLeft, Search, Loader2, X } from "lucide-react";
import { LocationAutocomplete } from '@/components/ui/location-autocomplete';
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import Header from "@/components/Header";
import { PasswordStrengthIndicator } from '@/components/ui/password-strength-indicator';
import { validatePassword } from '@/utils/passwordValidation';
import { getDashboardRoute } from '@/utils/redirectHelpers';
import { notifyNewProfessionalToAllUsers } from '@/utils/notificationHelpers';
import heroProfessionals from "@/assets/hero-professionals.jpg";
import { useAppLogo } from '@/hooks/useAppLogo';

const inputClasses = "h-12 border-border/60 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-xl";

const Register = () => {
  const navigate = useNavigate();
  const { signUp, signIn, user, loading } = useAuth();
  const chequealoLogo = useAppLogo();
  const [searchParams] = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const urlType = searchParams.get('type');
  const urlEmail = searchParams.get('email');
  const urlName = searchParams.get('name');
  const urlDni = searchParams.get('dni') || sessionStorage.getItem('register_dni');
  
  const [userType, setUserType] = useState<'professional' | 'client'>(
    urlType === 'professional' ? 'professional' : 'professional'
  );
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showCustomProfession, setShowCustomProfession] = useState(false);
  const [customProfession, setCustomProfession] = useState('');

  useEffect(() => {
    const url = new URL(window.location.href);
    const hasCode = url.searchParams.has('code');
    const hasAccessToken = window.location.hash.includes('access_token');

    const finalize = async () => {
      try {
        if (hasCode) {
          const { error } = await supabase.auth.exchangeCodeForSession(window.location.href);
          if (error) {
            console.error('[Register] exchangeCodeForSession error:', error);
            toast.error('No se pudo completar el inicio de sesión. Intenta nuevamente.');
          }
          url.search = '';
          window.history.replaceState({}, '', url.toString());
        } else if (hasAccessToken) {
          const hash = new URLSearchParams(window.location.hash.substring(1));
          const access_token = hash.get('access_token') || '';
          const refresh_token = hash.get('refresh_token') || '';
          if (access_token) {
            const { error } = await supabase.auth.setSession({ access_token, refresh_token });
            if (error) {
              console.error('[Register] setSession error:', error);
              toast.error('No se pudo completar el inicio de sesión. Intenta nuevamente.');
            }
            window.location.hash = '';
          }
        }
      } catch (e) {
        console.error('[Register] OAuth finalize error:', e);
      }
    };

    finalize();
  }, []);

  useEffect(() => {
    if (user && !loading) {
      supabase
        .from('professionals')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle()
        .then(({ data }) => {
          if (data) {
            toast.success('¡Bienvenido de vuelta!');
            navigate('/dashboard', { replace: true });
          } else {
            const isNewOAuthUser = !urlEmail;
            
            if (isNewOAuthUser && userType === 'professional') {
              toast.success('¡Bienvenido! Por favor completa tu perfil profesional');
              if (user.user_metadata?.full_name) {
                setFormData(prev => ({
                  ...prev,
                  fullName: user.user_metadata.full_name || prev.fullName,
                  email: user.email || prev.email
                }));
              }
            } else if (isNewOAuthUser && userType === 'client') {
              toast.success('¡Bienvenido de vuelta!');
              navigate('/user-dashboard', { replace: true });
            }
          }
        });
    }
  }, [user, loading, navigate, userType, urlEmail]);
  
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

  const serviceCategories = [
    "Abogado", "Acompañante Terapéutico", "Adiestrador de Perros", "Agrimensor",
    "Albañil", "Alisadora Profesional", "Arquitecta", "Asesor de Seguros",
    "Asesor Inmobiliario", "Automatización con IA", "Auxiliares de Estudio",
    "Barman / Bartender", "Barbero", "Camarógrafo",
    "Capacitación en Manejo y Programación de Tornos CNC",
    "Carpintero / Ebanista", "Catering", "Cerrajero",
    "Chapista y Pintor Automotor", "Chef a Domicilio", "Chofer Particular",
    "Colocador de Cerámicos", "Colocador de Pisos", "Colocador de Porcelanatos",
    "Community Manager", "Contadora Pública", "Contador",
    "Control de Plagas y Fumigación", "Cortinero", "Cursos/Formación",
    "Cuidador de Mascotas", "Cuidador/a de Adultos Mayores",
    "Cuidador/a de Niños (Niñera)", "Decorador de Interiores",
    "Desinfección y Sanitización", "Detailing", "Detailing de Autos",
    "Desarrollador Web", "Diseñador de Interiores", "Diseñador Gráfico",
    "Editor de Video", "Electricista", "Electricista Matriculado",
    "Empleada Doméstica / Servicio de Limpieza", "Encomiendas/Comisionista",
    "Enfermero/a", "Entrenador Personal", "Escribano", "Esteticista",
    "Fletero / Mudanzas", "Fonoaudiólogo", "Fotógrafo",
    "Fumigador / Control de Plagas", "Gestor del Automotor", "Gomería",
    "Herrero", "Herrería de Obra", "Ingeniero", "Instalador de Alarmas",
    "Instalador de Audio para Autos", "Instalador de Cámaras de Seguridad",
    "Instalador de Durlock / Yesero", "Instalador de Internet",
    "Instalador de Paneles Solares", "Instalador de TV", "Jardinero",
    "Jardinero / Paisajista", "Kinesiólogo / Fisioterapeuta",
    "Lavadero de Autos", "Limpieza de Alfombras", "Limpieza de Persianas",
    "Limpieza de Tanques de Agua", "Limpieza de Tapizados",
    "Limpieza y Mantenimiento", "Manicurista", "Maquillador/a",
    "Maquillador Profesional", "Maquilladora Artística", "Maquilladora Social",
    "Martillero Público", "Masajista",
    "Modista/Costurera/Confeccionista a medida/Bordados", "Mecánico",
    "Mecánico de Motos", "Mensajería", "Nutricionista",
    "Organizador Profesional", "Paseador de Perros", "Pastelero",
    "Pedicurista", "Peluquero/a", "Peluquero Canino", "Personal Shopper",
    "Pintor", "Pintor de Obras", "Piscinas / Piletas Colocación",
    "Plomero / Gasista", "Podador de Árboles", "Polarizado de Vidrios",
    "Profesor de Apoyo Escolar", "Profesor de Canto", "Profesor de Danza",
    "Profesor de Dibujo y Pintura",
    "Profesor de Física",
    "Profesor de Idiomas", "Profesor de Matemáticas", "Profesor de Música",
    "Profesor de Música (Guitarra)", "Profesor de Música (Piano)",
    "Profesor de Química", "Profesor de Yoga", "Profesor de Pilates",
    "Profesor Particular", "Profesora de Inglés", "Psicólogo",
    "Psicopedagogo", "Pulidor de Pisos", "Redactor de Contenidos",
    "Remisero", "Reparación de Celulares", "Reparación de Computadoras",
    "Reparación de Electrodomésticos", "Repostero",
    "Servicio Técnico (Línea Blanca)", "Soldador", "Sommelier", "Tapicero",
    "Techista", "Técnico de Aire Acondicionado", "Técnico de Celulares",
    "Técnico de PC", "Técnico en Calefacción",
    "Técnico en Energías Renovables", "Técnico en Redes",
    "Técnico en Refrigeración", "Terapista Ocupacional", "Traductor",
    "Veterinario", "Vidriería"
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

  const handleAddCustomProfession = () => {
    if (customProfession.trim() && selectedServices.length < 3) {
      setSelectedServices(prev => [...prev, customProfession.trim()]);
      setCustomProfession('');
      setShowCustomProfession(false);
    }
  };

  const filteredServices = serviceCategories.filter(name =>
    name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const signUpWithGoogle = async () => {
    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/register`,
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.acceptTerms) {
      toast.error('Debes aceptar los términos y condiciones');
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
      if (user) {
        if (userType === 'professional') {
          const { data: existingProfessional } = await supabase
            .from('professionals')
            .select('id')
            .eq('email', user.email || formData.email)
            .maybeSingle();
            
          if (existingProfessional) {
            toast.error('Este email ya está registrado como profesional');
            setIsLoading(false);
            return;
          }

          if (formData.dni) {
            const { data: existingDNI } = await supabase
              .from('professionals')
              .select('id')
              .eq('dni', formData.dni)
              .maybeSingle();
              
            if (existingDNI) {
              toast.error('Este DNI ya está registrado como profesional');
              setIsLoading(false);
              return;
            }
          }

          const professionalName = formData.fullName || user.user_metadata?.full_name || 'Profesional';
          const professionType = selectedServices[0] || 'Profesional';
          
          const { data: newProfessional, error: profileError } = await supabase.from('professionals').insert({
            user_id: user.id,
            full_name: professionalName,
            email: user.email || formData.email,
            phone: formData.phone || '',
            dni: formData.dni || '',
            profession: professionType,
            location: formData.location || '',
            description: formData.description || '',
            availability: 'Disponible'
          }).select('id').single();

          if (profileError) {
            toast.error('Error al crear perfil profesional: ' + profileError.message);
            setIsLoading(false);
            return;
          }

          if (newProfessional) {
            notifyNewProfessionalToAllUsers(
              newProfessional.id,
              professionalName,
              professionType,
              user.id
            );
          }
        }

        const dashboardRoute = await getDashboardRoute(user.id);
        toast.success('¡Perfil creado exitosamente!');
        navigate(dashboardRoute, { replace: true });
        setIsLoading(false);
        return;
      }

      if (formData.password !== formData.confirmPassword) {
        toast.error('Las contraseñas no coinciden');
        setIsLoading(false);
        return;
      }
      
      const passwordValidation = validatePassword(formData.password);
      if (!passwordValidation.isValid) {
        toast.error('La contraseña no cumple con los requisitos de seguridad');
        setIsLoading(false);
        return;
      }

      if (userType === 'professional') {
        const { data: existingProfessional } = await supabase
          .from('professionals')
          .select('id')
          .eq('email', formData.email)
          .maybeSingle();
          
        if (existingProfessional) {
          toast.error('Este email ya está registrado como profesional');
          setIsLoading(false);
          return;
        }

        if (formData.dni) {
          const { data: existingDNI } = await supabase
            .from('professionals')
            .select('id')
            .eq('dni', formData.dni)
            .maybeSingle();
            
          if (existingDNI) {
            toast.error('Este DNI ya está registrado como profesional');
            setIsLoading(false);
            return;
          }
        }
      }
      
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
        setIsLoading(false);
        return;
      }

      const { error: loginError } = await signIn(formData.email, formData.password);

      if (!loginError) {
        const { data: { user: newUser } } = await supabase.auth.getUser();
        if (newUser && userType === 'professional') {
          try {
            const professionType = selectedServices[0] || 'Profesional';
            
            const { data: createdProfessional } = await supabase.from('professionals').insert({
              user_id: newUser.id,
              full_name: formData.fullName,
              email: formData.email,
              phone: formData.phone || '',
              dni: formData.dni || '',
              profession: professionType,
              location: formData.location || '',
              description: formData.description || '',
              availability: 'Disponible'
            }).select('id').single();

            if (createdProfessional) {
              notifyNewProfessionalToAllUsers(
                createdProfessional.id,
                formData.fullName,
                professionType,
                newUser.id
              );
            }
          } catch (err) {
            console.error('Error creando perfil profesional:', err);
          }
        }

        if (newUser) {
          const dashboardRoute = await getDashboardRoute(newUser.id);
          toast.success('¡Cuenta creada e inicio de sesión exitoso!');
          navigate(dashboardRoute, { replace: true });
        }
      } else {
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
        className="min-h-screen flex items-center justify-center bg-cover bg-center relative py-12"
        style={{ backgroundImage: `url(${heroProfessionals})` }}
      >
        {/* Overlay with stronger blur */}
        <div className="absolute inset-0 bg-gradient-to-br from-navy/90 via-navy/85 to-navy/80 backdrop-blur-md"></div>
        
        {/* Back to Home */}
        <Link to="/" className="absolute top-6 left-6 z-20">
          <Button variant="ghost" className="text-white hover:bg-white/10 border-white/20">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al inicio
          </Button>
        </Link>

        {/* Register Form */}
        <div className={`relative z-10 w-full mx-4 ${userType === 'professional' ? 'max-w-2xl' : 'max-w-md'}`}>
          <div className="bg-white backdrop-blur-xl p-8 rounded-3xl shadow-2xl">
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
                  Busco un Profesional
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

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-muted-foreground">
                      O continúa con email
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className={userType === 'professional' ? 'grid grid-cols-1 md:grid-cols-2 gap-4' : 'space-y-4'}>
                {/* Column 1: Name, Email, Password, Confirm Password */}
                <div>
                  <Label htmlFor="name" className="text-sm font-medium text-foreground">
                    Nombre completo
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Tu nombre completo"
                    className={inputClasses}
                    value={formData.fullName}
                    onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="email" className="text-sm font-medium text-foreground">
                    Correo electrónico
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="tu@email.com"
                    className={inputClasses}
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="password" className="text-sm font-medium text-foreground">
                    Contraseña
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className={`${inputClasses} pr-10`}
                      value={formData.password}
                      onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground/50 hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  <PasswordStrengthIndicator password={formData.password} className="mt-2" />
                </div>

                <div>
                  <Label htmlFor="confirmPassword" className="text-sm font-medium text-foreground">
                    Confirmar contraseña
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className={`${inputClasses} pr-10`}
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground/50 hover:text-foreground"
                    >
                      {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                {/* Column 2 (professional only): DNI, Phone, Location, Description */}
                {userType === 'professional' && (
                  <>
                    <div>
                      <Label htmlFor="dni" className="text-sm font-medium text-foreground">
                        DNI
                      </Label>
                      <Input
                        id="dni"
                        type="text"
                        placeholder="12345678"
                        className={inputClasses}
                        value={formData.dni}
                        onChange={(e) => setFormData(prev => ({ ...prev, dni: e.target.value }))}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="phone" className="text-sm font-medium text-foreground">
                        Teléfono
                      </Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+549 3492 123456"
                        className={inputClasses}
                        value={formData.phone}
                        onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      />
                    </div>

                    <LocationAutocomplete
                      value={formData.location}
                      onChange={(value) => setFormData(prev => ({ ...prev, location: value }))}
                      label="Ciudad"
                      id="location"
                      placeholder="Busca tu ciudad o provincia..."
                    />

                    <div>
                      <Label htmlFor="description" className="text-sm font-medium text-foreground">
                        Descripción (Sobre Mí)
                      </Label>
                      <textarea
                        id="description"
                        placeholder="Contános sobre tu experiencia..."
                        className="w-full h-[48px] px-3 py-2 border border-border/60 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none text-sm bg-background"
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      />
                    </div>
                  </>
                )}
              </div>

              {/* Tag-based profession selection (full width) */}
              {userType === 'professional' && (
                <div>
                  <Label className="text-sm font-medium text-foreground mb-3 block">
                    Elegí hasta 3 profesiones ({selectedServices.length}/3)
                  </Label>

                  {/* Selected tags */}
                  {selectedServices.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {selectedServices.map(service => (
                        <span
                          key={service}
                          className="inline-flex items-center gap-1 bg-primary text-primary-foreground rounded-full px-3 py-1.5 text-sm font-medium"
                        >
                          {service}
                          <button
                            type="button"
                            onClick={() => handleServiceToggle(service)}
                            className="hover:bg-white/20 rounded-full p-0.5"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                  
                  {/* Search field */}
                  <div className="relative mb-3">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      type="text"
                      placeholder="Buscar profesiones..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 h-10 border-border/60 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-xl text-sm"
                    />
                  </div>

                  {/* Chips grid */}
                  <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-2 border border-border/40 rounded-xl">
                    {filteredServices.map((name, index) => {
                      const isSelected = selectedServices.includes(name);
                      const isDisabled = selectedServices.length >= 3 && !isSelected;
                      
                      return (
                        <button
                          key={index}
                          type="button"
                          onClick={() => handleServiceToggle(name)}
                          disabled={isDisabled}
                          className={`rounded-full px-3 py-1.5 text-sm transition-all duration-200 ${
                            isSelected
                              ? 'bg-primary text-primary-foreground'
                              : isDisabled
                              ? 'border border-border/30 text-muted-foreground/50 cursor-not-allowed'
                              : 'border border-border rounded-full hover:border-primary cursor-pointer text-foreground'
                          }`}
                        >
                          {name}
                        </button>
                      );
                    })}

                    {/* "Otra profesión" option */}
                    {!showCustomProfession && (
                      <button
                        type="button"
                        onClick={() => setShowCustomProfession(true)}
                        disabled={selectedServices.length >= 3}
                        className={`rounded-full px-3 py-1.5 text-sm border border-dashed transition-all duration-200 ${
                          selectedServices.length >= 3
                            ? 'border-border/30 text-muted-foreground/50 cursor-not-allowed'
                            : 'border-primary text-primary hover:bg-primary/5 cursor-pointer'
                        }`}
                      >
                        + Otra profesión (Sugerir)
                      </button>
                    )}
                  </div>

                  {/* Custom profession input */}
                  {showCustomProfession && (
                    <div className="flex gap-2 mt-3">
                      <Input
                        type="text"
                        placeholder="Escribí tu profesión..."
                        value={customProfession}
                        onChange={(e) => setCustomProfession(e.target.value)}
                        className="flex-1 h-10 border-border/60 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-xl text-sm"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddCustomProfession();
                          }
                        }}
                      />
                      <Button
                        type="button"
                        size="sm"
                        onClick={handleAddCustomProfession}
                        disabled={!customProfession.trim() || selectedServices.length >= 3}
                        className="rounded-xl"
                      >
                        Agregar
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => { setShowCustomProfession(false); setCustomProfession(''); }}
                        className="rounded-xl"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {/* Terms */}
              <div className="flex items-center text-sm">
                <label className="flex items-center">
                  <input 
                    type="checkbox" 
                    className="mr-2" 
                    checked={formData.acceptTerms}
                    onChange={(e) => setFormData(prev => ({ ...prev, acceptTerms: e.target.checked }))}
                    required
                  />
                  <span className="text-muted-foreground">
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
                              Bienvenido/a a CHEQUEALO.NET (el "Sitio" y/o la "Plataforma"), operado por [Razón Social], CUIT [CUIT], con domicilio en [Domicilio legal] ("CHEQUEALO.NET", "nosotros" o "nuestro").
                              Estos Términos y Condiciones (los "Términos") regulan el acceso y uso del Sitio, de nuestras aplicaciones asociadas y de los servicios que ofrecemos (los "Servicios"). Al registrarte, acceder o utilizar la Plataforma aceptás estos Términos y nuestra Política de Privacidad.
                            </p>
                            <p>Si no estás de acuerdo, no utilices la Plataforma.</p>

                            <div>
                              <h3 className="font-semibold mb-2">1) Objeto del servicio</h3>
                              <p>CHEQUEALO.NET es un directorio y canal de contacto que conecta usuarios que buscan servicios ("Usuarios") con profesionales y comercios que los ofrecen ("Profesionales"). CHEQUEALO.NET no presta servicios profesionales, no participa en la relación contractual entre Usuarios y Profesionales, ni garantiza resultados, precios, plazos, títulos, habilitaciones o calidad.</p>
                            </div>
                            <div>
                              <h3 className="font-semibold mb-2">2) Cuentas y veracidad de la información</h3>
                              <p>Para usar funciones específicas debés crear una Cuenta con datos verdaderos, exactos y actualizados. Sos responsable de la confidencialidad de tus credenciales y de toda actividad realizada desde tu Cuenta.</p>
                            </div>
                            <div>
                              <h3 className="font-semibold mb-2">3) Rol y responsabilidades</h3>
                              <p>Usuarios deben verificar la idoneidad del Profesional. Profesionales deben publicar información veraz. CHEQUEALO.NET ofrece herramientas de exhibición, búsqueda, mensajería y reseñas.</p>
                            </div>
                            <div>
                              <h3 className="font-semibold mb-2">4-18) Términos adicionales</h3>
                              <p>Incluyen publicaciones y licencias, reseñas, planes y precios, privacidad, prohibiciones, propiedad intelectual, disponibilidad, limitación de responsabilidad, indemnidad, enlaces a terceros, comunicaciones, cesión, vigencia, modificaciones, y ley aplicable (República Argentina).</p>
                            </div>
                          </div>
                        </ScrollArea>
                      </DialogContent>
                    </Dialog>
                  </span>
                </label>
              </div>

              {/* Golden submit button */}
              <Button 
                type="submit" 
                className="w-full h-14 text-base rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 text-black font-bold shadow-[0_0_20px_rgba(251,191,36,0.3)] hover:shadow-[0_0_30px_rgba(251,191,36,0.5)] transition-all"
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
              <p className="text-muted-foreground mb-4">¿Ya tenés cuenta?</p>
              <Link to="/login">
                <Button variant="outline" className="w-full border-primary text-primary hover:bg-primary hover:text-primary-foreground rounded-xl">
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
