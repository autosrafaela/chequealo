import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DashboardHeroProps {
  variant?: 'primary' | 'warning' | 'success' | 'danger';
  icon: LucideIcon;
  badge?: string;
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

const variantStyles = {
  primary: 'bg-gradient-to-br from-primary/10 via-primary/5 to-background border-primary/20',
  warning: 'bg-gradient-to-br from-orange-500/15 via-orange-500/5 to-background border-orange-500/30',
  success: 'bg-gradient-to-br from-green-500/15 via-green-500/5 to-background border-green-500/30',
  danger: 'bg-gradient-to-br from-red-500/15 via-red-500/5 to-background border-red-500/30',
};

const iconVariantStyles = {
  primary: 'bg-primary/20 text-primary',
  warning: 'bg-orange-500/20 text-orange-600',
  success: 'bg-green-500/20 text-green-600',
  danger: 'bg-red-500/20 text-red-600',
};

const badgeVariantStyles = {
  primary: 'bg-primary text-primary-foreground',
  warning: 'bg-orange-500 text-white',
  success: 'bg-green-500 text-white',
  danger: 'bg-red-500 text-white',
};

export function DashboardHero({
  variant = 'primary',
  icon: Icon,
  badge,
  title,
  subtitle,
  children,
  actions,
  className,
}: DashboardHeroProps) {
  return (
    <Card className={cn('border-0 shadow-sm rounded-2xl overflow-hidden', variantStyles[variant], className)}>
      <CardContent className="p-6 md:p-8">
        <div className="flex flex-col gap-6">
          {/* Header */}
          <div className="flex items-start gap-4">
            <div className={cn('p-3 rounded-xl shrink-0', iconVariantStyles[variant])}>
              <Icon className="h-8 w-8" />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-2">
                {badge && (
                  <Badge className={cn('text-xs font-semibold', badgeVariantStyles[variant])}>
                    {badge}
                  </Badge>
                )}
              </div>
              
              <h2 className="text-xl md:text-2xl font-bold text-foreground leading-tight">
                {title}
              </h2>
              
              {subtitle && (
                <p className="text-sm md:text-base text-muted-foreground mt-1">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          {/* Content */}
          {children && (
            <div className="space-y-4">
              {children}
            </div>
          )}

          {/* Actions */}
          {actions && (
            <div className="flex flex-col sm:flex-row gap-3">
              {actions}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
