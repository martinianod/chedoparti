/**
 * API layer for backend communication.
 * All endpoints use JWT authentication (except auth).
 *
 * @module api
 *
 * Example usage:
 * import { reservationsApi } from './api';
 * reservationsApi.list({ date: '2025-11-16' })
 *   .then(res => ...)
 *
 * Endpoints:
 * - Auth: /auth/login, /auth/me, /auth/register
 * - Institutions: /institution/institutions, /institution/institutions/{id}
 * - Courts: /institution/institutions/{id}/courts
 * - Reservations: /reservation/reservations, /reservation/availability
 * - Stats: /reservation/stats/overview
 * - History: /reservation/history
 * - Schedules: /institution/schedules
 *
 * All methods return Axios promises.
 */

import apiClient from '../api/client';

const normalizeReservation = (reservation = {}) => {
  if (!reservation || typeof reservation !== 'object') return reservation;

  const userObj =
    reservation.user && typeof reservation.user === 'object' ? reservation.user : null;

  const derivedName =
    reservation.customerName ||
    reservation.userName ||
    userObj?.fullName ||
    userObj?.name ||
    userObj?.username ||
    reservation.user ||
    reservation.userEmail ||
    reservation.membershipName ||
    'Reserva';

  return {
    ...reservation,
    customerName: reservation.customerName || derivedName,
    userName: reservation.userName || derivedName,
    user:
      typeof reservation.user === 'object'
        ? userObj?.fullName || userObj?.name || userObj?.username || userObj?.email || derivedName
        : reservation.user || derivedName,
    userEmail: reservation.userEmail || userObj?.email || null,
    userPhone: reservation.userPhone || userObj?.phone || userObj?.phoneNumber || null,
    rawUser: userObj || reservation.rawUser || null,
  };
};

const transformReservationResponse = (response) => {
  if (!response || typeof response !== 'object' || !('data' in response)) {
    return response;
  }

  const { data } = response;

  if (Array.isArray(data)) {
    return { ...response, data: data.map(normalizeReservation) };
  }

  if (data && typeof data === 'object') {
    if (Array.isArray(data.content)) {
      return {
        ...response,
        data: { ...data, content: data.content.map(normalizeReservation) },
      };
    }

    return { ...response, data: normalizeReservation(data) };
  }

  return response;
};

const withReservationTransform = (promise) => promise.then(transformReservationResponse);

// Real API implementations
const realAuthApi = {
  login: (email, password) => apiClient.post('/auth/login', { email, password }),
  me: () => apiClient.get('/auth/me'),
  register: (userData) => apiClient.post('/auth/register', userData),
};

const realInstitutionsApi = {
  list: () => apiClient.get('/institution/institutions'),
  get: (id) => apiClient.get(`/institution/institutions/${id}`),
  create: (payload) => apiClient.post('/institution/institutions', payload),
  update: (id, payload) => apiClient.put(`/institution/institutions/${id}`, payload),
  remove: (id) => apiClient.delete(`/institution/institutions/${id}`),
};

const realCourtsApi = {
  list: (institutionId = 1, params = {}) =>
    apiClient.get(`/institution/institutions/${institutionId}/courts`, { params }),
  listActive: (institutionId = 1) =>
    apiClient.get(`/institution/institutions/${institutionId}/courts`),
  get: (institutionId, courtId) =>
    apiClient.get(`/institution/institutions/${institutionId}/courts/${courtId}`),
  create: (institutionId, payload) =>
    apiClient.post(`/institution/institutions/${institutionId}/courts`, payload),
  update: (institutionId, courtId, payload) =>
    apiClient.put(`/institution/institutions/${institutionId}/courts/${courtId}`, payload),
  remove: (institutionId, courtId) =>
    apiClient.delete(`/institution/institutions/${institutionId}/courts/${courtId}`),
};

