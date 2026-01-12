// Mock API para demo local - TODAS LAS CONEXIONES AL BACKEND DESHABILITADAS
import { defaultSchedule } from '../models/courtSchedule';
import { defaultPricing } from '../models/courtPricing';
import mockCourtsData from '../mock/courts.mock.json';
import mockReservationsData from '../mock/reservations.mock.json';
import mockTournamentsData from '../mock/tournaments.mock.json';
import { reservationSync } from '../utils/reservationSync';

// Inicializar datos mock
const mockCourts = mockCourtsData.map((court) => ({
  ...court,
  horarios: defaultSchedule,
  precios: defaultPricing,
}));

// Cargar reservaciones mock con fechas específicas (Nov 11-18, 2025)
const today = new Date().toISOString().split('T')[0];
let reservations = mockReservationsData.map((res, index) => {
  // Convertir date + time a startAt y calcular endAt
  const startDateTime = new Date(`${res.date}T${res.time}:00`);
  const durationHours = parseFloat(res.duration.replace(':', '.'));
  const endDateTime = new Date(startDateTime.getTime() + durationHours * 60 * 60 * 1000);

  // Asignar userId si no existe (distribuyendo entre usuarios demo y otros)
  let userId = res.userId;
  let membershipNumber = null;

  if (!userId) {
    if (index % 5 === 0) userId = 'admin@chedoparti.com';
    else if (index % 5 === 1) {
      userId = 'socio@chedoparti.com';
      membershipNumber = 'S001234';
    } else if (index % 5 === 2) {
      userId = 'socio2@chedoparti.com';
      membershipNumber = 'S001100';
    } else if (index % 5 === 3) {
      userId = 'socio3@chedoparti.com';
      membershipNumber = 'S001567';
    } else userId = 'coach@chedoparti.com';
  } else {
    // Mapear userId existente a membershipNumber
    if (userId === 'socio@chedoparti.com') membershipNumber = 'S001234';
    else if (userId === 'socio2@chedoparti.com') membershipNumber = 'S001100';
    else if (userId === 'socio3@chedoparti.com') membershipNumber = 'S001567';
  }

  return {
    ...res,
    // Campos que espera el componente React
    userPhone: res.user, // El componente busca userPhone, no user
    // Usar formato local sin conversión UTC para evitar desplazamientos de zona horaria
    startAt: `${res.date}T${res.time}:00`,
    endAt: `${res.date}T${String(Math.floor(endDateTime.getHours())).padStart(2, '0')}:${String(endDateTime.getMinutes()).padStart(2, '0')}:00`,
    // Asignar userId para control de privacidad
    userId: userId,
    // Agregar número de socio si es un socio
    membershipNumber: membershipNumber,
    // Mantener campos originales por compatibilidad
    user: res.user,
    date: res.date,
    time: res.time,
    // Timestamps de auditoría
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
});

let tournaments = mockTournamentsData || [];

// Mock users con sistema de roles múltiples y penalizaciones
const mockUsers = [
  {
    id: 1,
    email: 'admin@chedoparti.com',
    password: 'admin123',
    name: 'Carlos Rodriguez',
    roles: ['INSTITUTION_ADMIN'], // Roles múltiples como array
    primaryRole: 'INSTITUTION_ADMIN', // Rol principal para mostrar
    permissions: [
      'manage_courts',
      'manage_users',
      'manage_reservations',
      'manage_tournaments',
      'view_stats',
      'manage_schedules',
      'manage_pricing',
      'penalize_members',
    ],
    avatar: null,
    status: 'active', // active, suspended, penalized, inactive
  },
  {
    id: 2,
    email: 'socio@chedoparti.com',
    password: 'socio123',
    name: 'Ana Garcia',
    roles: ['SOCIO'],
    primaryRole: 'SOCIO',
    permissions: ['view_reservations', 'create_reservations', 'view_tournaments'],
    membershipNumber: 'S001234',
    memberSince: '2023-03-15',
    avatar: null,
    status: 'active',
    // Campos específicos para socios
    membershipStatus: 'active', // active, suspended, penalized, expired
    penaltyInfo: null, // Información de penalizaciones
    // Campos para búsqueda de ADMIN
    dni: '12345678',
    phone: '+54 9 11 1234-5678',
  },
  {
    id: 3,
    email: 'coach@chedoparti.com',
    password: 'coach123',
    name: 'Miguel Torres',
    roles: ['SOCIO', 'COACH'], // Socio que también es entrenador
    primaryRole: 'COACH',
    permissions: ['view_reservations', 'create_reservations', 'manage_tournaments', 'view_stats'],
    specialties: ['Padel', 'Tenis'],
    certification: 'Instructor Nivel 3',
    membershipNumber: 'S002100', // También es socio
    memberSince: '2022-08-20',
    avatar: null,
    status: 'active',
    membershipStatus: 'active',
    penaltyInfo: null,
    // Campos para búsqueda de ADMIN
    dni: '87654321',
    phone: '+54 9 11 8765-4321',
    // Configuración de Entrenador
    assignedCourts: [1, 2], // IDs de canchas asignadas
    weeklyHourQuota: 20, // Límite de horas semanales
    availability: [
      { day: 'Lunes', startTime: '09:00', endTime: '13:00', price: 3000 },
      { day: 'Miércoles', startTime: '15:00', endTime: '19:00', price: 3000 },
      { day: 'Viernes', startTime: '09:00', endTime: '13:00', price: 3500 },
    ],
  },
  {
    id: 4,
    email: 'socio2@chedoparti.com',
    password: 'socio123',
    name: 'Juan Pérez',
    roles: ['SOCIO'],
    primaryRole: 'SOCIO',
    permissions: ['view_reservations', 'create_reservations', 'view_tournaments'],
    membershipNumber: 'S001100',
    memberSince: '2023-01-10',
    avatar: null,
    status: 'active',
    membershipStatus: 'active',
    penaltyInfo: null,
    // Campos para búsqueda de ADMIN
    dni: '11223344',
    phone: '+54 9 11 1122-3344',
  },
  {
    id: 5,
    email: 'socio3@chedoparti.com',
    password: 'socio123',
    name: 'María López',
    roles: ['SOCIO'],
    primaryRole: 'SOCIO',
    permissions: ['view_reservations', 'create_reservations', 'view_tournaments'],
    membershipNumber: 'S001567',
    memberSince: '2023-05-20',
    avatar: null,
    status: 'penalized', // Usuario penalizado como ejemplo
    membershipStatus: 'penalized',
    penaltyInfo: {
      reason: 'No se presentó a 3 reservas consecutivas sin cancelar',
      penalizedBy: 'admin@chedoparti.com',
      penalizedAt: '2025-11-10T10:00:00Z',
      penaltyUntil: '2025-11-24T23:59:59Z', // 2 semanas de penalización
      canMakeReservations: false,
    },
    // Campos para búsqueda de ADMIN
    dni: '99887766',
    phone: '+54 9 11 9988-7766',
  },
  {
    id: 10,
    email: 'jorge.perez@chedoparti.com',
    password: 'socio123',
    name: 'Jorge Pérez',
    roles: ['SOCIO'],
    primaryRole: 'SOCIO',
    permissions: ['view_reservations', 'create_reservations', 'view_tournaments'],
    membershipNumber: 'S001999',
    memberSince: '2023-06-01',
    avatar: null,
    status: 'active',
    membershipStatus: 'active',
    penaltyInfo: null,
    dni: '11223355',
    phone: '+54 9 11 1122-3355',
  },
  {
    id: 6,
    email: 'coach2@chedoparti.com',
    password: 'coach123',
    name: 'Laura Martínez',
    roles: ['SOCIO', 'COACH', 'INSTITUTION_ADMIN'], // Triple rol: socio, entrenador y admin
    primaryRole: 'INSTITUTION_ADMIN',
    permissions: [
      'view_reservations',
      'create_reservations',
      'view_tournaments',
      'manage_tournaments',
      'view_stats',
      'manage_users',
      'penalize_members',
    ],
    membershipNumber: 'S000950',
    memberSince: '2022-01-15',
    specialties: ['Padel', 'Fútbol'],
    certification: 'Instructor Nivel 4 - Coordinador',
    avatar: null,
    status: 'active',
    membershipStatus: 'active',
    penaltyInfo: null,
    // Configuración de Entrenador
    assignedCourts: [1, 2, 3, 4], // Acceso a todas las canchas
    weeklyHourQuota: 40,
    availability: [
      { day: 'Martes', startTime: '14:00', endTime: '20:00', price: 4000 },
      { day: 'Jueves', startTime: '14:00', endTime: '20:00', price: 4000 },
    ],
  },
];

// Usuario por defecto para casos genéricos
const defaultUser = mockUsers[0];

// Mock API de autenticación
export const authApi = {
  login: async (email, password) => {
    // Simular delay de red
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Buscar usuario por email y password
    const authenticatedUser = mockUsers.find(
      (user) => user.email === email && user.password === password
    );

    if (authenticatedUser) {
      // Verificar si el usuario está penalizado o suspendido
      if (authenticatedUser.status === 'penalized' || authenticatedUser.status === 'suspended') {
        const statusText = authenticatedUser.status === 'penalized' ? 'penalizado' : 'suspendido';
        const info = authenticatedUser.penaltyInfo || authenticatedUser.suspensionInfo;
        const until = info?.penaltyUntil || info?.suspendedUntil;

        throw new Error(
          `Tu cuenta está ${statusText}${until ? ` hasta ${new Date(until).toLocaleDateString()}` : ''}. Razón: ${info?.reason || 'No especificada'}`
        );
      }

      // Login exitoso con usuario específico
      const { password: _, ...userWithoutPassword } = authenticatedUser;

      // Asegurar que se pasen todos los campos de roles
      const userForResponse = {
        ...userWithoutPassword,
        roles: authenticatedUser.roles,
        primaryRole: authenticatedUser.primaryRole,
        role: authenticatedUser.primaryRole, // Para compatibilidad con código existente
      };

      return {
        data: {
          token: `mock_token_${authenticatedUser.email}`,
          user: userForResponse,
        },
      };
    } else {
      // Login fallido - mostrar credenciales disponibles

      mockUsers.forEach((user) => {});

      throw new Error('Credenciales incorrectas. Verifica email y contraseña.');
    }
  },
  register: async (userData) => {
    // Simular delay de red
    await new Promise((resolve) => setTimeout(resolve, 600));

    // Simular registro exitoso - crear como SOCIO por defecto
    const newUser = {
      id: Date.now(),
      email: userData.email || userData.username,
      name: userData.name || 'Nuevo Usuario',
      roles: ['SOCIO'],
      primaryRole: 'SOCIO',
      role: 'SOCIO', // Para compatibilidad
      permissions: ['view_reservations', 'create_reservations', 'view_tournaments'],
      membershipNumber: `S${String(Date.now()).slice(-6)}`,
      memberSince: new Date().toISOString().split('T')[0],
      status: 'active',
      membershipStatus: 'active',
    };

    // Agregar a la lista de usuarios
    mockUsers.push(newUser);

    return {
      data: {
        token: `mock-jwt-token-socio`,
        user: newUser,
      },
    };
  },
  me: async () => {
    await new Promise((resolve) => setTimeout(resolve, 200));

    // Extraer usuario del token guardado en localStorage
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No token found');
    }

    try {
      // Decodificar el token mock para obtener el email del usuario
      const userEmail = token.replace('mock_token_', '');
      const currentUser = mockUsers.find((u) => u.email === userEmail);

      if (!currentUser) {
        throw new Error('Usuario no encontrado');
      }

      const { password: _, ...userWithoutPassword } = currentUser;
      
      // Asegurar que se pasen todos los campos de roles (igual que en login)
      const userForResponse = {
        ...userWithoutPassword,
        roles: currentUser.roles,
        primaryRole: currentUser.primaryRole,
        role: currentUser.role || currentUser.primaryRole, // Fallback a primaryRole si role no existe
      };

      return { data: userForResponse };
    } catch (error) {
      console.error('❌ Error in authApi.me():', error);
      throw new Error('Token inválido');
    }
  },
};

