import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { PricingTable, Plan } from './PricingTable';

interface PlanSelectorProps {
  onPlanSelected?: (planId: string) => void;
  currentPlanId?: string;
  disabled?: boolean;
}

export const PlanSelector: React.FC<PlanSelectorProps> = ({
  onPlanSelected,
  currentPlanId,
  disabled = false
}) => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<string>(currentPlanId || '');

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (error) throw error;
      setPlans(data || []);
    } catch (error) {
      console.error('Error fetching plans:', error);
      toast.error('Error al cargar los planes');
    } finally {
      setLoading(false);
    }
  };

  const handlePlanSelect = (planId: string) => {
    if (disabled) return;
    setSelectedPlan(planId);
    if (onPlanSelected) {
      onPlanSelected(planId);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Elegí tu Plan</h2>
        <p className="text-muted-foreground">
          Seleccioná el plan que mejor se adapte a tus necesidades
        </p>
      </div>

      <PricingTable
        plans={plans}
        currentPlanId={selectedPlan || currentPlanId}
        onPlanSelect={handlePlanSelect}
        loading={loading}
        ctaText="Seleccionar"
        showFeatureDetails={true}
      />
    </div>
  );
};