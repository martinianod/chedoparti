import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';
import {
  useReservationStore,
  useReservationActions,
  useReservationSelectors,
  RESERVATION_STATES,
} from '../store/reservationStore';
import { reservationKeys, optimisticUpdates, invalidateReservations } from '../store/queryClient';
import { reservationsApi } from '../services/api';

// 🎯 Hook principal: Sincronización de todas las reservas
export const useReservationsSync = (filters = {}) => {
  const actions = useReservationActions();
  const selectors = useReservationSelectors();


  // Query principal que mantiene sincronizadas las reservas
  const {

    isLoading,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: reservationKeys.list(filters),
    queryFn: async () => {
      const response = await reservationsApi.getAll(filters);
      return response.data || response; // Manejar diferentes formatos de API
    },
    onSuccess: (data) => {
      // Sincronizar automáticamente con Zustand store
      actions.setReservations(data);
    },
    onError: (error) => {
      actions.setError(error.message);
    },
    // ⚡ Configuración optimizada (polling deshabilitado temporalmente)
    staleTime: 1000 * 60 * 5, // 5 minutos para reservas
    refetchInterval: false, // Polling deshabilitado para evitar bucles infinitos
    refetchIntervalInBackground: false, // Solo cuando la app está activa
  });

  // Obtener reservas del store (siempre actualizadas)
  const reservations = selectors.getFilteredReservations();

  // Estadísticas derivadas
  const stats = selectors.getStats();

  return {
    reservations,
    stats,
    isLoading,
    isFetching,
    error,
    refetch,

    // Utilidades
    isEmpty: reservations.length === 0,
    hasError: !!error,
    isStale:
      Date.now() - (actions.lastUpdated ? new Date(actions.lastUpdated).getTime() : 0) > 300000, // 5min
  };
};

// 🎯 Hook para una reserva específica por ID
export const useReservationSync = (reservationId) => {
  const selectors = useReservationSelectors();
  const actions = useReservationActions();

  // Query para reserva específica
  const {
    data: serverReservation,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: reservationKeys.detail(reservationId),
    queryFn: async () => {
      if (!reservationId) return null;
      const response = await reservationsApi.getById(reservationId);
      return response.data || response;
    },
    enabled: !!reservationId,
    onSuccess: (data) => {
      if (data?.id) {
        actions.updateReservation(data.id, data);
      }
    },
    staleTime: 1000 * 60 * 1, // 1 minuto para reserva individual
  });

  // Obtener reserva del store local (más rápido)
  const reservation = selectors.getReservationById(reservationId);

  return {
    reservation: reservation || serverReservation,
    isLoading,
    error,
    refetch,
    exists: !!reservation,
    isServerSynced: !!serverReservation,
  };
};

// 🚀 Hook para crear reserva con optimistic updates
export const useCreateReservation = () => {
  const actions = useReservationActions();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['createReservation'],
    mutationFn: async (newReservation) => {
      // Validar conflictos antes de enviar
      const conflicts = useReservationStore
        .getState()
        .selectors.getConflictingReservations(
          newReservation.courtId,
          newReservation.date,
          newReservation.time,
          newReservation.endTime
        );

      if (conflicts.length > 0) {
        throw new Error(`Conflicto de horario detectado con reserva ${conflicts[0].id}`);
      }

      const response = await reservationsApi.create(newReservation);
      return response.data || response;
    },

    // ⚡ Optimistic update
    onMutate: async (newReservation) => {
      // Cancelar queries en progreso
      await queryClient.cancelQueries({ queryKey: reservationKeys.all });

      // Snapshot para rollback
      const previousReservations = [...useReservationStore.getState().reservations];

      // Update optimista inmediato
      optimisticUpdates.createReservation(newReservation);

      return { previousReservations };
    },

    onError: (error, variables, context) => {
      // Rollback en caso de error
      if (context?.previousReservations) {
        actions.setReservations(context.previousReservations);
      }
    },

    onSuccess: (data) => {
      // Invalidar queries relacionadas para re-sync
      invalidateReservations.lists();
      invalidateReservations.byDate(data.date);
      invalidateReservations.byCourt(data.courtId);
    },
  });
};

// 🔄 Hook para actualizar reserva con optimistic updates
export const useUpdateReservation = () => {
  const actions = useReservationActions();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['updateReservation'],
    mutationFn: async ({ id, updates }) => {
      const response = await reservationsApi.update(id, updates);
      return response.data || response;
    },

    onMutate: async ({ id, updates }) => {
      await queryClient.cancelQueries({ queryKey: reservationKeys.detail(id) });

      const previousReservation = useReservationStore.getState().selectors.getReservationById(id);

      // Update optimista
      actions.updateReservation(id, updates);

      return { previousReservation };
    },

    onError: (error, { id }, context) => {
      if (context?.previousReservation) {
        actions.updateReservation(id, context.previousReservation);
      }
    },

    onSuccess: (data) => {
      invalidateReservations.byId(data.id);
      invalidateReservations.byDate(data.date);
      invalidateReservations.byCourt(data.courtId);
      
      // ✅ Invalidar listas para actualizar List.jsx
      invalidateReservations.lists();
      
      // ✅ Invalidar TODO para forzar refetch global
      invalidateReservations.all();
    },
  });
};

