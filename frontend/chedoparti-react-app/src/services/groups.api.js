import axios from 'axios';
import { mockStore } from './coachMockData';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
const USE_MOCK = true; // Enable demo mode

const delay = (ms = 500) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Groups API Service
 * Handles all group-related API calls for coaches
 */
export const groupsApi = {
  /**
   * List all groups for a coach
   */
  list: async (coachId, options = {}) => {
    if (USE_MOCK) {
      await delay();
      let groups = mockStore.getGroups();
      
      if (!options.includeArchived) {
        groups = groups.filter(g => !g.isArchived);
      }
      if (options.sport) {
        groups = groups.filter(g => g.sport === options.sport);
      }
      
      // Populate students for each group
      const allStudents = mockStore.getStudents();
      const groupsWithStudents = groups.map(g => ({
        ...g,
        students: allStudents.filter(s => (g.studentIds || []).includes(s.id))
      }));

      return { data: groupsWithStudents };
    }

    const params = new URLSearchParams();
    params.append('coachId', coachId);
    
    if (options.includeArchived) params.append('includeArchived', 'true');
    if (options.sport) params.append('sport', options.sport);

    return axios.get(`${API_BASE_URL}/api/groups?${params.toString()}`);
  },

  /**
   * Get a single group by ID
   */
  get: async (id) => {
    if (USE_MOCK) {
      await delay();
      const group = mockStore.getGroups().find(g => g.id === Number(id));
      if (!group) throw new Error('Group not found');
      
      const allStudents = mockStore.getStudents();
      group.students = allStudents.filter(s => (group.studentIds || []).includes(s.id));
      
      return { data: group };
    }
    return axios.get(`${API_BASE_URL}/api/groups/${id}`);
  },

  /**
   * Create a new group
   */
  create: async (data) => {
    if (USE_MOCK) {
      await delay();
      const groups = mockStore.getGroups();
      const newGroup = {
        ...data,
        id: Date.now(),
        studentIds: [],
        isArchived: false
      };
      mockStore.setGroups([...groups, newGroup]);
      return { data: newGroup };
    }
    return axios.post(`${API_BASE_URL}/api/groups`, data);
  },

  /**
   * Update an existing group
   */
  update: async (id, data) => {
    if (USE_MOCK) {
      await delay();
      const groups = mockStore.getGroups();
      const index = groups.findIndex(g => g.id === Number(id));
      if (index !== -1) {
        const updatedGroup = { ...groups[index], ...data };
        groups[index] = updatedGroup;
        mockStore.setGroups(groups);
        return { data: updatedGroup };
      }
      throw new Error('Group not found');
    }
    return axios.put(`${API_BASE_URL}/api/groups/${id}`, data);
  },

  /**
   * Archive a group (soft delete)
   */
  archive: async (id) => {
    if (USE_MOCK) {
      await delay();
      const groups = mockStore.getGroups();
      const index = groups.findIndex(g => g.id === Number(id));
      if (index !== -1) {
        groups[index].isArchived = true;
        mockStore.setGroups(groups);
        return { data: groups[index] };
      }
      throw new Error('Group not found');
    }
    return axios.patch(`${API_BASE_URL}/api/groups/${id}/archive`);
  },

  /**
   * Restore an archived group
   */
  restore: async (id) => {
    if (USE_MOCK) {
      await delay();
      const groups = mockStore.getGroups();
      const index = groups.findIndex(g => g.id === Number(id));
      if (index !== -1) {
        groups[index].isArchived = false;
        mockStore.setGroups(groups);
        return { data: groups[index] };
      }
      throw new Error('Group not found');
    }
    return axios.patch(`${API_BASE_URL}/api/groups/${id}/restore`);
  },

  /**
   * Duplicate a group
   */
  duplicate: async (id) => {
    if (USE_MOCK) {
      await delay();
      const groups = mockStore.getGroups();
      const original = groups.find(g => g.id === Number(id));
      if (original) {
        const newGroup = {
          ...original,
          id: Date.now(),
          name: `${original.name} (Copia)`,
          studentIds: [], // Don't copy students
        };
        mockStore.setGroups([...groups, newGroup]);
        return { data: newGroup };
      }
      throw new Error('Group not found');
    }
    return axios.post(`${API_BASE_URL}/api/groups/${id}/duplicate`);
  },

  /**
   * Add a student to a group
   */
  addStudent: async (groupId, studentId) => {
    if (USE_MOCK) {
      await delay();
      const groups = mockStore.getGroups();
      const index = groups.findIndex(g => g.id === Number(groupId));
      if (index !== -1) {
        const group = groups[index];
        if (!group.studentIds.includes(studentId)) {
          group.studentIds.push(studentId);
          mockStore.setGroups(groups);
        }
        return { data: group };
      }
      throw new Error('Group not found');
    }
    return axios.post(`${API_BASE_URL}/api/groups/${groupId}/students`, { studentId });
  },

  /**
   * Remove a student from a group
   */
  removeStudent: async (groupId, studentId) => {
    if (USE_MOCK) {
      await delay();
      const groups = mockStore.getGroups();
      const index = groups.findIndex(g => g.id === Number(groupId));
      if (index !== -1) {
        const group = groups[index];
        group.studentIds = group.studentIds.filter(id => id !== studentId);
        mockStore.setGroups(groups);
        return { data: group };
      }
      throw new Error('Group not found');
    }
    return axios.delete(`${API_BASE_URL}/api/groups/${groupId}/students/${studentId}`);
  },

  /**
   * Reorder students within a group
   */
  reorderStudents: async (groupId, studentIds) => {
    if (USE_MOCK) {
      await delay();
      const groups = mockStore.getGroups();
      const index = groups.findIndex(g => g.id === Number(groupId));
      if (index !== -1) {
        groups[index].studentIds = studentIds;
        mockStore.setGroups(groups);
        return { data: groups[index] };
      }
      throw new Error('Group not found');
    }
    return axios.put(`${API_BASE_URL}/api/groups/${groupId}/students/reorder`, { studentIds });
  },

  /**
   * Get all students in a group
   */
  getStudents: async (groupId) => {
    if (USE_MOCK) {
      await delay();
      const group = mockStore.getGroups().find(g => g.id === Number(groupId));
      if (!group) return { data: [] };
      
      const allStudents = mockStore.getStudents();
      const groupStudents = allStudents.filter(s => group.studentIds.includes(s.id));
      return { data: groupStudents };
    }
    return axios.get(`${API_BASE_URL}/api/groups/${groupId}/students`);
  },
};

export default groupsApi;
