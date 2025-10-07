import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { usePlanRestrictions } from '@/hooks/usePlanRestrictions';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, Camera, Upload, Video, FileText, Award, Star, Play, ArrowRight } from 'lucide-react';
import { PlanRestrictionsAlert } from './PlanRestrictionsAlert';

interface WorkPhoto {
  id: string;
  image_url?: string | null;
  video_url?: string | null;
  caption: string | null;
  work_type: string | null;
  is_featured: boolean;
  media_type: string; // Will be cast as 'image' | 'video'
  is_before_after: boolean;
  before_image_url?: string | null;
  after_image_url?: string | null;
  created_at: string;
}

interface Certification {
  id: string;
  certificate_name: string;
  certificate_url: string;
  issuing_organization: string;
  issue_date: string | null;
  expiry_date: string | null;
  verification_status: string; // Will be cast as 'pending' | 'verified' | 'rejected'
  created_at: string;
}

export const EnhancedPortfolioManager = () => {
  const { user } = useAuth();
  const { planLimits, loading: planLoading } = usePlanRestrictions();
  const [photos, setPhotos] = useState<WorkPhoto[]>([]);
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [isPhotoDialogOpen, setIsPhotoDialogOpen] = useState(false);
  const [isCertDialogOpen, setIsCertDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('gallery');
  const [professionalId, setProfessionalId] = useState<string | null>(null);

  // Photo form states
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
  const [isBeforeAfter, setIsBeforeAfter] = useState(false);
  const [beforeFile, setBeforeFile] = useState<File | null>(null);
  const [afterFile, setAfterFile] = useState<File | null>(null);
  const [beforePreview, setBeforePreview] = useState<string | null>(null);
  const [afterPreview, setAfterPreview] = useState<string | null>(null);

  // Certification form states
  const [certFormData, setCertFormData] = useState({
    certificate_name: '',
    issuing_organization: '',
    issue_date: '',
    expiry_date: '',
  });
  const [certFile, setCertFile] = useState<File | null>(null);

  useEffect(() => {
    if (user) {
      fetchProfessionalAndData();
    }
  }, [user]);

  const fetchProfessionalAndData = async () => {
    try {
      // Get professional ID
      const { data: professional, error: profError } = await supabase
        .from('professionals')
        .select('id')
        .eq('user_id', user?.id)
        .single();

      if (profError) throw profError;
      setProfessionalId(professional.id);

      // Fetch photos and videos
      const { data: photosData, error: photosError } = await supabase
        .from('work_photos')
        .select('*')
        .eq('professional_id', professional.id)
        .order('created_at', { ascending: false });

      if (photosError) throw photosError;
      setPhotos((photosData || []) as WorkPhoto[]);

      // Fetch certifications
      const { data: certData, error: certError } = await supabase
        .from('certifications')
        .select('*')
        .eq('professional_id', professional.id)
        .order('created_at', { ascending: false });

      if (certError) throw certError;
      setCertifications((certData || []) as Certification[]);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Error al cargar el portfolio');
    } finally {
      setLoading(false);
    }
  };

  const handleVideoUpload = async (file: File): Promise<string> => {
    // Check plan restrictions
    if (!planLimits.canUploadVideos) {
      throw new Error('Tu plan no permite subir videos');
    }

    const videoCount = photos.filter(p => p.media_type === 'video').length;
    if (planLimits.maxVideosPerPortfolio !== -1 && videoCount >= planLimits.maxVideosPerPortfolio) {
      throw new Error(`Has alcanzado el límite de ${planLimits.maxVideosPerPortfolio} videos`);
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${professionalId}/videos/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('work-photos')
      .upload(fileName, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from('work-photos')
      .getPublicUrl(fileName);

    return data.publicUrl;
  };

  const handleBeforeAfterUpload = async () => {
    if (!planLimits.canCreateBeforeAfter) {
      throw new Error('Tu plan no permite galería antes/después');
    }

    if (!beforeFile || !afterFile) {
      throw new Error('Debes seleccionar ambas imágenes (antes y después)');
    }

    const beforeUrl = await uploadImage(beforeFile, 'before');
    const afterUrl = await uploadImage(afterFile, 'after');

    return { beforeUrl, afterUrl };
  };

  const uploadImage = async (file: File, prefix?: string): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${professionalId}/${prefix ? prefix + '_' : ''}${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('work-photos')
      .upload(fileName, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from('work-photos')
      .getPublicUrl(fileName);

    return data.publicUrl;
  };

  const handleCertificationUpload = async () => {
    if (!planLimits.canUploadCertificates) {
      throw new Error('Tu plan no permite subir certificaciones');
    }

    if (planLimits.maxCertificates !== -1 && certifications.length >= planLimits.maxCertificates) {
      throw new Error(`Has alcanzado el límite de ${planLimits.maxCertificates} certificaciones`);
    }

    if (!certFile) {
      throw new Error('Debes seleccionar un archivo de certificación');
    }

    const fileExt = certFile.name.split('.').pop();
    const fileName = `${professionalId}/certificates/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('verification-docs')
      .upload(fileName, certFile);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from('verification-docs')
      .getPublicUrl(fileName);

    const { error } = await supabase
      .from('certifications')
      .insert({
        professional_id: professionalId,
        certificate_name: certFormData.certificate_name,
        issuing_organization: certFormData.issuing_organization,
        issue_date: certFormData.issue_date || null,
        expiry_date: certFormData.expiry_date || null,
        certificate_url: data.publicUrl,
      });

    if (error) throw error;
  };

  const renderGalleryTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Portfolio de Trabajos</h3>
        <Dialog open={isPhotoDialogOpen} onOpenChange={setIsPhotoDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Agregar Contenido
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Agregar al Portfolio</DialogTitle>
              <DialogDescription>
                Sube fotos, videos o crea comparaciones antes/después
              </DialogDescription>
            </DialogHeader>
            
            <Tabs defaultValue="image" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="image">Foto</TabsTrigger>
                <TabsTrigger 
                  value="video" 
                  disabled={!planLimits.canUploadVideos}
                >
                  Video
                </TabsTrigger>
                <TabsTrigger 
                  value="before-after" 
                  disabled={!planLimits.canCreateBeforeAfter}
                >
                  Antes/Después
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="image" className="space-y-4">
                <div>
                  <Label>Subir Imagen</Label>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setSelectedFiles(e.target.files)}
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="video" className="space-y-4">
                {!planLimits.canUploadVideos ? (
                  <PlanRestrictionsAlert 
                    featureType="video_uploads"
                    currentUsage={0}
                  />
                ) : (
                  <div>
                    <Label>Subir Video</Label>
                    <Input
                      type="file"
                      accept="video/*"
                      onChange={(e) => setSelectedFiles(e.target.files)}
                    />
                    <p className="text-sm text-muted-foreground mt-2">
                      Videos de hasta 50MB. Formatos: MP4, MOV, AVI
                    </p>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="before-after" className="space-y-4">
                {!planLimits.canCreateBeforeAfter ? (
                  <PlanRestrictionsAlert 
                    featureType="before_after_gallery"
                    currentUsage={0}
                  />
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Imagen "Antes"</Label>
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setBeforeFile(file);
                              setBeforePreview(URL.createObjectURL(file));
                            }
                          }}
                        />
                        {beforePreview && (
                          <img 
                            src={beforePreview} 
                            alt="Antes" 
                            className="w-full h-32 object-cover rounded mt-2"
                          />
                        )}
                      </div>
                      <div>
                        <Label>Imagen "Después"</Label>
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setAfterFile(file);
                              setAfterPreview(URL.createObjectURL(file));
                            }
                          }}
                        />
                        {afterPreview && (
                          <img 
                            src={afterPreview} 
                            alt="Después" 
                            className="w-full h-32 object-cover rounded mt-2"
                          />
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {photos.map((photo) => (
          <Card key={photo.id} className="overflow-hidden">
            <div className="relative">
              {photo.media_type === 'video' ? (
                <div className="relative">
                  <video 
                    src={photo.video_url} 
                    className="w-full h-48 object-cover"
                    controls
                  />
                  <div className="absolute top-2 left-2">
                    <div className="bg-black/70 text-white px-2 py-1 rounded text-xs flex items-center">
                      <Video className="h-3 w-3 mr-1" />
                      Video
                    </div>
                  </div>
                </div>
              ) : photo.is_before_after ? (
                <div className="relative">
                  <div className="flex">
                    <div className="w-1/2 relative">
                      <img 
                        src={photo.before_image_url} 
                        alt="Antes" 
                        className="w-full h-48 object-cover"
                      />
                      <div className="absolute bottom-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
                        Antes
                      </div>
                    </div>
                    <div className="w-1/2 relative">
                      <img 
                        src={photo.after_image_url} 
                        alt="Después" 
                        className="w-full h-48 object-cover"
                      />
                      <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
                        Después
                      </div>
                    </div>
                  </div>
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <div className="bg-white rounded-full p-2 shadow-lg">
                      <ArrowRight className="h-4 w-4 text-primary" />
                    </div>
                  </div>
                </div>
              ) : (
                <img 
                  src={photo.image_url} 
                  alt={photo.caption || 'Trabajo'} 
                  className="w-full h-48 object-cover"
                />
              )}
              
              {photo.is_featured && (
                <div className="absolute top-2 right-2">
                  <div className="bg-yellow-500 text-white px-2 py-1 rounded text-xs flex items-center">
                    <Star className="h-3 w-3 mr-1" />
                    Destacado
                  </div>
                </div>
              )}
            </div>
            
            <CardContent className="p-4">
              <p className="font-medium">{photo.work_type}</p>
              {photo.caption && (
                <p className="text-sm text-muted-foreground mt-1">{photo.caption}</p>
              )}
              <div className="flex justify-end gap-2 mt-3">
                <Button size="sm" variant="outline" onClick={() => {}}>
                  <Edit className="h-3 w-3" />
                </Button>
                <Button size="sm" variant="outline" onClick={() => {}}>
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderCertificationsTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Certificaciones y Diplomas</h3>
        <Dialog open={isCertDialogOpen} onOpenChange={setIsCertDialogOpen}>
          <DialogTrigger asChild>
            <Button disabled={!planLimits.canUploadCertificates}>
              <Plus className="h-4 w-4 mr-2" />
              Agregar Certificación
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nueva Certificación</DialogTitle>
              <DialogDescription>
                Agrega certificados, diplomas o constancias profesionales
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label>Nombre del Certificado *</Label>
                <Input
                  value={certFormData.certificate_name}
                  onChange={(e) => setCertFormData(prev => ({
                    ...prev,
                    certificate_name: e.target.value
                  }))}
                  placeholder="Ej: Certificado en Instalaciones Eléctricas"
                />
              </div>
              
              <div>
                <Label>Organización Emisora *</Label>
                <Input
                  value={certFormData.issuing_organization}
                  onChange={(e) => setCertFormData(prev => ({
                    ...prev,
                    issuing_organization: e.target.value
                  }))}
                  placeholder="Ej: Colegio de Electricistas"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Fecha de Emisión</Label>
                  <Input
                    type="date"
                    value={certFormData.issue_date}
                    onChange={(e) => setCertFormData(prev => ({
                      ...prev,
                      issue_date: e.target.value
                    }))}
                  />
                </div>
                <div>
                  <Label>Fecha de Vencimiento</Label>
                  <Input
                    type="date"
                    value={certFormData.expiry_date}
                    onChange={(e) => setCertFormData(prev => ({
                      ...prev,
                      expiry_date: e.target.value
                    }))}
                  />
                </div>
              </div>
              
              <div>
                <Label>Archivo del Certificado *</Label>
                <Input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => setCertFile(e.target.files?.[0] || null)}
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Formatos: PDF, JPG, PNG (máx. 5MB)
                </p>
              </div>
            </div>
            
            <DialogFooter>
              <Button 
                onClick={async () => {
                  try {
                    setUploading(true);
                    await handleCertificationUpload();
                    toast.success('Certificación agregada correctamente');
                    setIsCertDialogOpen(false);
                    setCertFormData({
                      certificate_name: '',
                      issuing_organization: '',
                      issue_date: '',
                      expiry_date: '',
                    });
                    setCertFile(null);
                    fetchProfessionalAndData();
                  } catch (error: any) {
                    toast.error(error.message || 'Error al subir certificación');
                  } finally {
                    setUploading(false);
                  }
                }}
                disabled={uploading}
              >
                {uploading ? 'Subiendo...' : 'Guardar Certificación'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {!planLimits.canUploadCertificates && (
        <PlanRestrictionsAlert 
          featureType="digital_certificates"
          currentUsage={certifications.length}
        />
      )}

      <div className="grid gap-4">
        {certifications.map((cert) => (
          <Card key={cert.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-primary/10 rounded">
                    <Award className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium">{cert.certificate_name}</h4>
                    <p className="text-sm text-muted-foreground">{cert.issuing_organization}</p>
                    {cert.issue_date && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Emitido: {new Date(cert.issue_date).toLocaleDateString()}
                        {cert.expiry_date && ` • Vence: ${new Date(cert.expiry_date).toLocaleDateString()}`}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      <div className={`px-2 py-1 rounded text-xs ${
                        cert.verification_status === 'verified' 
                          ? 'bg-green-100 text-green-700' 
                          : cert.verification_status === 'rejected'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {cert.verification_status === 'verified' && '✓ Verificado'}
                        {cert.verification_status === 'rejected' && '✗ Rechazado'}
                        {cert.verification_status === 'pending' && '⏳ Pendiente'}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" asChild>
                    <a href={cert.certificate_url} target="_blank" rel="noopener noreferrer">
                      <FileText className="h-3 w-3" />
                    </a>
                  </Button>
                  <Button size="sm" variant="outline">
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  if (loading || planLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Portfolio Profesional</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Cargando portfolio...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="h-5 w-5" />
          Portfolio Profesional Mejorado
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Gestiona tu galería, videos y certificaciones profesionales
        </p>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="gallery">
              Galería ({photos.length})
            </TabsTrigger>
            <TabsTrigger value="certifications">
              Certificaciones ({certifications.length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="gallery" className="mt-6">
            {renderGalleryTab()}
          </TabsContent>
          
          <TabsContent value="certifications" className="mt-6">
            {renderCertificationsTab()}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};