import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useAuth from '../../hooks/useAuth';
import { useAppNotifications } from '../../hooks/useAppNotifications';
import { useReservationWebSocket } from '../../hooks/useReservationWebSocket';
import { useRawReservationsByDate } from '../../hooks/useReservationSync';
import ErrorBoundary from '../../components/ErrorBoundary';

// Feature components
import DashboardHeader from './components/header/DashboardHeader';
import DashboardFilters from './components/shared/DashboardFilters';
import NextReservation from './components/reservations/NextReservation';
import ReservationList from './components/reservations/ReservationList';
import ClassList from './components/classes/ClassList';
import EmptyState from './components/shared/EmptyState';
import LoadingSkeleton from './components/shared/LoadingSkeleton';
import ErrorMessage from './components/shared/ErrorMessage';

// Calendar view (reuse existing)
import CalendarGrid from '../../components/ui/CalendarGrid';
import Card from '../../components/ui/Card';
import ReservationFormModalNew from '../../components/ui/ReservationFormModalNew';

// Hooks and store
import { useSocioDashboard } from './hooks/useSocioDashboard';
import { useSocioViewMode, useSocioActions } from './store/socioDashboardStore';

// Utils
import { getArgentinaDate, addDaysArgentina, formatArgentinaDateDisplay, isToday } from '../../utils/dateUtils';
import { generateTimeSlots, getDayOfWeekSpanish, getSlotInterval } from '../../services/institutionConfig';
import { courtsApi, institutionsApi } from '../../services/api';
import { useTranslation } from 'react-i18next';

/**
 * Socio Dashboard - Main Component
 * Professional dashboard for partners with modern UI/UX
 */
