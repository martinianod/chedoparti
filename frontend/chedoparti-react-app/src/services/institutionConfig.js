/**
 * Servicio central de configuración de la institución
 * Maneja horarios de apertura/cierre, precios y disponibilidad
 */

// Configuración de horarios de la institución por defecto
// Soporta múltiples franjas por día y formato legacy simple
const DEFAULT_INSTITUTION_SCHEDULE = {
  lunes: {
    enabled: true,
    ranges: [{ openTime: '08:00', closeTime: '23:00' }],
  },
  martes: {
    enabled: true,
    ranges: [{ openTime: '08:00', closeTime: '23:00' }],
  },
  miercoles: {
    enabled: true,
    ranges: [{ openTime: '08:00', closeTime: '23:00' }],
  },
  jueves: {
    enabled: true,
    ranges: [{ openTime: '08:00', closeTime: '23:00' }],
  },
  viernes: {
    enabled: true,
    ranges: [
      { openTime: '08:00', closeTime: '12:00' },
      { openTime: '14:00', closeTime: '23:00' },
    ],
  },
  sabado: {
    enabled: true,
    ranges: [{ openTime: '09:00', closeTime: '22:00' }],
  },
  domingo: {
    enabled: true,
    ranges: [{ openTime: '09:00', closeTime: '21:00' }],
  },
};

// Configuración de precios por cancha y horarios
const DEFAULT_PRICING_CONFIG = {
  // Configuración global por deporte
  sports: {
    Padel: {
      basePrice: 2500,
      peakHourMultiplier: 1.3, // 30% más caro en horas pico
      weekendMultiplier: 1.2, // 20% más caro en fin de semana
    },
    Tenis: {
      basePrice: 1800,
      peakHourMultiplier: 1.2,
      weekendMultiplier: 1.1,
    },
  },
  // Horarios pico
  peakHours: {
    weekdays: ['19:00', '20:00', '21:00'], // Horas pico entre semana
    weekends: ['10:00', '11:00', '16:00', '17:00', '18:00'], // Horas pico fin de semana
  },
  // Configuración específica por cancha (override del sport)
  courtSpecific: {
    1: { basePrice: 2500, multipliers: { peak: 1.3, weekend: 1.2 } },
    2: { basePrice: 2500, multipliers: { peak: 1.3, weekend: 1.2 } },
    3: { basePrice: 1800, multipliers: { peak: 1.2, weekend: 1.1 } },
    4: { basePrice: 1800, multipliers: { peak: 1.2, weekend: 1.1 } },
  },
};

// Intervalo de slots por defecto (en minutos)
const DEFAULT_SLOT_INTERVAL = 30;

/**
 * Obtiene los horarios de la institución
 * Migra automáticamente formato legacy a nuevo formato con rangos
 * @returns {Object} Horarios de apertura y cierre por día
 */
export const getInstitutionSchedule = () => {
  // TODO: En producción, esto vendría de la API
  let schedule = DEFAULT_INSTITUTION_SCHEDULE;

  try {
    if (typeof localStorage !== 'undefined') {
      const stored = localStorage.getItem('institution_schedule');
      if (stored) {
        schedule = JSON.parse(stored);
      }
    }
  } catch (error) {
    console.warn('⚠️ Error accessing localStorage for institution_schedule:', error);
  }

  // Migrar formato legacy automáticamente
  schedule = migrateLegacyScheduleFormat(schedule);

  return schedule;
};

/**
 * Migra formato legacy {openTime, closeTime} a formato nuevo {ranges: [{openTime, closeTime}]}
 * @param {Object} schedule - Horarios en cualquier formato
 * @returns {Object} Horarios en formato nuevo con rangos
 */
