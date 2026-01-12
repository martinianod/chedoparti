import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { getArgentinaDate } from '../utils/dateUtils';

/**
 * Zustand Store para estado del Dashboard
 * Maneja: fecha seleccionada, deporte, cancha, modo de vista, filtros
 */
export const useDashboardStore = create()(
  devtools(
    persist(
      (set, get) => ({
        // 📅 Estado de navegación
        selectedDate: getArgentinaDate(),
        selectedSport: 'Padel',
        selectedCourt: null,
        
        // 🎨 Modo de vista
        viewMode: 'day', // 'day' | 'week' | 'agenda'
        
        // 🔍 Filtros avanzados
        filters: {
          courts: [], // Array de IDs de canchas
          states: [], // Array de estados ('Libre', 'Reservado', etc.)
          coach: null, // ID del coach
          user: null, // ID del usuario
          dateRange: null, // { start: 'YYYY-MM-DD', end: 'YYYY-MM-DD' }
        },
        
        // 🎯 UI State
        showFilters: false,
        sidebarOpen: false,
        
        // 📊 Preferencias de usuario
        preferences: {
          defaultView: 'day',
          autoRefresh: true,
          refreshInterval: 30000, // 30 segundos
          showWeekends: true,
          compactMode: false,
        },
        
        // 🔧 Actions
        actions: {
          // Navegación de fecha
          setSelectedDate: (date) => set({ selectedDate: date }, false, 'setSelectedDate'),
          
          setSelectedSport: (sport) => set({ selectedSport: sport }, false, 'setSelectedSport'),
          
          setSelectedCourt: (courtId) => set({ selectedCourt: courtId }, false, 'setSelectedCourt'),
          
          // Modo de vista
          setViewMode: (mode) => set({ viewMode: mode }, false, 'setViewMode'),
          
          // Filtros
          setFilters: (filters) =>
            set((state) => ({ filters: { ...state.filters, ...filters } }), false, 'setFilters'),
          
          clearFilters: () =>
            set(
              {
                filters: {
                  courts: [],
                  states: [],
                  coach: null,
                  user: null,
                  dateRange: null,
                },
              },
              false,
              'clearFilters'
            ),
          
          toggleFilter: (filterType, value) =>
            set(
              (state) => {
                const currentValues = state.filters[filterType] || [];
                const newValues = currentValues.includes(value)
                  ? currentValues.filter((v) => v !== value)
                  : [...currentValues, value];
                
                return {
                  filters: {
                    ...state.filters,
                    [filterType]: newValues,
                  },
                };
              },
              false,
              'toggleFilter'
            ),
          
          // UI State
          toggleFilters: () =>
            set((state) => ({ showFilters: !state.showFilters }), false, 'toggleFilters'),
          
          toggleSidebar: () =>
            set((state) => ({ sidebarOpen: !state.sidebarOpen }), false, 'toggleSidebar'),
          
          // Preferencias
          setPreferences: (preferences) =>
            set(
              (state) => ({ preferences: { ...state.preferences, ...preferences } }),
              false,
              'setPreferences'
            ),
          
          // Reset
          reset: () =>
            set(
              {
                selectedDate: getArgentinaDate(),
                selectedSport: 'Padel',
                selectedCourt: null,
                viewMode: 'day',
                filters: {
                  courts: [],
                  states: [],
                  coach: null,
                  user: null,
                  dateRange: null,
                },
                showFilters: false,
                sidebarOpen: false,
              },
              false,
              'reset'
            ),
        },
        
        // 🎯 Selectors
        selectors: {
          // Verificar si hay filtros activos
          hasActiveFilters: () => {
            const { filters } = get();
            return (
              filters.courts.length > 0 ||
              filters.states.length > 0 ||
              filters.coach !== null ||
              filters.user !== null ||
              filters.dateRange !== null
            );
          },
          
          // Contar filtros activos
          getActiveFilterCount: () => {
            const { filters } = get();
            let count = 0;
            if (filters.courts.length > 0) count++;
            if (filters.states.length > 0) count++;
            if (filters.coach !== null) count++;
            if (filters.user !== null) count++;
            if (filters.dateRange !== null) count++;
            return count;
          },
          
          // Obtener configuración actual
          getCurrentConfig: () => {
            const state = get();
            return {
              date: state.selectedDate,
              sport: state.selectedSport,
              court: state.selectedCourt,
              viewMode: state.viewMode,
              filters: state.filters,
            };
          },
        },
      }),
      {
        name: 'dashboard-store',
        partialize: (state) => ({
          selectedSport: state.selectedSport,
          viewMode: state.viewMode,
          preferences: state.preferences,
        }),
      }
    ),
    {
      name: 'DashboardStore',
    }
  )
);

// 🎯 Hooks convenientes
export const useDashboardDate = () => useDashboardStore((state) => state.selectedDate);
export const useDashboardSport = () => useDashboardStore((state) => state.selectedSport);
export const useDashboardCourt = () => useDashboardStore((state) => state.selectedCourt);
export const useDashboardViewMode = () => useDashboardStore((state) => state.viewMode);
export const useDashboardFilters = () => useDashboardStore((state) => state.filters);
export const useDashboardActions = () => useDashboardStore((state) => state.actions);
export const useDashboardSelectors = () => useDashboardStore((state) => state.selectors);
export const useDashboardPreferences = () => useDashboardStore((state) => state.preferences);

export default useDashboardStore;
