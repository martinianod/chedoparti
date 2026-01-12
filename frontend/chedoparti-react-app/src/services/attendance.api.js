import axios from 'axios';
import { mockStore } from './coachMockData';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
const USE_MOCK = true; // Enable demo mode

const delay = (ms = 500) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Attendance API Service
 * Handles all attendance-related API calls
 */
export const attendanceApi = {
  /**
   * List attendance for a group in a specific week
   */
  list: async (groupId, weekStart) => {
    if (USE_MOCK) {
      await delay();
      const attendance = mockStore.getAttendance();
      // In a real app, we'd filter by group and week
      // For mock, we just return all attendance records that match the schedule IDs
      // But since we don't have complex relational queries in mock, we'll just return all attendance
      // and let the frontend filter if needed, or implement basic filtering here.
      
      // Let's assume we return all attendance for now, as the frontend likely maps it by scheduleId/studentId
      return { data: attendance };
    }

    const params = new URLSearchParams();
    params.append('groupId', groupId);
    params.append('weekStart', weekStart);
    return axios.get(`${API_BASE_URL}/api/attendance?${params.toString()}`);
  },

  /**
   * Mark attendance for a student in a specific schedule
   */
  mark: async (data) => {
    if (USE_MOCK) {
      await delay(200);
      const attendance = mockStore.getAttendance();
      const existingIndex = attendance.findIndex(
        a => a.scheduleId === data.scheduleId && a.studentId === data.studentId
      );

      const record = {
        ...data,
        id: existingIndex !== -1 ? attendance[existingIndex].id : Date.now(),
        updatedAt: new Date().toISOString()
      };

      if (existingIndex !== -1) {
        attendance[existingIndex] = record;
      } else {
        attendance.push(record);
      }

      mockStore.setAttendance(attendance);
      return { data: record };
    }
    return axios.post(`${API_BASE_URL}/api/attendance`, data);
  },

  /**
   * Bulk mark attendance for a schedule
   */
  markBulk: async (scheduleId, attendanceList) => {
    if (USE_MOCK) {
      await delay();
      const attendance = mockStore.getAttendance();
      
      const updatedRecords = attendanceList.map((item, index) => {
        const existingIndex = attendance.findIndex(
          a => a.scheduleId === scheduleId && a.studentId === item.studentId
        );
        
        const record = {
          scheduleId,
          ...item,
          id: existingIndex !== -1 ? attendance[existingIndex].id : Date.now() + index,
          updatedAt: new Date().toISOString()
        };

        if (existingIndex !== -1) {
          attendance[existingIndex] = record;
        } else {
          attendance.push(record);
        }
        return record;
      });

      mockStore.setAttendance(attendance);
      return { data: updatedRecords };
    }
    return axios.post(`${API_BASE_URL}/api/attendance/bulk`, { scheduleId, attendanceList });
  },

  /**
   * Get attendance statistics for a coach
   */
  getStats: async (coachId, startDate, endDate) => {
    if (USE_MOCK) {
      await delay();
      // Mock stats
      return {
        data: {
          attendanceRate: 85,
          totalClasses: 24,
          totalStudents: 15,
          averageAttendance: 12
        }
      };
    }
    const params = new URLSearchParams();
    params.append('coachId', coachId);
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    return axios.get(`${API_BASE_URL}/api/attendance/stats?${params.toString()}`);
  },
};

export default attendanceApi;
