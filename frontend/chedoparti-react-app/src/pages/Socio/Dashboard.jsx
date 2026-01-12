import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GraduationCap, Calendar as CalendarIcon, ChevronDown, ChevronUp, LayoutGrid, CalendarDays } from 'lucide-react';
import CalendarGrid from '../../components/ui/CalendarGrid';
import Card from '../../components/ui/Card';
import TableSkeleton from '../../components/ui/TableSkeleton';
import ErrorBoundary from '../../components/ErrorBoundary';
import ClassCard from '../../components/student/ClassCard';
import ReservationCard from '../../components/student/ReservationCard';
import DashboardFilters from '../../components/student/DashboardFilters';
import ReservationFormModalNew from '../../components/ui/ReservationFormModalNew';
import { courtsApi, institutionsApi } from '../../services/api';
import { useTranslation } from 'react-i18next';
import useAuth from '../../hooks/useAuth';
import { useAppNotifications } from '../../hooks/useAppNotifications';
import { getArgentinaDate, addDaysArgentina, formatArgentinaDateDisplay, isToday } from '../../utils/dateUtils';
import {
  generateTimeSlots,
  getDayOfWeekSpanish,
  getSlotInterval,
} from '../../services/institutionConfig';
import {
  useReservationsByDate,
  useCreateReservation,
  useCancelReservation,
} from '../../hooks/useReservationSync';
import { useStudentClasses, useAttendanceConfirmation } from '../../hooks/useStudentClasses';
import { useReservationWebSocket } from '../../hooks/useReservationWebSocket';

