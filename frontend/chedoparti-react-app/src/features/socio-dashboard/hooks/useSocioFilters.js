import { useMemo } from 'react';
import { useSocioFilters as useSocioFiltersStore } from '../store/socioDashboardStore';
import { filterByDateRange } from '../utils/reservationGrouping';
import { RESERVATION_TYPES } from '../utils/reservationTypes';

/**
 * Hook for applying filters to reservations and classes
 * @param {Array} reservations - All reservations
 * @param {Array} classes - All classes
 * @returns {Object} Filtered data and filter utilities
 */
export function useSocioFilters(reservations = [], classes = []) {
  const filters = useSocioFiltersStore();

  const filteredData = useMemo(() => {
    let filteredReservations = [...reservations];
    let filteredClasses = [...classes];

    // Apply date range filter
    if (filters.dateRange) {
      filteredReservations = filterByDateRange(
        filteredReservations,
        filters.dateRange.start,
        filters.dateRange.end
      );
      filteredClasses = filterByDateRange(
        filteredClasses,
        filters.dateRange.start,
        filters.dateRange.end
      );
    }

    // Apply type filter
    if (filters.type !== 'all') {
      switch (filters.type) {
        case 'reservations':
          filteredClasses = [];
          break;
        case 'classes':
          filteredReservations = [];
          filteredClasses = filteredClasses.filter(
            (c) => c.type === RESERVATION_TYPES.CLASS || c.type === 'Clase'
          );
          break;
        case 'tournaments':
          filteredClasses = [];
          filteredReservations = filteredReservations.filter(
            (r) => r.type === RESERVATION_TYPES.TOURNAMENT || r.type === 'Torneo'
          );
          break;
        case 'fixed':
          filteredClasses = [];
          filteredReservations = filteredReservations.filter(
            (r) => r.type === RESERVATION_TYPES.FIXED || r.type === 'Fijo'
          );
          break;
        default:
          break;
      }
    }

    // Apply sport filter
    if (filters.sport !== 'all') {
      filteredReservations = filteredReservations.filter(
        (r) => r.sport === filters.sport || !r.sport
      );
      filteredClasses = filteredClasses.filter(
        (c) => c.sport === filters.sport || !c.sport
      );
    }

    // Filter out cancelled/deleted
    filteredReservations = filteredReservations.filter(
      (r) => r.status !== 'cancelled' && r.status !== 'deleted'
    );

    return {
      reservations: filteredReservations,
      classes: filteredClasses,
      totalCount: filteredReservations.length + filteredClasses.length,
    };
  }, [reservations, classes, filters]);

  return {
    ...filteredData,
    filters,
    hasActiveFilters:
      filters.type !== 'all' ||
      filters.sport !== 'all' ||
      filters.timeRange !== 'week',
  };
}

export default useSocioFilters;
