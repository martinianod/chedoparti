# Socio Dashboard - Developer Documentation

## Overview

The Socio Dashboard is a modern, feature-rich dashboard for partners (socios) built with React, following professional standards from platforms like Playtomic, Airbnb, and MindBody.

## Architecture

### Feature-Based Structure

The dashboard follows Domain-Driven Design principles with a feature-based architecture:

```
/src/features/socio-dashboard/
├── components/          # UI Components
│   ├── header/         # Header components (DashboardHeader, StatsCards, ViewToggle)
│   ├── reservations/   # Reservation components (ReservationCard, ReservationList, NextReservation)
│   ├── classes/        # Class components (ClassCard, ClassList)
│   └── shared/         # Shared components (EmptyState, LoadingSkeleton, ErrorMessage, DashboardFilters)
├── hooks/              # Custom React hooks
│   ├── useSocioDashboard.js      # Main orchestration hook
│   ├── useSocioReservations.js   # Reservations management
│   ├── useSocioClasses.js        # Classes management
│   ├── useSocioFilters.js        # Filter logic
│   └── useSocioStats.js          # Statistics calculations
├── store/              # Zustand state management
│   └── socioDashboardStore.js    # Dashboard state store
├── utils/              # Utility functions
│   ├── reservationTypes.js       # Type constants and helpers
│   ├── reservationGrouping.js    # Grouping and sorting utilities
│   └── dateFormatters.js         # Date/time formatting
├── SocioDashboard.jsx  # Main orchestrator component
└── index.js            # Barrel exports
```

## Key Features

### 1. Dual View Modes

- **Cards View**: Modern card-based layout with grouping by date
- **Calendar View**: Grid-based calendar for visual scheduling

### 2. Advanced Filtering

- **Time Range**: Hoy, Semana, Próximas, Historial
- **Type**: Todas, Reservas, Clases, Torneos, Fijos
- **Sport**: Todos, Pádel, Tenis, Fútbol

### 3. Real-Time Updates

- WebSocket integration for live reservation updates
- Optimistic UI updates for instant feedback
- Automatic refetch on window focus

### 4. Statistics Dashboard

- Upcoming reservations count
- Upcoming classes count
- Next activity countdown
- Attendance rate

### 5. Accessibility (WCAG AA)

- Semantic HTML structure
- ARIA labels and roles
- Keyboard navigation support
- Screen reader compatibility
- High contrast ratios

### 6. Responsive Design

- Mobile-first approach
- Breakpoints: 768px (tablet), 1024px (desktop)
- Touch-friendly interactions
- Optimized layouts for all screen sizes

## Components

### Header Components

#### DashboardHeader
```jsx
<DashboardHeader user={user} />
```
Displays welcome message with time-based greeting and view toggle.

#### StatsCards
```jsx
<StatsCards stats={stats} />
```
Shows key metrics in color-coded cards with animated counters.

#### ViewToggle
```jsx
<ViewToggle />
```
Switches between cards and calendar views.

### Reservation Components

#### ReservationCard
```jsx
<ReservationCard
  reservation={reservation}
  onCancel={handleCancel}
  onDetailClick={handleDetail}
/>
```
Playtomic-style card with color-coded borders, status badges, and actions.

#### ReservationList
```jsx
<ReservationList
  groupedReservations={groupedData}
  onCancel={handleCancel}
  onDetailClick={handleDetail}
/>
```
Groups reservations by date with collapsible sections.

#### NextReservation
```jsx
<NextReservation
  reservation={nextReservation}
  onCancel={handleCancel}
  onDetailClick={handleDetail}
/>
```
Highlights upcoming reservation with live countdown timer.

### Class Components

#### ClassCard
```jsx
<ClassCard
  classData={classData}
  onConfirm={handleConfirm}
  onDecline={handleDecline}
  onDetailClick={handleDetail}
/>
```
Purple-themed card with attendance actions.

#### ClassList
```jsx
<ClassList
  groupedClasses={groupedData}
  onConfirm={handleConfirm}
  onDecline={handleDecline}
  onDetailClick={handleDetail}
/>
```
Groups classes by date with collapsible sections.

### Shared Components

#### EmptyState
```jsx
<EmptyState
  variant="no-reservations" // or "no-classes", "no-results", "no-data"
  onAction={handleAction}
  actionLabel="Crear Reserva"
/>
```
Contextual empty states with illustrations and CTAs.

