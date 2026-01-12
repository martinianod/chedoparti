/**
 * Utilidad para calcular precios de reservas de manera consistente
 * Usado tanto en ReservationFormModal como en PaymentSection
 */

// Configuración de precios por cancha (mock data)
const COURT_PRICING = {
  1: { hourlyRate: 2500, courtName: 'Cancha Padel 1', sport: 'Padel' },
  2: { hourlyRate: 2500, courtName: 'Cancha Padel 2', sport: 'Padel' },
  3: { hourlyRate: 1800, courtName: 'Cancha Tenis 1', sport: 'Tenis' },
  4: { hourlyRate: 1800, courtName: 'Cancha Tenis 2', sport: 'Tenis' },
  5: { hourlyRate: 1800, courtName: 'Cancha Tenis 3', sport: 'Tenis' },
  6: { hourlyRate: 1600, courtName: 'Cancha Tenis 4', sport: 'Tenis' },
  7: { hourlyRate: 1600, courtName: 'Cancha Tenis 5', sport: 'Tenis' },
};

const DEFAULT_COURT = {
  hourlyRate: 2000,
  courtName: 'Cancha',
  sport: 'Deportes',
};

/**
 * Obtiene la información de precios de una cancha
 * @param {string|number} courtId - ID de la cancha
 * @returns {Object} Información de la cancha con hourlyRate, courtName, sport
 */
export const getCourtPricing = (courtId) => {
  return COURT_PRICING[courtId] || DEFAULT_COURT;
};

/**
 * Convierte duración en formato "HH:mm" a minutos
 * @param {string} duration - Duración en formato "01:30"
 * @returns {number} Duración en minutos
 */
export const durationToMinutes = (duration) => {
  if (!duration || typeof duration !== 'string') {
    return 0;
  }

  const [hours, minutes] = duration.split(':').map(Number);
  const result = (hours || 0) * 60 + (minutes || 0);
  return result;
};

/**
 * Convierte duración en minutos a horas decimales
 * @param {number} minutes - Duración en minutos
 * @returns {number} Duración en horas (decimal)
 */
export const minutesToHours = (minutes) => {
  return minutes / 60;
};

/**
 * Calcula si un horario está en horario premium
 * @param {string} startTime - Hora de inicio en formato "HH:mm"
 * @returns {boolean} True si es horario premium (18:00-22:00)
 */
export const isPremiumTime = (startTime) => {
  if (!startTime) return false;
  const [hours] = startTime.split(':').map(Number);
  return hours >= 18 && hours < 22;
};

/**
 * Calcula el precio total de una reserva
 * @param {Object} params - Parámetros del cálculo
 * @param {string|number} params.courtId - ID de la cancha
 * @param {string} params.startTime - Hora de inicio "HH:mm"
 * @param {string} params.duration - Duración "HH:mm" o número de minutos
 * @param {boolean} params.isMember - Si es socio (aplica descuento)
 * @param {Object} params.options - Opciones adicionales
 * @returns {Object} Resultado con price, breakdown, courtInfo
 */
import { calculateReservationPrice as calculateDynamicPrice, getPricingConfig } from '../services/institutionConfig';

/**
 * Calcula el precio total de una reserva
 * @param {Object} params - Parámetros del cálculo
 * @param {string|number} params.courtId - ID de la cancha
 * @param {string} params.startTime - Hora de inicio "HH:mm"
 * @param {string} params.duration - Duración "HH:mm" o número de minutos
 * @param {string} params.date - Fecha en formato ISO "YYYY-MM-DD" (opcional, default hoy)
 * @param {boolean} params.isMember - Si es socio (aplica descuento)
 * @param {Object} params.options - Opciones adicionales
 * @returns {Object} Resultado con price, breakdown, courtInfo
 */
export const calculateReservationPrice = ({
  courtId,
  startTime,
  duration,
  date = new Date().toISOString().slice(0, 10),
  isMember = false,
  options = {},
}) => {
  // Validaciones básicas
  if (!courtId || !startTime || !duration) {
    return {
      price: 0,
      breakdown: {
        basePrice: 0,
        premiumSurcharge: 0,
        memberDiscount: 0,
        finalPrice: 0,
      },
      courtInfo: DEFAULT_COURT,
    };
  }

  // Obtener información de la cancha (usando configuración dinámica si es posible)
  // Por ahora mantenemos la compatibilidad con COURT_PRICING local para info básica como nombre/deporte
  // pero el precio vendrá de la configuración dinámica
  const courtInfo = getCourtPricing(courtId);

  // Convertir duración a minutos si viene en formato "HH:mm"
  let durationMinutes;
  if (typeof duration === 'string' && duration.includes(':')) {
    durationMinutes = durationToMinutes(duration);
  } else {
    durationMinutes = Number(duration) || 0;
  }

  // Usar el calculador dinámico de institutionConfig
  const dynamicPrice = calculateDynamicPrice({
    courtId,
    sport: courtInfo.sport,
    date,
    time: startTime,
    durationMinutes
  });

  // Aplicar descuento de socio si corresponde (sobre el precio total calculado)
  const memberDiscount = isMember ? dynamicPrice.totalPrice * 0.1 : 0;
  let finalPrice = dynamicPrice.totalPrice - memberDiscount;

  // Redondear a múltiplo de 100 (o valor especificado)
  const roundTo = options.roundTo || 100;
  finalPrice = Math.round(finalPrice / roundTo) * roundTo;

  return {
    price: finalPrice,
    breakdown: {
      basePrice: dynamicPrice.basePrice, // Precio base por hora
      premiumSurcharge: dynamicPrice.totalPrice - (dynamicPrice.basePrice * (durationMinutes / 60)), // Diferencia por horario pico/fin de semana
      memberDiscount: Math.round(memberDiscount),
      finalPrice: finalPrice,
      isPremium: dynamicPrice.isPeakHour,
      isWeekend: dynamicPrice.isWeekend,
      isMember,
      durationHours: dynamicPrice.durationHours,
      details: dynamicPrice.breakdown // Detalles adicionales del calculador dinámico
    },
    courtInfo,
  };
};

/**
 * Calcula duración entre dos horarios
 * @param {string} startTime - Hora inicio "HH:mm"
 * @param {string} endTime - Hora fin "HH:mm"
 * @returns {number} Duración en horas (decimal)
 */
export const calculateDuration = (startTime, endTime) => {
  if (!startTime || !endTime) return 0;

  const start = new Date(`2024-01-01T${startTime}`);
  const end = new Date(`2024-01-01T${endTime}`);
  const diffMs = end.getTime() - start.getTime();

  return Math.max(0, diffMs / (1000 * 60 * 60));
};
