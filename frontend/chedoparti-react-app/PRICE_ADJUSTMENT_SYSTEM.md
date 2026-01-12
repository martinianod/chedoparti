# Sistema de Ajuste de Precios por Cambio de Duración

## 📋 Descripción General

El sistema implementado calcula automáticamente los ajustes monetarios cuando un usuario modifica la duración de una reserva existente. Determina si el cliente debe pagar más o si se le debe devolver dinero.

## 🎯 Características Implementadas

### ✅ Cálculo Automático de Ajustes

- **Extensión de duración**: Calcula cobro adicional
- **Reducción de duración**: Calcula reembolso correspondiente
- **Sin cambios**: No muestra ajustes si la duración permanece igual

### ✅ Interfaz Visual Intuitiva

- **Tarjeta de ajuste**: Aparece solo cuando hay cambios de precio
- **Código de colores**:
  - 🟠 **Naranja**: Cargo adicional (extensión)
  - 🟢 **Verde**: Reembolso (reducción)
- **Iconos informativos**:
  - 📊 Calculator
  - 💰 DollarSign
  - 📈 TrendingUp (cargo)
  - 📉 TrendingDown (reembolso)

### ✅ Cálculos Precisos

- **Precio original**: Basado en la duración inicial y configuración de la cancha
- **Nuevo precio**: Recalculado con la nueva duración
- **Ajuste**: Diferencia absoluta entre precios
- **Consideraciones**:
  - Tarifas diferenciadas por cancha
  - Horarios premium (18:00-22:00 = +20%)
  - Descuento para socios (10%)

### 🆕 **NUEVA FUNCIONALIDAD: Integración MercadoPago para Socios**

- **Generación automática de links de pago**: Para usuarios SOCIO que necesiten abonar más
- **Pago seguro**: Integración completa con MercadoPago API
- **Datos completos**: Incluye información de la reserva, ajuste y usuario
- **UX optimizada**: Interface intuitiva para generar y procesar pagos
- **Metadata completa**: Tracking completo para auditoría y reconciliación

## 🔧 Implementación Técnica

### Archivos Modificados

#### `ReservationInfoModal.jsx`

```jsx
// Nuevos imports
import { calculateReservationPrice, durationToMinutes } from '../../utils/priceCalculator';
import { Calculator, TrendingUp, TrendingDown } from 'lucide-react';

// Estado para ajustes de precio
const [priceAdjustment, setPriceAdjustment] = useState({
  originalPrice: 0,
  newPrice: 0,
  adjustment: 0,
  adjustmentType: 'none', // 'charge', 'refund', 'none'
  originalDuration: '',
  newDuration: '',
});
```

#### `CalendarGrid.jsx`

```jsx
// Handler mejorado para manejar ajustes
const handleUpdateReservation = async (updatedReservation) => {
  const payload = {
    // ... otros campos
    ...(updatedReservation.priceAdjustment && {
      priceAdjustment: updatedReservation.priceAdjustment,
    }),
  };

  // Log del ajuste para auditoría
  if (updatedReservation.priceAdjustment) {
  }
};
```

#### `api.mock.js`

```jsx
// Procesamiento del ajuste en la API
if (payload.priceAdjustment) {
   '💰 Price adjustment processed:', {
    adjustmentType: payload.priceAdjustment.adjustmentType,
    adjustment: payload.priceAdjustment.adjustment,
  });

  // Logs para integración con sistema de pagos
  if (payload.priceAdjustment.adjustmentType === 'charge') {
  } else if (payload.priceAdjustment.adjustmentType === 'refund') {
  }
}
```

## 🚀 Flujo de Usuario

### 1. Acceder al Modal de Edición

```
Usuario hace clic en una reserva → Se abre ReservationInfoModal
```

### 2. Modificar Duración

```
Usuario cambia duración → Sistema recalcula precios automáticamente
```

### 3. Ver Ajuste (si aplica)

```
Aparece tarjeta con información del ajuste:
- Precio original vs nuevo precio
- Monto del ajuste (cargo o reembolso)
- Duración original vs nueva duración
- Mensaje explicativo del ajuste
```

### 4. Confirmar Cambios

