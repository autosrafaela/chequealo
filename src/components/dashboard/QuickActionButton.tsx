import React from 'react';
import { Button } from '@/components/ui/button';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuickActionButtonProps {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  className?: string;
}

export function QuickActionButton({
  icon: Icon,
  label,
  onClick,
  className,
}: QuickActionButtonProps) {
  return (
    <Button 
      variant="ghost" 
      className={cn('justify-start gap-3 w-full h-auto py-3 px-4', className)}
      onClick={onClick}
    >
      <Icon className="h-4 w-4 text-muted-foreground" />
      <span className="text-sm">{label}</span>
    </Button>
  );
}
