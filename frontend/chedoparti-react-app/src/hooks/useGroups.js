import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { groupsApi } from '../services/groups.api';
import { useCoachStore } from '../store/coachStore';
import { useAppNotifications } from './useAppNotifications';

/**
 * Hook for managing groups
 * Provides CRUD operations and student assignments with React Query integration
 */
export function useGroups(coachId, options = {}) {
  const queryClient = useQueryClient();
  const { setGroups, setGroupsLoading, setGroupsError } = useCoachStore();
  const notifications = useAppNotifications();

  // Fetch groups
  const {
    data: groups = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['groups', coachId, options],
    queryFn: async () => {
      const response = await groupsApi.list(coachId, options);
      const data = response?.data || [];
      setGroups(data);
      return data;
    },
    enabled: !!coachId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    onError: (err) => {
      setGroupsError(err.message);
      notifications.error('Error al cargar grupos');
    },
  });

  // Create group
  const createMutation = useMutation({
    mutationFn: (data) => groupsApi.create(data),
    onMutate: async (newGroup) => {
      await queryClient.cancelQueries(['groups', coachId]);
      const previousGroups = queryClient.getQueryData(['groups', coachId]);

      queryClient.setQueryData(['groups', coachId], (old = []) => [
        ...old,
        { ...newGroup, id: Date.now(), studentIds: [], isOptimistic: true },
      ]);

      return { previousGroups };
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['groups', coachId]);
      notifications.success('Grupo creado exitosamente');
    },
    onError: (err, newGroup, context) => {
      queryClient.setQueryData(['groups', coachId], context.previousGroups);
      notifications.error(err.response?.data?.message || 'Error al crear grupo');
    },
  });

  // Update group
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => groupsApi.update(id, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries(['groups', coachId]);
      const previousGroups = queryClient.getQueryData(['groups', coachId]);

      queryClient.setQueryData(['groups', coachId], (old = []) =>
        old.map((group) => (group.id === id ? { ...group, ...data } : group))
      );

      return { previousGroups };
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['groups', coachId]);
      notifications.success('Grupo actualizado exitosamente');
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(['groups', coachId], context.previousGroups);
      notifications.error(err.response?.data?.message || 'Error al actualizar grupo');
    },
  });

  // Archive group
  const archiveMutation = useMutation({
    mutationFn: (id) => groupsApi.archive(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries(['groups', coachId]);
      const previousGroups = queryClient.getQueryData(['groups', coachId]);

      queryClient.setQueryData(['groups', coachId], (old = []) =>
        old.map((group) => (group.id === id ? { ...group, isArchived: true } : group))
      );

      return { previousGroups };
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['groups', coachId]);
      notifications.success('Grupo archivado exitosamente');
    },
    onError: (err, id, context) => {
      queryClient.setQueryData(['groups', coachId], context.previousGroups);
      notifications.error(err.response?.data?.message || 'Error al archivar grupo');
    },
  });

  // Restore group
  const restoreMutation = useMutation({
    mutationFn: (id) => groupsApi.restore(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries(['groups', coachId]);
      const previousGroups = queryClient.getQueryData(['groups', coachId]);

      queryClient.setQueryData(['groups', coachId], (old = []) =>
        old.map((group) => (group.id === id ? { ...group, isArchived: false } : group))
      );

      return { previousGroups };
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['groups', coachId]);
      notifications.success('Grupo restaurado exitosamente');
    },
    onError: (err, id, context) => {
      queryClient.setQueryData(['groups', coachId], context.previousGroups);
      notifications.error(err.response?.data?.message || 'Error al restaurar grupo');
    },
  });

  // Duplicate group
  const duplicateMutation = useMutation({
    mutationFn: (id) => groupsApi.duplicate(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['groups', coachId]);
      notifications.success('Grupo duplicado exitosamente');
    },
    onError: (err) => {
      notifications.error(err.response?.data?.message || 'Error al duplicar grupo');
    },
  });

  // Add student to group
  const addStudentMutation = useMutation({
    mutationFn: ({ groupId, studentId }) => groupsApi.addStudent(groupId, studentId),
    onMutate: async ({ groupId, studentId }) => {
      await queryClient.cancelQueries(['groups', coachId]);
      const previousGroups = queryClient.getQueryData(['groups', coachId]);

      queryClient.setQueryData(['groups', coachId], (old = []) =>
        old.map((group) =>
          group.id === groupId
            ? { ...group, studentIds: [...(group.studentIds || []), studentId] }
            : group
        )
      );

      return { previousGroups };
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['groups', coachId]);
      notifications.success('Alumno agregado al grupo');
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(['groups', coachId], context.previousGroups);
      notifications.error(err.response?.data?.message || 'Error al agregar alumno');
    },
  });

  // Remove student from group
  const removeStudentMutation = useMutation({
    mutationFn: ({ groupId, studentId }) => groupsApi.removeStudent(groupId, studentId),
    onMutate: async ({ groupId, studentId }) => {
      await queryClient.cancelQueries(['groups', coachId]);
      const previousGroups = queryClient.getQueryData(['groups', coachId]);

      queryClient.setQueryData(['groups', coachId], (old = []) =>
        old.map((group) =>
          group.id === groupId
            ? { ...group, studentIds: (group.studentIds || []).filter((id) => id !== studentId) }
            : group
        )
      );

      return { previousGroups };
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['groups', coachId]);
      notifications.success('Alumno removido del grupo');
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(['groups', coachId], context.previousGroups);
      notifications.error(err.response?.data?.message || 'Error al remover alumno');
    },
  });

  // Reorder students in group
  const reorderStudentsMutation = useMutation({
    mutationFn: ({ groupId, studentIds }) => groupsApi.reorderStudents(groupId, studentIds),
    onMutate: async ({ groupId, studentIds }) => {
      await queryClient.cancelQueries(['groups', coachId]);
      const previousGroups = queryClient.getQueryData(['groups', coachId]);

      queryClient.setQueryData(['groups', coachId], (old = []) =>
        old.map((group) => (group.id === groupId ? { ...group, studentIds } : group))
      );

      return { previousGroups };
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['groups', coachId]);
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(['groups', coachId], context.previousGroups);
      notifications.error(err.response?.data?.message || 'Error al reordenar alumnos');
    },
  });

  return {
    groups,
    isLoading,
    error,
    refetch,
    createGroup: createMutation.mutate,
    createGroupAsync: createMutation.mutateAsync,
    updateGroup: updateMutation.mutate,
    updateGroupAsync: updateMutation.mutateAsync,
    archiveGroup: archiveMutation.mutate,
    archiveGroupAsync: archiveMutation.mutateAsync,
    restoreGroup: restoreMutation.mutate,
    restoreGroupAsync: restoreMutation.mutateAsync,
    duplicateGroup: duplicateMutation.mutate,
    duplicateGroupAsync: duplicateMutation.mutateAsync,
    addStudent: addStudentMutation.mutate,
    addStudentAsync: addStudentMutation.mutateAsync,
    removeStudent: removeStudentMutation.mutate,
    removeStudentAsync: removeStudentMutation.mutateAsync,
    reorderStudents: reorderStudentsMutation.mutate,
    reorderStudentsAsync: reorderStudentsMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isArchiving: archiveMutation.isPending,
    isDuplicating: duplicateMutation.isPending,
  };
}

/**
 * Hook for getting a single group
 */
export function useGroup(id) {
  return useQuery({
    queryKey: ['group', id],
    queryFn: async () => {
      const response = await groupsApi.get(id);
      return response?.data;
    },
    enabled: !!id,
  });
}

export default useGroups;
