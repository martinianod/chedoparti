import { useMemo } from 'react';
import {
  useReservationsByDate,
  useCreateReservation,
  useCancelReservation,
} from '../../../hooks/useReservationSync';
import { filterByDateRange } from '../utils/reservationGrouping';

/**
 * Hook for managing Socio reservations
 * Specialized wrapper for reservation operations in Socio context
 * 
 * @param {string} userId - User ID
 * @param {string} startDate - Start date (YYYY-MM-DD)
 * @param {string} endDate - End date (YYYY-MM-DD)
 * @returns {Object} Reservations data and operations
 */
export function useSocioReservations(userId, startDate, endDate) {
  // Fetch reservations for the date range
  // Note: useReservationsByDate fetches for a single date, so we'll need to adapt
  const {
    reservations: allReservations,
    isLoading,
    error,
    refetch,
  } = useReservationsByDate(startDate);

  const createMutation = useCreateReservation();
  const cancelMutation = useCancelReservation();

  // Filter reservations by date range and user
  const userReservations = useMemo(() => {
    if (!allReservations) return [];

    let filtered = allReservations;

    // Filter by date range
    if (startDate && endDate) {
      filtered = filterByDateRange(filtered, startDate, endDate);
    }

    // Filter by user (if userId is provided)
    if (userId) {
      filtered = filtered.filter((r) => {
        return (
          String(r.userId) === String(userId) ||
          String(r.membershipNumber) === String(userId) ||
          r.user?.id === userId ||
          r.user?.phone === userId
        );
      });
    }

    // Filter out cancelled/deleted
    filtered = filtered.filter(
      (r) => r.status !== 'cancelled' && r.status !== 'deleted'
    );

    return filtered;
  }, [allReservations, userId, startDate, endDate]);

  return {
    reservations: userReservations,
    isLoading,
    error,
    refetch,
    createReservation: createMutation.mutateAsync,
    cancelReservation: cancelMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isCancelling: cancelMutation.isPending,
  };
}

export default useSocioReservations;