// Mock API de instituciones
export const institutionsApi = {
  list: async () => ({
    data: [
      { id: 1, name: 'Club Chedoparti', address: 'Av. Principal 123', phone: '+54 11 1234-5678' },
    ],
  }),
  get: async (id) => ({
    data: {
      id: 1,
      name: 'Club Chedoparti',
      address: 'Av. Principal 123',
      phone: '+54 11 1234-5678',
    },
  }),
  create: async (payload) => ({ data: { ...payload, id: Date.now() } }),
  update: async (institutionId, courtId, payload) => {
    const idx = mockCourts.findIndex((c) => String(c.id) === String(courtId));
    if (idx >= 0) {
      mockCourts[idx] = { ...mockCourts[idx], ...payload };
      return { data: mockCourts[idx] };
    }
    return { data: null };
  },
  remove: async (institutionId, courtId) => {
    const idx = mockCourts.findIndex((c) => String(c.id) === String(courtId));
    if (idx >= 0) {
      mockCourts.splice(idx, 1);
      return { data: true };
    }
    return { data: false };
  },
};

// Mock API de canchas (con soporte para institutionId)
export const courtsApi = {
  list: async (institutionId = 1, params = {}) => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return { data: mockCourts };
  },
  listActive: async (institutionId = 1) => ({ data: mockCourts.filter((c) => c.active !== false) }),
  get: async (institutionId, courtId) => ({
    data: mockCourts.find((c) => String(c.id) === String(courtId)),
  }),
  create: async (institutionId, payload) => {
    const newCourt = { ...payload, id: Math.max(...mockCourts.map((c) => c.id), 0) + 1 };
    mockCourts.push(newCourt);
    return { data: newCourt };
  },
  update: async (institutionId, courtId, payload) => {
    const idx = mockCourts.findIndex((c) => String(c.id) === String(courtId));
    if (idx >= 0) {
      mockCourts[idx] = { ...mockCourts[idx], ...payload };
      return { data: mockCourts[idx] };
    }
    return { data: null };
  },
  remove: async (institutionId, courtId) => {
    const idx = mockCourts.findIndex((c) => String(c.id) === String(courtId));
    if (idx >= 0) {
      mockCourts.splice(idx, 1);
      return { data: true };
    }
    return { data: false };
  },
};

// Mock API de reservaciones
// Función para filtrar información sensible según el rol del usuario
const filterSensitiveInfo = (reservation, currentUser) => {
  // Si es ADMIN, puede ver toda la información
  if (currentUser?.role === 'INSTITUTION_ADMIN') {
    return reservation;
  }

  // Si es el propietario de la reserva (por email O número de socio), puede ver toda su información
  const isOwnerByEmail = reservation.userId === currentUser?.email;
  const isOwnerByMembership =
    currentUser?.membershipNumber && reservation.membershipNumber === currentUser.membershipNumber;

  if (isOwnerByEmail || isOwnerByMembership) {
    return reservation;
  }

  // Para SOCIO y COACH que no son propietarios, mostrar información útil pero sin datos personales
  const getReservationDisplayInfo = (type) => {
    const typeInfo = {
      Normal: {
        label: 'Reserva Privada',
        icon: 'FiUser',
        borderColor: 'border-l-gray-400',
      },
      Fijo: {
        label: 'Turno Fijo',
        icon: 'FiRefreshCw',
        borderColor: 'border-l-blue-500',
      },
      Torneo: {
        label: 'Torneo en Curso',
        icon: 'FiAward',
        borderColor: 'border-l-yellow-500',
      },
      Academia: {
        label: 'Clase/Entrenamiento',
        icon: 'FiBook',
        borderColor: 'border-l-green-500',
      },
      Invitado: {
        label: 'Reserva de Invitado',
        icon: 'FiUserPlus',
        borderColor: 'border-l-purple-500',
      },
    };
    return (
      typeInfo[type] || {
        label: 'Cancha Ocupada',
        icon: 'FiLock',
        borderColor: 'border-l-gray-500',
      }
    );
  };

  const displayInfo = getReservationDisplayInfo(reservation.type);

  return {
    ...reservation,
    user: displayInfo.label, // Mostrar tipo de actividad en lugar de nombre
    customerName: displayInfo.label, // También en customerName para consistencia
    userPhone: null, // ⚠️ NUNCA exponer teléfonos en vistas filtradas
    userEmail: null, // Ocultar email también
    notes: 'Cancha ocupada', // Ocultar notas privadas
    price: null, // Ocultar precio
    // Agregar información visual para el frontend
    isPrivateInfo: true,
    displayIcon: displayInfo.icon,
    displayBorderColor: displayInfo.borderColor,
  };
};

// 🔄 Función de transformación para compatibilidad con nuevos hooks
const transformReservationFormat = (reservation) => {
  if (!reservation) return null;

  // Si ya tiene startAt/endAt, no transformar
  if (reservation.startAt && reservation.endAt) {
    return reservation;
  }

  // Convertir formato legacy (date, time, duration) a nuevo formato (startAt, endAt)
  const { date, time, duration } = reservation;

  if (!date || !time) {
    console.warn('⚠️ Reservation missing date or time:', reservation);
    return reservation;
  }

  // Construir startAt en formato ISO
  const startAt = `${date}T${time}:00.000Z`;

  // Calcular endAt basado en duration
  let durationMinutes = 60; // Default 1 hora
  if (duration) {
    const [hours, minutes] = duration.split(':').map(Number);
    durationMinutes = hours * 60 + (minutes || 0);
  }

  const startDate = new Date(startAt);
  const endDate = new Date(startDate.getTime() + durationMinutes * 60 * 1000);
  const endAt = endDate.toISOString();

  return {
    ...reservation,
    startAt,
    endAt,
    // Mantener campos legacy para compatibilidad
    date,
    time,
    duration,
  };
};

