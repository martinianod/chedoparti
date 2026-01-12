/**
 * Coach Module Mock Data Store
 * Simulates a backend database for the demo mode
 */

// Initial Seed Data
const MOCK_STUDENTS = [
  { id: 1, name: 'Juan Perez', email: 'juan@example.com', phone: '123456789', level: 'Intermedio', sport: 'Padel', isMember: true, coachId: 1 },
  { id: 2, name: 'Maria Garcia', email: 'maria@example.com', phone: '987654321', level: 'Principiante', sport: 'Tenis', isMember: false, coachId: 1 },
  { id: 3, name: 'Carlos Lopez', email: 'carlos@example.com', phone: '456123789', level: 'Avanzado', sport: 'Padel', isMember: true, coachId: 1 },
  { id: 4, name: 'Ana Martinez', email: 'ana@example.com', phone: '789123456', level: 'Intermedio', sport: 'Tenis', isMember: true, coachId: 1 },
  { id: 5, name: 'Pedro Sanchez', email: 'pedro@example.com', phone: '321654987', level: 'Principiante', sport: 'Padel', isMember: false, coachId: 1 },
];

const MOCK_GROUPS = [
  { id: 1, name: 'Grupo Padel Mañana', sport: 'Padel', level: 'Intermedio', color: '#3B82F6', capacity: 4, coachId: 1, studentIds: [1, 3], isArchived: false },
  { id: 2, name: 'Escuela Tenis Niños', sport: 'Tenis', level: 'Principiante', color: '#10B981', capacity: 8, coachId: 1, studentIds: [2], isArchived: false },
  { id: 3, name: 'Entrenamiento Avanzado', sport: 'Padel', level: 'Avanzado', color: '#EF4444', capacity: 4, coachId: 1, studentIds: [], isArchived: false },
];

const MOCK_SCHEDULES = [];
const MOCK_ATTENDANCE = [];

// Mock Members for Search
const MOCK_MEMBERS = [
  { id: 101, firstName: 'Roberto', lastName: 'Gomez', email: 'roberto@club.com', phone: '111222333', isMember: true },
  { id: 102, firstName: 'Lucia', lastName: 'Fernandez', email: 'lucia@club.com', phone: '444555666', isMember: true },
  { id: 103, firstName: 'Miguel', lastName: 'Rodriguez', email: 'miguel@club.com', phone: '777888999', isMember: true },
  { id: 104, firstName: 'Sofia', lastName: 'Diaz', email: 'sofia@club.com', phone: '000111222', isMember: true },
  { id: 105, firstName: 'Javier', lastName: 'Torres', email: 'javier@club.com', phone: '333444555', isMember: false },
];

// Local Storage Keys
const STORAGE_KEYS = {
  STUDENTS: 'demo_students',
  GROUPS: 'demo_groups',
  SCHEDULES: 'demo_schedules',
  ATTENDANCE: 'demo_attendance',
};

// Helper to simulate async delay
const delay = (ms = 500) => new Promise((resolve) => setTimeout(resolve, ms));

// Data Access Object
export const mockStore = {
  // Initialize data from local storage or seed
  init: () => {
    if (!localStorage.getItem(STORAGE_KEYS.STUDENTS)) {
      localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(MOCK_STUDENTS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.GROUPS)) {
      localStorage.setItem(STORAGE_KEYS.GROUPS, JSON.stringify(MOCK_GROUPS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.SCHEDULES)) {
      localStorage.setItem(STORAGE_KEYS.SCHEDULES, JSON.stringify(MOCK_SCHEDULES));
    }
    if (!localStorage.getItem(STORAGE_KEYS.ATTENDANCE)) {
      localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(MOCK_ATTENDANCE));
    }
  },

  // Generic Getters
  getStudents: () => JSON.parse(localStorage.getItem(STORAGE_KEYS.STUDENTS) || '[]'),
  getGroups: () => JSON.parse(localStorage.getItem(STORAGE_KEYS.GROUPS) || '[]'),
  getSchedules: () => JSON.parse(localStorage.getItem(STORAGE_KEYS.SCHEDULES) || '[]'),
  getAttendance: () => JSON.parse(localStorage.getItem(STORAGE_KEYS.ATTENDANCE) || '[]'),

  // Generic Setters
  setStudents: (data) => localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(data)),
  setGroups: (data) => localStorage.setItem(STORAGE_KEYS.GROUPS, JSON.stringify(data)),
  setSchedules: (data) => localStorage.setItem(STORAGE_KEYS.SCHEDULES, JSON.stringify(data)),
  setAttendance: (data) => localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(data)),

  // Member Search
  searchMembers: async (query) => {
    await delay(300);
    if (!query) return [];
    const lowerQuery = query.toLowerCase();
    return MOCK_MEMBERS.filter(m => 
      m.firstName.toLowerCase().includes(lowerQuery) || 
      m.lastName.toLowerCase().includes(lowerQuery) ||
      m.email.toLowerCase().includes(lowerQuery)
    );
  }
};

// Initialize on load
mockStore.init();
