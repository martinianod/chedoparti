import { describe, it, expect, vi } from 'vitest';
import { calculateReservationPrice, durationToMinutes } from './priceCalculator';

// Mock dependencies
vi.mock('../services/institutionConfig', () => ({
  calculateReservationPrice: vi.fn(({ durationMinutes }) => ({
    basePrice: 2000,
    totalPrice: (durationMinutes / 60) * 2000,
    isPeakHour: false,
    isWeekend: false,
    durationHours: durationMinutes / 60,
    breakdown: []
  })),
  getPricingConfig: vi.fn()
}));

describe('priceCalculator', () => {
  describe('durationToMinutes', () => {
    it('converts "01:30" to 90 minutes', () => {
      expect(durationToMinutes('01:30')).toBe(90);
    });

    it('converts "02:00" to 120 minutes', () => {
      expect(durationToMinutes('02:00')).toBe(120);
    });

    it('returns 0 for invalid input', () => {
      expect(durationToMinutes('')).toBe(0);
      expect(durationToMinutes(null)).toBe(0);
    });
  });

  describe('calculateReservationPrice', () => {
    it('calculates base price correctly for 1 hour', () => {
      const result = calculateReservationPrice({
        courtId: 1,
        startTime: '10:00',
        duration: '01:00',
        isMember: false
      });

      expect(result.price).toBe(2000);
      expect(result.breakdown.memberDiscount).toBe(0);
    });

    it('calculates base price correctly for 1.5 hours', () => {
      const result = calculateReservationPrice({
        courtId: 1,
        startTime: '10:00',
        duration: '01:30',
        isMember: false
      });

      // 1.5 * 2000 = 3000
      expect(result.price).toBe(3000);
    });

    it('applies 10% discount for members', () => {
      const result = calculateReservationPrice({
        courtId: 1,
        startTime: '10:00',
        duration: '01:00',
        isMember: true
      });

      // 2000 - 10% = 1800
      expect(result.price).toBe(1800);
      expect(result.breakdown.memberDiscount).toBe(200);
    });

    it('rounds final price to nearest 100', async () => {
      // Mock a weird price to test rounding
      vi.mocked(await import('../services/institutionConfig')).calculateReservationPrice.mockReturnValueOnce({
        basePrice: 2000,
        totalPrice: 2050, // 2050 - 10% (205) = 1845 -> round to 1800 or 1900? Math.round(18.45)*100 = 1800
        isPeakHour: false,
        isWeekend: false,
        durationHours: 1,
        breakdown: []
      });

      const result = calculateReservationPrice({
        courtId: 1,
        startTime: '10:00',
        duration: '01:00',
        isMember: true
      });

      // 2050 - 205 = 1845. Round to 100 -> 1800
      expect(result.price).toBe(1800);
    });
  });
});
