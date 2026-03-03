import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { PasswordStrengthIndicator } from '@/components/ui/password-strength-indicator';
import { validatePassword } from '@/utils/passwordValidation';
import { getDashboardRoute } from '@/utils/redirectHelpers';
import { useAppLogo } from '@/hooks/useAppLogo';
import heroProfessionals from '@/assets/hero-professionals.jpg';

const inputClasses = "border-border/60 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-xl h-12";

const Auth = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { signIn, signUp, resetPassword, user, loading } = useAuth();
  
  const chequealoLogo = useAppLogo();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'login');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  
  // Login form
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  // Forgot password form
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  
  // Signup form
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [dni, setDni] = useState('');
  const [isProfessional, setIsProfessional] = useState(false);

  // Manejo del callback OAuth (PKCE code o hash) para finalizar sesión y evitar 404
  useEffect(() => {
    const url = new URL(window.location.href);
    const hasCode = url.searchParams.has('code');
    const hasAccessToken = window.location.hash.includes('access_token');

    const finalize = async () => {
      try {
        if (hasCode) {
          const { error } = await supabase.auth.exchangeCodeForSession(window.location.href);
          if (error) {
            console.error('[Auth] exchangeCodeForSession error:', error);
            setError('No se pudo completar el inicio de sesión. Intenta nuevamente.');
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
              console.error('[Auth] setSession error:', error);
              setError('No se pudo completar el inicio de sesión. Intenta nuevamente.');
            }
            window.location.hash = '';
          }
        }
      } catch (e) {
        console.error('[Auth] OAuth finalize error:', e);
      }
    };

    finalize();
  }, []);

  useEffect(() => {
    if (user && !loading) {
      getDashboardRoute(user.id).then(dashboardRoute => {
        navigate(dashboardRoute, { replace: true });
      });
    }
  }, [user, loading, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const { error } = await signIn(loginEmail, loginPassword);
      
      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          setError('Email o contraseña incorrectos');
        } else if (error.message.includes('Email not confirmed')) {
          setError('Por favor confirma tu email antes de iniciar sesión');
        } else {
          setError(error.message);
        }
      } else {
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        if (currentUser) {
          const dashboardRoute = await getDashboardRoute(currentUser.id);
          toast.success('¡Bienvenido de vuelta!');
          navigate(dashboardRoute, { replace: true });
        }
      }
    } catch (err) {
      setError('Error inesperado. Inténtalo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (signupPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      setIsLoading(false);
      return;
    }

    const passwordValidation = validatePassword(signupPassword);
    if (!passwordValidation.isValid) {
      setError('La contraseña no cumple con los requisitos de seguridad');
      setIsLoading(false);
      return;
    }

    if (isProfessional) {
      if (!dni.trim()) {
        setError('El DNI es requerido para profesionales');
        setIsLoading(false);
        return;
      }

      try {
        const { data: existingProfessional } = await supabase
          .from('professionals')
          .select('id')
          .eq('email', signupEmail)
          .single();
          
        if (existingProfessional) {
          setError('Este email ya está registrado como profesional');
          setIsLoading(false);
          return;
        }

        const { data: existingDNI } = await supabase
          .from('professionals')
          .select('id')
          .eq('dni', dni.trim())
          .single();
          
        if (existingDNI) {
          setError('Este DNI ya está registrado como profesional');
          setIsLoading(false);
          return;
        }
      } catch (err) {
        // Expected if no existing records
      }
    }

    try {
      const { error } = await signUp(signupEmail, signupPassword, fullName, username);
      
      if (error) {
        if (error.message.includes('already registered')) {
          setError('Este email ya está registrado. Intenta iniciar sesión.');
        } else if (error.message.includes('Password should be at least')) {
          setError('La contraseña debe tener al menos 6 caracteres');
        } else {
          setError(error.message);
        }
      } else {
        if (isProfessional) {
          navigate(`/register?type=professional&email=${encodeURIComponent(signupEmail)}&name=${encodeURIComponent(fullName)}&dni=${encodeURIComponent(dni)}`, { replace: true });
        } else {
          const { error: loginError } = await signIn(signupEmail, signupPassword);
          
          if (!loginError) {
            const { data: { user: currentUser } } = await supabase.auth.getUser();
            if (currentUser) {
              const dashboardRoute = await getDashboardRoute(currentUser.id);
              toast.success('¡Cuenta creada e inicio de sesión exitoso!');
              navigate(dashboardRoute, { replace: true });
            }
          } else {
            toast.success('¡Cuenta creada! Revisa tu email para confirmar tu cuenta.');
            setError('Por favor confirma tu email antes de iniciar sesión');
          }
        }
      }
    } catch (err) {
      setError('Error inesperado. Inténtalo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetLoading(true);

    try {
      const { error } = await resetPassword(resetEmail);
      
      if (error) {
        toast.error('Error al enviar el email de recuperación: ' + error.message);
      } else {
        toast.success('¡Email de recuperación enviado! Revisa tu bandeja de entrada.');
        setShowForgotPassword(false);
        setResetEmail('');
      }
    } catch (err) {
      toast.error('Error inesperado. Inténtalo de nuevo.');
    } finally {
      setResetLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    setIsLoading(true);
    setError('');
    
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
        setError('Error al iniciar sesión con Google: ' + error.message);
      }
    } catch (err) {
      setError('Error inesperado con Google Sign-In');
    } finally {
      setIsLoading(false);
    }
  };

  const GoogleIcon = () => (
    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  );

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center bg-cover bg-center relative"
        style={{ backgroundImage: `url(${heroProfessionals})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-navy/90 via-navy/85 to-navy/80 backdrop-blur-md" />
        <div className="relative z-10">
          <Loader2 className="h-8 w-8 animate-spin text-white" />
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center relative py-8"
      style={{ backgroundImage: `url(${heroProfessionals})` }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-navy/90 via-navy/85 to-navy/80 backdrop-blur-md" />

      {/* Volver al inicio */}
      <Link
        to="/"
        className="absolute top-6 left-6 z-20 flex items-center gap-2 text-white/80 hover:text-white transition-colors text-sm font-medium"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver al inicio
      </Link>

      {/* Card principal */}
      <div className="relative z-10 w-full max-w-md mx-4 bg-white p-8 rounded-3xl shadow-2xl">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <img src={chequealoLogo} alt="Chequealo" className="h-10 w-auto" />
        </div>

        {/* Tabs custom */}
        <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
          <button
            type="button"
            onClick={() => { setActiveTab('login'); setError(''); }}
            className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'login'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Iniciar Sesión
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('signup'); setError(''); }}
            className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'signup'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Registrarse
          </button>
        </div>

        {error && (
          <Alert className="mb-4" variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* ============ LOGIN TAB ============ */}
        {activeTab === 'login' && (
          <div className="space-y-4">
            {/* Google */}
            <button
              type="button"
              onClick={signInWithGoogle}
              disabled={isLoading}
              className="w-full flex items-center justify-center border border-border/60 rounded-xl h-12 hover:bg-gray-50 bg-white text-sm font-medium transition-colors disabled:opacity-50"
            >
              <GoogleIcon />
              Continuar con Google
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border/40" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-muted-foreground">O continúa con email</span>
              </div>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login-email" className="text-sm font-medium text-foreground">Email</Label>
                <Input
                  id="login-email"
                  type="email"
                  placeholder="tu@email.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  className={inputClasses}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="login-password" className="text-sm font-medium text-foreground">Contraseña</Label>
                <div className="relative">
                  <Input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Tu contraseña"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    className={inputClasses}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="text-right">
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="text-sm text-primary hover:underline"
                  disabled={isLoading}
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
              
              <button
                type="submit"
                disabled={isLoading}
                className="h-14 w-full bg-gradient-to-r from-amber-400 to-orange-500 text-black font-bold rounded-xl shadow-[0_0_20px_rgba(251,191,36,0.3)] hover:shadow-[0_0_30px_rgba(251,191,36,0.5)] transition-all text-base disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Iniciando sesión...
                  </>
                ) : (
                  'Iniciar Sesión'
                )}
              </button>
            </form>

            <p className="text-center text-sm text-gray-500 mt-4">
              ¿No tenés cuenta?{' '}
              <button
                type="button"
                onClick={() => { setActiveTab('signup'); setError(''); }}
                className="text-primary font-semibold hover:underline"
              >
                Registrate
              </button>
            </p>
          </div>
        )}

        {/* ============ SIGNUP TAB ============ */}
        {activeTab === 'signup' && (
          <div className="space-y-4">
            {/* Google */}
            <button
              type="button"
              onClick={signInWithGoogle}
              disabled={isLoading}
              className="w-full flex items-center justify-center border border-border/60 rounded-xl h-12 hover:bg-gray-50 bg-white text-sm font-medium transition-colors disabled:opacity-50"
            >
              <GoogleIcon />
              Registrarse con Google
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border/40" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-muted-foreground">O continúa con email</span>
              </div>
            </div>

            <form onSubmit={handleSignup} className="space-y-4">
              {/* Tipo de cuenta toggle */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground">Tipo de cuenta</Label>
                <div className="flex bg-gray-100 rounded-xl p-1">
                  <button
                    type="button"
                    onClick={() => setIsProfessional(false)}
                    className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                      !isProfessional
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    Busco un Profesional
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsProfessional(true)}
                    className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                      isProfessional
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    Profesional
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="full-name" className="text-sm font-medium text-foreground">Nombre Completo (opcional)</Label>
                <Input
                  id="full-name"
                  type="text"
                  placeholder="Juan Pérez"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  disabled={isLoading}
                  className={inputClasses}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="signup-email" className="text-sm font-medium text-foreground">Email</Label>
                <Input
                  id="signup-email"
                  type="email"
                  placeholder="tu@email.com"
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  className={inputClasses}
                />
              </div>

              {isProfessional && (
                <div className="space-y-2">
                  <Label htmlFor="dni" className="text-sm font-medium text-foreground">DNI (requerido para profesionales)</Label>
                  <Input
                    id="dni"
                    type="text"
                    placeholder="12345678"
                    value={dni}
                    onChange={(e) => setDni(e.target.value)}
                    required={isProfessional}
                    disabled={isLoading}
                    className={inputClasses}
                  />
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="signup-password" className="text-sm font-medium text-foreground">Contraseña</Label>
                <div className="relative">
                  <Input
                    id="signup-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Mínimo 6 caracteres"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    className={inputClasses}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                <PasswordStrengthIndicator password={signupPassword} className="mt-2" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirm-password" className="text-sm font-medium text-foreground">Confirmar Contraseña</Label>
                <div className="relative">
                  <Input
                    id="confirm-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Repite tu contraseña"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    className={inputClasses}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={isLoading}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              
              <button
                type="submit"
                disabled={isLoading}
                className="h-14 w-full bg-gradient-to-r from-amber-400 to-orange-500 text-black font-bold rounded-xl shadow-[0_0_20px_rgba(251,191,36,0.3)] hover:shadow-[0_0_30px_rgba(251,191,36,0.5)] transition-all text-base disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creando cuenta...
                  </>
                ) : (
                  'Crear Cuenta'
                )}
              </button>
            </form>

            <p className="text-center text-sm text-gray-500 mt-4">
              ¿Ya tenés cuenta?{' '}
              <button
                type="button"
                onClick={() => { setActiveTab('login'); setError(''); }}
                className="text-primary font-semibold hover:underline"
              >
                Iniciá Sesión
              </button>
            </p>
          </div>
        )}

        {/* Terms */}
        <div className="mt-6 text-center text-xs text-gray-400">
          Al registrarte, aceptás nuestros{' '}
          <Link to="/terms" className="text-primary hover:underline">Términos de Servicio</Link>{' '}
          y{' '}
          <Link to="/privacy" className="text-primary hover:underline">Política de Privacidad</Link>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-2xl">
            <div className="flex items-center gap-2 mb-4">
              <button
                onClick={() => setShowForgotPassword(false)}
                className="p-1 hover:bg-gray-100 rounded-lg"
                disabled={resetLoading}
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
              <h3 className="text-lg font-semibold">Recuperar Contraseña</h3>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              Ingresá tu email y te enviaremos un enlace para restablecer tu contraseña
            </p>
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reset-email" className="text-sm font-medium text-foreground">Email</Label>
                <Input
                  id="reset-email"
                  type="email"
                  placeholder="tu@email.com"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  required
                  disabled={resetLoading}
                  className={inputClasses}
                />
              </div>
              
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForgotPassword(false)}
                  disabled={resetLoading}
                  className="flex-1 rounded-xl"
                >
                  Cancelar
                </Button>
                <button
                  type="submit"
                  disabled={resetLoading}
                  className="flex-1 h-10 bg-gradient-to-r from-amber-400 to-orange-500 text-black font-bold rounded-xl shadow-[0_0_20px_rgba(251,191,36,0.3)] hover:shadow-[0_0_30px_rgba(251,191,36,0.5)] transition-all text-sm disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {resetLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    'Enviar'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Auth;
