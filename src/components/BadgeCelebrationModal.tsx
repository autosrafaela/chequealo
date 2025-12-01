import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Trophy } from 'lucide-react';

interface BadgeCelebrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  badge: {
    name: string;
    description: string;
    icon: string;
    points: number;
    rarity: string;
  };
}

export const BadgeCelebrationModal: React.FC<BadgeCelebrationModalProps> = ({
  isOpen,
  onClose,
  badge,
}) => {
  useEffect(() => {
    if (isOpen) {
      // Confetti explosion when modal opens
      const duration = 3000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

      const randomInRange = (min: number, max: number) => {
        return Math.random() * (max - min) + min;
      };

      const interval = setInterval(() => {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);

        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        });
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        });
      }, 250);

      // Auto close after 5 seconds
      const timer = setTimeout(() => {
        onClose();
      }, 5000);

      return () => {
        clearInterval(interval);
        clearTimeout(timer);
      };
    }
  }, [isOpen, onClose]);

  const getRarityColor = (rarity: string) => {
    const colors = {
      common: 'bg-gray-100 text-gray-700 border-gray-300',
      rare: 'bg-blue-100 text-blue-700 border-blue-300',
      epic: 'bg-purple-100 text-purple-700 border-purple-300',
      legendary: 'bg-yellow-100 text-yellow-700 border-yellow-300',
    };
    return colors[rarity as keyof typeof colors] || colors.common;
  };

  const getRarityLabel = (rarity: string) => {
    const labels = {
      common: 'Común',
      rare: 'Raro',
      epic: 'Épico',
      legendary: 'Legendario',
    };
    return labels[rarity as keyof typeof labels] || 'Común';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md border-2 border-yellow-400 bg-gradient-to-br from-yellow-50 to-orange-50">
        <div className="flex flex-col items-center justify-center space-y-6 py-8 animate-scale-in">
          {/* Trophy Icon */}
          <div className="relative">
            <Trophy className="h-20 w-20 text-yellow-600 animate-bounce" />
            <Sparkles className="absolute -top-2 -right-2 h-8 w-8 text-yellow-500 animate-pulse" />
          </div>

          {/* Badge Icon */}
          <div className="text-8xl animate-scale-in">
            {badge.icon}
          </div>

          {/* Title */}
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold text-foreground animate-fade-in">
              ¡Insignia Desbloqueada!
            </h2>
            <Badge
              variant="outline"
              className={`text-sm ${getRarityColor(badge.rarity)}`}
            >
              {getRarityLabel(badge.rarity)}
            </Badge>
          </div>

          {/* Badge Details */}
          <div className="text-center space-y-2 animate-fade-in">
            <h3 className="text-2xl font-bold text-foreground">
              {badge.name}
            </h3>
            <p className="text-muted-foreground">
              {badge.description}
            </p>
          </div>

          {/* Points */}
          <div className="flex items-center gap-2 text-2xl font-bold text-primary animate-fade-in">
            <Sparkles className="h-6 w-6" />
            +{badge.points} puntos
          </div>

          {/* Celebration Text */}
          <p className="text-center text-sm text-muted-foreground animate-fade-in">
            ¡Sigue completando tu perfil para desbloquear más insignias!
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
