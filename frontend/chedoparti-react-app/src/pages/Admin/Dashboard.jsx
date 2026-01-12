import React from 'react';
import CalendarGrid from '../../components/ui/CalendarGrid';
import Card from '../../components/ui/Card';
import TableSkeleton from '../../components/ui/TableSkeleton';
import ErrorBoundary from '../../components/ErrorBoundary';
import ReservationFormModalNew from '../../components/ui/ReservationFormModalNew';
import { reservationsApi, courtsApi, institutionsApi } from '../../services/api';
import { useTranslation } from 'react-i18next';
import { useReservationSync } from '../../utils/reservationSync';
import useAuth from '../../hooks/useAuth';
import { useAppNotifications } from '../../hooks/useAppNotifications';
import { getArgentinaDate, addDaysArgentina, formatArgentinaDateDisplay, isToday } from '../../utils/dateUtils';
import {
  generateTimeSlots,
  getDayOfWeekSpanish,
  getSlotInterval,
  subscribeInstitutionSchedule,
} from '../../services/institutionConfig';
// 🚀 Nuevos hooks para sincronización en tiempo real
import {
  useReservationsByDate,
  useReservationStats,
  useReservationsSync,
  useCreateReservation,
  useManualSync,
  useCancelReservation,
  useUpdateReservation,
} from '../../hooks/useReservationSync';
import { invalidateReservations } from '../../store/queryClient';
import { useReservationWebSocket } from '../../hooks/useReservationWebSocket';

