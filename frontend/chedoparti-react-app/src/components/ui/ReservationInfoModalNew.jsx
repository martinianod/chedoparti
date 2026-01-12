import React, { useState, useEffect } from 'react';
import ModalBackdrop from './shared/ModalBackdrop';
import Input from './Input';
import Button from './Button';
import ConfirmDialog from './ConfirmDialog';
import { X, DollarSign, Calendar, Clock, MapPin, User } from 'lucide-react';
import { useAppNotifications } from '../../hooks/useAppNotifications';
import { historyApi } from '../../services/api';
import { getDayOfWeekSpanish, generateTimeSlots } from '../../services/institutionConfig';
import TimeSelector from './TimeSelector';
import { processTimelineEvents } from '../../utils/timelineUtils';
import MobileSelect from './MobileSelect';
import { getUserDisplayText } from '../../utils/userDisplay';

export default function ReservationInfoModalFullscreen({
  open,
  onClose,
  reservation,
  onUpdate,
  onDelete,
  courts = [],
  currentUser,
  reservations = [],
}) {
  const { reservation: notifications } = useAppNotifications();
  const [form, setForm] = useState({
    user: '',
    date: '',
    time: '',
    duration: '01:00',
    courtId: '',
    sport: 'Padel',
    type: 'Normal',
    notes: '',
  });

  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: '',
    message: '',
    variant: 'danger',
    onConfirm: null,
  });

  // ✅ Estado para timeline de actividad
  const [events, setEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(false);

  // ✅ Función para cargar historial de eventos
  const loadReservationHistory = async () => {
    if (!reservation?.id) return;
    
    setLoadingEvents(true);
    try {
      const response = await historyApi.getByReservation(reservation.id);
      setEvents(response.data || []);
    } catch (error) {
      console.error('Error loading reservation history:', error);
      setEvents([]);
    } finally {
      setLoadingEvents(false);
    }
  };

  // Inicializar formulario con datos de la reserva y cargar historial
  useEffect(() => {
    if (reservation) {
      setForm({
        user: getUserDisplayText(
          reservation.user,
          reservation.customerName,
          reservation.userPhone,
          reservation.userEmail
        ),
        date: reservation.date || '',
        time: reservation.time || '',
        duration: reservation.duration || '01:00',
        courtId: reservation.courtId || '',
        sport: reservation.sport || 'Padel',
        type: reservation.type || 'Normal',
        notes: reservation.notes || '',
      });
      
      // ✅ Cargar historial de eventos
      loadReservationHistory();
    }
  }, [reservation]);

  // 🕐 Generar slots de tiempo disponibles para el selector
  const availableTimeSlots = React.useMemo(() => {
    if (!form.date) return [];
    const dayOfWeek = getDayOfWeekSpanish(form.date);
    return generateTimeSlots(dayOfWeek, 30); // Forzar 30 minutos
  }, [form.date]);

  // 🔐 Verificar si el usuario es dueño de la reserva
  const isOwner = React.useMemo(() => {
    if (!currentUser || !reservation) return false;
    
    // Admin siempre tiene acceso completo
    const isAdmin = currentUser.role === 'INSTITUTION_ADMIN' || 
                    currentUser.roles?.includes('INSTITUTION_ADMIN');
    if (isAdmin) return true;
    
    // Para SOCIO y COACH: verificar propiedad por userId o membershipNumber
    // IMPORTANTE: Los coaches NO pueden editar reservas de otros
    const ownerByUserId = 
      reservation.userId && 
      currentUser.id && 
      String(reservation.userId) === String(currentUser.id);
    
    const ownerByMembership = 
      reservation.membershipNumber && 
      currentUser.membershipNumber && 
      String(reservation.membershipNumber) === String(currentUser.membershipNumber);
    
    return ownerByUserId || ownerByMembership;
  }, [currentUser, reservation]);

  if (!open || !reservation) {
    return null;
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!onUpdate || !reservation) return;
    
    // ✅ Calcular startAt y endAt basados en la duración modificada
    const [hours, minutes] = (form.duration || reservation.duration || '01:00').split(':').map(Number);
    const durationMs = (hours * 60 + minutes) * 60 * 1000;
    
    // Usar startAt original o construirlo desde date/time
    const startAt = reservation.startAt || `${reservation.date}T${reservation.time}:00`;
    const startDate = new Date(startAt);
    const endDate = new Date(startDate.getTime() + durationMs);
    const endAt = endDate.toISOString().slice(0, 19); // Formato: YYYY-MM-DDTHH:mm:ss
    

    
    // ✅ Llamar a onUpdate con el objeto completo incluyendo startAt/endAt calculados
    const updatedData = {
      ...reservation,
      ...form,
      startAt,
      endAt, // ✅ Incluir endAt calculado
      courtId: Number(form.courtId),
    };
    

    onUpdate(updatedData);
    
    // ✅ Recargar timeline después de actualizar
    setTimeout(() => {
      loadReservationHistory();
    }, 500);
  };

  const handleCancel = () => {
    setConfirmDialog({
      open: true,
      title: 'Cancelar Reserva',
      message:
        '¿Estás seguro de que deseas cancelar esta reserva? Esta acción no se puede deshacer.',
      variant: 'cancel',
      onConfirm: () => {
        if (onDelete) {
          onDelete(reservation);
        } else if (onUpdate) {
          // Fallback por si onDelete no está definido
          onUpdate(reservation.id, { status: 'cancelled' });
        }

        setConfirmDialog({ ...confirmDialog, open: false });
        
        // ✅ Recargar historial después de cancelar
        setTimeout(() => {
          loadReservationHistory();
        }, 500);
        
        onClose?.();
      },
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <>
      <ModalBackdrop onClose={onClose} className="items-center justify-end bg-black bg-opacity-50">
        <div
          className="bg-white dark:bg-gray-800 w-full max-w-5xl h-screen shadow-2xl flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header fijo */}
          <div className="flex-shrink-0 flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                Reserva #{reservation.id}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Editar detalles y ver historial de la reserva
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Contenido con scroll */}
          <div className="flex-1 overflow-y-auto">
            <form onSubmit={handleSubmit}>
              <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8 min-h-full">
                {/* COLUMNA IZQUIERDA - Información y edición */}
                <div className="space-y-6">
                  {/* Estado actual de la reserva */}
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                    <h3 className="text-lg font-medium text-blue-900 dark:text-blue-100 mb-4 flex items-center">
                      <Calendar className="w-5 h-5 mr-2" />
                      Estado Actual
                    </h3>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Estado:</span>
                        <div className="mt-1">
                          <span
                            className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              reservation.status === 'confirmed'
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                                : reservation.status === 'pending'
                                  ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300'
                                  : reservation.status === 'cancelled'
                                    ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
                                    : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300'
                            }`}
                          >
                            {reservation.status === 'confirmed'
                              ? 'Confirmada'
                              : reservation.status === 'pending'
                                ? 'Pendiente'
                                : reservation.status === 'cancelled'
                                  ? 'Cancelada'
                                  : reservation.status}
                          </span>
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Creada:</span>
                        <div className="mt-1 font-medium">
                          {formatDateTime(reservation.createdAt)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Datos del cliente */}
                  <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                      <User className="w-5 h-5 mr-2" />
                      Datos del Cliente
                    </h3>

                    <div className="space-y-4">
                      <Input
                        label="Nombre completo"
                        name="user"
                        type="text"
                        value={form.user || ''}
                        onChange={(e) => setForm({ ...form, user: e.target.value })}
                        readOnly={currentUser?.role !== 'INSTITUTION_ADMIN'}
                        className={
                          currentUser?.role !== 'INSTITUTION_ADMIN' ? 'bg-gray-100 dark:bg-gray-800' : ''
                        }
                        title={currentUser?.role !== 'INSTITUTION_ADMIN' ? 'Solo administradores pueden modificar el nombre' : ''}
                      />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Teléfono
                          </label>
                          <div className="text-sm text-gray-900 dark:text-gray-100 p-2 bg-gray-100 dark:bg-gray-800 rounded">
                            {reservation.phone || 'No registrado'}
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            N° Socio
                          </label>
                          <div className="text-sm text-gray-900 dark:text-gray-100 p-2 bg-gray-100 dark:bg-gray-800 rounded">
                            {reservation.membershipNumber || 'No aplicable'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Datos de la reserva */}
                  <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                      <MapPin className="w-5 h-5 mr-2" />
                      Detalles de la Reserva
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="Fecha"
                        name="date"
                        type="date"
                        value={form.date}
                        onChange={(e) => setForm({ ...form, date: e.target.value })}
                      />

                      <TimeSelector
                        label="Hora"
                        value={form.time}
                        onChange={(value) => setForm({ ...form, time: value })}
                        placeholder="Seleccionar hora"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div>
                        <MobileSelect
                          value={form.courtId}
                          onChange={(value) => setForm({ ...form, courtId: value })}
                          label="Cancha"
                          placeholder="Seleccionar cancha"
                          options={courts.map((court) => ({
                            value: court.id,
                            label: court.name,
                          }))}
                        />
                      </div>

                      <div>
                        <MobileSelect
                          value={form.duration}
                          onChange={(value) => setForm({ ...form, duration: value })}
                          label="Duración"
                          placeholder="Seleccionar duración"
                          options={[
                            { value: '01:00', label: '1 hora' },
                            { value: '01:30', label: '1 hora 30 min' },
                            { value: '02:00', label: '2 horas' },
                            { value: '02:30', label: '2 horas 30 min' },
                            { value: '03:00', label: '3 horas' },
                          ]}
                        />
                      </div>
                    </div>

                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Notas
                      </label>
                      <textarea
                        value={form.notes}
                        onChange={(e) => setForm({ ...form, notes: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                        rows={3}
                        placeholder="Observaciones adicionales..."
                      />
                    </div>
                  </div>
                </div>

                {/* COLUMNA DERECHA - Timeline y precio */}
                <div className="space-y-6">
                  {/* Resumen financiero */}
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
                    <h3 className="text-lg font-medium text-green-900 dark:text-green-100 mb-4 flex items-center">
                      <DollarSign className="w-5 h-5 mr-2" />
                      Información de Pago
                    </h3>

                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Precio original:</span>
                        <span className="font-medium">${reservation.price || 0}</span>
                      </div>
                      {reservation.finalPrice !== reservation.price && (
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Ajustes:</span>
                          <span className="font-medium">
                            {reservation.finalPrice > reservation.price ? '+' : ''}$
                            {reservation.finalPrice - reservation.price || 0}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between border-t border-green-200 dark:border-green-700 pt-3">
                        <span className="font-medium text-green-900 dark:text-green-100">
                          Total final:
                        </span>
                        <span className="font-bold text-lg text-green-900 dark:text-green-100">
                          ${reservation.finalPrice || reservation.price || 0}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Estado del pago:</span>
                        <span
                          className={`font-medium ${
                            reservation.paymentStatus === 'paid'
                              ? 'text-green-600 dark:text-green-400'
                              : reservation.paymentStatus === 'pending'
                                ? 'text-yellow-600 dark:text-yellow-400'
                                : 'text-red-600 dark:text-red-400'
                          }`}
                        >
                          {reservation.paymentStatus === 'paid'
                            ? 'Pagado'
                            : reservation.paymentStatus === 'pending'
                              ? 'Pendiente'
                              : reservation.paymentStatus === 'refunded'
                                ? 'Reembolsado'
                                : 'Sin pagar'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Timeline de eventos */}
                  <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                      <Clock className="w-5 h-5 mr-2" />
                      Timeline de Actividad
                    </h3>

                    <div className="space-y-4 max-h-64 overflow-y-auto">
                      {loadingEvents ? (
                        <div className="text-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                          <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">
                            Cargando historial...
                          </p>
                        </div>
                      ) : events && events.length > 0 ? (
                        processTimelineEvents(events).map((event, index) => (
                          <div
                            key={event.id || index}
                            className="flex items-start space-x-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                          >
                            <div className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                              <span className="text-blue-600 dark:text-blue-400 text-xs font-medium">
                                {event.actionType === 'CREATE'
                                  ? '✚'
                                  : event.actionType === 'UPDATE'
                                    ? '✏️'
                                    : event.actionType === 'CANCEL'
                                      ? '✖'
                                      : event.actionType === 'COMPLETE'
                                        ? '✓'
                                        : '•'}
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2 mb-1">
                                <span
                                  className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${
                                    event.actionType === 'CREATE'
                                      ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                                      : event.actionType === 'UPDATE'
                                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300'
                                        : event.actionType === 'CANCEL'
                                          ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
                                          : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300'
                                  }`}
                                >
                                  {event.actionType === 'CREATE'
                                    ? 'Creada'
                                    : event.actionType === 'UPDATE'
                                      ? 'Modificada'
                                      : event.actionType === 'CANCEL'
                                        ? 'Cancelada'
                                        : event.actionType === 'COMPLETE'
                                          ? 'Completada'
                                          : event.actionType}
                                </span>
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  {formatDateTime(event.timestamp)}
                                </span>
                              </div>
                              <p className="text-sm text-gray-900 dark:text-gray-100 mb-1">
                                {event.details}
                              </p>
                              {event.performedBy && (
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  Por: {event.performedBy.name} ({event.performedBy.role})
                                </p>
                              )}
                              {event.changes && Object.keys(event.changes).length > 0 && (
                                <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                                  <strong>Cambios:</strong>
                                  {Object.entries(event.changes).map(([key, value]) => (
                                    <div key={key} className="ml-2">
                                      • {key}: {value.from} → {value.to}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8">
                          <Clock className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-gray-500 dark:text-gray-400 text-sm">
                            No hay eventos registrados para esta reserva
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer fijo con botones */}
              <div className="flex-shrink-0 p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                <div className="flex justify-between">
                  <div>
                    {reservation.status !== 'cancelled' && isOwner && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleCancel}
                        className="px-6 py-2 text-red-600 border-red-300 hover:bg-red-50 hover:border-red-400"
                      >
                        Cancelar Reserva
                      </Button>
                    )}
                  </div>

                  <div className="flex space-x-4">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={onClose}
                      className="flex-1"
                    >
                      Cerrar
                    </Button>
                    {isOwner && (
                      <Button
                        type="submit"
                        variant="primary"
                        className="flex-1"
                      >
                        Guardar Cambios
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </ModalBackdrop>

      {/* Diálogo de confirmación */}
      <ConfirmDialog
        open={confirmDialog.open}
        onClose={() => setConfirmDialog({ ...confirmDialog, open: false })}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        message={confirmDialog.message}
        variant={confirmDialog.variant}
        confirmText="Confirmar"
        cancelText="Cancelar"
      />
    </>
  );
}
