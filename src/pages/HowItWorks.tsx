import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Header from "@/components/Header";
import { Search, MessageSquare, Star, UserCheck, MapPin, Calendar } from "lucide-react";
import { Link } from "react-router-dom";

const HowItWorks = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-b from-primary/10 to-background">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            ¿Cómo funciona Chequealo?
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Conectamos clientes con profesionales verificados de manera simple y segura
          </p>
        </div>
      </section>

      {/* For Clients Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Para Clientes</h2>
            <p className="text-lg text-muted-foreground">Encontrá el profesional ideal en 3 simples pasos</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <Card className="text-center">
              <CardHeader>
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Search className="h-8 w-8 text-primary" />
                </div>
                <CardTitle>1. Buscá</CardTitle>
                <CardDescription>
                  Encontrá profesionales por categoría, ubicación o nombre
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Usá nuestros filtros avanzados para encontrar exactamente lo que necesitás cerca tuyo
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="w-16 h-16 bg-success/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="h-8 w-8 text-success" />
                </div>
                <CardTitle>2. Contactá</CardTitle>
                <CardDescription>
                  Enviá tu consulta y recibí presupuestos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Describí tu proyecto y recibí respuestas personalizadas de profesionales interesados
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="w-16 h-16 bg-warning/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Star className="h-8 w-8 text-warning" />
                </div>
                <CardTitle>3. Elegí</CardTitle>
                <CardDescription>
                  Compará perfiles y calificaciones
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Revisá las reseñas, trabajos anteriores y elegí el profesional que más te convenga
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="text-center">
            <Link to="/search">
              <Button size="lg" className="px-8">
                Comenzar Búsqueda
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* For Professionals Section */}
      <section className="py-16 bg-card">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Para Profesionales</h2>
            <p className="text-lg text-muted-foreground">Hacé crecer tu negocio con nuevos clientes</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <Card className="text-center">
              <CardHeader>
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <UserCheck className="h-8 w-8 text-primary" />
                </div>
                <CardTitle>1. Registrate</CardTitle>
                <CardDescription>
                  Creá tu perfil profesional
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Completá tu información, subí fotos de tus trabajos y obtené la verificación
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="w-16 h-16 bg-success/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <MapPin className="h-8 w-8 text-success" />
                </div>
                <CardTitle>2. Recibí solicitudes</CardTitle>
                <CardDescription>
                  Clientes te van a contactar
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Recibí notificaciones de trabajos en tu zona y respondé a las consultas
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="w-16 h-16 bg-warning/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Calendar className="h-8 w-8 text-warning" />
                </div>
                <CardTitle>3. Trabajá</CardTitle>
                <CardDescription>
                  Gestioná tus proyectos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Organizá tu agenda, completá trabajos y construí tu reputación con reseñas
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="text-center">
            <Link to="/register">
              <Button size="lg" className="px-8">
                Registrarme como Profesional
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">¿Por qué elegir Chequealo?</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <UserCheck className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Profesionales Verificados</h3>
                  <p className="text-muted-foreground">Todos nuestros profesionales pasan por un proceso de verificación riguroso</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-success/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <MapPin className="h-4 w-4 text-success" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Cobertura Nacional</h3>
                  <p className="text-muted-foreground">Encontrá profesionales en toda Argentina, desde CABA hasta el interior</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-warning/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <Star className="h-4 w-4 text-warning" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Sistema de Calificaciones</h3>
                  <p className="text-muted-foreground">Reseñas reales de clientes para que puedas elegir con confianza</p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <MessageSquare className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Comunicación Directa</h3>
                  <p className="text-muted-foreground">Hablá directamente con los profesionales sin intermediarios</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-success/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <Search className="h-4 w-4 text-success" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Búsqueda Inteligente</h3>
                  <p className="text-muted-foreground">Filtros avanzados para encontrar exactamente lo que necesitás</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-warning/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <Calendar className="h-4 w-4 text-warning" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Disponibilidad 24/7</h3>
                  <p className="text-muted-foreground">Accedé a la plataforma cuando lo necesites, cualquier día del año</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HowItWorks;