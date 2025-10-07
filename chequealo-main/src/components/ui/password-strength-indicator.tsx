import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle } from "lucide-react";
import { validatePassword, getStrengthColor, getStrengthLabel } from "@/utils/passwordValidation";
import { cn } from "@/lib/utils";

interface PasswordStrengthIndicatorProps {
  password: string;
  className?: string;
}

export const PasswordStrengthIndicator = ({ 
  password, 
  className 
}: PasswordStrengthIndicatorProps) => {
  const strength = validatePassword(password);
  
  if (!password) return null;
  
  const progressValue = (strength.score / 4) * 100;
  const strengthLabel = getStrengthLabel(strength.score);
  
  // Define color classes based on strength score
  const getProgressColorClass = (score: number) => {
    switch (score) {
      case 0:
      case 1:
        return "bg-destructive";
      case 2:
        return "bg-warning";
      case 3:
        return "bg-primary";
      case 4:
        return "bg-success";
      default:
        return "bg-muted";
    }
  };
  
  const getBadgeVariant = (score: number) => {
    if (score >= 3) return "default";
    if (score >= 2) return "secondary";
    return "destructive";
  };
  
  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center gap-2">
        <div className="flex-1 relative">
          <Progress 
            value={progressValue} 
            className="h-2"
          />
          {/* Custom indicator overlay for dynamic colors */}
          <div 
            className={cn(
              "absolute top-0 left-0 h-2 transition-all duration-300 rounded-full",
              getProgressColorClass(strength.score)
            )}
            style={{ width: `${progressValue}%` }}
          />
        </div>
        <Badge 
          variant={getBadgeVariant(strength.score)}
          className="text-xs"
        >
          {strengthLabel}
        </Badge>
      </div>
      
      {strength.feedback.length > 0 && (
        <div className="space-y-1">
          {strength.feedback.map((message, index) => (
            <div 
              key={index}
              className="flex items-center gap-2 text-xs text-muted-foreground"
            >
              {strength.isValid ? (
                <CheckCircle className="h-3 w-3 text-success" />
              ) : (
                <AlertCircle className="h-3 w-3 text-warning" />
              )}
              <span>{message}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};