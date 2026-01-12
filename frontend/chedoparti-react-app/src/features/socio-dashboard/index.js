// Main Dashboard Component
export { default } from './SocioDashboard';
export { default as SocioDashboard } from './SocioDashboard';

// Header Components
export { default as DashboardHeader } from './components/header/DashboardHeader';
export { default as StatsCards } from './components/header/StatsCards';
export { default as ViewToggle } from './components/header/ViewToggle';

// Reservation Components
export { default as ReservationCard } from './components/reservations/ReservationCard';
export { default as ReservationList } from './components/reservations/ReservationList';
export { default as NextReservation } from './components/reservations/NextReservation';

// Class Components
export { default as ClassCard } from './components/classes/ClassCard';
export { default as ClassList } from './components/classes/ClassList';

// Shared Components
export { default as EmptyState } from './components/shared/EmptyState';
export { default as LoadingSkeleton } from './components/shared/LoadingSkeleton';
export { default as ErrorMessage } from './components/shared/ErrorMessage';
export { default as DashboardFilters } from './components/shared/DashboardFilters';

// Hooks
export { useSocioDashboard } from './hooks/useSocioDashboard';
export { useSocioReservations } from './hooks/useSocioReservations';
export { useSocioClasses } from './hooks/useSocioClasses';
export { useSocioFilters } from './hooks/useSocioFilters';
export { useSocioStats } from './hooks/useSocioStats';

// Store
export {
  useSocioDashboardStore,
  useSocioViewMode,
  useSocioFilters as useSocioFiltersStore,
  useSocioExpandedSections,
  useSocioShowFilters,
  useSocioActions,
  useSocioSelectors,
  useSocioPreferences,
} from './store/socioDashboardStore';

// Utils
export * from './utils/reservationTypes';
export * from './utils/reservationGrouping';
export * from './utils/dateFormatters';