export default function SocioDashboard() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { reservation: notifications } = useAppNotifications();

  // View mode: 'calendar' or 'cards'
  const [dashboardView, setDashboardView] = useState('cards');
  
  // Estado local para UI controls
  const [date, setDate] = React.useState(() => {
    return getArgentinaDate();
  });
  const [sport, setSport] = React.useState('Padel');
  const [courts, setCourts] = React.useState([]);
  const [modalOpen, setModalOpen] = React.useState(false);
  const [modalData, setModalData] = React.useState(null);

  // Cards view state
  const [dateRange, setDateRange] = useState({
    start: getArgentinaDate(),
    end: addDaysArgentina(getArgentinaDate(), 7)
  });
  const [viewMode, setViewMode] = useState('weekly');
  const [filterType, setFilterType] = useState('all');
  const [showClasses, setShowClasses] = useState(true);
  const [showReservations, setShowReservations] = useState(true);

  // 🚀 Nuevos hooks para reservas con sincronización en tiempo real
  const {
    reservations,
    isLoading: reservationsLoading,
    refetch,
  } = useReservationsByDate(date);

  // Fetch classes
  const { classes, isLoading: classesLoading } = useStudentClasses(
    user?.id,
    dateRange.start,
    dateRange.end
  );

  // ✨ Hook para crear reservas con optimistic updates
  const createReservationMutation = useCreateReservation();
  const cancelReservationMutation = useCancelReservation();
  const { confirmAttendance } = useAttendanceConfirmation();

  // 📡 WebSocket para actualizaciones en tiempo real
  const isDemoMode = import.meta.env.VITE_API_BASE_URL?.includes('/api') || false;
  useReservationWebSocket({
    autoConnect: !isDemoMode,
    institutionId: user?.institutionId,
    userId: user?.id,
    onReservationUpdate: () => refetch(),
  });

  // Handler para cancelaciones - refrescar datos después de cancelar
  const handleCancelReservation = React.useCallback(async (reservation) => {
    try {
      await cancelReservationMutation.mutateAsync({ 
        id: reservation.id,
        reason: 'Cancelado por el usuario desde el dashboard'
      });
      notifications.cancelSuccess();
    } catch (error) {
      console.error('Error cancelling reservation:', error);
      notifications.cancelError(error.message);
    }
  }, [cancelReservationMutation, notifications]);

  // Attendance handlers
  const handleConfirmAttendance = async (classId) => {
    confirmAttendance(classId, 'confirmed');
  };

  const handleDeclineAttendance = async (classId) => {
    confirmAttendance(classId, 'declined');
  };

  const handleClassDetail = (classData) => {
    console.log('Class detail:', classData);
  };

  const handleReservationDetail = (reservation) => {
    setModalData(reservation);
    setModalOpen(true);
  };

  // Deportes disponibles
  const sports = React.useMemo(() => {
    const unique = new Set((courts || []).map((court) => court.sport || 'Padel'));
    const list = Array.from(unique);
    return list.length > 0 ? list : ['Padel'];
  }, [courts]);

  // Slots de horario dinámicos
  const slots = React.useMemo(() => {
    const dayOfWeek = getDayOfWeekSpanish(date);
    const interval = getSlotInterval();
    return generateTimeSlots(dayOfWeek, interval);
  }, [date]);

  // 🏟️ Cargar solo las canchas
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

  React.useEffect(() => {
    loadCourts();
  }, [loadCourts]);

  // 🔄 SINCRONIZACIÓN: Refrescar datos cuando la ventana obtiene el foco
  React.useEffect(() => {
    const handleFocus = () => refetch();
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [refetch]);

  // Filtrar canchas por deporte - memoizado
  const filteredCourts = React.useMemo(() => {
    return courts.filter((c) => c.sport === sport);
  }, [courts, sport]);

  // 🛡️ DEDUP RESERVATIONS: Evitar duplicados por optimistic updates
  const uniqueReservations = React.useMemo(() => {
    if (!reservations) return [];
    
    // Usar Map para dedup por ID
    const uniqueMap = new Map();
    
    reservations.forEach(r => {
      // Si tiene ID real, lo usamos. Si es temp, verificamos si ya existe uno real similar
      if (r.id) {
        uniqueMap.set(r.id, r);
      } else {
        // Es una reserva optimista o sin ID
        // Generar key basada en fecha/hora/cancha para detectar duplicados
        const key = `${r.date}-${r.startTime}-${r.courtId}`;
        // Solo agregar si no existe ya una reserva real en ese slot
        // (Esto es simplificado, idealmente chequearíamos overlap)
        uniqueMap.set(`temp-${key}`, r);
      }
    });

    return Array.from(uniqueMap.values());
  }, [reservations]);

  // Filtrar reservas activas - memoizado
  const filteredReservations = React.useMemo(() => {
    if (!uniqueReservations) return [];
    
    return uniqueReservations
      .filter((r) => {
        const matchesSport = r.sport === sport || !r.sport;
        const isActive = r.status !== 'cancelled' && r.status !== 'deleted';
        return matchesSport && isActive;
      });
  }, [uniqueReservations, sport]);

  // Filter for cards view
  const filteredClassesForCards = useMemo(() => {
    if (filterType === 'reservations') return [];
    return classes || [];
  }, [classes, filterType]);

  const filteredReservationsForCards = useMemo(() => {
    if (filterType === 'classes') return [];
    return uniqueReservations.filter(r => 
      r.status !== 'cancelled' && r.status !== 'deleted'
    );
  }, [uniqueReservations, filterType]);

  const handleSlotClick = (courtId, timeOrRange, date, sport, slotReservation) => {
    // Si el slot está ocupado, NO permitir editar (según requerimiento)
    if (slotReservation) {
      return;
    }

    // Si el slot está libre, permitir crear reserva
    if (Array.isArray(timeOrRange)) {
      const start = timeOrRange[0];
      const end = timeOrRange[timeOrRange.length - 1];
      setModalData({
        date,
        courtId,
        sport,
        time: start,
        duration: calcDuration(start, end),
        range: timeOrRange,
      });
    } else {
      setModalData({
        date,
        time: timeOrRange,
        courtId,
        sport,
        duration: '01:00',
      });
    }
    setModalOpen(true);
  };

  // Calcular duración entre dos slots (formato HH:MM)
  function calcDuration(start, end) {
    const [sh, sm] = start.split(':').map(Number);
    const [eh, em] = end.split(':').map(Number);
    let mins = eh * 60 + em - (sh * 60 + sm) + 30;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  }

  const durationStringToMinutes = (value) => {
    if (!value) return 60;
    if (typeof value === 'number') return value;
    const [hours, minutes] = value.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const buildEndDateTime = (date, time, duration) => {
    const minutes = durationStringToMinutes(duration);
    const [startHour, startMinute] = time.split(':').map(Number);
    const totalMinutes = startHour * 60 + startMinute + minutes;
    const endHour = Math.floor(totalMinutes / 60);
    const endMinute = totalMinutes % 60;
    const endDateTime = `${date}T${String(endHour).padStart(2, '0')}:${String(endMinute).padStart(2, '0')}:00`;
    return endDateTime;
  };

  const handleCreateReservation = async (form) => {
    if (!form?.date || !form?.time || !form?.courtId) {
      return;
    }

    try {
      const duration = form.duration || '01:00';
      const startAt = `${form.date}T${form.time}:00`;
      const endAt = buildEndDateTime(form.date, form.time, duration);

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

      await createReservationMutation.mutateAsync(payload);
      notifications.success();
      setModalOpen(false);
    } catch (error) {
      const message = error?.response?.data?.error || error?.message || 'No se pudo crear la reserva';
      console.error('❌ Reservation creation error:', error);
      notifications.error(message);
    }
  };

  // Helpers para fecha usando zona horaria de Argentina
  const today = getArgentinaDate();
  const dayText = formatArgentinaDateDisplay(date);

  const handlePrevDay = () => {
    setDate(addDaysArgentina(date, -1));
  };
  const handleNextDay = () => {
    setDate(addDaysArgentina(date, 1));
  };
  const handleToday = () => setDate(today);
  
  // Mostrar loading solo si no hay datos previos para evitar parpadeos
  if ((reservationsLoading && (!reservations || reservations.length === 0)) || !courts.length) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-navy dark:border-gold"></div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="p-4 md:p-8 min-h-screen pb-24 overflow-y-auto">
      <Card className="mb-6 md:mb-8 rounded-xl">
        <header className="mb-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold mb-1 text-navy dark:text-gold">
                {t('dashboard.welcome', { name: user?.name })}
              </h1>
              <p className="text-sm text-text-secondary dark:text-gold">
                Panel de Socio - {user?.membershipNumber ? `Socio #${user.membershipNumber}` : 'Bienvenido'}
              </p>
            </div>

            {/* View Toggle - Full width on mobile */}
            <div className="flex gap-2 w-full md:w-auto">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setDashboardView('cards')}
                className={`btn flex-1 md:flex-none justify-center ${dashboardView === 'cards' ? 'btn-primary' : 'btn-outline'} flex items-center gap-2`}
              >
                <LayoutGrid className="w-4 h-4" />
                <span>Cards</span>
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setDashboardView('calendar')}
                className={`btn flex-1 md:flex-none justify-center ${dashboardView === 'calendar' ? 'btn-primary' : 'btn-outline'} flex items-center gap-2`}
              >
                <CalendarDays className="w-4 h-4" />
                <span>Calendario</span>
              </motion.button>
            </div>
          </div>

          {dashboardView === 'calendar' && (
            <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
              {/* Selector de deporte */}
              <div className="flex flex-col justify-center items-center md:items-start w-full min-h-16">
                <label className="font-bold text-navy text-base dark:text-gold mb-1" htmlFor="sport">
                  {t('dashboard.sport_label')}
                </label>
                <select
                  id="sport"
                  name="sport"
                  value={sport}
                  onChange={(e) => setSport(e.target.value)}
                  className="input w-full transition-all"
                  required
                  disabled={reservationsLoading}
                >
                  {sports.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              {/* Controles de fecha */}
              <div className="flex flex-row flex-wrap items-center justify-center w-full gap-3 py-1 min-h-16">
                <button
                  type="button"
                  className="btn btn-outline px-3 py-2 text-base font-bold focus:ring-2 focus:ring-gold hover:ring-2 hover:ring-gold disabled:opacity-50"
                  style={{ minWidth: '36px', height: '40px' }}
                  onClick={handlePrevDay}
                  disabled={reservationsLoading}
                >
                  &#60;
                </button>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  disabled={reservationsLoading}
                  className="input text-base px-3 py-2 disabled:opacity-50"
                  style={{ width: '140px', height: '40px' }}
                />
                <button
                  type="button"
                  className={`btn px-4 py-2 text-base font-semibold focus:ring-2 focus:ring-gold hover:ring-2 hover:ring-gold ${
                    isToday(date) ? 'btn-primary' : 'btn-outline'
                  }`}
                  style={{ height: '40px' }}
                  onClick={handleToday}
                  disabled={reservationsLoading || isToday(date)}
                >
                  {t('dashboard.today_button')}
                </button>
                <button
                  type="button"
                  className="btn btn-outline px-3 py-2 text-base font-bold focus:ring-2 focus:ring-gold hover:ring-2 hover:ring-gold disabled:opacity-50"
                  style={{ minWidth: '36px', height: '40px' }}
                  onClick={handleNextDay}
                  disabled={reservationsLoading}
                >
                  &#62;
                </button>
                <span className="font-bold text-navy text-base self-center whitespace-nowrap dark:text-gold ml-2">
                  {dayText.charAt(0).toUpperCase() + dayText.slice(1)}
                </span>
              </div>

              {/* Botón crear reserva */}
              <div className="flex items-center justify-end w-full min-h-16">
                <button
                  type="button"
                  className="btn btn-primary px-5 py-2 text-base font-semibold w-full md:w-auto flex items-center justify-center gap-2 text-center"
                  style={{ minHeight: '40px' }}
                  onClick={() => {
                    const firstCourt = filteredCourts.length > 0 ? filteredCourts[0].id : null;
                    setModalData({
                      date,
                      sport,
                      courtId: firstCourt,
                      duration: '01:00',
                    });
                    setModalOpen(true);
                  }}
                >
                  <span className="flex items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    {t('dashboard.create_reservation')}
                  </span>
                </button>
              </div>
            </div>
          )}
        </header>
      </Card>

        {dashboardView === 'calendar' && (
          <div className="w-full overflow-x-auto mt-6">
            <Card className="rounded-xl">
              {reservationsLoading ? (
                <TableSkeleton rows={12} cols={filteredCourts.length || 4} />
              ) : filteredCourts.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 dark:text-gray-400 text-lg">
                    No hay canchas disponibles para {sport}
                  </p>
                </div>
              ) : (
                <CalendarGrid
                  courts={filteredCourts}
                  slots={slots}
                  reservations={filteredReservations}
                  selectedDate={date}
                  onSlotClick={handleSlotClick}
                  onRefresh={refetch}
                  currentUser={user}
                />
              )}
            </Card>
          </div>
        )}

      {/* Cards View */}
      {dashboardView === 'cards' && (
        <div className="space-y-6">
          {/* Quick Stats */}
          <Card className="rounded-xl">
            <div className="flex gap-6 justify-center">
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                  {filteredClassesForCards.length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Clases</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {filteredReservationsForCards.length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Reservas</div>
              </div>
            </div>
          </Card>

          {/* Filters */}
          <DashboardFilters
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            filterType={filterType}
            onFilterTypeChange={setFilterType}
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
          />

          {/* Reservations Section */}
          {filteredReservationsForCards.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              <button
                onClick={() => setShowReservations(!showReservations)}
                className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <CalendarIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
                  <h2 className="text-xl font-bold text-navy dark:text-gold">
                    Mis Reservas ({filteredReservationsForCards.length})
                  </h2>
                </div>
                <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                  {showReservations ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  <span>{showReservations ? 'Ocultar' : 'Mostrar'}</span>
                </div>
              </button>

              <AnimatePresence>
                {showReservations && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="grid grid-cols-1 lg:grid-cols-2 gap-4"
                  >
                    {filteredReservationsForCards.map(reservation => (
                      <ReservationCard
                        key={reservation.id}
                        reservation={reservation}
                        onCancel={handleCancelReservation}
                        onDetailClick={handleReservationDetail}
                      />
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* Classes Section */}
          {filteredClassesForCards.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              <button
                onClick={() => setShowClasses(!showClasses)}
                className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  <h2 className="text-xl font-bold text-navy dark:text-gold">
                    Mis Clases ({filteredClassesForCards.length})
                  </h2>
                </div>
                <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                  {showClasses ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  <span>{showClasses ? 'Ocultar' : 'Mostrar'}</span>
                </div>
              </button>

              <AnimatePresence>
                {showClasses && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="grid grid-cols-1 lg:grid-cols-2 gap-4"
                  >
                    {filteredClassesForCards.map(classData => (
                      <ClassCard
                        key={classData.id}
                        classData={classData}
                        onConfirm={handleConfirmAttendance}
                        onDecline={handleDeclineAttendance}
                        onDetailClick={handleClassDetail}
                      />
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* Empty State */}
          {filteredClassesForCards.length === 0 && filteredReservationsForCards.length === 0 && (
            <Card className="text-center py-12 rounded-xl">
              <div className="flex flex-col items-center gap-4">
                <div className="text-6xl">📅</div>
                <div>
                  <h3 className="text-xl font-bold text-navy dark:text-gold mb-2">
                    No hay actividades programadas
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    No tienes clases ni reservas para este período
                  </p>
                </div>
              </div>
            </Card>
          )}
        </div>
      )}

      <ReservationFormModalNew
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleCreateReservation}
        onCancel={handleCancelReservation}
        initialData={modalData}
        reservations={filteredReservations}
        courts={courts}
      />
      </div>
    </ErrorBoundary>
  );
}