// ✅ Helper function to add history events automatically
const addHistoryEvent = (reservationId, actionType, details, performedBy, changes = null) => {
  const reservation = reservations.find((r) => r.id === parseInt(reservationId));
  if (!reservation) return null;

  const event = {
    id: mockHistoryEntries.length + 1,
    reservationId: parseInt(reservationId),
    action: actionType.toLowerCase(),
    actionType: actionType,
    timestamp: new Date().toISOString(),
    performedBy: performedBy || {
      id: 1,
      name: 'Sistema',
      email: 'system@chedoparti.com',
      role: 'SYSTEM',
    },
    details: details,
    reservationDetails: {
      court: `Cancha ${reservation.courtId}`, // ✅ Usar courtId directamente
      sport: reservation.sport || 'Padel',
      date: reservation.date,
      time: reservation.time,
      duration: reservation.duration || '01:00',
      user: reservation.user || reservation.customerName || 'Usuario',
      status: reservation.status,
    },
    changes: changes,
    ipAddress: '192.168.1.1',
    userAgent: 'Browser',
  };

  mockHistoryEntries.push(event);
  return event;
};

// Helper to get current user from token
const getCurrentUser = () => {
  const token = localStorage.getItem('token');
  if (!token) return null;

  try {
    const userEmail = token.replace('mock_token_', '');
    return mockUsers.find((u) => u.email === userEmail);
  } catch (error) {
    return null;
  }
};

