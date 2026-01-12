/**
 * Utilidades para validación de bloques de tiempo en reglas de precios
 */

/**
 * Convierte una hora en formato "HH:MM" a minutos desde medianoche
 * @param {string} time - Hora en formato "HH:MM"
 * @returns {number} Minutos desde medianoche
 */
export function timeToMinutes(time) {
  if (!time) return 0;
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

/**
 * Convierte minutos desde medianoche a formato "HH:MM"
 * @param {number} minutes - Minutos desde medianoche
 * @returns {string} Hora en formato "HH:MM"
 */
export function minutesToTime(minutes) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
}

/**
 * Detecta conflictos de horarios entre bloques de tiempo
 * @param {Array} timeBlocks - Array de bloques de tiempo
 * @returns {Array} Array de conflictos encontrados
 */
export function detectTimeConflicts(timeBlocks) {
  if (!timeBlocks || timeBlocks.length < 2) return [];

  const conflicts = [];

  for (let i = 0; i < timeBlocks.length; i++) {
    for (let j = i + 1; j < timeBlocks.length; j++) {
      const block1 = timeBlocks[i];
      const block2 = timeBlocks[j];

      const start1 = timeToMinutes(block1.start);
      const end1 = timeToMinutes(block1.end);
      const start2 = timeToMinutes(block2.start);
      const end2 = timeToMinutes(block2.end);

      // Verificar si hay solapamiento
      // Dos rangos se solapan si: start1 < end2 && start2 < end1
      if (start1 < end2 && start2 < end1) {
        conflicts.push({
          block1Index: i,
          block2Index: j,
          block1: block1,
          block2: block2,
          message: `Conflicto entre ${block1.start}-${block1.end} y ${block2.start}-${block2.end}`,
        });
      }
    }
  }

  return conflicts;
}

/**
 * Valida un bloque de tiempo individual
 * @param {Object} block - Bloque de tiempo a validar
 * @returns {Object} Resultado de validación { valid: boolean, errors: Array }
 */
export function validateTimeBlock(block) {
  const errors = [];

  if (!block) {
    return { valid: false, errors: ['Bloque de tiempo no definido'] };
  }

  // Validar que existan start y end
  if (!block.start) {
    errors.push('Hora de inicio requerida');
  }

  if (!block.end) {
    errors.push('Hora de fin requerida');
  }

  // Validar formato de tiempo
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  if (block.start && !timeRegex.test(block.start)) {
    errors.push('Formato de hora de inicio inválido');
  }

  if (block.end && !timeRegex.test(block.end)) {
    errors.push('Formato de hora de fin inválido');
  }

  // Validar que start < end
  if (block.start && block.end) {
    const startMinutes = timeToMinutes(block.start);
    const endMinutes = timeToMinutes(block.end);

    if (startMinutes >= endMinutes) {
      errors.push('La hora de inicio debe ser menor que la hora de fin');
    }
  }

  // Validar precio
  if (block.price !== undefined && block.price !== null && block.price !== '') {
    const price = Number(block.price);
    if (isNaN(price) || price < 0) {
      errors.push('El precio debe ser un número positivo');
    }
  }

  // Validar tipo de precio
  const validPriceTypes = ['normal', 'nocturno', 'fin_semana', 'feriado', 'premium'];
  if (block.priceType && !validPriceTypes.includes(block.priceType)) {
    errors.push('Tipo de precio inválido');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Ordena bloques de tiempo por hora de inicio
 * @param {Array} timeBlocks - Array de bloques de tiempo
 * @returns {Array} Array ordenado de bloques de tiempo
 */
export function sortTimeBlocks(timeBlocks) {
  if (!timeBlocks || timeBlocks.length === 0) return [];

  return [...timeBlocks].sort((a, b) => {
    const startA = timeToMinutes(a.start);
    const startB = timeToMinutes(b.start);
    return startA - startB;
  });
}

/**
 * Verifica si un bloque de tiempo tiene conflictos con otros bloques
 * @param {Object} block - Bloque a verificar
 * @param {Array} otherBlocks - Otros bloques para comparar
 * @returns {boolean} true si hay conflictos
 */
export function hasConflicts(block, otherBlocks) {
  if (!block || !otherBlocks || otherBlocks.length === 0) return false;

  const conflicts = detectTimeConflicts([block, ...otherBlocks]);
  return conflicts.length > 0;
}

/**
 * Obtiene el rango de tiempo total cubierto por los bloques
 * @param {Array} timeBlocks - Array de bloques de tiempo
 * @returns {Object} { start: string, end: string, duration: number (en minutos) }
 */
export function getTotalTimeRange(timeBlocks) {
  if (!timeBlocks || timeBlocks.length === 0) {
    return { start: null, end: null, duration: 0 };
  }

  const sorted = sortTimeBlocks(timeBlocks);
  const start = sorted[0].start;
  const end = sorted[sorted.length - 1].end;

  const startMinutes = timeToMinutes(start);
  const endMinutes = timeToMinutes(end);
  const duration = endMinutes - startMinutes;

  return { start, end, duration };
}

/**
 * Encuentra huecos (gaps) entre bloques de tiempo
 * @param {Array} timeBlocks - Array de bloques de tiempo
 * @returns {Array} Array de huecos encontrados
 */
export function findTimeGaps(timeBlocks) {
  if (!timeBlocks || timeBlocks.length < 2) return [];

  const sorted = sortTimeBlocks(timeBlocks);
  const gaps = [];

  for (let i = 0; i < sorted.length - 1; i++) {
    const currentEnd = timeToMinutes(sorted[i].end);
    const nextStart = timeToMinutes(sorted[i + 1].start);

    if (currentEnd < nextStart) {
      gaps.push({
        start: sorted[i].end,
        end: sorted[i + 1].start,
        duration: nextStart - currentEnd,
      });
    }
  }

  return gaps;
}
