import React from 'react';
import CalendarGrid from '../../components/ui/CalendarGrid';
import Card from '../../components/ui/Card';
import ReservationFormModalNew from '../../components/ui/ReservationFormModalNew';
import { courtsApi, institutionsApi, reservationsApi } from '../../services/api';
import { useTranslation } from 'react-i18next';
import useAuth from '../../hooks/useAuth';
import { useAppNotifications } from '../../hooks/useAppNotifications';
import {
  generateTimeSlots,
  getDayOfWeekSpanish,
  getSlotInterval,
  subscribeInstitutionSchedule,
} from '../../services/institutionConfig';
import {
  useReservationsByDate,
  useReservationStats,
  useCreateReservation,
  useManualSync,
  useCancelReservation,
  useReservationSync,
} from '../../hooks/useReservationSync';
import { useReservationWebSocket } from '../../hooks/useReservationWebSocket';

export default function UnifiedDashboard() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { reservation: notifications, validation, showBatchResult } = useAppNotifications();

  // 🔐 Determinación de Roles
  const isAdmin = user?.role === 'INSTITUTION_ADMIN' || (user?.roles && user.roles.includes('INSTITUTION_ADMIN'));
  const isSocio = !isAdmin && (user?.role === 'SOCIO' || (user?.roles && user.roles.includes('SOCIO')));

  // Estado local para UI controls
  const [date, setDate] = React.useState(() => {
    const d = new Date();
    return d.toISOString().slice(0, 10);
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
    refetch,
  } = useReservationsByDate(date);

  // 📊 Estadísticas globales (Solo Admin)
  const {
    stats: globalStats,
    isLoading: statsLoading,
  } = useReservationStats();

  // 🔄 Sincronización manual (Solo Admin)
  const { syncAll } = useManualSync();

  // ✨ Hooks de mutación
  const createReservationMutation = useCreateReservation();
  const cancelReservationMutation = useCancelReservation();

  // 📡 WebSocket
  const isDemoMode = import.meta.env.VITE_API_BASE_URL?.includes('/api') || false;
  useReservationWebSocket({
    autoConnect: !isDemoMode,
    institutionId: user?.institutionId,
    userId: user?.id,
    onReservationUpdate: () => refetch(),
  });

  // Deportes disponibles
  const sports = React.useMemo(() => {
    const unique = new Set((courts || []).map((court) => court.sport || 'Padel'));
    const list = Array.from(unique);
    return list.length > 0 ? list : ['Padel'];
  }, [courts]);

  // Slots de horario
  const slots = React.useMemo(() => {
    const dayOfWeek = getDayOfWeekSpanish(date);
    const interval = getSlotInterval();
    const generatedSlots = generateTimeSlots(dayOfWeek, interval);
    
    if (!generatedSlots || generatedSlots.length === 0) {
      try {
        const schedule = window.localStorage.getItem('institution_schedule');
        console.warn('[CHEDOPARTI] No slots generated', { dayOfWeek, schedule });
      } catch (e) {
        console.warn('[CHEDOPARTI] No slots generated and config unreadable');
      }
    }
    return generatedSlots;
  }, [date, scheduleVersion]);

  // Listen for schedule changes (Admin)
  React.useEffect(() => {
    if (isAdmin) {
      const unsub = subscribeInstitutionSchedule(() => {
        setScheduleVersion((v) => v + 1);
      });
      return () => unsub && unsub();
    }
  }, [isAdmin]);

  // Helpers de tiempo
  const minutesToDuration = React.useCallback((minutes) => {
    const safeMinutes = Number.isFinite(minutes) ? Math.max(minutes, 30) : 60;
    const hours = Math.floor(safeMinutes / 60);
    const mins = safeMinutes % 60;
    return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
  }, []);

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
    return `${date}T${String(endHour).padStart(2, '0')}:${String(endMinute).padStart(2, '0')}:00`;
  };

  const calcDuration = (start, end) => {
    const [sh, sm] = start.split(':').map(Number);
    const [eh, em] = end.split(':').map(Number);
    let mins = eh * 60 + em - (sh * 60 + sm) + 30;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  };

  // Mapper de reservas
  const mapReservationToCalendar = React.useCallback(
    (reservation, availableCourts = courts) => {
      if (!reservation) return null;

      let date, time, durationMinutes;

      if (reservation.startAt && reservation.endAt) {
        date = reservation.startAt.slice(0, 10);
        time = reservation.startAt.slice(11, 16);
        const startTimeStr = reservation.startAt.slice(11, 19);
        const endTimeStr = reservation.endAt.slice(11, 19);
        const [startH, startM] = startTimeStr.split(':').map(Number);
        const [endH, endM] = endTimeStr.split(':').map(Number);
        const startMinutes = startH * 60 + startM;
        const endMinutes = endH * 60 + endM;
        durationMinutes = Math.max(1, endMinutes - startMinutes);
      } else {
        date = reservation.date || '';
        time = reservation.time || '';
        durationMinutes = 60;
      }

      const court = availableCourts.find((c) => String(c.id) === String(reservation.courtId));

      return {
        id: reservation.id,
        courtId: reservation.courtId,
        date,
        time,
        duration: minutesToDuration(durationMinutes),
        user: reservation.customerName || reservation.userName || 'Usuario',
        customerName: reservation.customerName || reservation.userName || 'Usuario',
        userPhone: reservation.userPhone,
        userEmail: reservation.userEmail,
        sport: court?.sport || 'Padel',
        type: reservation.type || reservation.status || 'Normal',
        price: reservation.totalAmount ?? 0,
        notes: reservation.notes || '',
        status: reservation.status,
        fixed: reservation.type === 'Fijo' || (reservation.notes && reservation.notes.includes('Turno Fijo')),
        userId: reservation.userId,
        membershipNumber: reservation.membershipNumber,
        isPrivateInfo: reservation.isPrivateInfo,
        displayIcon: reservation.displayIcon,
        displayBorderColor: reservation.displayBorderColor,
        raw: reservation,
      };
    },
    [courts, minutesToDuration]
  );

  // Cargar canchas
  const loadCourts = React.useCallback(async () => {
    try {
      let institutionId = 1;
      try {
        const institutionsResponse = await institutionsApi.list();
        const institutions = institutionsResponse?.data || [];
        if (institutions.length > 0) {
          institutionId = institutions[0].id;
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

  React.useEffect(() => {
    loadCourts();
    if (isAdmin) {
      syncAll(); // Sincronización inicial para admins
    }
  }, [loadCourts, isAdmin, syncAll]);

  // Sincronización al enfocar
  React.useEffect(() => {
    const handleFocus = () => refetch();
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [refetch]);

  // Sincronización por eventos
  useReservationSync(() => {
    refetch();
  });

  // Filtrado de datos
  const filteredCourts = courts.filter((c) => c.sport === sport);

  const allReservationsForDate = React.useMemo(() => {
    return (reservations || []).filter((r) => {
      return r.sport === sport || !r.sport;
    });
  }, [reservations, sport]);

  const filteredReservations = React.useMemo(() => {
    return allReservationsForDate
      .filter((r) => {
        const isActive = r.status !== 'cancelled' && r.status !== 'deleted';
        return isActive;
      })
      .map((r) => mapReservationToCalendar(r));
  }, [allReservationsForDate, mapReservationToCalendar]);

  // Handlers
  const handleSlotClick = (courtId, timeOrRange, date, sport, slotReservation) => {
    if (!user) return;

    // Slot libre: Ambos pueden crear
    if (!slotReservation) {
      const isRange = Array.isArray(timeOrRange);
      const start = isRange ? timeOrRange[0] : timeOrRange;
      const duration = isRange ? calcDuration(start, timeOrRange[timeOrRange.length - 1]) : '01:00';

      setModalData({
        date,
        courtId,
        sport,
        time: start,
        duration,
        range: isRange ? timeOrRange : undefined,
      });
      setModalOpen(true);
      return;
    }

    // Slot ocupado: Lógica por rol
    if (isAdmin) {
      // Admin edita todo
      setModalData({
        date,
        time: timeOrRange,
        courtId,
        sport,
        duration: slotReservation.duration || '01:00',
        ...slotReservation,
      });
      setModalOpen(true);
    } else if (isSocio) {
      // Socio solo ve detalles (o edita si es dueño, pero restringido por requerimiento)
      // Por ahora, no abrimos modal de edición para socios desde el click directo si está ocupado
      // (El CalendarGrid maneja el click en reserva existente abriendo ReservationInfoModal)
      return;
    }
  };

  const handleCreateReservation = async (form) => {
    if (!form?.date || !form?.time || !form?.courtId) {
      return;
    }

    try {
      // Lógica específica de ADMIN para turnos fijos
      if (isAdmin && form.fixed) {
        if (!form.fixedStart || !form.fixedEnd) {
          validation.dateRangeRequired();
          return;
        }
        if (!form.fixedDays || form.fixedDays.length === 0) {
          validation.daysSelectionRequired();
          return;
        }

        const startDate = new Date(form.fixedStart + 'T00:00:00');
        const endDate = new Date(form.fixedEnd + 'T00:00:00');

        if (endDate <= startDate) {
          validation.endDateAfterStart();
          return;
        }

        const selectedDays = form.fixedDays.map((day) =>
          typeof day === 'string' ? parseInt(day) : day
        );

        const createdReservations = [];
        const failedReservations = [];

        for (
          let currentDate = new Date(startDate);
          currentDate <= endDate;
          currentDate.setDate(currentDate.getDate() + 1)
        ) {
          const dayOfWeek = currentDate.getDay();
          if (selectedDays.includes(dayOfWeek)) {
            const dateStr = currentDate.toISOString().slice(0, 10);
            const duration = form.duration || '01:00';
            const startAt = `${dateStr}T${form.time}:00`;
            const endAt = buildEndDateTime(dateStr, form.time, duration);

            const payload = {
              user: form.selectedMember?.name || form.user,
              customerName: form.selectedMember?.name || form.user,
              userPhone: form.selectedMember?.phone,
              courtId: Number(form.courtId),
              startAt,
              endAt,
              source: 'admin',
              autoConfirm: true,
              notes: `${form.notes || ''} - Turno Fijo`.trim(),
              type: form.type || 'Normal',
              // Admin puede seleccionar socio
              userId: form.selectedMember?.id,
              membershipNumber: form.selectedMember?.membershipNumber,
            };

            try {
              const response = await reservationsApi.create(payload);
              createdReservations.push({ date: dateStr, response });
            } catch (error) {
              failedReservations.push({ date: dateStr, error: error.message });
            }
          }
        }

        showBatchResult({
          successful: createdReservations.length,
          failed: failedReservations.length,
          total: createdReservations.length + failedReservations.length,
          operationType: 'create',
          itemType: 'reservations',
        });
      } else {
        // Reserva Individual (Admin o Socio)
        const duration = form.duration || '01:00';
        const startAt = `${form.date}T${form.time}:00`;
        const endAt = buildEndDateTime(form.date, form.time, duration);

        const payload = {
          courtId: Number(form.courtId),
          startAt,
          endAt,
          source: isAdmin ? 'admin' : 'socio',
          autoConfirm: true,
          notes: form.notes || '',
          type: isAdmin ? (form.type || 'Normal') : 'Normal', // Socios siempre Normal
          // Datos de usuario - CORREGIDO: user debe ser string, no objeto
          user: isAdmin ? (form.selectedMember?.name || form.user) : user?.name,
          customerName: isAdmin ? (form.selectedMember?.name || form.user) : user?.name,
          userPhone: isAdmin ? form.selectedMember?.phone : user?.phone,
          userId: isAdmin ? form.selectedMember?.id : user?.id,
          membershipNumber: isAdmin ? form.selectedMember?.membershipNumber : user?.membershipNumber,
        };

        await createReservationMutation.mutateAsync(payload);
        notifications.success();
      }

      setModalOpen(false);
    } catch (error) {
      const message = error?.response?.data?.error || error?.message || 'No se pudo crear la reserva';
      console.error('❌ Reservation creation error:', error);
      notifications.error(message);
    }
  };

  const handleCancelReservation = React.useCallback(async (reservation) => {
    try {
      await cancelReservationMutation.mutateAsync({ 
        id: reservation.id,
        reason: isAdmin ? 'Cancelado por administrador' : 'Cancelado por el usuario'
      });
      notifications.cancelSuccess();
    } catch (error) {
      console.error('Error cancelling reservation:', error);
      notifications.cancelError(error.message);
    }
  }, [cancelReservationMutation, notifications, isAdmin]);

  const handleDeleteReservation = React.useCallback(
    async (reservation) => {
      if (!reservation?.id) return;
      // Reutilizamos la lógica de cancelación
      await handleCancelReservation(reservation);
    },
    [handleCancelReservation]
  );

  // Helpers de navegación
  const today = new Date().toISOString().slice(0, 10);
  const dateObj = date ? new Date(date + 'T00:00:00') : new Date();
  const dayText = dateObj.toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const handlePrevDay = () => {
    const prev = new Date(dateObj);
    prev.setDate(prev.getDate() - 1);
    setDate(prev.toISOString().slice(0, 10));
  };
  const handleNextDay = () => {
    const next = new Date(dateObj);
    next.setDate(next.getDate() + 1);
    setDate(next.toISOString().slice(0, 10));
  };
  const handleToday = () => setDate(today);

  // Loading State
  if ((reservationsLoading && (!reservations || reservations.length === 0)) || !courts.length) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-navy dark:border-gold"></div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
      <Card className="mb-8 rounded-xl">
        <header className="mb-4">
          <h1 className="text-2xl md:text-3xl font-bold mb-1 text-navy dark:text-gold">
            {isAdmin ? t('app.title') : t('dashboard.welcome', { name: user?.name })}
          </h1>
          <p className="text-sm text-text-secondary dark:text-gold">
            {isAdmin 
              ? t('dashboard.subtitle') 
              : `Panel de Socio - ${user?.membershipNumber ? `Socio #${user.membershipNumber}` : 'Bienvenido'}`
            }
          </p>
        </header>

        <div className="w-full flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Selector de Deporte */}
          <div className="w-full md:w-64">
             <label className="block md:hidden font-bold text-navy text-base dark:text-gold mb-1" htmlFor="sport">
               {t('dashboard.sport_label')}
             </label>
            <select
              id="sport"
              name="sport"
              value={sport}
              onChange={(e) => setSport(e.target.value)}
              className="input w-full h-12 md:h-10 text-base"
              required
            >
              {sports.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* Navegador de Fecha */}
          <div className="w-full md:w-auto flex flex-col md:flex-row items-center gap-3">
            <div className="flex items-center justify-between w-full md:w-auto gap-2 bg-white dark:bg-gray-800 p-1 rounded-xl border-2 border-navy/10 dark:border-gold/20 shadow-sm">
              <button
                type="button"
                className="btn btn-ghost p-2 h-10 w-10 flex items-center justify-center rounded-lg text-navy dark:text-gold hover:bg-navy/5 dark:hover:bg-gold/10 transition-colors"
                onClick={handlePrevDay}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              <div className="flex items-center gap-2 px-2 border-x border-navy/10 dark:border-gold/20">
                <button
                  type="button"
                  className="text-sm font-bold px-3 py-1.5 rounded-md text-navy dark:text-gold hover:bg-navy/5 dark:hover:bg-gold/10 transition-colors uppercase tracking-wide"
                  onClick={handleToday}
                >
                  {t('dashboard.today_button')}
                </button>
                <div className="relative">
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="bg-transparent border-none focus:ring-0 p-0 text-sm font-bold text-navy dark:text-gold w-32 cursor-pointer text-center"
                  />
                </div>
              </div>

              <button
                type="button"
                className="btn btn-ghost p-2 h-10 w-10 flex items-center justify-center rounded-lg text-navy dark:text-gold hover:bg-navy/5 dark:hover:bg-gold/10 transition-colors"
                onClick={handleNextDay}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
            
            <span className="md:hidden text-lg font-bold text-navy dark:text-gold capitalize mt-1">
              {dayText}
            </span>
          </div>

          {/* Botón de Acción */}
          <div className="w-full md:w-auto">
            <button
              id="main-create-btn"
              type="button"
              className="btn btn-primary w-full md:w-auto h-12 md:h-10 px-6 text-base font-semibold flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all"
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
            </button>
          </div>
        </div>
      </Card>

      <div className="w-full overflow-x-auto mt-6">
        <Card className="rounded-xl">
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
        </Card>
      </div>

      {isAdmin && (
        <FloatingCreateButton
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
  );
}

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