export const reservationsApi = {
  list: async (params = {}) => {
    await new Promise((resolve) => setTimeout(resolve, 400));
    let filteredReservations = [...reservations];

    // Obtener usuario actual del localStorage para aplicar filtros de privacidad
    const token = localStorage.getItem('token');
    let currentUser = null;
    if (token) {
      try {
        // En un mock, decodificamos el "token" que es simplemente el email
        const userEmail = token.replace('mock_token_', '');
        currentUser = mockUsers.find((u) => u.email === userEmail);
      } catch (error) {
        console.warn('❌ Error decoding token for privacy filtering:', error);
      }
    } else {
      console.warn('⚠️ No auth token found in localStorage');
    }

    // Aplicar filtros si existen
    if (params.date) {
      filteredReservations = filteredReservations.filter((r) => r.date === params.date);
    }
    if (params.courtId) {
      filteredReservations = filteredReservations.filter(
        (r) => r.courtId === parseInt(params.courtId)
      );
    }

    // Aplicar filtros de privacidad según el rol del usuario
    if (currentUser) {
      if (currentUser.roles?.includes('SOCIO') && !currentUser.roles.includes('INSTITUTION_ADMIN')) {
        // SOCIO solo ve sus propias reservas (validar por email Y número de socio)
        const userReservations = filteredReservations.filter((reservation) => {
          const matchesEmail = reservation.userId === currentUser.email;
          const matchesMembershipNumber =
            currentUser.membershipNumber &&
            reservation.membershipNumber === currentUser.membershipNumber;

          // Debe coincidir el email O el número de socio (para máxima seguridad)
          return matchesEmail || matchesMembershipNumber;
        });

        filteredReservations = userReservations;
      } else if (currentUser.roles?.includes('INSTITUTION_ADMIN') || currentUser.role === 'INSTITUTION_ADMIN') {
        // ADMIN ve todas las reservas SIN FILTRAR - acceso total

        // No aplicamos filterSensitiveInfo para ADMINs
        filteredReservations = filteredReservations;
      } else {
        // COACH y otros roles ven todas las reservas con información filtrada
        filteredReservations = filteredReservations.map((reservation) => {
          const filtered = filterSensitiveInfo(reservation, currentUser);
          if (filtered.isPrivateInfo) {
          }
          return filtered;
        });
      }

      const isAdmin = currentUser.roles?.includes('INSTITUTION_ADMIN') || currentUser.role === 'INSTITUTION_ADMIN';
    }

    return { data: filteredReservations };
  },

  // Obtener una reserva específica por ID - ADMINs obtienen datos sin filtrar
  getById: async (id) => {
    await new Promise((resolve) => setTimeout(resolve, 200));

    const reservation = reservations.find((r) => r.id === parseInt(id));
    if (!reservation) {
      throw new Error('Reserva no encontrada');
    }

    // Obtener usuario actual
    const token = localStorage.getItem('token');
    let currentUser = null;
    if (token) {
      try {
        const userEmail = token.replace('mock_token_', '');
        currentUser = mockUsers.find((u) => u.email === userEmail);
      } catch (error) {
        console.warn('❌ Error decoding token for getById:', error);
      }
    }

    // Si es INSTITUTION_ADMIN, devolver datos sin filtrar
    const isAdmin = currentUser?.roles?.includes('INSTITUTION_ADMIN') || currentUser?.role === 'INSTITUTION_ADMIN';
    if (isAdmin) {
      return { data: transformReservationFormat(reservation) };
    }

    // Para otros roles, aplicar filtrado si es necesario
    const canAccess =
      currentUser?.roles?.includes('SOCIO') && !currentUser?.roles?.includes('INSTITUTION_ADMIN')
        ? reservation.userId === currentUser.email ||
          (currentUser.membershipNumber &&
            reservation.membershipNumber === currentUser.membershipNumber)
        : true;

    if (!canAccess) {
      // Devolver versión filtrada
      const filtered = filterSensitiveInfo(reservation, currentUser);

      return { data: transformReservationFormat(filtered) };
    }

    return { data: transformReservationFormat(reservation) };
  },

  // Nuevo método para obtener TODAS las reservas sin filtrado (para Dashboard/grilla)
  listUnfiltered: async (params = {}) => {
    await new Promise((resolve) => setTimeout(resolve, 400));
    let allReservations = [...reservations];

    // Aplicar filtros de fecha/cancha si existen (pero NO ocultación de información)
    if (params.date) {
      allReservations = allReservations.filter((r) => r.date === params.date);
    }
    if (params.courtId) {
      allReservations = allReservations.filter((r) => r.courtId === parseInt(params.courtId));
    }

    return { data: allReservations };
  },

  listAll: async (params = {}) => {
    await new Promise((resolve) => setTimeout(resolve, 400));
    let allReservations = [...reservations];

    // Aplicar filtros de fecha/cancha si existen (pero NO filtros de usuario)
    if (params.date) {
      allReservations = allReservations.filter((r) => r.date === params.date);
    }
    if (params.courtId) {
      allReservations = allReservations.filter((r) => r.courtId === parseInt(params.courtId));
    }

    // Para la grilla, aplicamos solo ocultación de información sensible (no filtrado por usuario)
    const token = localStorage.getItem('token');
    let currentUser = null;
    if (token) {
      try {
        const userEmail = token.replace('mock_token_', '');
        currentUser = mockUsers.find((u) => u.email === userEmail);
      } catch (error) {
        console.warn('❌ Dashboard - Error decoding token:', error);
      }
    }

    if (currentUser) {
      // Aplicar solo ocultación de información sensible (no filtrado por propietario)
      allReservations = allReservations.map((reservation) => {
        const filtered = filterSensitiveInfo(reservation, currentUser);
        return filtered;
      });
    }

    return { data: allReservations };
  },

  get: async (id) => ({
    data: reservations.find((r) => String(r.id) === String(id)),
  }),
  create: async (payload) => {
    // Obtener usuario actual del token para asignar ownership
    const token = localStorage.getItem('token');
    let currentUserEmail = null;
    let membershipNumber = null;

    if (token) {
      try {
        currentUserEmail = token.replace('mock_token_', '');
        const currentUser = mockUsers.find((u) => u.email === currentUserEmail);
        if (currentUser?.membershipNumber) {
          membershipNumber = currentUser.membershipNumber;
        }
      } catch (error) {
        console.warn('❌ Error getting current user for reservation:', error);
      }
    }

    const newRes = {
      ...payload,
      id: Math.max(...reservations.map((r) => r.id), 0) + 1,
      status: 'confirmed',
      createdAt: new Date().toISOString(),
      // Asignar ownership: respetar payload.userId si existe (para admins creando para socios)
      userId: payload.userId || currentUserEmail || 'admin@chedoparti.com',
      membershipNumber: payload.membershipNumber || membershipNumber,
      // ✅ Asegurar que customerName siempre esté poblado con el nombre del socio
      customerName: payload.customerName || payload.user || 'Usuario Desconocido',
      // Mapear campos para compatibilidad con el componente
      userPhone: payload.userPhone || payload.user?.phone,
      user: payload.customerName || payload.user || 'Usuario Desconocido',
      // Extraer fecha y hora de startAt para compatibilidad
      date: payload.startAt
        ? payload.startAt.split('T')[0]
        : new Date().toISOString().split('T')[0],
      time: payload.startAt ? payload.startAt.split('T')[1].slice(0, 5) : '09:00',
      // Calcular duración desde endAt
      duration:
        payload.startAt && payload.endAt
          ? (() => {
              const start = new Date(payload.startAt);
              const end = new Date(payload.endAt);
              const diffHours = (end - start) / (1000 * 60 * 60);
              const hours = Math.floor(diffHours);
              const minutes = Math.round((diffHours - hours) * 60);
              return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
            })()
          : '01:00',
    };

    reservations.push(newRes);

    // ✅ Registrar evento de creación en el historial
    const currentUser = getCurrentUser();
    addHistoryEvent(
      newRes.id,
      'CREATE',
      `Reserva creada para Cancha ${newRes.courtId} - ${newRes.sport || 'Padel'} el ${newRes.date} de ${newRes.time}`,
      currentUser ? {
        id: currentUser.id,
        name: currentUser.name,
        email: currentUser.email,
        role: currentUser.role || currentUser.primaryRole,
      } : null,
      null
    );

    // 🔔 Emitir evento de sincronización
    reservationSync.notifyReservationCreated(newRes);

    return { data: newRes };
  },
  update: async (id, payload) => {

    
    const idx = reservations.findIndex((r) => String(r.id) === String(id));
    if (idx >= 0) {
      const oldReservation = { ...reservations[idx] };


      // Actualizar con nuevos datos y recalcular campos derivados
      const updatedRes = {
        ...reservations[idx],
        ...payload,
        updatedAt: new Date().toISOString(),
        // Recalcular fecha/hora/duración si cambiaron startAt/endAt
        ...(payload.startAt && {
          date: payload.startAt.split('T')[0],
          time: payload.startAt.split('T')[1].slice(0, 5),
        }),
        ...(payload.startAt &&
          payload.endAt && {
            duration: (() => {
              const start = new Date(payload.startAt);
              const end = new Date(payload.endAt);
              const diffMs = end - start;
              const diffHours = diffMs / (1000 * 60 * 60);
              const hours = Math.floor(diffHours);
              const minutes = Math.round((diffHours - hours) * 60);
              const calculatedDuration = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;

              return calculatedDuration;
            })(),
          }),
      };



      reservations[idx] = updatedRes;

      // Log del ajuste de precio si se incluye
      if (payload.priceAdjustment) {
        // En un sistema real, aquí se procesaría el pago/reembolso
        if (payload.priceAdjustment.adjustmentType === 'charge') {
        } else if (payload.priceAdjustment.adjustmentType === 'refund') {
        }
      }

      // ✅ Registrar evento de actualización en el historial
      const currentUser = getCurrentUser();
      const changes = {};
      
      // Detectar cambios específicos

      
      if (oldReservation.courtId !== updatedRes.courtId) {
        changes.court = { from: `Cancha ${oldReservation.courtId}`, to: `Cancha ${updatedRes.courtId}` };
      }
      if (oldReservation.time !== updatedRes.time) {
        changes.time = { from: oldReservation.time, to: updatedRes.time };
      }
      if (oldReservation.duration !== updatedRes.duration) {
        changes.duration = { from: oldReservation.duration, to: updatedRes.duration };
      }
      if (oldReservation.date !== updatedRes.date) {
        changes.date = { from: oldReservation.date, to: updatedRes.date };
      }



      if (Object.keys(changes).length > 0) {
        addHistoryEvent(
          id,
          'UPDATE',
          `Reserva modificada - ${Object.keys(changes).join(', ')} actualizado(s)`,
          currentUser ? {
            id: currentUser.id,
            name: currentUser.name,
            email: currentUser.email,
            role: currentUser.role || currentUser.primaryRole,
          } : null,
          changes
        );
      }

      // 🔔 Emitir evento de sincronización
      reservationSync.notifyReservationUpdated(id, updatedRes);

      return {
        data: updatedRes,
        priceAdjustment: payload.priceAdjustment || null,
      };
    }

    return { data: null };
  },
  remove: async (id) => {
    const idx = reservations.findIndex((r) => String(r.id) === String(id));
    if (idx >= 0) {
      const removedReservation = reservations[idx];
      reservations.splice(idx, 1);

      // 🔔 Emitir evento de sincronización
      reservationSync.notifyReservationDeleted(id);

      return { data: true };
    }

    return { data: false };
  },
  changeStatus: async (id, status, reason) => {
    const idx = reservations.findIndex((r) => String(r.id) === String(id));
    if (idx >= 0) {
      const oldStatus = reservations[idx].status;

      reservations[idx] = {
        ...reservations[idx],
        status,
        statusReason: reason,
        updatedAt: new Date().toISOString(),
      };

      return { data: reservations[idx] };
    }

    return { data: null };
  },
  cancel: async (id, payload) => {
    const idx = reservations.findIndex((r) => String(r.id) === String(id));
    if (idx >= 0) {
      const oldStatus = reservations[idx].status;
      
      // ✅ Actualizar status a 'cancelled'
      reservations[idx] = {
        ...reservations[idx],
        status: 'cancelled',
        statusReason: payload?.reason || 'Cancelada por el usuario',
        cancelledAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };



      // ✅ Registrar evento de cancelación en el historial
      const currentUser = getCurrentUser();
      addHistoryEvent(
        id,
        'CANCEL',
        `Reserva cancelada: ${payload?.reason || 'Cancelada por el usuario'}`,
        currentUser ? {
          id: currentUser.id,
          name: currentUser.name,
          email: currentUser.email,
          role: currentUser.role || currentUser.primaryRole,
        } : null,
        {
          status: { from: oldStatus, to: 'cancelled' },
          cancellationReason: { from: null, to: payload?.reason || 'Cancelada por el usuario' }
        }
      );

      // 🔔 Emitir evento de sincronización
      reservationSync.notifyReservationCancelled(id);

      return { data: reservations[idx] };
    }

    return { data: null };
  },
  availability: async (params) => {
    await new Promise((resolve) => setTimeout(resolve, 200));

    // Generar disponibilidad mock basada en parámetros
    const { date, courtId } = params;
    const busySlots = reservations
      .filter((r) => r.date === date && (!courtId || r.courtId === parseInt(courtId)) && r.status !== 'cancelled')
      .map((r) => r.time);

    const allSlots = [];
    for (let hour = 8; hour <= 22; hour++) {
      const timeSlot = `${hour.toString().padStart(2, '0')}:00`;
      allSlots.push({
        time: timeSlot,
        available: !busySlots.includes(timeSlot),
        courtId: courtId || 1,
      });
    }

    return { data: allSlots };
  },

  // 🚀 Nuevos métodos para compatibilidad con hooks de sincronización
  getAll: async (filters = {}) => {
    // Reutilizar la lógica de listAll para mantener consistencia
    const result = await reservationsApi.listAll(filters);

    // Transformar reservas al formato con startAt/endAt
    const transformedData = (result.data || result.content || []).map(transformReservationFormat);

    return { ...result, data: transformedData };
  },

  getByDate: async (date) => {
    await new Promise((resolve) => setTimeout(resolve, 200));

    const filteredReservations = reservations.filter((r) => {
      // Soportar tanto formato ISO (startAt) como formato legacy (date)
      const reservationDate = r.startAt ? r.startAt.slice(0, 10) : r.date;
      return reservationDate === date;
    });

    // Transformar al nuevo formato
    const transformedReservations = filteredReservations.map(transformReservationFormat);

    return { data: transformedReservations };
  },
  getByCourt: async (courtId) => {
    await new Promise((resolve) => setTimeout(resolve, 200));

    const filteredReservations = reservations.filter((r) => {
      return String(r.courtId) === String(courtId);
    });

    // Transformar al nuevo formato
    const transformedReservations = filteredReservations.map(transformReservationFormat);

    return { data: transformedReservations };
  },
  getStats: async () => {
    await new Promise((resolve) => setTimeout(resolve, 300));

    const now = new Date();
    const today = now.toISOString().slice(0, 10);

    // Calcular estadísticas desde las reservas mock
    const stats = {
      total: reservations.length,
      confirmed: reservations.filter((r) => r.status === 'confirmed' || r.status === 'paid').length,
      pending: reservations.filter((r) => r.status === 'pending').length,
      cancelled: reservations.filter((r) => r.status === 'cancelled').length,
      active: reservations.filter((r) => r.status === 'active').length,
      completed: reservations.filter((r) => r.status === 'completed').length,
      expired: reservations.filter((r) => r.status === 'expired').length,
      noShow: reservations.filter((r) => r.status === 'no_show').length,
      processing: reservations.filter((r) => r.status === 'processing').length,

      // Estadísticas por fecha
      today: reservations.filter((r) => {
        const resDate = r.startAt ? r.startAt.slice(0, 10) : r.date;
        return resDate === today;
      }).length,

      // Revenue calculation
      totalRevenue: reservations.reduce((sum, r) => sum + (r.price || 0), 0),

      // Por día de la semana
      byWeekday: {
        0: reservations.filter((r) => new Date(r.startAt || r.date + 'T00:00:00').getDay() === 0)
          .length,
        1: reservations.filter((r) => new Date(r.startAt || r.date + 'T00:00:00').getDay() === 1)
          .length,
        2: reservations.filter((r) => new Date(r.startAt || r.date + 'T00:00:00').getDay() === 2)
          .length,
        3: reservations.filter((r) => new Date(r.startAt || r.date + 'T00:00:00').getDay() === 3)
          .length,
        4: reservations.filter((r) => new Date(r.startAt || r.date + 'T00:00:00').getDay() === 4)
          .length,
        5: reservations.filter((r) => new Date(r.startAt || r.date + 'T00:00:00').getDay() === 5)
          .length,
        6: reservations.filter((r) => new Date(r.startAt || r.date + 'T00:00:00').getDay() === 6)
          .length,
      },
    };

    return { data: stats };
  },
};

