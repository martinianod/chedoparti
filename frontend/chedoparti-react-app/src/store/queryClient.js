import { QueryClient, QueryCache, MutationCache } from '@tanstack/react-query';
import { useReservationStore } from './reservationStore';

// 🚀 Configuración avanzada del QueryClient para reservas
export const createQueryClient = () => {
  return new QueryClient({
    queryCache: new QueryCache({
      // Callback global cuando queries se actualizan correctamente
      onSuccess: (data, query) => {
        const { actions } = useReservationStore.getState();

        // Si es una query de reservas, sincronizar con Zustand store
        if (query.queryKey[0] === 'reservations') {
          if (Array.isArray(data)) {
            // Lista completa de reservas
            actions.setReservations(data);
          } else if (data.id) {
            // Reserva individual
            actions.updateReservation(data.id, data);
          }
        }
      },

      // Callback global para errores
      onError: (error, query) => {
        const { actions } = useReservationStore.getState();
        console.error('❌ Query error:', error, 'for query:', query.queryKey);

        actions.setError(`Error loading ${query.queryKey.join('.')}: ${error.message}`);
      },
    }),

    mutationCache: new MutationCache({
      // Callback cuando mutations (create/update/delete) son exitosas
      onSuccess: (data, variables, context, mutation) => {
        const { actions } = useReservationStore.getState();

        // Determinar tipo de mutación por el mutation key
        const mutationType = mutation.options.mutationKey?.[0];

        switch (mutationType) {
          case 'createReservation':
            if (data.id) {
              actions.addReservation(data);
            }
            break;

          case 'updateReservation':
            if (data.id) {
              actions.updateReservation(data.id, data);
            }
            break;

          case 'cancelReservation':
            if (variables.id) {
              actions.changeReservationStatus(variables.id, 'cancelled', {
                cancelledAt: new Date().toISOString(),
                reason: variables.reason,
              });
            }
            break;

          case 'deleteReservation':
            if (variables.id) {
              actions.removeReservation(variables.id);
            }
            break;
        }
      },

      // Callback para errores en mutations
      onError: (error, variables, context, mutation) => {
        const { actions } = useReservationStore.getState();
        console.error('❌ Mutation error:', error, 'for mutation:', mutation.options.mutationKey);

        // Revertir optimistic update si falló
        if (context?.previousReservations) {
          actions.setReservations(context.previousReservations);
        }

        actions.setError(`Error ${mutation.options.mutationKey?.join('.')}: ${error.message}`);
      },
    }),

    defaultOptions: {
      queries: {
        // ⚡ Configuración para performance y UX
        staleTime: 1000 * 60 * 5, // 5 minutos - datos considerados frescos
        gcTime: 1000 * 60 * 30, // 30 minutos - mantener en cache
        retry: (failureCount, error) => {
          // No reintentar errores de autenticación
          if (error?.status === 401 || error?.status === 403) {
            return false;
          }
          // Reintentar hasta 3 veces para otros errores
          return failureCount < 3;
        },
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),

        // 🔄 Revalidación inteligente
        refetchOnWindowFocus: true, // Refrescar cuando usuario vuelve a la tab
        refetchOnReconnect: true, // Refrescar cuando se reconecta internet
        refetchOnMount: true, // Refrescar al montar componente si data está stale
      },

      mutations: {
        // ⚡ Configuración para mutations (create, update, delete)
        retry: 1, // Solo 1 reintento para evitar duplicados

        // Callback global para optimistic updates
        onMutate: async (variables) => {
          const { actions, reservations } = useReservationStore.getState();

          // Cancelar queries en progreso para evitar conflictos
          await queryClient.cancelQueries({ queryKey: ['reservations'] });

          // Snapshot del estado actual para rollback
          const previousReservations = [...reservations];

          return { previousReservations };
        },
      },
    },
  });
};

// 🌐 Query keys centralizadas (para invalidación y cache management)
export const reservationKeys = {
  all: ['reservations'],
  lists: () => [...reservationKeys.all, 'list'],
  list: (filters) => [...reservationKeys.lists(), filters],
  details: () => [...reservationKeys.all, 'detail'],
  detail: (id) => [...reservationKeys.details(), id],
  byDate: (date) => [...reservationKeys.all, 'by-date', date],
  byCourt: (courtId) => [...reservationKeys.all, 'by-court', courtId],
  byUser: (userId) => [...reservationKeys.all, 'by-user', userId],
  stats: () => [...reservationKeys.all, 'stats'],
  conflicts: (courtId, date, time) => [...reservationKeys.all, 'conflicts', courtId, date, time],
};

// 🎯 Instancia global del QueryClient
export const queryClient = createQueryClient();

// 🔄 Utilidades para invalidación de cache
export const invalidateReservations = {
  all: () => queryClient.invalidateQueries({ queryKey: reservationKeys.all }),
  byId: (id) => queryClient.invalidateQueries({ queryKey: reservationKeys.detail(id) }),
  byDate: (date) => queryClient.invalidateQueries({ queryKey: reservationKeys.byDate(date) }),
  byCourt: (courtId) =>
    queryClient.invalidateQueries({ queryKey: reservationKeys.byCourt(courtId) }),
  lists: () => queryClient.invalidateQueries({ queryKey: reservationKeys.lists() }),
  stats: () => queryClient.invalidateQueries({ queryKey: reservationKeys.stats() }),
};

// 📡 Utilidades para optimistic updates
export const optimisticUpdates = {
  // Actualización optimista para crear reserva
  createReservation: (newReservation) => {
    const { actions } = useReservationStore.getState();

    // Update inmediato en store
    actions.addReservation({
      ...newReservation,
      id: `temp-${Date.now()}`, // ID temporal hasta que server responda
      status: 'pending',
      isOptimistic: true,
    });

    // Update en React Query cache también
    queryClient.setQueryData(reservationKeys.lists(), (oldData) => {
      return oldData ? [...oldData, newReservation] : [newReservation];
    });
  },

  // Actualización optimista para cambiar status
  updateReservationStatus: (id, newStatus) => {
    const { actions } = useReservationStore.getState();

    actions.changeReservationStatus(id, newStatus, {
      isOptimistic: true,
      optimisticTimestamp: Date.now(),
    });

    // Update también en React Query
    queryClient.setQueryData(reservationKeys.detail(id), (oldData) => {
      return oldData ? { ...oldData, status: newStatus } : oldData;
    });
  },

  // Rollback de cambios optimistas
  rollback: (previousState) => {
    const { actions } = useReservationStore.getState();
    actions.setReservations(previousState);

    // Invalidar todas las queries para re-fetch desde server
    invalidateReservations.all();
  },
};

export default queryClient;
