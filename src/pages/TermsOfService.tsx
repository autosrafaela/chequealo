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
                <div className="mb-6">
                  <p className="text-muted-foreground mb-4">
                    <strong>Última actualización:</strong> 12 de septiembre de 2025
                  </p>
                  <p className="text-muted-foreground">
                    Bienvenido/a a CHEQUEALO.AR (el "Sitio" y/o la "Plataforma"), operado por [Razón Social], CUIT [CUIT], con domicilio en [Domicilio legal] ("CHEQUEALO.AR", "nosotros" o "nuestro"). Estos Términos y Condiciones (los "Términos") regulan el acceso y uso del Sitio, de nuestras aplicaciones asociadas y de los servicios que ofrecemos (los "Servicios"). Al registrarte, acceder o utilizar la Plataforma aceptas estos Términos y nuestra Política de Privacidad.
                  </p>
                  <p className="text-muted-foreground mt-2">
                    Si no estás de acuerdo, no utilices la Plataforma.
                  </p>
                </div>

                <section>
                  <h2 className="text-xl font-semibold mb-3">1) Objeto del servicio</h2>
                  <p className="text-muted-foreground">
                    CHEQUEALO.AR es un directorio y canal de contacto que conecta usuarios que buscan servicios ("Usuarios") con profesionales y comercios que los ofrecen ("Profesionales"). CHEQUEALO.AR no presta servicios profesionales, no participa en la relación contractual entre Usuarios y Profesionales, ni garantiza resultados, precios, plazos, títulos, habilitaciones o calidad.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold mb-3">2) Cuentas y veracidad de la información</h2>
                  <p className="text-muted-foreground mb-2">
                    Para usar funciones específicas (publicar, chatear, reseñar, etc.) debes crear una Cuenta con datos verdaderos, exactos y actualizados. Sos responsable de la confidencialidad de tus credenciales y de toda actividad realizada desde tu Cuenta.
                  </p>
                  <p className="text-muted-foreground">
                    Podemos suspender o cancelar Cuentas por: uso indebido, fraude, incumplimientos, indicios de manipulación de reseñas, suplantación de identidad o violación de estos Términos.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold mb-3">3) Registro y perfiles de Profesionales</h2>
                  <p className="text-muted-foreground">
                    Los Profesionales pueden crear perfiles con información comercial, servicios, precios, ubicación, fotos, etc. Toda información debe ser veraz y actualizada. CHEQUEALO.AR puede verificar datos y solicitar documentación. Los perfiles pueden ser editados o eliminados por incumplimientos.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold mb-3">4) Comunicación y contacto</h2>
                  <p className="text-muted-foreground">
                    CHEQUEALO.AR facilita el contacto inicial entre Usuarios y Profesionales. Una vez establecido el contacto, las partes negocian directamente términos, precios y condiciones. CHEQUEALO.AR no interviene en estas negociaciones ni en los contratos resultantes.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold mb-3">5) Reseñas y calificaciones</h2>
                  <p className="text-muted-foreground">
                    Los Usuarios pueden dejar reseñas y calificaciones sobre servicios recibidos. Las reseñas deben ser honestas, basadas en experiencias reales y respetuosas. Prohibimos reseñas falsas, manipuladas o maliciosas. Nos reservamos el derecho de moderar, editar o eliminar contenido inapropiado.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold mb-3">6) Pagos y facturación</h2>
                  <p className="text-muted-foreground">
                    Algunos servicios de CHEQUEALO.AR pueden tener costo (planes premium, publicidad destacada, etc.). Los pagos se procesan a través de plataformas seguras. Los precios pueden cambiar con previo aviso. No hay reembolsos salvo en casos específicos determinados por CHEQUEALO.AR.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold mb-3">7) Propiedad intelectual</h2>
                  <p className="text-muted-foreground">
                    El contenido de CHEQUEALO.AR (diseño, logotipos, textos, código, etc.) está protegido por derechos de autor y marcas. Los usuarios otorgan a CHEQUEALO.AR licencia para usar el contenido que publican en la plataforma para los fines del servicio.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold mb-3">8) Prohibiciones y uso aceptable</h2>
                  <p className="text-muted-foreground">
                    Está prohibido: usar la plataforma para actividades ilegales, enviar spam, suplantar identidades, manipular reseñas, extraer datos masivamente, interferir en el funcionamiento del sitio, o violar derechos de terceros.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold mb-3">9) Responsabilidad de CHEQUEALO.AR</h2>
                  <p className="text-muted-foreground">
                    CHEQUEALO.AR actúa como intermediario tecnológico. No garantizamos la calidad, veracidad o disponibilidad de los servicios ofrecidos por Profesionales. No somos responsables por daños directos o indirectos derivados del uso de la plataforma o de servicios contratados a través de ella.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold mb-3">10) Responsabilidad de los usuarios</h2>
                  <p className="text-muted-foreground">
                    Los usuarios son responsables de: proporcionar información veraz, cumplir las leyes aplicables, respetar los derechos de terceros, y usar la plataforma de buena fe. Los Profesionales son responsables de la calidad y legalidad de sus servicios.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold mb-3">11) Suspensión y terminación</h2>
                  <p className="text-muted-foreground">
                    Podemos suspender o terminar cuentas por violación de estos Términos, actividad fraudulenta, o por razones de seguridad. Los usuarios pueden cerrar sus cuentas en cualquier momento desde la configuración de su perfil.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold mb-3">12) Privacidad y protección de datos</h2>
                  <p className="text-muted-foreground">
                    El tratamiento de datos personales se rige por nuestra Política de Privacidad, que forma parte integral de estos Términos. Cumplimos con la Ley de Protección de Datos Personales y normativas aplicables.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold mb-3">13) Modificaciones a los Términos</h2>
                  <p className="text-muted-foreground">
                    Podemos modificar estos Términos en cualquier momento. Los cambios se notificarán a través de la plataforma o por email. El uso continuado después de las modificaciones constituye aceptación de los nuevos términos.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold mb-3">14) Resolución de disputas</h2>
                  <p className="text-muted-foreground">
                    Las disputas entre usuarios deben resolverse directamente entre las partes. CHEQUEALO.AR puede facilitar la comunicación pero no actúa como mediador oficial. Para disputas con CHEQUEALO.AR, se aplicará la legislación argentina y serán competentes los tribunales de la Ciudad Autónoma de Buenos Aires.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold mb-3">15) Fuerza mayor</h2>
                  <p className="text-muted-foreground">
                    CHEQUEALO.AR no será responsable por incumplimientos causados por eventos de fuerza mayor, incluyendo pero no limitado a: desastres naturales, cortes de energía, fallas de internet, actos de gobierno, o pandemias.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold mb-3">16) Severabilidad</h2>
                  <p className="text-muted-foreground">
                    Si alguna disposición de estos Términos es declarada inválida o inaplicable, las demás disposiciones mantendrán su plena vigencia y efecto.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold mb-3">17) Ley aplicable y jurisdicción</h2>
                  <p className="text-muted-foreground">
                    Estos Términos se rigen por las leyes de la República Argentina. Cualquier disputa será resuelta por los tribunales competentes de la Ciudad Autónoma de Buenos Aires.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold mb-3">18) Contacto</h2>
                  <p className="text-muted-foreground">
                    Para consultas sobre estos Términos, puedes contactarnos a través de los canales disponibles en la plataforma o al email de soporte oficial.
                  </p>
                </section>

                <div className="border-t pt-4 mt-8">
                  <p className="text-xs text-muted-foreground">
                    Términos y Condiciones de Uso - CHEQUEALO.AR
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Última actualización: 12 de septiembre de 2025
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