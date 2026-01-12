/**
 * Sistema centralizado de manejo de errores para Chedoparti
 * 
 * Proporciona clases de error personalizadas y funciones para manejar
 * errores de API de forma consistente en toda la aplicación.
 */

/**
 * Clase de error personalizada para la aplicación
 */
export class AppError extends Error {
  constructor(message, code = 'UNKNOWN_ERROR', details = null) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.details = details;
    this.timestamp = new Date().toISOString();
  }
}

/**
 * Códigos de error estándar
 */
export const ERROR_CODES = {
  // Autenticación
  UNAUTHORIZED: 'UNAUTHORIZED',
  SESSION_EXPIRED: 'SESSION_EXPIRED',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  
  // Autorización
  FORBIDDEN: 'FORBIDDEN',
  INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',
  
  // Recursos
  NOT_FOUND: 'NOT_FOUND',
  ALREADY_EXISTS: 'ALREADY_EXISTS',
  
  // Validación
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_INPUT: 'INVALID_INPUT',
  
  // Red
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT: 'TIMEOUT',
  
  // Servidor
  SERVER_ERROR: 'SERVER_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  
  // Negocio
  BUSINESS_RULE_VIOLATION: 'BUSINESS_RULE_VIOLATION',
  QUOTA_EXCEEDED: 'QUOTA_EXCEEDED',
  TIME_CONSTRAINT_VIOLATION: 'TIME_CONSTRAINT_VIOLATION',
  
  // Genérico
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
};

/**
 * Mensajes de error amigables para el usuario
 */
const USER_FRIENDLY_MESSAGES = {
  [ERROR_CODES.UNAUTHORIZED]: 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.',
  [ERROR_CODES.SESSION_EXPIRED]: 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.',
  [ERROR_CODES.INVALID_CREDENTIALS]: 'Credenciales inválidas. Verifica tu email y contraseña.',
  [ERROR_CODES.FORBIDDEN]: 'No tienes permisos para realizar esta acción.',
  [ERROR_CODES.INSUFFICIENT_PERMISSIONS]: 'No tienes los permisos necesarios para esta operación.',
  [ERROR_CODES.NOT_FOUND]: 'El recurso solicitado no fue encontrado.',
  [ERROR_CODES.ALREADY_EXISTS]: 'Este recurso ya existe.',
  [ERROR_CODES.VALIDATION_ERROR]: 'Por favor, verifica los datos ingresados.',
  [ERROR_CODES.INVALID_INPUT]: 'Los datos ingresados no son válidos.',
  [ERROR_CODES.NETWORK_ERROR]: 'Error de conexión. Verifica tu internet e intenta nuevamente.',
  [ERROR_CODES.TIMEOUT]: 'La solicitud tardó demasiado. Intenta nuevamente.',
  [ERROR_CODES.SERVER_ERROR]: 'Error del servidor. Intenta nuevamente en unos momentos.',
  [ERROR_CODES.SERVICE_UNAVAILABLE]: 'El servicio no está disponible temporalmente.',
  [ERROR_CODES.BUSINESS_RULE_VIOLATION]: 'Esta operación viola una regla de negocio.',
  [ERROR_CODES.QUOTA_EXCEEDED]: 'Has excedido tu cuota permitida.',
  [ERROR_CODES.TIME_CONSTRAINT_VIOLATION]: 'Esta operación no puede realizarse en este momento.',
  [ERROR_CODES.UNKNOWN_ERROR]: 'Ocurrió un error inesperado. Intenta nuevamente.',
};

/**
 * Maneja errores de API de forma centralizada
 * 
 * @param {Error} error - Error capturado
 * @param {Object} notifications - Sistema de notificaciones
 * @param {Object} options - Opciones adicionales
 * @param {boolean} options.showNotification - Si mostrar notificación al usuario (default: true)
 * @param {boolean} options.logToConsole - Si loguear en consola (default: true en dev)
 * @param {Function} options.onUnauthorized - Callback para manejar errores 401
 * @returns {AppError} Error procesado
 */