// 🚫 Hook para cancelar reserva
export const useCancelReservation = () => {
  const actions = useReservationActions();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['cancelReservation'],
    mutationFn: async ({ id, reason = 'Cancelled by user' }) => {
      const response = await reservationsApi.cancel(id, { reason });
      return response.data || response;
    },

    onMutate: async ({ id }) => {
      // 🚫 Cancelar queries salientes
      await queryClient.cancelQueries({ queryKey: reservationKeys.all });

      // 📸 Snapshot del estado anterior
      const previousReservations = queryClient.getQueryData(reservationKeys.all);

      // ⚡ Optimistic Update en el Store
      // Aseguramos que el ID sea numérico para coincidir con el store
      actions.changeReservationStatus(parseInt(id), RESERVATION_STATES.CANCELLED, {
        cancelledAt: new Date().toISOString(),
        isOptimistic: true,
      });

      return { previousReservations };
    },

    onError: (error, _, context) => {
      if (context?.previousReservations) {
        actions.setReservations(context.previousReservations);
      }
    },

    onSuccess: (data) => {
      invalidateReservations.byId(data.id);
      invalidateReservations.stats();
      invalidateReservations.lists();
      
      // ✅ Invalidar TODO para forzar refetch global
      invalidateReservations.all();
      
      if (data.date) {
        invalidateReservations.byDate(data.date);
      } else if (data.startAt) {
         // Intentar extraer fecha de startAt si date no existe
         const dateStr = data.startAt.slice(0, 10);
         invalidateReservations.byDate(dateStr);
      }
    },
  });
};

// 📅 Hook para reservas por fecha (para calendario)
export const useReservationsByDate = (date) => {
  const selectors = useReservationSelectors();
  const actions = useReservationActions();

  const {
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: reservationKeys.byDate(date),
    queryFn: async () => {
      if (!date) return [];
      const response = await reservationsApi.getByDate(date);
      return response.data || response;
    },
    enabled: !!date,
    staleTime: 1000 * 60 * 1, // 1 minuto para vista de calendario
    onSuccess: (data) => {
      actions.setReservations(data);
    },
    onError: (error) => {
      actions.setError(error.message);
    },
  });

  // El store siempre contiene solo las reservas de la fecha actual
  const localReservations = selectors.getFilteredReservations();

  return {
    reservations: localReservations,
    isLoading,
    error,
    count: localReservations.length,
    refetch,
  };
};

// 📅 Hook para reservas por fecha (SIN side-effects en store)
// Útil para cuando necesitamos datos de una fecha específica sin alterar el estado global
export const useRawReservationsByDate = (date) => {
  const {
    data: reservations,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: reservationKeys.byDate(date),
    queryFn: async () => {
      if (!date) return [];
      const response = await reservationsApi.getByDate(date);
      return response.data || response;
    },
    enabled: !!date,
    staleTime: 1000 * 60 * 1,
  });

  return {
    reservations: reservations || [],
    isLoading,
    error,
    refetch,
  };
};

// 🏟️ Hook para reservas por cancha
export const useReservationsByCourt = (courtId) => {
  const selectors = useReservationSelectors();

  const {

    isLoading,
    error,
  } = useQuery({
    queryKey: reservationKeys.byCourt(courtId),
    queryFn: async () => {
      if (!courtId) return [];
      const response = await reservationsApi.getByCourt(courtId);
      return response.data || response;
    },
    enabled: !!courtId,
  });

  const localReservations = selectors.getReservationsByCourt(courtId);

  return {
    reservations: localReservations,
    isLoading,
    error,
    count: localReservations.length,
  };
};

// ⚠️ Hook para detectar conflictos en tiempo real
export const useConflictDetection = (courtId, date, startTime, endTime) => {
  const selectors = useReservationSelectors();

  const conflicts = useMemo(() => {
    if (!courtId || !date || !startTime || !endTime) return [];

    return selectors.getConflictingReservations(courtId, date, startTime, endTime);
  }, [courtId, date, startTime, endTime, selectors]);

  return {
    hasConflicts: conflicts.length > 0,
    conflicts,
    conflictCount: conflicts.length,
  };
};

// 📊 Hook para estadísticas en tiempo real
export const useReservationStats = () => {
  const selectors = useReservationSelectors();

  const { data: serverStats, isLoading } = useQuery({
    queryKey: reservationKeys.stats(),
    queryFn: async () => {
      const response = await reservationsApi.getStats();
      return response.data || response;
    },
    staleTime: 1000 * 60 * 5, // 5 minutos para stats
  });

  // Stats locales (más rápidas)
  const localStats = selectors.getStats();

  return {
    stats: localStats,
    serverStats,
    isLoading,
    // Métricas derivadas útiles
    occupancyRate:
      localStats.total > 0 ? ((localStats.confirmed / localStats.total) * 100).toFixed(1) : 0,
    cancellationRate:
      localStats.total > 0 ? ((localStats.cancelled / localStats.total) * 100).toFixed(1) : 0,
  };
};

// 🔔 Hook para sincronización manual (pull-to-refresh)
export const useManualSync = () => {
  const queryClient = useQueryClient();
  const actions = useReservationActions();

  const syncAll = useCallback(async () => {
    actions.setLoading(true);

    try {
      // Invalidar todas las queries para forzar re-fetch
      await invalidateReservations.all();

      // Esperar que todas las queries se resuelvan
      await queryClient.refetchQueries({ queryKey: reservationKeys.all });

      actions.setError(null);
    } catch (error) {
      actions.setError(`Sync failed: ${error.message}`);
    } finally {
      actions.setLoading(false);
    }
  }, [queryClient, actions]);

  return {
    syncAll,
    isLoading: useReservationStore((state) => state.loading),
  };
};

export default {
  useReservationsSync,
  useReservationSync,
  useCreateReservation,
  useUpdateReservation,
  useCancelReservation,
  useReservationsByDate,
  useRawReservationsByDate,
  useReservationsByCourt,
  useConflictDetection,
  useReservationStats,
  useManualSync,
};
