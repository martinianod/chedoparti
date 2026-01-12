import { useMemo } from 'react';
import { useSocioReservations } from './useSocioReservations';
import { useSocioClasses } from './useSocioClasses';
import { useSocioFilters as useSocioFiltersHook } from './useSocioFilters';
import { useSocioStats } from './useSocioStats';
import { useSocioFilters as useFiltersStore } from '../store/socioDashboardStore';
import { groupByDate, sortGroupedDates } from '../utils/reservationGrouping';
import { getArgentinaDate, addDaysArgentina } from '../../../utils/dateUtils';

/**
 * Main orchestration hook for Socio Dashboard
 * Combines reservations, classes, filters, and stats
 * 
 * @param {string} userId - User ID
 * @returns {Object} Complete dashboard data and operations
 */
export function useSocioDashboard(userId) {
  const filters = useFiltersStore();

  // Ensure dateRange has default values
  const dateRange = filters?.dateRange || {
    start: getArgentinaDate(),
    end: addDaysArgentina(getArgentinaDate(), 7),
  };

  // Fetch reservations
  const {
    reservations: rawReservations,
    isLoading: reservationsLoading,
    error: reservationsError,
    refetch: refetchReservations,
    createReservation,
    cancelReservation,
    isCreating,
    isCancelling,
  } = useSocioReservations(
    userId,
    dateRange.start,
    dateRange.end
  );

  // Fetch classes
  const {
    classes: rawClasses,
    upcomingClasses,
    pastClasses,
    isLoading: classesLoading,
    error: classesError,
    confirmAttendance,
    declineAttendance,
  } = useSocioClasses(userId, dateRange.start, dateRange.end);

  // Apply filters
  const {
    reservations: filteredReservations,
    classes: filteredClasses,
    totalCount,
    hasActiveFilters,
  } = useSocioFiltersHook(rawReservations, rawClasses);

  // Calculate stats
  const stats = useSocioStats(rawReservations, rawClasses);

  // Group data by date
  const groupedData = useMemo(() => {
    const groupedReservations = groupByDate(filteredReservations);
    const groupedClasses = groupByDate(filteredClasses);

    // Merge grouped data
    const allDates = new Set([
      ...Object.keys(groupedReservations),
      ...Object.keys(groupedClasses),
    ]);

    const merged = {};
    allDates.forEach((date) => {
      merged[date] = {
        reservations: groupedReservations[date] || [],
        classes: groupedClasses[date] || [],
      };
    });

    return sortGroupedDates(merged);
  }, [filteredReservations, filteredClasses]);

  // Loading and error states
  const isLoading = reservationsLoading || classesLoading;
  const error = reservationsError || classesError;

  // Refetch all data
  const refetchAll = () => {
    refetchReservations();
    // Classes are fetched via React Query, they auto-refetch
  };

  return {
    // Data
    reservations: filteredReservations,
    classes: filteredClasses,
    upcomingClasses,
    pastClasses,
    groupedData,
    stats,
    
    // States
    isLoading,
    error,
    hasActiveFilters,
    totalCount,
    
    // Operations
    createReservation,
    cancelReservation,
    confirmAttendance,
    declineAttendance,
    refetchAll,
    
    // Mutation states
    isCreating,
    isCancelling,
    
    // Flags
    isEmpty: totalCount === 0,
    hasData: totalCount > 0,
  };
}

export default useSocioDashboard;
