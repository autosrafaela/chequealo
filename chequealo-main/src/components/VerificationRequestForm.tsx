import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Upload, FileText, X, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface VerificationRequestFormProps {
  onSuccess: () => void;
}

const VerificationRequestForm: React.FC<VerificationRequestFormProps> = ({ onSuccess }) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    profession: '',
    licenseNumber: '',
    yearsExperience: '',
    education: '',
    certifications: ['']
  });
  const [documents, setDocuments] = useState<File[]>([]);
  const [uploadedDocs, setUploadedDocs] = useState<string[]>([]);

  const professions = [
    'Abogado', 'Contador', 'Arquitecto', 'Ingeniero', 'Médico', 'Dentista',
    'Veterinario', 'Psicólogo', 'Nutricionista', 'Kinesiólogo', 'Electricista',
    'Plomero', 'Carpintero', 'Albañil', 'Mecánico', 'Gestor Automotor', 'Otro'
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCertificationChange = (index: number, value: string) => {
    const newCertifications = [...formData.certifications];
    newCertifications[index] = value;
    setFormData(prev => ({ ...prev, certifications: newCertifications }));
  };

  const addCertification = () => {
    if (formData.certifications.length < 5) {
      setFormData(prev => ({ 
        ...prev, 
        certifications: [...prev.certifications, ''] 
      }));
    }
  };

  const removeCertification = (index: number) => {
    if (formData.certifications.length > 1) {
      setFormData(prev => ({
        ...prev,
        certifications: prev.certifications.filter((_, i) => i !== index)
      }));
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const validFiles = files.filter(file => {
      const isValidType = ['image/jpeg', 'image/png', 'application/pdf'].includes(file.type);
      const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB
      return isValidType && isValidSize;
    });

    if (validFiles.length !== files.length) {
      toast({
        title: "Error en archivos",
        description: "Solo se permiten imágenes (JPG, PNG) y PDF menores a 5MB",
        variant: "destructive"
      });
    }

    setDocuments(prev => [...prev, ...validFiles].slice(0, 5));
  };

  const removeDocument = (index: number) => {
    setDocuments(prev => prev.filter((_, i) => i !== index));
  };

  const uploadDocuments = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuario no autenticado');

    const uploadPromises = documents.map(async (file, index) => {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}-${index}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('verification-docs')
        .upload(fileName, file);

      if (error) throw error;
      return fileName;
    });

    return Promise.all(uploadPromises);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.email || !formData.profession) {
      toast({
        title: "Campos requeridos",
        description: "Por favor completa todos los campos obligatorios",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Error de autenticación",
          description: "Debes iniciar sesión para solicitar verificación",
          variant: "destructive"
        });
        return;
      }

      // Upload documents
      let documentUrls: string[] = [];
      if (documents.length > 0) {
        documentUrls = await uploadDocuments();
      }

      // Create verification request
      const { error } = await supabase
        .from('verification_requests')
        .insert({
          professional_id: user.id,
          full_name: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          profession: formData.profession,
          license_number: formData.licenseNumber,
          years_experience: formData.yearsExperience ? parseInt(formData.yearsExperience) : null,
          education: formData.education,
          certifications: formData.certifications.filter(cert => cert.trim() !== ''),
          document_urls: documentUrls
        });

      if (error) throw error;

      toast({
        title: "Solicitud enviada",
        description: "Tu solicitud de verificación ha sido enviada. Recibirás una respuesta pronto.",
      });

      onSuccess();
    } catch (error: any) {
      console.error('Error submitting verification request:', error);
      toast({
        title: "Error",
        description: error.message || "Error al enviar la solicitud",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="h-6 w-6 text-primary" />
          Solicitud de Verificación Profesional
        </CardTitle>
        <CardDescription>
          Completa este formulario para verificar tu identidad profesional y obtener la insignia de verificado.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Información Personal</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fullName">Nombre Completo *</Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  placeholder="Tu nombre completo"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="tu@email.com"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="phone">Teléfono</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="+54 11 1234-5678"
              />
            </div>
          </div>

          {/* Professional Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Información Profesional</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="profession">Profesión *</Label>
                <Select onValueChange={(value) => handleInputChange('profession', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona tu profesión" />
                  </SelectTrigger>
                  <SelectContent>
                    {professions.map(prof => (
                      <SelectItem key={prof} value={prof}>{prof}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="yearsExperience">Años de Experiencia</Label>
                <Input
                  id="yearsExperience"
                  type="number"
                  min="0"
                  max="50"
                  value={formData.yearsExperience}
                  onChange={(e) => handleInputChange('yearsExperience', e.target.value)}
                  placeholder="5"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="licenseNumber">Número de Matrícula/Licencia</Label>
              <Input
                id="licenseNumber"
                value={formData.licenseNumber}
                onChange={(e) => handleInputChange('licenseNumber', e.target.value)}
                placeholder="Número de registro profesional"
              />
            </div>

            <div>
              <Label htmlFor="education">Educación/Formación</Label>
              <Textarea
                id="education"
                value={formData.education}
                onChange={(e) => handleInputChange('education', e.target.value)}
                placeholder="Universidad, título, año de graduación..."
                className="min-h-[80px]"
              />
            </div>
          </div>

          {/* Certifications */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Certificaciones</h3>
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={addCertification}
                disabled={formData.certifications.length >= 5}
              >
                Agregar Certificación
              </Button>
            </div>
            
            {formData.certifications.map((cert, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={cert}
                  onChange={(e) => handleCertificationChange(index, e.target.value)}
                  placeholder="Nombre de la certificación"
                />
                {formData.certifications.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => removeCertification(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          {/* Document Upload */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Documentos de Verificación</h3>
            <p className="text-sm text-muted-foreground">
              Sube documentos que acrediten tu identidad y profesión (máximo 5 archivos, 5MB cada uno)
            </p>
            
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
              <input
                type="file"
                multiple
                accept="image/*,.pdf"
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-sm text-muted-foreground">
                  Haz clic para subir archivos o arrastra aquí
                </p>
              </label>
            </div>

            {documents.length > 0 && (
              <div className="space-y-2">
                {documents.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      <span className="text-sm">{file.name}</span>
                      <Badge variant="secondary">{(file.size / 1024 / 1024).toFixed(1)} MB</Badge>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeDocument(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Enviando...' : 'Enviar Solicitud de Verificación'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default VerificationRequestForm;