export default function AdminDashboard() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { reservation: notifications, validation, showBatchResult } = useAppNotifications();

  // Estado local para UI controls
  const [date, setDate] = React.useState(() => {
    return getArgentinaDate();
  });
  const [sport, setSport] = React.useState('Padel');
  const [courts, setCourts] = React.useState([]);
  const [modalOpen, setModalOpen] = React.useState(false);
  const [modalData, setModalData] = React.useState(null);
  const [loadError, setLoadError] = React.useState(null);
  const [scheduleVersion, setScheduleVersion] = React.useState(0);


  // 🚀 Nuevos hooks para reservas con sincronización en tiempo real
  const {
    reservations,
    isLoading: reservationsLoading,
    stats: liveStats,
    error: reservationsError,
    refetch,
  } = useReservationsByDate(date);

  // 📊 Estadísticas globales en tiempo real
  const {
    stats: globalStats,
    occupancyRate,
    cancellationRate,
    isLoading: statsLoading,
  } = useReservationStats();

  // 🔄 Sincronización manual (pull-to-refresh)
  const { syncAll, isLoading: syncLoading } = useManualSync();

  // 🚫 Hook para cancelar/eliminar reservas con optimistic updates
  const cancelReservationMutation = useCancelReservation();

  // ✨ Hook para crear reservas con optimistic updates
  const createReservationMutation = useCreateReservation();

  // 📡 WebSocket para actualizaciones en tiempo real (solo si no estamos en modo demo)
  const isDemoMode = import.meta.env.VITE_API_BASE_URL?.includes('/api') || false;
  const { isConnected: wsConnected } = useReservationWebSocket({
    autoConnect: !isDemoMode, // No conectar automáticamente en modo demo
    institutionId: user?.institutionId,
    userId: user?.id,
    onReservationUpdate: (data) => {},
    onConnectionChange: (status) => {
      if (!isDemoMode) {
      }
    },
  });

  // Estado de carga combinado
  const isLoading = reservationsLoading || statsLoading;

  // Deportes disponibles
  const sports = React.useMemo(() => {
    const unique = new Set((courts || []).map((court) => court.sport || 'Padel'));
    const list = Array.from(unique);
    return list.length > 0 ? list : ['Padel'];
  }, [courts]);

  // Slots de horario dinámicos basados en configuración de la institución
  const slots = React.useMemo(() => {
    const dayOfWeek = getDayOfWeekSpanish(date);
    const interval = getSlotInterval();
    const generatedSlots = generateTimeSlots(dayOfWeek, interval);
    // Validación extra: si no hay slots, mostrar advertencia en consola
    if (!generatedSlots || generatedSlots.length === 0) {
      // Mostrar la configuración actual para debugging
      try {
        const schedule = window.localStorage.getItem('institution_schedule');
        console.warn(
          '[CHEDOPARTI] No se generaron slots para',
          dayOfWeek,
          'con config:',
          schedule ? JSON.parse(schedule) : '(default)'
        );
      } catch (e) {
        console.warn('[CHEDOPARTI] No se generaron slots y no se pudo leer la config de horarios');
      }
    }
    return generatedSlots;
  }, [date, scheduleVersion]);

  // Listen for schedule changes (e.g., from Schedules panel) and bump version
  React.useEffect(() => {
    const unsub = subscribeInstitutionSchedule((newSchedule) => {
      setScheduleVersion((v) => v + 1);
    });
    return () => unsub && unsub();
  }, []);

  const minutesToDuration = React.useCallback((minutes) => {
    const safeMinutes = Number.isFinite(minutes) ? Math.max(minutes, 30) : 60;
    const hours = Math.floor(safeMinutes / 60);
    const mins = safeMinutes % 60;
    return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
  }, []);

  const mapReservationToCalendar = React.useCallback(
    (reservation, availableCourts = courts) => {
      if (!reservation) return null;

      // En lugar de crear objetos Date que pueden cambiar zonas horarias,
      // trabajamos directamente con los strings ISO
      let date, time, durationMinutes;

      if (reservation.startAt && reservation.endAt) {
        // Extraer fecha y hora directamente del string ISO
        date = reservation.startAt.slice(0, 10); // YYYY-MM-DD
        time = reservation.startAt.slice(11, 16); // HH:MM

        // Calcular duración directamente desde los strings ISO sin conversión de zona horaria
        const startTimeStr = reservation.startAt.slice(11, 19); // HH:MM:SS
        const endTimeStr = reservation.endAt.slice(11, 19); // HH:MM:SS

        const [startH, startM] = startTimeStr.split(':').map(Number);
        const [endH, endM] = endTimeStr.split(':').map(Number);

        const startMinutes = startH * 60 + startM;
        const endMinutes = endH * 60 + endM;

        durationMinutes = Math.max(1, endMinutes - startMinutes);
      } else {
        // Fallback a datos legacy
        date = reservation.date || '';
        time = reservation.time || '';
        durationMinutes = 60; // Default 1 hora
      }

      const court = availableCourts.find((c) => String(c.id) === String(reservation.courtId));

      const mappedReservation = {
        id: reservation.id,
        courtId: reservation.courtId,
        date,
        time,
        duration: minutesToDuration(durationMinutes),
        user: reservation.userPhone || reservation.userName || 'Sin datos',
        sport: court?.sport || 'Padel',
        type: reservation.type || reservation.status || 'Normal',
        price: reservation.totalAmount ?? 0,
        notes: reservation.notes || '',
        status: reservation.status,
        // ✅ Incluir indicador de turno fijo
        fixed: reservation.type === 'Fijo' || (reservation.notes && reservation.notes.includes('Turno Fijo')),
        // ✅ Incluir campos de ownership para validación de acceso
        userId: reservation.userId,
        membershipNumber: reservation.membershipNumber,
        // ✅ Incluir información visual para reservas privadas
        isPrivateInfo: reservation.isPrivateInfo,
        displayIcon: reservation.displayIcon,
        displayBorderColor: reservation.displayBorderColor,
        raw: reservation,
      };

      return mappedReservation;
    },
    [courts, minutesToDuration]
  );
  // 🏟️ Cargar solo las canchas (reservas se manejan con hooks de sincronización)
  const loadCourts = React.useCallback(async () => {
    try {
      // First, get institutions to find the default one
      let institutionId = 1; // Default fallback
      try {
        const institutionsResponse = await institutionsApi.list();
        const institutions = institutionsResponse?.data || [];
        if (institutions.length > 0) {
          institutionId = institutions[0].id; // Use first institution
        }
      } catch (error) {
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
      setLoadError(null);
    } catch (error) {
      setCourts([]);
      setLoadError('dashboard.load_error');
    }
  }, []);

  // 🔄 Función de refresh combinada (canchas + reservas)
  const refreshData = React.useCallback(async () => {
    // Cargar canchas y sincronizar reservas en paralelo
    await Promise.all([
      loadCourts(),
      syncAll(), // Sincronizar reservas usando el nuevo sistema
    ]);
  }, [loadCourts, syncAll]);

  // 🚀 Cargar canchas al montar (reservas se cargan automáticamente con hooks)
  React.useEffect(() => {
    loadCourts();
  }, [loadCourts]);

  // 🔄 SINCRONIZACIÓN: Refrescar datos cuando la ventana obtiene el foco
  // Útil cuando el usuario regresa desde "Mis Reservas" u otra pestaña
  React.useEffect(() => {
    const handleFocus = () => {
      refetch();
    };
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        refetch();
      }
    };
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [refetch]);

  // 🔄 SINCRONIZACIÓN: Escuchar cambios de reservas desde otros componentes
  useReservationSync((event) => {
    refetch();
  });

  // Filtrar canchas por deporte - memoizado para evitar re-renders
  const filteredCourts = React.useMemo(() => {
    return courts.filter((c) => c.sport === sport);
  }, [courts, sport]);

  // 🚀 Usar reservas sincronizadas en tiempo real (ya filtradas por fecha)
  // Filtrar por deporte seleccionado
  const allReservationsForDate = React.useMemo(() => {
    if (!reservations) return [];
    
    return reservations.filter((r) => {
      // Filtrar por deporte - debe coincidir exactamente o no tener deporte asignado
      const matchesSport = r.sport === sport || !r.sport;
      return matchesSport;
    });
  }, [reservations, sport]);

  const filteredReservations = React.useMemo(() => {
    return allReservationsForDate
      .filter((r) => {
        // Excluir reservas canceladas para liberar los spots
        const isActive = r.status !== 'cancelled' && r.status !== 'deleted';

        if (!isActive) {
        }

        return isActive;
      })
      .map((r) => mapReservationToCalendar(r));
  }, [allReservationsForDate, mapReservationToCalendar]);

  const isAdmin = user?.role === 'INSTITUTION_ADMIN' || (user?.roles && user.roles.includes('INSTITUTION_ADMIN'));

  const handleSlotClick = (courtId, timeOrRange, date, sport, slotReservation) => {
    // Si el usuario no está cargado, nunca permitir editar ni crear
    if (!user) return;
    // If slot is free (no reservation), allow any user to open modal to create
    if (!slotReservation) {
      if (Array.isArray(timeOrRange)) {
        const start = timeOrRange[0];
        const end = timeOrRange[timeOrRange.length - 1];
        const modalData = {
          date,
          courtId,
          sport,
          time: start,
          duration: calcDuration(start, end),
          range: timeOrRange,
        };
        setModalData(modalData);
      } else {
        const modalData = {
          date,
          time: timeOrRange,
          courtId,
          sport,
          duration: '01:00',
        };
        setModalData(modalData);
      }
      setModalOpen(true);
      return;
    }
    // If slot is occupied, only ADMIN or owning SOCIO can open modal
    if (isAdmin) {
      // ADMIN can always edit
      const modalData = {
        date,
        time: timeOrRange,
        courtId,
        sport,
        duration: slotReservation.duration || '01:00',
        ...slotReservation,
      };
      setModalData(modalData);
      setModalOpen(true);
      return;
    }
    if (user?.role === 'SOCIO' || (user?.roles && user.roles.includes('SOCIO'))) {
      const isOwner =
        (slotReservation.userId && user.id && String(slotReservation.userId) === String(user.id)) ||
        (slotReservation.userId &&
          user.email &&
          String(slotReservation.userId) === String(user.email)) ||
        (slotReservation.membershipNumber &&
          user.membershipNumber &&
          String(slotReservation.membershipNumber) === String(user.membershipNumber));
      if (isOwner) {
        const modalData = {
          date,
          time: timeOrRange,
          courtId,
          sport,
          duration: slotReservation.duration || '01:00',
          ...slotReservation,
        };
        setModalData(modalData);
        setModalOpen(true);
      }
      // Si no es dueño, nunca puede editar
      return;
    }
    // Si no es ADMIN ni SOCIO dueño, nunca puede editar
    return;
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

    // Asegurar que las fechas se traten como zona horaria local
    const endDateTime = `${date}T${String(endHour).padStart(2, '0')}:${String(endMinute).padStart(2, '0')}:00`;

    return endDateTime;
  };

  const handleCreateReservation = async (form) => {
    if (!form?.date || !form?.time || !form?.courtId) {
      console.warn('⚠️ Missing required fields:', {
        date: form?.date,
        time: form?.time,
        courtId: form?.courtId,
      });
      return;
    }

    try {
      if (form.fixed) {
        // Validar campos específicos de turnos fijos
        if (!form.fixedStart || !form.fixedEnd) {
          validation.dateRangeRequired();
          return;
        }

        if (!form.fixedDays || form.fixedDays.length === 0) {
          validation.daysSelectionRequired();
          return;
        }

        const createdReservations = [];
        const failedReservations = [];
        // Validar que la fecha de fin sea posterior a la de inicio
        const startDate = new Date(form.fixedStart + 'T00:00:00');
        const endDate = new Date(form.fixedEnd + 'T00:00:00');

        if (endDate <= startDate) {
          validation.endDateAfterStart();
          return;
        }

        // Convertir días a números si vienen como strings
        const selectedDays = form.fixedDays.map((day) =>
          typeof day === 'string' ? parseInt(day) : day
        );

        // Iterar cada día entre las fechas
        for (
          let currentDate = new Date(startDate);
          currentDate <= endDate;
          currentDate.setDate(currentDate.getDate() + 1)
        ) {
          const dayOfWeek = currentDate.getDay(); // 0=domingo, 1=lunes, etc.

          // Solo crear reserva si el día de la semana está seleccionado
          if (selectedDays.includes(dayOfWeek)) {
            const dateStr = currentDate.toISOString().slice(0, 10);
            const duration = form.duration || '01:00';
            const startAt = `${dateStr}T${form.time}:00`;
            const endAt = buildEndDateTime(dateStr, form.time, duration);

            const payload = {
              user: { phone: form.user || '' },
              courtId: Number(form.courtId),
              startAt,
              endAt,
              source: 'admin',
              autoConfirm: true,
              notes: `${form.notes || ''} - Turno Fijo`.trim(),
              type: form.type || 'Normal',
            };

            try {
              // ✅ Usar el hook para cada reserva del turno fijo
              const response = await createReservationMutation.mutateAsync(payload);
              createdReservations.push({
                date: dateStr,
                day: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'][dayOfWeek],
                response,
              });
            } catch (error) {
              console.error(`❌ Error creating reservation for ${dateStr}:`, error);
              failedReservations.push({
                date: dateStr,
                day: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'][dayOfWeek],
                error: error?.response?.data?.error || error.message,
              });
            }
          }
        }

        // Mostrar resultado detallado
        const totalAttempts = createdReservations.length + failedReservations.length;

        showBatchResult({
          successful: createdReservations.length,
          failed: failedReservations.length,
          total: totalAttempts,
          operationType: 'create',
          itemType: 'reservations',
        });
      } else {
        // 📅 Crear reserva individual (lógica original)

        const duration = form.duration || '01:00';
        const startAt = `${form.date}T${form.time}:00`;
        const endAt = buildEndDateTime(form.date, form.time, duration);

        const payload = {
          user: { phone: form.user || '' },
          courtId: Number(form.courtId),
          startAt,
          endAt,
          source: 'admin',
          autoConfirm: true,
          notes: form.notes || '',
          type: form.type || 'Normal',
        };

        // Usar el hook que incluye optimistic updates y cache invalidation
        const response = await createReservationMutation.mutateAsync(payload);

        notifications.success();
      }

      setModalOpen(false);
      // No need for manual refresh - mutations handle cache invalidation automatically
    } catch (error) {
      const message =
        error?.response?.data?.error || error?.message || 'No se pudo crear la reserva';
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

  // 🚫 Handler para eliminar reserva con optimistic updates
  const handleDeleteReservation = React.useCallback(
    async (reservation) => {
      if (!reservation?.id) return;

      try {
        // Usar el hook de cancelación que incluye optimistic updates
        await cancelReservationMutation.mutateAsync({
          id: reservation.id,
          reason: 'Cancelled from dashboard',
        });
      } catch (error) {
        console.error('❌ Failed to cancel reservation:', error);
        notifications.cancelError(error.message || 'Error desconocido');
      }
    },
    [cancelReservationMutation, notifications]
  );

  // Handler para cancelaciones desde el modal - refrescar datos después de cancelar
  const handleCancelReservation = React.useCallback(async (reservation) => {
    try {
      await cancelReservationMutation.mutateAsync({ 
        id: reservation.id,
        reason: 'Cancelado por administrador desde el dashboard'
      });
      // La invalidación ya la maneja el hook useCancelReservation
      notifications.cancelSuccess();
    } catch (error) {
      console.error('Error cancelling reservation:', error);
      notifications.cancelError(error.message);
    }
  }, [cancelReservationMutation, notifications]);

  return (
    <ErrorBoundary>
      <div className="p-4 md:p-8">
        <Card className="mb-8 rounded-xl">
          <header className="mb-4">
            <h1 className="text-2xl md:text-3xl font-bold mb-1 text-navy dark:text-gold">
              {t('app.title')}
            </h1>
            <p className="text-sm text-text-secondary dark:text-gold">{t('dashboard.subtitle')}</p>
          </header>

          {/* Error state */}
          {loadError && (
            <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-800 dark:text-red-200 text-sm">
                {t(loadError)}
              </p>
            </div>
          )}

          {/* Toolbar de controles */}
          <div className="w-full flex flex-col md:flex-row items-center justify-between gap-4">
            
            {/* 1. Selector de Deporte */}
            <div className="w-full md:w-64">
              <select
                id="sport"
                name="sport"
                value={sport}
                onChange={(e) => {
                  const newSport = e.target.value;
                  setSport(newSport);
                  // Forzar re-render de slots cuando cambia el deporte
                  setScheduleVersion(v => v + 1);
                }}
                className="input w-full h-12 md:h-10 text-base transition-all"
                required
                disabled={isLoading}
              >
                <option value="" disabled>
                  {t('dashboard.sport_placeholder')}
                </option>
                {sports.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            {/* 2. Navegador de Fecha */}
            <div className="w-full md:w-auto flex flex-col md:flex-row items-center gap-3">
              {/* Controles de fecha */}
              <div className="flex items-center justify-between w-full md:w-auto gap-2 bg-white dark:bg-gray-800 p-1 rounded-xl border-2 border-navy/10 dark:border-gold/20 shadow-sm">
                <button
                  type="button"
                  className="btn btn-ghost p-2 h-10 w-10 flex items-center justify-center rounded-lg text-navy dark:text-gold hover:bg-navy/5 dark:hover:bg-gold/10 transition-colors disabled:opacity-50"
                  onClick={handlePrevDay}
                  disabled={isLoading}
                  aria-label="Día anterior"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                
                <div className="flex items-center gap-2 px-2 border-x border-navy/10 dark:border-gold/20">
                  <button
                    type="button"
                    className={`text-sm font-bold px-3 py-1.5 rounded-md transition-colors uppercase tracking-wide ${
                      isToday(date)
                        ? 'bg-navy dark:bg-gold text-white dark:text-navy'
                        : 'text-navy dark:text-gold hover:bg-navy/5 dark:hover:bg-gold/10'
                    }`}
                    onClick={handleToday}
                    disabled={isLoading || isToday(date)}
                  >
                    {t('dashboard.today_button')}
                  </button>
                  <div className="relative">
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      disabled={isLoading}
                      className="bg-transparent border-none focus:ring-0 p-0 text-sm font-bold text-navy dark:text-gold w-32 cursor-pointer text-center disabled:opacity-50"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  className="btn btn-ghost p-2 h-10 w-10 flex items-center justify-center rounded-lg text-navy dark:text-gold hover:bg-navy/5 dark:hover:bg-gold/10 transition-colors disabled:opacity-50"
                  onClick={handleNextDay}
                  disabled={isLoading}
                  aria-label="Día siguiente"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
              
              {/* Texto de fecha (visible en mobile para claridad) */}
              <span className="md:hidden text-lg font-bold text-navy dark:text-gold capitalize mt-1">
                {dayText}
              </span>
            </div>

            {/* 3. Botón de Acción */}
            <div className="w-full md:w-auto">
              <button
                id="main-create-btn"
                type="button"
                className="btn btn-primary w-full md:w-auto h-12 md:h-10 px-6 text-base font-semibold flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all disabled:opacity-50"
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
                disabled={isLoading || filteredCourts.length === 0}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                {t('dashboard.create_reservation')}
              </button>
            </div>
          </div>
        </Card>

        <div className="w-full overflow-x-auto mt-6">
          <Card className="rounded-xl">
            {isLoading ? (
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
                onDeleteReservation={handleDeleteReservation}
                onRefresh={refetch}
                currentUser={user}
              />
            )}
          </Card>
        </div>

      {/* Botón flotante de Crear Reserva */}
      {isAdmin && (
        <FloatingCreateButton
          onClick={() => {
            const firstCourt = filteredCourts.length > 0 ? filteredCourts[0].id : null;
            setModalData({
              date,
              sport,
              courtId: firstCourt,
              duration: '01:00', // Duración por defecto
            });
            setModalOpen(true);
          }}
        />
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

// Botón flotante que aparece cuando el principal no está visible
function FloatingCreateButton({ onClick }) {
  const [show, setShow] = React.useState(false);
  React.useEffect(() => {
    function checkVisibility() {
      const mainBtn = document.getElementById('main-create-btn');
      if (!mainBtn) return setShow(true);
      const rect = mainBtn.getBoundingClientRect();
      setShow(rect.bottom < 0 || rect.top > window.innerHeight);
    }
    window.addEventListener('scroll', checkVisibility);
    checkVisibility();
    return () => window.removeEventListener('scroll', checkVisibility);
  }, []);
  if (!show) return null;
  return (
    <button
      type="button"
      className="fixed bottom-6 right-6 z-50 btn btn-primary rounded-full shadow-lg px-5 py-3 flex items-center gap-2 text-base font-semibold"
      style={{ minHeight: '48px' }}
      onClick={onClick}
    >
      <span className="flex items-center gap-2">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Crear Reserva
      </span>
    </button>
  );
}
