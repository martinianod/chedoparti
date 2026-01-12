import axios from 'axios';
import { mockStore } from './coachMockData';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
const USE_MOCK = true; // Enable demo mode

const delay = (ms = 500) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Students API Service
 * Handles all student-related API calls for coaches
 */
export const studentsApi = {
  /**
   * List all students for a coach
   */
  list: async (coachId, filters = {}) => {
    if (USE_MOCK) {
      await delay();
      let students = mockStore.getStudents();
      
      // Apply filters
      if (filters.search) {
        const q = filters.search.toLowerCase();
        students = students.filter(s => 
          s.name.toLowerCase().includes(q) || 
          s.email?.toLowerCase().includes(q)
        );
      }
      if (filters.level) {
        students = students.filter(s => s.level === filters.level);
      }
      if (filters.sport) {
        students = students.filter(s => s.sport === filters.sport);
      }
      
      return { data: students };
    }

    const params = new URLSearchParams();
    params.append('coachId', coachId);
    
    if (filters.level) params.append('level', filters.level);
    if (filters.sport) params.append('sport', filters.sport);
    if (filters.isMember !== undefined) params.append('isMember', filters.isMember);
    if (filters.groupId) params.append('groupId', filters.groupId);
    if (filters.search) params.append('search', filters.search);

    return axios.get(`${API_BASE_URL}/api/students?${params.toString()}`);
  },

  /**
   * Get a single student by ID
   */
  get: async (id) => {
    if (USE_MOCK) {
      await delay();
      const student = mockStore.getStudents().find(s => s.id === Number(id));
      return { data: student };
    }
    return axios.get(`${API_BASE_URL}/api/students/${id}`);
  },

  /**
   * Create a new student
   */
  create: async (data) => {
    if (USE_MOCK) {
      await delay();
      const students = mockStore.getStudents();
      const newStudent = {
        ...data,
        id: Date.now(),
        isMember: data.isMember || false
      };
      mockStore.setStudents([...students, newStudent]);
      return { data: newStudent };
    }
    return axios.post(`${API_BASE_URL}/api/students`, data);
  },

  /**
   * Update an existing student
   */
  update: async (id, data) => {
    if (USE_MOCK) {
      await delay();
      const students = mockStore.getStudents();
      const index = students.findIndex(s => s.id === Number(id));
      if (index !== -1) {
        const updatedStudent = { ...students[index], ...data };
        students[index] = updatedStudent;
        mockStore.setStudents(students);
        return { data: updatedStudent };
      }
      throw new Error('Student not found');
    }
    return axios.put(`${API_BASE_URL}/api/students/${id}`, data);
  },

  /**
   * Soft delete a student
   */
  delete: async (id) => {
    if (USE_MOCK) {
      await delay();
      const students = mockStore.getStudents().filter(s => s.id !== Number(id));
      mockStore.setStudents(students);
      return { data: { success: true } };
    }
    return axios.delete(`${API_BASE_URL}/api/students/${id}`);
  },

  /**
   * Search for members
   */
  searchMembers: async (query, institutionId) => {
    if (USE_MOCK) {
      const members = await mockStore.searchMembers(query);
      return { data: members };
    }
    const params = new URLSearchParams();
    params.append('q', query);
    params.append('institutionId', institutionId);
    
    return axios.get(`${API_BASE_URL}/api/students/search-members?${params.toString()}`);
  },

  /**
   * Get students by group ID
   */
  getByGroup: async (groupId) => {
    if (USE_MOCK) {
      await delay();
      const group = mockStore.getGroups().find(g => g.id === Number(groupId));
      if (!group) return { data: [] };
      
      const allStudents = mockStore.getStudents();
      const groupStudents = allStudents.filter(s => group.studentIds.includes(s.id));
      return { data: groupStudents };
    }
    return axios.get(`${API_BASE_URL}/api/students/by-group/${groupId}`);
  },
};

export default studentsApi;
