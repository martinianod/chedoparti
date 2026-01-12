import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { CreditCard, Calculator, Clock, Lock, ShieldCheck } from 'lucide-react';
import Card from './Card';
import Button from './Button';
import { calculateReservationPrice, calculateDuration } from '../../utils/priceCalculator';

export default function PaymentSection({
  courtId,
  startTime,
  endTime,
  duration: durationProp, // Nueva prop para duración directa
  date,
  onPaymentSuccess,
  onPaymentError,
}) {
  const { t } = useTranslation();
  const [courtPricing, setCourtPricing] = useState(null);
  const [totalAmount, setTotalAmount] = useState(0);
  const [duration, setDuration] = useState(0);
  const [loading, setLoading] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [priceBreakdown, setPriceBreakdown] = useState(null);

  // Log estado actual para debugging
  const buttonDisabled = loading || totalAmount <= 0 || paymentProcessing;

  // LOGS SIMPLIFICADOS PARA DEBUG
  if (buttonDisabled) {
  } else {
  }

  // Calcular duración en horas
  useEffect(() => {
    let calculatedDuration = 0;

    // Priorizar duración pasada como prop (formato "HH:MM")
    if (durationProp) {
      if (typeof durationProp === 'string' && durationProp.includes(':')) {
        const [hours, minutes] = durationProp.split(':').map(Number);
        calculatedDuration = hours + minutes / 60;
      } else {
        calculatedDuration = 0;
      }
    }
    // Fallback: calcular de startTime y endTime
    else if (startTime && endTime) {
      calculatedDuration = calculateDuration(startTime, endTime);
    }

    const finalDuration = Math.max(0, calculatedDuration);

    setDuration(finalDuration);
  }, [startTime, endTime, durationProp]);

  // Calcular precio usando la función común
  useEffect(() => {
    // Validar datos básicos requeridos
    if (!courtId || !startTime) {
      return;
    }

    // Priorizar durationProp si está disponible, sino usar duration calculado
    let durationToUse = duration;

    if (durationProp && typeof durationProp === 'string' && durationProp.includes(':')) {
      // Usar durationProp directamente si está disponible
      durationToUse = durationProp;
    } else if (duration <= 0) {
      return;
    }

    setLoading(true);
    try {
      // Usar la función común de cálculo
      const result = calculateReservationPrice({
        courtId: courtId,
        startTime: startTime,
        duration: durationToUse, // usar durationProp si está disponible
        isMember: true, // PaymentSection solo se muestra para SOCIOs
        options: {
          roundTo: 100,
        },
      });

      // Actualizar estados
      setCourtPricing(result.courtInfo);
      setTotalAmount(result.price);
      setPriceBreakdown(result.breakdown);
    } catch (error) {
      console.error('Error calculating pricing:', error);
      setCourtPricing({ hourlyRate: 2000, courtName: 'Cancha', sport: 'Deportes' });
      setTotalAmount(0);
    } finally {
      setLoading(false);
    }
  }, [courtId, startTime, duration, durationProp]); // Se ejecuta cuando cambia durationProp

  const handlePayment = async () => {
    if (!courtPricing || totalAmount <= 0) return;

    setPaymentProcessing(true);
    try {
      // Simular creación de preferencia de MercadoPago
      const preference = {
        items: [
          {
            title: `Reserva ${courtPricing.courtName}`,
            description: `${courtPricing.sport} - ${date} ${startTime} a ${endTime} (${duration}h)`,
            unit_price: totalAmount,
            quantity: 1,
          },
        ],
        payer: {
          name: 'Usuario del Club',
          email: 'socio@chedoparti.com',
        },
        back_urls: {
          success: `${window.location.origin}/payment/success`,
          failure: `${window.location.origin}/payment/failure`,
          pending: `${window.location.origin}/payment/pending`,
        },
        auto_return: 'approved',
      };

      // En un entorno real, aquí crearías la preferencia en el backend
      // y redirigirías al checkout de MercadoPago

      // Simulación para demo
      const mockPaymentResponse = {
        id: `MP-${Date.now()}`,
        init_point: 'https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=demo',
        status: 'pending',
      };

      // Simular delay de procesamiento
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Para demo, simular pago exitoso
      const paymentResult = {
        id: mockPaymentResponse.id,
        status: 'approved',
        amount: totalAmount,
        method: 'credit_card',
      };

      onPaymentSuccess?.(paymentResult);
    } catch (error) {
      console.error('Error procesando pago:', error);
      onPaymentError?.(error);
    } finally {
      setPaymentProcessing(false);
    }
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
        </div>
      </Card>
    );
  }

  if (!courtPricing) {
    return null;
  }

  return (
    <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-navy-800 dark:to-navy-900 border-2 border-blue-200 dark:border-blue-800">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
          <CreditCard className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-navy dark:text-gold flex items-center gap-2">
            {t('payment.title')}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">{t('payment.subtitle')}</p>
        </div>
      </div>
      {/* Detalles del cálculo */}
      <div className="bg-white dark:bg-navy rounded-lg p-4 mb-4 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 mb-3">
          <Calculator className="w-4 h-4 text-blue-500" />
          <span className="font-medium text-navy dark:text-gold">{t('payment.cost_detail')}</span>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-300">{t('payment.court')}:</span>
            <span className="font-medium">{courtPricing.courtName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-300">{t('payment.sport')}:</span>
            <span className="font-medium">{courtPricing.sport}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-300">{t('payment.date')}:</span>
            <span className="font-medium">{date}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600 dark:text-gray-300 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {t('payment.schedule')}:
            </span>
            <span className="font-medium">
              {startTime} - {endTime}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-300">{t('payment.duration')}:</span>
            <span className="font-medium">
              {priceBreakdown?.durationHours || duration}
              {t('payment.hours_short')}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-300">{t('payment.price_per_hour')}:</span>
            <span className="font-medium">${courtPricing.hourlyRate.toLocaleString()}</span>
          </div>

          {/* Desglose detallado del cálculo */}
          {priceBreakdown && (
            <>
              <hr className="border-gray-200 dark:border-gray-700" />
              <div className="text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">
                    Precio base ({priceBreakdown.durationHours}h):
                  </span>
                  <span>${priceBreakdown.basePrice.toLocaleString()}</span>
                </div>

                {priceBreakdown.isPremium && (
                  <div className="flex justify-between text-orange-600 dark:text-orange-400">
                    <span className="flex items-center gap-1">
                      🌙 Recargo premium (18:00-22:00):
                    </span>
                    <span>+${priceBreakdown.premiumSurcharge.toLocaleString()}</span>
                  </div>
                )}

                {priceBreakdown.isMember && (
                  <div className="flex justify-between text-green-600 dark:text-green-400">
                    <span className="flex items-center gap-1">✨ Descuento socio (10%):</span>
                    <span>-${priceBreakdown.memberDiscount.toLocaleString()}</span>
                  </div>
                )}
              </div>
            </>
          )}

          <hr className="border-gray-300 dark:border-gray-600" />

          <div className="flex justify-between text-lg font-bold">
            <span className="text-navy dark:text-gold">{t('payment.total')}:</span>
            <span className="text-blue-600 dark:text-blue-400">
              ${totalAmount.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* DEBUG: Estado del botón */}
      {buttonDisabled && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <strong>🔍 DEBUG - Botón deshabilitado:</strong>
          <ul className="list-disc list-inside mt-2 text-sm">
            <li>Loading: {loading ? '✅' : '❌'}</li>
            <li>
              Total Amount: {totalAmount} {totalAmount <= 0 ? '❌ (debe ser > 0)' : '✅'}
            </li>
            <li>Payment Processing: {paymentProcessing ? '✅' : '❌'}</li>
            <li>Duration: {duration} horas</li>
            <li>Duration Prop: {durationProp}</li>
          </ul>
        </div>
      )}

      {/* Botón de pago */}
      <Button
        onClick={handlePayment}
        disabled={buttonDisabled}
        variant="primary"
        size="lg"
        className="w-full font-semibold"
        loading={paymentProcessing}
      >
        <CreditCard className="w-5 h-5" />
        {paymentProcessing
          ? t('payment.processing')
          : t('payment.pay_button', { amount: totalAmount.toLocaleString() })}
      </Button>
      <p className="text-xs text-gray-500 text-center mt-3 flex items-center justify-center gap-1">
        <ShieldCheck className="w-3 h-3" />
        {t('payment.secure_payment')}
      </p>
    </Card>
  );
}
