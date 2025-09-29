import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Users, Star, Crown } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface Plan {
  id: string;
  name: string;
  price: number;
  currency: string;
  features: any; // Json type from Supabase
  max_contact_requests: number;
  max_work_photos: number;
  priority_support: boolean;
  advanced_analytics: boolean;
  featured_listing: boolean;
}

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
        .order('price', { ascending: true });

      if (error) throw error;
      setPlans(data || []);
    } catch (error) {
      console.error('Error fetching plans:', error);
      toast.error('Error al cargar los planes');
    } finally {
      setLoading(false);
    }
  };

  const getPlanIcon = (planName: string) => {
    if (planName.includes('Básico')) return <Users className="h-6 w-6 text-blue-500" />;
    if (planName.includes('Profesional')) return <Star className="h-6 w-6 text-primary" />;
    if (planName.includes('Premium')) return <Crown className="h-6 w-6 text-yellow-500" />;
    return <Star className="h-6 w-6 text-primary" />;
  };

  const handlePlanSelect = (planId: string) => {
    if (disabled) return;
    setSelectedPlan(planId);
    if (onPlanSelected) {
      onPlanSelected(planId);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <p>Cargando planes...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Elegí tu Plan</h2>
        <p className="text-muted-foreground">
          Seleccioná el plan que mejor se adapte a tus necesidades
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan, index) => {
          const isSelected = selectedPlan === plan.id;
          const isPopular = plan.name.includes('Profesional');
          
          return (
            <Card 
              key={plan.id}
              className={`relative cursor-pointer transition-all ${
                isSelected 
                  ? 'border-2 border-primary shadow-lg' 
                  : 'border hover:border-primary/50 hover:shadow-md'
              } ${
                isPopular ? 'scale-105' : ''
              } ${
                disabled ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              onClick={() => handlePlanSelect(plan.id)}
            >
              {isPopular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground px-3 py-1">
                    Recomendado
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center pb-4">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                  {getPlanIcon(plan.name)}
                </div>
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <div className="py-4">
                  <div className="text-3xl font-bold text-foreground">
                    ${plan.price.toLocaleString()}
                    <span className="text-base font-normal text-muted-foreground">/{plan.currency}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">por mes</p>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="space-y-2">
                  {Array.isArray(plan.features) ? plan.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-start space-x-2">
                      <Check className="h-4 w-4 text-success flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  )) : null}
                </div>

                {/* Plan limits */}
                <div className="pt-3 border-t space-y-2">
                  <div className="text-xs text-muted-foreground space-y-1">
                    <div className="flex justify-between">
                      <span>Contactos mensuales:</span>
                      <span className="font-medium">
                        {plan.max_contact_requests === -1 ? 'Ilimitados' : plan.max_contact_requests}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Fotos en galería:</span>
                      <span className="font-medium">
                        {plan.max_work_photos === -1 ? 'Ilimitadas' : plan.max_work_photos}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Soporte:</span>
                      <span className="font-medium">
                        {plan.priority_support ? 'Prioritario' : 'Estándar'}
                      </span>
                    </div>
                  </div>
                </div>

                {isSelected && (
                  <div className="pt-2">
                    <Badge variant="default" className="w-full justify-center">
                      Plan Seleccionado
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};