/**
 * Hook centralizado para todas las notificaciones del sistema
 * Proporciona funciones específicas para diferentes contextos
 */

import { useMemo } from 'react';
import { useNotifications, NOTIFICATION_TYPES } from '../components/ui/NotificationSystem';

export function useAppNotifications() {
  const { showSuccess, showError, showWarning, showInfo } = useNotifications();

  return useMemo(() => ({
    // Notificaciones generales
    showSuccess,
    showError,
    showWarning,
    showInfo,
    success: showSuccess, // Alias para compatibilidad
    error: showError, // Alias para compatibilidad

    // Notificaciones de reservas
    reservation: {
      success: () => showSuccess('Reserva creada exitosamente'),
      error: (message) => showError(message),
      cancelled: () => showInfo('Reserva cancelada'),
      updated: () => showSuccess('Reserva actualizada exitosamente'),
      deleted: () => showInfo('Reserva eliminada'),
      confirmed: () => showSuccess('Reserva confirmada'),
      pending: () => showWarning('Reserva está pendiente de confirmación'),
      cancelSuccess: () => showSuccess('Reserva cancelada exitosamente'),
      cancelError: (message) => showError(`No se pudo cancelar la reserva: ${message}`),
      updateSuccess: () => showSuccess('Reserva actualizada exitosamente'),
      paymentRequired: () => showWarning('Debe completar el pago antes de crear la reserva'),
      deleteError: () => showError('Error al eliminar la reserva'),
      paymentSuccess: (id, amount) => showSuccess(`Pago exitoso - ID: ${id} - Monto: $${amount}`),
      reservationSavedAfterPayment: () => showSuccess('Reserva guardada después del pago exitoso'),
      paymentError: () => showError('Error en el procesamiento del pago'),
      paymentLinkError: () =>
        showError('Error al generar el link de pago. Por favor, inténtelo nuevamente.'),
      updateWithAdjustment: (actionText) =>
        showSuccess(`Reserva actualizada exitosamente.\n\n${actionText}`),
      updateError: () =>
        showError('Error al actualizar la reserva. Por favor, inténtelo nuevamente.'),
    },

    // Notificaciones de canchas
    court: {
      success: (msg) => showSuccess(msg || 'Cancha creada exitosamente'),
      error: (message) => showError(message),
      updated: (msg) => showSuccess(msg || 'Cancha actualizada'),
      updateSuccess: (msg) => showSuccess(msg || 'Cancha actualizada exitosamente'),
      deleted: (msg) => showInfo(msg || 'Cancha eliminada'),
      deleteNotImplemented: (courtId) =>
        showWarning(`Eliminar cancha ${courtId} (funcionalidad pendiente)`),
      availability: {
        updated: () => showSuccess('Disponibilidad actualizada'),
        error: () => showError('Error al actualizar disponibilidad'),
      },
    }, // Notificaciones de precios
    pricing: {
      saved: () => showSuccess('✅ Configuración de precios guardada exitosamente', 4000),
      error: () => showError('❌ Error al guardar la configuración de precios', 6000),
    },

    // Notificaciones de horarios
    schedule: {
      saved: () => showSuccess('✅ Configuración de horarios guardada exitosamente', 4000),
      error: (error) => showError(`❌ Error al guardar horarios: ${error}`, 6000),
      groupAutoDeleted: () =>
        showWarning('📅 Grupo eliminado automáticamente por no tener días asignados', 4000),
      noDaysAvailable: () =>
        showWarning(
          '⚠️ No hay días disponibles. Libera algunos días de otros grupos primero.',
          5000
        ),
      holidayAdded: () => showInfo('📅 Feriado agregado correctamente', 3000),
      validationError: (message) => showError(`⚠️ ${message}`, 5000),
    },

    // Notificaciones de usuarios
    user: {
      deleted: () => showSuccess('✅ Usuario eliminado exitosamente', 4000),
      error: (message) => showError(`❌ Error al eliminar usuario: ${message}`, 6000),
    },

    // Notificaciones de configuración
    settings: {
      emailSent: () => showSuccess('✅ Email enviado correctamente', 3000),
      emailError: () =>
        showError('❌ No se pudo enviar el email. Revisa la configuración de EmailJS.', 6000),
    },

    // Notificaciones de validación
    validation: {
      required: (field) => showWarning(`El campo "${field}" es obligatorio`),
      invalidEmail: () => showWarning('Por favor ingrese un email válido'),
      passwordMismatch: () => showWarning('Las contraseñas no coinciden'),
      minLength: (field, length) =>
        showWarning(`${field} debe tener al menos ${length} caracteres`),
      invalidPhone: () => showWarning('Por favor ingrese un número de teléfono válido'),
      invalidDate: () => showWarning('Por favor seleccione una fecha válida'),
      pastDate: () => showWarning('La fecha no puede ser anterior a hoy'),
      futureDate: () => showWarning('La fecha no puede ser posterior al límite establecido'),
      dateRangeRequired: () =>
        showWarning('Para turnos fijos debe especificar el rango de fechas (inicio y fin)'),
      daysSelectionRequired: () =>
        showWarning('Para turnos fijos debe seleccionar al menos un día de la semana'),
      endDateAfterStart: () =>
        showWarning('La fecha de fin debe ser posterior a la fecha de inicio'),
      duplicateDate: () => showWarning('Ya existe un feriado configurado para esta fecha'),
      invalidTimeRange: () =>
        showWarning('La hora de apertura debe ser menor que la hora de cierre'),
    },

    // Funciones de utilidad
    showBatchResult: (successCount, failCount, itemName = 'elementos') => {
      if (failCount === 0) {
        showSuccess(`✅ ${successCount} ${itemName} procesados exitosamente`, 4000);
      } else if (successCount === 0) {
        showError(`❌ Falló el procesamiento de ${failCount} ${itemName}`, 6000);
      } else {
        showWarning(`⚠️ ${successCount} ${itemName} exitosos, ${failCount} fallidos`, 6000);
      }
    },
  }), [showSuccess, showError, showWarning, showInfo]);
}