const migrateLegacyScheduleFormat = (schedule) => {
  const migrated = { ...schedule };
  let hasChanges = false;

  Object.keys(migrated).forEach((dayKey) => {
    const daySchedule = migrated[dayKey];

    // Skip non-day keys (like 'feriados')
    if (!daySchedule || typeof daySchedule !== 'object' || Array.isArray(daySchedule)) {
      return;
    }

    // Si ya tiene formato nuevo (ranges), no hacer nada
    if (daySchedule.ranges) {
      return;
    }

    // Si tiene formato legacy (openTime/closeTime), migrar
    if (daySchedule.openTime && daySchedule.closeTime) {
      migrated[dayKey] = {
        enabled: daySchedule.enabled !== false, // default true si no se especifica
        ranges: [
          {
            openTime: daySchedule.openTime,
            closeTime: daySchedule.closeTime,
          },
        ],
      };
      hasChanges = true;
    }
  });

  // Si hubo migración, persistir el nuevo formato
  if (hasChanges) {
    localStorage.setItem('institution_schedule', JSON.stringify(migrated));
  }

  return migrated;
};

/**
 * Actualiza los horarios de la institución
 * @param {Object} schedule - Nueva configuración de horarios
 */
export const updateInstitutionSchedule = (schedule) => {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('institution_schedule', JSON.stringify(schedule));
    }
  } catch (error) {
    console.warn('⚠️ Error updating localStorage for institution_schedule:', error);
  }

  // TODO: En producción, esto haría una llamada a la API
  // Emitir evento para que la UI sepa que la config cambió
  try {
    if (typeof window !== 'undefined' && window?.dispatchEvent) {
      window.dispatchEvent(new CustomEvent('institutionScheduleUpdated', { detail: schedule }));
    }
  } catch (e) {
    // ignore in non-browser envs
  }

  return Promise.resolve({ success: true });
};

/**
 * Suscribirse a cambios en la configuración de horarios de la institución.
 * Retorna una función de cleanup.
 */
export const subscribeInstitutionSchedule = (callback) => {
  if (typeof window === 'undefined' || !window?.addEventListener) return () => {};

  const handler = (ev) => callback(ev.detail);
  window.addEventListener('institutionScheduleUpdated', handler);
  return () => window.removeEventListener('institutionScheduleUpdated', handler);
};

/**
 * Obtiene la configuración de precios
 * @returns {Object} Configuración completa de precios
 */
export const getPricingConfig = () => {
  const stored = localStorage.getItem('pricing_config');
  return stored ? JSON.parse(stored) : DEFAULT_PRICING_CONFIG;
};

/**
 * Actualiza la configuración de precios
 * @param {Object} config - Nueva configuración de precios
 */
export const updatePricingConfig = (config) => {
  localStorage.setItem('pricing_config', JSON.stringify(config));
  return Promise.resolve({ success: true });
};

/**
 * Genera slots de tiempo disponibles para un día específico
 * Soporta múltiples franjas horarias por día y formato legacy
 * IMPORTANTE: Siempre genera slots de 30 minutos (solo :00 y :30)
 * @param {string} dayOfWeek - Día de la semana (lunes, martes, etc.)
 * @param {number} intervalMinutes - Intervalo entre slots en minutos (forzado a 30)
 * @returns {Array} Array de horarios disponibles ['08:00', '08:30', ...]
 */
