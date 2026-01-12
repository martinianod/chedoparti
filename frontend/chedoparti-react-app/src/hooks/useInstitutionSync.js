import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { courtsApi, schedulesApi, pricesApi, institutionsApi } from '../services/api';
import { useAppNotifications } from './useAppNotifications';

// Keys for query caching
export const institutionKeys = {
  all: ['institution'],
  courts: (institutionId) => ['institution', 'courts', institutionId],
  schedules: ['institution', 'schedules'],
  prices: ['institution', 'prices'],
};

// 🏟️ Hook for managing courts
export const useCourts = (institutionId = 1) => {
  const queryClient = useQueryClient();
  const { court: notifications } = useAppNotifications();

  // Fetch courts
  const {
    data: courts = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: institutionKeys.courts(institutionId),
    queryFn: async () => {
      const res = await courtsApi.list(institutionId, {
        page: 0,
        size: 100,
        sort: 'name',
      });
      const payload = res.data;
      return Array.isArray(payload?.content)
        ? payload.content
        : Array.isArray(payload)
        ? payload
        : [];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Create court
  const createMutation = useMutation({
    mutationFn: (courtData) => courtsApi.create(institutionId, courtData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: institutionKeys.courts(institutionId) });
      notifications.success();
    },
    onError: () => {
      notifications.error('Error al crear la cancha');
    },
  });

  // Update court
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => courtsApi.update(institutionId, id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: institutionKeys.courts(institutionId) });
      notifications.updateSuccess();
    },
    onError: () => {
      notifications.error('Error al actualizar la cancha');
    },
  });

  // Delete court
  const deleteMutation = useMutation({
    mutationFn: (id) => courtsApi.remove(institutionId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: institutionKeys.courts(institutionId) });
      notifications.success('Cancha eliminada correctamente');
    },
    onError: () => {
      notifications.error('Error al eliminar la cancha');
    },
  });

  return {
    courts,
    isLoading,
    error,
    createCourt: createMutation.mutateAsync,
    updateCourt: updateMutation.mutateAsync,
    deleteCourt: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};

// 📅 Hook for managing schedules
export const useSchedules = () => {
  const queryClient = useQueryClient();
  const { schedule: notifications } = useAppNotifications();

  const {
    data,
    isLoading,
    error,
  } = useQuery({
    queryKey: institutionKeys.schedules,
    queryFn: async () => {
      const res = await schedulesApi.list();
      return res.data;
    },
    staleTime: 1000 * 60 * 5,
  });

  const updateMutation = useMutation({
    mutationFn: (scheduleData) => schedulesApi.update(scheduleData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: institutionKeys.schedules });
      notifications.saved();
    },
    onError: (err) => {
      notifications.error(err.message || 'Error al guardar horarios');
    },
  });

  return {
    groups: data?.groups || [],
    feriados: data?.feriados || [],
    intervalMinutes: data?.intervalMinutes || 60, // Default fallback
    isLoading,
    error,
    updateSchedule: updateMutation.mutateAsync,
    isSaving: updateMutation.isPending,
  };
};

// 💲 Hook for managing pricing
export const usePricing = () => {
  const queryClient = useQueryClient();
  // Assuming we might want notifications here too, though previous code might not have used them extensively
  
  const {
    data: prices = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: institutionKeys.prices,
    queryFn: async () => {
      const res = await pricesApi.list();
      return res.data || [];
    },
    staleTime: 1000 * 60 * 5,
  });

  const updateMutation = useMutation({
    mutationFn: (priceData) => pricesApi.update(priceData), // Adjust based on actual API signature
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: institutionKeys.prices });
    },
  });

  return {
    prices,
    isLoading,
    error,
    updatePrices: updateMutation.mutateAsync,
    isSaving: updateMutation.isPending,
  };
};
