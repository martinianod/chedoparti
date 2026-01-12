import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { studentClassesApi } from '../services/studentClasses.api';
import { useAppNotifications } from './useAppNotifications';

/**
 * Hook for fetching student classes
 */
export function useStudentClasses(studentId, startDate, endDate, options = {}) {
  const queryClient = useQueryClient();

  // Fetch classes
  const {
    data: classes = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['student-classes', studentId, startDate, endDate, options],
    queryFn: async () => {
      const response = await studentClassesApi.list(studentId, startDate, endDate, options);
      return response?.data || [];
    },
    enabled: !!studentId && !!startDate && !!endDate,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    classes,
    isLoading,
    error,
    refetch
  };
}

/**
 * Hook for attendance confirmation with optimistic updates
 */
export function useAttendanceConfirmation() {
  const queryClient = useQueryClient();
  const notifications = useAppNotifications();

  const confirmMutation = useMutation({
    mutationFn: ({ classId, status, notes }) => 
      studentClassesApi.confirmAttendance(classId, status, notes),
    
    onMutate: async ({ classId, status }) => {
      // Cancel outgoing queries
      await queryClient.cancelQueries({ queryKey: ['student-classes'] });
      
      // Snapshot previous value
      const previousQueries = queryClient.getQueriesData({ queryKey: ['student-classes'] });

      // Optimistically update all matching queries
      queryClient.setQueriesData({ queryKey: ['student-classes'] }, (old) => {
        if (!old) return old;
        return old.map(cls => 
          cls.id === classId 
            ? { ...cls, attendanceStatus: status, confirmedAt: new Date().toISOString() }
            : cls
        );
      });

      return { previousQueries };
    },

    onSuccess: (data, variables) => {
      if (variables.status === 'confirmed') {
        notifications.success('✓ Asistencia confirmada');
      } else if (variables.status === 'declined') {
        notifications.info('Tu profesor podrá liberar tu espacio para otro compañero');
      }
    },

    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousQueries) {
        context.previousQueries.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      notifications.error('Error al registrar asistencia');
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['student-classes'] });
    }
  });

  return {
    confirmAttendance: (classId, status, notes) => 
      confirmMutation.mutate({ classId, status, notes }),
    confirmAttendanceAsync: (classId, status, notes) =>
      confirmMutation.mutateAsync({ classId, status, notes }),
    isConfirming: confirmMutation.isPending
  };
}

export default useStudentClasses;
