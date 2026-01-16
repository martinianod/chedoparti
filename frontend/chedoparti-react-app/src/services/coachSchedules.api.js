import apiClient from '../api/client';

/**
 * Coach Schedules API Service
 * Handles all schedule-related API calls for coaches
 */
export const coachSchedulesApi = {
  /**
   * List all schedules for a coach in a specific week
   */
  list: async (coachId, weekStart, options = {}) => {
    const params = { coachId, weekStart };
    
    if (options.sport) params.sport = options.sport;
    if (options.groupId) params.groupId = options.groupId;

    return apiClient.get('/coach-schedules', { params });
  },

  /**
   * Get a single schedule by ID
   */
  get: async (id) => {
    return apiClient.get(`/coach-schedules/${id}`);
  },

  /**
   * Create a new schedule (and linked reservations)
   */
  create: async (data) => {
    return apiClient.post('/coach-schedules', data);
  },

  /**
   * Update an existing schedule
   */
  update: async (id, data) => {
    return apiClient.put(`/coach-schedules/${id}`, data);
  },

  /**
   * Delete a schedule (cancels linked reservations)
   */
  delete: async (id) => {
    return apiClient.delete(`/coach-schedules/${id}`);
  },

  /**
   * Check court availability for a time slot
   */
  checkAvailability: async (params) => {
    return apiClient.post('/coach-schedules/check-availability', params);
  },

  /**
   * Get schedules by group ID
   */
  getByGroup: async (groupId) => {
    return apiClient.get(`/coach-schedules/by-group/${groupId}`);
  },

  /**
   * Create recurring schedules (weekly repeat)
   */
  createRecurring: async (data) => {
    return apiClient.post('/coach-schedules/recurring', data);
  },

  /**
   * Get all reservations linked to a schedule
   */
  getLinkedReservations: async (scheduleId) => {
    return apiClient.get(`/coach-schedules/${scheduleId}/reservations`);
  },
};

export default coachSchedulesApi;
