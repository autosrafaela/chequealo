import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Building2, CheckCircle, Loader2 } from 'lucide-react';

interface BankingInfoFormProps {
  professionalId: string;
}

export const BankingInfoForm = ({ professionalId }: BankingInfoFormProps) => {
  const [cbuCvu, setCbuCvu] = useState('');
  const [holderName, setHolderName] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasData, setHasData] = useState(false);

  useEffect(() => {
    loadBankingInfo();
  }, [professionalId]);

  const loadBankingInfo = async () => {
    try {
      const { data, error } = await supabase
        .from('professionals')
        .select('cbu_cvu, bank_holder_name')
        .eq('id', professionalId)
        .single();

      if (error) throw error;

      if (data) {
        setCbuCvu(data.cbu_cvu || '');
        setHolderName(data.bank_holder_name || '');
        setHasData(!!data.cbu_cvu);
      }
    } catch (error) {
      console.error('Error loading banking info:', error);
    } finally {
      setLoading(false);
    }
  };

  const validateCbuCvu = (value: string): boolean => {
    // CBU has 22 digits, CVU has 22 digits
    const cleanValue = value.replace(/\s/g, '');
    return /^\d{22}$/.test(cleanValue);
  };

  const handleSave = async () => {
    if (!cbuCvu.trim()) {
      toast.error('Ingresá tu CBU o CVU');
      return;
    }

    if (!validateCbuCvu(cbuCvu)) {
      toast.error('El CBU/CVU debe tener 22 dígitos');
      return;
    }

    if (!holderName.trim()) {
      toast.error('Ingresá el nombre del titular');
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from('professionals')
        .update({
          cbu_cvu: cbuCvu.replace(/\s/g, ''),
          bank_holder_name: holderName.trim()
        })
        .eq('id', professionalId);

      if (error) throw error;

      setHasData(true);
      toast.success('Datos bancarios guardados correctamente');
    } catch (error) {
      console.error('Error saving banking info:', error);
      toast.error('Error al guardar los datos');
    } finally {
      setSaving(false);
    }
  };

  const formatCbuDisplay = (value: string): string => {
    const clean = value.replace(/\D/g, '');
    // Format: XXXX XXXX XXXX XXXX XXXX XX
    return clean.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8 flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Datos Bancarios para Cobros
        </CardTitle>
        <CardDescription>
          Ingresá tu CBU o CVU para recibir los pagos de las reservas de combos.
          Las transferencias se realizan manualmente una vez confirmado el pago.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {hasData && (
          <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 dark:bg-green-950 p-3 rounded-lg">
            <CheckCircle className="h-4 w-4" />
            Datos bancarios configurados
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="cbu_cvu">CBU / CVU</Label>
          <Input
            id="cbu_cvu"
            placeholder="0000 0000 0000 0000 0000 00"
            value={formatCbuDisplay(cbuCvu)}
            onChange={(e) => setCbuCvu(e.target.value.replace(/\D/g, '').slice(0, 22))}
            maxLength={27} // 22 digits + 5 spaces
          />
          <p className="text-xs text-muted-foreground">
            22 dígitos de tu cuenta bancaria o billetera virtual
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="holder_name">Nombre del Titular</Label>
          <Input
            id="holder_name"
            placeholder="Nombre como figura en la cuenta"
            value={holderName}
            onChange={(e) => setHolderName(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Debe coincidir con el titular de la cuenta
          </p>
        </div>

        <Button onClick={handleSave} disabled={saving} className="w-full">
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Guardando...
            </>
          ) : hasData ? (
            'Actualizar datos bancarios'
          ) : (
            'Guardar datos bancarios'
          )}
        </Button>
      </CardContent>
    </Card>
  );
};
