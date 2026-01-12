// Ejemplo de cómo usar los nuevos hooks en ReservationFormModalNew.jsx
// Este es un ejemplo de refactorización - NO reemplazar el archivo aún

import React from 'react';
import { useReservationForm } from '../../hooks/useReservationForm';
import { useMemberSearch } from '../../hooks/useMemberSearch';
import { useCoachConfig } from '../../hooks/useCoachConfig';
import { handleApiError, handleBusinessRuleError } from '../../utils/errorHandler';
import { reservationsApi } from '../../services/api';
import ModalBackdrop from './shared/ModalBackdrop';
import Button from './Button';
import Input from './Input';
import PaymentSection from './PaymentSection';
import DurationSelector from './DurationSelector';
// ... otros imports

export default function ReservationFormModalNew({
  open,
  onClose,
  onSubmit,
  initialData,
  reservations = [],
  courts = [],
}) {
  // ✅ Usar el hook principal de formulario
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
    isFieldEditable,
    isAdmin,
    isCoach,
    isSocio,
  } = formState;

  // ✅ Usar el hook de búsqueda de miembros (solo para ADMINs)
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

  // ✅ Usar el hook de configuración de coach (solo para COACHes)
  const coachConfig = useCoachConfig(user, open, reservations);

  // Estados locales específicos del componente (no del formulario)
  const [showCancelConfirm, setShowCancelConfirm] = React.useState(false);
  const [isCancelling, setIsCancelling] = React.useState(false);

  // ✅ Handler de submit simplificado
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(true);

    // Validar formulario
    const errors = validate();
    if (Object.keys(errors).length > 0) {
      handleValidationError(errors, notifications);
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
      };
    }

    // Agregar userId para SOCIO
    if (isSocio) {
      reservationData.userId = user.id;
      reservationData.membershipNumber = user.membershipNumber;
    }

    // Enviar formulario
    onSubmit(reservationData);
  };

  // ✅ Handler de cancelación con manejo de errores
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

      if (typeof onSubmit === 'function') {
        onSubmit({ ...initialData, status: 'cancelled' });
      }
    } catch (error) {
      // ✅ Usar el sistema centralizado de errores
      handleApiError(error, notifications);
    } finally {
      setIsCancelling(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex">
      <div className="flex-1 min-w-0" onClick={onClose} />

      <div className="bg-white dark:bg-gray-800 w-full max-w-6xl h-full shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex-shrink-0 flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold">
            {initialData?.id ? 'Editar Reserva' : 'Nueva Reserva'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            ✕
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="h-full flex flex-col">
          <div className="flex-1 overflow-y-auto p-4">
            {/* Campo de búsqueda de miembros (ADMIN) */}
            {isAdmin && (
              <div className="mb-4">
                <label className="label">Buscar Socio</label>
                <Input
                  value={memberSearch.searchTerm}
                  onChange={(e) => memberSearch.setSearchTerm(e.target.value)}
                  placeholder="Nombre o email del socio..."
                />
                
                {memberSearch.isSearching && <div>Buscando...</div>}
                
                {memberSearch.showDropdown && (
                  <ul className="border rounded mt-1 max-h-40 overflow-y-auto">
                    {memberSearch.results.map((member) => (
                      <li
                        key={member.id}
                        onClick={() => memberSearch.handleSelect(member)}
                        className="p-2 hover:bg-gray-100 cursor-pointer"
                      >
                        {member.name} - {member.email}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {/* Información de cuota semanal (COACH) */}
            {isCoach && coachConfig.config && (
              <div className="mb-4 p-3 bg-blue-50 rounded">
                <p className="text-sm">
                  Horas usadas esta semana:{' '}
                  {coachConfig.calculateWeeklyHours(form.date || new Date()).toFixed(1)} /{' '}
                  {coachConfig.config.weeklyHourQuota}hs
                </p>
              </div>
            )}

            {/* Resto de los campos del formulario */}
            <Input
              name="sport"
              value={form.sport || ''}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={!isFieldEditable('sport')}
            />

            <DurationSelector
              value={form.duration || '01:00'}
              onChange={handleDurationChange}
              disabled={!isFieldEditable('duration')}
            />

            {/* Sección de pago (SOCIO) */}
            {showPayment && (
              <PaymentSection
                amount={form.price}
                onSuccess={handlePaymentSuccess}
                onError={handlePaymentError}
              />
            )}
          </div>

          {/* Footer con botones */}
          <div className="flex-shrink-0 p-4 border-t flex gap-2 justify-end">
            {initialData?.id && (
              <Button
                type="button"
                variant="danger"
                onClick={() => setShowCancelConfirm(true)}
              >
                Cancelar Reserva
              </Button>
            )}
            <Button type="button" variant="outline" onClick={onClose}>
              Cerrar
            </Button>
            <Button type="submit" variant="primary">
              {initialData?.id ? 'Guardar Cambios' : 'Crear Reserva'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

/*
 * BENEFICIOS DE ESTA REFACTORIZACIÓN:
 * 
 * 1. Reducción de líneas: De ~1400 a ~300 líneas
 * 2. Lógica separada: Cada hook maneja su responsabilidad
 * 3. Más testeable: Los hooks se pueden testear independientemente
 * 4. Más legible: El componente es más fácil de entender
 * 5. Reutilizable: Los hooks se pueden usar en otros componentes
 * 6. Mantenible: Cambios en lógica se hacen en un solo lugar
 */
