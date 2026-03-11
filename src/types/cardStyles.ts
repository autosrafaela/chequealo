// Card style definitions for professional share cards — Premium redesign

export interface CardStyleConfig {
  name: string;
  description: string;
  bgPrimary: string;
  bgSecondary: string;
  cardBg: string;
  textPrimary: string;
  textSecondary: string;
  accent: string;
  accentLight: string;
  pillBg: string;
  pillText: string;
  qrBg: string;
  separatorColor: string;
}

export const CARD_STYLES: Record<string, CardStyleConfig> = {
  executive: {
    name: 'Ejecutivo',
    description: 'Oscuro y sofisticado',
    bgPrimary: '#0f172a',
    bgSecondary: '#1e293b',
    cardBg: '#0f172a',
    textPrimary: '#f8fafc',
    textSecondary: '#94a3b8',
    accent: '#0ea5e9',
    accentLight: 'rgba(14,165,233,0.15)',
    pillBg: 'rgba(14,165,233,0.12)',
    pillText: '#38bdf8',
    qrBg: '#ffffff',
    separatorColor: 'rgba(148,163,184,0.2)',
  },
  clean: {
    name: 'Limpio',
    description: 'Blanco y minimalista',
    bgPrimary: '#ffffff',
    bgSecondary: '#f1f5f9',
    cardBg: '#ffffff',
    textPrimary: '#0f172a',
    textSecondary: '#64748b',
    accent: '#0ea5e9',
    accentLight: 'rgba(14,165,233,0.08)',
    pillBg: '#f1f5f9',
    pillText: '#334155',
    qrBg: '#0f172a',
    separatorColor: 'rgba(15,23,42,0.08)',
  },
  brand: {
    name: 'Marca',
    description: 'Chequealo brand colors',
    bgPrimary: '#0c4a6e',
    bgSecondary: '#0369a1',
    cardBg: '#0c4a6e',
    textPrimary: '#f0f9ff',
    textSecondary: '#bae6fd',
    accent: '#38bdf8',
    accentLight: 'rgba(56,189,248,0.15)',
    pillBg: 'rgba(56,189,248,0.12)',
    pillText: '#7dd3fc',
    qrBg: '#ffffff',
    separatorColor: 'rgba(186,230,253,0.2)',
  },
};

// AI-suggested styles based on profession keywords
export const PROFESSION_STYLE_SUGGESTIONS: Record<string, string[]> = {
  // Technical
  plomero: ['executive', 'brand', 'clean'],
  electricista: ['executive', 'brand', 'clean'],
  técnico: ['executive', 'brand', 'clean'],
  programador: ['executive', 'clean', 'brand'],
  desarrollador: ['executive', 'clean', 'brand'],

  // Creative
  diseñador: ['clean', 'executive', 'brand'],
  fotógrafo: ['executive', 'clean', 'brand'],
  fotografo: ['executive', 'clean', 'brand'],
  artista: ['clean', 'brand', 'executive'],

  // Services
  jardinero: ['clean', 'brand', 'executive'],
  abogado: ['executive', 'clean', 'brand'],
  contador: ['executive', 'clean', 'brand'],
  gestor: ['executive', 'clean', 'brand'],

  // Default
  default: ['executive', 'clean', 'brand'],
};

export const getStylesForProfession = (
  profession: string,
  professions?: { profession: string; is_primary?: boolean }[]
): string[] => {
  if (professions && professions.length > 0) {
    const primary = professions.find(p => p.is_primary)?.profession || professions[0].profession;
    const matched = findStylesForText(primary);
    if (matched.length > 0) return matched;
  }

  const matched = findStylesForText(profession);
  if (matched.length > 0) return matched;

  return PROFESSION_STYLE_SUGGESTIONS.default;
};

const findStylesForText = (text: string): string[] => {
  if (!text) return [];
  const normalized = text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  for (const [key, styles] of Object.entries(PROFESSION_STYLE_SUGGESTIONS)) {
    if (key !== 'default' && normalized.includes(key)) {
      return styles;
    }
  }
  return [];
};
