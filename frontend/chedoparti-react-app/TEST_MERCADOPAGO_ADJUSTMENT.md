# Test Manual: Sistema de Pago MercadoPago para Ajuste de Duración

## 🧪 Escenario de Prueba

### Datos de Prueba

- **Usuario**: SOCIO (admin@chedoparti.com / admin123)
- **Acción**: Extender duración de reserva existente
- **Cancha**: Padel 1 ($2500/hora)
- **Duración Original**: 1 hora
- **Nueva Duración**: 2 horas
- **Ajuste Esperado**: ~$2250 (con descuento de socio)

## 📋 Pasos para Probar

### 1. Iniciar sesión como SOCIO

```
Ir a: http://localhost:5177
Email: admin@chedoparti.com
Password: admin123
```

### 2. Acceder a una reserva existente

```
Dashboard → Hacer clic en cualquier reserva existente
```

### 3. Modificar duración

```
Modal de edición → Cambiar duración de 1:00 a 2:00
Verificar que aparece la tarjeta de "Ajuste de Precio"
```

### 4. Generar link de pago (NUEVO)

```
Verificar que aparece la sección "Generar Pago con MercadoPago"
Hacer clic en "Generar Pago por $X"
Verificar que se genera el link exitosamente
```

### 5. Probar link de MercadoPago

```
Hacer clic en "Ir a MercadoPago y Pagar $X"
Verificar que se abre en nueva pestaña
Verificar datos del pago en la página de MercadoPago (DEMO)
```

## ✅ Verificaciones Esperadas

### Interface

- [ ] Aparece tarjeta de ajuste naranja para cargo adicional
- [ ] Se muestra precio original vs nuevo precio
- [ ] Aparece sección específica para MercadoPago (solo para SOCIOS)
- [ ] Botón de "Generar Pago" funcional

### Funcionalidad MercadoPago

- [ ] Genera link de pago correctamente
- [ ] Link incluye monto correcto
- [ ] Datos del pagador son correctos (nombre, email, teléfono)
- [ ] Metadata incluye información de la reserva
- [ ] Se abre en nueva pestaña

### Logs en Consola

- [ ] `💳 Generando link de pago para ajuste de duración`
- [ ] `💳 Datos del pago:` con información completa
- [ ] `✅ Link de pago generado:` con URL de MercadoPago

### Datos Esperados en MercadoPago

```json
{
  "title": "Extensión de Reserva - Cancha Padel 1",
  "description": "Ajuste por extensión de duración de 01:00 a 02:00",
  "unit_price": 2250, // Precio con descuento de socio
  "payer": {
    "name": "Admin User",
    "email": "admin@chedoparti.com"
  },
  "metadata": {
    "reservation_id": "ID_de_reserva",
    "adjustment_type": "duration_extension",
    "user_type": "SOCIO"
  }
}
```

## 🚨 Casos Edge a Probar

### 1. Usuario no SOCIO

```
Iniciar sesión con socio@chedoparti.com
Verificar que NO aparece la sección de MercadoPago
```

### 2. Reducción de duración

```
Cambiar de 2:00 a 1:00
Verificar que NO aparece MercadoPago (solo para reembolsos)
```

### 3. Sin cambios

```
Mantener duración igual
Verificar que NO aparece tarjeta de ajuste
```

## 🔍 Debug Tips

### Console Logs a Buscar

```javascript
// Cálculo de ajuste
💰 Price adjustment calculated: { adjustmentType: 'charge', adjustment: 2250 }

// Generación de pago
💳 Generando link de pago para ajuste de duración
💳 Datos del pago: { items, payer, metadata }
✅ Link de pago generado: https://www.mercadopago.com.ar/checkout/...
```

### Errores Comunes

- **Error 1**: "No se pudo generar el link de pago"
  - Verificar que mercadopago.js está importado correctamente
  - Revisar estructura de orderData

- **Error 2**: Botón no aparece
  - Verificar que currentUser.userType === 'SOCIO'
  - Verificar que adjustmentType === 'charge'

- **Error 3**: Link no funciona
  - Es normal en DEMO mode, debería mostrar página de MercadoPago sandbox

## 📊 Métricas de Éxito

- ✅ Interfaz se muestra correctamente para usuarios SOCIO
- ✅ Cálculos de precio son precisos
- ✅ Generación de link es rápida (< 2 segundos)
- ✅ Datos enviados a MercadoPago son completos
- ✅ UX es intuitiva y clara
- ✅ No hay errores en consola del navegador

---

**🎯 Objetivo**: Validar que los usuarios SOCIO pueden generar fácilmente un link de pago cuando extienden la duración de sus reservas, integrándose seamlessly con MercadoPago.
