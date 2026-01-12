import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { coachSchedulesApi } from '../services/coachSchedules.api';
import { useCoachStore } from '../store/coachStore';
import { useAppNotifications } from './useAppNotifications';

/**
 * Hook for managing coach schedules
 * Provides CRUD operations with React Query integration
 */
export function useCoachSchedules(coachId, weekStart, options = {}) {
  const queryClient = useQueryClient();
  const { setSchedules, setSchedulesLoading, setSchedulesError } = useCoachStore();
  const notifications = useAppNotifications();

  // Fetch schedules
  const {
    data: schedules = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['coach-schedules', coachId, weekStart, options],
    queryFn: async () => {
      const response = await coachSchedulesApi.list(coachId, weekStart, options);
      const data = response?.data || [];
      setSchedules(data);
      return data;
    },
    enabled: !!coachId && !!weekStart,
    staleTime: 2 * 60 * 1000, // 2 minutes (schedules change less frequently)
    onError: (err) => {
      setSchedulesError(err.message);
      notifications.error('Error al cargar horarios');
    },
  });

  // Create schedule
  const createMutation = useMutation({
    mutationFn: (data) => coachSchedulesApi.create(data),
    onMutate: async (newSchedule) => {
      await queryClient.cancelQueries(['coach-schedules', coachId]);
      const previousSchedules = queryClient.getQueryData(['coach-schedules', coachId]);

      queryClient.setQueryData(['coach-schedules', coachId], (old = []) => [
        ...old,
        { ...newSchedule, id: Date.now(), isOptimistic: true },
      ]);

      return { previousSchedules };
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['coach-schedules', coachId]);
      queryClient.invalidateQueries(['reservations']); // Invalidate reservations too
      notifications.success('Clase programada exitosamente');
    },
    onError: (err, newSchedule, context) => {
      queryClient.setQueryData(['coach-schedules', coachId], context.previousSchedules);
      notifications.error(err.response?.data?.message || 'Error al programar clase');
    },
  });

  // Update schedule
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => coachSchedulesApi.update(id, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries(['coach-schedules', coachId]);
      const previousSchedules = queryClient.getQueryData(['coach-schedules', coachId]);

      queryClient.setQueryData(['coach-schedules', coachId], (old = []) =>
        old.map((schedule) => (schedule.id === id ? { ...schedule, ...data } : schedule))
      );

      return { previousSchedules };
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['coach-schedules', coachId]);
      queryClient.invalidateQueries(['reservations']);
      notifications.success('Clase actualizada exitosamente');
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(['coach-schedules', coachId], context.previousSchedules);
      notifications.error(err.response?.data?.message || 'Error al actualizar clase');
    },
  });

  // Delete schedule
  const deleteMutation = useMutation({
    mutationFn: (id) => coachSchedulesApi.delete(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries(['coach-schedules', coachId]);
      const previousSchedules = queryClient.getQueryData(['coach-schedules', coachId]);

      queryClient.setQueryData(['coach-schedules', coachId], (old = []) =>
        old.filter((schedule) => schedule.id !== id)
      );

      return { previousSchedules };
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['coach-schedules', coachId]);
      queryClient.invalidateQueries(['reservations']);
      notifications.success('Clase cancelada exitosamente');
    },
    onError: (err, id, context) => {
      queryClient.setQueryData(['coach-schedules', coachId], context.previousSchedules);
      notifications.error(err.response?.data?.message || 'Error al cancelar clase');
    },
  });

  // Check availability
  const checkAvailabilityMutation = useMutation({
    mutationFn: (params) => coachSchedulesApi.checkAvailability(params),
  });

  // Create recurring schedules
  const createRecurringMutation = useMutation({
    mutationFn: (data) => coachSchedulesApi.createRecurring(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['coach-schedules', coachId]);
      queryClient.invalidateQueries(['reservations']);
      notifications.success('Clases recurrentes creadas exitosamente');
    },
    onError: (err) => {
      notifications.error(err.response?.data?.message || 'Error al crear clases recurrentes');
    },
  });

  return {
    schedules,
    isLoading,
    error,
    refetch,
    createSchedule: createMutation.mutate,
    createScheduleAsync: createMutation.mutateAsync,
    updateSchedule: updateMutation.mutate,
    updateScheduleAsync: updateMutation.mutateAsync,
    deleteSchedule: deleteMutation.mutate,
    deleteScheduleAsync: deleteMutation.mutateAsync,
    checkAvailability: checkAvailabilityMutation.mutate,
    checkAvailabilityAsync: checkAvailabilityMutation.mutateAsync,
    createRecurring: createRecurringMutation.mutate,
    createRecurringAsync: createRecurringMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isCheckingAvailability: checkAvailabilityMutation.isPending,
  };
}

/**
 * Hook for getting a single schedule
 */
export function useCoachSchedule(id) {
  return useQuery({
    queryKey: ['coach-schedule', id],
    queryFn: async () => {
      const response = await coachSchedulesApi.get(id);
      return response?.data;
    },
    enabled: !!id,
  });
}

/**
 * Hook for getting schedules by group
 */
export function useSchedulesByGroup(groupId) {
  return useQuery({
    queryKey: ['schedules-by-group', groupId],
    queryFn: async () => {
      const response = await coachSchedulesApi.getByGroup(groupId);
      return response?.data || [];
    },
    enabled: !!groupId,
  });
}

export default useCoachSchedules;
