import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ProfessionalProfileEdit } from "@/components/ProfessionalProfileEdit";
import { ReviewResponseComponent } from "@/components/ReviewResponseComponent";
import { ContactRequestDialog } from "@/components/ContactRequestDialog";
import { ExpressQuoteButton } from "@/components/ExpressQuoteButton";
import { ContactRequestsPanel } from "@/components/ContactRequestsPanel";
import { WhatsAppContactButton } from "@/components/WhatsAppContactButton";
import { TransactionManager } from "@/components/TransactionManager";
import { ComboCard } from "@/components/ComboCard";
import { PublicAgendaGrid } from "@/components/PublicAgendaGrid";
import { ProfileShareCard } from "@/components/ProfileShareCard";
import { BookingModal } from "@/components/BookingModal";
import { useCombos } from "@/hooks/useCombos";
import { useProfessionalProfile } from "@/hooks/useProfessionalProfile";
import { supabase } from "@/integrations/supabase/client";
import { useProfessionalContact } from "@/hooks/useProfessionalContact";
import { useChat } from "@/hooks/useChat";
import { toast } from "sonner";
import { 
  ArrowLeft,
  Share2, 
  Phone, 
  MessageCircle, 
  Calendar,
  User, 
  Camera,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Facebook,
  Instagram,
  Mail,
  Star,
  Send,
  Briefcase,
  X
} from "lucide-react";
import { ProfessionalSEO } from "@/components/SEO/ProfessionalSEO";
import { getProfessionalShareUrl } from "@/utils/utmHelpers";
import { generateAutoSlug } from "@/utils/autoSlug";
import {
  ProfileHeroSection,
  ProfileQuickAction,
  ProfileReviewCard,
  ProfileLocationCard
} from "@/components/profile";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const ProfessionalProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isFavorite, setIsFavorite] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [contactInfo, setContactInfo] = useState<{ phone: string | null; email: string | null } | null>(null);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [showAllServices, setShowAllServices] = useState(false);
  const [expandedServiceId, setExpandedServiceId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("about");
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);
  const [isZoomed, setIsZoomed] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [scrollStart, setScrollStart] = useState({ x: 0, y: 0 });
  const [hasDragged, setHasDragged] = useState(false);
  const zoomContainerRef = useRef<HTMLDivElement>(null);
  const [showContactDialog, setShowContactDialog] = useState(false);
  const [showExpressQuote, setShowExpressQuote] = useState(false);
  const { getContactInfo, loading: contactLoading } = useProfessionalContact();
  const { combos } = useCombos(id);
  const { createConversation } = useChat();
  
  const { 
    professional, 
    services, 
    reviews, 
    workPhotos, 
    isLoading: loading,
    isValidId,
    refetchReviews 
  } = useProfessionalProfile(id);

  useEffect(() => {
    getCurrentUser();
  }, [id]);

  useEffect(() => {
    if (professional && currentUser) {
      const owner = !!(currentUser && professional.user_id && currentUser.id === professional.user_id);
      setIsOwner(owner);
      setContactInfo({
        phone: professional.phone || null,
        email: professional.email || null
      });
      
      const professionalWithSlug = professional as typeof professional & { slug?: string | null };
      if (professionalWithSlug.slug) {
        // Slug personalizado: usar directamente
        if (!window.location.pathname.includes(`/${professionalWithSlug.slug}`)) {
          window.history.replaceState(null, '', `/${professionalWithSlug.slug}`);
        }
      } else {
        // Sin slug personalizado: generar auto-slug SEO con profesión-nombre-ciudad
        const autoSlug = generateAutoSlug(
          professional.profession,
          professional.full_name,
          professional.location
        );
        if (autoSlug && !window.location.pathname.includes(`/${autoSlug}`)) {
          window.history.replaceState(null, '', `/${autoSlug}`);
        }
      }
    }
  }, [professional, currentUser]);

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (selectedPhotoIndex === null) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' && selectedPhotoIndex < workPhotos.length - 1) {
        setSelectedPhotoIndex(selectedPhotoIndex + 1);
        setIsZoomed(false);
      } else if (e.key === 'ArrowLeft' && selectedPhotoIndex > 0) {
        setSelectedPhotoIndex(selectedPhotoIndex - 1);
        setIsZoomed(false);
      } else if (e.key === 'Escape') {
        setSelectedPhotoIndex(null);
        setIsZoomed(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedPhotoIndex, workPhotos.length]);

  const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUser(user);
  };

  const fetchProfessionalData = async () => {
    if (id) {
      queryClient.invalidateQueries({ queryKey: ['professional', id] });
      queryClient.invalidateQueries({ queryKey: ['professional-services', id] });
      queryClient.invalidateQueries({ queryKey: ['professional-reviews', id] });
      queryClient.invalidateQueries({ queryKey: ['professional-photos', id] });
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
      queryClient.invalidateQueries({ queryKey: ['professional-services', id] });
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
      queryClient.invalidateQueries({ queryKey: ['professional-photos', id] });
    } catch (error) {
      console.error('Error deleting photo:', error);
      toast.error('Error al eliminar la foto');
    }
  };

  const handleShare = async () => {
    const shareUrl = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${professional?.full_name} - ${professional?.profession}`,
          text: `Conoce a ${professional?.full_name}, ${professional?.profession}`,
          url: shareUrl,
        });
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          await navigator.clipboard.writeText(shareUrl);
          toast.success('Enlace copiado al portapapeles');
        }
      }
    } else {
      await navigator.clipboard.writeText(shareUrl);
      toast.success('Enlace copiado al portapapeles');
    }
  };

  const shareToWhatsApp = () => {
    const professionalWithSlug = professional as typeof professional & { slug?: string | null };
    const shareUrl = getProfessionalShareUrl(id!, 'wa', 'share', {
      slug: professionalWithSlug.slug,
      profession: professional.profession,
      fullName: professional.full_name,
      location: professional.location,
    });
    const message = `🔍 *${professional?.full_name}* - ${professional?.profession}\n📍 ${professional?.location}\n⭐ Rating: ${professional?.rating || 'N/A'}/5\n\nMira su perfil: ${shareUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
  };

  const shareToFacebook = () => {
    const professionalWithSlug = professional as typeof professional & { slug?: string | null };
    const shareUrl = getProfessionalShareUrl(id!, 'fb', 'share', {
      slug: professionalWithSlug.slug,
      profession: professional.profession,
      fullName: professional.full_name,
      location: professional.location,
    });
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank');
  };

  const shareToTelegram = () => {
    const professionalWithSlug = professional as typeof professional & { slug?: string | null };
    const shareUrl = getProfessionalShareUrl(id!, 'wa', 'share', {
      slug: professionalWithSlug.slug,
      profession: professional.profession,
      fullName: professional.full_name,
      location: professional.location,
    });
    const text = `¡Mirá el perfil de ${professional?.full_name}! ${professional?.profession} en Chequealo`;
    window.open(`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(text)}`, '_blank');
  };

  const openShareModal = () => {
    const trigger = document.getElementById('share-modal-trigger');
    if (trigger) trigger.click();
  };

  const shareToEmail = () => {
    const professionalWithSlug = professional as typeof professional & { slug?: string | null };
    const shareUrl = getProfessionalShareUrl(id!, 'email', 'share', {
      slug: professionalWithSlug.slug,
      profession: professional.profession,
      fullName: professional.full_name,
      location: professional.location,
    });
    const subject = `Conoce a ${professional?.full_name} - ${professional?.profession}`;
    const body = `Hola,\n\nTe recomiendo a ${professional?.full_name}.\n\nVer perfil: ${shareUrl}`;
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const handleCall = () => {
    if (contactInfo?.phone) {
      window.location.href = `tel:${contactInfo.phone}`;
    } else {
      toast.error('Teléfono no disponible');
    }
  };

  const handleWhatsApp = () => {
    const phone = contactInfo?.phone?.replace(/[^0-9]/g, '');
    if (phone) {
      const message = `Hola ${professional?.full_name}, vi tu perfil en Chequealo y me gustaría contactarte.`;
      window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
    } else {
      toast.error('WhatsApp no disponible');
    }
  };

  const handleReserve = () => {
    setIsBookingModalOpen(true);
  };

  const handleInternalMessage = () => {
    if (!currentUser) {
      toast.error('Debes iniciar sesión para enviar mensajes');
      navigate('/login');
      return;
    }
    
    if (isOwner) {
      toast.info('No puedes enviarte mensajes a ti mismo');
      return;
    }
    
    navigate(`/mensajes?chat=${id}`);
  };

  // Loading and error states
  if (!isValidId) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center text-destructive">URL inválida</div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="animate-pulse p-4 space-y-4">
          <div className="h-12 bg-muted rounded-lg" />
          <div className="h-48 bg-muted rounded-2xl" />
          <div className="h-24 bg-muted rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!professional) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center text-muted-foreground">Profesional no encontrado</div>
      </div>
    );
  }

  const displayedServices = showAllServices ? services : services.slice(0, 3);
  const hasMoreServices = services.length > 3;
  const displayedReviews = reviews.slice(0, 2);
  const shouldTruncateDescription = (professional.description?.length || 0) > 150;
  const displayDescription = isDescriptionExpanded || !shouldTruncateDescription
    ? professional.description
    : `${professional.description?.substring(0, 150)}...`;

  return (
    <div className="min-h-screen bg-gray-50/50 pb-28">
      <ProfessionalSEO professional={professional} />
      
      {/* ===== 1. TOP APP BAR (Sticky) ===== */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="flex items-center justify-between px-4 h-14">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => window.history.length > 1 ? navigate(-1) : navigate('/')}
            className="hover:bg-muted"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          
          <h2 className="font-semibold text-foreground text-base">
            Perfil del Profesional
          </h2>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="hover:bg-muted">
                <Share2 className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={shareToWhatsApp}>
                <MessageCircle className="h-4 w-4 mr-2 text-green-600" />
                WhatsApp
              </DropdownMenuItem>
              <DropdownMenuItem onClick={shareToFacebook}>
                <Facebook className="h-4 w-4 mr-2 text-blue-600" />
                Facebook
              </DropdownMenuItem>
              <DropdownMenuItem onClick={shareToTelegram}>
                <Send className="h-4 w-4 mr-2 text-[#0088cc]" />
                Telegram
              </DropdownMenuItem>
              <DropdownMenuItem onClick={openShareModal}>
                <Instagram className="h-4 w-4 mr-2 text-pink-500" />
                Instagram (tarjeta)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={shareToEmail}>
                <Mail className="h-4 w-4 mr-2" />
                Email
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={openShareModal}>
                <Share2 className="h-4 w-4 mr-2" />
                Más opciones...
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* ===== SCROLLABLE CONTENT ===== */}
      <main className="px-4 py-2 space-y-6 max-w-2xl mx-auto">
        
        {/* ===== 2. HERO SECTION ===== */}
        <ProfileHeroSection professional={professional} />

        {/* ===== 3. CTAs - WhatsApp + Solicitar Presupuesto ===== */}
        <div className="flex gap-3">
          <Button 
            className="flex-1 h-12 text-base font-bold rounded-full bg-green-600 hover:bg-green-700 text-white shadow-md"
            onClick={handleWhatsApp}
          >
            <MessageCircle className="w-5 h-5 mr-2" />
            WhatsApp
          </Button>
          <Button 
            className="flex-1 h-12 text-base font-bold rounded-full shadow-md"
            onClick={() => setShowContactDialog(true)}
          >
            <Send className="w-5 h-5 mr-2" />
            Solicitar Presupuesto
          </Button>
        </div>
        {professional.is_verified && (
          <p className="text-center text-xs text-muted-foreground">
            <button onClick={() => setShowExpressQuote(true)} className="text-amber-600 font-semibold hover:underline">
              ⚡ Presupuesto Express disponible
            </button>
          </p>
        )}
        
        {/* Express Quote Dialog (controlled) */}
        <ExpressQuoteButton
          professionalId={professional.id}
          professionalName={professional.full_name}
          isVerified={professional.is_verified}
          open={showExpressQuote}
          onOpenChange={setShowExpressQuote}
          hideTrigger
        />

        {/* ===== Owner Controls ===== */}
        {isOwner && (
          <Card className="rounded-2xl border-primary/20 bg-primary/5">
            <CardContent className="p-4 space-y-3">
              <p className="text-sm font-medium text-primary">Panel de propietario</p>
              <div className="flex flex-col gap-2">
                <Button asChild className="w-full">
                  <Link to="/dashboard">Ir al Dashboard</Link>
                </Button>
                <ProfessionalProfileEdit
                  professionalData={professional}
                  onUpdate={fetchProfessionalData}
                  isOwner={isOwner}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* ===== 4. SOBRE MÍ ===== */}
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <h3 className="flex items-center gap-2 text-lg font-bold text-foreground mb-2">
            <User className="w-5 h-5 text-primary" />
            Sobre mí
          </h3>
          <p className="text-muted-foreground text-sm leading-relaxed">
            {displayDescription || 'No hay descripción disponible.'}
          </p>
          {shouldTruncateDescription && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
              className="mt-2 text-primary hover:text-primary/80 p-0 h-auto font-semibold"
            >
              {isDescriptionExpanded ? (
                <>Ver menos <ChevronUp className="w-4 h-4 ml-1" /></>
              ) : (
                <>Leer más <ChevronDown className="w-4 h-4 ml-1" /></>
              )}
            </Button>
          )}
        </div>

        {/* ===== 5. SERVICIOS ===== */}
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="flex items-center gap-2 text-lg font-bold text-foreground">
              <Briefcase className="w-5 h-5 text-primary" />
              Servicios
            </h3>
            {hasMoreServices && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAllServices(!showAllServices)}
                className="text-primary text-sm font-semibold"
              >
                {showAllServices ? 'Ver menos' : `Ver todos (${services.length})`}
              </Button>
            )}
          </div>
          {services.length > 0 ? (
            displayedServices.map((service) => (
              <div 
                key={service.id} 
                className={`py-3 border-b border-border/30 last:border-b-0 ${service.description ? 'cursor-pointer' : ''}`}
                onClick={() => service.description && setExpandedServiceId(
                  expandedServiceId === service.id ? null : service.id
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="p-2 bg-primary/10 rounded-full shrink-0">
                      <Briefcase className="w-4 h-4 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-foreground truncate">{service.service_name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 ml-4 shrink-0">
                    {service.price_from || service.price_to ? (
                      <span className="text-primary font-bold text-sm whitespace-nowrap">
                        {service.price_from && service.price_to
                          ? `$${service.price_from.toLocaleString()} - $${service.price_to.toLocaleString()}`
                          : service.price_from
                            ? `Desde $${service.price_from.toLocaleString()}`
                            : `Hasta $${service.price_to!.toLocaleString()}`}
                      </span>
                    ) : (
                      <span
                        className="text-primary font-bold text-sm whitespace-nowrap underline cursor-pointer hover:text-primary/80 transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          const phone = contactInfo?.phone?.replace(/[^0-9]/g, '');
                          if (!phone) {
                            toast.error('Este profesional no tiene WhatsApp disponible');
                            return;
                          }
                          let wp = phone;
                          if (!phone.startsWith('54')) {
                            wp = phone.length === 10 ? `54${phone}` : phone.length <= 8 ? `5411${phone}` : `54${phone}`;
                          }
                          const msg = encodeURIComponent(`Hola ${professional?.full_name}, vi tu servicio "${service.service_name}" en Chequealo y me gustaría consultar el precio.`);
                          window.open(`https://wa.me/${wp}?text=${msg}`, '_blank');
                        }}
                      >
                        Consultar
                      </span>
                    )}
                    {isOwner && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => { e.stopPropagation(); deleteService(service.id); }}
                        className="h-8 w-8 text-destructive hover:text-destructive/80 hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
                {service.description && (
                  <p className={`text-xs text-muted-foreground mt-1 ml-11 transition-all ${
                    expandedServiceId === service.id ? '' : 'line-clamp-2'
                  }`}>
                    {service.description}
                  </p>
                )}
                {service.description && expandedServiceId !== service.id && (
                  <span className="text-xs text-primary ml-11 font-medium">ver más</span>
                )}
              </div>
            ))
          ) : (
            <p className="text-muted-foreground text-sm text-center py-4">
              No hay servicios disponibles.
            </p>
          )}
        </div>

        {/* ===== Combos Section ===== */}
        {combos.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm p-4">
            <h3 className="flex items-center gap-2 text-lg font-bold text-foreground mb-1">
              🔥 Combos Especiales
            </h3>
            <p className="text-sm text-muted-foreground mb-3">
              Paquetes con precios especiales
            </p>
            <div className="space-y-3">
              {combos.map((combo) => (
                <ComboCard 
                  key={combo.id} 
                  combo={combo} 
                  professionalName={professional.full_name} 
                />
              ))}
            </div>
          </div>
        )}

        {/* ===== 6. UBICACIÓN Y HORARIOS ===== */}
        <ProfileLocationCard 
          location={professional.location}
          availability={professional.availability}
        />

        {/* ===== 7. RESEÑAS ===== */}
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="flex items-center gap-2 text-lg font-bold text-foreground">
              <Star className="w-5 h-5 text-primary" />
              Reseñas
            </h3>
            <div className="flex items-center gap-1 bg-amber-50 px-3 py-1 rounded-full">
              <Star className="w-4 h-4 text-amber-400 fill-current" />
              <span className="font-bold text-foreground">
                {(professional.rating || 0).toFixed(1)}
              </span>
            </div>
          </div>
          {reviews.length > 0 ? (
            <div className="space-y-3">
              {displayedReviews.map((review) => (
                <ProfileReviewCard key={review.id} review={review as any} />
              ))}
              {reviews.length > 2 && (
                <Button
                  variant="outline"
                  className="w-full rounded-xl"
                  onClick={() => setActiveTab("reviews")}
                >
                  Ver las {professional.review_count || reviews.length} reseñas
                </Button>
              )}
            </div>
          ) : (
            /* Pioneros empty state */
            <div className="bg-amber-50/50 rounded-2xl p-6 text-center">
              <div className="flex justify-center gap-1 mb-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="w-6 h-6 text-amber-400 fill-current" />
                ))}
              </div>
              <p className="text-base font-medium text-foreground">
                ¡{professional.full_name.split(' ')[0]} es nuevo en el Programa Pioneros!
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Dejá tu reseña y ganá descuentos
              </p>
            </div>
          )}
        </div>

        {/* ===== Portfolio Preview with Lightbox ===== */}
        {workPhotos.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm p-4">
            <h3 className="flex items-center gap-2 text-lg font-bold text-foreground mb-3">
              <Camera className="w-5 h-5 text-primary" />
              Trabajos Realizados
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {workPhotos.slice(0, 6).map((photo) => (
                <div 
                  key={photo.id} 
                  className="relative cursor-pointer group"
                  onClick={() => setSelectedPhotoIndex(workPhotos.indexOf(photo))}
                >
                  <div className="aspect-square rounded-xl overflow-hidden bg-muted">
                    <img 
                      src={photo.image_url || '/placeholder.svg'} 
                      alt={photo.caption || 'Trabajo Realizado'}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  {photo.work_type && (
                    <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full inline-block mt-1">
                      {photo.work_type}
                    </span>
                  )}
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                    {photo.caption || 'Trabajo Realizado'}
                  </p>
                  {isOwner && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => { e.stopPropagation(); deleteWorkPhoto(photo.id); }}
                      className="absolute top-1 right-1 h-6 w-6 bg-background/80 hover:bg-background text-destructive"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
            {workPhotos.length > 6 && (
              <Button
                variant="ghost"
                className="w-full mt-3 text-primary"
                onClick={() => setActiveTab("portfolio")}
              >
                Ver todas las fotos ({workPhotos.length})
              </Button>
            )}
          </div>
        )}

        {/* ===== Lightbox Dialog (E-commerce style) ===== */}
        <Dialog open={selectedPhotoIndex !== null} onOpenChange={() => { setSelectedPhotoIndex(null); setIsZoomed(false); }}>
          <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 bg-black/95 border-0 overflow-hidden [&>button]:text-white [&>button]:hover:bg-white/20">
            {selectedPhotoIndex !== null && workPhotos[selectedPhotoIndex] && (() => {
              const selectedPhotoData = workPhotos[selectedPhotoIndex];
              return (
                <div className="relative flex flex-col max-h-[95vh]">
                  {/* Counter */}
                  <div className="absolute top-3 right-12 text-white/70 text-sm z-10">
                    {selectedPhotoIndex + 1} de {workPhotos.length}
                  </div>

                  {/* Image with zoom and pan */}
                  <div 
                    ref={zoomContainerRef}
                    className={`flex-1 flex items-center justify-center p-4 ${isZoomed ? 'overflow-auto' : 'overflow-hidden'}`}
                    style={isZoomed ? { touchAction: 'none' } : undefined}
                    onMouseDown={(e) => {
                      if (!isZoomed) return;
                      setIsDragging(true);
                      setHasDragged(false);
                      setDragStart({ x: e.clientX, y: e.clientY });
                      const container = zoomContainerRef.current;
                      if (container) setScrollStart({ x: container.scrollLeft, y: container.scrollTop });
                    }}
                    onMouseMove={(e) => {
                      if (!isDragging || !isZoomed) return;
                      const dx = e.clientX - dragStart.x;
                      const dy = e.clientY - dragStart.y;
                      if (Math.abs(dx) > 5 || Math.abs(dy) > 5) setHasDragged(true);
                      const container = zoomContainerRef.current;
                      if (container) {
                        container.scrollLeft = scrollStart.x - dx;
                        container.scrollTop = scrollStart.y - dy;
                      }
                    }}
                    onMouseUp={() => {
                      if (!hasDragged && !isDragging) {
                        setIsZoomed(!isZoomed);
                      } else if (!hasDragged) {
                        setIsZoomed(!isZoomed);
                      }
                      setIsDragging(false);
                    }}
                    onMouseLeave={() => setIsDragging(false)}
                    onTouchStart={(e) => {
                      if (!isZoomed) return;
                      const touch = e.touches[0];
                      setIsDragging(true);
                      setHasDragged(false);
                      setDragStart({ x: touch.clientX, y: touch.clientY });
                      const container = zoomContainerRef.current;
                      if (container) setScrollStart({ x: container.scrollLeft, y: container.scrollTop });
                    }}
                    onTouchMove={(e) => {
                      if (!isDragging || !isZoomed) return;
                      const touch = e.touches[0];
                      const dx = touch.clientX - dragStart.x;
                      const dy = touch.clientY - dragStart.y;
                      if (Math.abs(dx) > 5 || Math.abs(dy) > 5) setHasDragged(true);
                      const container = zoomContainerRef.current;
                      if (container) {
                        container.scrollLeft = scrollStart.x - dx;
                        container.scrollTop = scrollStart.y - dy;
                      }
                    }}
                    onTouchEnd={() => {
                      if (!hasDragged) setIsZoomed(!isZoomed);
                      setIsDragging(false);
                    }}
                    onClick={(e) => {
                      if (isZoomed) {
                        e.stopPropagation();
                        return;
                      }
                      // Zoom in and center on click point
                      setIsZoomed(true);
                      const container = zoomContainerRef.current;
                      if (container) {
                        const rect = container.getBoundingClientRect();
                        const clickX = (e.clientX - rect.left) / rect.width;
                        const clickY = (e.clientY - rect.top) / rect.height;
                        requestAnimationFrame(() => {
                          container.scrollLeft = (container.scrollWidth - container.clientWidth) * clickX;
                          container.scrollTop = (container.scrollHeight - container.clientHeight) * clickY;
                        });
                      }
                    }}
                  >
                    <img 
                      src={selectedPhotoData.image_url}
                      alt={selectedPhotoData.caption || 'Trabajo realizado'}
                      draggable={false}
                      className={`transition-all duration-300 rounded-lg select-none ${
                        isZoomed 
                          ? 'max-w-none w-auto h-auto' 
                          : 'max-h-[70vh] w-full object-contain cursor-zoom-in'
                      } ${isZoomed ? (isDragging ? 'cursor-grabbing' : 'cursor-grab') : ''}`}
                    />
                  </div>

                  {/* Prev arrow */}
                  {selectedPhotoIndex > 0 && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); setSelectedPhotoIndex(selectedPhotoIndex - 1); setIsZoomed(false); }}
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 z-10 transition-colors"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                  )}

                  {/* Next arrow */}
                  {selectedPhotoIndex < workPhotos.length - 1 && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); setSelectedPhotoIndex(selectedPhotoIndex + 1); setIsZoomed(false); }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 z-10 transition-colors"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                  )}

                  {/* Description */}
                  {(selectedPhotoData.work_type || selectedPhotoData.caption) && (
                    <div className="bg-black/80 px-6 py-4 text-white">
                      {selectedPhotoData.work_type && (
                        <span className="text-xs bg-primary/30 text-primary-foreground px-2 py-1 rounded-full">
                          {selectedPhotoData.work_type}
                        </span>
                      )}
                      {selectedPhotoData.caption && (
                        <p className="text-sm mt-2 text-white/90">{selectedPhotoData.caption}</p>
                      )}
                    </div>
                  )}
                </div>
              );
            })()}
          </DialogContent>
        </Dialog>

        {/* ===== Tabs for detailed content ===== */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className={`grid w-full ${isOwner ? 'grid-cols-4' : 'grid-cols-3'}`}>
            <TabsTrigger value="reviews" className="text-xs">Opiniones</TabsTrigger>
            <TabsTrigger value="portfolio" className="text-xs">Trabajos</TabsTrigger>
            {isOwner && <TabsTrigger value="transactions" className="text-xs">Mis Trabajos</TabsTrigger>}
            {isOwner && <TabsTrigger value="requests" className="text-xs">Solicitudes</TabsTrigger>}
          </TabsList>

          <TabsContent value="reviews" className="mt-4 space-y-4">
            {reviews.length > 0 ? (
              reviews.map((review) => (
                <Card key={review.id} className="rounded-2xl border-0 shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10">
                          <AvatarFallback className="bg-primary/10 text-primary text-sm">
                            U
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-medium text-sm">Usuario</h4>
                          <p className="text-xs text-muted-foreground">
                            {new Date(review.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`h-3.5 w-3.5 ${i < review.rating ? 'text-amber-400 fill-current' : 'text-muted-foreground/30'}`} 
                          />
                        ))}
                      </div>
                    </div>
                    {review.comment && (
                      <p className="text-muted-foreground text-sm mb-4">{review.comment}</p>
                    )}
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
              <Card className="rounded-2xl border-0 shadow-sm">
                <CardContent className="p-6 text-center">
                  <p className="text-muted-foreground text-sm">Aún no hay opiniones.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="portfolio" className="mt-4">
            <div className="bg-white rounded-2xl shadow-sm p-4">
              {workPhotos.length > 0 ? (
                <div className="grid grid-cols-2 gap-3">
                  {workPhotos.map((photo) => (
                    <div key={photo.id} className="space-y-1">
                      <div 
                        className="relative aspect-square rounded-xl overflow-hidden bg-muted cursor-pointer"
                        onClick={() => setSelectedPhotoIndex(workPhotos.indexOf(photo))}
                      >
                        <img 
                          src={photo.image_url || '/placeholder.svg'} 
                          alt={photo.caption}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        />
                        {isOwner && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => { e.stopPropagation(); deleteWorkPhoto(photo.id); }}
                            className="absolute top-2 right-2 bg-background/80 hover:bg-background text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      {photo.work_type && (
                        <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full inline-block">
                          {photo.work_type}
                        </span>
                      )}
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {photo.caption || 'Trabajo Realizado'}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm text-center py-4">
                  No hay fotos disponibles.
                </p>
              )}
            </div>
          </TabsContent>

          {isOwner && (
            <TabsContent value="transactions" className="mt-4">
              <TransactionManager />
            </TabsContent>
          )}

          {isOwner && (
            <TabsContent value="requests" className="mt-4">
              <ContactRequestsPanel />
            </TabsContent>
          )}
        </Tabs>

        {/* Public Agenda */}
        {professional && (
          <div className="mt-4">
            <PublicAgendaGrid 
              professionalId={professional.id}
              professionalName={professional.full_name}
              depositAmount={500}
            />
          </div>
        )}
      </main>

      {/* ===== 8. STICKY BOTTOM CTA ===== */}
      <div className="fixed left-0 right-0 p-4 bg-background/95 backdrop-blur-md border-t border-border shadow-lg z-40 above-bottom-nav">
        <div className="max-w-2xl mx-auto flex gap-2">
          <Button 
            className="flex-1 h-14 text-base font-bold rounded-xl shadow-md bg-green-600 hover:bg-green-700 text-white"
            onClick={handleWhatsApp}
          >
            <MessageCircle className="w-5 h-5 mr-2" />
            WhatsApp
          </Button>
          <Button 
            className="flex-1 h-14 text-base font-bold rounded-xl shadow-md"
            onClick={() => setShowContactDialog(true)}
          >
            <Send className="w-5 h-5 mr-2" />
            Solicitar Presupuesto
          </Button>
        </div>
      </div>

      {/* ===== BOOKING MODAL ===== */}
      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        professionalId={professional.id}
        professionalName={professional.full_name}
        professionalAvatar={professional.image_url || undefined}
        services={services}
      />

      {/* ===== CONTACT REQUEST DIALOG ===== */}
      <ContactRequestDialog 
        professionalId={professional.id}
        professionalName={professional.full_name}
        type="quote"
        open={showContactDialog}
        onOpenChange={setShowContactDialog}
        hideTrigger
      />

      {/* ===== SHARE MODAL (hidden trigger) ===== */}
      <ProfileShareCard 
        professional={professional}
        trigger={
          <button 
            id="share-modal-trigger" 
            style={{ display: 'none' }} 
            aria-hidden="true"
          />
        }
      />
    </div>
  );
};

export default ProfessionalProfile;
