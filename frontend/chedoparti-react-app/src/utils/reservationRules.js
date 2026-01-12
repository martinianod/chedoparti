import { isBefore, subHours, addMinutes, parseISO } from 'date-fns';

/**
 * Roles definitions
 */
export const ROLES = {
  USER: 'USER',
  ADMIN: 'INSTITUTION_ADMIN',
  COACH: 'COACH',
  SOCIO: 'SOCIO',
};

/**
 * Check if a user has a specific role
 */
export const hasRole = (user, role) => {
  if (!user) return false;
  if (user.role === role) return true;
  if (user.roles && user.roles.includes(role)) return true;
  return false;
};

/**
 * Check if user is an Admin
 */
export const isAdmin = (user) => hasRole(user, ROLES.ADMIN);

/**
 * Check if user is a Coach
 */
export const isCoach = (user) => hasRole(user, ROLES.COACH);

/**
 * Check if user is a Socio
 */
export const isSocio = (user) => hasRole(user, ROLES.SOCIO);

/**
 * Determine if a user can create a reservation of a specific type
 */
export const canCreateReservationType = (user, type) => {
  if (!user) return false;
  if (isAdmin(user)) return true;

  switch (type) {
    case 'Normal':
      return true; // Everyone can create normal reservations
    case 'Torneo':
    case 'Escuela':
    case 'Cumpleaños':
    case 'Abono':
      return isAdmin(user);
    case 'Clase':
      return isAdmin(user) || isCoach(user);
    default:
      return false;
  }
};

/**
 * Determine if a user can edit a specific reservation
 */
export const canEditReservation = (user, reservation) => {
  if (!user || !reservation) return false;
  
  // Admins can edit everything
  if (isAdmin(user)) return true;

  // Check if reservation is in the past
  const reservationStart = new Date(`${reservation.date}T${reservation.time}`);
  if (isBefore(reservationStart, new Date())) {
    return false; // Cannot edit past reservations
  }

  // Time limit checks
  const now = new Date();
  const hoursUntilStart = (reservationStart - now) / (1000 * 60 * 60);

  if (isCoach(user)) {
    // Coach: Own reservations or their students (if logic exists), > 1 hour before
    const isOwner = reservation.userId === user.id || reservation.userId === user.email;
    return isOwner && hoursUntilStart > 1;
  }

  if (isSocio(user) || hasRole(user, ROLES.USER)) {
    // User/Socio: Own reservations only, > 2 hours before
    const isOwner = reservation.userId === user.id || reservation.userId === user.email;
    return isOwner && hoursUntilStart > 2;
  }

  return false;
};

/**
 * Determine if a user can cancel a specific reservation
 */
export const canCancelReservation = (user, reservation) => {
  if (!user || !reservation) return false;

  // Admins can cancel everything
  if (isAdmin(user)) return true;

  // Check if reservation is in the past
  const reservationStart = new Date(`${reservation.date}T${reservation.time}`);
  if (isBefore(reservationStart, new Date())) {
    return false;
  }

  // Time limit checks for cancellation (same as edit or stricter?)
  // Using same rules as edit for now based on prompt "Validar límites de tiempo"
  const now = new Date();
  const hoursUntilStart = (reservationStart - now) / (1000 * 60 * 60);

  if (isCoach(user)) {
    const isOwner = reservation.userId === user.id || reservation.userId === user.email;
    return isOwner && hoursUntilStart > 1;
  }

  if (isSocio(user) || hasRole(user, ROLES.USER)) {
    const isOwner = reservation.userId === user.id || reservation.userId === user.email;
    return isOwner && hoursUntilStart > 2; // Example limit
  }

  return false;
};

/**
 * Get the list of editable fields for a user and reservation
 */
export const getEditableFields = (user, reservation) => {
  if (!user) return [];

  const allFields = ['courtId', 'date', 'time', 'duration', 'type', 'user', 'notes', 'price'];

  if (isAdmin(user)) {
    return allFields;
  }

  if (isCoach(user)) {
    return ['courtId', 'date', 'time', 'duration', 'type']; // Coach cannot edit price or user assignment freely if not creating
  }

  if (isSocio(user) || hasRole(user, ROLES.USER)) {
    // Users can only edit time/date/court/duration if allowed
    return ['courtId', 'date', 'time', 'duration'];
  }

  return [];
};

/**
 * Validate reservation before submission
 */
export const validateReservationRules = (reservation, user, context = {}) => {
  const errors = {};

  // 1. Basic Fields
  if (!reservation.courtId) errors.courtId = 'La cancha es obligatoria';
  if (!reservation.date) errors.date = 'La fecha es obligatoria';
  if (!reservation.time) errors.time = 'La hora es obligatoria';
  if (!reservation.duration) errors.duration = 'La duración es obligatoria';

  // 2. Date/Time Validation (Future check)
  if (reservation.date && reservation.time) {
    const start = new Date(`${reservation.date}T${reservation.time}`);
    if (isBefore(start, new Date())) {
      errors.time = 'No se pueden crear reservas en el pasado';
    }
  }

  // 3. Role-based validations
  if (isCoach(user)) {
    // Coach Quota Check (if context provides quota info)
    if (context.coachConfig && context.weeklyReservations) {
       // Logic moved here or kept in component? 
       // Keeping complex state-dependent logic in component might be easier, 
       // but we can validate basic rules here.
    }
  }

  if (isSocio(user)) {
    // Socio specific checks
  }

  return errors;
};
