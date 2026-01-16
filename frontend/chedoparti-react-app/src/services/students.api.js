import apiClient from '../api/client';

/**
 * Students API Service
 * Handles all student-related API calls for coaches
 */
export const studentsApi = {
  /**
   * List all students for a coach
   */
  list: async (coachId, filters = {}) => {
    const params = { coachId };
    
    if (filters.level) params.level = filters.level;
    if (filters.sport) params.sport = filters.sport;
    if (filters.isMember !== undefined) params.isMember = filters.isMember;
    if (filters.groupId) params.groupId = filters.groupId;
    if (filters.search) params.search = filters.search;

    return apiClient.get('/students', { params });
  },

  /**
   * Get a single student by ID
   */
  get: async (id) => {
    return apiClient.get(`/students/${id}`);
  },

  /**
   * Create a new student
   */
  create: async (data) => {
    return apiClient.post('/students', data);
  },

  /**
   * Update an existing student
   */
  update: async (id, data) => {
    return apiClient.put(`/students/${id}`, data);
  },

  /**
   * Soft delete a student
   */
  delete: async (id) => {
    return apiClient.delete(`/students/${id}`);
  },

  /**
   * Search for members
   */
  searchMembers: async (query, institutionId) => {
    const params = { q: query, institutionId };
    return apiClient.get('/students/search-members', { params });
  },

  /**
   * Get students by group ID
   */
  getByGroup: async (groupId) => {
    return apiClient.get(`/students/by-group/${groupId}`);
  },
};

export default studentsApi;