const realReservationsApi = {
  list: (params = {}) => withReservationTransform(apiClient.get('/reservation/reservations', { params })),
  listAll: (params = {}) => withReservationTransform(apiClient.get('/reservation/reservations/all', { params })),
  listUnfiltered: (params = {}) =>
    withReservationTransform(apiClient.get('/reservation/reservations/admin/all', { params })),
  get: (id) => withReservationTransform(apiClient.get(`/reservation/reservations/${id}`)),
  getById: (id) => withReservationTransform(apiClient.get(`/reservation/reservations/admin/${id}`)),
  getAll: (params = {}) => withReservationTransform(apiClient.get('/reservation/reservations/all', { params })),
  getByDate: (date) =>
    withReservationTransform(
      apiClient.get('/reservation/reservations', {
        params: { date },
      })
    ),
  getByCourt: (courtId) =>
    withReservationTransform(
      apiClient.get('/reservation/reservations', {
        params: { courtId },
      })
    ),
  getStats: () => apiClient.get('/reservation/stats/overview').catch(() => ({ data: [] })),
  create: (payload) => withReservationTransform(apiClient.post('/reservation/reservations', payload)),
  update: (id, payload) => withReservationTransform(apiClient.put(`/reservation/reservations/${id}`, payload)),
  remove: (id) => withReservationTransform(apiClient.delete(`/reservation/reservations/${id}`)),
  changeStatus: (id, status, reason) =>
    withReservationTransform(
      apiClient.patch(`/reservation/reservations/${id}/status`, null, { params: { status, reason } })
    ),
  cancel: (id, payload) => withReservationTransform(apiClient.post(`/reservation/reservations/${id}/cancel`, payload)),
  availability: (params) => apiClient.get('/reservation/availability', { params }),
};

const realStatsApi = {
  overview: () => apiClient.get('/reservation/stats/overview').catch(() => ({ data: [] })),
};

const realHistoryApi = {
  list: (params = {}) =>
    apiClient.get('/reservation/history', { params }).catch(() => ({ data: [] })),
  getByReservation: (reservationId) =>
    apiClient.get(`/reservation/history/reservation/${reservationId}`).catch(() => ({ data: [] })),
};

const realSchedulesApi = {
  list: () =>
    apiClient.get('/institution/schedules').catch(() => ({ data: { groups: [], feriados: [] } })),
  update: (payload) =>
    apiClient.put('/institution/schedules', payload).catch(() => ({ data: payload })),
};

const realPricesApi = {
  list: () => apiClient.get('/institution/pricing').catch(() => ({ data: [] })),
  update: (payload) =>
    apiClient.put('/institution/pricing', payload).catch(() => ({ data: payload })),
};

const realUsersApi = {
  list: (params = {}) => apiClient.get('/users', { params }),
  get: (id) => apiClient.get(`/users/${id}`),
  create: (payload) => apiClient.post('/users', payload),
  update: (id, payload) => apiClient.put(`/users/${id}`, payload),
  remove: (id) => apiClient.delete(`/users/${id}`),
  searchMembers: (searchTerm = '') =>
    apiClient.get('/users/search/members', { params: { q: searchTerm } }),
};

const realTournamentsApi = {
  list: (params = {}) => apiClient.get('/tournaments', { params }),
  get: (id) => apiClient.get(`/tournaments/${id}`),
  create: (payload) => apiClient.post('/tournaments', payload),
  update: (id, payload) => apiClient.put(`/tournaments/${id}`, payload),
  remove: (id) => apiClient.delete(`/tournaments/${id}`),
};

// Export real API implementations only
export const authApi = realAuthApi;
export const institutionsApi = realInstitutionsApi;
export const courtsApi = realCourtsApi;
export const reservationsApi = realReservationsApi;
export const statsApi = realStatsApi;
export const historyApi = realHistoryApi;
export const schedulesApi = realSchedulesApi;
export const pricesApi = realPricesApi;
export const usersApi = realUsersApi;
export const tournamentsApi = realTournamentsApi;
