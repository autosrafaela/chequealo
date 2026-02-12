import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Search, X, Loader2, ChevronDown, ChevronUp, Plus, Lightbulb,
  Wrench, Zap, Car, Sparkles, Dumbbell, Paintbrush, 
  Hammer, Flame, TreePine, Building, Heart, Laptop 
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface EditMyServicesProps {
  professionalData: any;
  onUpdate: () => void;
}

interface SelectedRubro {
  name: string;
  description: string;
}

const serviceCategories = [
  { name: "Abogado", icon: Laptop }, { name: "Acompañante Terapéutico", icon: Heart },
  { name: "Adiestrador de Perros", icon: Heart }, { name: "Agrimensor", icon: Building },
  { name: "Albañil", icon: Building }, { name: "Alisadora Profesional", icon: Heart },
  { name: "Arquitecta", icon: Building }, { name: "Asesor de Seguros", icon: Laptop },
  { name: "Asesor Inmobiliario", icon: Building }, { name: "Automatización con IA", icon: Laptop },
  { name: "Auxiliares de Estudio", icon: Laptop }, { name: "Barman / Bartender", icon: Sparkles },
  { name: "Barbero", icon: Heart }, { name: "Camarógrafo", icon: Laptop },
  { name: "Capacitación en Manejo y Programación de Tornos CNC", icon: Laptop },
  { name: "Carpintero / Ebanista", icon: Hammer }, { name: "Catering", icon: Sparkles },
  { name: "Cerrajero", icon: Wrench }, { name: "Chapista y Pintor Automotor", icon: Paintbrush },
  { name: "Chef a Domicilio", icon: Sparkles }, { name: "Chofer Particular", icon: Car },
  { name: "Colocador de Cerámicos", icon: Hammer }, { name: "Colocador de Pisos", icon: Hammer },
  { name: "Colocador de Porcelanatos", icon: Hammer }, { name: "Community Manager", icon: Laptop },
  { name: "Contadora Pública", icon: Laptop }, { name: "Contador", icon: Laptop },
  { name: "Control de Plagas y Fumigación", icon: Building }, { name: "Cortinero", icon: Hammer },
  { name: "Cursos/Formación", icon: Laptop }, { name: "Cuidador de Mascotas", icon: Heart },
  { name: "Cuidador/a de Adultos Mayores", icon: Heart }, { name: "Cuidador/a de Niños (Niñera)", icon: Heart },
  { name: "Decorador de Interiores", icon: Sparkles }, { name: "Desinfección y Sanitización", icon: Building },
  { name: "Detailing", icon: Car }, { name: "Detailing de Autos", icon: Car },
  { name: "Desarrollador Web", icon: Laptop }, { name: "Diseñador de Interiores", icon: Paintbrush },
  { name: "Diseñador Gráfico", icon: Paintbrush }, { name: "Editor de Video", icon: Laptop },
  { name: "Electricista", icon: Zap }, { name: "Electricista Matriculado", icon: Zap },
  { name: "Empleada Doméstica / Servicio de Limpieza", icon: Sparkles },
  { name: "Encomiendas/Comisionista", icon: Car }, { name: "Enfermero/a", icon: Heart },
  { name: "Entrenador Personal", icon: Dumbbell }, { name: "Escribano", icon: Laptop },
  { name: "Esteticista", icon: Heart }, { name: "Fletero / Mudanzas", icon: Building },
  { name: "Fonoaudiólogo", icon: Heart }, { name: "Fotógrafo", icon: Laptop },
  { name: "Fumigador / Control de Plagas", icon: Building }, { name: "Gestor del Automotor", icon: Car },
  { name: "Gomería", icon: Car }, { name: "Herrero", icon: Hammer },
  { name: "Herrería de Obra", icon: Hammer }, { name: "Ingeniero", icon: Building },
  { name: "Instalador de Alarmas", icon: Wrench }, { name: "Instalador de Audio para Autos", icon: Car },
  { name: "Instalador de Cámaras de Seguridad", icon: Wrench },
  { name: "Instalador de Durlock / Yesero", icon: Hammer },
  { name: "Instalador de Internet", icon: Laptop }, { name: "Instalador de Paneles Solares", icon: Zap },
  { name: "Instalador de TV", icon: Laptop }, { name: "Jardinero", icon: TreePine },
  { name: "Jardinero / Paisajista", icon: TreePine }, { name: "Kinesiólogo / Fisioterapeuta", icon: Heart },
  { name: "Lavadero de Autos", icon: Car }, { name: "Limpieza de Alfombras", icon: Sparkles },
  { name: "Limpieza de Persianas", icon: Sparkles }, { name: "Limpieza de Tanques de Agua", icon: Sparkles },
  { name: "Limpieza de Tapizados", icon: Sparkles }, { name: "Limpieza y Mantenimiento", icon: Sparkles },
  { name: "Manicurista", icon: Heart }, { name: "Maquillador/a", icon: Heart },
  { name: "Maquillador Profesional", icon: Heart }, { name: "Maquilladora Artística", icon: Heart },
  { name: "Maquilladora Social", icon: Heart }, { name: "Martillero Público", icon: Building },
  { name: "Masajista", icon: Heart }, { name: "Modista/Costurera/Confeccionista a medida/Bordados", icon: Heart },
  { name: "Mecánico", icon: Car }, { name: "Mecánico de Motos", icon: Car },
  { name: "Mensajería", icon: Car }, { name: "Nutricionista", icon: Heart },
  { name: "Organizador Profesional", icon: Sparkles }, { name: "Paseador de Perros", icon: Heart },
  { name: "Pastelero", icon: Sparkles }, { name: "Pedicurista", icon: Heart },
  { name: "Peluquero/a", icon: Heart }, { name: "Peluquero Canino", icon: Heart },
  { name: "Personal Shopper", icon: Sparkles }, { name: "Pintor", icon: Paintbrush },
  { name: "Pintor de Obras", icon: Paintbrush }, { name: "Piscinas / Piletas Colocación", icon: Building },
  { name: "Plomero / Gasista", icon: Flame }, { name: "Podador de Árboles", icon: TreePine },
  { name: "Polarizado de Vidrios", icon: Car }, { name: "Profesor de Apoyo Escolar", icon: Laptop },
  { name: "Profesor de Canto", icon: Laptop }, { name: "Profesor de Danza", icon: Laptop },
  { name: "Profesor de Dibujo y Pintura", icon: Paintbrush }, { name: "Profesor de Física", icon: Laptop },
  { name: "Profesor de Idiomas", icon: Laptop }, { name: "Profesor de Matemáticas", icon: Laptop },
  { name: "Profesor de Música", icon: Laptop }, { name: "Profesor de Música (Guitarra)", icon: Laptop },
  { name: "Profesor de Música (Piano)", icon: Laptop }, { name: "Profesor de Química", icon: Laptop },
  { name: "Profesor de Yoga", icon: Dumbbell }, { name: "Profesor de Pilates", icon: Dumbbell },
  { name: "Profesor Particular", icon: Laptop }, { name: "Profesora de Inglés", icon: Laptop },
  { name: "Psicólogo", icon: Heart }, { name: "Psicopedagogo", icon: Heart },
  { name: "Pulidor de Pisos", icon: Hammer }, { name: "Redactor de Contenidos", icon: Laptop },
  { name: "Remisero", icon: Car }, { name: "Reparación de Celulares", icon: Wrench },
  { name: "Reparación de Computadoras", icon: Laptop }, { name: "Reparación de Electrodomésticos", icon: Wrench },
  { name: "Repostero", icon: Sparkles }, { name: "Servicio Técnico (Línea Blanca)", icon: Wrench },
  { name: "Soldador", icon: Flame }, { name: "Sommelier", icon: Sparkles },
  { name: "Tapicero", icon: Hammer }, { name: "Techista", icon: Building },
  { name: "Técnico de Aire Acondicionado", icon: Wrench }, { name: "Técnico de Celulares", icon: Wrench },
  { name: "Técnico de PC", icon: Laptop }, { name: "Técnico en Calefacción", icon: Flame },
  { name: "Técnico en Energías Renovables", icon: Zap }, { name: "Técnico en Redes", icon: Laptop },
  { name: "Técnico en Refrigeración", icon: Wrench }, { name: "Terapista Ocupacional", icon: Heart },
  { name: "Traductor", icon: Laptop }, { name: "Veterinario", icon: Heart },
  { name: "Vidriería", icon: Hammer },
];

