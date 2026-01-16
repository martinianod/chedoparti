import apiClient from '../api/client';

/**
 * Attendance API Service
 * Handles all attendance-related API calls
 */
export const attendanceApi = {
  /**
   * List attendance for a group in a specific week
   */
  list: async (groupId, weekStart) => {
    const params = { groupId, weekStart };
    return apiClient.get('/attendance', { params });
  },

  /**
   * Mark attendance for a student in a specific schedule
   */
  mark: async (data) => {
    return apiClient.post('/attendance', data);
  },

  /**
   * Bulk mark attendance for a schedule
   */
  markBulk: async (scheduleId, attendanceList) => {
    return apiClient.post('/attendance/bulk', { scheduleId, attendanceList });
  },

  /**
   * Get attendance statistics for a coach
   */
  getStats: async (coachId, startDate, endDate) => {
    const params = { coachId };
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    return apiClient.get('/attendance/stats', { params });
  },
};

export default attendanceApi;
