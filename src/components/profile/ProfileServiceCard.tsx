import React from 'react';
import { Briefcase } from 'lucide-react';

interface Service {
  id: string;
  service_name: string;
  description?: string | null;
  price_from?: number | null;
  price_to?: number | null;
  price_unit?: string | null;
}

interface ProfileServiceCardProps {
  service: Service;
}

export function ProfileServiceCard({ service }: ProfileServiceCardProps) {
  const formatPrice = (priceFrom: number | null | undefined, priceTo: number | null | undefined) => {
    if (!priceFrom && !priceTo) return 'Consultar';
    if (priceFrom && priceTo) return `$${priceFrom.toLocaleString()} - $${priceTo.toLocaleString()}`;
    if (priceFrom) return `Desde $${priceFrom.toLocaleString()}`;
    if (priceTo) return `Hasta $${priceTo.toLocaleString()}`;
    return 'Consultar';
  };

  return (
    <div className="flex items-center justify-between py-3 px-0 border-b border-border/30 last:border-b-0">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="p-2 bg-primary/10 rounded-full shrink-0">
          <Briefcase className="w-4 h-4 text-primary" />
        </div>
        <div className="min-w-0">
          <p className="font-medium text-foreground truncate">{service.service_name}</p>
          {service.description && (
            <p className="text-xs text-muted-foreground truncate">{service.description}</p>
          )}
        </div>
      </div>
      <span className="text-primary font-bold text-sm whitespace-nowrap ml-3">
        {formatPrice(service.price_from, service.price_to)}
      </span>
    </div>
  );
}