export function handleApiError(error, notifications, options = {}) {
  const {
    showNotification = true,
    logToConsole = import.meta.env.DEV,
    onUnauthorized = null,
  } = options;

  let appError;
  let userMessage;
  let errorCode;

  // Procesar error de Axios
  if (error.response) {
    const { status, data } = error.response;
    
    switch (status) {
      case 401:
        errorCode = ERROR_CODES.UNAUTHORIZED;
        userMessage = USER_FRIENDLY_MESSAGES[ERROR_CODES.UNAUTHORIZED];
        
        // Ejecutar callback de no autorizado (ej: redirect a login)
        if (onUnauthorized && typeof onUnauthorized === 'function') {
          onUnauthorized();
        }
        break;
        
      case 403:
        errorCode = ERROR_CODES.FORBIDDEN;
        userMessage = data?.error || USER_FRIENDLY_MESSAGES[ERROR_CODES.FORBIDDEN];
        break;
        
      case 404:
        errorCode = ERROR_CODES.NOT_FOUND;
        userMessage = data?.error || USER_FRIENDLY_MESSAGES[ERROR_CODES.NOT_FOUND];
        break;
        
      case 409:
        errorCode = ERROR_CODES.ALREADY_EXISTS;
        userMessage = data?.error || USER_FRIENDLY_MESSAGES[ERROR_CODES.ALREADY_EXISTS];
        break;
        
      case 422:
        errorCode = ERROR_CODES.VALIDATION_ERROR;
        userMessage = data?.error || USER_FRIENDLY_MESSAGES[ERROR_CODES.VALIDATION_ERROR];
        break;
        
      case 429:
        errorCode = ERROR_CODES.QUOTA_EXCEEDED;
        userMessage = data?.error || USER_FRIENDLY_MESSAGES[ERROR_CODES.QUOTA_EXCEEDED];
        break;
        
      case 500:
      case 502:
      case 503:
        errorCode = ERROR_CODES.SERVER_ERROR;
        userMessage = USER_FRIENDLY_MESSAGES[ERROR_CODES.SERVER_ERROR];
        break;
        
      default:
        errorCode = ERROR_CODES.UNKNOWN_ERROR;
        userMessage = data?.error || USER_FRIENDLY_MESSAGES[ERROR_CODES.UNKNOWN_ERROR];
    }
    
    appError = new AppError(userMessage, errorCode, {
      status,
      data,
      url: error.config?.url,
      method: error.config?.method,
    });
    
  } else if (error.request) {
    // Error de red (sin respuesta del servidor)
    errorCode = ERROR_CODES.NETWORK_ERROR;
    userMessage = USER_FRIENDLY_MESSAGES[ERROR_CODES.NETWORK_ERROR];
    
    appError = new AppError(userMessage, errorCode, {
      request: error.request,
    });
    
  } else {
    // Error en configuración de la solicitud u otro error
    errorCode = ERROR_CODES.UNKNOWN_ERROR;
    userMessage = error.message || USER_FRIENDLY_MESSAGES[ERROR_CODES.UNKNOWN_ERROR];
    
    appError = new AppError(userMessage, errorCode, {
      originalError: error,
    });
  }

  // Loguear en consola (solo en desarrollo)
  if (logToConsole) {
    console.group(`🚨 [API Error] ${errorCode}`);
    console.error('Message:', appError.message);
    console.error('Code:', appError.code);
    console.error('Details:', appError.details);
    console.error('Timestamp:', appError.timestamp);
    console.error('Original Error:', error);
    console.groupEnd();
  }

  // Mostrar notificación al usuario
  if (showNotification && notifications) {
    if (notifications.error && typeof notifications.error === 'function') {
      notifications.error(userMessage);
    } else if (notifications.showNotification && typeof notifications.showNotification === 'function') {
      notifications.showNotification(userMessage, 'error');
    }
  }

  return appError;
}

/**
 * Maneja errores de validación de formularios
 * 
 * @param {Object} validationErrors - Objeto con errores de validación
 * @param {Object} notifications - Sistema de notificaciones
 * @returns {AppError}
 */
export function handleValidationError(validationErrors, notifications) {
  const errorMessages = Object.values(validationErrors).filter(Boolean);
  const firstError = errorMessages[0] || 'Por favor, verifica los datos ingresados.';
  
  const appError = new AppError(
    firstError,
    ERROR_CODES.VALIDATION_ERROR,
    { validationErrors }
  );

  if (notifications?.error) {
    notifications.error(firstError);
  }

  return appError;
}

/**
 * Maneja errores de reglas de negocio
 * 
 * @param {string} message - Mensaje de error
 * @param {Object} notifications - Sistema de notificaciones
 * @param {Object} details - Detalles adicionales
 * @returns {AppError}
 */
export function handleBusinessRuleError(message, notifications, details = null) {
  const appError = new AppError(
    message,
    ERROR_CODES.BUSINESS_RULE_VIOLATION,
    details
  );

  if (notifications?.error) {
    notifications.error(message);
  }

  return appError;
}

/**
 * Wrapper para ejecutar operaciones async con manejo de errores
 * 
 * @param {Function} operation - Función async a ejecutar
 * @param {Object} notifications - Sistema de notificaciones
 * @param {Object} options - Opciones de manejo de errores
 * @returns {Promise<[Error|null, any]>} Tupla [error, resultado]
 */
export async function withErrorHandling(operation, notifications, options = {}) {
  try {
    const result = await operation();
    return [null, result];
  } catch (error) {
    const appError = handleApiError(error, notifications, options);
    return [appError, null];
  }
}

/**
 * Verifica si un error es de un tipo específico
 * 
 * @param {Error} error - Error a verificar
 * @param {string} errorCode - Código de error a comparar
 * @returns {boolean}
 */
export function isErrorType(error, errorCode) {
  return error instanceof AppError && error.code === errorCode;
}

/**
 * Extrae mensaje de error de diferentes formatos
 * 
 * @param {Error|string|Object} error - Error en cualquier formato
 * @returns {string} Mensaje de error
 */
export function extractErrorMessage(error) {
  if (typeof error === 'string') {
    return error;
  }
  
  if (error instanceof AppError) {
    return error.message;
  }
  
  if (error?.response?.data?.error) {
    return error.response.data.error;
  }
  
  if (error?.message) {
    return error.message;
  }
  
  return USER_FRIENDLY_MESSAGES[ERROR_CODES.UNKNOWN_ERROR];
}
