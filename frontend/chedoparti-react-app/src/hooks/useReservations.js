import { useMemo, useCallback } from 'react';
import {
  useReservationsByDate,
  useCreateReservation,
  useUpdateReservation,
  useCancelReservation,
} from './useReservationSync';
import useAuth from './useAuth';

/**
 * Hook unificado para gestión de reservas con lógica de negocio
 * Wrapper sobre useReservationSync con validaciones y transformaciones
 * 
 * @param {string} date - Fecha en formato YYYY-MM-DD
 * @param {Object} options - Opciones adicionales
 * @returns {Object} Operaciones y datos de reservas
 */
export function useReservations(date, options = {}) {
  const { user } = useAuth();
  const {
    sport = null,
    courtId = null,
    status = null,
    includePrivate = false,
  } = options;

  // Obtener reservas del día
  const {
    reservations: rawReservations,
    isLoading,
    error,
    refetch,
  } = useReservationsByDate(date);

  // Mutations
  const createMutation = useCreateReservation();
  const updateMutation = useUpdateReservation();
  const cancelMutation = useCancelReservation();

  // Filtrar y transformar reservas
  const reservations = useMemo(() => {
    if (!rawReservations) return [];

    let filtered = rawReservations;

    // Filtrar por deporte
    if (sport) {
      filtered = filtered.filter((r) => r.sport === sport || !r.sport);
    }

    // Filtrar por cancha
    if (courtId) {
      filtered = filtered.filter((r) => r.courtId === courtId);
    }

    // Filtrar por estado
    if (status) {
      filtered = filtered.filter((r) => r.status === status);
    }

    // Filtrar reservas privadas (solo para no-admins)
    if (!includePrivate && user?.role !== 'INSTITUTION_ADMIN') {
      filtered = filtered.filter((r) => {
        if (r.isPrivateInfo) {
          // Solo mostrar si es el dueño
          const isOwner =
            (r.userId && user?.id && String(r.userId) === String(user.id)) ||
            (r.membershipNumber && user?.membershipNumber && 
             String(r.membershipNumber) === String(user.membershipNumber));
          return isOwner;
        }
        return true;
      });
    }

    return filtered;
  }, [rawReservations, sport, courtId, status, includePrivate, user]);

  // Reservas activas (no canceladas)
  const activeReservations = useMemo(() => {
    return reservations.filter((r) => r.status !== 'cancelled' && r.status !== 'deleted');
  }, [reservations]);

  // Crear reserva con validaciones
  const createReservation = useCallback(
    async (reservationData) => {
      // Validaciones básicas
      if (!reservationData.courtId) {
        throw new Error('Court ID is required');
      }
      if (!reservationData.startAt) {
        throw new Error('Start time is required');
      }
      if (!reservationData.endAt) {
        throw new Error('End time is required');
      }

      return createMutation.mutateAsync(reservationData);
    },
    [createMutation]
  );

  // Actualizar reserva con validaciones
  const updateReservation = useCallback(
    async (id, updates) => {
      if (!id) {
        throw new Error('Reservation ID is required');
      }

      return updateMutation.mutateAsync({ id, updates });
    },
    [updateMutation]
  );

  // Cancelar reserva
  const cancelReservation = useCallback(
    async (id, reason = 'Cancelled by user') => {
      if (!id) {
        throw new Error('Reservation ID is required');
      }

      return cancelMutation.mutateAsync({ id, reason });
    },
    [cancelMutation]
  );

  // Verificar si un slot está ocupado
  const isSlotOccupied = useCallback(
    (courtId, time) => {
      return activeReservations.some((r) => {
        if (r.courtId !== courtId) return false;
        
        // Verificar si el slot está dentro del rango de la reserva
        const [h, m] = time.split(':').map(Number);
        const slotMinutes = h * 60 + m;
        
        const [rh, rm] = r.time.split(':').map(Number);
        const reservationStart = rh * 60 + rm;
        
        const [dh, dm] = (r.duration || '01:00').split(':').map(Number);
        const reservationEnd = reservationStart + dh * 60 + dm;
        
        return slotMinutes >= reservationStart && slotMinutes < reservationEnd;
      });
    },
    [activeReservations]
  );

  // Obtener reserva en un slot específico
  const getReservationAtSlot = useCallback(
    (courtId, time) => {
      return activeReservations.find((r) => {
        if (r.courtId !== courtId) return false;
        
        const [h, m] = time.split(':').map(Number);
        const slotMinutes = h * 60 + m;
        
        const [rh, rm] = r.time.split(':').map(Number);
        const reservationStart = rh * 60 + rm;
        
        const [dh, dm] = (r.duration || '01:00').split(':').map(Number);
        const reservationEnd = reservationStart + dh * 60 + dm;
        
        return slotMinutes >= reservationStart && slotMinutes < reservationEnd;
      });
    },
    [activeReservations]
  );

  // Estadísticas del día
  const stats = useMemo(() => {
    return {
      total: reservations.length,
      active: activeReservations.length,
      cancelled: reservations.filter((r) => r.status === 'cancelled').length,
      confirmed: reservations.filter((r) => r.status === 'confirmed').length,
      pending: reservations.filter((r) => r.status === 'pending').length,
    };
  }, [reservations, activeReservations]);

  return {
    // Datos
    reservations,
    activeReservations,
    stats,
    
    // Estados
    isLoading,
    error,
    
    // Operaciones
    createReservation,
    updateReservation,
    cancelReservation,
    refetch,
    
    // Utilidades
    isSlotOccupied,
    getReservationAtSlot,
    
    // Flags
    isEmpty: reservations.length === 0,
    hasActiveReservations: activeReservations.length > 0,
    
    // Mutation states
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isCancelling: cancelMutation.isPending,
  };
}

export default useReservations;
