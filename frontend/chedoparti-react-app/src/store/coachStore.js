import { create } from 'zustand';

/**
 * Coach Store
 * Manages state for students, groups, schedules, and attendance
 */
export const useCoachStore = create((set, get) => ({
  // ===== STUDENTS STATE =====
  students: [],
  studentsLoading: false,
  studentsError: null,
  studentFilters: {
    search: '',
    level: null,
    sport: null,
    isMember: null,
    groupId: null,
  },

  // ===== GROUPS STATE =====
  groups: [],
  groupsLoading: false,
  groupsError: null,
  showArchivedGroups: false,

  // ===== SCHEDULES STATE =====
  schedules: [],
  schedulesLoading: false,
  schedulesError: null,
  selectedWeek: null,

  // ===== ATTENDANCE STATE =====
  attendance: {}, // { [studentId-date]: { status, notes } }
  attendanceLoading: false,
  attendanceError: null,

  // ===== STUDENTS ACTIONS =====
  setStudents: (students) => set({ students }),
  setStudentsLoading: (loading) => set({ studentsLoading: loading }),
  setStudentsError: (error) => set({ studentsError: error }),

  addStudent: (student) =>
    set((state) => ({
      students: [...state.students, student],
    })),

  updateStudent: (id, data) =>
    set((state) => ({
      students: state.students.map((s) => (s.id === id ? { ...s, ...data } : s)),
    })),

  removeStudent: (id) =>
    set((state) => ({
      students: state.students.filter((s) => s.id !== id),
    })),

  setStudentFilters: (filters) =>
    set((state) => ({
      studentFilters: { ...state.studentFilters, ...filters },
    })),

  clearStudentFilters: () =>
    set({
      studentFilters: {
        search: '',
        level: null,
        sport: null,
        isMember: null,
        groupId: null,
      },
    }),

  // ===== GROUPS ACTIONS =====
  setGroups: (groups) => set({ groups }),
  setGroupsLoading: (loading) => set({ groupsLoading: loading }),
  setGroupsError: (error) => set({ groupsError: error }),

  addGroup: (group) =>
    set((state) => ({
      groups: [...state.groups, group],
    })),

  updateGroup: (id, data) =>
    set((state) => ({
      groups: state.groups.map((g) => (g.id === id ? { ...g, ...data } : g)),
    })),

  archiveGroup: (id) =>
    set((state) => ({
      groups: state.groups.map((g) => (g.id === id ? { ...g, isArchived: true } : g)),
    })),

  restoreGroup: (id) =>
    set((state) => ({
      groups: state.groups.map((g) => (g.id === id ? { ...g, isArchived: false } : g)),
    })),

  removeGroup: (id) =>
    set((state) => ({
      groups: state.groups.filter((g) => g.id !== id),
    })),

  toggleShowArchivedGroups: () =>
    set((state) => ({
      showArchivedGroups: !state.showArchivedGroups,
    })),

  // ===== GROUP-STUDENT ASSIGNMENTS =====
  addStudentToGroup: (studentId, groupId) =>
    set((state) => ({
      groups: state.groups.map((g) =>
        g.id === groupId
          ? {
              ...g,
              studentIds: [...(g.studentIds || []), studentId],
            }
          : g
      ),
    })),

  removeStudentFromGroup: (studentId, groupId) =>
    set((state) => ({
      groups: state.groups.map((g) =>
        g.id === groupId
          ? {
              ...g,
              studentIds: (g.studentIds || []).filter((id) => id !== studentId),
            }
          : g
      ),
    })),

  reorderStudentsInGroup: (groupId, studentIds) =>
    set((state) => ({
      groups: state.groups.map((g) =>
        g.id === groupId
          ? {
              ...g,
              studentIds,
            }
          : g
      ),
    })),

  // ===== SCHEDULES ACTIONS =====
  setSchedules: (schedules) => set({ schedules }),
  setSchedulesLoading: (loading) => set({ schedulesLoading: loading }),
  setSchedulesError: (error) => set({ schedulesError: error }),
  setSelectedWeek: (week) => set({ selectedWeek: week }),

  addSchedule: (schedule) =>
    set((state) => ({
      schedules: [...state.schedules, schedule],
    })),

  updateSchedule: (id, data) =>
    set((state) => ({
      schedules: state.schedules.map((s) => (s.id === id ? { ...s, ...data } : s)),
    })),

  removeSchedule: (id) =>
    set((state) => ({
      schedules: state.schedules.filter((s) => s.id !== id),
    })),

  // ===== ATTENDANCE ACTIONS =====
  setAttendance: (attendance) => set({ attendance }),
  setAttendanceLoading: (loading) => set({ attendanceLoading: loading }),
  setAttendanceError: (error) => set({ attendanceError: error }),

  markAttendance: (studentId, date, status, notes = null) =>
    set((state) => ({
      attendance: {
        ...state.attendance,
        [`${studentId}-${date}`]: { status, notes },
      },
    })),

  // ===== COMPUTED/HELPER METHODS =====
  getFilteredStudents: () => {
    const { students, studentFilters } = get();
    let filtered = [...students];

    if (studentFilters.search) {
      const search = studentFilters.search.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.name?.toLowerCase().includes(search) ||
          s.email?.toLowerCase().includes(search) ||
          s.phone?.includes(search)
      );
    }

    if (studentFilters.level) {
      filtered = filtered.filter((s) => s.level === studentFilters.level);
    }

    if (studentFilters.sport) {
      filtered = filtered.filter((s) => s.sport === studentFilters.sport);
    }

    if (studentFilters.isMember !== null) {
      filtered = filtered.filter((s) => s.isMember === studentFilters.isMember);
    }

    if (studentFilters.groupId) {
      const group = get().groups.find((g) => g.id === studentFilters.groupId);
      const studentIds = group?.studentIds || [];
      filtered = filtered.filter((s) => studentIds.includes(s.id));
    }

    return filtered;
  },

  getActiveGroups: () => {
    const { groups, showArchivedGroups } = get();
    return showArchivedGroups ? groups : groups.filter((g) => !g.isArchived);
  },

  getGroupStudents: (groupId) => {
    const { students, groups } = get();
    const group = groups.find((g) => g.id === groupId);
    const studentIds = group?.studentIds || [];
    return students.filter((s) => studentIds.includes(s.id));
  },

  getStudentGroups: (studentId) => {
    const { groups } = get();
    return groups.filter((g) => (g.studentIds || []).includes(studentId));
  },
}));

export default useCoachStore;
