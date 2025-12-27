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
        'hover:shadow-lg transition-all duration-200',
        onClick && 'cursor-pointer hover:scale-[1.02] hover:border-primary/30',
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

        {/* Value */}
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

        {/* Context */}
        {context && (
          <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
            {context}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
