import apiClient from '../api/client';

/**
 * Student Classes API Service
 * Handles all class-related API calls for students
 */
export const studentClassesApi = {
  /**
   * Get all classes for a student in a date range
   */
  list: async (studentId, startDate, endDate, options = {}) => {
    const params = { studentId, startDate, endDate };
    if (options.status) params.status = options.status;

    return apiClient.get(`/students/${studentId}/classes`, { params });
  },

  /**
   * Get a single class by ID
   */
  get: async (studentId, classId) => {
    return apiClient.get(`/students/${studentId}/classes/${classId}`);
  },

  /**
   * Confirm or decline attendance
   */
  confirmAttendance: async (classId, status, notes = null) => {
    return apiClient.post(`/students/classes/${classId}/attendance`, {
      status,
      notes
    });
  },

  /**
   * Get attendance history for a student
   */
  getAttendanceHistory: async (studentId, startDate, endDate) => {
    return apiClient.get(`/students/${studentId}/attendance-history`, {
      params: { startDate, endDate }
    });
  }
};

export default studentClassesApi;
