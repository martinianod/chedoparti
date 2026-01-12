// Servicio para integración con Mercado Pago
// Este archivo maneja la creación de preferencias y procesamiento de pagos

const MERCADOPAGO_PUBLIC_KEY =
  import.meta.env.VITE_MERCADOPAGO_PUBLIC_KEY || 'TEST-your-public-key';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

/**
 * Crea una preferencia de pago en Mercado Pago
 * @param {Object} orderData - Datos de la orden
 * @returns {Promise<Object>} - Respuesta con la preferencia creada
 */
export const createPaymentPreference = async (orderData) => {
  try {
    // En modo demo, simulamos la respuesta de MercadoPago
    if (MERCADOPAGO_PUBLIC_KEY.includes('TEST') || !orderData.items) {
      return createMockPreference(orderData);
    }

    // En producción, esto haría una llamada al backend
    const response = await fetch(`${API_BASE_URL}/payments/create-preference`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(orderData),
    });

    if (!response.ok) {
      throw new Error('Error creando preferencia de pago');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('❌ Error en createPaymentPreference:', error);
    throw error;
  }
};

/**
 * Simula la creación de preferencia para modo demo
 */
const createMockPreference = (orderData) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const preference = {
        id: `PREF-DEMO-${Date.now()}`,
        init_point: `https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=demo-${Date.now()}`,
        sandbox_init_point: `https://sandbox.mercadopago.com.ar/checkout/v1/redirect?pref_id=demo-${Date.now()}`,
        items: orderData.items,
        payer: orderData.payer,
        total_amount: orderData.items.reduce(
          (sum, item) => sum + item.unit_price * item.quantity,
          0
        ),
        created_at: new Date().toISOString(),
      };

      resolve({ data: preference });
    }, 1000); // Simular delay de red
  });
};

/**
 * Verifica el estado de un pago
 * @param {string} paymentId - ID del pago a verificar
 * @returns {Promise<Object>} - Estado del pago
 */
export const getPaymentStatus = async (paymentId) => {
  try {
    // En modo demo
    if (paymentId.includes('DEMO')) {
      return getMockPaymentStatus(paymentId);
    }

    const response = await fetch(`${API_BASE_URL}/payments/status/${paymentId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Error verificando estado del pago');
    }

    return await response.json();
  } catch (error) {
    console.error('❌ Error verificando pago:', error);
    throw error;
  }
};

/**
 * Simula verificación de pago para demo
 */
const getMockPaymentStatus = (paymentId) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Simular diferentes estados para demo
      const statuses = ['approved', 'pending', 'rejected'];
      const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];

      const payment = {
        id: paymentId,
        status: 'approved', // Para demo siempre aprobado
        status_detail: 'accredited',
        payment_method_id: 'visa',
        payment_type_id: 'credit_card',
        transaction_amount: Math.floor(Math.random() * 10000) + 1000,
        date_created: new Date().toISOString(),
        date_approved: new Date().toISOString(),
        payer: {
          email: 'socio@chedoparti.com',
        },
      };

      resolve({ data: payment });
    }, 500);
  });
};

/**
 * Redirige al checkout de MercadoPago
 * @param {string} initPoint - URL del checkout
 */
export const redirectToCheckout = (initPoint) => {
  // En modo demo, simular el proceso sin redirección real
  if (initPoint.includes('demo')) {
    // Mostrar modal de confirmación en vez de redirección real
    const confirmPayment = confirm(
      '🎭 MODO DEMO\n\n' +
        'En producción, serías redirigido a MercadoPago para completar el pago.\n\n' +
        '¿Simular pago exitoso?'
    );

    return Promise.resolve({
      success: confirmPayment,
      paymentId: `PAY-DEMO-${Date.now()}`,
      status: confirmPayment ? 'approved' : 'cancelled',
    });
  }

  // En producción, redirección real
  window.location.href = initPoint;
  return Promise.resolve({ redirected: true });
};

/**
 * Inicializa el SDK de MercadoPago (para integraciones avanzadas)
 */
export const initMercadoPago = () => {
  return new Promise((resolve, reject) => {
    // Cargar SDK de MercadoPago dinámicamente
    if (window.MercadoPago) {
      resolve(window.MercadoPago);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://sdk.mercadopago.com/js/v2';
    script.onload = () => {
      if (window.MercadoPago) {
        window.MercadoPago.setPublishableKey(MERCADOPAGO_PUBLIC_KEY);
        resolve(window.MercadoPago);
      } else {
        reject(new Error('Error cargando SDK de MercadoPago'));
      }
    };
    script.onerror = () => reject(new Error('Error cargando SDK de MercadoPago'));
    document.head.appendChild(script);
  });
};

// Configuración para diferentes ambientes
export const getMercadoPagoConfig = () => {
  const isDevelopment = import.meta.env.DEV;

  return {
    publicKey: MERCADOPAGO_PUBLIC_KEY,
    environment: isDevelopment ? 'sandbox' : 'production',
    locale: 'es-AR',
    theme: {
      elementsColor: '#f59e0b', // Gold color del tema
      headerColor: '#1e3a8a', // Navy color del tema
    },
  };
};

export default {
  createPaymentPreference,
  getPaymentStatus,
  redirectToCheckout,
  initMercadoPago,
  getMercadoPagoConfig,
};
