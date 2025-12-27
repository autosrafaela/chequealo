import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ProfileQuickActionProps {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  variant?: 'default' | 'primary';
}

export function ProfileQuickAction({ 
  icon: Icon, 
  label, 
  onClick,
  variant = 'default' 
}: ProfileQuickActionProps) {
  return (
    <Button
      variant={variant === 'primary' ? 'default' : 'outline'}
      className={`flex flex-col items-center justify-center h-20 gap-2 transition-all hover:scale-105 active:scale-95 ${
        variant === 'primary' 
          ? 'bg-primary text-primary-foreground hover:bg-primary/90' 
          : 'bg-card border-border hover:border-primary/30 hover:shadow-sm'
      }`}
      onClick={onClick}
    >
      <div className={`p-2 rounded-full ${
        variant === 'primary' 
          ? 'bg-primary-foreground/20' 
          : 'bg-primary/10'
      }`}>
        <Icon className={`w-5 h-5 ${
          variant === 'primary' 
            ? 'text-primary-foreground' 
            : 'text-primary'
        }`} />
      </div>
      <span className="text-sm font-medium">{label}</span>
    </Button>
  );
}
