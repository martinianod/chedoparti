import axios from 'axios';
import { mockStore } from './coachMockData';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
const USE_MOCK = true; // Enable demo mode

const delay = (ms = 500) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Coach Schedules API Service
 * Handles all schedule-related API calls for coaches
 */
export const coachSchedulesApi = {
  /**
   * List all schedules for a coach in a specific week
   */
  list: async (coachId, weekStart, options = {}) => {
    if (USE_MOCK) {
      await delay();
      let schedules = mockStore.getSchedules();
      
      // Filter by week (simple check if date is within 7 days of weekStart)
      // In a real app, we'd do proper date range query
      const start = new Date(weekStart);
      const end = new Date(start);
      end.setDate(end.getDate() + 7);
      
      schedules = schedules.filter(s => {
        const sDate = new Date(s.date);
        return sDate >= start && sDate < end;
      });

      if (options.sport) {
        // We need to look up group sport or court sport
        // For simplicity, we assume the schedule object has sport or we skip this filter in mock
      }
      if (options.groupId) {
        schedules = schedules.filter(s => s.groupId === Number(options.groupId));
      }

      return { data: schedules };
    }

    const params = new URLSearchParams();
    params.append('coachId', coachId);
    params.append('weekStart', weekStart);
    
    if (options.sport) params.append('sport', options.sport);
    if (options.groupId) params.append('groupId', options.groupId);

    return axios.get(`${API_BASE_URL}/api/coach-schedules?${params.toString()}`);
  },

  /**
   * Get a single schedule by ID
   */
  get: async (id) => {
    if (USE_MOCK) {
      await delay();
      const schedule = mockStore.getSchedules().find(s => s.id === Number(id));
      return { data: schedule };
    }
    return axios.get(`${API_BASE_URL}/api/coach-schedules/${id}`);
  },

  /**
   * Create a new schedule (and linked reservations)
   */
  create: async (data) => {
    if (USE_MOCK) {
      await delay();
      const schedules = mockStore.getSchedules();
      const newSchedule = {
        ...data,
        id: Date.now(),
        status: 'SCHEDULED'
      };
      mockStore.setSchedules([...schedules, newSchedule]);
      return { data: newSchedule };
    }
    return axios.post(`${API_BASE_URL}/api/coach-schedules`, data);
  },

  /**
   * Update an existing schedule
   */
  update: async (id, data) => {
    if (USE_MOCK) {
      await delay();
      const schedules = mockStore.getSchedules();
      const index = schedules.findIndex(s => s.id === Number(id));
      if (index !== -1) {
        const updatedSchedule = { ...schedules[index], ...data };
        schedules[index] = updatedSchedule;
        mockStore.setSchedules(schedules);
        return { data: updatedSchedule };
      }
      throw new Error('Schedule not found');
    }
    return axios.put(`${API_BASE_URL}/api/coach-schedules/${id}`, data);
  },

  /**
   * Delete a schedule (cancels linked reservations)
   */
  delete: async (id) => {
    if (USE_MOCK) {
      await delay();
      const schedules = mockStore.getSchedules().filter(s => s.id !== Number(id));
      mockStore.setSchedules(schedules);
      return { data: { success: true } };
    }
    return axios.delete(`${API_BASE_URL}/api/coach-schedules/${id}`);
  },

  /**
   * Check court availability for a time slot
   */
  checkAvailability: async (params) => {
    if (USE_MOCK) {
      await delay(200);
      return { data: { available: true } }; // Always available in demo
    }
    return axios.post(`${API_BASE_URL}/api/coach-schedules/check-availability`, params);
  },

  /**
   * Get schedules by group ID
   */
  getByGroup: async (groupId) => {
    if (USE_MOCK) {
      await delay();
      const schedules = mockStore.getSchedules().filter(s => s.groupId === Number(groupId));
      return { data: schedules };
    }
    return axios.get(`${API_BASE_URL}/api/coach-schedules/by-group/${groupId}`);
  },

  /**
   * Create recurring schedules (weekly repeat)
   */
  createRecurring: async (data) => {
    if (USE_MOCK) {
      await delay(1000);
      const schedules = mockStore.getSchedules();
      const newSchedules = [];
      
      // Create 4 weeks of schedules for demo
      const { startDate, weeks = 4, ...scheduleData } = data;
      const start = new Date(startDate);
      
      for (let i = 0; i < weeks; i++) {
        const date = new Date(start);
        date.setDate(date.getDate() + (i * 7));
        
        const newSchedule = {
          ...scheduleData,
          date: date.toISOString().split('T')[0],
          id: Date.now() + i,
          status: 'SCHEDULED'
        };
        newSchedules.push(newSchedule);
      }
      
      mockStore.setSchedules([...schedules, ...newSchedules]);
      return { data: newSchedules };
    }
    return axios.post(`${API_BASE_URL}/api/coach-schedules/recurring`, data);
  },

  /**
   * Get all reservations linked to a schedule
   */
  getLinkedReservations: async (scheduleId) => {
    if (USE_MOCK) {
      return { data: [] };
    }
    return axios.get(`${API_BASE_URL}/api/coach-schedules/${scheduleId}/reservations`);
  },
};

export default coachSchedulesApi;