// Mock API de estadísticas
export const statsApi = {
  overview: async () => {
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Generar estadísticas mock basadas en reservaciones
    const totalReservations = reservations.length;
    const todayReservations = reservations.filter((r) => r.date === today).length;
    const revenue = reservations.reduce((sum, r) => sum + (r.price || 0), 0);

    return {
      data: [
        { name: 'Reservas Totales', value: totalReservations, change: 12 },
        { name: 'Reservas Hoy', value: todayReservations, change: -5 },
        { name: 'Ingresos', value: revenue, change: 8 },
        { name: 'Canchas Activas', value: mockCourts.length, change: 0 },
      ],
    };
  },
};

// Mock API de historial
// Datos de historial mock con tracking completo
const mockHistoryEntries = [
  // Reserva ID 1 - Ana García - Ciclo completo
  {
    id: 1,
    reservationId: 1,
    action: 'reservation_created',
    actionType: 'CREATE',
    timestamp: '2025-11-10T09:15:00Z',
    performedBy: {
      id: 2,
      name: 'Ana Garcia',
      email: 'socio@chedoparti.com',
      role: 'SOCIO',
    },
    details: 'Reserva creada para Cancha 1 - Padel el 2025-11-15 de 10:00 a 11:30',
    reservationDetails: {
      court: 'Cancha 1',
      sport: 'Padel',
      date: '2025-11-15',
      time: '10:00',
      duration: '01:30',
      user: 'Ana Garcia',
      status: 'confirmed',
    },
    changes: null,
    ipAddress: '192.168.1.100',
    userAgent: 'Chrome/119.0.0.0',
  },
  {
    id: 2,
    reservationId: 1,
    action: 'reservation_modified',
    actionType: 'UPDATE',
    timestamp: '2025-11-12T14:30:00Z',
    performedBy: {
      id: 1,
      name: 'Carlos Rodriguez',
      email: 'admin@chedoparti.com',
      role: 'INSTITUTION_ADMIN',
    },
    details: 'Duración modificada de 1:30 a 2:00 horas por solicitud del socio',
    reservationDetails: {
      court: 'Cancha 1',
      sport: 'Padel',
      date: '2025-11-15',
      time: '10:00',
      duration: '02:00',
      user: 'Ana Garcia',
      status: 'confirmed',
    },
    changes: {
      duration: { from: '01:30', to: '02:00' },
    },
    ipAddress: '192.168.1.50',
    userAgent: 'Firefox/119.0',
  },
  {
    id: 3,
    reservationId: 1,
    action: 'reservation_completed',
    actionType: 'COMPLETE',
    timestamp: '2025-11-15T12:00:00Z',
    performedBy: {
      id: 1,
      name: 'Sistema Automatico',
      email: 'system@chedoparti.com',
      role: 'SYSTEM',
    },
    details: 'Reserva completada automáticamente',
    reservationDetails: {
      court: 'Cancha 1',
      sport: 'Padel',
      date: '2025-11-15',
      time: '10:00',
      duration: '02:00',
      user: 'Ana Garcia',
      status: 'completed',
    },
    changes: {
      status: { from: 'confirmed', to: 'completed' },
    },
    ipAddress: null,
    userAgent: 'System Process',
  },

  // Reserva ID 2 - Juan Pérez - Con cancelación
  {
    id: 4,
    reservationId: 2,
    action: 'reservation_created',
    actionType: 'CREATE',
    timestamp: '2025-11-08T16:45:00Z',
    performedBy: {
      id: 4,
      name: 'Juan Pérez',
      email: 'socio2@chedoparti.com',
      role: 'SOCIO',
    },
    details: 'Reserva creada para Cancha 2 - Tenis el 2025-11-12 de 18:00 a 19:00',
    reservationDetails: {
      court: 'Cancha 2',
      sport: 'Tenis',
      date: '2025-11-12',
      time: '18:00',
      duration: '01:00',
      user: 'Juan Pérez',
      status: 'confirmed',
    },
    changes: null,
    ipAddress: '192.168.1.105',
    userAgent: 'Safari/17.1',
  },
  {
    id: 5,
    reservationId: 2,
    action: 'reservation_cancelled',
    actionType: 'CANCEL',
    timestamp: '2025-11-11T10:20:00Z',
    performedBy: {
      id: 4,
      name: 'Juan Pérez',
      email: 'socio2@chedoparti.com',
      role: 'SOCIO',
    },
    details: 'Reserva cancelada por el usuario con 25 horas de anticipación',
    reservationDetails: {
      court: 'Cancha 2',
      sport: 'Tenis',
      date: '2025-11-12',
      time: '18:00',
      duration: '01:00',
      user: 'Juan Pérez',
      status: 'cancelled',
    },
    changes: {
      status: { from: 'confirmed', to: 'cancelled' },
      cancellationReason: { from: null, to: 'Cambio de planes personales' },
    },
    ipAddress: '192.168.1.105',
    userAgent: 'Safari/17.1',
  },

  // Reserva ID 3 - Creada por ADMIN para socio
  {
    id: 6,
    reservationId: 3,
    action: 'reservation_created',
    actionType: 'CREATE',
    timestamp: '2025-11-09T11:10:00Z',
    performedBy: {
      id: 1,
      name: 'Carlos Rodriguez',
      email: 'admin@chedoparti.com',
      role: 'INSTITUTION_ADMIN',
    },
    details: 'Reserva creada por administrador para María López en Cancha 1 - Padel',
    reservationDetails: {
      court: 'Cancha 1',
      sport: 'Padel',
      date: '2025-11-14',
      time: '15:30',
      duration: '01:00',
      user: 'María López',
      status: 'confirmed',
    },
    changes: null,
    ipAddress: '192.168.1.50',
    userAgent: 'Chrome/119.0.0.0',
  },
  {
    id: 7,
    reservationId: 3,
    action: 'reservation_modified',
    actionType: 'UPDATE',
    timestamp: '2025-11-13T09:45:00Z',
    performedBy: {
      id: 1,
      name: 'Carlos Rodriguez',
      email: 'admin@chedoparti.com',
      role: 'INSTITUTION_ADMINADMIN',
    },
    details: 'Horario modificado por conflicto de agenda',
    reservationDetails: {
      court: 'Cancha 1',
      sport: 'Padel',
      date: '2025-11-14',
      time: '16:00',
      duration: '01:00',
      user: 'María López',
      status: 'confirmed',
    },
    changes: {
      time: { from: '15:30', to: '16:00' },
    },
    ipAddress: '192.168.1.50',
    userAgent: 'Chrome/119.0.0.0',
  },

  // Reserva ID 4 - Estado Pendiente (recién creada)
  {
    id: 8,
    reservationId: 4,
    action: 'reservation_created',
    actionType: 'CREATE',
    timestamp: '2025-11-14T08:00:00Z',
    performedBy: {
      id: 5,
      name: 'Luis Martínez',
      email: 'socio3@chedoparti.com',
      role: 'SOCIO',
    },
    details: 'Reserva creada para Cancha 3 - Tenis el 2025-11-18 de 09:00 a 10:00',
    reservationDetails: {
      court: 'Cancha 3',
      sport: 'Tenis',
      date: '2025-11-18',
      time: '09:00',
      duration: '01:00',
      user: 'Luis Martínez',
      status: 'pending',
    },
    changes: null,
    ipAddress: '192.168.1.120',
    userAgent: 'Chrome/119.0.0.0',
  },

  // Reserva ID 5 - No Show
  {
    id: 9,
    reservationId: 5,
    action: 'reservation_created',
    actionType: 'CREATE',
    timestamp: '2025-11-05T14:20:00Z',
    performedBy: {
      id: 6,
      name: 'Carmen Vega',
      email: 'socio4@chedoparti.com',
      role: 'SOCIO',
    },
    details: 'Reserva creada para Cancha 2 - Padel el 2025-11-10 de 17:00 a 18:30',
    reservationDetails: {
      court: 'Cancha 2',
      sport: 'Padel',
      date: '2025-11-10',
      time: '17:00',
      duration: '01:30',
      user: 'Carmen Vega',
      status: 'confirmed',
    },
    changes: null,
    ipAddress: '192.168.1.135',
    userAgent: 'Safari/17.1',
  },
  {
    id: 10,
    reservationId: 5,
    action: 'reservation_no_show',
    actionType: 'NO_SHOW',
    timestamp: '2025-11-10T17:15:00Z',
    performedBy: {
      id: 1,
      name: 'Sistema Automatico',
      email: 'system@chedoparti.com',
      role: 'SYSTEM',
    },
    details:
      'No show detectado automáticamente - Cliente no se presentó 15 minutos después del horario',
    reservationDetails: {
      court: 'Cancha 2',
      sport: 'Padel',
      date: '2025-11-10',
      time: '17:00',
      duration: '01:30',
      user: 'Carmen Vega',
      status: 'no_show',
    },
    changes: {
      status: { from: 'confirmed', to: 'no_show' },
      noShowReason: { from: null, to: 'Cliente no se presentó en el horario establecido' },
    },
    ipAddress: null,
    userAgent: 'System Process',
  },

  // Reserva ID 6 - Múltiples modificaciones
  {
    id: 11,
    reservationId: 6,
    action: 'reservation_created',
    actionType: 'CREATE',
    timestamp: '2025-11-07T13:30:00Z',
    performedBy: {
      id: 7,
      name: 'Pedro Sánchez',
      email: 'socio5@chedoparti.com',
      role: 'SOCIO',
    },
    details: 'Reserva creada para Cancha 1 - Padel el 2025-11-20 de 19:00 a 20:00',
    reservationDetails: {
      court: 'Cancha 1',
      sport: 'Padel',
      date: '2025-11-20',
      time: '19:00',
      duration: '01:00',
      user: 'Pedro Sánchez',
      status: 'confirmed',
    },
    changes: null,
    ipAddress: '192.168.1.140',
    userAgent: 'Firefox/119.0',
  },
  {
    id: 12,
    reservationId: 6,
    action: 'reservation_modified',
    actionType: 'UPDATE',
    timestamp: '2025-11-10T16:15:00Z',
    performedBy: {
      id: 7,
      name: 'Pedro Sánchez',
      email: 'socio5@chedoparti.com',
      role: 'SOCIO',
    },
    details: 'Cancha cambiada por mantenimiento de la cancha original',
    reservationDetails: {
      court: 'Cancha 3',
      sport: 'Padel',
      date: '2025-11-20',
      time: '19:00',
      duration: '01:00',
      user: 'Pedro Sánchez',
      status: 'confirmed',
    },
    changes: {
      court: { from: 'Cancha 1', to: 'Cancha 3' },
    },
    ipAddress: '192.168.1.140',
    userAgent: 'Firefox/119.0',
  },
  {
    id: 13,
    reservationId: 6,
    action: 'reservation_modified',
    actionType: 'UPDATE',
    timestamp: '2025-11-12T11:45:00Z',
    performedBy: {
      id: 1,
      name: 'Carlos Rodriguez',
      email: 'admin@chedoparti.com',
      role: 'INSTITUTION_ADMIN',
    },
    details: 'Duración extendida por disponibilidad de cancha',
    reservationDetails: {
      court: 'Cancha 3',
      sport: 'Padel',
      date: '2025-11-20',
      time: '19:00',
      duration: '01:30',
      user: 'Pedro Sánchez',
      status: 'confirmed',
    },
    changes: {
      duration: { from: '01:00', to: '01:30' },
    },
    ipAddress: '192.168.1.50',
    userAgent: 'Chrome/119.0.0.0',
  },

  // Reserva ID 7 - Reserva futura confirmada
  {
    id: 14,
    reservationId: 7,
    action: 'reservation_created',
    actionType: 'CREATE',
    timestamp: '2025-11-13T20:30:00Z',
    performedBy: {
      id: 8,
      name: 'Elena Torres',
      email: 'socio6@chedoparti.com',
      role: 'SOCIO',
    },
    details: 'Reserva creada para Cancha 2 - Tenis el 2025-11-25 de 16:00 a 17:00',
    reservationDetails: {
      court: 'Cancha 2',
      sport: 'Tenis',
      date: '2025-11-25',
      time: '16:00',
      duration: '01:00',
      user: 'Elena Torres',
      status: 'confirmed',
    },
    changes: null,
    ipAddress: '192.168.1.155',
    userAgent: 'Edge/119.0.0.0',
  },
];

