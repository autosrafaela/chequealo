import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Edit, Search, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  Wrench, Zap, Car, Sparkles, Dumbbell, Paintbrush, 
  Hammer, Flame, TreePine, Building, Heart, Laptop 
} from "lucide-react";

interface ProfessionManagerProps {
  professionalData: any;
  onUpdate: () => void;
  isOwner: boolean;
}

export const ProfessionManager = ({ professionalData, onUpdate, isOwner }: ProfessionManagerProps) => {
  const [isManagingProfessions, setIsManagingProfessions] = useState(false);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  // Lista completa de 130+ profesiones disponibles (igual que en Register.tsx)
  const serviceCategories = [
    { name: "Abogado", icon: Laptop, color: "bg-slate-100 text-slate-600" },
    { name: "Acompañante Terapéutico", icon: Heart, color: "bg-teal-100 text-teal-600" },
    { name: "Adiestrador de Perros", icon: Heart, color: "bg-amber-100 text-amber-600" },
    { name: "Agrimensor", icon: Building, color: "bg-gray-100 text-gray-600" },
    { name: "Albañil", icon: Building, color: "bg-gray-200 text-gray-700" },
    { name: "Arquitecta", icon: Building, color: "bg-blue-100 text-blue-600" },
    { name: "Asesor de Seguros", icon: Laptop, color: "bg-blue-200 text-blue-700" },
    { name: "Asesor Inmobiliario", icon: Building, color: "bg-green-100 text-green-600" },
    { name: "Barman / Bartender", icon: Sparkles, color: "bg-purple-100 text-purple-600" },
    { name: "Barbero", icon: Heart, color: "bg-violet-200 text-violet-700" },
    { name: "Camarógrafo", icon: Laptop, color: "bg-red-100 text-red-600" },
    { name: "Carpintero / Ebanista", icon: Hammer, color: "bg-amber-100 text-amber-600" },
    { name: "Catering", icon: Sparkles, color: "bg-orange-100 text-orange-600" },
    { name: "Cerrajero", icon: Wrench, color: "bg-gray-100 text-gray-600" },
    { name: "Chapista y Pintor Automotor", icon: Paintbrush, color: "bg-orange-200 text-orange-700" },
    { name: "Chef a Domicilio", icon: Sparkles, color: "bg-red-200 text-red-700" },
    { name: "Chofer Particular", icon: Car, color: "bg-blue-100 text-blue-600" },
    { name: "Colocador de Cerámicos", icon: Hammer, color: "bg-amber-200 text-amber-700" },
    { name: "Colocador de Pisos", icon: Hammer, color: "bg-amber-200 text-amber-700" },
    { name: "Colocador de Porcelanatos", icon: Hammer, color: "bg-amber-200 text-amber-700" },
    { name: "Community Manager", icon: Laptop, color: "bg-purple-100 text-purple-600" },
    { name: "Contadora Pública", icon: Laptop, color: "bg-green-100 text-green-600" },
    { name: "Contador", icon: Laptop, color: "bg-green-100 text-green-600" },
    { name: "Control de Plagas y Fumigación", icon: Building, color: "bg-green-100 text-green-600" },
    { name: "Cortinero", icon: Hammer, color: "bg-indigo-100 text-indigo-600" },
    { name: "Cuidador de Mascotas", icon: Heart, color: "bg-pink-100 text-pink-600" },
    { name: "Cuidador/a de Adultos Mayores", icon: Heart, color: "bg-pink-100 text-pink-600" },
    { name: "Cuidador/a de Niños (Niñera)", icon: Heart, color: "bg-pink-200 text-pink-700" },
    { name: "Decorador de Interiores", icon: Sparkles, color: "bg-violet-100 text-violet-600" },
    { name: "Desinfección y Sanitización", icon: Building, color: "bg-green-200 text-green-700" },
    { name: "Detailing de Autos", icon: Car, color: "bg-blue-200 text-blue-700" },
    { name: "Desarrollador Web", icon: Laptop, color: "bg-indigo-100 text-indigo-600" },
    { name: "Diseñador de Interiores", icon: Paintbrush, color: "bg-violet-200 text-violet-700" },
    { name: "Diseñador Gráfico", icon: Paintbrush, color: "bg-indigo-100 text-indigo-600" },
    { name: "Editor de Video", icon: Laptop, color: "bg-red-200 text-red-700" },
    { name: "Electricista", icon: Zap, color: "bg-yellow-200 text-yellow-700" },
    { name: "Electricista Matriculado", icon: Zap, color: "bg-yellow-100 text-yellow-600" },
    { name: "Empleada Doméstica / Servicio de Limpieza", icon: Sparkles, color: "bg-teal-100 text-teal-600" },
    { name: "Enfermero/a", icon: Heart, color: "bg-blue-100 text-blue-600" },
    { name: "Entrenador Personal", icon: Dumbbell, color: "bg-purple-100 text-purple-600" },
    { name: "Escribano", icon: Laptop, color: "bg-gray-100 text-gray-600" },
    { name: "Esteticista", icon: Heart, color: "bg-pink-200 text-pink-700" },
    { name: "Fletero / Mudanzas", icon: Building, color: "bg-orange-200 text-orange-700" },
    { name: "Fonoaudiólogo", icon: Heart, color: "bg-teal-200 text-teal-700" },
    { name: "Fotógrafo", icon: Laptop, color: "bg-cyan-100 text-cyan-600" },
    { name: "Fumigador / Control de Plagas", icon: Building, color: "bg-green-100 text-green-600" },
    { name: "Gestor del Automotor", icon: Car, color: "bg-red-100 text-red-600" },
    { name: "Gomería", icon: Car, color: "bg-gray-100 text-gray-600" },
    { name: "Herrero", icon: Hammer, color: "bg-gray-200 text-gray-700" },
    { name: "Herrería de Obra", icon: Hammer, color: "bg-gray-200 text-gray-700" },
    { name: "Ingeniero", icon: Building, color: "bg-blue-100 text-blue-600" },
    { name: "Instalador de Alarmas", icon: Wrench, color: "bg-slate-100 text-slate-600" },
    { name: "Instalador de Audio para Autos", icon: Car, color: "bg-blue-100 text-blue-600" },
    { name: "Instalador de Cámaras de Seguridad", icon: Wrench, color: "bg-slate-100 text-slate-600" },
    { name: "Instalador de Durlock / Yesero", icon: Hammer, color: "bg-amber-100 text-amber-600" },
    { name: "Instalador de Internet", icon: Laptop, color: "bg-blue-100 text-blue-600" },
    { name: "Instalador de Paneles Solares", icon: Zap, color: "bg-yellow-100 text-yellow-600" },
    { name: "Instalador de TV", icon: Laptop, color: "bg-gray-100 text-gray-600" },
    { name: "Jardinero", icon: TreePine, color: "bg-green-300 text-green-800" },
    { name: "Jardinero / Paisajista", icon: TreePine, color: "bg-green-300 text-green-800" },
    { name: "Kinesiólogo / Fisioterapeuta", icon: Heart, color: "bg-pink-100 text-pink-600" },
    { name: "Lavadero de Autos", icon: Car, color: "bg-cyan-200 text-cyan-700" },
    { name: "Limpieza de Alfombras", icon: Sparkles, color: "bg-cyan-100 text-cyan-600" },
    { name: "Limpieza de Persianas", icon: Sparkles, color: "bg-cyan-100 text-cyan-600" },
    { name: "Limpieza de Tanques de Agua", icon: Sparkles, color: "bg-cyan-100 text-cyan-600" },
    { name: "Limpieza de Tapizados", icon: Sparkles, color: "bg-cyan-100 text-cyan-600" },
    { name: "Limpieza y Mantenimiento", icon: Sparkles, color: "bg-teal-100 text-teal-600" },
    { name: "Manicurista", icon: Heart, color: "bg-rose-100 text-rose-600" },
    { name: "Maquillador/a", icon: Heart, color: "bg-pink-200 text-pink-700" },
    { name: "Maquillador Profesional", icon: Heart, color: "bg-pink-200 text-pink-700" },
    { name: "Martillero Público", icon: Building, color: "bg-green-100 text-green-600" },
    { name: "Masajista", icon: Heart, color: "bg-pink-100 text-pink-600" },
    { name: "Mecánico", icon: Car, color: "bg-orange-100 text-orange-600" },
    { name: "Mecánico de Motos", icon: Car, color: "bg-orange-200 text-orange-700" },
    { name: "Mensajería", icon: Car, color: "bg-blue-100 text-blue-600" },
    { name: "Nutricionista", icon: Heart, color: "bg-green-200 text-green-700" },
    { name: "Organizador Profesional", icon: Sparkles, color: "bg-violet-100 text-violet-600" },
    { name: "Paseador de Perros", icon: Heart, color: "bg-amber-100 text-amber-600" },
    { name: "Pastelero", icon: Sparkles, color: "bg-red-100 text-red-600" },
    { name: "Pedicurista", icon: Heart, color: "bg-rose-100 text-rose-600" },
    { name: "Peluquero/a", icon: Heart, color: "bg-violet-200 text-violet-700" },
    { name: "Peluquero Canino", icon: Heart, color: "bg-amber-200 text-amber-700" },
    { name: "Personal Shopper", icon: Sparkles, color: "bg-purple-100 text-purple-600" },
    { name: "Pintor", icon: Paintbrush, color: "bg-green-200 text-green-700" },
    { name: "Pintor de Obras", icon: Paintbrush, color: "bg-green-200 text-green-700" },
    { name: "Plomero / Gasista", icon: Flame, color: "bg-red-200 text-red-700" },
    { name: "Podador de Árboles", icon: TreePine, color: "bg-green-300 text-green-800" },
    { name: "Polarizado de Vidrios", icon: Car, color: "bg-blue-200 text-blue-700" },
    { name: "Profesor de Apoyo Escolar", icon: Laptop, color: "bg-indigo-100 text-indigo-600" },
    { name: "Profesor de Canto", icon: Laptop, color: "bg-yellow-200 text-yellow-700" },
    { name: "Profesor de Danza", icon: Laptop, color: "bg-purple-200 text-purple-700" },
    { name: "Profesor de Dibujo y Pintura", icon: Paintbrush, color: "bg-indigo-200 text-indigo-700" },
    { name: "Profesor de Física", icon: Laptop, color: "bg-blue-100 text-blue-600" },
    { name: "Profesor de Idiomas", icon: Laptop, color: "bg-blue-200 text-blue-700" },
    { name: "Profesor de Matemáticas", icon: Laptop, color: "bg-indigo-100 text-indigo-600" },
    { name: "Profesor de Música", icon: Laptop, color: "bg-yellow-100 text-yellow-600" },
    { name: "Profesor de Música (Guitarra)", icon: Laptop, color: "bg-yellow-100 text-yellow-600" },
    { name: "Profesor de Música (Piano)", icon: Laptop, color: "bg-yellow-100 text-yellow-600" },
    { name: "Profesor de Química", icon: Laptop, color: "bg-green-100 text-green-600" },
    { name: "Profesor de Yoga", icon: Dumbbell, color: "bg-purple-100 text-purple-600" },
    { name: "Profesor de Pilates", icon: Dumbbell, color: "bg-purple-200 text-purple-700" },
    { name: "Profesor Particular", icon: Laptop, color: "bg-indigo-100 text-indigo-600" },
    { name: "Profesora de Inglés", icon: Laptop, color: "bg-blue-200 text-blue-700" },
    { name: "Psicólogo", icon: Heart, color: "bg-teal-200 text-teal-700" },
    { name: "Psicopedagogo", icon: Heart, color: "bg-teal-100 text-teal-600" },
    { name: "Pulidor de Pisos", icon: Hammer, color: "bg-amber-100 text-amber-600" },
    { name: "Redactor de Contenidos", icon: Laptop, color: "bg-indigo-200 text-indigo-700" },
    { name: "Remisero", icon: Car, color: "bg-blue-100 text-blue-600" },
    { name: "Reparación de Celulares", icon: Wrench, color: "bg-slate-200 text-slate-700" },
    { name: "Reparación de Computadoras", icon: Laptop, color: "bg-gray-200 text-gray-700" },
    { name: "Reparación de Electrodomésticos", icon: Wrench, color: "bg-gray-100 text-gray-600" },
    { name: "Repostero", icon: Sparkles, color: "bg-red-100 text-red-600" },
    { name: "Servicio Técnico (Línea Blanca)", icon: Wrench, color: "bg-gray-100 text-gray-600" },
    { name: "Soldador", icon: Flame, color: "bg-red-200 text-red-700" },
    { name: "Sommelier", icon: Sparkles, color: "bg-purple-200 text-purple-700" },
    { name: "Tapicero", icon: Hammer, color: "bg-indigo-100 text-indigo-600" },
    { name: "Techista", icon: Building, color: "bg-gray-200 text-gray-700" },
    { name: "Técnico de Aire Acondicionado", icon: Wrench, color: "bg-blue-100 text-blue-600" },
    { name: "Técnico de Celulares", icon: Wrench, color: "bg-slate-200 text-slate-700" },
    { name: "Técnico de PC", icon: Laptop, color: "bg-gray-200 text-gray-700" },
    { name: "Técnico en Calefacción", icon: Flame, color: "bg-red-100 text-red-600" },
    { name: "Técnico en Energías Renovables", icon: Zap, color: "bg-yellow-100 text-yellow-600" },
    { name: "Técnico en Redes", icon: Laptop, color: "bg-blue-100 text-blue-600" },
    { name: "Técnico en Refrigeración", icon: Wrench, color: "bg-blue-200 text-blue-700" },
    { name: "Terapista Ocupacional", icon: Heart, color: "bg-teal-100 text-teal-600" },
    { name: "Traductor", icon: Laptop, color: "bg-indigo-200 text-indigo-700" },
    { name: "Veterinario", icon: Heart, color: "bg-green-100 text-green-600" },
    { name: "Vidriería", icon: Hammer, color: "bg-gray-100 text-gray-600" }
  ];

  // Inicializar con la profesión actual del profesional
  useEffect(() => {
    if (professionalData?.profession) {
      setSelectedServices([professionalData.profession]);
    }
  }, [professionalData]);

  const handleServiceToggle = (serviceName: string) => {
    setSelectedServices(prev => {
      if (prev.includes(serviceName)) {
        return prev.filter(s => s !== serviceName);
      } else if (prev.length < 3) {
        return [...prev, serviceName];
      }
      return prev;
    });
  };

  const filteredServices = serviceCategories.filter(service =>
    service.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const updateProfessions = async () => {
    if (selectedServices.length === 0) {
      toast.error('Debes seleccionar al menos una profesión');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('professionals')
        .update({
          profession: selectedServices[0], // La profesión principal
          updated_at: new Date().toISOString()
        })
        .eq('id', professionalData.id);

      if (error) throw error;

      toast.success('Profesiones actualizadas exitosamente');
      setIsManagingProfessions(false);
      onUpdate();
    } catch (error) {
      console.error('Error updating professions:', error);
      toast.error('Error al actualizar las profesiones');
    } finally {
      setLoading(false);
    }
  };

  if (!isOwner) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building className="h-5 w-5" />
          Mis Profesiones
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Profesión actual */}
        <div>
          <Label className="text-sm font-medium mb-2 block">Profesión Principal</Label>
          <Badge variant="secondary" className="text-sm px-3 py-1">
            {professionalData?.profession || 'No definida'}
          </Badge>
        </div>

        {/* Botón para gestionar */}
        <Dialog open={isManagingProfessions} onOpenChange={setIsManagingProfessions}>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full">
              <Edit className="h-4 w-4 mr-2" />
              Cambiar Profesiones
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Gestionar Profesiones</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-3 block">
                  Elegí hasta 3 profesiones que ofrecés ({selectedServices.length}/3)
                </Label>
                
                {/* Campo de búsqueda */}
                <div className="relative mb-3">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    type="text"
                    placeholder="Buscar profesiones..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 h-10 border-gray-200 focus:border-primary text-sm"
                  />
                </div>

                {/* Lista de profesiones */}
                <div className="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto p-2 border border-gray-200 rounded-lg bg-white">
                  {filteredServices.length > 0 ? (
                    filteredServices.map((category, index) => {
                      const Icon = category.icon;
                      const isSelected = selectedServices.includes(category.name);
                      const isDisabled = selectedServices.length >= 3 && !isSelected;
                      
                      return (
                        <button
                          key={index}
                          type="button"
                          onClick={() => handleServiceToggle(category.name)}
                          disabled={isDisabled}
                          className={`p-3 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-3 text-left ${
                            isSelected
                              ? 'bg-primary text-primary-foreground border border-primary shadow-md'
                              : isDisabled
                              ? 'bg-gray-50 text-gray-400 cursor-not-allowed border border-gray-100'
                              : 'bg-white border border-gray-200 hover:border-primary hover:bg-primary/5 text-gray-700 hover:shadow-sm'
                          }`}
                        >
                          <div className={`p-1.5 rounded-md ${isSelected ? 'bg-white/20' : category.color}`}>
                            <Icon className="h-4 w-4 flex-shrink-0" />
                          </div>
                          <span className="flex-1">{category.name}</span>
                        </button>
                      );
                    })
                  ) : (
                    <div className="p-4 text-center text-gray-500 text-sm">
                      No se encontraron profesiones que coincidan con "{searchTerm}"
                    </div>
                  )}
                </div>
              </div>

              {/* Lista de profesiones seleccionadas */}
              {selectedServices.length > 0 && (
                <div>
                  <Label className="text-sm font-medium mb-2 block">Profesiones Seleccionadas:</Label>
                  <div className="flex flex-wrap gap-2">
                    {selectedServices.map((service, index) => (
                      <Badge 
                        key={service} 
                        variant={index === 0 ? "default" : "secondary"}
                        className="text-xs px-2 py-1"
                      >
                        {service} {index === 0 && "(Principal)"}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-4 border-t">
                <Button 
                  onClick={updateProfessions} 
                  className="flex-1"
                  disabled={loading || selectedServices.length === 0}
                >
                  {loading ? 'Guardando...' : 'Guardar Cambios'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsManagingProfessions(false);
                    setSelectedServices(professionalData?.profession ? [professionalData.profession] : []);
                    setSearchTerm('');
                  }}
                  disabled={loading}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};