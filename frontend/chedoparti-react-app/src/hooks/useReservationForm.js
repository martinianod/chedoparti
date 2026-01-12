import { useState, useCallback, useEffect, useMemo } from 'react';
import { calculateReservationPrice } from '../utils/priceCalculator';
import { 
  validateReservationRules,
  canEditReservation,
  canCancelReservation,
  getEditableFields,
  isAdmin as checkIsAdmin,
  isCoach as checkIsCoach,
  isSocio as checkIsSocio
} from '../utils/reservationRules';
import { useAppNotifications } from './useAppNotifications';
import { handleValidationError, handleBusinessRuleError } from '../utils/errorHandler';

/**
 * Custom hook para manejar el estado y lógica del formulario de reservas
 * Centraliza toda la lógica de estado que antes estaba en ReservationFormModalNew
 * 
 * @param {Object} options - Opciones de configuración
 * @param {Object} options.initialData - Datos iniciales de la reserva (para edición)
 * @param {Object} options.user - Usuario actual
 * @param {Array} options.courts - Lista de canchas disponibles
 * @param {Array} options.reservations - Lista de reservas existentes
 * @param {boolean} options.open - Si el modal está abierto
 * @returns {Object} Estado y funciones del formulario
 */
export function useReservationForm({ initialData, user, courts = [], reservations = [], open }) {
  const { reservation: notifications } = useAppNotifications();

  // Role checks
  const isAdmin = checkIsAdmin(user);
  const isCoach = checkIsCoach(user);
  const isSocio = checkIsSocio(user);

  // Form state
  const [form, setForm] = useState(() => {
    const baseForm = {
      duration: '01:00',
      type: 'Normal',
      ...initialData,
    };

    // Si es SOCIO, cargar automáticamente sus datos
    if (isSocio && user) {
      baseForm.user = user.name || user.email || '';
    }

    return baseForm;
  });

  const [submitted, setSubmitted] = useState(false);
  const [touched, setTouched] = useState({});
  const [errors, setErrors] = useState({});

  // Payment state para usuarios SOCIO
  const [paymentRequired, setPaymentRequired] = useState(false);
  const [showPayment, setShowPayment] = useState(false);

  /**
   * Determinar campos editables según permisos
   */
  const editableFields = useMemo(() => {
    if (!initialData?.id) return ['all']; // Creating new reservation
    return getEditableFields(user, initialData);
  }, [user, initialData]);

  /**
   * Verificar si un campo específico es editable
   */
  const isFieldEditable = useCallback(
    (fieldName) => {
      if (!initialData?.id) return true;
      if (editableFields.includes('all')) return true;
      return editableFields.includes(fieldName);
    },
    [initialData, editableFields]
  );

  /**
   * Calcular precio automático para SOCIO y ADMIN
   */
  const calculateAutoPrice = useCallback(() => {
    if (
      !['SOCIO', 'INSTITUTION_ADMIN'].includes(user?.role) ||
      !form?.time ||
      !form?.duration ||
      !form?.courtId
    ) {
      return 0;
    }

    const result = calculateReservationPrice({
      courtId: form.courtId,
      startTime: form.time,
      duration: form.duration,
      date: form.date,
      isMember: user?.role === 'SOCIO',
    });

    return result.price;
  }, [user?.role, form?.time, form?.duration, form?.courtId, form?.date]);

  /**
   * Actualizar precio automáticamente cuando cambian los datos relevantes
   */
  useEffect(() => {
    if (['SOCIO', 'INSTITUTION_ADMIN'].includes(user?.role) && form?.time && form?.duration && form?.courtId) {
      const autoPrice = calculateAutoPrice();
      // Solo actualizar si el precio cambió para evitar loops
      setForm((prev) => {
        if (prev.price !== autoPrice) {
          return { ...prev, price: autoPrice };
        }
        return prev;
      });
    }
  }, [user?.role, form?.time, form?.duration, form?.courtId, form?.date, calculateAutoPrice]);

  /**
   * Verificar si se debe mostrar la sección de pago
   */
  useEffect(() => {
    const shouldShowPayment =
      user?.role === 'SOCIO' &&
      form?.sport === 'Padel' &&
      form?.courtId &&
      form?.date &&
      form?.time &&
      form?.duration &&
      form?.type !== 'Torneo' &&
      form?.type !== 'Clase';

    setShowPayment(shouldShowPayment);

    if (shouldShowPayment) {
      setPaymentRequired(true);
    } else {
      setPaymentRequired(false);
    }
  }, [user, form?.sport, form?.courtId, form?.date, form?.time, form?.duration, form?.type]);

  /**
   * Resetear formulario cuando se cierra el modal
   */
  useEffect(() => {
    if (!open) {
      setForm({
        duration: '01:00',
        type: 'Normal',
      });
      setTouched({});
      setSubmitted(false);
      setPaymentRequired(false);
      setShowPayment(false);
    }
  }, [open]);

  /**
   * Inicializar formulario cuando se abre el modal
   */
  useEffect(() => {
    if (open && initialData) {
      const baseForm = {
        duration: '01:00',
        type: 'Normal',
        ...initialData,
      };

      if (isSocio && user) {
        baseForm.user = user.name || user.email || '';
      }

      setForm(baseForm);
    }
  }, [open, initialData, user, isSocio]);

  /**
   * Manejar cambios en los campos del formulario
   */
  const handleChange = useCallback(
    (e) => {
      const { name, value, type, checked } = e.target;
      
      setForm((prev) => {
        if (name === 'sport') {
          // Filtrar canchas para el nuevo deporte
          const newFilteredCourts = courts.filter((c) => c.sport === value);
          return {
            ...prev,
            sport: value,
            courtId: newFilteredCourts.length > 0 ? newFilteredCourts[0].id : '',
          };
        }
        return {
          ...prev,
          [name]: type === 'checkbox' ? checked : value,
        };
      });

      // Marcar campo como tocado
      setTouched((prev) => ({ ...prev, [name]: true }));
    },
    [courts]
  );

  /**
   * Manejar cambio de duración
   */
  const handleDurationChange = useCallback((e) => {
    const newDuration = e.target ? e.target.value : e;
    setForm((prev) => ({ ...prev, duration: newDuration }));
    setTouched((prev) => ({ ...prev, duration: true }));
  }, []);

  /**
   * Manejar blur de campos
   */
  const handleBlur = useCallback((e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
  }, []);

  /**
   * Actualizar campo específico del formulario
   */
  const updateField = useCallback((fieldName, value) => {
    setForm((prev) => ({ ...prev, [fieldName]: value }));
  }, []);

  /**
   * Actualizar múltiples campos a la vez
   */
  const updateFields = useCallback((fields) => {
    setForm((prev) => ({ ...prev, ...fields }));
  }, []);

  /**
   * Validar formulario
   */
  const validate = useCallback(() => {
    const newErrors = {};

    // Validación básica de campos
    if (user?.role === 'SOCIO') {
      // SOCIO: campo user poblado automáticamente
      if (!form.user) {
        newErrors.user = 'Error: No se pudo identificar al socio';
      }
    } else if (isAdmin) {
      // ADMIN: debe tener un miembro seleccionado (validado externamente)
      // Esta validación se hace en el componente con selectedMember
    } else {
      // OTROS ROLES: campo user requerido
      if (!form.user || form.user.trim() === '') {
        newErrors.user = 'El campo "A nombre de" es obligatorio';
      }
    }

    if (!form.sport) newErrors.sport = 'El deporte es obligatorio';
    if (!form.courtId) newErrors.courtId = 'La cancha es obligatoria';
    if (!form.date) newErrors.date = 'La fecha es obligatoria';
    if (!form.time) newErrors.time = 'La hora es obligatoria';
    if (!form.duration) newErrors.duration = 'La duración es obligatoria';
    if (!form.type) newErrors.type = 'El tipo de turno es obligatorio';

    // Validación de precio para roles que no calculan automáticamente
    if (!['SOCIO', 'INSTITUTION_ADMIN'].includes(user?.role)) {
      if (form.price === undefined || form.price === '' || form.price === null) {
        newErrors.price = 'El precio es obligatorio';
      }
    }

    // Validaciones de reglas de negocio
    const ruleErrors = validateReservationRules(form, user);
    Object.assign(newErrors, ruleErrors);

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [user, isAdmin, form]);

  /**
   * Manejar pago exitoso
   */
  const handlePaymentSuccess = useCallback((paymentResult) => {
    setPaymentRequired(false);
    notifications.paymentSuccess(paymentResult.id, paymentResult.amount.toLocaleString());
  }, [notifications]);

  /**
   * Manejar error de pago
   */
  const handlePaymentError = useCallback((error) => {
    console.error('❌ Error de pago:', error);
    notifications.paymentError();
    setPaymentRequired(true);
  }, [notifications]);

  /**
   * Resetear formulario
   */
  const reset = useCallback(() => {
    setForm({
      duration: '01:00',
      type: 'Normal',
    });
    setTouched({});
    setErrors({});
    setSubmitted(false);
    setPaymentRequired(false);
    setShowPayment(false);
  }, []);

  return {
    // Estado
    form,
    submitted,
    touched,
    errors,
    paymentRequired,
    showPayment,
    editableFields,
    
    // Funciones
    handleChange,
    handleDurationChange,
    handleBlur,
    updateField,
    updateFields,
    validate,
    handlePaymentSuccess,
    handlePaymentError,
    reset,
    setSubmitted,
    setPaymentRequired,
    
    // Helpers
    isFieldEditable,
    calculateAutoPrice,
    
    // Role checks
    isAdmin,
    isCoach,
    isSocio,
  };
}