export const historyApi = {
  list: async (params = {}) => {
    await new Promise((resolve) => setTimeout(resolve, 300));

    let filteredHistory = [...mockHistoryEntries];

    // Aplicar filtros básicos primero
    // Filtrar por usuario
    if (params.userId) {
      filteredHistory = filteredHistory.filter(
        (entry) => entry.performedBy.id === parseInt(params.userId)
      );
    }

    // Filtrar por ID de reserva
    if (params.reservationId) {
      filteredHistory = filteredHistory.filter(
        (entry) => entry.reservationId === parseInt(params.reservationId)
      );
    }

    // Filtrar por rango de fechas
    if (params.dateFrom) {
      const fromDate = new Date(params.dateFrom);
      filteredHistory = filteredHistory.filter((entry) => new Date(entry.timestamp) >= fromDate);
    }

    if (params.dateTo) {
      const toDate = new Date(params.dateTo);
      toDate.setHours(23, 59, 59, 999); // Final del día
      filteredHistory = filteredHistory.filter((entry) => new Date(entry.timestamp) <= toDate);
    }

    // Búsqueda por texto
    if (params.search && params.search.trim()) {
      const searchTerm = params.search.toLowerCase();
      filteredHistory = filteredHistory.filter(
        (entry) =>
          entry.details.toLowerCase().includes(searchTerm) ||
          entry.performedBy.name.toLowerCase().includes(searchTerm) ||
          entry.reservationDetails.user.toLowerCase().includes(searchTerm) ||
          entry.reservationDetails.court.toLowerCase().includes(searchTerm)
      );
    }

    // Agrupar por reservationId y crear resumen por reserva
    const reservationGroups = {};
    filteredHistory.forEach((entry) => {
      if (!reservationGroups[entry.reservationId]) {
        reservationGroups[entry.reservationId] = {
          reservationId: entry.reservationId,
          reservationDetails: entry.reservationDetails,
          events: [],
          firstEvent: null,
          lastEvent: null,
          totalEvents: 0,
          currentStatus: 'active',
          createdBy: null,
          lastModifiedBy: null,
        };
      }

      reservationGroups[entry.reservationId].events.push(entry);
    });

    // Procesar cada grupo para crear el resumen
    const reservationSummaries = Object.values(reservationGroups).map((group) => {
      // Ordenar eventos por fecha
      group.events.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

      const firstEvent = group.events[0];
      const lastEvent = group.events[group.events.length - 1];

      // Determinar estado actual basado en el último evento
      let currentStatus = lastEvent.reservationDetails.status || 'active';

      // Mapear estados adicionales basados en el actionType si no viene en reservationDetails
      const lastAction = lastEvent.actionType;
      if (lastAction === 'CANCEL') currentStatus = 'cancelled';
      else if (lastAction === 'COMPLETE') currentStatus = 'completed';
      else if (lastAction === 'DELETE') currentStatus = 'deleted';
      else if (lastAction === 'NO_SHOW') currentStatus = 'no_show';

      // Obtener información de creador y último modificador
      const createdBy = firstEvent.performedBy;
      const lastModifiedBy = lastEvent.performedBy;

      return {
        id: group.reservationId, // ID de la reserva para mostrar en la tabla
        reservationId: group.reservationId,
        // Campos que espera el componente directamente
        status: currentStatus,
        court: lastEvent.reservationDetails.court,
        sport: lastEvent.reservationDetails.sport,
        date: lastEvent.reservationDetails.date,
        time: lastEvent.reservationDetails.time,
        customerName: lastEvent.reservationDetails.user,
        createdAt: firstEvent.timestamp,
        lastUpdate: lastEvent.timestamp,
        // Información adicional
        reservationDetails: lastEvent.reservationDetails,
        firstEventDate: firstEvent.timestamp,
        lastEventDate: lastEvent.timestamp,
        totalEvents: group.events.length,
        createdBy,
        lastModifiedBy,
        events: group.events, // Todos los eventos para el modal
        // Campos para compatibilidad con el componente actual
        timestamp: lastEvent.timestamp,
        performedBy: lastModifiedBy,
        action: 'reservation_summary',
        actionType: 'SUMMARY',
        details: `${group.events.length} eventos registrados`,
        changes: null,
      };
    });

    // Filtrar por acción (solo después de agrupar)
    let finalResults = reservationSummaries;
    if (params.action && params.action !== 'all') {
      // Si se filtra por una acción específica, solo mostrar reservas que tengan esa acción
      finalResults = reservationSummaries.filter((summary) =>
        summary.events.some((event) => event.actionType === params.action)
      );
    }

    // Ordenar por fecha del último evento (más reciente primero)
    finalResults.sort((a, b) => new Date(b.lastEventDate) - new Date(a.lastEventDate));

    return {
      data: finalResults,
      totalCount: finalResults.length,
      filteredCount: finalResults.length,
    };
  },

  getByReservation: async (reservationId) => {
    await new Promise((resolve) => setTimeout(resolve, 200));

    const reservationHistory = mockHistoryEntries.filter(
      (entry) => entry.reservationId === parseInt(reservationId)
    );

    reservationHistory.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    return { data: reservationHistory };
  },
};

