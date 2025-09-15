import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import Header from "@/components/Header";
import { ProfessionalProfileEdit } from "@/components/ProfessionalProfileEdit";
import { ReviewResponseComponent } from "@/components/ReviewResponseComponent";
import { ContactRequestDialog } from "@/components/ContactRequestDialog";
import { ContactRequestsPanel } from "@/components/ContactRequestsPanel";
import { WhatsAppContactButton } from "@/components/WhatsAppContactButton";
import { TransactionManager } from "@/components/TransactionManager";
import { supabase } from "@/integrations/supabase/client";
import { useProfessionalContact } from "@/hooks/useProfessionalContact";
import { toast } from "sonner";
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
  ThumbsUp,
  Trash2,
  Share2,
  Facebook,
  Twitter,
  Instagram
} from "lucide-react";
import { ProfessionalSEO } from "@/components/SEO/ProfessionalSEO";

const ProfessionalProfile = () => {
  const { id } = useParams();
  const [isFavorite, setIsFavorite] = useState(false);
  const [professional, setProfessional] = useState<any>(null);
  const [services, setServices] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [workPhotos, setWorkPhotos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [contactInfo, setContactInfo] = useState<{ phone: string | null; email: string | null } | null>(null);
  const { getContactInfo, loading: contactLoading } = useProfessionalContact();

  useEffect(() => {
    fetchProfessionalData();
    getCurrentUser();
  }, [id]);

  const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUser(user);
  };

  const fetchProfessionalData = async () => {
    try {
      setLoading(true);

      // Validate route param is a UUID to avoid 400 errors
      const isUUID = (value: string) =>
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);

      if (!id || typeof id !== 'string' || !isUUID(id)) {
        setProfessional(null);
        setServices([]);
        setReviews([]);
        setWorkPhotos([]);
        setIsOwner(false);
        toast.error('URL inválida: ID de profesional no válido');
        return;
      }

      // Fetch professional data from public view first
      const { data: professionalData, error: profError } = await supabase
        .from('professionals_public')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (profError) throw profError;

      if (!professionalData) {
        setProfessional(null);
        return;
      }

      setProfessional(professionalData);

      // Check if current user is the owner
      const { data: { user } } = await supabase.auth.getUser();
      if (user && professionalData.user_id === user.id) {
        setIsOwner(true);
      } else {
        setIsOwner(false);
      }

      // Get contact info if user is authorized
      const contact = await getContactInfo(id);
      setContactInfo(contact);

      // Fetch services
      const { data: servicesData, error: servicesError } = await supabase
        .from('professional_services')
        .select('*')
        .eq('professional_id', id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (servicesError) throw servicesError;
      setServices(servicesData || []);

      // Fetch reviews with responses
      const { data: reviewsData, error: reviewsError } = await supabase
        .from('reviews')
        .select(`
          *,
          review_responses (
            id,
            response,
            created_at
          )
        `)
        .eq('professional_id', id)
        .order('created_at', { ascending: false });

      if (reviewsError) throw reviewsError;
      setReviews(reviewsData || []);

      // Fetch work photos
      const { data: photosData, error: photosError } = await supabase
        .from('work_photos')
        .select('*')
        .eq('professional_id', id)
        .order('created_at', { ascending: false });

      if (photosError) throw photosError;
      setWorkPhotos(photosData || []);

    } catch (error) {
      console.error('Error fetching professional data:', error);
      toast.error('Error al cargar los datos del profesional');
    } finally {
      setLoading(false);
    }
  };

  const deleteService = async (serviceId: string) => {
    try {
      const { error } = await supabase
        .from('professional_services')
        .delete()
        .eq('id', serviceId);

      if (error) throw error;

      toast.success('Servicio eliminado');
      fetchProfessionalData();
    } catch (error) {
      console.error('Error deleting service:', error);
      toast.error('Error al eliminar el servicio');
    }
  };

  const deleteWorkPhoto = async (photoId: string) => {
    try {
      const { error } = await supabase
        .from('work_photos')
        .delete()
        .eq('id', photoId);

      if (error) throw error;

      toast.success('Foto eliminada');
      fetchProfessionalData();
    } catch (error) {
      console.error('Error deleting photo:', error);
      toast.error('Error al eliminar la foto');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Cargando...</div>
        </div>
      </div>
    );
  }

  if (!professional) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Profesional no encontrado</div>
        </div>
      </div>
    );
  }

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

  const handleShare = async () => {
    const shareData = {
      title: `${professional.full_name} - ${professional.profession}`,
      text: `Conoce a ${professional.full_name}, ${professional.profession} en ${professional.location}`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(window.location.href);
        toast.success('Enlace copiado al portapapeles');
      } catch (error) {
        toast.error('No se pudo copiar el enlace');
      }
    }
  };

  const shareToWhatsApp = () => {
    const message = `Conoce a ${professional.full_name}, ${professional.profession} en ${professional.location} - ${window.location.href}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const shareToFacebook = () => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`;
    window.open(facebookUrl, '_blank', 'width=600,height=400');
  };

  const shareToTwitter = () => {
    const text = `Conoce a ${professional.full_name}, ${professional.profession} en ${professional.location}`;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(window.location.href)}`;
    window.open(twitterUrl, '_blank', 'width=600,height=400');
  };

  const shareToInstagram = () => {
    // Instagram doesn't have direct URL sharing, so we copy to clipboard with a message
    navigator.clipboard.writeText(window.location.href);
    toast.success('Enlace copiado. Puedes pegarlo en tu historia de Instagram');
  };

  const formatPrice = (priceFrom: number | null, priceTo: number | null) => {
    if (!priceFrom && !priceTo) return 'Consultar precio';
    if (priceFrom && priceTo) return `$${priceFrom.toLocaleString()} - $${priceTo.toLocaleString()}`;
    if (priceFrom) return `Desde $${priceFrom.toLocaleString()}`;
    if (priceTo) return `Hasta $${priceTo.toLocaleString()}`;
    return 'Consultar precio';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <ProfessionalSEO professional={professional} />
      <Header />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Profile Header */}
        <Card className="mb-8">
          <CardContent className="p-8">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Left Column - Avatar and Basic Info */}
              <div className="flex flex-col items-center lg:items-start">
                <Avatar className="w-32 h-32 mb-4">
                  <AvatarImage src={professional.image_url || undefined} alt={`Foto de ${professional.full_name}`} />
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold text-3xl">
                    {getInitials(professional.full_name) || <User className="h-16 w-16" />}
                  </AvatarFallback>
                </Avatar>

                <div className="text-center lg:text-left">
                  <div className="flex items-center justify-center lg:justify-start gap-2 mb-2">
                    <h1 className="text-3xl font-bold text-foreground">{professional.full_name}</h1>
                    {professional.is_verified && (
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
                          className={`h-5 w-5 ${i < Math.floor(professional.rating || 0) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                        />
                      ))}
                    </div>
                    <span className="text-xl font-bold">{professional.rating || 0}</span>
                    <span className="text-muted-foreground">({professional.review_count || 0} opiniones)</span>
                  </div>

                  {/* Quick Info */}
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2 text-success" />
                      {professional.availability}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Actions and Contact */}
              <div className="flex-1">
                <div className="space-y-4">
                  {/* Owner Controls */}
                  {isOwner && (
                    <div className="space-y-3">
                      <Button asChild className="w-full">
                        <Link to="/dashboard">
                          Ir al Dashboard Profesional
                        </Link>
                      </Button>
                      <ProfessionalProfileEdit
                        professionalData={professional}
                        onUpdate={fetchProfessionalData}
                        isOwner={isOwner}
                      />
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <WhatsAppContactButton 
                      phone={contactInfo?.phone || undefined}
                      professionalName={professional.full_name}
                    />
                    <ContactRequestDialog 
                      professionalId={professional.id}
                      professionalName={professional.full_name}
                      type="quote"
                    />
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={handleToggleFavorite}
                      className={isFavorite ? 'text-red-500 border-red-200' : ''}
                    >
                      <Heart className={`h-5 w-5 ${isFavorite ? 'fill-current' : ''}`} />
                    </Button>
                    
                    {/* Share Dropdown */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="icon"
                          title="Compartir perfil"
                        >
                          <Share2 className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem onClick={shareToWhatsApp} className="cursor-pointer">
                          <MessageCircle className="h-4 w-4 mr-2 text-green-600" />
                          WhatsApp
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={shareToFacebook} className="cursor-pointer">
                          <Facebook className="h-4 w-4 mr-2 text-blue-600" />
                          Facebook
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={shareToTwitter} className="cursor-pointer">
                          <Twitter className="h-4 w-4 mr-2 text-blue-400" />
                          X (Twitter)
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={shareToInstagram} className="cursor-pointer">
                          <Instagram className="h-4 w-4 mr-2 text-pink-600" />
                          Instagram
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handleShare} className="cursor-pointer">
                          <Share2 className="h-4 w-4 mr-2" />
                          Compartir...
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Contact Info */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Información de Contacto</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 mr-3 text-muted-foreground" />
                        <span>{contactInfo?.phone || 'No disponible'}</span>
                      </div>
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 mr-3 text-muted-foreground" />
                        <span>{contactInfo?.email || 'No disponible'}</span>
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
          <TabsList className={`grid w-full ${isOwner ? 'grid-cols-5' : 'grid-cols-4'}`}>
            <TabsTrigger value="about">Sobre mí</TabsTrigger>
            <TabsTrigger value="services">Servicios</TabsTrigger>
            <TabsTrigger value="reviews">Opiniones</TabsTrigger>
            <TabsTrigger value="portfolio">Trabajos</TabsTrigger>
            {isOwner && <TabsTrigger value="transactions">Mis Trabajos</TabsTrigger>}
            {isOwner && <TabsTrigger value="requests">Solicitudes</TabsTrigger>}
          </TabsList>

          {/* About Tab */}
          <TabsContent value="about">
            <Card>
              <CardHeader>
                <CardTitle>Descripción Profesional</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  {professional.description || 'No hay descripción disponible.'}
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
                {services.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {services.map((service) => (
                      <div key={service.id} className="p-4 bg-gray-50 rounded-lg border">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-medium">{service.service_name}</h3>
                          {isOwner && (
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => deleteService(service.id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                        {service.description && (
                          <p className="text-sm text-muted-foreground mb-2">{service.description}</p>
                        )}
                        <p className="text-sm font-medium text-primary">
                          {formatPrice(service.price_from, service.price_to)}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No hay servicios disponibles.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reviews Tab */}
          <TabsContent value="reviews">
            <div className="space-y-6">
              {reviews.length > 0 ? (
                reviews.map((review) => (
                  <Card key={review.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <Avatar className="w-10 h-10">
                            <AvatarFallback className="bg-primary/10 text-primary text-sm">
                              U
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h4 className="font-medium">Usuario #{review.id}</h4>
                            <p className="text-sm text-muted-foreground">
                              {new Date(review.created_at).toLocaleDateString()}
                            </p>
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
                      
                      {review.comment && (
                        <p className="text-muted-foreground mb-4">{review.comment}</p>
                      )}
                      
                      {/* Show existing response or allow professional to respond */}
                      {review.review_responses && review.review_responses.length > 0 ? (
                        <ReviewResponseComponent
                          reviewId={review.id}
                          professionalId={professional.id}
                          onResponseAdded={fetchProfessionalData}
                          existingResponse={review.review_responses[0].response}
                          isOwner={isOwner}
                        />
                      ) : (
                        <ReviewResponseComponent
                          reviewId={review.id}
                          professionalId={professional.id}
                          onResponseAdded={fetchProfessionalData}
                          isOwner={isOwner}
                        />
                      )}
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card>
                  <CardContent className="p-6 text-center">
                    <p className="text-muted-foreground">Aún no hay opiniones para este profesional.</p>
                  </CardContent>
                </Card>
              )}
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
                {workPhotos.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {workPhotos.map((photo) => (
                      <div key={photo.id} className="space-y-2">
                        <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
                          <img 
                            src={photo.image_url || '/placeholder.svg'} 
                            alt={photo.caption}
                            className="w-full h-full object-cover"
                          />
                          {isOwner && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteWorkPhoto(photo.id)}
                              className="absolute top-2 right-2 bg-white/80 hover:bg-white text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{photo.caption}</p>
                          {photo.work_type && (
                            <p className="text-xs text-muted-foreground">{photo.work_type}</p>
                          )}
                          <p className="text-xs text-muted-foreground">
                            {photo.uploaded_by === 'professional' ? 'Subido por el profesional' : 'Subido por cliente'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">
                    No hay fotos de trabajos disponibles.
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Transactions Tab - Only for owners */}
          {isOwner && (
            <TabsContent value="transactions">
              <TransactionManager />
            </TabsContent>
          )}

          {/* Requests Tab - Only for owners */}
          {isOwner && (
            <TabsContent value="requests">
              <ContactRequestsPanel />
            </TabsContent>
          )}
        </Tabs>

        {/* Back Button */}
        <div className="mt-12 text-center">
          <Button 
            variant="outline" 
            size="lg"
            onClick={() => window.history.back()}
            className="px-8 py-3"
          >
            ← Volver
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProfessionalProfile;