// Card style definitions for professional share cards

export interface CardStyleConfig {
  name: string;
  description: string;
  gradient: [string, string];
  cardBg: string;
  textColor: string;
  accentColor: string;
  patternType: 'circles' | 'lines' | 'waves' | 'triangles' | 'dots';
}

export const CARD_STYLES: Record<string, CardStyleConfig> = {
  modern: {
    name: 'Moderno',
    description: 'Limpio y minimalista',
    gradient: ['#6366f1', '#8b5cf6'],
    cardBg: '#ffffff',
    textColor: '#1f2937',
    accentColor: '#6366f1',
    patternType: 'circles',
  },
  dark: {
    name: 'Oscuro',
    description: 'Elegante y profesional',
    gradient: ['#1f2937', '#111827'],
    cardBg: '#1f2937',
    textColor: '#ffffff',
    accentColor: '#60a5fa',
    patternType: 'lines',
  },
  nature: {
    name: 'Natural',
    description: 'Fresco y orgánico',
    gradient: ['#059669', '#10b981'],
    cardBg: '#ffffff',
    textColor: '#1f2937',
    accentColor: '#059669',
    patternType: 'waves',
  },
  warm: {
    name: 'Cálido',
    description: 'Amigable y cercano',
    gradient: ['#f59e0b', '#f97316'],
    cardBg: '#ffffff',
    textColor: '#1f2937',
    accentColor: '#f59e0b',
    patternType: 'triangles',
  },
  ocean: {
    name: 'Océano',
    description: 'Tranquilo y confiable',
    gradient: ['#0ea5e9', '#06b6d4'],
    cardBg: '#ffffff',
    textColor: '#1f2937',
    accentColor: '#0ea5e9',
    patternType: 'waves',
  },
  sunset: {
    name: 'Atardecer',
    description: 'Creativo y vibrante',
    gradient: ['#ec4899', '#f43f5e'],
    cardBg: '#ffffff',
    textColor: '#1f2937',
    accentColor: '#ec4899',
    patternType: 'triangles',
  },
  corporate: {
    name: 'Corporativo',
    description: 'Serio y ejecutivo',
    gradient: ['#475569', '#334155'],
    cardBg: '#ffffff',
    textColor: '#1f2937',
    accentColor: '#475569',
    patternType: 'dots',
  },
  tech: {
    name: 'Tech',
    description: 'Innovador y futurista',
    gradient: ['#7c3aed', '#2563eb'],
    cardBg: '#0f172a',
    textColor: '#ffffff',
    accentColor: '#7c3aed',
    patternType: 'lines',
  },
};

// AI-suggested styles based on profession keywords
export const PROFESSION_STYLE_SUGGESTIONS: Record<string, string[]> = {
  // Technical trades
  plomero: ['ocean', 'modern', 'corporate'],
  electricista: ['tech', 'modern', 'warm'],
  gasista: ['warm', 'corporate', 'modern'],
  técnico: ['tech', 'corporate', 'modern'],
  mecanico: ['dark', 'corporate', 'tech'],
  
  // Creative
  pintor: ['sunset', 'nature', 'warm'],
  diseñador: ['sunset', 'tech', 'modern'],
  fotógrafo: ['dark', 'sunset', 'modern'],
  fotografo: ['dark', 'sunset', 'modern'],
  artista: ['sunset', 'warm', 'nature'],
  maquillador: ['sunset', 'warm', 'modern'],
  
  // Nature/outdoors
  jardinero: ['nature', 'warm', 'ocean'],
  paisajista: ['nature', 'ocean', 'modern'],
  fumigador: ['nature', 'corporate', 'modern'],
  
  // Tech/digital
  programador: ['tech', 'dark', 'ocean'],
  desarrollador: ['tech', 'dark', 'modern'],
  web: ['tech', 'modern', 'dark'],
  
  // Services
  limpieza: ['ocean', 'nature', 'modern'],
  mudanza: ['corporate', 'modern', 'warm'],
  cerrajero: ['dark', 'corporate', 'modern'],
  
  // Health/wellness
  masajista: ['nature', 'ocean', 'warm'],
  terapeuta: ['nature', 'ocean', 'modern'],
  nutricionista: ['nature', 'modern', 'warm'],
  
  // Construction
  albañil: ['corporate', 'warm', 'modern'],
  constructor: ['corporate', 'dark', 'modern'],
  arquitecto: ['modern', 'dark', 'tech'],
  
  // Default fallback
  default: ['modern', 'corporate', 'ocean'],
};

export const getStylesForProfession = (profession: string): string[] => {
  const normalizedProfession = profession.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  
  for (const [key, styles] of Object.entries(PROFESSION_STYLE_SUGGESTIONS)) {
    if (normalizedProfession.includes(key)) {
      return styles;
    }
  }
  
  return PROFESSION_STYLE_SUGGESTIONS.default;
};
