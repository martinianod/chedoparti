import React from 'react';
import ModalBackdrop from './shared/ModalBackdrop';
import Button from './Button';
import Input from './Input';
import PaymentSection from './PaymentSection';
import DurationSelector from './DurationSelector';
import useAuth from '../../hooks/useAuth';
import {
  ClipboardList,
  Building2,
  Clock,
  DollarSign,
  Moon,
  Sun,
  CheckCircle,
  RotateCcw,
  Star,
} from 'lucide-react';
import { reservationsApi } from '../../services/api';
import ConfirmDialog from './ConfirmDialog';
import {
  generateTimeSlots,
  getDayOfWeekSpanish,
  getSlotInterval,
} from '../../services/institutionConfig';

// ✅ Importar custom hooks y errorHandler
import { useReservationForm } from '../../hooks/useReservationForm';
import { useMemberSearch } from '../../hooks/useMemberSearch';
import { useCoachConfig } from '../../hooks/useCoachConfig';
import { handleApiError, handleBusinessRuleError } from '../../utils/errorHandler';
import { useAppNotifications } from '../../hooks/useAppNotifications';

// Helper functions (mantener las que son específicas de este componente)
const durationStringToMinutes = (durationStr) => {
  if (!durationStr) return 60;
  const [hours, minutes] = durationStr.split(':').map(Number);
  return hours * 60 + minutes;
};

const generateAllTimeSlots = (date) => {
  if (!date) return [];
  const dayOfWeek = getDayOfWeekSpanish(date);
  const interval = getSlotInterval();
  return generateTimeSlots(dayOfWeek, interval);
};

const isTimeSlotAvailable = (
  timeSlot,
  courtId,
  date,
  reservations,
  excludeReservationId = null
) => {
  if (!timeSlot || !courtId || !date) return false;

  const [h, m] = timeSlot.split(':').map(Number);
  const slotStart = h * 60 + m;

  const courtReservations = reservations.filter(
    (r) => r.courtId == courtId && r.date === date && r.id !== excludeReservationId && r.status !== 'cancelled'
  );

  const possibleDurations = [30, 60, 90, 120, 150, 180];

  for (const durationMins of possibleDurations) {
    const slotEnd = slotStart + durationMins;
    let hasConflict = false;

    for (const reservation of courtReservations) {
      if (!reservation.time || !reservation.duration) continue;

      const [rh, rm] = reservation.time.split(':').map(Number);
      const rStart = rh * 60 + rm;

      let rDurationMins;
      if (reservation.duration.includes(':')) {
        const [rdh, rdm] = reservation.duration.split(':').map(Number);
        rDurationMins = rdh * 60 + rdm;
      } else {
        rDurationMins = parseInt(reservation.duration) || 60;
      }

      const rEnd = rStart + rDurationMins;

      if (slotStart < rEnd && slotEnd > rStart) {
        hasConflict = true;
        break;
      }
    }

    if (!hasConflict) {
      return true;
    }
  }

  return false;
};

const generateAvailableTimeSlots = (courtId, date, reservations, excludeReservationId = null) => {
  if (!courtId || !date) return generateAllTimeSlots(date);

  const allSlots = generateAllTimeSlots(date);
  const availableSlots = allSlots.filter((slot) =>
    isTimeSlotAvailable(slot, courtId, date, reservations, excludeReservationId)
  );

  return availableSlots;
};

const sports = ['Padel', 'Tenis', 'Fútbol'];

