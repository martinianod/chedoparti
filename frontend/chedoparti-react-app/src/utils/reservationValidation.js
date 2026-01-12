/**
 * Reservation Validation Utilities
 * Validaciones centralizadas para reservas
 */

import { parseArgentinaDate, getArgentinaDate, getDaysDifference } from './dateUtils';

/**
 * Valida conflictos de horario entre reservas
 * @param {Object} newReservation - Nueva reserva a validar
 * @param {Array} existingReservations - Reservas existentes
 * @returns {Object} { hasConflict: boolean, conflicts: Array }
 */
export function validateReservationConflict(newReservation, existingReservations = []) {
  const { courtId, date, time, duration = '01:00', id } = newReservation;

  if (!courtId || !date || !time) {
    return { hasConflict: false, conflicts: [] };
  }

  // Calcular rango de tiempo de la nueva reserva
  const [newStartH, newStartM] = time.split(':').map(Number);
  const newStartMinutes = newStartH * 60 + newStartM;

  const [durationH, durationM] = duration.split(':').map(Number);
  const newEndMinutes = newStartMinutes + durationH * 60 + durationM;

  // Buscar conflictos
  const conflicts = existingReservations.filter((existing) => {
    // Ignorar la misma reserva (al editar)
    if (id && existing.id === id) return false;

    // Debe ser la misma cancha y fecha
    if (existing.courtId !== courtId || existing.date !== date) return false;

    // Ignorar reservas canceladas
    if (existing.status === 'cancelled' || existing.status === 'deleted') return false;

    // Calcular rango de la reserva existente
    const [existingStartH, existingStartM] = existing.time.split(':').map(Number);
    const existingStartMinutes = existingStartH * 60 + existingStartM;

    const [existingDurationH, existingDurationM] = (existing.duration || '01:00').split(':').map(Number);
    const existingEndMinutes = existingStartMinutes + existingDurationH * 60 + existingDurationM;

    // Verificar overlap
    const hasOverlap =
      (newStartMinutes >= existingStartMinutes && newStartMinutes < existingEndMinutes) ||
      (newEndMinutes > existingStartMinutes && newEndMinutes <= existingEndMinutes) ||
      (newStartMinutes <= existingStartMinutes && newEndMinutes >= existingEndMinutes);

    return hasOverlap;
  });

  return {
    hasConflict: conflicts.length > 0,
    conflicts,
  };
}

/**
 * Valida permisos de usuario para una acción sobre una reserva
 * @param {Object} user - Usuario actual
 * @param {string} action - Acción: 'create' | 'update' | 'delete' | 'view'
 * @param {Object} reservation - Reserva (opcional para 'create')
 * @returns {Object} { allowed: boolean, reason: string }
 */
export function validateUserPermissions(user, action, reservation = null) {
  if (!user) {
    return { allowed: false, reason: 'Usuario no autenticado' };
  }

  const isAdmin = user.role === 'INSTITUTION_ADMIN';
  const isCoach = user.role === 'COACH';
  const isSocio = user.role === 'SOCIO';

  // Admin puede hacer todo
  if (isAdmin) {
    return { allowed: true, reason: '' };
  }

  switch (action) {
    case 'create':
      // Todos los usuarios autenticados pueden crear
      return { allowed: true, reason: '' };

    case 'view':
      // Todos pueden ver sus propias reservas
      if (!reservation) return { allowed: true, reason: '' };

      const isOwner =
        (reservation.userId && String(reservation.userId) === String(user.id)) ||
        (reservation.membershipNumber && String(reservation.membershipNumber) === String(user.membershipNumber));

      if (isOwner) return { allowed: true, reason: '' };

      // Coach puede ver reservas de sus clases
      if (isCoach && reservation.type === 'Clase' && reservation.coachId === user.id) {
        return { allowed: true, reason: '' };
      }

      return { allowed: false, reason: 'No tienes permiso para ver esta reserva' };

    case 'update':
    case 'delete':
      if (!reservation) {
        return { allowed: false, reason: 'Reserva no especificada' };
      }

      // Solo el dueño puede editar/eliminar
      const isReservationOwner =
        (reservation.userId && String(reservation.userId) === String(user.id)) ||
        (reservation.membershipNumber && String(reservation.membershipNumber) === String(user.membershipNumber));

      if (isReservationOwner) {
        return { allowed: true, reason: '' };
      }

      return { allowed: false, reason: 'Solo el dueño de la reserva puede modificarla' };

    default:
      return { allowed: false, reason: 'Acción no válida' };
  }
}

/**
 * Valida horario de reserva según configuración de la cancha
 * @param {string} startTime - Hora de inicio (HH:mm)
 * @param {string} endTime - Hora de fin (HH:mm)
 * @param {Object} courtSchedule - Configuración de horarios de la cancha
 * @returns {Object} { valid: boolean, reason: string }
 */
