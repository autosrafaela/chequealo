export interface ProfileCompletionCheck {
  id: string;
  label: string;
  weight: number;
  completed: boolean;
  action?: string;
}

export function calculateProfileCompletion(profile: {
  image_url?: string | null;
  description?: string | null;
  phone?: string | null;
  location?: string | null;
  latitude?: number | null;
  longitude?: number | null;
}, counts: {
  servicesCount?: number;
  workPhotosCount?: number;
  availabilityCount?: number;
}): number {
  const checks = [
    { weight: 15, completed: !!profile.image_url },
    { weight: 15, completed: !!profile.description && profile.description.length > 50 },
    { weight: 10, completed: !!profile.phone },
    { weight: 15, completed: !!profile.location && !!profile.latitude && !!profile.longitude },
    { weight: 20, completed: (counts.servicesCount || 0) >= 1 },
    { weight: 15, completed: (counts.workPhotosCount || 0) >= 3 },
    { weight: 10, completed: (counts.availabilityCount || 0) > 0 },
  ];

  return checks.reduce((acc, check) => acc + (check.completed ? check.weight : 0), 0);
}

export function calculateDaysSinceLastLogin(lastSeen?: string | null): number {
  if (!lastSeen) return 0;
  
  const lastSeenDate = new Date(lastSeen);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - lastSeenDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
}

export function getVisitsContext(visits: number, benchmark: number = 50): string {
  if (visits > benchmark * 1.2) {
    return '🏆 Estás en el top 20% de tu categoría';
  } else if (visits > benchmark) {
    return '👍 Por encima del promedio';
  } else if (visits > benchmark * 0.5) {
    return '📊 Cerca del promedio de tu categoría';
  } else {
    return '💡 Activá "Estoy en la zona" para mejorar';
  }
}

export function getContactsContext(current: number, lastMonth: number): string {
  if (lastMonth === 0) {
    if (current > 0) {
      return `🎉 ¡Primeras solicitudes recibidas!`;
    }
    return '💡 Completá tu perfil para recibir solicitudes';
  }
  
  if (current > lastMonth) {
    const increase = Math.round(((current - lastMonth) / lastMonth) * 100);
    return `↗️ +${increase}% vs mes pasado`;
  } else if (current < lastMonth) {
    const decrease = Math.round(((lastMonth - current) / lastMonth) * 100);
    return `↘️ -${decrease}% vs mes pasado`;
  } else {
    return '➡️ Igual que el mes pasado';
  }
}

export function getMissingProfileSteps(profile: {
  image_url?: string | null;
  description?: string | null;
  phone?: string | null;
  location?: string | null;
  latitude?: number | null;
  longitude?: number | null;
}, counts: {
  servicesCount?: number;
  workPhotosCount?: number;
  availabilityCount?: number;
}) {
  const steps = [
    {
      id: 'photo',
      label: 'Agregar foto de perfil',
      completed: !!profile.image_url,
      priority: 1,
    },
    {
      id: 'description',
      label: 'Escribir descripción profesional',
      completed: !!profile.description && profile.description.length > 50,
      priority: 2,
    },
    {
      id: 'services',
      label: 'Agregar al menos 1 servicio',
      completed: (counts.servicesCount || 0) >= 1,
      priority: 3,
    },
    {
      id: 'location',
      label: 'Configurar ubicación',
      completed: !!profile.location && !!profile.latitude && !!profile.longitude,
      priority: 4,
    },
    {
      id: 'phone',
      label: 'Agregar teléfono de contacto',
      completed: !!profile.phone,
      priority: 5,
    },
    {
      id: 'portfolio',
      label: 'Subir 3 fotos de trabajos',
      completed: (counts.workPhotosCount || 0) >= 3,
      priority: 6,
    },
    {
      id: 'availability',
      label: 'Configurar disponibilidad',
      completed: (counts.availabilityCount || 0) > 0,
      priority: 7,
    },
  ];

  return steps.sort((a, b) => a.priority - b.priority);
}
