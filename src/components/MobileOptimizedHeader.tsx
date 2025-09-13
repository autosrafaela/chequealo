import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Menu, 
  Search, 
  Bell, 
  User, 
  Settings, 
  LogOut, 
  Heart,
  Briefcase,
  Home,
  BarChart3
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import { useRealtimeNotifications } from '@/hooks/useRealtimeNotifications';
import NotificationCenter from './NotificationCenter';

export const MobileOptimizedHeader: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut, profile } = useAuth();
  const { isAdmin, isModerator } = useUserRole();
  const { unreadCount } = useRealtimeNotifications();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
    setMobileMenuOpen(false);
  };

  const navigationItems = [
    { path: '/', label: 'Inicio', icon: Home },
    { path: '/search', label: 'Buscar', icon: Search },
    { path: '/favorites', label: 'Favoritos', icon: Heart },
  ];

  if (user) {
    navigationItems.push(
      { path: '/user-dashboard', label: 'Mi Cuenta', icon: User },
      { path: '/professional-dashboard', label: 'Mi Negocio', icon: Briefcase }
    );
    
    if (isAdmin || isModerator) {
      navigationItems.push(
        { path: '/admin', label: 'Administración', icon: BarChart3 }
      );
    }
  }

  const isActivePage = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between px-4">
        {/* Logo */}
        <div className="flex items-center">
          <Button
            variant="ghost"
            className="text-lg font-bold text-primary hover:bg-transparent"
            onClick={() => navigate('/')}
          >
            TodoAca.ar
          </Button>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <Button
                key={item.path}
                variant={isActivePage(item.path) ? "default" : "ghost"}
                size="sm"
                onClick={() => navigate(item.path)}
                className="flex items-center gap-2"
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Button>
            );
          })}
        </nav>

        {/* Right Side Actions */}
        <div className="flex items-center gap-2">
          {/* Search Button (Mobile) */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden p-2"
            onClick={() => navigate('/search')}
          >
            <Search className="h-5 w-5" />
          </Button>

          {/* Notifications */}
          {user && (
            <div className="relative">
              <NotificationCenter />
            </div>
          )}

          {/* User Menu / Auth */}
          {user ? (
            <div className="hidden md:flex items-center gap-3">
              <div className="flex flex-col items-end">
                <span className="text-sm font-medium">{profile?.full_name || 'Usuario'}</span>
                <span className="text-xs text-muted-foreground">{user.email}</span>
              </div>
              <Avatar className="h-8 w-8">
                <AvatarImage src={profile?.avatar_url} />
                <AvatarFallback>
                  {profile?.full_name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>
                Iniciar Sesión
              </Button>
              <Button size="sm" onClick={() => navigate('/register')}>
                Registrarse
              </Button>
            </div>
          )}

          {/* Mobile Menu */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="p-2 md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <div className="flex flex-col h-full">
                {/* User Info */}
                {user ? (
                  <div className="flex items-center gap-3 pb-6 border-b">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={profile?.avatar_url} />
                      <AvatarFallback>
                        {profile?.full_name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium">{profile?.full_name || 'Usuario'}</p>
                      <p className="text-sm text-muted-foreground">Hola, {profile?.full_name?.split(' ')[0] || user.email}!</p>
                    </div>
                  </div>
                ) : (
                  <div className="pb-6 border-b">
                    <div className="space-y-2">
                      <Button 
                        className="w-full" 
                        onClick={() => {
                          navigate('/login');
                          setMobileMenuOpen(false);
                        }}
                      >
                        Iniciar Sesión
                      </Button>
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => {
                          navigate('/register');
                          setMobileMenuOpen(false);
                        }}
                      >
                        Registrarse
                      </Button>
                    </div>
                  </div>
                )}

                {/* Navigation */}
                <nav className="flex-1 py-6">
                  <div className="space-y-2">
                    {navigationItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <Button
                          key={item.path}
                          variant={isActivePage(item.path) ? "secondary" : "ghost"}
                          className="w-full justify-start gap-3"
                          onClick={() => {
                            navigate(item.path);
                            setMobileMenuOpen(false);
                          }}
                        >
                          <Icon className="h-5 w-5" />
                          {item.label}
                        </Button>
                      );
                    })}
                  </div>
                </nav>

                {/* Bottom Actions */}
                {user && (
                  <div className="pt-6 border-t space-y-2">
                    <Button
                      variant="ghost"
                      className="w-full justify-start gap-3"
                      onClick={() => {
                        navigate('/profile');
                        setMobileMenuOpen(false);
                      }}
                    >
                      <Settings className="h-5 w-5" />
                      Configuración
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start gap-3 text-red-600"
                      onClick={handleSignOut}
                    >
                      <LogOut className="h-5 w-5" />
                      Cerrar Sesión
                    </Button>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};