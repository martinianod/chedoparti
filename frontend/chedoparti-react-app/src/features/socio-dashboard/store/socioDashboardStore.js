import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { getArgentinaDate, addDaysArgentina } from '../../../utils/dateUtils';

/**
 * Zustand Store for Socio Dashboard State
 * Manages view mode, filters, UI state, and user preferences
 */
export const useSocioDashboardStore = create()(
  devtools(
    persist(
      (set, get) => ({
        // 🎨 View Mode
        viewMode: 'cards', // 'cards' | 'calendar'

        // 🔍 Filters
        filters: {
          timeRange: 'week', // 'week' | 'day' | 'upcoming' | 'history'
          type: 'all', // 'all' | 'reservations' | 'classes' | 'tournaments' | 'fixed'
          sport: 'all', // 'all' | 'Padel' | 'Tenis' | 'Futbol'
          dateRange: {
            start: getArgentinaDate(),
            end: addDaysArgentina(getArgentinaDate(), 7),
          },
        },

        // 🎯 UI State
        expandedSections: new Set(), // Set of date keys for expanded groups
        showFilters: false,
        showReservations: true,
        showClasses: true,

        // 📊 Preferences (persisted)
        preferences: {
          defaultView: 'cards',
          defaultTimeRange: 'week',
          compactMode: false,
          groupByDate: true,
        },

        // 🔧 Actions
        actions: {
          // View Mode
          setViewMode: (mode) => {
            set({ viewMode: mode }, false, 'setViewMode');
          },

          // Filters
          setTimeRange: (range) => {
            set(
              (state) => {
                let dateRange = { ...state.filters.dateRange };

                switch (range) {
                  case 'day':
                    dateRange = {
                      start: getArgentinaDate(),
                      end: getArgentinaDate(),
                    };
                    break;
                  case 'week':
                    dateRange = {
                      start: getArgentinaDate(),
                      end: addDaysArgentina(getArgentinaDate(), 7),
                    };
                    break;
                  case 'upcoming':
                    dateRange = {
                      start: getArgentinaDate(),
                      end: addDaysArgentina(getArgentinaDate(), 30),
                    };
                    break;
                  case 'history':
                    dateRange = {
                      start: addDaysArgentina(getArgentinaDate(), -30),
                      end: addDaysArgentina(getArgentinaDate(), -1),
                    };
                    break;
                  default:
                    break;
                }

                return {
                  filters: {
                    ...state.filters,
                    timeRange: range,
                    dateRange,
                  },
                };
              },
              false,
              'setTimeRange'
            );
          },

          setFilterType: (type) => {
            set(
              (state) => ({
                filters: { ...state.filters, type },
              }),
              false,
              'setFilterType'
            );
          },

          setFilterSport: (sport) => {
            set(
              (state) => ({
                filters: { ...state.filters, sport },
              }),
              false,
              'setFilterSport'
            );
          },

          setDateRange: (start, end) => {
            set(
              (state) => ({
                filters: {
                  ...state.filters,
                  dateRange: { start, end },
                },
              }),
              false,
              'setDateRange'
            );
          },

          resetFilters: () => {
            set(
              {
                filters: {
                  timeRange: 'week',
                  type: 'all',
                  sport: 'all',
                  dateRange: {
                    start: getArgentinaDate(),
                    end: addDaysArgentina(getArgentinaDate(), 7),
                  },
                },
              },
              false,
              'resetFilters'
            );
          },

          // UI State
          toggleSection: (dateKey) => {
            set(
              (state) => {
                const newExpanded = new Set(state.expandedSections);
                if (newExpanded.has(dateKey)) {
                  newExpanded.delete(dateKey);
                } else {
                  newExpanded.add(dateKey);
                }
                return { expandedSections: newExpanded };
              },
              false,
              'toggleSection'
            );
          },

          expandAllSections: (dateKeys) => {
            set(
              { expandedSections: new Set(dateKeys) },
              false,
              'expandAllSections'
            );
          },

          collapseAllSections: () => {
            set({ expandedSections: new Set() }, false, 'collapseAllSections');
          },

          toggleFilters: () => {
            set(
              (state) => ({ showFilters: !state.showFilters }),
              false,
              'toggleFilters'
            );
          },

          toggleReservations: () => {
            set(
              (state) => ({ showReservations: !state.showReservations }),
              false,
              'toggleReservations'
            );
          },

          toggleClasses: () => {
            set(
              (state) => ({ showClasses: !state.showClasses }),
              false,
              'toggleClasses'
            );
          },

          // Preferences
          setPreferences: (preferences) => {
            set(
              (state) => ({
                preferences: { ...state.preferences, ...preferences },
              }),
              false,
              'setPreferences'
            );
          },

          // Reset
          reset: () => {
            set(
              {
                viewMode: 'cards',
                filters: {
                  timeRange: 'week',
                  type: 'all',
                  sport: 'all',
                  dateRange: {
                    start: getArgentinaDate(),
                    end: addDaysArgentina(getArgentinaDate(), 7),
                  },
                },
                expandedSections: new Set(),
                showFilters: false,
                showReservations: true,
                showClasses: true,
              },
              false,
              'reset'
            );
          },
        },

        // 🎯 Selectors
        selectors: {
          hasActiveFilters: () => {
            const { filters } = get();
            return (
              filters.type !== 'all' ||
              filters.sport !== 'all' ||
              filters.timeRange !== 'week'
            );
          },

          getActiveFilterCount: () => {
            const { filters } = get();
            let count = 0;
            if (filters.type !== 'all') count++;
            if (filters.sport !== 'all') count++;
            if (filters.timeRange !== 'week') count++;
            return count;
          },

          isSectionExpanded: (dateKey) => {
            const { expandedSections } = get();
            return expandedSections.has(dateKey);
          },
        },
      }),
      {
        name: 'socio-dashboard-store',
        partialize: (state) => ({
          viewMode: state.viewMode,
          preferences: state.preferences,
          filters: {
            type: state.filters.type,
            sport: state.filters.sport,
            timeRange: state.filters.timeRange,
          },
        }),
      }
    ),
    {
      name: 'SocioDashboardStore',
    }
  )
);

// 🎯 Convenient selector hooks
export const useSocioViewMode = () =>
  useSocioDashboardStore((state) => state.viewMode);

export const useSocioFilters = () =>
  useSocioDashboardStore((state) => state.filters);

export const useSocioExpandedSections = () =>
  useSocioDashboardStore((state) => state.expandedSections);

export const useSocioShowFilters = () =>
  useSocioDashboardStore((state) => state.showFilters);

export const useSocioActions = () =>
  useSocioDashboardStore((state) => state.actions);

export const useSocioSelectors = () =>
  useSocioDashboardStore((state) => state.selectors);

export const useSocioPreferences = () =>
  useSocioDashboardStore((state) => state.preferences);

export default useSocioDashboardStore;