export function validateReservationTime(startTime, endTime, courtSchedule = null) {
  if (!startTime || !endTime) {
    return { valid: false, reason: 'Hora de inicio y fin son requeridas' };
  }

  const [startH, startM] = startTime.split(':').map(Number);
  const [endH, endM] = endTime.split(':').map(Number);

  const startMinutes = startH * 60 + startM;
  const endMinutes = endH * 60 + endM;

  // Validar que la hora de fin sea después de la de inicio
  if (endMinutes <= startMinutes) {
    return { valid: false, reason: 'La hora de fin debe ser posterior a la de inicio' };
  }

  // Validar duración mínima (30 minutos)
  const durationMinutes = endMinutes - startMinutes;
  if (durationMinutes < 30) {
    return { valid: false, reason: 'La duración mínima es de 30 minutos' };
  }

  // Validar duración máxima (3 horas)
  if (durationMinutes > 180) {
    return { valid: false, reason: 'La duración máxima es de 3 horas' };
  }

  // Si hay configuración de horarios, validar contra ella
  if (courtSchedule) {
    const { openTime, closeTime } = courtSchedule;

    if (openTime) {
      const [openH, openM] = openTime.split(':').map(Number);
      const openMinutes = openH * 60 + openM;

      if (startMinutes < openMinutes) {
        return { valid: false, reason: `La cancha abre a las ${openTime}` };
      }
    }

    if (closeTime) {
      const [closeH, closeM] = closeTime.split(':').map(Number);
      const closeMinutes = closeH * 60 + closeM;

      if (endMinutes > closeMinutes) {
        return { valid: false, reason: `La cancha cierra a las ${closeTime}` };
      }
    }
  }

  return { valid: true, reason: '' };
}

/**
 * Valida precio de reserva según reglas de pricing
 * @param {Object} reservation - Datos de la reserva
 * @param {Array} pricingRules - Reglas de pricing
 * @returns {Object} { valid: boolean, expectedPrice: number, reason: string }
 */
export function validateReservationPrice(reservation, pricingRules = []) {
  const { price, date, time, duration = '01:00', courtId } = reservation;

  if (price === undefined || price === null) {
    return { valid: false, expectedPrice: 0, reason: 'Precio no especificado' };
  }

  // Si no hay reglas, aceptar cualquier precio positivo
  if (!pricingRules || pricingRules.length === 0) {
    return {
      valid: price >= 0,
      expectedPrice: price,
      reason: price < 0 ? 'El precio no puede ser negativo' : '',
    };
  }

  // Aquí se implementaría la lógica de cálculo según las reglas
  // Por ahora, validación básica
  if (price < 0) {
    return { valid: false, expectedPrice: 0, reason: 'El precio no puede ser negativo' };
  }

  return { valid: true, expectedPrice: price, reason: '' };
}

/**
 * Valida fecha de reserva (no en el pasado, dentro del rango permitido)
 * @param {string} date - Fecha en formato YYYY-MM-DD
 * @param {Object} options - Opciones de validación
 * @returns {Object} { valid: boolean, reason: string }
 */
export function validateReservationDate(date, options = {}) {
  const { allowPast = false, maxAdvanceDays = 30 } = options;

  if (!date) {
    return { valid: false, reason: 'Fecha no especificada' };
  }

  const today = getArgentinaDate();
  const daysDiff = getDaysDifference(date, today);

  // Validar que no sea en el pasado (a menos que se permita)
  if (!allowPast && daysDiff < 0) {
    return { valid: false, reason: 'No se pueden crear reservas en el pasado' };
  }

  // Validar que no sea demasiado en el futuro
  if (daysDiff > maxAdvanceDays) {
    return { valid: false, reason: `Solo se pueden crear reservas con hasta ${maxAdvanceDays} días de anticipación` };
  }

  return { valid: true, reason: '' };
}

/**
 * Validación completa de reserva
 * @param {Object} reservation - Datos de la reserva
 * @param {Object} context - Contexto (user, existingReservations, courtSchedule, pricingRules)
 * @returns {Object} { valid: boolean, errors: Array }
 */
export function validateReservation(reservation, context = {}) {
  const {
    user,
    existingReservations = [],
    courtSchedule = null,
    pricingRules = [],
    allowPastDates = false,
  } = context;

  const errors = [];

  // Validar campos requeridos
  if (!reservation.courtId) errors.push('Cancha es requerida');
  if (!reservation.date) errors.push('Fecha es requerida');
  if (!reservation.time) errors.push('Hora de inicio es requerida');

  // Validar fecha
  const dateValidation = validateReservationDate(reservation.date, { allowPast: allowPastDates });
  if (!dateValidation.valid) {
    errors.push(dateValidation.reason);
  }

  // Validar horario
  if (reservation.time) {
    const [h, m] = reservation.time.split(':').map(Number);
    const startMinutes = h * 60 + m;

    const [dh, dm] = (reservation.duration || '01:00').split(':').map(Number);
    const endMinutes = startMinutes + dh * 60 + dm;

    const endH = Math.floor(endMinutes / 60);
    const endM = endMinutes % 60;
    const endTime = `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;

    const timeValidation = validateReservationTime(reservation.time, endTime, courtSchedule);
    if (!timeValidation.valid) {
      errors.push(timeValidation.reason);
    }
  }

  // Validar conflictos
  const conflictValidation = validateReservationConflict(reservation, existingReservations);
  if (conflictValidation.hasConflict) {
    errors.push(`Conflicto de horario con ${conflictValidation.conflicts.length} reserva(s) existente(s)`);
  }

  // Validar permisos
  if (user) {
    const action = reservation.id ? 'update' : 'create';
    const permissionValidation = validateUserPermissions(user, action, reservation);
    if (!permissionValidation.allowed) {
      errors.push(permissionValidation.reason);
    }
  }

  // Validar precio
  if (reservation.price !== undefined) {
    const priceValidation = validateReservationPrice(reservation, pricingRules);
    if (!priceValidation.valid) {
      errors.push(priceValidation.reason);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export default {
  validateReservationConflict,
  validateUserPermissions,
  validateReservationTime,
  validateReservationPrice,
  validateReservationDate,
  validateReservation,
};
