import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Users, Star, Crown, Zap } from "lucide-react";

export interface Plan {
  id: string;
  name: string;
  price: number;
  currency: string;
  features: string[] | any;
  is_recommended?: boolean;
  sort_order?: number;
  max_contact_requests?: number;
  max_work_photos?: number;
  priority_support?: boolean;
  advanced_analytics?: boolean;
  featured_listing?: boolean;
}

interface PricingTableProps {
  plans: Plan[];
  currency?: string;
  recommendedId?: string;
  onPlanSelect?: (planId: string) => void;
  currentPlanId?: string;
  loading?: boolean;
  ctaText?: string;
  showFeatureDetails?: boolean;
}

export const PricingTable: React.FC<PricingTableProps> = ({
  plans,
  currency = 'ARS',
  recommendedId,
  onPlanSelect,
  currentPlanId,
  loading = false,
  ctaText = 'Comenzar',
  showFeatureDetails = true
}) => {
  const [selectedPlan, setSelectedPlan] = useState<string>(currentPlanId || '');

  const getPlanIcon = (planName: string) => {
    const name = planName.toLowerCase();
    if (name.includes('emprendedor')) return <Zap className="h-6 w-6 text-purple-500" />;
    if (name.includes('profesional')) return <Star className="h-6 w-6 text-primary" />;
    if (name.includes('premium')) return <Crown className="h-6 w-6 text-yellow-500" />;
    return <Star className="h-6 w-6 text-primary" />;
  };

  const handlePlanClick = (planId: string) => {
    setSelectedPlan(planId);
    if (onPlanSelect) {
      onPlanSelect(planId);
    }
  };

  const renderFeatures = (plan: Plan) => {
    let features: string[] = [];
    
    if (Array.isArray(plan.features)) {
      features = plan.features;
    } else if (typeof plan.features === 'object') {
      features = Object.values(plan.features);
    }

    return features.map((feature, index) => (
      <div key={index} className="flex items-start space-x-2">
        <Check className="h-4 w-4 text-success flex-shrink-0 mt-0.5" />
        <span className="text-sm">{feature}</span>
      </div>
    ));
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Cargando planes...</p>
      </div>
    );
  }

  if (!plans || plans.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">No hay planes disponibles en este momento.</p>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Reintentar
        </Button>
      </div>
    );
  }

  // Sort plans if not already sorted
  const sortedPlans = [...plans].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));

  return (
    <div className="w-full">
      {/* Desktop: Grid Layout */}
      <div className="hidden md:grid md:grid-cols-3 gap-8 w-full">
        {sortedPlans.map((plan) => {
          const isSelected = selectedPlan === plan.id || currentPlanId === plan.id;
          const isRecommended = plan.is_recommended || plan.id === recommendedId;
          
          return (
            <Card 
              key={plan.id}
              className={`relative cursor-pointer transition-all hover:shadow-lg w-full ${
                isSelected 
                  ? 'border-2 border-primary shadow-lg scale-[1.02]' 
                  : 'border hover:border-primary/50'
              } ${
                isRecommended ? 'lg:scale-105' : ''
              }`}
              onClick={() => handlePlanClick(plan.id)}
            >
              {isRecommended && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
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
                    {plan.price === 0 ? (
                      <span>Gratis</span>
                    ) : (
                      <>
                        ${plan.price.toLocaleString()}
                        <span className="text-base font-normal text-muted-foreground">/{currency}</span>
                      </>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {plan.price === 0 ? 'Para siempre' : 'por mes'}
                  </p>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="space-y-2">
                  {renderFeatures(plan)}
                </div>

                {showFeatureDetails && (
                  <div className="pt-3 border-t space-y-2">
                    <div className="text-xs text-muted-foreground space-y-1">
                      <div className="flex justify-between">
                        <span>Contactos:</span>
                        <span className="font-medium">
                          {(plan.max_contact_requests || 0) === -1 ? 'Ilimitados' : plan.max_contact_requests || 0}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Fotos:</span>
                        <span className="font-medium">
                          {(plan.max_work_photos || 0) === -1 ? 'Ilimitadas' : plan.max_work_photos || 0}
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
                )}

                <Button 
                  className="w-full" 
                  variant={isSelected ? "default" : "outline"}
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePlanClick(plan.id);
                  }}
                >
                  {isSelected ? 'Plan Seleccionado' : ctaText}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Mobile: Carousel/Stack Layout */}
      <div className="md:hidden space-y-6">
        {sortedPlans.map((plan) => {
          const isSelected = selectedPlan === plan.id || currentPlanId === plan.id;
          const isRecommended = plan.is_recommended || plan.id === recommendedId;
          
          return (
            <Card 
              key={plan.id}
              className={`relative cursor-pointer transition-all ${
                isSelected 
                  ? 'border-2 border-primary shadow-lg' 
                  : 'border hover:border-primary/50'
              }`}
              onClick={() => handlePlanClick(plan.id)}
            >
              {isRecommended && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
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
                    {plan.price === 0 ? (
                      <span>Gratis</span>
                    ) : (
                      <>
                        ${plan.price.toLocaleString()}
                        <span className="text-base font-normal text-muted-foreground">/{currency}</span>
                      </>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {plan.price === 0 ? 'Para siempre' : 'por mes'}
                  </p>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="space-y-2">
                  {renderFeatures(plan)}
                </div>

                {showFeatureDetails && (
                  <div className="pt-3 border-t space-y-2">
                    <div className="text-xs text-muted-foreground space-y-1">
                      <div className="flex justify-between">
                        <span>Contactos:</span>
                        <span className="font-medium">
                          {(plan.max_contact_requests || 0) === -1 ? 'Ilimitados' : plan.max_contact_requests || 0}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Fotos:</span>
                        <span className="font-medium">
                          {(plan.max_work_photos || 0) === -1 ? 'Ilimitadas' : plan.max_work_photos || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                <Button 
                  className="w-full" 
                  variant={isSelected ? "default" : "outline"}
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePlanClick(plan.id);
                  }}
                >
                  {isSelected ? 'Plan Seleccionado' : ctaText}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
