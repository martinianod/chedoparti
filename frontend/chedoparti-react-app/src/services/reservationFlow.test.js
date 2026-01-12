import { describe, it, expect, beforeEach } from 'vitest';
import { reservationsApi } from './api.mock';

describe('Reservation Flow Integration', () => {
  let createdReservationId;

  // Mock localStorage for auth
  beforeEach(() => {
    global.localStorage = {
      getItem: (key) => {
        if (key === 'token') return 'mock_token_socio@example.com';
        return null;
      },
      setItem: () => {},
      removeItem: () => {}
    };
  });

  it('completes a full reservation lifecycle', async () => {
    // 1. Create Reservation
    const newReservation = {
      courtId: 1,
      startAt: '2024-12-01T10:00:00',
      endAt: '2024-12-01T11:30:00',
      sport: 'Padel',
      type: 'Normal'
    };

    const createResponse = await reservationsApi.create(newReservation);
    expect(createResponse.data).toBeDefined();
    expect(createResponse.data.id).toBeDefined();
    expect(createResponse.data.status).toBe('confirmed');
    expect(createResponse.data.duration).toBe('01:30'); // Calculated from dates

    createdReservationId = createResponse.data.id;

    // 2. Verify it exists in list
    const listResponse = await reservationsApi.list({ date: '2024-12-01' });
    const found = listResponse.data.find(r => r.id === createdReservationId);
    expect(found).toBeDefined();
    expect(found.courtId).toBe(1);

    // 3. Update Reservation (Change time)
    const updatePayload = {
      startAt: '2024-12-01T12:00:00',
      endAt: '2024-12-01T13:30:00'
    };

    const updateResponse = await reservationsApi.update(createdReservationId, updatePayload);
    expect(updateResponse.data.time).toBe('12:00');
    expect(updateResponse.data.date).toBe('2024-12-01');

    // 4. Cancel Reservation
    const cancelResponse = await reservationsApi.cancel(createdReservationId, { reason: 'Test cancel' });
    
    // Verify status changed
    const finalResponse = await reservationsApi.getById(createdReservationId);
    expect(finalResponse.data.status).toBe('cancelled');
    expect(finalResponse.data.statusReason).toBe('Test cancel');
  });
});