// Mock API de horarios - Compatible con la UI actual
import { updateInstitutionSchedule, updateSlotInterval } from './institutionConfig';

export const schedulesApi = {
  list: async () => {
    await new Promise((resolve) => setTimeout(resolve, 200));

    // Estructura de datos compatible con el componente SchedulesPanel
    const mockScheduleData = {
      groups: [
        {
          days: ['lunes', 'martes', 'miercoles', 'jueves'],
          horarios: [
            { open: '08:00', close: '12:00' },
            { open: '14:00', close: '23:00' },
          ],
        },
        {
          days: ['viernes'],
          horarios: [{ open: '08:00', close: '01:00' }],
        },
        {
          days: ['sabado'],
          horarios: [{ open: '09:00', close: '22:00' }],
        },
        {
          days: ['domingo'],
          horarios: [{ open: '09:00', close: '21:00' }],
        },
      ],
      feriados: [
        { fecha: '2024-12-25', open: '10:00', close: '20:00' },
        { fecha: '2024-01-01', open: '12:00', close: '18:00' },
        { fecha: '2024-05-01', open: '09:00', close: '21:00' },
      ],
      intervalMinutes: 30,
    };

    return { data: mockScheduleData };
  },
  update: async (payload) => {
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Si el payload contiene groups (estructura del panel), convertir a mapa por día con rangos
    try {
      if (payload && payload.groups) {
        const daysMap = {};
        // Inicializar días como deshabilitados
        ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'].forEach((d) => {
          daysMap[d] = { enabled: false, ranges: [] };
        });

        // Procesar cada grupo y sus horarios
        payload.groups.forEach((group) => {
          const horarios = group.horarios || [];
          if (!horarios.length) return;

          // Convertir horarios a rangos
          const ranges = horarios.map((h) => ({
            openTime: h.open || '08:00',
            closeTime: h.close || '23:00',
          }));

          // Aplicar rangos a todos los días del grupo
          (group.days || []).forEach((dayKey) => {
            if (!daysMap[dayKey]) {
              daysMap[dayKey] = { enabled: true, ranges: [] };
            } else {
              daysMap[dayKey].enabled = true;
            }
            // Agregar los rangos (pueden ser múltiples por día)
            daysMap[dayKey].ranges.push(...ranges);
          });
        });

        // Incorporar feriados si vienen en payload
        const institutionSchedule = { ...daysMap, feriados: payload.feriados || [] };

        // Persistir en institution config para que CalendarGrid y otros lo reciban
        await updateInstitutionSchedule(institutionSchedule);
      }

      // Actualizar intervalo de slots si viene
      if (payload && payload.intervalMinutes) {
        await updateSlotInterval(Number(payload.intervalMinutes), false);
      }
    } catch (err) {
      console.error('Error applying schedule to institution config (mock):', err);
    }

    return { data: payload };
  },
};

// Mock API de precios
// Mock API de precios
import { updatePricingConfig } from './institutionConfig';

export const pricesApi = {
  list: async () => {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return { data: defaultPricing };
  },
  update: async (payload) => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    
    // Persistir configuración de precios
    try {
      await updatePricingConfig(payload);
    } catch (err) {
      console.error('Error updating pricing config (mock):', err);
    }
    
    return { data: payload };
  },
};

// Mock API de torneos
export const tournamentsApi = {
  list: async (params = {}) => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return { data: tournaments };
  },
  get: async (id) => ({
    data: tournaments.find((t) => String(t.id) === String(id)),
  }),
  create: async (payload) => {
    const newTournament = {
      ...payload,
      id: Math.max(...tournaments.map((t) => t.id), 0) + 1,
      status: 'upcoming',
      createdAt: new Date().toISOString(),
    };
    tournaments.push(newTournament);
    return { data: newTournament };
  },
  update: async (id, payload) => {
    const idx = tournaments.findIndex((t) => String(t.id) === String(id));
    if (idx >= 0) {
      tournaments[idx] = { ...tournaments[idx], ...payload };
      return { data: tournaments[idx] };
    }
    return { data: null };
  },
  remove: async (id) => {
    const idx = tournaments.findIndex((t) => String(t.id) === String(id));
    if (idx >= 0) {
      tournaments.splice(idx, 1);
      return { data: true };
    }
    return { data: false };
  },
};

