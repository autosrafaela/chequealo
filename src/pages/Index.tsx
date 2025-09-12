import Header from "@/components/Header";
import Hero from "@/components/Hero";
import ServiceCategories from "@/components/ServiceCategories";
import { Button } from "@/components/ui/button";
import { MapPin, Shield, Clock, Star } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Hero />
      <ServiceCategories />
      
      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              ¿Por qué elegir TodoAca.ar?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              La plataforma más confiable para conectar con profesionales verificados
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <MapPin className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Profesionales Cercanos</h3>
              <p className="text-muted-foreground">Encontrá servicios en tu zona con geolocalización precisa</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-success/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-success" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Verificados</h3>
              <p className="text-muted-foreground">Todos nuestros profesionales están verificados y validados</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-warning/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8 text-warning" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Respuesta Rápida</h3>
              <p className="text-muted-foreground">Obtené presupuestos y respuestas en tiempo récord</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Star className="h-8 w-8 text-yellow-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Calidad Garantizada</h3>
              <p className="text-muted-foreground">Sistema de calificaciones y reseñas de clientes reales</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-navy text-navy-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            ¿Sos un profesional?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
            Uníte a nuestra plataforma y conectá con miles de clientes que buscan tus servicios
          </p>
          <div className="space-y-4 sm:space-y-0 sm:flex sm:justify-center">
            <Button size="lg" className="bg-primary hover:bg-primary/90 px-8 py-3">
              Registrarme como Profesional
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div>
              <h3 className="text-white text-lg font-semibold mb-4">TodoAca.ar</h3>
              <p className="text-sm mb-4">
                La plataforma líder para conectar clientes con profesionales de confianza en Argentina.
              </p>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Para Clientes</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">Buscar profesionales</a></li>
                <li><a href="#" className="hover:text-white">Cómo funciona</a></li>
                <li><a href="#" className="hover:text-white">Preguntas frecuentes</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Para Profesionales</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">Registrarme</a></li>
                <li><a href="#" className="hover:text-white">Planes y precios</a></li>
                <li><a href="#" className="hover:text-white">Centro de ayuda</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Contacto</h4>
              <ul className="space-y-2 text-sm">
                <li>📧 info@todoaca.ar</li>
                <li>📱 +54 9 3492 60-7224</li>
                <li>📍 Argentina</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
            <p>&copy; 2024 TodoAca.ar. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
