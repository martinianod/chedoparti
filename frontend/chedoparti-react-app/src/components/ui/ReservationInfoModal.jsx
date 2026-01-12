import React, { useState, useEffect } from 'react';
import ModalBackdrop from './shared/ModalBackdrop';
import Input from './Input';
import Button from './Button';
import DurationSelector from './DurationSelector';
import ConfirmDialog from './ConfirmDialog';
import {
  X,
  DollarSign,
  Calculator,
  TrendingUp,
  TrendingDown,
  CreditCard,
  ExternalLink,
} from 'lucide-react';
import { calculateReservationPrice, durationToMinutes } from '../../utils/priceCalculator';
import { useAppNotifications } from '../../hooks/useAppNotifications';
import { createPaymentPreference } from '../../services/mercadopago';
import { getUserDisplayText } from '../../utils/userDisplay';

export default function ReservationInfoModal({
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

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [priceAdjustment, setPriceAdjustment] = useState({
    originalPrice: 0,
    newPrice: 0,
    adjustment: 0,
    adjustmentType: 'none', // 'charge', 'refund', 'none'
    originalDuration: '',
    newDuration: '',
  });
  const [paymentData, setPaymentData] = useState({
    paymentLink: null,
    isGeneratingPayment: false,
    paymentGenerated: false,
  });

  // Estados para diálogos de confirmación
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: '',
    message: '',
    variant: 'warning',
    onConfirm: null,
  });

  // Cargar datos de la reserva cuando se abre el modal
  useEffect(() => {
    if (reservation && open) {
      // Extraer fecha y hora desde startAt
      const startAt = reservation.startAt || reservation.raw?.startAt;
      const endAt = reservation.endAt || reservation.raw?.endAt;

      let date = '';
      let time = '';
      let duration = '01:00';

      if (startAt) {
        if (startAt.includes('T')) {
          // Formato ISO: "2025-11-11T10:00:00"
          date = startAt.split('T')[0];
          time = startAt.split('T')[1].slice(0, 5);
        } else if (reservation.date && reservation.time) {
          // Formato separado
          date = reservation.date;
          time = reservation.time;
        }
      }

      if (startAt && endAt) {
        const start = new Date(startAt);
        const end = new Date(endAt);
        const durationMinutes = Math.round((end - start) / (1000 * 60));
        const hours = Math.floor(durationMinutes / 60);
        const minutes = durationMinutes % 60;
        duration = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
      }

      // Calcular precio original de la reserva
      const isMember = currentUser?.role === 'SOCIO';
      const originalPriceData = calculateReservationPrice({
        courtId: reservation.courtId,
        startTime: time,
        duration: duration,
        date: date, // Pass date for dynamic pricing
        isMember,
      });

      setForm({
        user: getUserDisplayText(reservation.user, reservation.customerName, reservation.userPhone, reservation.userEmail),
        date: date,
        time: time,
        duration: duration,
        courtId: String(reservation.courtId || ''),
        sport: reservation.sport || 'Padel',
        type: reservation.type || 'Normal',
        notes: reservation.notes || '',
      });

      setPriceAdjustment({
        originalPrice: originalPriceData.price,
        newPrice: originalPriceData.price,
        adjustment: 0,
        adjustmentType: 'none',
        originalDuration: duration,
        newDuration: duration,
      });

      // Limpiar estado del pago al cargar nueva reserva
      setPaymentData({
        paymentLink: null,
        isGeneratingPayment: false,
        paymentGenerated: false,
      });


    }
  }, [reservation, open, currentUser]);

  // Recalcular ajuste de precio cuando cambie la duración o la hora
  useEffect(() => {
    if (form.duration && form.time && form.courtId && priceAdjustment.originalPrice > 0) {
      const isMember = currentUser?.role === 'SOCIO';
      const newPriceData = calculateReservationPrice({
        courtId: form.courtId,
        startTime: form.time,
        duration: form.duration,
        date: form.date, // Pass date for dynamic pricing
        isMember,
      });

      const adjustment = newPriceData.price - priceAdjustment.originalPrice;
      let adjustmentType = 'none';

      if (adjustment > 0) {
        adjustmentType = 'charge'; // Debe pagar más
      } else if (adjustment < 0) {
        adjustmentType = 'refund'; // Se le debe devolver
      }

      setPriceAdjustment((prev) => ({
        ...prev,
        newPrice: newPriceData.price,
        adjustment: Math.abs(adjustment),
        adjustmentType,
        newDuration: form.duration,
      }));

      // Limpiar el estado del pago cuando cambie el ajuste
      setPaymentData({
        paymentLink: null,
        isGeneratingPayment: false,
        paymentGenerated: false,
      });


    }
  }, [form.duration, form.time, form.courtId, priceAdjustment.originalPrice, currentUser]);

  // Manejador para cuando el DurationSelector cambia la duración
  const handleDurationChange = (newDuration) => {
    setForm((prev) => ({ ...prev, duration: newDuration }));

    // Limpiar errores de duración cuando se cambia
    if (errors.duration) {
      setErrors((prev) => ({ ...prev, duration: '' }));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // No validamos el usuario ya que es de solo lectura
    if (!form.date) newErrors.date = 'La fecha es requerida';
    if (!form.time) newErrors.time = 'La hora es requerida';
    if (!form.courtId) newErrors.courtId = 'La cancha es requerida';
    if (!form.duration) newErrors.duration = 'La duración es requerida';

    // La validación de disponibilidad de duración ahora se maneja en DurationSelector
    // Solo validamos campos básicos aquí
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const generatePaymentLink = async () => {
    if (!priceAdjustment.adjustment || priceAdjustment.adjustmentType !== 'charge') return;

    setPaymentData((prev) => ({ ...prev, isGeneratingPayment: true }));

    try {
      const selectedCourt = courts.find((court) => court.id == form.courtId);
      const courtName = selectedCourt ? selectedCourt.name : `Cancha ${form.courtId}`;

      // Construir datos del pago para MercadoPago
      const orderData = {
        items: [
          {
            id: `reservation-adjustment-${reservation.id}`,
            title: `Extensión de Reserva - ${courtName}`,
            description: `Ajuste por extensión de duración de ${priceAdjustment.originalDuration} a ${priceAdjustment.newDuration}`,
            unit_price: priceAdjustment.adjustment,
            quantity: 1,
            currency_id: 'ARS',
          },
        ],
        payer: {
          name: currentUser?.name || form.user,
          email: currentUser?.email || `${form.user}@example.com`,
          phone: {
            area_code: '11',
            number:
              String(form.user || '')
                .replace(/\D/g, '')
                .slice(-8) || '12345678',
          },
          identification: {
            type: 'DNI',
            number: currentUser?.membershipNumber || '12345678',
          },
        },
        back_urls: {
          success: `${window.location.origin}/reservations/payment-success`,
          failure: `${window.location.origin}/reservations/payment-failure`,
          pending: `${window.location.origin}/reservations/payment-pending`,
        },
        auto_return: 'approved',
        payment_methods: {
          excluded_payment_types: [{ id: 'ticket' }],
          installments: 12,
        },
        metadata: {
          reservation_id: reservation.id,
          adjustment_type: 'duration_extension',
          original_duration: priceAdjustment.originalDuration,
          new_duration: priceAdjustment.newDuration,
          user_type: currentUser?.role || 'SOCIO',
        },
      };

      const response = await createPaymentPreference(orderData);

      if (response.data && response.data.init_point) {
        setPaymentData({
          paymentLink: response.data.init_point,
          isGeneratingPayment: false,
          paymentGenerated: true,
        });
      } else {
        throw new Error('No se pudo generar el link de pago');
      }
    } catch (error) {
      console.error('❌ Error generando link de pago:', error);
      notifications.paymentLinkError();
      setPaymentData((prev) => ({ ...prev, isGeneratingPayment: false }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    // Mostrar confirmación si hay ajuste de precio
    if (priceAdjustment.adjustmentType !== 'none') {
      const adjustmentText =
        priceAdjustment.adjustmentType === 'charge'
          ? `cobrar $${priceAdjustment.adjustment.toLocaleString()} adicionales`
          : `devolver $${priceAdjustment.adjustment.toLocaleString()}`;

      const confirmMessage = `Esta modificación requiere ${adjustmentText} al cliente.\n\n¿Desea continuar con la actualización?`;

      setConfirmDialog({
        open: true,
        title: 'Ajuste de Precio Detectado',
        message: confirmMessage,
        variant: 'price',
        onConfirm: () => {
          setConfirmDialog({ ...confirmDialog, open: false });
          executeUpdate();
        },
      });
      return;
    }

    executeUpdate();
  };

  const executeUpdate = async () => {
    setIsLoading(true);
    try {
      // Construir datos actualizados en el formato que espera la API
      const updatedReservation = {
        ...reservation,
        user: form.user,
        userPhone: form.user,
        startAt: `${form.date}T${form.time}:00`,
        endAt: calculateEndTime(form.date, form.time, form.duration),
        courtId: Number(form.courtId),
        sport: form.sport,
        type: form.type,
        notes: form.notes,
        // Incluir información del ajuste de precio para procesamiento posterior
        priceAdjustment:
          priceAdjustment.adjustmentType !== 'none'
            ? {
                originalPrice: priceAdjustment.originalPrice,
                newPrice: priceAdjustment.newPrice,
                adjustment: priceAdjustment.adjustment,
                adjustmentType: priceAdjustment.adjustmentType,
                originalDuration: priceAdjustment.originalDuration,
                newDuration: priceAdjustment.newDuration,
              }
            : null,
      };

      await onUpdate(updatedReservation);

      // Mostrar mensaje de confirmación sobre el ajuste
      if (priceAdjustment.adjustmentType !== 'none') {
        const actionText =
          priceAdjustment.adjustmentType === 'charge'
            ? `Se debe cobrar $${priceAdjustment.adjustment.toLocaleString()} adicionales al cliente.`
            : `Se debe devolver $${priceAdjustment.adjustment.toLocaleString()} al cliente.`;

        notifications.updateWithAdjustment(actionText);
      }

      onClose();
    } catch (error) {
      console.error('❌ Error updating reservation:', error);
      notifications.updateError();
    } finally {
      setIsLoading(false);
    }
  };

  const calculateEndTime = (date, time, duration) => {
    const [durationHours, durationMinutes] = duration.split(':').map(Number);
    const [timeHours, timeMinutes] = time.split(':').map(Number);

    // Calculate total minutes and handle overflow
    const totalMinutes = timeMinutes + durationMinutes;
    const endMinutes = totalMinutes % 60;
    const carryHours = Math.floor(totalMinutes / 60);

    // Calculate final hours
    const endHours = timeHours + durationHours + carryHours;

    // Format as ISO string without timezone conversion
    const endTimeStr = `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`;
    const result = `${date}T${endTimeStr}:00`;



    return result;
  };
  const handleCancel = async () => {
    setConfirmDialog({
      open: true,
      title: 'Cancelar Reserva',
      message:
        '¿Está seguro de que desea cancelar esta reserva?\n\nLa reserva cambiará a estado "Cancelada" pero se mantendrá en el historial.',
      variant: 'cancel',
      confirmText: 'Cancelar Reserva',
      onConfirm: () => {
        setConfirmDialog({ ...confirmDialog, open: false });
        executeCancel();
      },
    });
  };

  const executeCancel = async () => {
    setIsLoading(true);
    try {
      // En lugar de eliminar, cambiar el estado a "cancelled"
      const cancelledReservation = {
        ...reservation,
        status: 'cancelled',
        cancelledAt: new Date().toISOString(),
        cancelledBy: currentUser?.name || currentUser?.email || 'Usuario',
      };

      await onUpdate(cancelledReservation);
      onClose();
    } catch (error) {
      console.error('❌ Error cancelling reservation:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!open || !reservation) {
    return null;
  }

  return (
    <ModalBackdrop onClose={onClose}>
      <div
        className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-2xl max-h-[90vh] shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Editar Reserva #{reservation.id}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Modifica los detalles de la reserva
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Usuario (Solo lectura) */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
              Usuario / Teléfono
            </label>
            <div className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
              {String(form.user || 'Usuario')}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              El usuario no puede ser modificado una vez creada la reserva
            </p>
          </div>

          {/* Fecha y Hora */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Input
                label="Fecha"
                name="date"
                type="date"
                value={form.date}
                onChange={handleChange}
                error={errors.date}
                required
              />
            </div>
            <div>
              <Input
                label="Hora de inicio"
                name="time"
                type="time"
                value={form.time}
                onChange={handleChange}
                error={errors.time}
                required
              />
            </div>
          </div>

          {/* Duración y Cancha */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <DurationSelector
              value={form.duration}
              onChange={handleDurationChange}
              startTime={form.time}
              courtId={form.courtId}
              date={form.date}
              reservations={reservations}
              excludeReservationId={reservation?.id}
              error={errors.duration}
            />
            <div>
              <label className="block text-sm font-medium mb-1">Cancha</label>
              <select
                name="courtId"
                value={form.courtId}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700"
                required
              >
                <option value="">Seleccionar cancha</option>
                {courts.map((court) => (
                  <option key={court.id} value={court.id}>
                    {court.name} ({court.sport})
                  </option>
                ))}
              </select>
              {errors.courtId && <p className="text-red-500 text-sm mt-1">{errors.courtId}</p>}
            </div>
          </div>

          {/* Alerta de conflicto de horario */}
          {(errors.duration === 'Este horario se superpone con otra reserva existente' ||
            errors.time === 'Conflicto de horario detectado') && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <h4 className="font-semibold text-red-800 dark:text-red-200">
                  ⚠️ Conflicto de Horario Detectado
                </h4>
              </div>
              <p className="text-sm text-red-700 dark:text-red-300 mt-2">
                La nueva duración o horario se superpone con una reserva existente en la misma
                cancha. Por favor, ajusta la hora de inicio o reduce la duración para evitar
                conflictos.
              </p>
            </div>
          )}

          {/* Deporte y Tipo */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                Deporte
              </label>
              <div className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
                {form.sport}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                El deporte no puede ser modificado
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Tipo de reserva</label>
              <select
                name="type"
                value={form.type}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700"
              >
                <option value="Normal">Normal</option>
                <option value="Fijo">Fijo</option>
                <option value="Torneo">Torneo</option>
                <option value="Academia">Academia</option>
                <option value="Invitado">Invitado</option>
              </select>
            </div>
          </div>

          {/* Ajuste de precio */}
          {priceAdjustment.adjustmentType !== 'none' && (
            <div
              className={`p-4 rounded-lg border-2 ${
                priceAdjustment.adjustmentType === 'charge'
                  ? 'bg-orange-50 border-orange-200 dark:bg-orange-900/20 dark:border-orange-800'
                  : 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800'
              }`}
            >
              <div className="flex items-center gap-2 mb-3">
                <Calculator className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                  Ajuste de Precio por Cambio de Duración
                </h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex flex-col">
                  <span className="text-gray-500 dark:text-gray-400">Precio Original</span>
                  <div className="flex items-center gap-1">
                    <DollarSign className="w-4 h-4" />
                    <span className="font-semibold">
                      ${priceAdjustment.originalPrice.toLocaleString()}
                    </span>
                  </div>
                  <span className="text-xs text-gray-400">
                    Duración: {priceAdjustment.originalDuration}
                  </span>
                </div>

                <div className="flex flex-col">
                  <span className="text-gray-500 dark:text-gray-400">Nuevo Precio</span>
                  <div className="flex items-center gap-1">
                    <DollarSign className="w-4 h-4" />
                    <span className="font-semibold">
                      ${priceAdjustment.newPrice.toLocaleString()}
                    </span>
                  </div>
                  <span className="text-xs text-gray-400">
                    Duración: {priceAdjustment.newDuration}
                  </span>
                </div>

                <div className="flex flex-col">
                  <span className="text-gray-500 dark:text-gray-400">
                    {priceAdjustment.adjustmentType === 'charge' ? 'Cargo Adicional' : 'Reembolso'}
                  </span>
                  <div
                    className={`flex items-center gap-1 ${
                      priceAdjustment.adjustmentType === 'charge'
                        ? 'text-orange-600 dark:text-orange-400'
                        : 'text-green-600 dark:text-green-400'
                    }`}
                  >
                    {priceAdjustment.adjustmentType === 'charge' ? (
                      <TrendingUp className="w-4 h-4" />
                    ) : (
                      <TrendingDown className="w-4 h-4" />
                    )}
                    <span className="font-bold">
                      ${priceAdjustment.adjustment.toLocaleString()}
                    </span>
                  </div>
                  <span className="text-xs text-gray-400">
                    {priceAdjustment.adjustmentType === 'charge'
                      ? 'A cobrar al cliente'
                      : 'A devolver al cliente'}
                  </span>
                </div>
              </div>

              {priceAdjustment.adjustmentType === 'charge' && (
                <div className="mt-3 p-3 bg-orange-100 dark:bg-orange-900/40 rounded-lg">
                  <p className="text-sm text-orange-700 dark:text-orange-300">
                    <strong>⚠️ Atención:</strong> Al extender la duración, el cliente deberá abonar
                    ${priceAdjustment.adjustment.toLocaleString()} adicionales.
                  </p>
                </div>
              )}

              {/* Sección de pago para socios cuando deben abonar más */}
              {priceAdjustment.adjustmentType === 'charge' && currentUser?.role === 'SOCIO' && (
                <div className="mt-4 p-4 border-2 border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800 rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <CreditCard className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    <h5 className="font-semibold text-blue-900 dark:text-blue-100">
                      Generar Pago con MercadoPago
                    </h5>
                  </div>

                  <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">
                    Como socio, puedes generar un link de pago seguro para abonar el monto
                    adicional.
                  </p>

                  {!paymentData.paymentGenerated ? (
                    <Button
                      onClick={generatePaymentLink}
                      disabled={paymentData.isGeneratingPayment}
                      loading={paymentData.isGeneratingPayment}
                      variant="primary"
                      className="w-full"
                    >
                      <div className="flex items-center justify-center gap-2">
                        <CreditCard className="w-4 h-4" />
                        {paymentData.isGeneratingPayment
                          ? 'Generando Link de Pago...'
                          : `Generar Pago por $${priceAdjustment.adjustment.toLocaleString()}`}
                      </div>
                    </Button>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 p-3 bg-green-100 dark:bg-green-900/40 rounded-lg">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm text-green-700 dark:text-green-300 font-medium">
                          ✅ Link de pago generado exitosamente
                        </span>
                      </div>

                      <a
                        href={paymentData.paymentLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 w-full p-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Ir a MercadoPago y Pagar ${priceAdjustment.adjustment.toLocaleString()}
                      </a>

                      <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                        Se abrirá en una nueva pestaña. Una vez completado el pago, podrás proceder
                        con la actualización de la reserva.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {priceAdjustment.adjustmentType === 'refund' && (
                <div className="mt-3 p-3 bg-green-100 dark:bg-green-900/40 rounded-lg">
                  <p className="text-sm text-green-700 dark:text-green-300">
                    <strong>✓ Reembolso:</strong> Al reducir la duración, se debe devolver $
                    {priceAdjustment.adjustment.toLocaleString()} al cliente.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Notas */}
          <div>
            <Input
              label="Notas (opcional)"
              name="notes"
              value={form.notes}
              onChange={handleChange}
              placeholder="Notas adicionales sobre la reserva"
              multiline="true"
              rows={3}
            />
          </div>
        </form>

        {/* Footer con botones */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
          <Button onClick={handleCancel} variant="danger" disabled={isLoading}>
            Cancelar Reserva
          </Button>

          <div className="flex gap-3">
            <Button onClick={onClose} variant="secondary" disabled={isLoading}>
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              variant="primary"
              disabled={isLoading}
              loading={isLoading}
            >
              Guardar Cambios
            </Button>
          </div>
        </div>
      </div>

      {/* Diálogo de Confirmación */}
      <ConfirmDialog
        open={confirmDialog.open}
        onClose={() => setConfirmDialog({ ...confirmDialog, open: false })}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        message={confirmDialog.message}
        variant={confirmDialog.variant}
        confirmText={confirmDialog.confirmText}
        isLoading={isLoading}
      />
    </ModalBackdrop>
  );
}
