import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PlanSelector } from './PlanSelector';
import { useSubscription } from '@/hooks/useSubscription';
import { toast } from 'sonner';

interface PlanSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlanConfirmed: (planId: string) => void;
  currentPlanId?: string;
}

export const PlanSelectionModal: React.FC<PlanSelectionModalProps> = ({
  isOpen,
  onClose,
  onPlanConfirmed,
  currentPlanId
}) => {
  const [selectedPlan, setSelectedPlan] = useState<string>(currentPlanId || '');
  const [saving, setSaving] = useState(false);
  const { updateSelectedPlan, createPaymentPreference } = useSubscription();

  const handleConfirm = async () => {
    if (!selectedPlan) {
      toast.error('Por favor seleccioná un plan');
      return;
    }

    try {
      setSaving(true);
      
      // Update the selected plan in the subscription
      const success = await updateSelectedPlan(selectedPlan);
      
      if (success) {
        onPlanConfirmed(selectedPlan);
        toast.success('Plan seleccionado correctamente');
        onClose();
      }
    } catch (error) {
      console.error('Error confirming plan:', error);
      toast.error('Error al confirmar el plan');
    } finally {
      setSaving(false);
    }
  };

  const handlePayNow = async () => {
    if (!selectedPlan) {
      toast.error('Por favor seleccioná un plan');
      return;
    }

    try {
      setSaving(true);
      
      // Update selected plan and create payment preference
      await updateSelectedPlan(selectedPlan);
      const preference = await createPaymentPreference(selectedPlan);
      
      // If in trial mode (no checkout URL), just close modal
      if (preference && preference.mode === 'trial') {
        onClose();
        return;
      }
      
      // If checkout URL, redirect
      if (preference && (preference.initPoint || preference.checkoutUrl)) {
        window.location.href = preference.initPoint || preference.checkoutUrl;
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      toast.error('Error al procesar el pago');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Seleccionar Plan de Suscripción</DialogTitle>
          <DialogDescription>
            Tu período de prueba está por vencer. Elegí el plan que mejor se adapte a tus necesidades para continuar recibiendo solicitudes.
          </DialogDescription>
        </DialogHeader>

        <div className="py-6">
          <PlanSelector
            onPlanSelected={setSelectedPlan}
            currentPlanId={selectedPlan}
          />
        </div>

        <div className="flex justify-between items-center pt-6 border-t">
          <Button variant="outline" onClick={onClose}>
            Decidir Más Tarde
          </Button>
          
          <div className="space-x-3">
            <Button 
              variant="outline" 
              onClick={handleConfirm}
              disabled={!selectedPlan || saving}
            >
              {saving ? 'Guardando...' : 'Guardar Selección'}
            </Button>
            
            <Button 
              onClick={handlePayNow}
              disabled={!selectedPlan || saving}
              className="bg-primary hover:bg-primary/90"
            >
              {saving ? 'Procesando...' : 'Pagar Ahora'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};