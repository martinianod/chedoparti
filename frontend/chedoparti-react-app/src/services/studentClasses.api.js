import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
const USE_MOCK = import.meta.env.VITE_API_BASE_URL?.includes('/api') || true;

const delay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms));

// Mock data store
let mockClasses = [
  {
    id: 1,
    scheduleId: 101,
    groupId: 201,
    groupName: 'Grupo Avanzado A',
    isGroupClass: true,
    coachId: 10,
    coachName: 'Juan Pérez',
    date: '2025-11-28',
    startTime: '18:00',
    endTime: '19:30',
    duration: 90,
    courts: [{ id: 1, name: 'Cancha 1', sport: 'Padel' }],
    courtCount: 1,
    attendanceStatus: 'pending',
    attendanceDeadline: '2025-11-28T12:00:00Z',
    canConfirm: true,
    notes: 'Traer raqueta propia'
  },
  {
    id: 2,
    scheduleId: 102,
    groupId: null,
    groupName: null,
    isGroupClass: false,
    coachId: 11,
    coachName: 'Ana López',
    date: '2025-11-30',
    startTime: '16:00',
    endTime: '17:00',
    duration: 60,
    courts: [{ id: 3, name: 'Cancha 3', sport: 'Padel' }],
    courtCount: 1,
    attendanceStatus: 'pending',
    attendanceDeadline: '2025-11-30T12:00:00Z',
    canConfirm: true,
    notes: null
  },
  {
    id: 3,
    scheduleId: 103,
    groupId: 202,
    groupName: 'Grupo Intermedio B',
    isGroupClass: true,
    coachId: 10,
    coachName: 'Juan Pérez',
    date: '2025-12-01',
    startTime: '10:00',
    endTime: '11:30',
    duration: 90,
    courts: [
      { id: 1, name: 'Cancha 1', sport: 'Padel' },
      { id: 2, name: 'Cancha 2', sport: 'Padel' }
    ],
    courtCount: 2,
    attendanceStatus: 'confirmed',
    attendanceDeadline: '2025-12-01T08:00:00Z',
    canConfirm: true,
    confirmedAt: '2025-11-27T15:30:00Z',
    notes: null
  }
];

/**
 * Student Classes API Service
 * Handles all class-related API calls for students
 */
export const studentClassesApi = {
  /**
   * Get all classes for a student in a date range
   */
  list: async (studentId, startDate, endDate, options = {}) => {
    if (USE_MOCK) {
      await delay();
      
      let filtered = [...mockClasses];
      
      // Filter by date range
      if (startDate && endDate) {
        filtered = filtered.filter(cls => {
          const classDate = new Date(cls.date);
          const start = new Date(startDate);
          const end = new Date(endDate);
          return classDate >= start && classDate <= end;
        });
      }
      
      // Filter by status
      if (options.status) {
        filtered = filtered.filter(cls => cls.attendanceStatus === options.status);
      }
      
      return { data: filtered };
    }

    const params = new URLSearchParams();
    params.append('studentId', studentId);
    params.append('startDate', startDate);
    params.append('endDate', endDate);
    if (options.status) params.append('status', options.status);

    return axios.get(`${API_BASE_URL}/api/students/${studentId}/classes?${params.toString()}`);
  },

  /**
   * Get a single class by ID
   */
  get: async (studentId, classId) => {
    if (USE_MOCK) {
      await delay();
      const cls = mockClasses.find(c => c.id === Number(classId));
      return { data: cls };
    }

    return axios.get(`${API_BASE_URL}/api/students/${studentId}/classes/${classId}`);
  },

  /**
   * Confirm or decline attendance
   */
  confirmAttendance: async (classId, status, notes = null) => {
    if (USE_MOCK) {
      await delay(800);
      
      const classIndex = mockClasses.findIndex(c => c.id === Number(classId));
      if (classIndex !== -1) {
        mockClasses[classIndex] = {
          ...mockClasses[classIndex],
          attendanceStatus: status,
          confirmedAt: new Date().toISOString()
        };
        return { 
          data: {
            success: true,
            classId,
            status,
            confirmedAt: new Date().toISOString()
          }
        };
      }
      throw new Error('Class not found');
    }

    return axios.post(`${API_BASE_URL}/api/students/classes/${classId}/attendance`, {
      status,
      notes
    });
  },

  /**
   * Get attendance history for a student
   */
  getAttendanceHistory: async (studentId, startDate, endDate) => {
    if (USE_MOCK) {
      await delay();
      return { data: [] };
    }

    return axios.get(`${API_BASE_URL}/api/students/${studentId}/attendance-history`, {
      params: { startDate, endDate }
    });
  }
};

export default studentClassesApi;
