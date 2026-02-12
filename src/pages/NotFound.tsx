import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { SEOHead } from "@/components/SEO/SEOHead";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Home, Search, ArrowLeft, HelpCircle } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  // Suggested pages based on common patterns
  const getSuggestions = () => {
    const path = location.pathname.toLowerCase();
    
    if (path.includes('professional') || path.includes('profesional')) {
      return [
        { label: 'Buscar profesionales', href: '/search', icon: Search },
        { label: 'Inicio', href: '/', icon: Home },
      ];
    }
    
    if (path.includes('search') || path.includes('buscar')) {
      return [
        { label: 'Buscar profesionales', href: '/search', icon: Search },
        { label: 'Inicio', href: '/', icon: Home },
      ];
    }
    
    return [
      { label: 'Inicio', href: '/', icon: Home },
      { label: 'Buscar profesionales', href: '/search', icon: Search },
      { label: 'Preguntas frecuentes', href: '/faq', icon: HelpCircle },
    ];
  };

  const suggestions = getSuggestions();

  return (
    <>
      <SEOHead 
        title="Página no encontrada - Error 404 | Chequealo"
        description="La página que buscás no existe o fue movida. Encontrá profesionales verificados en Argentina usando nuestro buscador."
        noIndex={true}
      />
      
      <div className="min-h-screen bg-background">
        <Header />
        
        <main className="container mx-auto px-4 py-12 md:py-20">
          <div className="max-w-2xl mx-auto text-center">
            {/* Error Code */}
            <div className="mb-8">
              <h1 className="text-8xl md:text-9xl font-bold text-primary/20 select-none">
                404
              </h1>
            </div>
            
            {/* Error Message */}
            <Card className="mb-8">
              <CardContent className="pt-8 pb-8">
                <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                  Página no encontrada
                </h2>
                <p className="text-muted-foreground text-lg mb-2">
                  Lo sentimos, la página que buscás no existe o fue movida.
                </p>
                <p className="text-muted-foreground text-sm">
                  URL solicitada: <code className="bg-muted px-2 py-1 rounded text-xs">{location.pathname}</code>
                </p>
              </CardContent>
            </Card>
            
            {/* Suggestions */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-foreground mb-4">
                ¿Qué podés hacer?
              </h3>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                {suggestions.map((suggestion) => (
                  <Link key={suggestion.href} to={suggestion.href}>
                    <Button variant="outline" className="w-full sm:w-auto gap-2">
                      <suggestion.icon className="h-4 w-4" />
                      {suggestion.label}
                    </Button>
                  </Link>
                ))}
              </div>
            </div>
            
            {/* Back Button */}
            <Button 
              variant="ghost" 
              onClick={() => window.history.back()}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver a la página anterior
            </Button>
            
            {/* Additional Help */}
            <div className="mt-12 pt-8 border-t border-border">
              <p className="text-sm text-muted-foreground mb-4">
                ¿Seguís teniendo problemas?
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center text-sm">
                <a 
                  href="mailto:info@chequealo.net" 
                  className="text-primary hover:underline"
                >
                  📧 info@chequealo.net
                </a>
                <a 
                  href="https://wa.me/5493492607224" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  📱 WhatsApp
                </a>
              </div>
            </div>
          </div>
        </main>
        
        {/* Footer minimal */}
        <footer className="mt-auto py-6 text-center text-sm text-muted-foreground border-t">
          <p>&copy; 2024 Chequealo. Todos los derechos reservados.</p>
        </footer>
      </div>
    </>
  );
};

export default NotFound;