export default function ReservationFormModalFullscreen({
  open,
  onClose,
  onSubmit,
  onCancel, // Nueva prop para manejar cancelaciones explícitamente
  initialData,
  reservations = [],
  courts = [],
}) {
  const { user } = useAuth();
  const { reservation: notifications } = useAppNotifications();

  // ✅ Usar custom hooks en lugar de estado local
  const formState = useReservationForm({
    initialData,
    user,
    courts,
    reservations,
    open,
  });

  const {
    form,
    submitted,
    touched,
    errors,
    paymentRequired,
    showPayment,
    handleChange,
    handleDurationChange,
    handleBlur,
    updateFields,
    validate,
    handlePaymentSuccess,
    handlePaymentError,
    setSubmitted,
    setPaymentRequired,
    isFieldEditable,
    isAdmin,
    isCoach,
    isSocio,
  } = formState;

  // ✅ Hook de búsqueda de miembros (solo para ADMINs)
  const memberSearch = useMemberSearch({
    enabled: isAdmin,
    filterByRole: form.type === 'Clase' ? 'COACH' : null,
    onSelect: (member) => {
      updateFields({
        user: member.name,
        userEmail: member.email,
        membershipNumber: member.membershipNumber,
        userPhone: member.phone,
        dni: member.dni,
      });
    },
  });

  // ✅ Hook de configuración de coach
  const coachConfig = useCoachConfig(user, open, reservations);

  // Estados locales específicos del modal
  const [showCancelConfirm, setShowCancelConfirm] = React.useState(false);
  const [isCancelling, setIsCancelling] = React.useState(false);

  const refs = {
    user: React.useRef(),
    sport: React.useRef(),
    courtId: React.useRef(),
    date: React.useRef(),
    time: React.useRef(),
    type: React.useRef(),
    price: React.useRef(),
  };

  // Permitir cerrar el modal con Escape
  React.useEffect(() => {
    if (!open) return;
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        if (typeof onClose === 'function') onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open, onClose]);

  // Validar que la hora seleccionada siga disponible cuando cambien cancha o fecha
  React.useEffect(() => {
    if (form.courtId && form.date && form.time) {
      const availableSlots = generateAvailableTimeSlots(
        form.courtId,
        form.date,
        reservations,
        form.id
      );
      const isCurrentTimeStillAvailable = availableSlots.includes(form.time);

      if (!isCurrentTimeStillAvailable) {
        updateFields({ time: '' });
      }
    }
  }, [form.courtId, form.date, reservations]);

  // ✅ Handler de cancelación con errorHandler
  const handleCancelReservation = async () => {
    if (!initialData?.id) return;

    setIsCancelling(true);
    try {
      await reservationsApi.cancel(initialData.id, {
        reason: isAdmin ? 'Eliminada por administrador' : 'Cancelada por el usuario',
      });

      notifications.success(
        isAdmin ? 'Reserva eliminada exitosamente' : 'Reserva cancelada exitosamente'
      );
      setShowCancelConfirm(false);
      onClose();

      // Llamar a onCancel si existe (para refrescar datos), sino usar onSubmit
      if (typeof onCancel === 'function') {
        onCancel(initialData);
      } else if (typeof onSubmit === 'function') {
        onSubmit({ ...initialData, status: 'cancelled' });
      }
    } catch (error) {
      handleApiError(error, notifications);
    } finally {
      setIsCancelling(false);
    }
  };

  // ✅ Handler de submit simplificado
  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);

    // Validar formulario
    const errors = validate();
    if (Object.keys(errors).length > 0) {
      notifications.error(Object.values(errors)[0]);
      
      // Enfocar primer campo con error
      const errorOrder = ['user', 'sport', 'courtId', 'date', 'time', 'duration', 'type'];
      for (const key of errorOrder) {
        if (errors[key] && refs[key]?.current) {
          refs[key].current.focus();
          break;
        }
      }
      return;
    }

    // Validación de miembro seleccionado (ADMIN)
    if (isAdmin && !memberSearch.selectedMember) {
      handleBusinessRuleError('Debe seleccionar un socio del club', notifications);
      return;
    }

    // Validación de pago (SOCIO)
    if (isSocio && paymentRequired) {
      notifications.paymentRequired();
      return;
    }

    // Validaciones de COACH
    if (isCoach && coachConfig.config) {
      const courtValidation = coachConfig.validateAssignedCourt(form.courtId);
      if (!courtValidation.valid) {
        handleBusinessRuleError(courtValidation.message, notifications);
        return;
      }

      const quotaValidation = coachConfig.validateWeeklyQuota(form.date, form.duration);
      if (!quotaValidation.valid) {
        handleBusinessRuleError(quotaValidation.message, notifications);
        return;
      }
    }

    // Calcular startAt y endAt
    let reservationData = { ...form };

    if (form.date && form.time && form.duration) {
      try {
        const [hours, minutes] = form.time.split(':').map(Number);
        const [durH, durM] = form.duration.split(':').map(Number);

        const startIso = `${form.date}T${form.time}:00.000Z`;
        const endHour = String(hours + durH).padStart(2, '0');
        const endMin = String(minutes + durM).padStart(2, '0');
        const endIso = `${form.date}T${endHour}:${endMin}:00.000Z`;

        reservationData = {
          ...reservationData,
          startAt: startIso,
          endAt: endIso,
          date: form.date,
          time: form.time,
          duration: form.duration,
        };
      } catch (error) {
        console.error('❌ Error calculating startAt/endAt:', error);
        notifications.error('Error al calcular las fechas de la reserva');
        return;
      }
    }

    // Agregar userId para SOCIO
    if (isSocio) {
      reservationData.userId = user.id;
      reservationData.membershipNumber = user.membershipNumber;
    }

    // Agregar selectedMember si existe (ADMIN)
    if (isAdmin && memberSearch.selectedMember) {
      reservationData.selectedMember = memberSearch.selectedMember;
      // También poblar campos de usuario por si acaso
      reservationData.user = memberSearch.selectedMember.name;
      reservationData.userId = memberSearch.selectedMember.id;
      reservationData.userPhone = memberSearch.selectedMember.phone;
      reservationData.userEmail = memberSearch.selectedMember.email;
    }

    // Enviar formulario
    onSubmit(reservationData);
  };

  const filteredCourts = React.useMemo(
    () => courts.filter((c) => c.sport === (form?.sport || 'Padel')),
    [courts, form?.sport]
  );

  if (!open) {
    return null;
  }

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex">
        {/* Área clickeable para cerrar */}
        <div className="flex-1 min-w-0" onClick={onClose} />

        {/* Modal deslizante */}
        <div
          className="bg-white dark:bg-gray-800 w-full max-w-6xl h-full shadow-2xl flex flex-col transform transition-transform duration-300 ease-out"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex-shrink-0 flex items-center justify-between p-3 lg:p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <div>
              <h2 className="text-lg lg:text-xl font-semibold text-gray-900 dark:text-gray-100">
                {initialData?.id ? 'Editar Reserva' : 'Nueva Reserva'}
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {initialData?.id
                  ? 'Modifica los detalles de la reserva'
                  : 'Completa los datos para crear una nueva reserva'}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Contenido principal */}
          <div className="flex-1 flex flex-col min-h-0">
            <form onSubmit={handleSubmit} className="h-full flex flex-col">
              <div className="flex-1 overflow-y-auto">
                <div className="p-3 lg:p-4 grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-4 h-full">
                  {/* COLUMNA IZQUIERDA - Datos del jugador */}
                  <div className="space-y-4 h-full flex flex-col">
                    {/* Datos del jugador */}
                    <fieldset className="border border-navy dark:border-gold rounded-lg p-3">
                      <legend className="px-2 text-sm font-semibold text-navy dark:text-gold">
                        Datos del jugador
                      </legend>

                      {isSocio ? (
                        <div className="space-y-2">
                          <Input
                            ref={refs.user}
                            label="A nombre de"
                            name="user"
                            type="text"
                            value={form.user || ''}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            disabled={true}
                            className="bg-gray-100 dark:bg-gray-700"
                          />
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            ℹ️ Como socio, la reserva se crea automáticamente a tu nombre
                          </p>
                        </div>
                      ) : isAdmin ? (
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Buscar Socio
                          </label>
                          <Input
                            ref={refs.user}
                            type="text"
                            value={memberSearch.searchTerm}
                            onChange={(e) => memberSearch.setSearchTerm(e.target.value)}
                            placeholder="Nombre o email del socio..."
                            disabled={!isFieldEditable('user')}
                          />

                          {memberSearch.isSearching && (
                            <p className="text-xs text-gray-500">Buscando...</p>
                          )}

                          {memberSearch.showDropdown && (
                            <ul className="border border-gray-300 dark:border-gray-600 rounded-lg mt-1 max-h-40 overflow-y-auto bg-white dark:bg-gray-800">
                              {memberSearch.results.map((member) => (
                                <li
                                  key={member.id}
                                  onClick={() => memberSearch.handleSelect(member)}
                                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer text-sm"
                                >
                                  <div className="font-medium">{member.name}</div>
                                  <div className="text-xs text-gray-500">{member.email}</div>
                                </li>
                              ))}
                            </ul>
                          )}

                          {memberSearch.selectedMember && (
                            <div className="mt-2 p-2 bg-green-50 dark:bg-green-900/20 rounded border border-green-200 dark:border-green-800">
                              <p className="text-sm text-green-800 dark:text-green-200">
                                ✓ Seleccionado: {memberSearch.selectedMember.name}
                              </p>
                            </div>
                          )}
                        </div>
                      ) : (
                        <Input
                          ref={refs.user}
                          label="A nombre de"
                          name="user"
                          type="text"
                          value={form.user || ''}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          placeholder="Nombre del jugador"
                          disabled={!isFieldEditable('user')}
                        />
                      )}
                    </fieldset>

                    {/* Información de cuota semanal (COACH) */}
                    {isCoach && coachConfig.config && (
                      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                        <p className="text-sm text-blue-900 dark:text-blue-100">
                          <Clock className="w-4 h-4 inline mr-1" />
                          Horas usadas esta semana:{' '}
                          <strong>
                            {coachConfig.calculateWeeklyHours(form.date || new Date()).toFixed(1)} /{' '}
                            {coachConfig.config.weeklyHourQuota}hs
                          </strong>
                        </p>
                      </div>
                    )}

                    {/* Detalles de la reserva */}
                    <fieldset className="border border-navy dark:border-gold rounded-lg p-3 flex-1">
                      <legend className="px-2 text-sm font-semibold text-navy dark:text-gold">
                        Detalles de la reserva
                      </legend>

                      <div className="space-y-3">
                        {/* Deporte */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Deporte
                          </label>
                          <select
                            ref={refs.sport}
                            name="sport"
                            value={form.sport || 'Padel'}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            disabled={!isFieldEditable('sport')}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            {sports.map((sport) => (
                              <option key={sport} value={sport}>
                                {sport}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Cancha */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Cancha
                          </label>
                          <select
                            ref={refs.courtId}
                            name="courtId"
                            value={form.courtId || ''}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            disabled={!isFieldEditable('courtId')}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="">Seleccionar cancha</option>
                            {filteredCourts.map((court) => (
                              <option key={court.id} value={court.id}>
                                {court.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Fecha y Hora */}
                        <div className="grid grid-cols-2 gap-3">
                          <Input
                            ref={refs.date}
                            label="Fecha"
                            name="date"
                            type="date"
                            value={form.date || ''}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            disabled={!isFieldEditable('date')}
                          />

                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Hora
                            </label>
                            <select
                              ref={refs.time}
                              name="time"
                              value={form.time || ''}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              disabled={!isFieldEditable('time')}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                              <option value="">Seleccionar hora</option>
                              {generateAvailableTimeSlots(
                                form.courtId,
                                form.date,
                                reservations,
                                form.id
                              ).map((slot) => (
                                <option key={slot} value={slot}>
                                  {slot}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        {/* Duración */}
                        <DurationSelector
                          value={form.duration || '01:00'}
                          onChange={handleDurationChange}
                          startTime={form.time}
                          courtId={form.courtId}
                          date={form.date}
                          reservations={reservations}
                          excludeReservationId={form.id}
                          error={errors.duration}
                          disabled={!isFieldEditable('duration')}
                        />

                        {/* Tipo de turno */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Tipo de turno
                          </label>
                          <select
                            ref={refs.type}
                            name="type"
                            value={form.type || 'Normal'}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            disabled={!isFieldEditable('type') || (isSocio && form.sport === 'Padel')}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="Normal">Normal</option>
                            {(isAdmin || isCoach) && (
                              <option value="Clase">Clase (Profesor)</option>
                            )}
                            {isAdmin && (
                              <>
                                <option value="Fijo">Fijo</option>
                                <option value="Torneo">Torneo</option>
                                <option value="Escuela">Escuela</option>
                                <option value="Cumpleaños">Cumpleaños</option>
                                <option value="Abono">Abono</option>
                              </>
                            )}
                          </select>
                          {isSocio && form.sport === 'Padel' && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              ℹ️ Como socio de Padel, solo puedes reservar turnos normales
                            </p>
                          )}
                        </div>
                      </div>
                    </fieldset>
                  </div>

                  {/* COLUMNA DERECHA - Precio y pago */}
                  <div className="space-y-4">
                    {/* Sección de pago (SOCIO) */}
                    {showPayment && (
                      <PaymentSection
                        courtId={form.courtId}
                        date={form.date}
                        startTime={form.time}
                        duration={form.duration}
                        onPaymentSuccess={handlePaymentSuccess}
                        onPaymentError={handlePaymentError}
                      />
                    )}

                    {/* Precio (ADMIN/COACH) */}
                    {!isSocio && (
                      <fieldset className="border border-navy dark:border-gold rounded-lg p-3">
                        <legend className="px-2 text-sm font-semibold text-navy dark:text-gold">
                          Precio
                        </legend>
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-5 h-5 text-gray-500" />
                          <Input
                            ref={refs.price}
                            label=""
                            name="price"
                            type="number"
                            value={form.price || ''}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            placeholder="0"
                            disabled={isAdmin}
                            className={isAdmin ? 'bg-gray-100 dark:bg-gray-700' : ''}
                          />
                        </div>
                        {isAdmin && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            ℹ️ Precio calculado automáticamente
                          </p>
                        )}
                      </fieldset>
                    )}
                  </div>
                </div>
              </div>

              {/* Footer con botones */}
              <div className="flex-shrink-0 p-3 lg:p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex justify-between">
                <div>
                  {initialData?.id && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowCancelConfirm(true)}
                      className="px-4 py-2 text-red-600 border-red-300 hover:bg-red-50"
                    >
                      {isAdmin ? 'Eliminar' : 'Cancelar'} Reserva
                    </Button>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={onClose} className="px-4 py-2">
                    Cerrar
                  </Button>
                  <Button type="submit" variant="primary" className="px-4 py-2">
                    {initialData?.id ? 'Guardar Cambios' : 'Crear Reserva'}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Diálogo de confirmación de cancelación */}
      <ConfirmDialog
        open={showCancelConfirm}
        onClose={() => setShowCancelConfirm(false)}
        onConfirm={handleCancelReservation}
        title={isAdmin ? 'Eliminar Reserva' : 'Cancelar Reserva'}
        message={
          isAdmin
            ? '¿Estás seguro de que deseas eliminar esta reserva? Esta acción no se puede deshacer.'
            : '¿Estás seguro de que deseas cancelar esta reserva? Esta acción no se puede deshacer.'
        }
        variant="danger"
        confirmText={isCancelling ? 'Cancelando...' : 'Confirmar'}
        cancelText="Volver"
        isLoading={isCancelling}
      />
    </>
  );
}
