import { parseISO, format, formatDistanceToNow, differenceInMinutes, differenceInHours, differenceInDays } from 'date-fns';
import { es } from 'date-fns/locale';

/**
 * Format date in Spanish (e.g., "Lunes 1 de Diciembre")
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted date
 */
export function formatSpanishDate(date) {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return format(dateObj, "EEEE d 'de' MMMM", { locale: es });
  } catch (error) {
    console.error('Error formatting Spanish date:', error);
    return '';
  }
}

/**
 * Format date short (e.g., "Lun 1 Dic")
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted date
 */
export function formatShortDate(date) {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return format(dateObj, 'EEE d MMM', { locale: es });
  } catch (error) {
    console.error('Error formatting short date:', error);
    return '';
  }
}

/**
 * Format time (e.g., "14:30")
 * @param {string} time - Time in HH:MM format or ISO datetime
 * @returns {string} Formatted time
 */
export function formatTime(time) {
  if (!time) return '';
  
  // If it's an ISO datetime, extract time
  if (time.includes('T')) {
    return time.split('T')[1].substring(0, 5);
  }
  
  return time.substring(0, 5);
}

/**
 * Format relative time (e.g., "en 2 horas", "hace 3 días")
 * @param {string|Date} date - Date to format
 * @returns {string} Relative time
 */
export function formatRelativeTime(date) {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return formatDistanceToNow(dateObj, { addSuffix: true, locale: es });
  } catch (error) {
    console.error('Error formatting relative time:', error);
    return '';
  }
}

/**
 * Format countdown to a specific date/time
 * @param {string} date - Date in YYYY-MM-DD format
 * @param {string} time - Time in HH:MM format
 * @returns {string} Countdown string (e.g., "2h 30m", "En 3 días")
 */
export function formatCountdown(date, time) {
  try {
    const targetDate = parseISO(date);
    const [hours, minutes] = (time || '00:00').split(':').map(Number);
    targetDate.setHours(hours, minutes, 0, 0);

    const now = new Date();
    const diffMinutes = differenceInMinutes(targetDate, now);

    if (diffMinutes < 0) {
      return 'Ya pasó';
    }

    if (diffMinutes < 60) {
      return `En ${diffMinutes}m`;
    }

    const diffHours = differenceInHours(targetDate, now);
    if (diffHours < 24) {
      const remainingMinutes = diffMinutes % 60;
      return `En ${diffHours}h ${remainingMinutes}m`;
    }

    const diffDays = differenceInDays(targetDate, now);
    if (diffDays === 1) {
      return 'Mañana';
    }

    return `En ${diffDays} días`;
  } catch (error) {
    console.error('Error formatting countdown:', error);
    return '';
  }
}

/**
 * Format duration (e.g., "1h 30m")
 * @param {string|number} duration - Duration in "HH:MM" format or minutes
 * @returns {string} Formatted duration
 */
export function formatDuration(duration) {
  if (!duration) return '';

  let totalMinutes;
  
  if (typeof duration === 'string') {
    const [hours, minutes] = duration.split(':').map(Number);
    totalMinutes = hours * 60 + minutes;
  } else {
    totalMinutes = duration;
  }

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours === 0) {
    return `${minutes}m`;
  }

  if (minutes === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${minutes}m`;
}

/**
 * Get time of day greeting
 * @returns {string} Greeting (Buenos días, Buenas tardes, Buenas noches)
 */
export function getTimeOfDayGreeting() {
  const hour = new Date().getHours();

  if (hour < 12) {
    return 'Buenos días';
  } else if (hour < 20) {
    return 'Buenas tardes';
  } else {
    return 'Buenas noches';
  }
}
