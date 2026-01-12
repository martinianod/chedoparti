import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { reservationsApi, courtsApi, institutionsApi } from '../../services/api';
import { useForm } from 'react-hook-form';
import Card from '../../components/ui/Card';
import DeleteButton from '../../components/ui/DeleteButton';
import SaveButton from '../../components/ui/SaveButton';
import PaymentSection from '../../components/ui/PaymentSection';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import useAuth from '../../hooks/useAuth';
import { createPaymentPreference, redirectToCheckout } from '../../services/mercadopago';
import { useAppNotifications } from '../../hooks/useAppNotifications';

export default function ReservationEdit() {
  const { id } = useParams();
  const isNew = id === 'new';
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useTranslation();
  const { reservation: notifications } = useAppNotifications();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm();

  // Observar valores del formulario para la sección de pago
  const watchedValues = {
    courtId: watch('courtId'),
    date: watch('date'),
    startTime: watch('startTime'),
    endTime: watch('endTime'),
  };
  const [courts, setCourts] = useState([]);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    onConfirm: null,
  });
  const [showPayment, setShowPayment] = useState(false);
  const [paymentRequired, setPaymentRequired] = useState(false);

  // Observar cambios en los campos del formulario para mostrar el pago
  const watchedFields = watch(['courtId', 'date', 'startTime', 'endTime']);
  const [courtId, date, startTime, endTime] = watchedFields;

  useEffect(() => {
    const fetchCourts = async () => {
      try {
        // Get institution ID first
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

        // Get courts for the institution
        const res = await courtsApi.listActive(institutionId);
        const payload = res.data;
        const content = Array.isArray(payload?.content)
          ? payload.content
          : Array.isArray(payload)
            ? payload
            : [];
        setCourts(content);
      } catch (error) {
        setCourts([]);
      }
    };

    fetchCourts();
  }, []);

  useEffect(() => {
    if (!isNew) {
      reservationsApi
        .get(id)
        .then((res) => {
          const data = res.data || {};
          reset({
            userPhone: data.userPhone || '',
            courtId: data.courtId ? String(data.courtId) : '',
            date: data.startAt ? data.startAt.slice(0, 10) : '',
            startTime: data.startAt ? data.startAt.slice(11, 16) : '',
            endTime: data.endAt ? data.endAt.slice(11, 16) : '',
            notes: data.notes || '',
          });
        })
        .finally(() => setLoading(false));
    }
  }, [id, isNew, reset]);

  const onSubmit = async (data) => {
    // Para usuarios SOCIO creando nueva reserva, verificar si ya pagó
    if (user?.role === 'SOCIO' && isNew && paymentRequired) {
      notifications.paymentRequired();
      return;
    }

    // Para ADMIN, COACH o SOCIO que ya pagó, crear reserva directamente
    setSaving(true);
    try {
      const payloadBase = {
        courtId: Number(data.courtId),
        startAt: `${data.date}T${data.startTime}:00`,
        endAt: `${data.date}T${data.endTime}:00`,
        notes: data.notes || '',
        source: user?.role === 'SOCIO' ? 'member' : 'institution_admin',
      };

      let result;
      if (isNew) {
        result = await reservationsApi.create({
          ...payloadBase,
          user: { phone: data.userPhone || user?.name },
          autoConfirm: user?.role !== 'SOCIO',
        });
      } else {
        result = await reservationsApi.update(id, payloadBase);
      }

      // 🔄 SINCRONIZACIÓN: Redirigir a lista donde se verán los cambios

      navigate('/reservations');
    } catch (err) {
      console.error('❌ Error saving reservation:', err);
      const message =
        err?.response?.data?.error || err?.message || t('reservationEdit.errorSaving');
      notifications.error(message);
    } finally {
      setSaving(false);
    }
  };

  const cancel = async () => {
    setConfirmDialog({
      open: true,
      onConfirm: () => {
        setConfirmDialog({ open: false, onConfirm: null });
        executeCancel();
      },
    });
  };

  const executeCancel = async () => {
    try {
      // En lugar de eliminar, actualizar el estado a cancelado
      const cancelData = {
        status: 'cancelled',
        cancelledAt: new Date().toISOString(),
        cancelledBy: user?.name || user?.email || 'Usuario',
      };

      const result = await reservationsApi.update(id, cancelData);

      // 🔄 SINCRONIZACIÓN: Los slots quedarán liberados automáticamente

      navigate('/reservations');
    } catch (error) {
      console.error('❌ Error cancelling reservation:', error);
      notifications.cancelError?.() || notifications.error?.('Error al cancelar la reserva');
    }
  };

  // Verificar si se debe mostrar la sección de pago
  useEffect(() => {
    const shouldShowPayment =
      user?.role === 'SOCIO' && courtId && date && startTime && endTime && isNew;
    setShowPayment(shouldShowPayment);

    // Si es SOCIO y está creando nueva reserva, siempre requiere pago cuando tiene datos completos
    if (shouldShowPayment) {
      setPaymentRequired(true);
    } else {
      setPaymentRequired(false);
    }
  }, [user, courtId, date, startTime, endTime, isNew]);

  // Manejar pago exitoso
  const handlePaymentSuccess = async (paymentResult) => {
    setPaymentRequired(false); // Permitir crear reserva

    // Mostrar confirmación
    notifications.paymentSuccess(paymentResult.id, paymentResult.amount.toLocaleString());

    // Proceder con la creación de la reserva
    const formData = {
      userPhone: user.name,
      courtId,
      date,
      startTime,
      endTime,
      notes: `Pago procesado: ${paymentResult.id}`,
      paymentId: paymentResult.id,
      paymentStatus: paymentResult.status,
      amount: paymentResult.amount,
    };

    try {
      setSaving(true);
      if (isNew) {
        await reservationsApi.create(formData);
      } else {
        await reservationsApi.update(id, formData);
      }
      navigate('/reservations');
    } catch (error) {
      console.error('Error guardando reserva:', error);
      notifications.reservationSavedAfterPayment();
    } finally {
      setSaving(false);
    }
  };

  // Manejar error de pago
  const handlePaymentError = (error) => {
    console.error('❌ Error de pago:', error);
    notifications.paymentError();
    setPaymentRequired(false);
  };

  if (loading) return <div className="p-6">{t('reservationEdit.loading')}</div>;
  return (
    <div>
      <div className="mx-auto max-w-xl">
        <Card>
          <h1 className="mb-4 text-xl font-semibold">
            {isNew ? t('reservationEdit.newReservation') : t('reservationEdit.editReservation')}
          </h1>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="label">{t('reservationEdit.userPhone')}</label>
              <input
                className="input"
                placeholder={t('reservationEdit.userPhonePlaceholder')}
                {...register('userPhone', { required: isNew })}
                disabled={!isNew}
              />
            </div>
            <div>
              <label className="label">{t('reservationEdit.court')}</label>
              <select className="input" {...register('courtId', { required: true })}>
                <option value="">{t('reservationEdit.selectCourt')}</option>
                {Array.isArray(courts) && courts.length === 0 ? (
                  <option disabled>{t('reservationEdit.noCourtsAvailable')}</option>
                ) : (
                  courts.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))
                )}
              </select>
            </div>
            <div>
              <label className="label">{t('reservationEdit.date')}</label>
              <input className="input" type="date" {...register('date', { required: true })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">{t('reservationEdit.startTime')}</label>
                <input
                  className="input"
                  type="time"
                  {...register('startTime', { required: true })}
                />
              </div>
              <div>
                <label className="label">{t('reservationEdit.endTime')}</label>
                <input className="input" type="time" {...register('endTime', { required: true })} />
              </div>
            </div>

            {/* Sección de Pago - Solo para SOCIO */}
            {showPayment && (
              <PaymentSection
                courtId={watchedValues.courtId}
                date={watchedValues.date}
                startTime={watchedValues.startTime}
                endTime={watchedValues.endTime}
                onPaymentSuccess={handlePaymentSuccess}
                onPaymentError={handlePaymentError}
              />
            )}

            <div className="flex gap-3">
              <SaveButton disabled={saving}>
                {saving ? t('reservationEdit.saving') : t('reservationEdit.save')}
              </SaveButton>
              {!isNew && (
                <DeleteButton onClick={cancel}>
                  {t('reservationEdit.cancel') || 'Cancelar Reserva'}
                </DeleteButton>
              )}
            </div>
          </form>
        </Card>
      </div>

      {/* Diálogo de Confirmación */}
      <ConfirmDialog
        open={confirmDialog.open}
        onClose={() => setConfirmDialog({ open: false, onConfirm: null })}
        onConfirm={confirmDialog.onConfirm}
        title={t('reservationEdit.confirmCancel') || 'Cancelar Reserva'}
        message="¿Está seguro de que desea cancelar esta reserva?\n\nLa reserva cambiará a estado 'Cancelada' pero se mantendrá en el historial."
        variant="cancel"
        confirmText="Cancelar Reserva"
        isLoading={saving}
      />
    </div>
  );
}
