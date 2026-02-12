import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuickActionTileProps {
  icon: LucideIcon;
  label: string;
  description?: string;
  badge?: number | string;
  badgeVariant?: 'default' | 'destructive' | 'secondary';
  iconColor?: string;
  onClick: () => void;
  className?: string;
}

export function QuickActionTile({
  icon: Icon,
  label,
  description,
  badge,
  badgeVariant = 'default',
  iconColor,
  onClick,
  className,
}: QuickActionTileProps) {
  return (
    <Card 
      className={cn(
        'cursor-pointer hover:shadow-lg hover:scale-[1.02] transition-all duration-200 border hover:border-primary/30 relative overflow-hidden group',
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
          'p-2.5 rounded-xl transition-colors',
          iconColor ? `${iconColor.replace('text-', 'bg-').replace('500', '100')} bg-opacity-50` : 'bg-muted group-hover:bg-primary/10'
        )}>
          <Icon className={cn('h-5 w-5 transition-colors', iconColor || 'text-foreground group-hover:text-primary')} />
        </div>
        
        <div>
          <p className="font-semibold text-sm text-foreground">
            {label}
          </p>
          {description && (
            <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
              {description}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
