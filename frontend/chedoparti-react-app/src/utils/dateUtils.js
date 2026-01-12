/**
 * Utilidades para manejo de fechas en zona horaria de Argentina
 * Timezone: America/Argentina/Buenos_Aires (UTC-3)
 * 
 * @module dateUtils
 * @description Funciones para manejo consistente de fechas en timezone de Argentina,
 * evitando problemas comunes de conversión de zonas horarias en aplicaciones web.
 */

const ARGENTINA_TIMEZONE = 'America/Argentina/Buenos_Aires';

/**
 * Obtiene la fecha actual en Argentina como string YYYY-MM-DD
 * @returns {string} Fecha en formato YYYY-MM-DD
 * @example
 * getArgentinaDate() // '2025-12-01'
 */
export function getArgentinaDate() {
  const now = new Date();
  
  // Convertir a zona horaria de Argentina
  const argDate = new Date(now.toLocaleString('en-US', { timeZone: ARGENTINA_TIMEZONE }));
  
  const year = argDate.getFullYear();
  const month = String(argDate.getMonth() + 1).padStart(2, '0');
  const day = String(argDate.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
}

/**
 * Obtiene la fecha y hora actual en Argentina como ISO string
 * @returns {string} DateTime en formato ISO
 * @example
 * getArgentinaDateTime() // '2025-12-01T12:30:00.000Z'
 */
export function getArgentinaDateTime() {
  const now = new Date();
  
  // Convertir a zona horaria de Argentina
  const argDate = new Date(now.toLocaleString('en-US', { timeZone: ARGENTINA_TIMEZONE }));
  
  return argDate.toISOString();
}

/**
 * Normaliza cualquier fecha a zona horaria de Argentina
 * Útil para asegurar consistencia en fechas recibidas del backend o inputs
 * @param {Date|string} date - Fecha a normalizar
 * @returns {Date} Objeto Date normalizado a Argentina timezone
 * @example
 * normalizeToArgentinaTimezone('2025-12-01T15:00:00Z') // Date object en Argentina TZ
 */
export function normalizeToArgentinaTimezone(date) {
  if (!date) return new Date();
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  // Convertir a zona horaria de Argentina
  return new Date(dateObj.toLocaleString('en-US', { timeZone: ARGENTINA_TIMEZONE }));
}

/**
 * Formatea una fecha para usar en inputs HTML de tipo date
 * @param {Date|string} date - Fecha a formatear
 * @returns {string} Fecha en formato YYYY-MM-DD
 * @example
 * formatDateForInput(new Date()) // '2025-12-01'
 */
export function formatDateForInput(date) {
  if (!date) return getArgentinaDate();
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  // Convertir a zona horaria de Argentina
  const argDate = new Date(dateObj.toLocaleString('en-US', { timeZone: ARGENTINA_TIMEZONE }));
  
  const year = argDate.getFullYear();
  const month = String(argDate.getMonth() + 1).padStart(2, '0');
  const day = String(argDate.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
}

/**
 * Formatea una fecha para usar en inputs HTML de tipo datetime-local
 * @param {Date|string} date - Fecha a formatear
 * @returns {string} Fecha en formato YYYY-MM-DDTHH:mm
 * @example
 * getArgentinaDateTimeForInput(new Date()) // '2025-12-01T12:30'
 */
export function getArgentinaDateTimeForInput(date) {
  if (!date) {
    const now = normalizeToArgentinaTimezone(new Date());
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }
  
  const argDate = normalizeToArgentinaTimezone(date);
  const year = argDate.getFullYear();
  const month = String(argDate.getMonth() + 1).padStart(2, '0');
  const day = String(argDate.getDate()).padStart(2, '0');
  const hours = String(argDate.getHours()).padStart(2, '0');
  const minutes = String(argDate.getMinutes()).padStart(2, '0');
  
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

/**
 * Parsea un string ISO a zona horaria de Argentina de forma segura
 * @param {string} isoString - String ISO a parsear
 * @returns {Date} Objeto Date en Argentina timezone
 * @example
 * parseISOToArgentina('2025-12-01T15:00:00Z') // Date object en Argentina TZ
 */
export function parseISOToArgentina(isoString) {
  if (!isoString) return new Date();
  
  const date = new Date(isoString);
  return normalizeToArgentinaTimezone(date);
}

/**
 * Parsea un string de fecha en zona horaria de Argentina
 * @param {string} dateString - Fecha en formato YYYY-MM-DD
 * @returns {Date} Objeto Date
 * @example
 * parseArgentinaDate('2025-12-01') // Date object
 */
export function parseArgentinaDate(dateString) {
  if (!dateString) return new Date();
  
  // Crear fecha a medianoche en Argentina
  const [year, month, day] = dateString.split('-').map(Number);
  
  // Crear fecha en UTC y luego ajustar a Argentina
  const date = new Date(Date.UTC(year, month - 1, day, 3, 0, 0)); // UTC+3 para Argentina (UTC-3)
  
  return date;
}

/**
 * Suma o resta días a una fecha manteniendo la zona horaria de Argentina
 * @param {string} dateString - Fecha en formato YYYY-MM-DD
 * @param {number} days - Número de días a sumar (negativo para restar)
 * @returns {string} Nueva fecha en formato YYYY-MM-DD
 * @example
 * addDaysArgentina('2025-12-01', 1) // '2025-12-02'
 * addDaysArgentina('2025-12-01', -1) // '2025-11-30'
 */
export function addDaysArgentina(dateString, days) {
  const date = parseArgentinaDate(dateString);
  
  // Convertir a zona horaria de Argentina
  const argDate = new Date(date.toLocaleString('en-US', { timeZone: ARGENTINA_TIMEZONE }));
  
  argDate.setDate(argDate.getDate() + days);
  
  const year = argDate.getFullYear();
  const month = String(argDate.getMonth() + 1).padStart(2, '0');
  const day = String(argDate.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
}

/**
 * Formatea una fecha para mostrar al usuario en español
 * @param {string} dateString - Fecha en formato YYYY-MM-DD
 * @returns {string} Fecha formateada
 * @example
 * formatArgentinaDateDisplay('2025-12-01') // 'domingo, 1 de diciembre de 2025'
 */
export function formatArgentinaDateDisplay(dateString) {
  if (!dateString) return '';
  
  const date = parseArgentinaDate(dateString);
  
  return date.toLocaleDateString('es-AR', {
    timeZone: ARGENTINA_TIMEZONE,
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Verifica si una fecha es hoy en Argentina timezone
 * @param {string} dateString - Fecha en formato YYYY-MM-DD
 * @returns {boolean} True si es hoy
 * @example
 * isToday('2025-12-01') // true (si hoy es 2025-12-01 en Argentina)
 */
export function isToday(dateString) {
  return dateString === getArgentinaDate();
}

/**
 * Verifica si una fecha es futura en Argentina timezone
 * @param {string} dateString - Fecha en formato YYYY-MM-DD
 * @returns {boolean} True si es futura
 * @example
 * isFuture('2025-12-02') // true (si hoy es 2025-12-01)
 */
export function isFuture(dateString) {
  return dateString > getArgentinaDate();
}

/**
 * Verifica si una fecha es pasada en Argentina timezone
 * @param {string} dateString - Fecha en formato YYYY-MM-DD
 * @returns {boolean} True si es pasada
 * @example
 * isPast('2025-11-30') // true (si hoy es 2025-12-01)
 */
export function isPast(dateString) {
  return dateString < getArgentinaDate();
}

/**
 * Compara dos fechas y retorna la diferencia en días
 * @param {string} date1 - Primera fecha en formato YYYY-MM-DD
 * @param {string} date2 - Segunda fecha en formato YYYY-MM-DD
 * @returns {number} Diferencia en días (positivo si date1 > date2)
 * @example
 * getDaysDifference('2025-12-05', '2025-12-01') // 4
 */
export function getDaysDifference(date1, date2) {
  const d1 = parseArgentinaDate(date1);
  const d2 = parseArgentinaDate(date2);
  const diffTime = d1.getTime() - d2.getTime();
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Obtiene el nombre del día de la semana en español
 * @param {string} dateString - Fecha en formato YYYY-MM-DD
 * @returns {string} Nombre del día en español
 * @example
 * getDayName('2025-12-01') // 'Lunes'
 */
export function getDayName(dateString) {
  const date = parseArgentinaDate(dateString);
  return date.toLocaleDateString('es-AR', {
    timeZone: ARGENTINA_TIMEZONE,
    weekday: 'long',
  });
}

/**
 * Formatea una fecha en formato corto (DD/MM/YYYY)
 * @param {string} dateString - Fecha en formato YYYY-MM-DD
 * @returns {string} Fecha en formato DD/MM/YYYY
 * @example
 * formatShortDate('2025-12-01') // '01/12/2025'
 */
export function formatShortDate(dateString) {
  if (!dateString) return '';
  
  const [year, month, day] = dateString.split('-');
  return `${day}/${month}/${year}`;
}