export const generateTimeSlots = (dayOfWeek, intervalMinutes = DEFAULT_SLOT_INTERVAL) => {
  const schedule = getInstitutionSchedule();
  const daySchedule = schedule[dayOfWeek];

  if (!daySchedule || !daySchedule.enabled) {
    return [];
  }

  // 🔒 FORZAR intervalo de 30 minutos para cumplir con requerimiento
  const FORCED_INTERVAL = 30;

  const slots = [];

  // Helper para redondear tiempo al slot de 30 minutos más cercano
  const roundToNearestSlot = (minutes) => {
    const remainder = minutes % FORCED_INTERVAL;
    if (remainder === 0) return minutes;
    // Redondear hacia arriba al siguiente slot de 30 minutos
    return minutes + (FORCED_INTERVAL - remainder);
  };

  // Soporte para formato legacy (openTime/closeTime directo)
  if (daySchedule.openTime && daySchedule.closeTime) {
    let openTime = parseTime(daySchedule.openTime);
    const closeTime = parseTime(daySchedule.closeTime);

    // Redondear hora de apertura al siguiente slot de 30 minutos
    openTime = roundToNearestSlot(openTime);

    let currentTime = openTime;
    while (currentTime < closeTime) {
      slots.push(formatTime(currentTime));
      currentTime += FORCED_INTERVAL;
    }

    return slots;
  }

  // Formato nuevo: múltiples rangos por día
  const ranges = daySchedule.ranges || [];

  ranges.forEach((range, index) => {
    if (!range.openTime || !range.closeTime) {
      return;
    }

    let openTime = parseTime(range.openTime);
    const closeTime = parseTime(range.closeTime);

    // Redondear hora de apertura al siguiente slot de 30 minutos
    openTime = roundToNearestSlot(openTime);

    let currentTime = openTime;
    while (currentTime < closeTime) {
      const timeStr = formatTime(currentTime);
      // Evitar duplicados si los rangos se solapan
      if (!slots.includes(timeStr)) {
        slots.push(timeStr);
      }
      currentTime += FORCED_INTERVAL;
    }
  });

  // Ordenar los slots cronológicamente
  const sortedSlots = slots.sort((a, b) => parseTime(a) - parseTime(b));

  return sortedSlots;
};

/**
 * Convierte tiempo en formato "HH:mm" a minutos desde medianoche
 * @param {string} timeStr - Tiempo en formato "08:30"
 * @returns {number} Minutos desde medianoche
 */
const parseTime = (timeStr) => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
};

/**
 * Convierte minutos desde medianoche a formato "HH:mm"
 * @param {number} minutes - Minutos desde medianoche
 * @returns {string} Tiempo en formato "08:30"
 */
const formatTime = (minutes) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
};

/**
 * Calcula el precio de una reserva
 * @param {Object} params - Parámetros de la reserva
 * @param {number} params.courtId - ID de la cancha
 * @param {string} params.sport - Deporte (Padel, Tenis)
 * @param {string} params.date - Fecha en formato ISO (YYYY-MM-DD)
 * @param {string} params.time - Hora en formato HH:mm
 * @param {number} params.durationMinutes - Duración en minutos
 * @returns {Object} Información detallada del precio
 */
export const calculateReservationPrice = ({ courtId, sport, date, time, durationMinutes }) => {
  const config = getPricingConfig();

  // Ensure sports config exists
  const sportsConfig = config.sports || DEFAULT_PRICING_CONFIG.sports;
  const sportConfig = sportsConfig[sport] || sportsConfig['Padel'] || {};

  // Obtener precio base
  let basePrice = sportConfig.basePrice || 2000;
  let multipliers = {
    peak: sportConfig.peakHourMultiplier || 1,
    weekend: sportConfig.weekendMultiplier || 1,
  };

  // Override con configuración específica de cancha si existe
  const courtSpecific = config.courtSpecific || DEFAULT_PRICING_CONFIG.courtSpecific || {};
  if (courtSpecific[courtId]) {
    const courtConfig = courtSpecific[courtId];
    basePrice = courtConfig.basePrice || basePrice;
    multipliers = { ...multipliers, ...courtConfig.multipliers };
  }

  // Determinar si es fin de semana
  const dayOfWeek = new Date(date).getDay();
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6; // Domingo o Sábado

  // Determinar si es hora pico
  const peakHours = config.peakHours || DEFAULT_PRICING_CONFIG.peakHours;
  const isPeakHour = isWeekend
    ? peakHours?.weekends?.includes(time)
    : peakHours?.weekdays?.includes(time);

  // Calcular precio por hora
  let hourlyRate = basePrice;
  if (isPeakHour) hourlyRate *= multipliers.peak;
  if (isWeekend) hourlyRate *= multipliers.weekend;

  // Calcular precio total basado en duración
  const hours = durationMinutes / 60;
  const totalPrice = Math.round(hourlyRate * hours);

  return {
    basePrice,
    hourlyRate,
    totalPrice,
    durationHours: hours,
    isPeakHour,
    isWeekend,
    multipliers: {
      applied: {
        peak: isPeakHour ? multipliers.peak : 1,
        weekend: isWeekend ? multipliers.weekend : 1,
      },
      available: multipliers,
    },
    breakdown: {
      base: `$${basePrice} / hora`,
      peak: isPeakHour ? `+${Math.round((multipliers.peak - 1) * 100)}% hora pico` : null,
      weekend: isWeekend ? `+${Math.round((multipliers.weekend - 1) * 100)}% fin de semana` : null,
      duration: `${hours}h × $${hourlyRate} = $${totalPrice}`,
    },
  };
};

