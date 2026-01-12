import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  AppError,
  ERROR_CODES,
  handleApiError,
  handleValidationError,
  handleBusinessRuleError,
  withErrorHandling,
  isErrorType,
  extractErrorMessage,
} from '../src/utils/errorHandler';

describe('errorHandler', () => {
  let mockNotifications;

  beforeEach(() => {
    mockNotifications = {
      error: vi.fn(),
      success: vi.fn(),
    };
  });

  describe('AppError', () => {
    it('crea un error personalizado correctamente', () => {
      const error = new AppError('Test error', ERROR_CODES.VALIDATION_ERROR, { field: 'email' });

      expect(error.message).toBe('Test error');
      expect(error.code).toBe(ERROR_CODES.VALIDATION_ERROR);
      expect(error.details).toEqual({ field: 'email' });
      expect(error.timestamp).toBeDefined();
      expect(error.name).toBe('AppError');
    });

    it('usa valores por defecto si no se proporcionan', () => {
      const error = new AppError('Test error');

      expect(error.code).toBe('UNKNOWN_ERROR');
      expect(error.details).toBeNull();
    });
  });

  describe('handleApiError', () => {
    it('maneja error 401 (Unauthorized)', () => {
      const error = {
        response: {
          status: 401,
          data: { error: 'Token expirado' },
        },
      };

      const onUnauthorized = vi.fn();
      const result = handleApiError(error, mockNotifications, { onUnauthorized });

      expect(result).toBeInstanceOf(AppError);
      expect(result.code).toBe(ERROR_CODES.UNAUTHORIZED);
      expect(mockNotifications.error).toHaveBeenCalledWith(
        expect.stringContaining('sesión ha expirado')
      );
      expect(onUnauthorized).toHaveBeenCalled();
    });

    it('maneja error 403 (Forbidden)', () => {
      const error = {
        response: {
          status: 403,
          data: { error: 'No tienes permisos' },
        },
      };

      const result = handleApiError(error, mockNotifications);

      expect(result.code).toBe(ERROR_CODES.FORBIDDEN);
      expect(mockNotifications.error).toHaveBeenCalledWith('No tienes permisos');
    });

    it('maneja error 404 (Not Found)', () => {
      const error = {
        response: {
          status: 404,
          data: {},
        },
      };

      const result = handleApiError(error, mockNotifications);

      expect(result.code).toBe(ERROR_CODES.NOT_FOUND);
      expect(mockNotifications.error).toHaveBeenCalled();
    });

    it('maneja error 422 (Validation Error)', () => {
      const error = {
        response: {
          status: 422,
          data: { error: 'Datos inválidos' },
        },
      };

      const result = handleApiError(error, mockNotifications);

      expect(result.code).toBe(ERROR_CODES.VALIDATION_ERROR);
      expect(mockNotifications.error).toHaveBeenCalledWith('Datos inválidos');
    });

    it('maneja error 500 (Server Error)', () => {
      const error = {
        response: {
          status: 500,
          data: {},
        },
      };

      const result = handleApiError(error, mockNotifications);

      expect(result.code).toBe(ERROR_CODES.SERVER_ERROR);
      expect(mockNotifications.error).toHaveBeenCalled();
    });

    it('maneja error de red (sin respuesta)', () => {
      const error = {
        request: {},
      };

      const result = handleApiError(error, mockNotifications);

      expect(result.code).toBe(ERROR_CODES.NETWORK_ERROR);
      expect(mockNotifications.error).toHaveBeenCalledWith(
        expect.stringContaining('conexión')
      );
    });

    it('maneja error desconocido', () => {
      const error = new Error('Unknown error');

      const result = handleApiError(error, mockNotifications);

      expect(result.code).toBe(ERROR_CODES.UNKNOWN_ERROR);
      expect(mockNotifications.error).toHaveBeenCalled();
    });

    it('no muestra notificación si showNotification es false', () => {
      const error = {
        response: {
          status: 404,
          data: {},
        },
      };

      handleApiError(error, mockNotifications, { showNotification: false });

      expect(mockNotifications.error).not.toHaveBeenCalled();
    });
  });

  describe('handleValidationError', () => {
    it('maneja errores de validación correctamente', () => {
      const validationErrors = {
        email: 'Email inválido',
        password: 'Contraseña muy corta',
      };

      const result = handleValidationError(validationErrors, mockNotifications);

      expect(result).toBeInstanceOf(AppError);
      expect(result.code).toBe(ERROR_CODES.VALIDATION_ERROR);
      expect(result.message).toBe('Email inválido');
      expect(mockNotifications.error).toHaveBeenCalledWith('Email inválido');
    });

    it('usa mensaje por defecto si no hay errores', () => {
      const result = handleValidationError({}, mockNotifications);

      expect(result.message).toContain('verifica los datos');
    });
  });

  describe('handleBusinessRuleError', () => {
    it('crea error de regla de negocio correctamente', () => {
      const message = 'No puedes reservar más de 3 horas';
      const details = { maxHours: 3, requested: 4 };

      const result = handleBusinessRuleError(message, mockNotifications, details);

      expect(result).toBeInstanceOf(AppError);
      expect(result.code).toBe(ERROR_CODES.BUSINESS_RULE_VIOLATION);
      expect(result.message).toBe(message);
      expect(result.details).toEqual(details);
      expect(mockNotifications.error).toHaveBeenCalledWith(message);
    });
  });

  describe('withErrorHandling', () => {
    it('retorna resultado exitoso', async () => {
      const operation = vi.fn().mockResolvedValue({ data: 'success' });

      const [error, result] = await withErrorHandling(operation, mockNotifications);

      expect(error).toBeNull();
      expect(result).toEqual({ data: 'success' });
      expect(mockNotifications.error).not.toHaveBeenCalled();
    });

    it('captura y maneja errores', async () => {
      const operation = vi.fn().mockRejectedValue({
        response: { status: 404, data: {} },
      });

      const [error, result] = await withErrorHandling(operation, mockNotifications);

      expect(error).toBeInstanceOf(AppError);
      expect(error.code).toBe(ERROR_CODES.NOT_FOUND);
      expect(result).toBeNull();
      expect(mockNotifications.error).toHaveBeenCalled();
    });
  });

  describe('isErrorType', () => {
    it('identifica correctamente el tipo de error', () => {
      const error = new AppError('Test', ERROR_CODES.VALIDATION_ERROR);

      expect(isErrorType(error, ERROR_CODES.VALIDATION_ERROR)).toBe(true);
      expect(isErrorType(error, ERROR_CODES.NOT_FOUND)).toBe(false);
    });

    it('retorna false para errores que no son AppError', () => {
      const error = new Error('Regular error');

      expect(isErrorType(error, ERROR_CODES.VALIDATION_ERROR)).toBe(false);
    });
  });

  describe('extractErrorMessage', () => {
    it('extrae mensaje de string', () => {
      expect(extractErrorMessage('Error message')).toBe('Error message');
    });

    it('extrae mensaje de AppError', () => {
      const error = new AppError('App error message');
      expect(extractErrorMessage(error)).toBe('App error message');
    });

    it('extrae mensaje de error de Axios', () => {
      const error = {
        response: {
          data: {
            error: 'API error message',
          },
        },
      };
      expect(extractErrorMessage(error)).toBe('API error message');
    });

    it('extrae mensaje de Error estándar', () => {
      const error = new Error('Standard error');
      expect(extractErrorMessage(error)).toBe('Standard error');
    });

    it('retorna mensaje por defecto para valores desconocidos', () => {
      expect(extractErrorMessage(null)).toContain('inesperado');
      expect(extractErrorMessage(undefined)).toContain('inesperado');
      expect(extractErrorMessage({})).toContain('inesperado');
    });
  });
});
