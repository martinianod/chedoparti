import React, { useState, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import Card from '../../../components/ui/Card';
import CalendarGrid from '../../../components/ui/CalendarGrid';
import ReservationFormModalNew from '../../../components/ui/ReservationFormModalNew';
import useAuth from '../../../hooks/useAuth';
import { useAppNotifications } from '../../../hooks/useAppNotifications';
import { courtsApi, institutionsApi } from '../../../services/api';
import { 
  getArgentinaDate, 
  addDaysArgentina, 
  formatArgentinaDateDisplay 
} from '../../../utils/dateUtils';
import {
  useReservationsByDate,
  useCreateReservation,
  useCancelReservation,
} from '../../../hooks/useReservationSync';
import {
  generateTimeSlots,
  getDayOfWeekSpanish,
  getSlotInterval,
} from '../../../services/institutionConfig';
import { useReservationWebSocket } from '../../../hooks/useReservationWebSocket';

/**
 * Coach Schedule View
 * Replaces WeeklySchedule with a Daily Calendar Grid view
 * allowing Coaches to see court occupancy and manage reservations/classes
 */
export default function CoachSchedule() {
  const { user } = useAuth();
  const { reservation: notifications } = useAppNotifications();

  // State
  const [date, setDate] = useState(() => getArgentinaDate());
  const [sport, setSport] = useState('Padel');
  const [courts, setCourts] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState(null);

  // 🔄 Data Fetching & Sync
  const {
    reservations,
    isLoading: reservationsLoading,
    refetch,
  } = useReservationsByDate(date);

  const createReservationMutation = useCreateReservation();
  const cancelReservationMutation = useCancelReservation();

  // 📡 WebSocket for real-time updates
  const isDemoMode = import.meta.env.VITE_API_BASE_URL?.includes('/api') || false;
  useReservationWebSocket({
    autoConnect: !isDemoMode,
    institutionId: user?.institutionId,
    userId: user?.id,
    onReservationUpdate: () => refetch(),
  });

  // Load courts
  React.useEffect(() => {
    const loadCourts = async () => {
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
        
        // Normalize courts
        const normalizedCourts = rawCourts.map((court) => ({
          ...court,
          sport: court?.sport || 'Padel',
        }));
        setCourts(normalizedCourts);
      } catch {
        setCourts([]);
      }
    };

    loadCourts();
  }, []);

  // Filter courts by sport
  const filteredCourts = useMemo(() => 
    courts.filter((c) => c.sport === sport),
  [courts, sport]);

  // Generate time slots
  const slots = useMemo(() => {
    const dayOfWeek = getDayOfWeekSpanish(date);
    const interval = getSlotInterval();
    return generateTimeSlots(dayOfWeek, interval);
  }, [date]);

  // Handlers
  const handlePrevDay = () => setDate(addDaysArgentina(date, -1));
  const handleNextDay = () => setDate(addDaysArgentina(date, 1));
  const handleToday = () => setDate(getArgentinaDate());

  const handleSlotClick = (courtId, timeOrRange, date, sport, slotReservation) => {
    // If slot is occupied, CalendarGrid handles the click to show details
    if (slotReservation) return;

    // Prepare new reservation data
    let newReservation = {
      date,
      courtId,
      sport,
      type: 'Clase', // Default to Class for Coach
    };

    if (Array.isArray(timeOrRange)) {
      const start = timeOrRange[0];
      const end = timeOrRange[timeOrRange.length - 1];
      newReservation = {
        ...newReservation,
        time: start,
        duration: calcDuration(start, end),
      };
    } else {
      newReservation = {
        ...newReservation,
        time: timeOrRange,
        duration: '01:00',
      };
    }

    setModalData(newReservation);
    setModalOpen(true);
  };

  // Helper: Calculate duration
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
    return `${date}T${String(endHour).padStart(2, '0')}:${String(endMinute).padStart(2, '0')}:00`;
  };

  const handleCreateReservation = async (form) => {
    if (!form?.date || !form?.time || !form?.courtId) return;

    try {
      const duration = form.duration || '01:00';
      const startAt = `${form.date}T${form.time}:00`;
      const endAt = buildEndDateTime(form.date, form.time, duration);

      const payload = {
        ...form,
        startAt,
        endAt,
        source: 'coach_dashboard',
        autoConfirm: true,
      };

      await createReservationMutation.mutateAsync(payload);
      notifications.success('Reserva creada exitosamente');
      setModalOpen(false);
    } catch (error) {
      console.error('Error creating reservation:', error);
      notifications.error(error.message || 'Error al crear la reserva');
    }
  };

  const handleCancelReservation = async (reservation) => {
    try {
      await cancelReservationMutation.mutateAsync({
        id: reservation.id,
        reason: 'Cancelado por el entrenador'
      });
      notifications.success('Reserva cancelada exitosamente');
      setModalOpen(false);
    } catch (error) {
      console.error('Error cancelling reservation:', error);
      notifications.error(error.message || 'Error al cancelar la reserva');
    }
  };

  const dayText = formatArgentinaDateDisplay(date);

  if (reservationsLoading && !reservations && !courts.length) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-navy dark:border-gold" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
      {/* Header */}
      <Card className="mb-6">
        <div className="flex flex-col gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-navy dark:text-gold mb-1">
              Horarios de Clases
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Gestiona tus clases y reservas personales
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            {/* Sport Selector */}
            <div>
              <label htmlFor="sport" className="label text-sm mb-1 block">
                Deporte
              </label>
              <select
                id="sport"
                value={sport}
                onChange={(e) => setSport(e.target.value)}
                className="input w-full"
              >
                <option value="Padel">Padel</option>
                <option value="Tenis">Tenis</option>
                <option value="Fútbol">Fútbol</option>
              </select>
            </div>

            {/* Date Navigation */}
            <div className="flex items-center justify-center gap-2">
              <button onClick={handlePrevDay} className="btn btn-outline px-3">
                ←
              </button>
              <div className="text-center min-w-[150px]">
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="input text-center"
                />
                <div className="text-xs text-gray-500 mt-1 font-medium uppercase">
                  {dayText}
                </div>
              </div>
              <button onClick={handleNextDay} className="btn btn-outline px-3">
                →
              </button>
            </div>

            {/* Today Button */}
            <div className="flex justify-end">
              <button onClick={handleToday} className="btn btn-primary w-full md:w-auto">
                Hoy
              </button>
            </div>
          </div>
        </div>
      </Card>

      {/* Calendar Grid */}
      <Card className="overflow-hidden">
        <CalendarGrid
          courts={filteredCourts}
          slots={slots}
          reservations={reservations || []}
          selectedDate={date}
          onSlotClick={handleSlotClick}
          onRefresh={refetch}
          currentUser={user}
        />
      </Card>

      {/* Reservation Modal */}
      <ReservationFormModalNew
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleCreateReservation}
        onCancel={handleCancelReservation}
        initialData={modalData}
        reservations={reservations || []}
        courts={courts}
      />
    </div>
  );
}
