/**
 * Test específico para verificar la corrección del problema de sincronización de horarios
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { generateTimeSlots, getSlotInterval } from '../src/services/institutionConfig.js';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

global.localStorage = localStorageMock;

describe('Schedule Fix Validation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Saturday Schedule Fix', () => {
    it('should generate Saturday slots from 9 AM to 10 PM with 30-minute intervals', () => {
      // Mock the corrected Saturday schedule
      localStorageMock.getItem.mockReturnValue(
        JSON.stringify({
          sabado: {
            enabled: true,
            ranges: [{ openTime: '09:00', closeTime: '22:00' }],
          },
        })
      );

      const slots = generateTimeSlots('sabado', 30);

      // Verify first and last slots
      expect(slots[0]).toBe('09:00');
      expect(slots[slots.length - 1]).toBe('21:30'); // 22:00 - 30min = 21:30

      // Verify some intermediate slots
      expect(slots).toContain('09:30');
      expect(slots).toContain('10:00');
      expect(slots).toContain('21:00');

      // Verify it doesn't include earlier or later times
      expect(slots).not.toContain('08:00');
      expect(slots).not.toContain('08:30');
      expect(slots).not.toContain('22:00');
      expect(slots).not.toContain('23:00');

      // Verify total number of slots (9 AM to 10 PM = 13 hours = 26 slots)
      expect(slots.length).toBe(26);
    });

    it('should use 30-minute default interval', () => {
      localStorageMock.getItem.mockReturnValue('30');

      const interval = getSlotInterval();

      expect(interval).toBe(30);
    });

    it('should generate correct slot progression with 30-minute intervals', () => {
      localStorageMock.getItem.mockReturnValue(
        JSON.stringify({
          sabado: {
            enabled: true,
            ranges: [{ openTime: '09:00', closeTime: '11:00' }],
          },
        })
      );

      const slots = generateTimeSlots('sabado', 30);

      // Should be exactly these slots for 2-hour window
      const expected = ['09:00', '09:30', '10:00', '10:30'];
      expect(slots).toEqual(expected);
    });
  });

  describe('Real-world scenario validation', () => {
    it('should match the expected UI display for Saturday 9 AM to 10 PM', () => {
      // This simulates exactly what the user should see
      localStorageMock.getItem.mockReturnValue(
        JSON.stringify({
          sabado: {
            enabled: true,
            ranges: [{ openTime: '09:00', closeTime: '22:00' }],
          },
        })
      );

      const slots = generateTimeSlots('sabado', 30);

      // User expects to see slots starting at 9 AM
      expect(slots[0]).toBe('09:00');

      // User expects NOT to see 8 AM slots
      expect(slots).not.toContain('08:00');
      expect(slots).not.toContain('08:30');

      // User expects to see evening slots but not past 10 PM
      expect(slots).toContain('21:00');
      expect(slots).toContain('21:30');
      expect(slots).not.toContain('22:00');
      expect(slots).not.toContain('22:30');
      expect(slots).not.toContain('23:00');

      // console.log(`📊 Total slots: ${slots.length} (from ${slots[0]} to ${slots[slots.length - 1]})`);
    });

    it('should work with the updated mock API data', () => {
      // Simulate what the mock API returns after our fix
      const mockApiGroups = [
        {
          days: ['sabado'],
          horarios: [{ open: '09:00', close: '22:00' }],
        },
      ];

      // Transform groups to ranges format (like the API mock does)
      const transformedSchedule = {};
      mockApiGroups.forEach((group) => {
        group.days.forEach((day) => {
          transformedSchedule[day] = {
            enabled: true,
            ranges: group.horarios.map((h) => ({
              openTime: h.open,
              closeTime: h.close,
            })),
          };
        });
      });

      // Mock localStorage with transformed data
      localStorageMock.getItem.mockReturnValue(JSON.stringify(transformedSchedule));

      const slots = generateTimeSlots('sabado', 30);

      expect(slots[0]).toBe('09:00');
      expect(slots[slots.length - 1]).toBe('21:30');
      expect(slots.length).toBe(26);
    });
  });
});
