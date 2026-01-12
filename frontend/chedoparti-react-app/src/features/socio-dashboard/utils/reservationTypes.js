import { 
  Calendar, 
  Trophy, 
  Repeat, 
  GraduationCap,
  CircleDot 
} from 'lucide-react';

/**
 * Reservation type constants
 */
export const RESERVATION_TYPES = {
  NORMAL: 'Normal',
  TOURNAMENT: 'Torneo',
  FIXED: 'Fijo',
  CLASS: 'Clase',
};

/**
 * Sport constants
 */
export const SPORTS = {
  PADEL: 'Padel',
  TENIS: 'Tenis',
  FUTBOL: 'Futbol',
};

/**
 * Get color classes for reservation type
 * @param {string} type - Reservation type
 * @returns {object} Color classes for border, bg, and text
 */
export function getTypeColor(type) {
  const colors = {
    [RESERVATION_TYPES.NORMAL]: {
      border: 'border-l-green-500',
      bg: 'bg-green-50 dark:bg-green-900/20',
      text: 'text-green-700 dark:text-green-400',
      badge: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
    },
    [RESERVATION_TYPES.TOURNAMENT]: {
      border: 'border-l-yellow-500',
      bg: 'bg-yellow-50 dark:bg-yellow-900/20',
      text: 'text-yellow-700 dark:text-yellow-400',
      badge: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300',
    },
    [RESERVATION_TYPES.FIXED]: {
      border: 'border-l-blue-500',
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      text: 'text-blue-700 dark:text-blue-400',
      badge: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
    },
    [RESERVATION_TYPES.CLASS]: {
      border: 'border-l-purple-500',
      bg: 'bg-purple-50 dark:bg-purple-900/20',
      text: 'text-purple-700 dark:text-purple-400',
      badge: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300',
    },
  };

  return colors[type] || colors[RESERVATION_TYPES.NORMAL];
}

/**
 * Get icon component for reservation type
 * @param {string} type - Reservation type
 * @returns {React.Component} Icon component
 */
export function getTypeIcon(type) {
  const icons = {
    [RESERVATION_TYPES.NORMAL]: Calendar,
    [RESERVATION_TYPES.TOURNAMENT]: Trophy,
    [RESERVATION_TYPES.FIXED]: Repeat,
    [RESERVATION_TYPES.CLASS]: GraduationCap,
  };

  return icons[type] || Calendar;
}

/**
 * Get icon component for sport
 * @param {string} sport - Sport name
 * @returns {React.Component} Icon component
 */
export function getSportIcon(sport) {
  // Using CircleDot as a generic sport icon
  // In a real app, you'd have specific icons for each sport
  return CircleDot;
}

/**
 * Get display name for sport
 * @param {string} sport - Sport name
 * @returns {string} Display name
 */
export function getSportDisplayName(sport) {
  const names = {
    [SPORTS.PADEL]: '🎾 Pádel',
    [SPORTS.TENIS]: '🎾 Tenis',
    [SPORTS.FUTBOL]: '⚽ Fútbol',
  };

  return names[sport] || sport;
}

/**
 * Get emoji for sport
 * @param {string} sport - Sport name
 * @returns {string} Emoji
 */
export function getSportEmoji(sport) {
  const emojis = {
    [SPORTS.PADEL]: '🎾',
    [SPORTS.TENIS]: '🎾',
    [SPORTS.FUTBOL]: '⚽',
  };

  return emojis[sport] || '🏃';
}