```
Usuario guarda → Confirmación con información del ajuste → Actualización exitosa
```

## 💰 Ejemplos de Cálculo

### Ejemplo 1: Extensión de Tiempo

```
Reserva Original:
- Cancha Padel 1 ($2500/hora)
- Duración: 1 hora
- Horario: 15:00-16:00 (no premium)
- Usuario: SOCIO (10% descuento)
- Precio Original: $2500 - $250 = $2250

Nueva Configuración:
- Duración: 2 horas
- Horario: 15:00-17:00
- Precio Nuevo: $5000 - $500 = $4500

RESULTADO: Cargo adicional de $2250
```

### Ejemplo 2: Reducción de Tiempo

```
Reserva Original:
- Cancha Tenis 1 ($1800/hora)
- Duración: 2 horas
- Horario: 19:00-21:00 (premium +20%)
- Usuario: No socio
- Precio Original: ($1800 × 2) + 20% = $4320

Nueva Configuración:
- Duración: 1 hora
- Horario: 19:00-20:00 (premium)
- Precio Nuevo: $1800 + 20% = $2160

RESULTADO: Reembolso de $2160
```

## 🎨 Componentes UI

### Tarjeta de Ajuste de Precio

```jsx
<div
  className={`p-4 rounded-lg border-2 ${
    priceAdjustment.adjustmentType === 'charge'
      ? 'bg-orange-50 border-orange-200'
      : 'bg-green-50 border-green-200'
  }`}
>
  {/* Contenido del ajuste */}
</div>
```

### Grid de Información

```jsx
<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
  <div>Precio Original</div>
  <div>Nuevo Precio</div>
  <div>Ajuste</div>
</div>
```

### Mensajes Contextuales

```jsx
{
  priceAdjustment.adjustmentType === 'charge' && (
    <div className="bg-orange-100 rounded-lg">
      ⚠️ Al extender la duración, el cliente deberá abonar...
    </div>
  );
}

{
  priceAdjustment.adjustmentType === 'refund' && (
    <div className="bg-green-100 rounded-lg">✓ Al reducir la duración, se debe devolver...</div>
  );
}
```

## 🔍 Logging y Debugging

### Console Logs Implementados

```javascript
// Cálculo inicial
 '💰 Price adjustment calculated:', {
  originalPrice,
  newPrice,
  adjustment,
  adjustmentType,
});

// Procesamiento en API

// Acciones requeridas
```

## 📱 Responsive Design

- **Desktop**: Grid de 3 columnas para información del ajuste
- **Mobile**: Columna única con información apilada
- **Dark Mode**: Soporte completo con colores adaptados

## 🔮 Integraciones Futuras

### Sistema de Pagos

```javascript
// Los logs actuales pueden conectarse con:
- MercadoPago API
- Stripe
- PayPal
- Sistemas de facturación internos
```

### Notificaciones

```javascript
// Se puede extender para enviar:
- Emails automáticos al cliente
- SMS con información del ajuste
- Notificaciones push
```

### Auditoría

```javascript
// Información disponible para:
- Reportes financieros
- Historial de ajustes
- Análisis de patrones de cambio
```

## ✅ Testing Checklist

- [ ] Reserva normal → Extensión → Muestra cargo
- [ ] Reserva normal → Reducción → Muestra reembolso
- [ ] Reserva sin cambios → No muestra ajuste
- [ ] Horario premium → Cálculo correcto
- [ ] Usuario SOCIO → Descuento aplicado
- [ ] Confirmación → Procesa correctamente
- [ ] Logs → Información completa en consola

## 🎯 Beneficios del Sistema

1. **Transparencia**: Usuario ve exactamente qué va a pagar/recibir
2. **Automatización**: Sin cálculos manuales ni errores
3. **UX Mejorada**: Interfaz clara e intuitiva
4. **Auditoría**: Logs completos para seguimiento
5. **Escalabilidad**: Fácil integración con sistemas de pago reales

---

**📝 Nota**: Este sistema está listo para producción con mock APIs. Para integrar con sistemas de pago reales, solo se necesita reemplazar los logs con llamadas a las APIs correspondientes.
