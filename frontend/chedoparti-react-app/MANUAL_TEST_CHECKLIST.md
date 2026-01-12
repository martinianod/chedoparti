# Test Script: Modal de Edición con MercadoPago

## 🧪 Prueba Rápida para Verificar Funcionalidad

### 1. Login como SOCIO

```
URL: http://localhost:5177
Email: socio@chedoparti.com
Password: socio123
```

### 2. Verificar Campos No Editables

- [ ] Campo "Usuario / Teléfono" es de solo lectura (gris)
- [ ] Campo "Deporte" es de solo lectura (gris)
- [ ] Ambos campos muestran mensaje explicativo

### 3. Crear Ajuste de Precio

- [ ] Hacer clic en cualquier reserva
- [ ] Cambiar duración de 1:00 a 2:00
- [ ] Verificar que aparece tarjeta naranja de ajuste
- [ ] Verificar cálculo correcto con descuento de socio

### 4. Verificar Sección MercadoPago

- [ ] Aparece sección azul "Generar Pago con MercadoPago"
- [ ] Botón "Generar Pago por $X" funcional
- [ ] Al hacer clic, genera link exitosamente
- [ ] Aparece botón verde "Ir a MercadoPago y Pagar $X"
- [ ] Link abre en nueva pestaña

### 5. Verificar Logs de Console

```javascript
// Verificar estos logs en la consola del navegador:
🔄 Loading reservation data into form: {
  currentUser: { role: 'SOCIO', name: 'Ana Garcia' },
  userRole: 'SOCIO'
}

💰 Price adjustment calculated: {
  adjustmentType: 'charge',
  showMercadoPago: true,
  currentUserRole: 'SOCIO',
  isCharge: true
}

💳 Generando link de pago para ajuste de duración
💳 Datos del pago: { ... }
✅ Link de pago generado: https://www.mercadopago...
```

## ✅ Resultado Esperado

### Interface Correcta

```
┌─────────────────────────────────────────────┐
│ 📝 Editar Reserva #123                     │
├─────────────────────────────────────────────┤
│ Usuario: Ana Garcia        [SOLO LECTURA]   │
│ Fecha: [EDITABLE]          Hora: [EDITABLE] │
│ Duración: [EDITABLE]       Cancha: [EDITABLE]│
│ Deporte: Padel            [SOLO LECTURA]    │
│ Tipo: [EDITABLE]                            │
├─────────────────────────────────────────────┤
│ 🧮 Ajuste de Precio por Cambio de Duración │
│ Original: $2500 → Nuevo: $4500 → +$2000   │
├─────────────────────────────────────────────┤
│ 💳 Generar Pago con MercadoPago             │
│ [Generar Pago por $2,000]                  │
│          ↓ (después de hacer clic)          │
│ ✅ Link generado exitosamente               │
│ [🔗 Ir a MercadoPago y Pagar $2,000]      │
└─────────────────────────────────────────────┘
```

### Datos de MercadoPago

```json
{
  "title": "Extensión de Reserva - Cancha X",
  "description": "Ajuste por extensión de duración de 01:00 a 02:00",
  "unit_price": 2000,
  "payer": {
    "name": "Ana Garcia",
    "email": "socio@chedoparti.com"
  },
  "metadata": {
    "user_type": "SOCIO",
    "adjustment_type": "duration_extension"
  }
}
```

## 🚨 Si No Funciona

### Problema: No aparece sección MercadoPago

**Solución**: Verificar en console:

- `currentUser.role` debe ser `'SOCIO'`
- `adjustmentType` debe ser `'charge'`

### Problema: Campos siguen siendo editables

**Solución**: Verificar que los campos muestran fondo gris y no tienen `onChange`

### Problema: Error al generar pago

**Solución**: Verificar import de mercadopago.js y estructura de datos

---

**🎯 Si todos los checkboxes están marcados, la implementación está funcionando correctamente!** ✅
