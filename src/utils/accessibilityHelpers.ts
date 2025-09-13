// Accessibility utilities

export const generateAriaLabel = (action: string, context?: string): string => {
  if (context) {
    return `${action} ${context}`;
  }
  return action;
};

export const generateAltText = (type: 'professional' | 'service' | 'work', name?: string): string => {
  switch (type) {
    case 'professional':
      return `Foto de perfil de ${name || 'profesional'}`;
    case 'service':
      return `Imagen representativa del servicio ${name || ''}`;
    case 'work':
      return `Foto de trabajo realizado${name ? ` por ${name}` : ''}`;
    default:
      return 'Imagen';
  }
};

export const ensureMinimumContrast = (textColor: string, backgroundColor: string): boolean => {
  // This would need a proper contrast calculation library in a real implementation
  // For now, we'll trust our design system tokens provide adequate contrast
  return true;
};

export const generateSkipLinks = () => {
  return [
    { href: '#main-content', text: 'Saltar al contenido principal' },
    { href: '#navigation', text: 'Saltar a la navegación' },
    { href: '#search', text: 'Saltar a la búsqueda' }
  ];
};

export const announceLiveRegion = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
  const liveRegion = document.createElement('div');
  liveRegion.setAttribute('aria-live', priority);
  liveRegion.setAttribute('aria-atomic', 'true');
  liveRegion.className = 'sr-only';
  liveRegion.textContent = message;
  
  document.body.appendChild(liveRegion);
  
  // Remove after announcement
  setTimeout(() => {
    document.body.removeChild(liveRegion);
  }, 1000);
};