/**
 * Verifica si un horario está dentro de las horas de operación
 * Soporta múltiples franjas horarias por día
 * @param {string} dayOfWeek - Día de la semana (lunes, martes, etc.)
 * @param {string} time - Hora en formato HH:mm
 * @returns {boolean} True si está dentro del horario de operación
 */
export const isWithinOperatingHours = (dayOfWeek, time) => {
  const schedule = getInstitutionSchedule();
  const daySchedule = schedule[dayOfWeek];

  if (!daySchedule || !daySchedule.enabled) {
    return false;
  }

  const timeMinutes = parseTime(time);

  // Soporte para formato legacy
  if (daySchedule.openTime && daySchedule.closeTime) {
    const openMinutes = parseTime(daySchedule.openTime);
    const closeMinutes = parseTime(daySchedule.closeTime);
    return timeMinutes >= openMinutes && timeMinutes < closeMinutes;
  }

  // Formato nuevo: verificar contra todos los rangos
  const ranges = daySchedule.ranges || [];

  return ranges.some((range) => {
    if (!range.openTime || !range.closeTime) return false;

    const openMinutes = parseTime(range.openTime);
    const closeMinutes = parseTime(range.closeTime);

    return timeMinutes >= openMinutes && timeMinutes < closeMinutes;
  });
};

/**
 * Obtiene el día de la semana en español para una fecha
 * @param {string} date - Fecha en formato ISO (YYYY-MM-DD)
 * @returns {string} Día de la semana (lunes, martes, etc.)
 */
export const getDayOfWeekSpanish = (date) => {
  const days = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
  const dayIndex = new Date(date).getDay();
  return days[dayIndex];
};

/**
 * Obtiene el intervalo de slots configurado
 * @returns {number} Intervalo en minutos
 */
export const getSlotInterval = () => {
  try {
    if (typeof localStorage !== 'undefined') {
      const stored = localStorage.getItem('slot_interval');
      if (stored) {
        const parsed = parseInt(stored, 10);

        // 🔄 Auto-migración: Si hay un valor de 60 guardado del panel de schedules,
        // y no se ha configurado explícitamente, usar el valor por defecto de 30
        if (parsed === 60 && !localStorage.getItem('slot_interval_explicit')) {
          localStorage.removeItem('slot_interval');
          return DEFAULT_SLOT_INTERVAL;
        }

        if (!isNaN(parsed) && parsed > 0) {
          return parsed;
        }
      }
    }
  } catch (error) {
    console.warn('⚠️ Error accessing localStorage for slot_interval:', error);
  }
  return DEFAULT_SLOT_INTERVAL;
};

/**
 * Actualiza el intervalo de slots
 * @param {number} intervalMinutes - Nuevo intervalo en minutos
 * @param {boolean} explicit - Si es una configuración explícita del usuario
 */
export const updateSlotInterval = (intervalMinutes, explicit = true) => {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('slot_interval', intervalMinutes.toString());
      // Marcar si es una configuración explícita del usuario
      if (explicit) {
        localStorage.setItem('slot_interval_explicit', 'true');
      }
    }
    return Promise.resolve({ success: true });
  } catch (error) {
    console.warn('⚠️ Error updating localStorage for slot_interval:', error);
    return Promise.resolve({ success: false, error: error.message });
  }
};

export default {
  getInstitutionSchedule,
  updateInstitutionSchedule,
  getPricingConfig,
  updatePricingConfig,
  generateTimeSlots,
  calculateReservationPrice,
  isWithinOperatingHours,
  getDayOfWeekSpanish,
  getSlotInterval,
  updateSlotInterval,
};
