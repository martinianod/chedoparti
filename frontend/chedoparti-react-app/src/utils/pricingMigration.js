/**
 * Utilidades para migración de datos de precios del formato antiguo al nuevo
 */

/**
 * Genera un ID único para bloques de tiempo
 * @returns {string} ID único
 */
export function generateBlockId() {
  return `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Verifica si una regla de precios ya está en el nuevo formato
 * @param {Object} rule - Regla de precios
 * @returns {boolean} true si ya tiene el nuevo formato
 */
export function isNewFormat(rule) {
  return rule && Array.isArray(rule.timeBlocks);
}

/**
 * Migra una regla de precios del formato antiguo al nuevo
 * @param {Object} oldRule - Regla en formato antiguo
 * @returns {Object} Regla en formato nuevo
 */
export function migratePricingRule(oldRule) {
  // Si ya está en el nuevo formato, retornar tal cual
  if (isNewFormat(oldRule)) {
    return oldRule;
  }

  // Si no tiene los campos necesarios, retornar una regla vacía
  if (!oldRule) {
    return {
      days: [],
      durations: ['1h'],
      timeBlocks: [],
    };
  }

  // Crear el nuevo formato
  const newRule = {
    days: oldRule.days || [],
    durations: oldRule.durations || ['1h'],
    timeBlocks: [],
  };

  // Si tiene start, end, price, priceType, crear un bloque de tiempo
  if (oldRule.start && oldRule.end) {
    newRule.timeBlocks.push({
      id: generateBlockId(),
      start: oldRule.start,
      end: oldRule.end,
      priceType: oldRule.priceType || 'normal',
      price: oldRule.price || '',
    });
  }

  return newRule;
}

/**
 * Migra un array de reglas de precios
 * @param {Array} rules - Array de reglas en formato antiguo
 * @returns {Array} Array de reglas en formato nuevo
 */
export function migratePricingRules(rules) {
  if (!Array.isArray(rules)) {
    return [];
  }

  return rules.map(migratePricingRule);
}

/**
 * Convierte una regla del nuevo formato al antiguo (para compatibilidad)
 * Nota: Si hay múltiples bloques de tiempo, solo se tomará el primero
 * @param {Object} newRule - Regla en formato nuevo
 * @returns {Object} Regla en formato antiguo
 */
export function convertToOldFormat(newRule) {
  if (!isNewFormat(newRule)) {
    return newRule;
  }

  const oldRule = {
    days: newRule.days || [],
    durations: newRule.durations || ['1h'],
  };

  // Si hay bloques de tiempo, tomar el primero
  if (newRule.timeBlocks && newRule.timeBlocks.length > 0) {
    const firstBlock = newRule.timeBlocks[0];
    oldRule.start = firstBlock.start;
    oldRule.end = firstBlock.end;
    oldRule.priceType = firstBlock.priceType;
    oldRule.price = firstBlock.price;
  }

  return oldRule;
}

/**
 * Crea un bloque de tiempo vacío con valores por defecto
 * @returns {Object} Bloque de tiempo vacío
 */
export function createEmptyTimeBlock() {
  return {
    id: generateBlockId(),
    start: '08:00',
    end: '09:00',
    priceType: 'normal',
    price: '',
  };
}

/**
 * Crea plantillas de bloques de tiempo comunes
 * @returns {Object} Objeto con plantillas predefinidas
 */
export function getTimeBlockTemplates() {
  return {
    morning: {
      id: generateBlockId(),
      start: '08:00',
      end: '12:00',
      priceType: 'normal',
      price: '',
    },
    afternoon: {
      id: generateBlockId(),
      start: '12:00',
      end: '18:00',
      priceType: 'normal',
      price: '',
    },
    night: {
      id: generateBlockId(),
      start: '18:00',
      end: '23:00',
      priceType: 'nocturno',
      price: '',
    },
    fullDay: {
      id: generateBlockId(),
      start: '08:00',
      end: '23:00',
      priceType: 'normal',
      price: '',
    },
  };
}

/**
 * Duplica un bloque de tiempo con un nuevo ID
 * @param {Object} block - Bloque a duplicar
 * @returns {Object} Nuevo bloque duplicado
 */
export function duplicateTimeBlock(block) {
  if (!block) {
    return createEmptyTimeBlock();
  }

  return {
    ...block,
    id: generateBlockId(),
  };
}
