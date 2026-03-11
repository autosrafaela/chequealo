import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { PasswordStrengthIndicator } from '@/components/ui/password-strength-indicator';
import { validatePassword } from '@/utils/passwordValidation';
import { useAppLogo } from '@/hooks/useAppLogo';
import { getDashboardRoute } from '@/utils/redirectHelpers';
import { Loader2, Eye, EyeOff, ArrowLeft, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import heroProfessionals from '@/assets/hero-professionals.jpg';

const inputClasses = "border-border/60 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-xl h-12";

const ActualizarPassword = () => {
  const navigate = useNavigate();
  const chequealoLogo = useAppLogo();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isRecovery, setIsRecovery] = useState(false);
  const [checking, setChecking] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Listen for PASSWORD_RECOVERY event from Supabase
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setIsRecovery(true);
        setChecking(false);
      }
    });

    // Also check hash for type=recovery (direct navigation)
    const hash = window.location.hash;
    if (hash.includes('type=recovery')) {
      const params = new URLSearchParams(hash.substring(1));
      const accessToken = params.get('access_token') || '';
      const refreshToken = params.get('refresh_token') || '';

      if (accessToken) {
        supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken })
          .then(({ error }) => {
            if (error) {
              setError('El enlace de recuperación es inválido o ha expirado.');
              setChecking(false);
            } else {
              setIsRecovery(true);
              setChecking(false);
            }
            window.history.replaceState({}, '', window.location.pathname);
          });
      } else {
        setChecking(false);
      }
    } else {
      // Check if user already has an active session (came from onAuthStateChange PASSWORD_RECOVERY)
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
          setIsRecovery(true);
        }
        setChecking(false);
      });
    }

    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    const validation = validatePassword(password);
    if (!validation.isValid) {
      setError('La contraseña no cumple con los requisitos de seguridad');
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        setError(error.message);
      } else {
        setSuccess(true);
        toast.success('¡Contraseña actualizada correctamente!');
        
        const { data: { user } } = await supabase.auth.getUser();
        setTimeout(async () => {
          if (user) {
            const route = await getDashboardRoute(user.id);
            navigate(route, { replace: true });
          } else {
            navigate('/auth', { replace: true });
          }
        }, 2000);
      }
    } catch {
      setError('Error inesperado. Inténtalo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  if (checking) {
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

      <Link
        to="/"
        className="absolute top-6 left-6 z-20 flex items-center gap-2 text-white/80 hover:text-white transition-colors text-sm font-medium"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver al inicio
      </Link>

      <div className="relative z-10 w-full max-w-md mx-4 bg-white p-8 rounded-3xl shadow-2xl">
        <div className="flex justify-center mb-6">
          <img src={chequealoLogo} alt="Chequealo" className="h-10 w-auto" />
        </div>

        {success ? (
          <div className="text-center space-y-4">
            <CheckCircle className="h-16 w-16 text-success mx-auto" />
            <h1 className="text-2xl font-bold text-foreground">¡Contraseña actualizada!</h1>
            <p className="text-muted-foreground">Redirigiendo a tu panel...</p>
          </div>
        ) : !isRecovery ? (
          <div className="text-center space-y-4">
            <h1 className="text-xl font-bold text-foreground">Enlace inválido o expirado</h1>
            <p className="text-muted-foreground text-sm">
              Este enlace de recuperación ya no es válido. Solicitá uno nuevo desde la pantalla de inicio de sesión.
            </p>
            <Link
              to="/auth"
              className="inline-block mt-4 h-12 px-6 bg-gradient-to-r from-amber-400 to-orange-500 text-black font-bold rounded-xl shadow-[0_0_20px_rgba(251,191,36,0.3)] hover:shadow-[0_0_30px_rgba(251,191,36,0.5)] transition-all text-sm leading-[3rem]"
            >
              Ir a Iniciar Sesión
            </Link>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-center text-foreground mb-2">
              Crear tu nueva contraseña
            </h1>
            <p className="text-center text-muted-foreground text-sm mb-6">
              Ingresá una contraseña segura para tu cuenta.
            </p>

            {error && (
              <Alert className="mb-4" variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-password" className="text-sm font-medium text-foreground">
                  Nueva contraseña
                </Label>
                <div className="relative">
                  <Input
                    id="new-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Tu nueva contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    className={inputClasses}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <PasswordStrengthIndicator password={password} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password" className="text-sm font-medium text-foreground">
                  Confirmar contraseña
                </Label>
                <div className="relative">
                  <Input
                    id="confirm-password"
                    type={showConfirm ? 'text' : 'password'}
                    placeholder="Repetí tu contraseña"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    className={inputClasses}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowConfirm(!showConfirm)}
                  >
                    {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {confirmPassword && password !== confirmPassword && (
                  <p className="text-xs text-destructive">Las contraseñas no coinciden</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading || !password || !confirmPassword}
                className="h-14 w-full bg-gradient-to-r from-amber-400 to-orange-500 text-black font-bold rounded-xl shadow-[0_0_20px_rgba(251,191,36,0.3)] hover:shadow-[0_0_30px_rgba(251,191,36,0.5)] transition-all text-base disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Actualizando...
                  </>
                ) : (
                  'Actualizar Contraseña'
                )}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default ActualizarPassword;
