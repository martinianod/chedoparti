import React from 'react';

/**
 * Level Badge Component
 * Displays a color-coded badge for student skill level
 */
const LEVEL_STYLES = {
  Beginner: {
    bg: 'bg-green-100 dark:bg-green-900/30',
    text: 'text-green-800 dark:text-green-300',
    label: 'Principiante',
  },
  Intermediate: {
    bg: 'bg-blue-100 dark:bg-blue-900/30',
    text: 'text-blue-800 dark:text-blue-300',
    label: 'Intermedio',
  },
  Advanced: {
    bg: 'bg-purple-100 dark:bg-purple-900/30',
    text: 'text-purple-800 dark:text-purple-300',
    label: 'Avanzado',
  },
  Pro: {
    bg: 'bg-gold/20 dark:bg-gold/30',
    text: 'text-navy dark:text-gold',
    label: 'Profesional',
  },
};

export default function LevelBadge({ level, className = '' }) {
  const style = LEVEL_STYLES[level] || LEVEL_STYLES.Beginner;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${style.bg} ${style.text} ${className}`}
    >
      {style.label}
    </span>
  );
}
