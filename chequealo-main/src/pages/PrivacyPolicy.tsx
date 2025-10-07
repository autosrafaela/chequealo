import Header from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl font-bold text-center">
                Política de Privacidad - Chequealo
              </CardTitle>
            </CardHeader>
            
            <CardContent className="prose max-w-none">
              <div className="space-y-6 text-sm">
                <section>
                  <h2 className="text-xl font-semibold mb-3">1. Información que Recolectamos</h2>
                  <p className="text-muted-foreground">
                    Recolectamos información que nos proporcionas directamente, como tu nombre, email, 
                    número de teléfono y datos profesionales cuando te registras en nuestra plataforma.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold mb-3">2. Cómo Usamos tu Información</h2>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>Para proporcionar y mejorar nuestros servicios</li>
                    <li>Para conectarte con profesionales o clientes</li>
                    <li>Para enviarte comunicaciones importantes sobre tu cuenta</li>
                    <li>Para personalizar tu experiencia en la plataforma</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-xl font-semibold mb-3">3. Compartir Información</h2>
                  <p className="text-muted-foreground">
                    No vendemos tu información personal. Compartimos información limitada solo cuando:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground mt-2">
                    <li>Es necesario para conectarte con profesionales o clientes</li>
                    <li>Lo requiere la ley</li>
                    <li>Es necesario para proteger nuestros derechos o los de nuestros usuarios</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-xl font-semibold mb-3">4. Seguridad de los Datos</h2>
                  <p className="text-muted-foreground">
                    Implementamos medidas de seguridad técnicas y organizacionales para proteger tu información 
                    personal contra acceso no autorizado, alteración, divulgación o destrucción.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold mb-3">5. Cookies y Tecnologías Similares</h2>
                  <p className="text-muted-foreground">
                    Usamos cookies y tecnologías similares para mejorar tu experiencia, analizar el uso 
                    de nuestro sitio y personalizar contenido. Puedes controlar las cookies a través 
                    de la configuración de tu navegador.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold mb-3">6. Tus Derechos</h2>
                  <p className="text-muted-foreground">Tienes derecho a:</p>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground mt-2">
                    <li>Acceder a tu información personal</li>
                    <li>Corregir información inexacta</li>
                    <li>Solicitar la eliminación de tu información</li>
                    <li>Oponerte al procesamiento de tu información</li>
                    <li>Portabilidad de tus datos</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-xl font-semibold mb-3">7. Retención de Datos</h2>
                  <p className="text-muted-foreground">
                    Conservamos tu información personal solo durante el tiempo necesario para cumplir 
                    con los propósitos descritos en esta política, a menos que la ley requiera 
                    un período de retención más largo.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold mb-3">8. Cambios a esta Política</h2>
                  <p className="text-muted-foreground">
                    Podemos actualizar esta política de privacidad ocasionalmente. Te notificaremos 
                    sobre cambios significativos publicando la nueva política en esta página.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold mb-3">9. Contacto</h2>
                  <p className="text-muted-foreground">
                    Si tienes preguntas sobre esta política de privacidad o sobre cómo manejamos 
                    tu información personal, puedes contactarnos a través de nuestra plataforma.
                  </p>
                </section>

                <div className="border-t pt-4 mt-8">
                  <p className="text-xs text-muted-foreground">
                    Última actualización: {new Date().toLocaleDateString('es-ES')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;