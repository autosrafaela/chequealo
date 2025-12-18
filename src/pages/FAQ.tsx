import Header from "@/components/Header";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageCircle, HelpCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { SEOHead, generateFAQSchema } from "@/components/SEO/SEOHead";

const FAQ = () => {
  const clientFAQs = [
    {
      question: "¿Cómo funciona Chequealo?",
      answer: "Chequealo conecta clientes con profesionales verificados. Simplemente buscás el servicio que necesitás, contactás al profesional y coordinás directamente con él. Nosotros facilitamos el encuentro inicial."
    },
    {
      question: "¿Los profesionales están verificados?",
      answer: "Sí, todos nuestros profesionales pasan por un proceso de verificación que incluye validación de identidad, documentación profesional y referencias. Solo los profesionales verificados pueden recibir contactos."
    },
    {
      question: "¿Chequealo cobra comisión por los trabajos?",
      answer: "No, Chequealo no cobra comisión sobre los trabajos realizados. Los profesionales pagan una suscripción mensual para estar en la plataforma, pero vos como cliente no pagás nada por usar nuestros servicios."
    },
    {
      question: "¿Puedo cancelar un trabajo después de contactar al profesional?",
      answer: "Sí, podés cancelar en cualquier momento. Sin embargo, te recomendamos comunicarte directamente con el profesional para informarle tu decisión y ser respetuoso con su tiempo."
    },
    {
      question: "¿Qué pasa si no estoy conforme con el trabajo?",
      answer: "Si tenés algún problema con un profesional, podés reportarlo a través de nuestro sistema de reseñas o contactarnos directamente. Investigamos todos los reportes y tomamos las medidas necesarias."
    },
    {
      question: "¿Puedo dejar reseñas?",
      answer: "¡Por supuesto! Las reseñas son fundamentales para mantener la calidad de nuestra plataforma. Podés calificar y comentar sobre tu experiencia después de cada trabajo."
    },
    {
      question: "¿En qué ciudades están disponibles?",
      answer: "Chequealo tiene cobertura en toda Argentina. Tenemos profesionales en las principales ciudades y también en localidades más pequeñas del interior del país."
    },
    {
      question: "¿Cómo puedo contactar a un profesional?",
      answer: "Una vez que encontrás un profesional que te interesa, podés enviarle un mensaje a través de nuestra plataforma. El profesional recibirá tu consulta y se pondrá en contacto contigo."
    }
  ];

  const professionalFAQs = [
    {
      question: "¿Cuánto cuesta estar en Chequealo?",
      answer: "Después de un período de prueba gratuito de 90 días, la suscripción tiene un costo de $19.990 por mes. Este precio incluye acceso completo a la plataforma y todas las funcionalidades."
    },
    {
      question: "¿Cómo funciona el período de prueba?",
      answer: "Al registrarte como profesional, tenés 90 días gratuitos para probar la plataforma. Durante este tiempo podés recibir contactos sin costo alguno."
    },
    {
      question: "¿Qué incluye la suscripción?",
      answer: "La suscripción incluye: perfil profesional completo, recepción ilimitada de contactos, galería de trabajos, sistema de reseñas, notificaciones en tiempo real y soporte técnico."
    },
    {
      question: "¿Puedo pausar mi suscripción?",
      answer: "Sí, podés pausar tu suscripción en cualquier momento desde tu panel de control. Tu perfil quedará inactivo hasta que reactives la suscripción."
    },
    {
      question: "¿Cómo recibo los contactos?",
      answer: "Recibís notificaciones por email y dentro de la plataforma cada vez que un cliente te contacta. También podés configurar notificaciones push en tu celular."
    },
    {
      question: "¿Puedo elegir qué trabajos acepto?",
      answer: "Absolutamente. Vos decidís a qué consultas respondés y qué trabajos aceptás. No hay obligación de responder a todos los contactos."
    },
    {
      question: "¿Cómo me verifico como profesional?",
      answer: "El proceso de verificación incluye subir documentos de identidad, comprobantes de domicilio y certificaciones profesionales. Nuestro equipo revisa la documentación en 24-48 horas."
    },
    {
      question: "¿Puedo cambiar mi información después de registrarme?",
      answer: "Sí, podés actualizar tu perfil, agregar fotos de trabajos, modificar tus servicios y precios en cualquier momento desde tu panel profesional."
    }
  ];

  const faqsForSchema = [...clientFAQs, ...professionalFAQs];
  const faqSchema = generateFAQSchema(faqsForSchema);

  return (
    <>
      <SEOHead 
        title="Preguntas Frecuentes - Chequealo | Centro de Ayuda"
        description="Encontrá respuestas a las preguntas más comunes sobre Chequealo. Información para clientes y profesionales sobre cómo usar la plataforma."
        canonical="/faq"
        structuredData={faqSchema}
      />
      <div className="min-h-screen bg-background">
        <Header />
      
      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-b from-primary/10 to-background">
        <div className="container mx-auto px-4 text-center">
          <HelpCircle className="h-16 w-16 text-primary mx-auto mb-6" />
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Preguntas Frecuentes
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Encontrá respuestas a las consultas más comunes sobre Chequealo
          </p>
        </div>
      </section>

      {/* Client FAQs */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <Card className="mb-12">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Para Clientes</CardTitle>
              <CardDescription>
                Preguntas frecuentes sobre cómo usar Chequealo para encontrar profesionales
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {clientFAQs.map((faq, index) => (
                  <AccordionItem key={index} value={`client-${index}`}>
                    <AccordionTrigger className="text-left">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent>
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Professional FAQs */}
      <section className="py-16 bg-card">
        <div className="container mx-auto px-4">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Para Profesionales</CardTitle>
              <CardDescription>
                Todo lo que necesitás saber sobre trabajar con Chequealo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {professionalFAQs.map((faq, index) => (
                  <AccordionItem key={index} value={`professional-${index}`}>
                    <AccordionTrigger className="text-left">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent>
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-2xl mx-auto">
            <MessageCircle className="h-12 w-12 text-primary mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-foreground mb-4">
              ¿No encontraste lo que buscabas?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Si tenés alguna consulta específica que no está en esta lista, no dudes en contactarnos. 
              Nuestro equipo está disponible para ayudarte.
            </p>
            <div className="space-y-4 sm:space-y-0 sm:flex sm:justify-center sm:space-x-4">
              <Button size="lg" asChild>
                <a href="tel:+5493492607224">
                  📱 +54 9 3492 60-7224
                </a>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/search">
                  Buscar Profesionales
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
    </>
  );
};

export default FAQ;