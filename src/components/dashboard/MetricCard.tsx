import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MetricCardProps {
  icon: LucideIcon;
  iconColor?: string;
  label: string;
  value: string | number;
  suffix?: string;
  trend?: {
    value: number;
    label?: string;
  };
  badge?: {
    text: string;
    variant?: 'default' | 'secondary' | 'destructive' | 'outline';
  };
  context?: string;
  onClick?: () => void;
  className?: string;
}

export function MetricCard({
  icon: Icon,
  iconColor = 'text-primary',
  label,
  value,
  suffix,
  trend,
  badge,
  context,
  onClick,
  className,
}: MetricCardProps) {
  return (
    <Card 
      className={cn(
        'border-0 shadow-sm rounded-2xl hover:shadow-md transition-all duration-200',
        onClick && 'cursor-pointer hover:scale-[1.02]',
        className
      )}
      onClick={onClick}
    >
      <CardContent className="p-5">
        {/* Header with icon and badge/trend */}
        <div className="flex items-center justify-between mb-3">
          <div className={cn('p-2 rounded-lg bg-muted', iconColor.replace('text-', 'bg-').replace('500', '100'))}>
            <Icon className={cn('h-5 w-5', iconColor)} />
          </div>
          
          <div className="flex items-center gap-2">
            {trend && trend.value !== 0 && (
              <Badge 
                variant={trend.value > 0 ? 'default' : 'secondary'}
                className={cn(
                  'text-xs',
                  trend.value > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                )}
              >
                {trend.value > 0 ? (
                  <TrendingUp className="h-3 w-3 mr-1" />
                ) : (
                  <TrendingDown className="h-3 w-3 mr-1" />
                )}
                {trend.value > 0 ? '+' : ''}{trend.value}%
              </Badge>
            )}
            
            {badge && (
              <Badge variant={badge.variant || 'default'} className="text-xs">
                {badge.text}
              </Badge>
            )}
          </div>
        </div>

        {/* Label */}
        <p className="text-sm font-medium text-muted-foreground mb-1">
          {label}
        </p>

        {/* Value or Empty State */}
        {(value === 0 || value === '0.0') ? (
          <div className="mt-1">
            <svg width="60" height="40" viewBox="0 0 60 40" className="opacity-15">
              <rect x="2" y="24" width="10" height="16" rx="2" fill="currentColor" />
              <rect x="16" y="14" width="10" height="26" rx="2" fill="currentColor" />
              <rect x="30" y="20" width="10" height="20" rx="2" fill="currentColor" />
              <rect x="44" y="8" width="10" height="32" rx="2" fill="currentColor" />
            </svg>
            <p className="text-xs text-muted-foreground italic mt-1">
              Próximamente verás aquí tus estadísticas
            </p>
          </div>
        ) : (
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold text-foreground">
              {value}
            </span>
            {suffix && (
              <span className="text-lg text-muted-foreground">
                {suffix}
              </span>
            )}
          </div>
        )}

        {/* Context */}
        {context && value !== 0 && value !== '0.0' && (
          <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
            {context}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
