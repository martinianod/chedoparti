import { parseISO, format, isAfter, isBefore, startOfDay } from 'date-fns';
import { es } from 'date-fns/locale';

/**
 * Group items by date
 * @param {Array} items - Items with date property
 * @returns {Object} Grouped items by date key
 */
export function groupByDate(items) {
  if (!items || !Array.isArray(items)) return {};

  const grouped = {};

  items.forEach((item) => {
    const dateKey = item.date || item.startAt?.split('T')[0];
    if (!dateKey) return;

    if (!grouped[dateKey]) {
      grouped[dateKey] = [];
    }
    grouped[dateKey].push(item);
  });

  // Sort items within each group by time
  Object.keys(grouped).forEach((dateKey) => {
    grouped[dateKey] = sortByTime(grouped[dateKey]);
  });

  return grouped;
}

/**
 * Sort items by time
 * @param {Array} items - Items with time or startAt property
 * @returns {Array} Sorted items
 */
export function sortByTime(items) {
  if (!items || !Array.isArray(items)) return [];

  return [...items].sort((a, b) => {
    const timeA = a.time || a.startAt?.split('T')[1]?.substring(0, 5) || '00:00';
    const timeB = b.time || b.startAt?.split('T')[1]?.substring(0, 5) || '00:00';
    
    return timeA.localeCompare(timeB);
  });
}

/**
 * Format date as group header (e.g., "Domingo 30 Nov")
 * @param {string} dateString - Date in YYYY-MM-DD format
 * @returns {string} Formatted date
 */
export function formatGroupHeader(dateString) {
  try {
    const date = parseISO(dateString);
    return format(date, "EEEE d 'de' MMM", { locale: es });
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString;
  }
}

/**
 * Get the next upcoming reservation/class
 * @param {Array} items - Items with date and time
 * @returns {Object|null} Next item or null
 */
export function getNextReservation(items) {
  if (!items || !Array.isArray(items) || items.length === 0) return null;

  const now = new Date();
  const today = startOfDay(now);

  // Filter future items
  const futureItems = items.filter((item) => {
    try {
      const itemDate = parseISO(item.date || item.startAt?.split('T')[0]);
      const itemTime = item.time || item.startAt?.split('T')[1]?.substring(0, 5) || '00:00';
      
      // Create full datetime
      const [hours, minutes] = itemTime.split(':').map(Number);
      const itemDateTime = new Date(itemDate);
      itemDateTime.setHours(hours, minutes, 0, 0);

      return isAfter(itemDateTime, now);
    } catch (error) {
      return false;
    }
  });

  if (futureItems.length === 0) return null;

  // Sort by datetime and return first
  const sorted = futureItems.sort((a, b) => {
    const dateA = parseISO(a.date || a.startAt?.split('T')[0]);
    const timeA = a.time || a.startAt?.split('T')[1]?.substring(0, 5) || '00:00';
    const [hoursA, minutesA] = timeA.split(':').map(Number);
    dateA.setHours(hoursA, minutesA, 0, 0);

    const dateB = parseISO(b.date || b.startAt?.split('T')[0]);
    const timeB = b.time || b.startAt?.split('T')[1]?.substring(0, 5) || '00:00';
    const [hoursB, minutesB] = timeB.split(':').map(Number);
    dateB.setHours(hoursB, minutesB, 0, 0);

    return dateA - dateB;
  });

  return sorted[0];
}

/**
 * Sort grouped dates chronologically
 * @param {Object} groupedItems - Object with date keys
 * @returns {Array} Array of [dateKey, items] sorted by date
 */
export function sortGroupedDates(groupedItems) {
  if (!groupedItems || typeof groupedItems !== 'object') return [];

  return Object.entries(groupedItems).sort((a, b) => {
    try {
      const dateA = parseISO(a[0]);
      const dateB = parseISO(b[0]);
      return dateA - dateB;
    } catch (error) {
      return 0;
    }
  });
}

/**
 * Filter items by date range
 * @param {Array} items - Items with date property
 * @param {string} startDate - Start date (YYYY-MM-DD)
 * @param {string} endDate - End date (YYYY-MM-DD)
 * @returns {Array} Filtered items
 */
export function filterByDateRange(items, startDate, endDate) {
  if (!items || !Array.isArray(items)) return [];
  if (!startDate || !endDate) return items;

  try {
    const start = parseISO(startDate);
    const end = parseISO(endDate);

    return items.filter((item) => {
      const itemDate = parseISO(item.date || item.startAt?.split('T')[0]);
      return !isBefore(itemDate, start) && !isAfter(itemDate, end);
    });
  } catch (error) {
    console.error('Error filtering by date range:', error);
    return items;
  }
}
