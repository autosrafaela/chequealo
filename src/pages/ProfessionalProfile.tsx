import { useState } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from "@/components/Header";
import { 
  Star, 
  MapPin, 
  Heart, 
  MessageCircle, 
  Clock, 
  User, 
  Shield,
  Phone,
  Mail,
  Calendar,
  Camera,
  Award,
  ThumbsUp
} from "lucide-react";

const ProfessionalProfile = () => {
  const { id } = useParams();
  const [isFavorite, setIsFavorite] = useState(false);

  // Mock data - en producción vendría de la base de datos
  const professional = {
    id: "1",
    name: "Ana Rodríguez",
    profession: "Contadora Pública",
    location: "Rafaela, Santa Fe",
    rating: 4.8,
    reviewCount: 15,
    description: "Contadora Pública con más de 10 años de experiencia en el área. Me especializo en balances, liquidación de impuestos, asesoría contable para empresas y particulares. Trabajo con seriedad, responsabilidad y siempre cumpliendo los plazos acordados. Ofrezco atención personalizada y estoy disponible para consultas durante horario laboral.",
    verified: true,
    availability: "Disponible hoy",
    image: null,
    phone: "+54 3492 123456",
    email: "ana.rodriguez@email.com",
    experienceYears: 10,
    services: [
      "Balances contables",
      "Liquidación de impuestos",
      "Asesoría fiscal",
      "Declaraciones juradas",
      "Consultoría empresarial"
    ],
    workingHours: "Lunes a Viernes 9:00 - 18:00",
    responseTime: "Responde en 2 horas"
  };

  const reviews = [
    {
      id: 1,
      userName: "Carlos Mendez",
      rating: 5,
      comment: "Excelente profesional, muy responsable y cumple con los tiempos. Recomendada 100%.",
      date: "15 de Noviembre 2024",
      helpful: 8
    },
    {
      id: 2,
      userName: "María García",
      rating: 5,
      comment: "Ana me ayudó with mi declaración de impuestos de forma muy profesional. Muy clara en sus explicaciones.",
      date: "10 de Noviembre 2024",
      helpful: 5
    },
    {
      id: 3,
      userName: "Roberto Silva", 
      rating: 4,
      comment: "Buen servicio, aunque tardó un poco más de lo esperado. Pero el resultado final fue muy bueno.",
      date: "5 de Noviembre 2024",
      helpful: 3
    }
  ];

  const workPhotos = [
    {
      id: 1,
      url: "/placeholder.svg",
      caption: "Balance anual empresa comercial",
      uploadedBy: "professional"
    },
    {
      id: 2,
      url: "/placeholder.svg", 
      caption: "Liquidación monotributo",
      uploadedBy: "client"
    },
    {
      id: 3,
      url: "/placeholder.svg",
      caption: "Asesoría fiscal empresas",
      uploadedBy: "professional"
    },
    {
      id: 4,
      url: "/placeholder.svg",
      caption: "Documentación organizada",
      uploadedBy: "client"
    }
  ];

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleToggleFavorite = () => {
    setIsFavorite(!isFavorite);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Profile Header */}
        <Card className="mb-8">
          <CardContent className="p-8">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Left Column - Avatar and Basic Info */}
              <div className="flex flex-col items-center lg:items-start">
                <Avatar className="w-32 h-32 mb-4">
                  <AvatarImage src={professional.image || undefined} alt={`Foto de ${professional.name}`} />
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold text-3xl">
                    {getInitials(professional.name) || <User className="h-16 w-16" />}
                  </AvatarFallback>
                </Avatar>

                <div className="text-center lg:text-left">
                  <div className="flex items-center justify-center lg:justify-start gap-2 mb-2">
                    <h1 className="text-3xl font-bold text-foreground">{professional.name}</h1>
                    {professional.verified && (
                      <Badge className="bg-emerald-500 text-white">
                        <Shield className="h-3 w-3 mr-1" />
                        Verificado
                      </Badge>
                    )}
                  </div>
                  
                  <p className="text-xl text-primary font-medium mb-2">{professional.profession}</p>
                  
                  <div className="flex items-center justify-center lg:justify-start text-muted-foreground mb-4">
                    <MapPin className="h-4 w-4 mr-1" />
                    {professional.location}
                  </div>

                  {/* Rating */}
                  <div className="flex items-center justify-center lg:justify-start space-x-2 mb-4">
                    <div className="flex items-center space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`h-5 w-5 ${i < Math.floor(professional.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                        />
                      ))}
                    </div>
                    <span className="text-xl font-bold">{professional.rating}</span>
                    <span className="text-muted-foreground">({professional.reviewCount} opiniones)</span>
                  </div>

                  {/* Quick Info */}
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center">
                      <Award className="h-4 w-4 mr-2" />
                      {professional.experienceYears} años de experiencia
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2 text-success" />
                      {professional.availability}
                    </div>
                    <div className="flex items-center">
                      <MessageCircle className="h-4 w-4 mr-2" />
                      {professional.responseTime}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Actions and Contact */}
              <div className="flex-1">
                <div className="space-y-4">
                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button className="flex-1 bg-primary hover:bg-primary/90">
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Contactar Ahora
                    </Button>
                    <Button variant="outline" className="flex-1">
                      <Calendar className="h-4 w-4 mr-2" />
                      Pedir Presupuesto
                    </Button>
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={handleToggleFavorite}
                      className={isFavorite ? 'text-red-500 border-red-200' : ''}
                    >
                      <Heart className={`h-5 w-5 ${isFavorite ? 'fill-current' : ''}`} />
                    </Button>
                  </div>

                  {/* Contact Info */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Información de Contacto</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 mr-3 text-muted-foreground" />
                        <span>{professional.phone}</span>
                      </div>
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 mr-3 text-muted-foreground" />
                        <span>{professional.email}</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-3 text-muted-foreground" />
                        <span>{professional.workingHours}</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs Section */}
        <Tabs defaultValue="about" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="about">Sobre mí</TabsTrigger>
            <TabsTrigger value="services">Servicios</TabsTrigger>
            <TabsTrigger value="reviews">Opiniones</TabsTrigger>
            <TabsTrigger value="portfolio">Trabajos</TabsTrigger>
          </TabsList>

          {/* About Tab */}
          <TabsContent value="about">
            <Card>
              <CardHeader>
                <CardTitle>Descripción Profesional</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  {professional.description}
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Services Tab */}
          <TabsContent value="services">
            <Card>
              <CardHeader>
                <CardTitle>Servicios Ofrecidos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {professional.services.map((service, index) => (
                    <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
                      <Award className="h-4 w-4 mr-3 text-primary" />
                      <span>{service}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reviews Tab */}
          <TabsContent value="reviews">
            <div className="space-y-6">
              {reviews.map((review) => (
                <Card key={review.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <Avatar className="w-10 h-10">
                          <AvatarFallback className="bg-primary/10 text-primary text-sm">
                            {getInitials(review.userName)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-medium">{review.userName}</h4>
                          <p className="text-sm text-muted-foreground">{review.date}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`h-4 w-4 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                          />
                        ))}
                      </div>
                    </div>
                    
                    <p className="text-muted-foreground mb-4">{review.comment}</p>
                    
                    <div className="flex items-center justify-between">
                      <Button variant="ghost" size="sm" className="text-muted-foreground">
                        <ThumbsUp className="h-4 w-4 mr-1" />
                        Útil ({review.helpful})
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Portfolio Tab */}
          <TabsContent value="portfolio">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Camera className="h-5 w-5 mr-2" />
                  Fotos de Trabajos Realizados
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {workPhotos.map((photo) => (
                    <div key={photo.id} className="space-y-2">
                      <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                        <img 
                          src={photo.url} 
                          alt={photo.caption}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{photo.caption}</p>
                        <p className="text-xs text-muted-foreground">
                          {photo.uploadedBy === 'professional' ? 'Subido por el profesional' : 'Subido por cliente'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ProfessionalProfile;