import { useMemo } from 'react';
import { generateTimeSlots, getDayOfWeekSpanish, getSlotInterval } from '../services/institutionConfig';

/**
 * Hook para gestionar slots de horarios dinámicos
 * Genera slots basados en la configuración de la institución, día de la semana y deporte
 * 
 * @param {string} date - Fecha en formato YYYY-MM-DD
 * @param {string} sport - Deporte seleccionado (opcional, para futuras extensiones)
 * @param {number} scheduleVersion - Versión del schedule para forzar re-cálculo
 * @returns {Object} { slots, dayOfWeek, interval, isEmpty, count }
 */
export function useSchedules(date, sport = null, scheduleVersion = 0) {
  const slots = useMemo(() => {
    if (!date) return [];
    
    const dayOfWeek = getDayOfWeekSpanish(date);
    const interval = getSlotInterval();
    const generatedSlots = generateTimeSlots(dayOfWeek, interval);
    
    // Validación: si no hay slots, log warning
    if (!generatedSlots || generatedSlots.length === 0) {
      console.warn('[useSchedules] No slots generated for', { date, dayOfWeek, sport });
    }
    
    return generatedSlots || [];
  }, [date, sport, scheduleVersion]);

  const dayOfWeek = useMemo(() => {
    return date ? getDayOfWeekSpanish(date) : null;
  }, [date]);

  const interval = useMemo(() => {
    return getSlotInterval();
  }, []);

  return {
    slots,
    dayOfWeek,
    interval,
    isEmpty: slots.length === 0,
    count: slots.length,
  };
}

/**
 * Hook para obtener slots con información adicional
 * Útil para renderizar con más contexto
 * 
 * @param {string} date - Fecha en formato YYYY-MM-DD
 * @param {string} sport - Deporte seleccionado
 * @returns {Object} { slots, slotsWithInfo }
 */
export function useSchedulesWithInfo(date, sport = null) {
  const { slots, dayOfWeek, interval } = useSchedules(date, sport);

  const slotsWithInfo = useMemo(() => {
    return slots.map((slot, index) => {
      const [hours, minutes] = slot.split(':').map(Number);
      const totalMinutes = hours * 60 + minutes;
      
      return {
        time: slot,
        index,
        hours,
        minutes,
        totalMinutes,
        isEarlyMorning: hours < 8,
        isMorning: hours >= 8 && hours < 12,
        isAfternoon: hours >= 12 && hours < 18,
        isEvening: hours >= 18 && hours < 22,
        isNight: hours >= 22,
      };
    });
  }, [slots]);

  return {
    slots,
    slotsWithInfo,
    dayOfWeek,
    interval,
  };
}

export default useSchedules;