// API para gestión de usuarios (solo ADMIN)
export const usersApi = {
  // Listar todos los usuarios
  list: async () => {
    await new Promise((resolve) => setTimeout(resolve, 300));

    const usersWithStats = mockUsers.map((user) => ({
      ...user,
      // Agregar estadísticas calculadas
      totalReservations: reservations.filter((r) => r.userId === user.email).length,
      lastActivity:
        user.email === 'admin@chedoparti.com'
          ? new Date().toISOString()
          : new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'active', // active, inactive, suspended
      createdAt: user.memberSince || '2023-01-01T00:00:00Z',
    }));

    return { data: usersWithStats };
  },

  // Obtener un usuario específico
  get: async (id) => {
    await new Promise((resolve) => setTimeout(resolve, 200));

    const user = mockUsers.find((u) => u.id === parseInt(id) || u.email === id);
    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    return {
      data: {
        ...user,
        totalReservations: reservations.filter((r) => r.userId === user.email).length,
        lastActivity: new Date().toISOString(),
        status: 'active',
      },
    };
  },

  // Crear nuevo usuario
  create: async (payload) => {
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Validar email único
    const existingUser = mockUsers.find((u) => u.email === payload.email);
    if (existingUser) {
      throw new Error('El email ya está registrado');
    }

    // Procesar roles múltiples
    const roles = payload.roles || [payload.role || 'SOCIO'];
    const primaryRole = payload.primaryRole || roles[0];

    // Generar membership number si es socio
    let membershipNumber = null;
    let memberSince = null;
    if (roles.includes('SOCIO')) {
      const existingNumbers = mockUsers
        .filter((u) => u.membershipNumber)
        .map((u) => parseInt(u.membershipNumber.replace('S', '')))
        .sort((a, b) => b - a);

      const nextNumber = (existingNumbers[0] || 1000) + Math.floor(Math.random() * 100) + 1;
      membershipNumber = `S${String(nextNumber).padStart(6, '0')}`;
      memberSince = new Date().toISOString().split('T')[0];
    }

    const newUser = {
      id: Math.max(...mockUsers.map((u) => u.id), 0) + 1,
      email: payload.email,
      password: payload.password || 'temp123',
      name: payload.name,
      roles: roles,
      primaryRole: primaryRole,
      phone: payload.phone || null,
      avatar: payload.avatar || null,
      permissions: getAllPermissionsForRoles(roles),
      membershipNumber: membershipNumber,
      memberSince: memberSince,
      specialties: roles.includes('COACH') ? payload.specialties || [] : null,
      certification: roles.includes('COACH') ? payload.certification || null : null,
      status: 'active',
      membershipStatus: roles.includes('SOCIO') ? 'active' : null,
      penaltyInfo: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      totalReservations: 0,
      lastActivity: new Date().toISOString(),
    };

    mockUsers.push(newUser);

    return { data: newUser };
  },

  // Actualizar usuario existente
  update: async (id, payload) => {
    await new Promise((resolve) => setTimeout(resolve, 400));

    const userIndex = mockUsers.findIndex((u) => u.id === parseInt(id));
    if (userIndex === -1) {
      throw new Error('Usuario no encontrado');
    }

    // Validar email único (excluyendo el usuario actual)
    if (payload.email) {
      const existingUser = mockUsers.find(
        (u) => u.email === payload.email && u.id !== parseInt(id)
      );
      if (existingUser) {
        throw new Error('El email ya está registrado');
      }
    }

    // Procesar roles si se actualizaron
    let updatedRoles = payload.roles || mockUsers[userIndex].roles;
    let updatedPrimaryRole = payload.primaryRole || mockUsers[userIndex].primaryRole;

    // Actualizar membership si se agregó el rol SOCIO
    let membershipInfo = {};
    if (updatedRoles.includes('SOCIO') && !mockUsers[userIndex].roles.includes('SOCIO')) {
      const existingNumbers = mockUsers
        .filter((u) => u.membershipNumber)
        .map((u) => parseInt(u.membershipNumber.replace('S', '')))
        .sort((a, b) => b - a);

      membershipInfo.membershipNumber = `S${String((existingNumbers[0] || 1000) + Math.floor(Math.random() * 100) + 1).padStart(6, '0')}`;
      membershipInfo.memberSince = new Date().toISOString().split('T')[0];
      membershipInfo.membershipStatus = 'active';
      membershipInfo.penaltyInfo = null;
    }

    const updatedUser = {
      ...mockUsers[userIndex],
      ...payload,
      ...membershipInfo,
      roles: updatedRoles,
      primaryRole: updatedPrimaryRole,
      updatedAt: new Date().toISOString(),
      // Actualizar permisos basado en todos los roles
      permissions:
        payload.roles || payload.role
          ? getAllPermissionsForRoles(updatedRoles)
          : mockUsers[userIndex].permissions,
    };

    mockUsers[userIndex] = updatedUser;

    return { data: updatedUser };
  },

  // Eliminar usuario (solo para no-socios)
  remove: async (id) => {
    await new Promise((resolve) => setTimeout(resolve, 300));

    const userIndex = mockUsers.findIndex((u) => u.id === parseInt(id));
    if (userIndex === -1) {
      throw new Error('Usuario no encontrado');
    }

    const user = mockUsers[userIndex];
    const userEmail = user.email;

    // No permitir eliminar el admin principal
    if (userEmail === 'admin@chedoparti.com') {
      throw new Error('No se puede eliminar el administrador principal');
    }

    // No permitir eliminar socios (solo suspenderlos/penalizarlos)
    if (user.roles && user.roles.includes('SOCIO')) {
      throw new Error(
        'Los socios no pueden ser eliminados. Use la función de penalización o suspensión.'
      );
    }

    // Eliminar usuario
    mockUsers.splice(userIndex, 1);

    // Opcional: Marcar reservas del usuario como huérfanas
    reservations.forEach((reservation) => {
      if (reservation.userId === userEmail) {
        reservation.userId = null;
        reservation.user = 'Usuario eliminado';
        reservation.membershipNumber = null;
      }
    });

    return { data: true };
  },

  // Penalizar socio
  penalizeMember: async (id, penaltyData) => {
    await new Promise((resolve) => setTimeout(resolve, 400));

    const userIndex = mockUsers.findIndex((u) => u.id === parseInt(id));
    if (userIndex === -1) {
      throw new Error('Usuario no encontrado');
    }

    const user = mockUsers[userIndex];
    if (!user.roles || !user.roles.includes('SOCIO')) {
      throw new Error('Solo se pueden penalizar socios del club');
    }

    const penaltyInfo = {
      reason: penaltyData.reason,
      penalizedBy: penaltyData.penalizedBy,
      penalizedAt: new Date().toISOString(),
      penaltyUntil: penaltyData.penaltyUntil,
      canMakeReservations: false,
      notes: penaltyData.notes || null,
    };

    mockUsers[userIndex] = {
      ...user,
      status: 'penalized',
      membershipStatus: 'penalized',
      penaltyInfo: penaltyInfo,
      updatedAt: new Date().toISOString(),
    };

    return { data: mockUsers[userIndex] };
  },

  // Levantar penalización
  removePenalty: async (id, adminEmail) => {
    await new Promise((resolve) => setTimeout(resolve, 300));

    const userIndex = mockUsers.findIndex((u) => u.id === parseInt(id));
    if (userIndex === -1) {
      throw new Error('Usuario no encontrado');
    }

    const user = mockUsers[userIndex];
    if (user.membershipStatus !== 'penalized') {
      throw new Error('El usuario no está actualmente penalizado');
    }

    mockUsers[userIndex] = {
      ...user,
      status: 'active',
      membershipStatus: 'active',
      penaltyInfo: {
        ...user.penaltyInfo,
        removedBy: adminEmail,
        removedAt: new Date().toISOString(),
        canMakeReservations: true,
      },
      updatedAt: new Date().toISOString(),
    };

    return { data: mockUsers[userIndex] };
  },

  // Suspender temporalmente
  suspend: async (id, suspensionData) => {
    await new Promise((resolve) => setTimeout(resolve, 400));

    const userIndex = mockUsers.findIndex((u) => u.id === parseInt(id));
    if (userIndex === -1) {
      throw new Error('Usuario no encontrado');
    }

    const user = mockUsers[userIndex];
    const suspensionInfo = {
      reason: suspensionData.reason,
      suspendedBy: suspensionData.suspendedBy,
      suspendedAt: new Date().toISOString(),
      suspendedUntil: suspensionData.suspendedUntil,
      canMakeReservations: false,
      notes: suspensionData.notes || null,
    };

    mockUsers[userIndex] = {
      ...user,
      status: 'suspended',
      membershipStatus: user.roles?.includes('SOCIO') ? 'suspended' : user.membershipStatus,
      suspensionInfo: suspensionInfo,
      updatedAt: new Date().toISOString(),
    };

    return { data: mockUsers[userIndex] };
  },

  // Búsqueda de socios para ADMINs (autocompletado en reservas)
  searchMembers: async (searchTerm = '') => {
    await new Promise((resolve) => setTimeout(resolve, 200));

    if (!searchTerm || searchTerm.length < 2) {
      // Sin término de búsqueda, devolver solo socios activos limitados
      const activeMembers = mockUsers
        .filter(
          (user) =>
            user.roles?.includes('SOCIO') &&
            user.membershipStatus === 'active' &&
            user.status === 'active'
        )
        .slice(0, 10); // Limitar resultados iniciales

      return { data: activeMembers };
    }

    // Filtrar socios que coincidan con el término de búsqueda
    const term = searchTerm.toLowerCase().trim();
    const matchingMembers = mockUsers.filter((user) => {
      if (!user.roles?.includes('SOCIO')) return false;

      // Buscar en múltiples campos
      const searchFields = [
        user.name?.toLowerCase(),
        user.membershipNumber?.toLowerCase(),
        user.dni?.toString(),
        user.phone?.replace(/\D/g, ''), // Solo números del teléfono
        user.email?.toLowerCase(),
      ].filter(Boolean); // Eliminar valores undefined/null

      // Búsqueda más flexible: coincidencia parcial en cualquier campo
      return searchFields.some((field) => field.includes(term));
    });

    return { data: matchingMembers.slice(0, 20) }; // Limitar a 20 resultados
  },
};

// Función helper para obtener permisos según el rol
function getRolePermissions(role) {
  switch (role) {
    case 'INSTITUTION_ADMIN':
      return [
        'manage_courts',
        'manage_users',
        'manage_reservations',
        'manage_tournaments',
        'view_stats',
        'manage_schedules',
        'manage_pricing',
        'penalize_members',
        'manage_coach_quotas', // New permission
      ];
    case 'COACH':
      return [
        'view_reservations',
        'create_reservations',
        'manage_tournaments',
        'view_stats',
        'manage_own_availability', // New permission
      ];
    case 'SOCIO':
      return ['view_reservations', 'create_reservations', 'view_tournaments'];
    default:
      return [];
  }
}

// Función helper para obtener todos los permisos de múltiples roles
function getAllPermissionsForRoles(roles) {
  const allPermissions = new Set();

  roles.forEach((role) => {
    const rolePermissions = getRolePermissions(role);
    rolePermissions.forEach((permission) => allPermissions.add(permission));
  });

  return Array.from(allPermissions);
}
