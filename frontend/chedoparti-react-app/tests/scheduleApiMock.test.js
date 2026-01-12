/**
 * Tests para el sistema de sincronización de horarios en la API mock
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Simulamos la implementación de api.mock.js
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

const mockWindow = {
  dispatchEvent: vi.fn(),
};

// Mock de updateInstitutionSchedule
const mockUpdateInstitutionSchedule = vi.fn();
const mockUpdateSlotInterval = vi.fn();

global.localStorage = mockLocalStorage;
global.window = mockWindow;

// Simulación del schedulesApi del archivo api.mock.js
class MockSchedulesApi {
  async update(data) {
    // Simular la transformación que hace el código real
    const transformedSchedule = {};

    if (data.groups) {
      // Transformar formato groups a formato ranges
      Object.entries(data.groups).forEach(([day, group]) => {
        transformedSchedule[day] = {
          enabled: group.enabled,
          ranges:
            group.slots?.map((slot) => ({
              openTime: slot.start,
              closeTime: slot.end,
            })) || [],
        };
      });
    }

    // Simular persistencia
    await mockUpdateInstitutionSchedule(transformedSchedule);

    if (data.slotInterval !== undefined) {
      await mockUpdateSlotInterval(data.slotInterval);
    }

    return {
      success: true,
      message: 'Horarios actualizados correctamente',
      data: transformedSchedule,
    };
  }

  async get() {
    // Simular obtener horarios desde localStorage
    const scheduleData = mockLocalStorage.getItem('institution_schedule');
    const slotInterval = mockLocalStorage.getItem('slot_interval');

    let schedule = {};

    // Manejar JSON malformado de forma segura
    if (scheduleData) {
      try {
        schedule = JSON.parse(scheduleData);
      } catch (error) {
        // Si el JSON es malformado, usar objeto vacío por defecto
        schedule = {};
      }
    }

    // Transformar formato ranges a formato groups para la UI
    const groups = {};
    Object.entries(schedule).forEach(([day, config]) => {
      groups[day] = {
        enabled: config.enabled,
        slots:
          config.ranges?.map((range) => ({
            start: range.openTime,
            end: range.closeTime,
          })) || [],
      };
    });

    return {
      groups,
      slotInterval: slotInterval ? parseInt(slotInterval) : 30,
    };
  }
}

describe('Schedule API Mock Integration', () => {
  let schedulesApi;

  beforeEach(() => {
    schedulesApi = new MockSchedulesApi();
    vi.clearAllMocks();
  });

  afterEach(() => {
    mockLocalStorage.clear();
  });

  describe('schedule transformation', () => {
    it('should transform groups format to ranges format', async () => {
      const inputData = {
        groups: {
          lunes: {
            enabled: true,
            slots: [
              { start: '08:00', end: '12:00' },
              { start: '16:00', end: '20:00' },
            ],
          },
          martes: {
            enabled: false,
            slots: [{ start: '09:00', end: '21:00' }],
          },
        },
        slotInterval: 60,
      };

      const result = await schedulesApi.update(inputData);

      expect(result.success).toBe(true);
      expect(mockUpdateInstitutionSchedule).toHaveBeenCalledWith({
        lunes: {
          enabled: true,
          ranges: [
            { openTime: '08:00', closeTime: '12:00' },
            { openTime: '16:00', closeTime: '20:00' },
          ],
        },
        martes: {
          enabled: false,
          ranges: [{ openTime: '09:00', closeTime: '21:00' }],
        },
      });

      expect(mockUpdateSlotInterval).toHaveBeenCalledWith(60);
    });

    it('should handle empty slots array', async () => {
      const inputData = {
        groups: {
          domingo: {
            enabled: false,
            slots: [],
          },
        },
      };

      const result = await schedulesApi.update(inputData);

      expect(mockUpdateInstitutionSchedule).toHaveBeenCalledWith({
        domingo: {
          enabled: false,
          ranges: [],
        },
      });
    });

    it('should handle missing slots property', async () => {
      const inputData = {
        groups: {
          sabado: {
            enabled: true,
            // slots no definido
          },
        },
      };

      const result = await schedulesApi.update(inputData);

      expect(mockUpdateInstitutionSchedule).toHaveBeenCalledWith({
        sabado: {
          enabled: true,
          ranges: [],
        },
      });
    });
  });

  describe('schedule retrieval and reverse transformation', () => {
    it('should transform ranges format back to groups format for UI', async () => {
      // Mock localStorage con formato ranges
      mockLocalStorage.getItem.mockImplementation((key) => {
        if (key === 'institution_schedule') {
          return JSON.stringify({
            miercoles: {
              enabled: true,
              ranges: [
                { openTime: '07:00', closeTime: '11:00' },
                { openTime: '15:00', closeTime: '23:00' },
              ],
            },
          });
        }
        if (key === 'slot_interval') {
          return '45';
        }
        return null;
      });

      const result = await schedulesApi.get();

      expect(result).toEqual({
        groups: {
          miercoles: {
            enabled: true,
            slots: [
              { start: '07:00', end: '11:00' },
              { start: '15:00', end: '23:00' },
            ],
          },
        },
        slotInterval: 45,
      });
    });

    it('should return default values when no data stored', async () => {
      mockLocalStorage.getItem.mockReturnValue(null);

      const result = await schedulesApi.get();

      expect(result).toEqual({
        groups: {},
        slotInterval: 30,
      });
    });

    it('should handle ranges format without ranges property', async () => {
      mockLocalStorage.getItem.mockImplementation((key) => {
        if (key === 'institution_schedule') {
          return JSON.stringify({
            jueves: {
              enabled: false,
              // ranges no definido
            },
          });
        }
        return null;
      });

      const result = await schedulesApi.get();

      expect(result.groups.jueves).toEqual({
        enabled: false,
        slots: [],
      });
    });
  });

  describe('slot interval handling', () => {
    it('should update slot interval when provided', async () => {
      const inputData = {
        groups: {},
        slotInterval: 90,
      };

      await schedulesApi.update(inputData);

      expect(mockUpdateSlotInterval).toHaveBeenCalledWith(90);
    });

    it('should not update slot interval when not provided', async () => {
      const inputData = {
        groups: {
          viernes: {
            enabled: true,
            slots: [{ start: '10:00', end: '18:00' }],
          },
        },
        // slotInterval no definido
      };

      await schedulesApi.update(inputData);

      expect(mockUpdateSlotInterval).not.toHaveBeenCalled();
    });
  });

  describe('error handling and edge cases', () => {
    it('should handle malformed schedule data gracefully', async () => {
      mockLocalStorage.getItem.mockImplementation((key) => {
        if (key === 'institution_schedule') {
          return 'invalid json';
        }
        return null;
      });

      // No debe lanzar error, debe usar valores por defecto
      await expect(schedulesApi.get()).resolves.toEqual({
        groups: {},
        slotInterval: 30,
      });
    });

    it('should handle complex nested schedule updates', async () => {
      const complexData = {
        groups: {
          lunes: { enabled: true, slots: [{ start: '06:00', end: '24:00' }] },
          martes: {
            enabled: true,
            slots: [
              { start: '08:00', end: '12:00' },
              { start: '14:00', end: '22:00' },
            ],
          },
          miercoles: { enabled: false, slots: [] },
          jueves: { enabled: true, slots: [{ start: '09:30', end: '18:45' }] },
          viernes: { enabled: true, slots: [{ start: '07:15', end: '23:30' }] },
          sabado: { enabled: true, slots: [{ start: '10:00', end: '20:00' }] },
          domingo: { enabled: false, slots: [] },
        },
        slotInterval: 15,
      };

      const result = await schedulesApi.update(complexData);

      expect(result.success).toBe(true);
      expect(mockUpdateInstitutionSchedule).toHaveBeenCalledWith(
        expect.objectContaining({
          lunes: { enabled: true, ranges: [{ openTime: '06:00', closeTime: '24:00' }] },
          martes: {
            enabled: true,
            ranges: [
              { openTime: '08:00', closeTime: '12:00' },
              { openTime: '14:00', closeTime: '22:00' },
            ],
          },
          miercoles: { enabled: false, ranges: [] },
          jueves: { enabled: true, ranges: [{ openTime: '09:30', closeTime: '18:45' }] },
          viernes: { enabled: true, ranges: [{ openTime: '07:15', closeTime: '23:30' }] },
          sabado: { enabled: true, ranges: [{ openTime: '10:00', closeTime: '20:00' }] },
          domingo: { enabled: false, ranges: [] },
        })
      );
      expect(mockUpdateSlotInterval).toHaveBeenCalledWith(15);
    });
  });
});
