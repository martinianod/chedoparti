import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { attendanceApi } from '../services/attendance.api';
import { useAppNotifications } from './useAppNotifications';

/**
 * Hook for managing attendance
 */
export function useAttendance(groupId, weekStart) {
  const queryClient = useQueryClient();
  const notifications = useAppNotifications();

  // Fetch attendance
  const {
    data: attendance = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['attendance', groupId, weekStart],
    queryFn: async () => {
      const response = await attendanceApi.list(groupId, weekStart);
      return response?.data || [];
    },
    enabled: !!groupId && !!weekStart,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Mark attendance (single)
  const markMutation = useMutation({
    mutationFn: (data) => attendanceApi.mark(data),
    onMutate: async (newData) => {
      await queryClient.cancelQueries(['attendance', groupId, weekStart]);
      const previousAttendance = queryClient.getQueryData(['attendance', groupId, weekStart]);

      queryClient.setQueryData(['attendance', groupId, weekStart], (old = []) => {
        // Find if record exists
        const index = old.findIndex(
          (a) => a.scheduleId === newData.scheduleId && a.studentId === newData.studentId
        );

        if (index >= 0) {
          // Update existing
          const newAttendance = [...old];
          newAttendance[index] = { ...newAttendance[index], ...newData };
          return newAttendance;
        } else {
          // Add new
          return [...old, newData];
        }
      });

      return { previousAttendance };
    },
    onSuccess: () => {
      // Silent success for better UX on rapid marking
    },
    onError: (err, newData, context) => {
      queryClient.setQueryData(['attendance', groupId, weekStart], context.previousAttendance);
      notifications.error('Error al registrar asistencia');
    },
    onSettled: () => {
      queryClient.invalidateQueries(['attendance', groupId, weekStart]);
    },
  });

  // Bulk mark attendance
  const markBulkMutation = useMutation({
    mutationFn: ({ scheduleId, attendanceList }) => attendanceApi.markBulk(scheduleId, attendanceList),
    onSuccess: () => {
      queryClient.invalidateQueries(['attendance', groupId, weekStart]);
      notifications.success('Asistencia guardada exitosamente');
    },
    onError: () => {
      notifications.error('Error al guardar asistencia');
    },
  });

  return {
    attendance,
    isLoading,
    error,
    refetch,
    markAttendance: markMutation.mutate,
    markAttendanceAsync: markMutation.mutateAsync,
    markBulkAttendance: markBulkMutation.mutate,
    markBulkAttendanceAsync: markBulkMutation.mutateAsync,
    isMarking: markMutation.isPending,
  };
}

/**
 * Hook for attendance stats
 */
export function useAttendanceStats(coachId, startDate, endDate) {
  return useQuery({
    queryKey: ['attendance-stats', coachId, startDate, endDate],
    queryFn: async () => {
      const response = await attendanceApi.getStats(coachId, startDate, endDate);
      return response?.data;
    },
    enabled: !!coachId,
  });
}

export default useAttendance;
