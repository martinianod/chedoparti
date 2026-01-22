import apiClient from '../api/client';

/**
 * Groups API Service
 * Handles all group-related API calls for coaches
 */
export const groupsApi = {
  /**
   * List all groups for a coach
   */
  list: async (coachId, options = {}) => {
    const params = { coachId };
    if (options.includeArchived) params.includeArchived = true;
    if (options.sport) params.sport = options.sport;
    
    return apiClient.get('/groups', { params });
  },

  /**
   * Get a single group by ID
   */
  get: async (id) => {
    return apiClient.get(`/groups/${id}`);
  },

  /**
   * Create a new group
   */
  create: async (data) => {
    return apiClient.post('/groups', data);
  },

  /**
   * Update an existing group
   */
  update: async (id, data) => {
    return apiClient.put(`/groups/${id}`, data);
  },

  /**
   * Archive a group (soft delete)
   */
  archive: async (id) => {
    return apiClient.patch(`/groups/${id}/archive`);
  },

  /**
   * Restore an archived group
   */
  restore: async (id) => {
    return apiClient.patch(`/groups/${id}/restore`);
  },

  /**
   * Duplicate a group
   */
  duplicate: async (id) => {
    return apiClient.post(`/groups/${id}/duplicate`);
  },

  /**
   * Add a student to a group
   */
  addStudent: async (groupId, studentId) => {
    return apiClient.post(`/groups/${groupId}/students`, { studentId });
  },

  /**
   * Remove a student from a group
   */
  removeStudent: async (groupId, studentId) => {
    return apiClient.delete(`/groups/${groupId}/students/${studentId}`);
  },

  /**
   * Reorder students within a group
   */
  reorderStudents: async (groupId, studentIds) => {
    return apiClient.put(`/groups/${groupId}/students/reorder`, { studentIds });
  },

  /**
   * Get all students in a group
   */
  getStudents: async (groupId) => {
    return apiClient.get(`/groups/${groupId}/students`);
  },
};

export default groupsApi;
