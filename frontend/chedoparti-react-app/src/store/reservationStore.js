import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';

// 📋 Estados posibles de una reserva
export const RESERVATION_STATES = {
  PENDING: 'pending',
  AWAITING_PAYMENT: 'awaiting_payment',
  PAID: 'paid',
  CONFIRMED: 'confirmed',
  IN_PROGRESS: 'in_progress',
  FINISHED: 'finished',
  CANCELLED: 'cancelled',
  NO_SHOW: 'no_show',
};

// 🛠️ Helper para calcular fin de reserva
function calculateEndTime(startTime, duration) {
  if (!duration) return startTime;

  const [hours, minutes] = startTime.split(':').map(Number);
  const [durationHours, durationMinutes] = duration.split(':').map(Number);

  const totalMinutes = hours * 60 + minutes + (durationHours * 60 + durationMinutes);
  const endHours = Math.floor(totalMinutes / 60);
  const endMins = totalMinutes % 60;

  return `${String(endHours).padStart(2, '0')}:${String(endMins).padStart(2, '0')}`;
}

export const useReservationStore = create()(
  devtools(
    subscribeWithSelector((set, get) => ({
      // 📊 Estado inicial
      reservations: [],
      loading: false,
      error: null,
      lastUpdated: null,

      // Cache por fecha (para no recargar innecesariamente)
      loadedDates: new Set(),

      // 🔍 Filtros
      filters: {
        date: null,
        court: null,
        status: null,
        user: null,
      },

      selectedReservationId: null,

      // 🚀 Actions
      actions: {
        /**
         * SET RESERVATIONS — MEJORADO
         * Merge inteligente: agrega/actualiza reservas sin borrar las anteriores
         */
        setReservations: (incomingReservations, dateForCache = null) =>
          set(
            (state) => {
              // Mapa existente
              const map = new Map(state.reservations.map((r) => [r.id, r]));

              // Merge
              incomingReservations.forEach((r) => {
                map.set(r.id, {
                  ...map.get(r.id),
                  ...r,
                });
              });

              // Marcar fecha como cargada (cache)
              if (dateForCache) {
                state.loadedDates.add(dateForCache);
              }

              return {
                reservations: Array.from(map.values()),
                lastUpdated: new Date().toISOString(),
                error: null,
              };
            },
            false,
            'setReservations'
          ),

        /**
         * Indica si ya tenemos reservas cargadas para esa fecha
         */
        hasReservationsForDate: (date) => {
          return get().loadedDates.has(date);
        },

        /**
         * Opción para limpiar reservas por completo
         */
        clearAllReservations: () =>
          set(
            {
              reservations: [],
              loadedDates: new Set(),
              lastUpdated: new Date().toISOString(),
            },
            false,
            'clearAllReservations'
          ),

        // Actualizar 1 reserva
        updateReservation: (reservationId, updates) =>
          set(
            (state) => {
              const map = new Map(state.reservations.map((r) => [r.id, r]));

              // Validación robusta de existencia
              let targetId = reservationId;
              if (!map.has(targetId)) {
                // Intentar con ID numérico si viene string
                const numericId = parseInt(reservationId);
                if (!isNaN(numericId) && map.has(numericId)) {
                  targetId = numericId;
                } else {
                  // Si no existe, no hacemos nada (evita crear reservas corruptas)
                  return {};
                }
              }

              map.set(targetId, {
                ...map.get(targetId),
                ...updates,
                updatedAt: new Date().toISOString(),
              });

              return {
                reservations: Array.from(map.values()),
                lastUpdated: new Date().toISOString(),
              };
            },
            false,
            'updateReservation'
          ),

        // Crear reserva
        addReservation: (newReservation) =>
          set(
            (state) => ({
              reservations: [
                ...state.reservations,
                {
                  ...newReservation,
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                },
              ],
              lastUpdated: new Date().toISOString(),
            }),
            false,
            'addReservation'
          ),

        // Eliminar reserva
        removeReservation: (reservationId) =>
          set(
            (state) => ({
              reservations: state.reservations.filter((r) => r.id !== reservationId),
              selectedReservationId:
                state.selectedReservationId === reservationId ? null : state.selectedReservationId,
            }),
            false,
            'removeReservation'
          ),

        // Cambiar estado
        changeReservationStatus: (reservationId, newStatus, metadata = {}) => {
          const reservation = get().reservations.find((r) => r.id === reservationId);
          if (!reservation) return;

          get().actions.updateReservation(reservationId, {
            status: newStatus,
            statusChangedAt: new Date().toISOString(),
            statusMetadata: { ...reservation.statusMetadata, ...metadata },
          });
        },

        // Batch
        batchUpdateReservations: (updates) =>
          set(
            (state) => {
              const map = new Map(state.reservations.map((r) => [r.id, r]));

              updates.forEach(({ id, ...data }) => {
                if (map.has(id)) {
                  map.set(id, {
                    ...map.get(id),
                    ...data,
                    updatedAt: new Date().toISOString(),
                  });
                }
              });

              return {
                reservations: Array.from(map.values()),
                lastUpdated: new Date().toISOString(),
              };
            },
            false,
            'batchUpdateReservations'
          ),

        // Loading
        setLoading: (loading) => set({ loading }, false, 'setLoading'),
        setError: (error) => set({ error }, false, 'setError'),

        // Filtros
        setFilters: (filters) =>
          set((state) => ({ filters: { ...state.filters, ...filters } }), false, 'setFilters'),

        clearFilters: () =>
          set(
            {
              filters: { date: null, court: null, status: null, user: null },
            },
            false,
            'clearFilters'
          ),

        // Selección
        selectReservation: (reservationId) =>
          set({ selectedReservationId: reservationId }, false, 'selectReservation'),

        clearSelection: () => set({ selectedReservationId: null }, false, 'clearSelection'),
      },

      // 🎯 Selectors
      selectors: {
        getReservationById: (id) => get().reservations.find((r) => r.id === id) || null,

        getFilteredReservations: () => {
          const { reservations, filters } = get();

          return reservations.filter((r) => {
            if (filters.date && r.date !== filters.date) return false;
            if (filters.court && r.courtId !== filters.court) return false;
            if (filters.status && r.status !== filters.status) return false;
            if (filters.user && r.userId !== filters.user) return false;
            return true;
          });
        },

        getReservationsByDate: (date) => get().reservations.filter((r) => r.date === date),

        getReservationsByCourt: (courtId) =>
          get().reservations.filter((r) => r.courtId === courtId),

        getReservationsByStatus: (status) => get().reservations.filter((r) => r.status === status),

        getStats: () => {
          const reservations = get().reservations;
          return {
            total: reservations.length,
            pending: reservations.filter((r) => r.status === RESERVATION_STATES.PENDING).length,
            confirmed: reservations.filter((r) => r.status === RESERVATION_STATES.CONFIRMED).length,
            cancelled: reservations.filter((r) => r.status === RESERVATION_STATES.CANCELLED).length,
            today: reservations.filter((r) => r.date === new Date().toISOString().split('T')[0])
              .length,
          };
        },

        getConflictingReservations: (courtId, date, startTime, endTime) => {
          return get().reservations.filter((r) => {
            if (r.courtId !== courtId || r.date !== date) return false;
            if (r.status === RESERVATION_STATES.CANCELLED) return false;

            const reservationStart = r.time;
            const reservationEnd = r.endTime || calculateEndTime(r.time, r.duration);

            return (
              (startTime >= reservationStart && startTime < reservationEnd) ||
              (endTime > reservationStart && endTime <= reservationEnd) ||
              (startTime <= reservationStart && endTime >= reservationEnd)
            );
          });
        },
      },
    })),
    {
      name: 'reservation-store',
      partialize: (state) => ({
        reservations: state.reservations,
        filters: state.filters,
      }),
    }
  )
);

// 🎯 Hooks convenientes
export const useReservations = () => useReservationStore((state) => state.reservations);
export const useReservationActions = () => useReservationStore((state) => state.actions);
export const useReservationSelectors = () => useReservationStore((state) => state.selectors);
export const useReservationFilters = () => useReservationStore((state) => state.filters);
export const useReservationLoading = () => useReservationStore((state) => state.loading);
export const useReservationError = () => useReservationStore((state) => state.error);

export const useReservation = (id) =>
  useReservationStore((state) => state.selectors.getReservationById(id));

export default useReservationStore;
