import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuickActionTileProps {
  icon: LucideIcon;
  label: string;
  description?: string;
  subtitle?: string;
  badge?: number | string;
  badgeVariant?: 'default' | 'destructive' | 'secondary';
  iconColor?: string;
  iconBg?: string;
  onClick: () => void;
  className?: string;
}

export function QuickActionTile({
  icon: Icon,
  label,
  description,
  subtitle,
  badge,
  badgeVariant = 'default',
  iconColor,
  iconBg,
  onClick,
  className,
}: QuickActionTileProps) {
  return (
    <Card 
      className={cn(
        'cursor-pointer border-0 shadow-sm rounded-2xl hover:shadow-md hover:scale-[1.02] transition-all duration-200 relative overflow-hidden group',
        className
      )}
      onClick={onClick}
    >
      {badge !== undefined && badge !== 0 && (
        <Badge 
          variant={badgeVariant}
          className="absolute -top-1 -right-1 min-w-[22px] h-[22px] flex items-center justify-center text-xs font-bold rounded-full z-10"
        >
          {badge}
        </Badge>
      )}
      
      <CardContent className="p-4 flex flex-col items-center text-center gap-2.5">
        <div className={cn(
          'p-3 rounded-full transition-colors',
          iconBg || 'bg-muted group-hover:bg-primary/10'
        )}>
          <Icon className={cn('h-6 w-6 transition-colors', iconColor || 'text-foreground group-hover:text-primary')} />
        </div>
        
        <div>
          <p className="font-semibold text-sm text-foreground leading-tight">
            {label}
          </p>
          {description && (
            <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
              {description}
            </p>
          )}
          {subtitle && (
            <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-2 leading-tight">
              {subtitle}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
