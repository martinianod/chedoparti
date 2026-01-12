/**
 * Tests para el sistema de configuración de horarios de la institución
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  generateTimeSlots,
  isWithinOperatingHours,
  getInstitutionSchedule,
  updateInstitutionSchedule,
  getDayOfWeekSpanish,
  getSlotInterval,
  updateSlotInterval,
} from '../src/services/institutionConfig.js';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

// Mock window
const windowMock = {
  dispatchEvent: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
};

global.localStorage = localStorageMock;
global.window = windowMock;

describe('Institution Config Service', () => {
  beforeEach(() => {
    // Limpiar mocks antes de cada test
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Limpiar localStorage mock después de cada test
    localStorageMock.clear();
  });

  describe('generateTimeSlots', () => {
    it('should generate time slots for a simple day schedule', () => {
      // Mock schedule simple
      localStorageMock.getItem.mockReturnValue(
        JSON.stringify({
          lunes: {
            enabled: true,
            ranges: [{ openTime: '08:00', closeTime: '12:00' }],
          },
        })
      );

      const slots = generateTimeSlots('lunes', 60);

      expect(slots).toEqual(['08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30']);
    });

    it('should generate time slots for multiple ranges per day', () => {
      // Mock schedule con múltiples rangos
      localStorageMock.getItem.mockReturnValue(
        JSON.stringify({
          viernes: {
            enabled: true,
            ranges: [
              { openTime: '08:00', closeTime: '12:00' },
              { openTime: '14:00', closeTime: '18:00' },
            ],
          },
        })
      );

      const slots = generateTimeSlots('viernes', 120); // 2 horas

      expect(slots).toEqual([
        '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
        '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'
      ]);
    });

    it('should handle legacy format (openTime/closeTime direct)', () => {
      localStorageMock.getItem.mockReturnValue(
        JSON.stringify({
          lunes: {
            enabled: true,
            openTime: '09:00',
            closeTime: '11:00',
          },
        })
      );

      const slots = generateTimeSlots('lunes', 30);

      expect(slots).toEqual(['09:00', '09:30', '10:00', '10:30']);
    });

    it('should return empty array for disabled days', () => {
      localStorageMock.getItem.mockReturnValue(
        JSON.stringify({
          domingo: {
            enabled: false,
            ranges: [{ openTime: '08:00', closeTime: '20:00' }],
          },
        })
      );

      const slots = generateTimeSlots('domingo', 60);

      expect(slots).toEqual([]);
    });

    it('should handle overlapping ranges without duplicates', () => {
      localStorageMock.getItem.mockReturnValue(
        JSON.stringify({
          sabado: {
            enabled: true,
            ranges: [
              { openTime: '08:00', closeTime: '12:00' },
              { openTime: '11:00', closeTime: '15:00' },
            ],
          },
        })
      );

      const slots = generateTimeSlots('sabado', 60);

      // Debe incluir cada slot solo una vez, ordenado
      expect(slots).toEqual([
        '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
        '12:00', '12:30', '13:00', '13:30', '14:00', '14:30'
      ]);
    });
  });

  describe('isWithinOperatingHours', () => {
    it('should validate time within single range', () => {
      localStorageMock.getItem.mockReturnValue(
        JSON.stringify({
          martes: {
            enabled: true,
            ranges: [{ openTime: '08:00', closeTime: '20:00' }],
          },
        })
      );

      expect(isWithinOperatingHours('martes', '10:00')).toBe(true);
      expect(isWithinOperatingHours('martes', '08:00')).toBe(true);
      expect(isWithinOperatingHours('martes', '19:59')).toBe(true);
      expect(isWithinOperatingHours('martes', '20:00')).toBe(false);
      expect(isWithinOperatingHours('martes', '07:59')).toBe(false);
    });

    it('should validate time within multiple ranges', () => {
      localStorageMock.getItem.mockReturnValue(
        JSON.stringify({
          miercoles: {
            enabled: true,
            ranges: [
              { openTime: '08:00', closeTime: '12:00' },
              { openTime: '14:00', closeTime: '22:00' },
            ],
          },
        })
      );

      expect(isWithinOperatingHours('miercoles', '10:00')).toBe(true);
      expect(isWithinOperatingHours('miercoles', '16:00')).toBe(true);
      expect(isWithinOperatingHours('miercoles', '13:00')).toBe(false); // Entre rangos
      expect(isWithinOperatingHours('miercoles', '23:00')).toBe(false); // Después del último
    });

    it('should handle legacy format', () => {
      localStorageMock.getItem.mockReturnValue(
        JSON.stringify({
          jueves: {
            enabled: true,
            openTime: '09:00',
            closeTime: '21:00',
          },
        })
      );

      expect(isWithinOperatingHours('jueves', '15:00')).toBe(true);
      expect(isWithinOperatingHours('jueves', '08:00')).toBe(false);
    });

    it('should return false for disabled days', () => {
      localStorageMock.getItem.mockReturnValue(
        JSON.stringify({
          domingo: {
            enabled: false,
            ranges: [{ openTime: '08:00', closeTime: '20:00' }],
          },
        })
      );

      expect(isWithinOperatingHours('domingo', '12:00')).toBe(false);
    });
  });

  describe('schedule persistence and events', () => {
    it('should save schedule to localStorage', async () => {
      const newSchedule = {
        lunes: {
          enabled: true,
          ranges: [{ openTime: '07:00', closeTime: '23:00' }],
        },
      };

      await updateInstitutionSchedule(newSchedule);

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'institution_schedule',
        JSON.stringify(newSchedule)
      );
    });

    it('should dispatch event when schedule is updated', async () => {
      const newSchedule = {
        martes: {
          enabled: true,
          ranges: [{ openTime: '08:30', closeTime: '22:30' }],
        },
      };

      await updateInstitutionSchedule(newSchedule);

      expect(windowMock.dispatchEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'institutionScheduleUpdated',
          detail: newSchedule,
        })
      );
    });

    it('should migrate legacy schedule format automatically', () => {
      const legacySchedule = {
        lunes: {
          enabled: true,
          openTime: '08:00',
          closeTime: '22:00',
        },
        martes: {
          enabled: false,
          openTime: '09:00',
          closeTime: '20:00',
        },
      };

      localStorageMock.getItem.mockReturnValue(JSON.stringify(legacySchedule));

      const schedule = getInstitutionSchedule();

      // Debe migrar automáticamente al formato nuevo
      expect(schedule.lunes).toEqual({
        enabled: true,
        ranges: [{ openTime: '08:00', closeTime: '22:00' }],
      });

      expect(schedule.martes).toEqual({
        enabled: false,
        ranges: [{ openTime: '09:00', closeTime: '20:00' }],
      });

      // Debe haber guardado el formato migrado
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'institution_schedule',
        expect.stringContaining('ranges')
      );
    });
  });

  describe('slot interval management', () => {
    it('should get default interval when none stored', () => {
      localStorageMock.getItem.mockReturnValue(null);

      const interval = getSlotInterval();

      expect(interval).toBe(30); // Default
    });

    it('should get stored interval', () => {
      localStorageMock.getItem.mockReturnValue('60');

      const interval = getSlotInterval();

      expect(interval).toBe(60);
    });

    it('should update slot interval', async () => {
      await updateSlotInterval(45);

      expect(localStorageMock.setItem).toHaveBeenCalledWith('slot_interval', '45');
    });
  });

  describe('utility functions', () => {
    it('should get correct Spanish day name', () => {
      // Usar fechas correctas (Dec 2, 2024 es domingo = 0, Dec 3 es lunes = 1, etc.)
      expect(getDayOfWeekSpanish('2024-12-02')).toBe('domingo'); // Dec 2, 2024 es domingo (0)
      expect(getDayOfWeekSpanish('2024-12-03')).toBe('lunes'); // Dec 3, 2024 es lunes (1)
      expect(getDayOfWeekSpanish('2024-12-04')).toBe('martes'); // Dec 4, 2024 es martes (2)
      expect(getDayOfWeekSpanish('2024-12-05')).toBe('miercoles'); // Dec 5, 2024 es miércoles (3)
      expect(getDayOfWeekSpanish('2024-12-06')).toBe('jueves'); // Dec 6, 2024 es jueves (4)
      expect(getDayOfWeekSpanish('2024-12-07')).toBe('viernes'); // Dec 7, 2024 es viernes (5)
      expect(getDayOfWeekSpanish('2024-12-08')).toBe('sabado'); // Dec 8, 2024 es sábado (6)
    });
  });
});
