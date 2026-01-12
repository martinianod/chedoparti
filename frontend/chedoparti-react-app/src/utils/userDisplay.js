/**
 * Utilidad centralizada para mostrar información de usuario de forma segura
 * Maneja múltiples formatos: string, object con propiedades, fallbacks
 */

/**
 * Extrae texto de display del usuario de manera segura
 * PRIORIDAD: Siempre mostrar nombres, NUNCA números de teléfono en vistas de calendario
 * @param {string|Object} user - Usuario principal (puede ser string o objeto)
 * @param {string} customerName - Nombre del cliente/reserva (nuevo parámetro)
 * @param {string} userPhone - Teléfono alternativo (NO SE USA para display)
 * @param {string} userEmail - Email alternativo
 * @returns {string} Texto para mostrar en la UI (nunca incluye teléfono)
 */
export function getUserDisplayText(user, customerName, userPhone, userEmail) {
  const safeCustomerName = customerName && String(customerName).trim();
  if (safeCustomerName) {
    return safeCustomerName;
  }

  if (!user) {
    if (userEmail && String(userEmail).trim()) {
      return String(userEmail).trim();
    }
    return 'Usuario';
  }

  if (typeof user === 'string') {
    const safeUser = user.trim();
    if (safeUser && !isLikelyPhone(safeUser)) {
      return safeUser;
    }
    if (userEmail && String(userEmail).trim()) {
      return String(userEmail).trim();
    }
    return 'Usuario';
  }

  if (typeof user === 'object') {
    const candidates = [
      user.fullName,
      user.name,
      user.displayName,
      user.username,
      user.email,
    ];

    for (const candidate of candidates) {
      if (candidate && String(candidate).trim()) {
        return String(candidate).trim();
      }
    }

    if (userEmail && String(userEmail).trim()) {
      return String(userEmail).trim();
    }

    return 'Usuario';
  }

  if (userEmail && String(userEmail).trim()) {
    return String(userEmail).trim();
  }

  return 'Usuario';
}

function isLikelyPhone(value) {
  const digits = value.replace(/\D/g, '');
  return digits.length >= 7;
}

/**
 * Extrae el nombre para mostrar en avatares o títulos
 * @param {string|Object} user - Usuario
 * @returns {string} Nombre preferido para avatares
 */
export function getUserNameForAvatar(user) {
  if (!user) {
    return 'Usuario';
  }

  if (typeof user === 'string') {
    return user.trim() || 'Usuario';
  }

  if (typeof user === 'object') {
    // Priorizar nombre real sobre otros campos para avatares
    if (user.name && String(user.name).trim()) {
      return String(user.name).trim();
    }

    // Fallback a username
    if (user.username && String(user.username).trim()) {
      return String(user.username).trim();
    }

    return 'Usuario';
  }

  return 'Usuario';
}

/**
 * Extrae información de contacto (teléfono) de forma segura
 * @param {string|Object} user - Usuario
 * @param {string} userPhone - Teléfono alternativo
 * @returns {string} Número de teléfono o cadena vacía
 */
export function getUserPhone(user, userPhone) {
  if (typeof user === 'object' && user && user.phone) {
    return String(user.phone).trim();
  }

  if (userPhone && String(userPhone).trim()) {
    return String(userPhone).trim();
  }

  return '';
}

/**
 * Extrae email de forma segura
 * @param {string|Object} user - Usuario
 * @param {string} userEmail - Email alternativo
 * @returns {string} Email o cadena vacía
 */
export function getUserEmail(user, userEmail) {
  if (typeof user === 'object' && user && user.email) {
    return String(user.email).trim();
  }

  if (userEmail && String(userEmail).trim()) {
    return String(userEmail).trim();
  }

  return '';
}