export default function SocioDashboard() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { reservation: notifications } = useAppNotifications();
  const viewMode = useSocioViewMode();
  const { expandAllSections, toggleFilters } = useSocioActions();

  // State for calendar view
  const [date, setDate] = React.useState(() => getArgentinaDate());
  const [sport, setSport] = React.useState('Padel');
  const [courts, setCourts] = React.useState([]);
  const [modalOpen, setModalOpen] = React.useState(false);
  const [modalData, setModalData] = React.useState(null);

  // Main dashboard data
  const {
    reservations,
    classes,
    groupedData,
    stats,
    isLoading,
    error,
    hasActiveFilters,
    totalCount,
    createReservation,
    cancelReservation,
    confirmAttendance,
    declineAttendance,
    refetchAll,
    isCreating,
    isCancelling,
    isEmpty,
  } = useSocioDashboard(user?.id);

  // Fetch reservations for the specific calendar date (ALL reservations, not just user's)
  const {
    reservations: calendarReservations,
    refetch: refetchCalendar
  } = useRawReservationsByDate(date);

  // Refetch both dashboard data and calendar data on updates
  const handleRefetchAll = () => {
    refetchAll();
    refetchCalendar();
  };

  // WebSocket for real-time updates
  const isDemoMode = import.meta.env.VITE_API_BASE_URL?.includes('/api') || false;
  useReservationWebSocket({
    autoConnect: !isDemoMode,
    institutionId: user?.institutionId,
    userId: user?.id,
    onReservationUpdate: handleRefetchAll,
  });

  // Load courts for calendar view
  const loadCourts = React.useCallback(async () => {
    try {
      let institutionId = 1;
      try {
        const institutionsResponse = await institutionsApi.list();
        const institutions = institutionsResponse?.data || [];
        if (institutions.length > 0) {
          institutionId = institutions[0].id;
        }
      } catch {
        console.warn('Could not fetch institutions, using default ID 1');
      }

      const courtsResponse = await courtsApi
        .listActive(institutionId)
        .catch(() => courtsApi.list(institutionId, { page: 0, size: 100, sort: 'name' }));

      const courtsPayload = courtsResponse?.data;
      const rawCourts = Array.isArray(courtsPayload?.content)
        ? courtsPayload.content
        : Array.isArray(courtsPayload)
        ? courtsPayload
        : [];
      const normalizedCourts = rawCourts.map((court) => ({
        ...court,
        sport: court?.sport || 'Padel',
      }));
      setCourts(normalizedCourts);
    } catch {
      setCourts([]);
    }
  }, []);

  useEffect(() => {
    loadCourts();
  }, [loadCourts]);

  // Expand all sections by default
  useEffect(() => {
    if (groupedData && groupedData.length > 0) {
      const dateKeys = groupedData.map(([dateKey]) => dateKey);
      expandAllSections(dateKeys);
    }
  }, [groupedData, expandAllSections]);

  // Handlers
  const handleCancelReservation = async (reservation) => {
    try {
      await cancelReservation({
        id: reservation.id,
        reason: 'Cancelado por el usuario desde el dashboard',
      });
      notifications.cancelSuccess();
      handleRefetchAll();
    } catch (error) {
      console.error('Error cancelling reservation:', error);
      notifications.cancelError(error.message);
    }
  };

  const handleConfirmAttendance = async (classId) => {
    try {
      await confirmAttendance(classId, 'confirmed');
      notifications.success('Asistencia confirmada');
    } catch (error) {
      console.error('Error confirming attendance:', error);
      notifications.error('Error al confirmar asistencia');
    }
  };

  const handleDeclineAttendance = async (classId) => {
    try {
      await declineAttendance(classId);
      notifications.success('Asistencia declinada');
    } catch (error) {
      console.error('Error declining attendance:', error);
      notifications.error('Error al declinar asistencia');
    }
  };

  const handleReservationDetail = (reservation) => {
    setModalData(reservation);
    setModalOpen(true);
  };

  const handleClassDetail = (classData) => {
    console.log('Class detail:', classData);
    // TODO: Implement class detail modal
  };

  const handleCreateReservation = async (form) => {
    if (!form?.date || !form?.time || !form?.courtId) {
      return;
    }

    try {
      const duration = form.duration || '01:00';
      const startAt = `${form.date}T${form.time}:00`;

      // Calculate end time
      const [hours, minutes] = duration.split(':').map(Number);
      const [startHour, startMinute] = form.time.split(':').map(Number);
      const totalMinutes = startHour * 60 + startMinute + hours * 60 + minutes;
      const endHour = Math.floor(totalMinutes / 60);
      const endMinute = totalMinutes % 60;
      const endAt = `${form.date}T${String(endHour).padStart(2, '0')}:${String(endMinute).padStart(2, '0')}:00`;

      const payload = {
        user: { phone: user?.phone || user?.email || '' },
        courtId: Number(form.courtId),
        startAt,
        endAt,
        source: 'socio',
        autoConfirm: true,
        notes: form.notes || '',
        type: 'Normal',
      };

      await createReservation(payload);
      notifications.success();
      setModalOpen(false);
      handleRefetchAll();
    } catch (error) {
      const message = error?.response?.data?.error || error?.message || 'No se pudo crear la reserva';
      console.error('❌ Reservation creation error:', error);
      notifications.error(message);
    }
  };

  // Calendar view helpers
  const filteredCourts = React.useMemo(() => {
    return courts.filter((c) => c.sport === sport);
  }, [courts, sport]);

  const slots = React.useMemo(() => {
    const dayOfWeek = getDayOfWeekSpanish(date);
    const interval = getSlotInterval();
    return generateTimeSlots(dayOfWeek, interval);
  }, [date]);

  // Filter calendar reservations by sport and status
  const filteredCalendarReservations = React.useMemo(() => {
    const list = calendarReservations || [];
    return list.filter((r) => {
      const matchesSport = r.sport === sport || !r.sport;
      const isActive = r.status !== 'cancelled' && r.status !== 'deleted';
      return matchesSport && isActive;
    });
  }, [calendarReservations, sport]);

  // Calendar date helpers
  const today = getArgentinaDate();
  const dayText = formatArgentinaDateDisplay(date);

  const handlePrevDay = () => {
    setDate(addDaysArgentina(date, -1));
  };
  const handleNextDay = () => {
    setDate(addDaysArgentina(date, 1));
  };
  const handleToday = () => setDate(today);

  // Deportes disponibles
  const sports = React.useMemo(() => {
    const unique = new Set((courts || []).map((court) => court.sport || 'Padel'));
    const list = Array.from(unique);
    return list.length > 0 ? list : ['Padel'];
  }, [courts]);

  // Loading state
  if (isLoading && isEmpty) {
    return (
      <div className="p-4 md:p-8 min-h-screen">
        <LoadingSkeleton variant="card" count={3} />
      </div>
    );
  }

  // Error state
  if (error && isEmpty) {
    return (
      <div className="p-4 md:p-8 min-h-screen">
        <ErrorMessage error={error} onRetry={refetchAll} />
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="p-4 md:p-8 min-h-screen pb-24 overflow-y-auto">
        {/* Header */}
        <DashboardHeader user={user} />

        {/* Filters - Collapsible */}
        <DashboardFilters />

        {/* Content based on view mode */}
        <AnimatePresence mode="wait">
          {viewMode === 'cards' ? (
            <motion.div
              key="cards-view"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* Next Reservation Highlight */}
              {stats.nextReservation && (
                <NextReservation
                  reservation={stats.nextReservation}
                  onCancel={handleCancelReservation}
                  onDetailClick={handleReservationDetail}
                />
              )}

              {/* Reservations Section */}
              {groupedData.some(([_, data]) => data.reservations?.length > 0) && (
                <div>
                  <h2 className="text-xl font-bold text-navy dark:text-gold mb-4 flex items-center gap-2">
                    <span>📅</span>
                    <span>Mis Reservas</span>
                  </h2>
                  <ReservationList
                    groupedReservations={groupedData.filter(([_, data]) => data.reservations?.length > 0)}
                    onCancel={handleCancelReservation}
                    onDetailClick={handleReservationDetail}
                  />
                </div>
              )}

              {/* Classes Section */}
              {groupedData.some(([_, data]) => data.classes?.length > 0) && (
                <div>
                  <h2 className="text-xl font-bold text-navy dark:text-gold mb-4 flex items-center gap-2">
                    <span>🎓</span>
                    <span>Mis Clases</span>
                  </h2>
                  <ClassList
                    groupedClasses={groupedData.filter(([_, data]) => data.classes?.length > 0)}
                    onConfirm={handleConfirmAttendance}
                    onDecline={handleDeclineAttendance}
                    onDetailClick={handleClassDetail}
                  />
                </div>
              )}

              {/* Empty State */}
              {isEmpty && !isLoading && (
                <EmptyState
                  variant={hasActiveFilters ? 'no-results' : 'no-data'}
                  onAction={hasActiveFilters ? () => useSocioActions().resetFilters() : undefined}
                />
              )}
            </motion.div>
          ) : (
            <motion.div
              key="calendar-view"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="rounded-xl">
                {/* Calendar Controls */}
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* Date Navigation */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handlePrevDay}
                        className="btn btn-outline px-3 py-2"
                        aria-label="Día anterior"
                      >
                        ←
                      </button>
                      <button
                        onClick={handleToday}
                        disabled={isToday(date)}
                        className="btn btn-outline px-4 py-2 min-w-[140px]"
                      >
                        {dayText}
                      </button>
                      <button
                        onClick={handleNextDay}
                        className="btn btn-outline px-3 py-2"
                        aria-label="Día siguiente"
                      >
                        →
                      </button>
                    </div>

                    {/* Sport Selector & Create Button */}
                    <div className="flex items-center gap-3">
                      {/* Sport Selector */}
                      <select
                        value={sport}
                        onChange={(e) => setSport(e.target.value)}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-navy dark:focus:ring-gold"
                      >
                        {sports.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>

                      {/* Create Reservation Button */}
                      <button
                        onClick={() => {
                          setModalData({ date, time: '09:00', sport, duration: '01:00' });
                          setModalOpen(true);
                        }}
                        className="btn btn-primary px-4 py-2 whitespace-nowrap"
                      >
                        + Nueva Reserva
                      </button>
                    </div>
                  </div>
                </div>

                {/* Calendar Grid */}
                <CalendarGrid
                  courts={filteredCourts}
                  slots={slots}
                  reservations={filteredCalendarReservations}
                  selectedDate={date}
                  onSlotClick={(courtId, timeOrRange, date, sport) => {
                    if (Array.isArray(timeOrRange)) {
                      const start = timeOrRange[0];
                      const end = timeOrRange[timeOrRange.length - 1];
                      
                      // Calcular duración
                      const [sh, sm] = start.split(':').map(Number);
                      const [eh, em] = end.split(':').map(Number);
                      let mins = eh * 60 + em - (sh * 60 + sm) + 30; // +30 porque incluye el último slot
                      const h = Math.floor(mins / 60);
                      const m = mins % 60;
                      const duration = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;

                      setModalData({ 
                        date, 
                        time: start, 
                        courtId, 
                        sport, 
                        duration 
                      });
                    } else {
                      setModalData({ 
                        date, 
                        time: timeOrRange, 
                        courtId, 
                        sport, 
                        duration: '01:00' 
                      });
                    }
                    setModalOpen(true);
                  }}
                  onRefresh={handleRefetchAll}
                  currentUser={user}
                />
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Reservation Modal */}
        <ReservationFormModalNew
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          onSubmit={handleCreateReservation}
          onCancel={handleCancelReservation}
          initialData={modalData}
          reservations={filteredCalendarReservations}
          courts={courts}
        />
      </div>
    </ErrorBoundary>
  );
}
