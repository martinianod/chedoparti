import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { studentsApi } from '../services/students.api';
import { useCoachStore } from '../store/coachStore';
import { useAppNotifications } from './useAppNotifications';

/**
 * Hook for managing students
 * Provides CRUD operations with React Query integration
 */
export function useStudents(coachId, filters = {}) {
  const queryClient = useQueryClient();
  const { setStudents, setStudentsLoading, setStudentsError } = useCoachStore();
  const notifications = useAppNotifications();

  // Fetch students
  const {
    data: students = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['students', coachId, filters],
    queryFn: async () => {
      const response = await studentsApi.list(coachId, filters);
      const data = response?.data || [];
      setStudents(data);
      return data;
    },
    enabled: !!coachId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    onError: (err) => {
      setStudentsError(err.message);
      notifications.error('Error al cargar alumnos');
    },
  });

  // Create student
  const createMutation = useMutation({
    mutationFn: (data) => studentsApi.create(data),
    onMutate: async (newStudent) => {
      // Optimistic update
      await queryClient.cancelQueries(['students', coachId]);
      const previousStudents = queryClient.getQueryData(['students', coachId]);

      queryClient.setQueryData(['students', coachId], (old = []) => [
        ...old,
        { ...newStudent, id: Date.now(), isOptimistic: true },
      ]);

      return { previousStudents };
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries(['students', coachId]);
      notifications.success('Alumno creado exitosamente');
    },
    onError: (err, newStudent, context) => {
      queryClient.setQueryData(['students', coachId], context.previousStudents);
      notifications.error(err.response?.data?.message || 'Error al crear alumno');
    },
  });

  // Update student
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => studentsApi.update(id, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries(['students', coachId]);
      const previousStudents = queryClient.getQueryData(['students', coachId]);

      queryClient.setQueryData(['students', coachId], (old = []) =>
        old.map((student) => (student.id === id ? { ...student, ...data } : student))
      );

      return { previousStudents };
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['students', coachId]);
      notifications.success('Alumno actualizado exitosamente');
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(['students', coachId], context.previousStudents);
      notifications.error(err.response?.data?.message || 'Error al actualizar alumno');
    },
  });

  // Delete student
  const deleteMutation = useMutation({
    mutationFn: (id) => studentsApi.delete(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries(['students', coachId]);
      const previousStudents = queryClient.getQueryData(['students', coachId]);

      queryClient.setQueryData(['students', coachId], (old = []) =>
        old.filter((student) => student.id !== id)
      );

      return { previousStudents };
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['students', coachId]);
      notifications.success('Alumno eliminado exitosamente');
    },
    onError: (err, id, context) => {
      queryClient.setQueryData(['students', coachId], context.previousStudents);
      notifications.error(err.response?.data?.message || 'Error al eliminar alumno');
    },
  });

  // Search members
  const searchMembersMutation = useMutation({
    mutationFn: ({ query, institutionId }) => studentsApi.searchMembers(query, institutionId),
  });

  return {
    students,
    isLoading,
    error,
    refetch,
    createStudent: createMutation.mutate,
    createStudentAsync: createMutation.mutateAsync,
    updateStudent: updateMutation.mutate,
    updateStudentAsync: updateMutation.mutateAsync,
    deleteStudent: deleteMutation.mutate,
    deleteStudentAsync: deleteMutation.mutateAsync,
    searchMembers: searchMembersMutation.mutate,
    searchMembersAsync: searchMembersMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isSearching: searchMembersMutation.isPending,
  };
}

/**
 * Hook for getting a single student
 */
export function useStudent(id) {
  return useQuery({
    queryKey: ['student', id],
    queryFn: async () => {
      const response = await studentsApi.get(id);
      return response?.data;
    },
    enabled: !!id,
  });
}

export default useStudents;