export const EditMyServices = ({ professionalData, onUpdate }: EditMyServicesProps) => {
  const [rubros, setRubros] = useState<SelectedRubro[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSuggestion, setShowSuggestion] = useState(false);
  const [customRubro, setCustomRubro] = useState('');
  const [expandedRubro, setExpandedRubro] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  // Load existing professions
  useEffect(() => {
    const loadProfessions = async () => {
      if (!professionalData?.id) return;
      const { data } = await supabase
        .from('professional_professions')
        .select('profession, is_primary')
        .eq('professional_id', professionalData.id)
        .order('is_primary', { ascending: false });

      if (data && data.length > 0) {
        setRubros(data.map(p => ({ name: p.profession, description: '' })));
      } else if (professionalData?.profession) {
        setRubros([{ name: professionalData.profession, description: '' }]);
      }
    };
    loadProfessions();
  }, [professionalData]);

  const filteredServices = serviceCategories.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    !rubros.some(r => r.name === s.name)
  );

  const addRubro = (name: string) => {
    if (rubros.length >= 3) {
      toast.error('Máximo 3 rubros permitidos');
      return;
    }
    if (rubros.some(r => r.name === name)) return;
    setRubros(prev => [...prev, { name, description: '' }]);
    setSearchTerm('');
    setShowDropdown(false);
    setShowSuggestion(false);
    setCustomRubro('');
  };

  const removeRubro = (name: string) => {
    setRubros(prev => prev.filter(r => r.name !== name));
    if (expandedRubro === name) setExpandedRubro(null);
  };

  const updateDescription = (name: string, description: string) => {
    setRubros(prev => prev.map(r => r.name === name ? { ...r, description } : r));
  };

  const getIcon = (name: string) => {
    const cat = serviceCategories.find(s => s.name === name);
    return cat ? cat.icon : Wrench;
  };

  const handleSave = async () => {
    if (rubros.length === 0) {
      toast.error('Seleccioná al menos un rubro');
      return;
    }
    setSaving(true);
    try {
      // 1. Update legacy profession field
      const { error: profError } = await supabase
        .from('professionals')
        .update({ profession: rubros[0].name })
        .eq('id', professionalData.id);
      if (profError) throw profError;

      // 2. Delete existing professions
      await supabase
        .from('professional_professions')
        .delete()
        .eq('professional_id', professionalData.id);

      // 3. Insert new professions
      const inserts = rubros.map((r, i) => ({
        professional_id: professionalData.id,
        profession: r.name,
        is_primary: i === 0,
      }));
      const { error: insertError } = await supabase
        .from('professional_professions')
        .insert(inserts);
      if (insertError) throw insertError;

      toast.success('¡Rubros actualizados correctamente!');
      onUpdate();
    } catch (err: any) {
      toast.error('Error al guardar: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const noResults = searchTerm.length >= 2 && filteredServices.length === 0;

  return (
    <Card className="rounded-xl shadow-sm border-0 bg-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-bold">Mis Rubros Profesionales</CardTitle>
        <p className="text-sm text-muted-foreground">
          Elegí hasta 3 rubros que mejor representen tus servicios.
        </p>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Pills */}
        {rubros.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {rubros.map((rubro, idx) => {
              const Icon = getIcon(rubro.name);
              return (
                <Badge
                  key={rubro.name}
                  variant="secondary"
                  className="pl-2 pr-1 py-1.5 text-sm font-medium flex items-center gap-1.5 rounded-lg"
                >
                  <Icon className="h-3.5 w-3.5" />
                  {rubro.name}
                  {idx === 0 && (
                    <span className="text-[10px] bg-primary/15 text-primary px-1.5 py-0.5 rounded-full font-semibold ml-1">
                      Principal
                    </span>
                  )}
                  <button
                    onClick={() => removeRubro(rubro.name)}
                    className="ml-1 hover:bg-destructive/20 rounded-full p-0.5 transition-colors"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </Badge>
              );
            })}
          </div>
        )}

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar rubro... (ej: Electricista, Plomero)"
            value={searchTerm}
            onChange={e => { setSearchTerm(e.target.value); setShowDropdown(true); }}
            onFocus={() => setShowDropdown(true)}
            className="pl-9"
            disabled={rubros.length >= 3}
          />
          {rubros.length >= 3 && (
            <p className="text-xs text-muted-foreground mt-1">Máximo de 3 rubros alcanzado.</p>
          )}

          {/* Dropdown */}
          {showDropdown && searchTerm.length >= 1 && filteredServices.length > 0 && (
            <div className="absolute z-20 w-full mt-1 bg-popover border border-border rounded-lg shadow-lg max-h-48 overflow-y-auto">
              {filteredServices.slice(0, 8).map(service => {
                const Icon = service.icon;
                return (
                  <button
                    key={service.name}
                    onClick={() => addRubro(service.name)}
                    className="w-full text-left px-3 py-2 hover:bg-accent flex items-center gap-2 text-sm transition-colors"
                  >
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    {service.name}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Descriptions per rubro */}
        {rubros.length > 0 && (
          <div className="space-y-3">
            {rubros.map(rubro => {
              const Icon = getIcon(rubro.name);
              const isExpanded = expandedRubro === rubro.name;
              return (
                <div key={rubro.name} className="border border-border rounded-lg overflow-hidden">
                  <button
                    onClick={() => setExpandedRubro(isExpanded ? null : rubro.name)}
                    className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">{rubro.name}</span>
                    </div>
                    {isExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                  </button>
                  {isExpanded && (
                    <div className="px-3 pb-3">
                      <Textarea
                        placeholder={`Describí tu experiencia como ${rubro.name}...`}
                        value={rubro.description}
                        onChange={e => updateDescription(rubro.name, e.target.value)}
                        className="min-h-[70px] text-sm resize-none"
                        rows={3}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Suggest new */}
        {noResults && !showSuggestion && (
          <button
            onClick={() => setShowSuggestion(true)}
            className="flex items-center gap-2 text-sm text-primary hover:underline"
          >
            <Lightbulb className="h-4 w-4" />
            ¿No encontrás tu rubro? Sugerirlo aquí
          </button>
        )}

        {showSuggestion && (
          <div className="flex gap-2">
            <Input
              placeholder="Escribí tu rubro personalizado..."
              value={customRubro}
              onChange={e => setCustomRubro(e.target.value)}
              className="flex-1"
            />
            <Button
              size="sm"
              variant="outline"
              disabled={!customRubro.trim() || rubros.length >= 3}
              onClick={() => {
                if (customRubro.trim()) addRubro(customRubro.trim());
              }}
            >
              <Plus className="h-4 w-4 mr-1" />
              Agregar
            </Button>
          </div>
        )}

        {/* Save */}
        <Button
          onClick={handleSave}
          disabled={saving || rubros.length === 0}
          className="w-full font-semibold"
          size="lg"
        >
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Actualizando...
            </>
          ) : (
            'Actualizar Perfil Profesional'
          )}
        </Button>
      </CardContent>
    </Card>
  );
};
