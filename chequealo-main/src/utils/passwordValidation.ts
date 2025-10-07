export interface PasswordStrength {
  score: number; // 0-4 (weak to strong)
  feedback: string[];
  isValid: boolean;
}

export const validatePassword = (password: string): PasswordStrength => {
  const feedback: string[] = [];
  let score = 0;
  
  // Longitud mínima
  if (password.length < 8) {
    feedback.push('Debe tener al menos 8 caracteres');
  } else {
    score += 1;
  }
  
  // Contiene mayúsculas
  if (!/[A-Z]/.test(password)) {
    feedback.push('Debe contener al menos una mayúscula');
  } else {
    score += 1;
  }
  
  // Contiene minúsculas
  if (!/[a-z]/.test(password)) {
    feedback.push('Debe contener al menos una minúscula');
  } else {
    score += 1;
  }
  
  // Contiene números
  if (!/\d/.test(password)) {
    feedback.push('Debe contener al menos un número');
  } else {
    score += 1;
  }
  
  // Contiene símbolos especiales
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    feedback.push('Debe contener al menos un símbolo especial (!@#$%^&*...)');
  } else {
    score += 1;
  }
  
  // Bonus por longitud extra
  if (password.length >= 12) {
    score += 1;
  }
  
  const strengthLevels = [
    'Muy débil',
    'Débil', 
    'Regular',
    'Buena',
    'Muy fuerte'
  ];
  
  const finalScore = Math.min(4, score);
  const isValid = finalScore >= 3; // Requiere al menos "Buena" fortaleza
  
  return {
    score: finalScore,
    feedback,
    isValid
  };
};

export const getStrengthColor = (score: number): string => {
  switch (score) {
    case 0:
    case 1:
      return 'destructive';
    case 2:
      return 'warning';
    case 3:
      return 'primary';
    case 4:
      return 'success';
    default:
      return 'muted';
  }
};

export const getStrengthLabel = (score: number): string => {
  const labels = ['Muy débil', 'Débil', 'Regular', 'Buena', 'Muy fuerte'];
  return labels[score] || 'Sin evaluar';
};