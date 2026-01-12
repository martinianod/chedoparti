# 🧪 TEST DEL FLUJO DE PAGO - MERCADOPAGO

## 📋 Pasos para Probar el Flujo Completo

### 1. Acceso a la Aplicación

- URL: `http://localhost:5175`
- **Usuario SOCIO**: `socio@chedoparti.com` / `socio123`
- **Usuario ADMIN**: `admin@chedoparti.com` / `admin123`

### 2. Flujo para USUARIO SOCIO (CON PAGO)

#### ✅ Paso 1: Login

1. Ir a `/login`
2. Usar credenciales SOCIO: `socio@chedoparti.com` / `socio123`
3. Verificar que muestre iniciales en avatar (no imagen)

#### ✅ Paso 2: Crear Nueva Reserva

1. Ir a `/reservations` → "Crear Reserva"
2. **Observar consola**: debería mostrar logs `🔍 Payment check`
3. Llenar formulario paso a paso:
   - **Cancha**: Seleccionar cualquier cancha (ej: Cancha Padel 1)
   - **Fecha**: Seleccionar fecha futura
   - **Hora inicio**: ej: 10:00
   - **Hora fin**: ej: 12:00

#### ✅ Paso 3: Verificar Sección de Pago

**DEBE aparecer automáticamente:**

- Sección "💳 Información de Pago"
- Precio calculado por hora
- Duración calculada (2 horas)
- Total calculado automáticamente
- Botón "Pagar con MercadoPago"

#### ✅ Paso 4: Intentar Guardar SIN Pagar

1. Click en "Guardar" (botón verde)
2. **Debe mostrar alerta**: "⚠️ Debe procesar el pago antes de confirmar..."

#### ✅ Paso 5: Procesar Pago

1. Click en "Pagar con MercadoPago"
2. **Debe mostrar alert**: "💳 Procesando pago..."
3. **Luego alert**: "¡Pago exitoso! ID: mock_payment_123..."

#### ✅ Paso 6: Confirmar Reserva

1. Después del pago exitoso, click en "Guardar"
2. **Debe**: Crear reserva y redirigir a `/reservations`
3. **Verificar**: Reserva aparece en la lista

### 3. Flujo para USUARIO ADMIN/COACH (SIN PAGO)

#### ✅ Comparación

1. Login con ADMIN: `admin@chedoparti.com` / `admin123`
2. Crear nueva reserva con los mismos datos
3. **NO debe aparecer sección de pago**
4. Click en "Guardar" → **Crea reserva directamente**

---

## 🐛 Debugging

### Console Logs Esperados:

```
🔍 Payment check: {userRole: "SOCIO", courtId: "1", date: "2025-11-15", ...}
💳 PaymentSection render: {courtId: "1", startTime: "10:00", ...}
🏦 Creando preferencia de MercadoPago: {...}
✅ Pago exitoso: {id: "mock_payment_123", amount: 5000}
```

### Problemas Comunes:

- **Sección de pago no aparece**: Revisar rol de usuario y datos del formulario
- **Error al procesar pago**: Revisar servicios de MercadoPago
- **No puede guardar después de pagar**: Verificar `paymentRequired` se establezca a `false`

---

## ✅ Resultado Esperado

**SOCIO**: Formulario → PaymentSection → Pago → Reserva ✅  
**ADMIN/COACH**: Formulario → Reserva ✅
