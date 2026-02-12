/**
 * Deterministic avatar color based on name hash.
 * Each name always gets the same color.
 */
const avatarColors = [
  'bg-blue-500',
  'bg-green-500',
  'bg-purple-500',
  'bg-orange-500',
  'bg-pink-500',
  'bg-teal-500',
  'bg-red-500',
  'bg-indigo-500',
  'bg-amber-500',
  'bg-cyan-500',
];

const avatarTextColors = [
  'text-blue-50',
  'text-green-50',
  'text-purple-50',
  'text-orange-50',
  'text-pink-50',
  'text-teal-50',
  'text-red-50',
  'text-indigo-50',
  'text-amber-50',
  'text-cyan-50',
];

export const getAvatarColor = (name: string): string => {
  if (!name) return avatarColors[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return avatarColors[Math.abs(hash) % avatarColors.length];
};

export const getAvatarTextColor = (name: string): string => {
  if (!name) return avatarTextColors[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return avatarTextColors[Math.abs(hash) % avatarTextColors.length];
};