#### LoadingSkeleton
```jsx
<LoadingSkeleton
  variant="card" // or "stats", "list"
  count={3}
/>
```
Shimmer loading placeholders.

#### ErrorMessage
```jsx
<ErrorMessage
  error={error}
  onRetry={handleRetry}
  title="Error al cargar datos"
/>
```
Error display with retry functionality.

#### DashboardFilters
```jsx
<DashboardFilters />
```
Advanced chip-based filtering system (connected to store).

## Hooks

### useSocioDashboard

Main orchestration hook that combines all data and operations:

```javascript
const {
  reservations,        // Filtered reservations
  classes,             // Filtered classes
  groupedData,         // Data grouped by date
  stats,               // Statistics object
  isLoading,           // Loading state
  error,               // Error state
  hasActiveFilters,    // Filter status
  totalCount,          // Total items
  createReservation,   // Create function
  cancelReservation,   // Cancel function
  confirmAttendance,   // Confirm class attendance
  declineAttendance,   // Decline class attendance
  refetchAll,          // Refetch all data
  isCreating,          // Creating state
  isCancelling,        // Cancelling state
  isEmpty,             // Empty state flag
} = useSocioDashboard(userId);
```

### useSocioReservations

Manages user reservations:

```javascript
const {
  reservations,
  isLoading,
  error,
  refetch,
  createReservation,
  cancelReservation,
  isCreating,
  isCancelling,
} = useSocioReservations(userId, startDate, endDate);
```

### useSocioClasses

Manages user classes:

```javascript
const {
  classes,
  upcomingClasses,
  pastClasses,
  isLoading,
  error,
  confirmAttendance,
  declineAttendance,
} = useSocioClasses(userId, startDate, endDate);
```

### useSocioStats

Calculates dashboard statistics:

```javascript
const stats = useSocioStats(reservations, classes);
// Returns: {
//   upcomingReservationsCount,
//   upcomingClassesCount,
//   nextReservation,
//   nextClass,
//   attendanceRate,
//   reservationsByType,
//   reservationsBySport,
//   hasUpcomingActivity
// }
```

### useSocioFilters

Applies filters to data:

```javascript
const {
  reservations,      // Filtered reservations
  classes,           // Filtered classes
  totalCount,        // Total filtered items
  filters,           // Current filters
  hasActiveFilters,  // Filter status
} = useSocioFilters(allReservations, allClasses);
```

## State Management (Zustand)

### Store Structure

```javascript
{
  viewMode: 'cards' | 'calendar',
  filters: {
    timeRange: 'week' | 'day' | 'upcoming' | 'history',
    type: 'all' | 'reservations' | 'classes' | 'tournaments' | 'fixed',
    sport: 'all' | 'Padel' | 'Tenis' | 'Futbol',
    dateRange: { start: Date, end: Date }
  },
  expandedSections: Set<string>,
  showFilters: boolean,
  showReservations: boolean,
  showClasses: boolean,
  preferences: {
    defaultView: 'cards',
    defaultTimeRange: 'week',
    compactMode: false,
    groupByDate: true
  }
}
```

### Store Actions

```javascript
const actions = useSocioActions();

actions.setViewMode('cards');
actions.setTimeRange('week');
actions.setFilterType('reservations');
actions.setFilterSport('Padel');
actions.setDateRange(startDate, endDate);
actions.resetFilters();
actions.toggleSection(dateKey);
actions.expandAllSections(dateKeys);
actions.collapseAllSections();
actions.setPreferences({ compactMode: true });
actions.reset();
```

### Selector Hooks

```javascript
const viewMode = useSocioViewMode();
const filters = useSocioFilters();
const expandedSections = useSocioExpandedSections();
const preferences = useSocioPreferences();
const selectors = useSocioSelectors();

// Selectors
selectors.hasActiveFilters();
selectors.getActiveFilterCount();
selectors.isSectionExpanded(dateKey);
```

## Utilities

### Reservation Types

```javascript
import { 
  RESERVATION_TYPES,
  SPORTS,
  getTypeColor,
  getTypeIcon,
  getSportIcon,
  getSportEmoji 
} from './utils/reservationTypes';

const colors = getTypeColor('Torneo');
// Returns: { border, bg, text, badge }

const Icon = getTypeIcon('Fijo');
const emoji = getSportEmoji('Padel'); // 🎾
```

