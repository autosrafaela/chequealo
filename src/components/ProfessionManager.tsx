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

  // Lista completa de servicios disponibles (igual que en Register.tsx)
  const serviceCategories = [
    { name: "Abogado", icon: Laptop, color: "bg-slate-100 text-slate-600" },
    { name: "Albañil", icon: Building, color: "bg-gray-200 text-gray-700" },
    { name: "Arquitecto / Maestro Mayor de Obras", icon: Building, color: "bg-blue-100 text-blue-600" },
    { name: "Carpintero", icon: Hammer, color: "bg-amber-100 text-amber-600" },
    { name: "Catering / Cocinero", icon: Sparkles, color: "bg-orange-100 text-orange-600" },
    { name: "Community Manager", icon: Laptop, color: "bg-purple-100 text-purple-600" },
    { name: "Contador Público", icon: Laptop, color: "bg-green-100 text-green-600" },
    { name: "Cuidador de Adultos", icon: Heart, color: "bg-pink-100 text-pink-600" },
    { name: "Decorador de Eventos", icon: Sparkles, color: "bg-violet-100 text-violet-600" },
    { name: "Detailing Automotor", icon: Car, color: "bg-blue-200 text-blue-700" },
    { name: "Diseñador Gráfico", icon: Paintbrush, color: "bg-indigo-100 text-indigo-600" },
    { name: "DJ / Sonido", icon: Laptop, color: "bg-red-100 text-red-600" },
    { name: "Electricista", icon: Zap, color: "bg-yellow-200 text-yellow-700" },
    { name: "Electricista del Automotor", icon: Zap, color: "bg-yellow-100 text-yellow-600" },
    { name: "Empleada Doméstica / Servicio de Limpieza", icon: Sparkles, color: "bg-teal-100 text-teal-600" },
    { name: "Entrenador Personal", icon: Dumbbell, color: "bg-purple-100 text-purple-600" },
    { name: "Escribano", icon: Laptop, color: "bg-gray-100 text-gray-600" },
    { name: "Esteticista / Cosmetóloga", icon: Heart, color: "bg-pink-200 text-pink-700" },
    { name: "Fletes y Mudanzas", icon: Building, color: "bg-orange-200 text-orange-700" },
    { name: "Fotógrafo / Videógrafo", icon: Laptop, color: "bg-cyan-100 text-cyan-600" },
    { name: "Fumigador / Control de Plagas", icon: Building, color: "bg-green-100 text-green-600" },
    { name: "Gasista / Plomero", icon: Flame, color: "bg-red-200 text-red-700" },
    { name: "Gestor de Trámites", icon: Laptop, color: "bg-blue-100 text-blue-600" },
    { name: "Gestor del Automotor", icon: Car, color: "bg-red-100 text-red-600" },
    { name: "Gomero", icon: Car, color: "bg-gray-100 text-gray-600" },
    { name: "Herrero", icon: Hammer, color: "bg-gray-200 text-gray-700" },
    { name: "Instalador de Cámaras", icon: Wrench, color: "bg-slate-100 text-slate-600" },
    { name: "Instalador de Durlock / Yesero", icon: Hammer, color: "bg-amber-100 text-amber-600" },
    { name: "Jardinero / Paisajista", icon: TreePine, color: "bg-green-300 text-green-800" },
    { name: "Kinesiólogo / Fisioterapeuta", icon: Heart, color: "bg-pink-100 text-pink-600" },
    { name: "Lavadero de Autos", icon: Car, color: "bg-cyan-200 text-cyan-700" },
    { name: "Limpieza de Tapizados", icon: Sparkles, color: "bg-cyan-100 text-cyan-600" },
    { name: "Manicura / Pedicura", icon: Heart, color: "bg-rose-100 text-rose-600" },
    { name: "Maquillador/a", icon: Heart, color: "bg-pink-200 text-pink-700" },
    { name: "Musicista Terapéutico", icon: Laptop, color: "bg-purple-200 text-purple-700" },
    { name: "Mecánico", icon: Car, color: "bg-orange-100 text-orange-600" },
    { name: "Médico (Clínica, Pediatría, etc.)", icon: Heart, color: "bg-blue-100 text-blue-600" },
    { name: "Nutricionista", icon: Heart, color: "bg-green-200 text-green-700" },
    { name: "Peluquero / Barbero", icon: Heart, color: "bg-violet-200 text-violet-700" },
    { name: "Pintor", icon: Paintbrush, color: "bg-green-200 text-green-700" },
    { name: "Pintor de Autos / Chapista", icon: Paintbrush, color: "bg-orange-200 text-orange-700" },
    { name: "Profesor de Apoyo Escolar", icon: Laptop, color: "bg-indigo-100 text-indigo-600" },
    { name: "Profesor de Idiomas", icon: Laptop, color: "bg-blue-200 text-blue-700" },
    { name: "Profesor de Música", icon: Laptop, color: "bg-yellow-100 text-yellow-600" },
    { name: "Psicólogo", icon: Heart, color: "bg-teal-200 text-teal-700" },
    { name: "Servicio de Grúa / Remolque", icon: Car, color: "bg-red-200 text-red-700" },
    { name: "Servicio Técnico (Línea Blanca)", icon: Wrench, color: "bg-gray-100 text-gray-600" },
    { name: "Serigrafía / Impermeabilización", icon: Paintbrush, color: "bg-indigo-200 text-indigo-700" },
    { name: "Técnico de Aire Acondicionado", icon: Wrench, color: "bg-blue-100 text-blue-600" },
    { name: "Técnico de Celulares", icon: Wrench, color: "bg-slate-200 text-slate-700" },
    { name: "Técnico de PC", icon: Laptop, color: "bg-gray-200 text-gray-700" },
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