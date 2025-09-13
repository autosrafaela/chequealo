import Header from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl font-bold text-center">
                Términos de Servicio - Chequealo
              </CardTitle>
            </CardHeader>
            
            <CardContent className="prose max-w-none">
              <div className="space-y-6 text-sm">
                <section>
                  <h2 className="text-xl font-semibold mb-3">1. Aceptación de los Términos</h2>
                  <p className="text-muted-foreground">
                    Al usar Chequealo, aceptas estos términos de servicio en su totalidad. 
                    Si no estás de acuerdo con alguna parte de estos términos, no debes usar nuestro servicio.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold mb-3">2. Descripción del Servicio</h2>
                  <p className="text-muted-foreground">
                    Chequealo es una plataforma que conecta profesionales de servicios con clientes potenciales. 
                    Facilitamos el contacto entre partes pero no somos responsables por la calidad del servicio prestado.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold mb-3">3. Registro de Cuenta</h2>
                  <p className="text-muted-foreground">
                    Para usar ciertas funciones, debes crear una cuenta proporcionando información precisa y actualizada. 
                    Eres responsable de mantener la confidencialidad de tu cuenta y contraseña.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold mb-3">4. Uso Aceptable</h2>
                  <p className="text-muted-foreground">
                    No puedes usar nuestra plataforma para actividades ilegales, fraudulentas o que violen los derechos de terceros. 
                    Nos reservamos el derecho de suspender cuentas que violen estas normas.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold mb-3">5. Responsabilidad</h2>
                  <p className="text-muted-foreground">
                    Chequealo actúa como intermediario. No somos responsables por la calidad, seguridad o legalidad 
                    de los servicios ofrecidos por los profesionales registrados en nuestra plataforma.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold mb-3">6. Privacidad</h2>
                  <p className="text-muted-foreground">
                    Tu privacidad es importante para nosotros. Consulta nuestra Política de Privacidad para 
                    entender cómo recolectamos, usamos y protegemos tu información personal.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold mb-3">7. Modificaciones</h2>
                  <p className="text-muted-foreground">
                    Podemos modificar estos términos en cualquier momento. Los cambios entrarán en vigor 
                    inmediatamente después de su publicación en esta página.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold mb-3">8. Contacto</h2>
                  <p className="text-muted-foreground">
                    Si tienes preguntas sobre estos términos, puedes contactarnos a través de nuestra plataforma.
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

export default TermsOfService;