### Reservation Grouping

```javascript
import {
  groupByDate,
  sortByTime,
  formatGroupHeader,
  getNextReservation,
  sortGroupedDates,
  filterByDateRange
} from './utils/reservationGrouping';

const grouped = groupByDate(reservations);
const sorted = sortByTime(items);
const header = formatGroupHeader('2025-12-01'); // "Domingo 1 de Dic"
const next = getNextReservation(reservations);
```

### Date Formatters

```javascript
import {
  formatSpanishDate,
  formatShortDate,
  formatTime,
  formatRelativeTime,
  formatCountdown,
  formatDuration,
  getTimeOfDayGreeting
} from './utils/dateFormatters';

const date = formatSpanishDate('2025-12-01'); // "Domingo 1 de Diciembre"
const short = formatShortDate('2025-12-01'); // "Dom 1 Dic"
const time = formatTime('14:30:00'); // "14:30"
const countdown = formatCountdown('2025-12-01', '14:30'); // "En 2h 30m"
const duration = formatDuration('01:30'); // "1h 30m"
const greeting = getTimeOfDayGreeting(); // "Buenos días"
```

## Styling

### Design Tokens

The dashboard uses the existing Chedoparti theme:

- **Primary**: Navy (`#1e3a8a`) / Gold (`#fbbf24`)
- **Reservation Types**:
  - Normal: Green
  - Tournament: Yellow
  - Fixed: Blue
  - Class: Purple

### Tailwind Classes

Common patterns:
```jsx
// Cards
className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700"

// Buttons
className="btn btn-primary" // Navy background
className="btn btn-outline" // Outlined

// Text
className="text-navy dark:text-gold"
className="text-gray-600 dark:text-gray-400"
```

## Animations

### Framer Motion Patterns

```jsx
// Fade in
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3 }}
>

// Stagger children
{items.map((item, index) => (
  <motion.div
    key={item.id}
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: index * 0.05 }}
  >
))}

// Expand/collapse
<AnimatePresence>
  {isExpanded && (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
  )}
</AnimatePresence>

// Button interactions
<motion.button
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
>
```

## Performance Optimizations

### Memoization

All data transformations are memoized:
```javascript
const filteredData = useMemo(() => {
  // Expensive filtering logic
}, [dependencies]);
```

### React Query Caching

Reservations and classes use React Query with:
- 5 minute stale time
- 10 minute cache time
- Background refetch on window focus
- Optimistic updates

### Code Splitting

Heavy components are lazy-loaded:
```javascript
const CalendarView = lazy(() => import('./components/calendar/CalendarView'));
```

## Testing

### Unit Tests

```bash
# Test utilities
npm test src/features/socio-dashboard/utils/

# Test hooks
npm test src/features/socio-dashboard/hooks/

# Test store
npm test src/features/socio-dashboard/store/
```

### Integration Tests

```bash
npm test src/features/socio-dashboard/SocioDashboard.test.jsx
```

### Accessibility Tests

```bash
npm run test:a11y
```

## Troubleshooting

### Common Issues

1. **Filters not working**: Check that `useSocioFilters` hook is properly connected to store
2. **Sections not expanding**: Verify `expandedSections` Set is being updated correctly
3. **WebSocket not connecting**: Check `isDemoMode` flag and WebSocket configuration
4. **Stats not updating**: Ensure `stats` object is recalculated when data changes

### Debug Mode

Enable Zustand devtools in browser:
```javascript
// Store is already configured with devtools
// Open Redux DevTools extension to inspect state
```

## Future Enhancements

- [ ] Virtual scrolling for long lists
- [ ] Offline support with Service Worker
- [ ] Push notifications for upcoming reservations
- [ ] Export reservations to calendar (iCal)
- [ ] Drag-and-drop reservation rescheduling
- [ ] Advanced analytics dashboard
- [ ] Social features (invite friends)

## Contributing

When adding new features:

1. Follow the existing component structure
2. Add proper TypeScript types (if migrating to TS)
3. Include accessibility attributes
4. Write unit tests
5. Update this documentation
6. Test on mobile devices

## License

Internal use only - Chedoparti Platform
