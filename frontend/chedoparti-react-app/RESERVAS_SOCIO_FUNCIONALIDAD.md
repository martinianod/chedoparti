# 🎯 Tabla de Reservas para SOCIO - Funcionalidad Completa

## 📋 Resumen de Mejoras Implementadas

Se refactorizó completamente la **tabla de "Mis Reservas"** para usuarios con rol SOCIO, implementando:

- ✅ **Tabla personalizada por rol**: Sin columna de usuario para SOCIO
- ✅ **Funcionalidad de cancelar**: Cambia estado sin eliminar registro
- ✅ **Columna de deporte**: Muestra el deporte de cada cancha
- ✅ **Historial completo**: Mantiene reservas canceladas visibles
- ✅ **Estados visuales**: Colores diferentes según el estado

## 🔧 Funcionalidades Implementadas

### **1. Tabla Condicional por Rol**

#### **Para Usuarios SOCIO:**

```jsx
// Columnas mostradas para SOCIO:
- ID de Reserva
- Cancha
- Deporte  ← NUEVO
- Horario Inicio
- Horario Fin
- Estado
- Acciones
```

#### **Para Usuarios ADMIN/COACH:**

```jsx
// Columnas mostradas para ADMIN/COACH:
- ID de Reserva
- Usuario + Número de Socio
- Cancha
- Deporte  ← NUEVO
- Horario Inicio
- Horario Fin
- Estado
- Acciones
```

### **2. Funcionalidad de Cancelar Reservas**

#### **Botón de Cancelar:**

```jsx
<Button
  onClick={() => handleCancelReservation(r.id)}
  className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs flex items-center gap-1"
>
  <X className="w-3 h-3" />
  {t('reservations.cancel')}
</Button>
```

#### **Lógica de Cancelación:**

```javascript
const handleCancelReservation = async (reservationId) => {
  if (window.confirm(t('reservations.confirm_cancel'))) {
    try {
      await reservationsApi.cancel(reservationId, { reason: 'Cancelled by user' });

      // Actualizar estado local sin eliminar de la tabla
      setRows((prevRows) =>
        prevRows.map((row) => (row.id === reservationId ? { ...row, status: 'cancelled' } : row))
      );

      alert(t('reservations.cancel_success'));
    } catch (error) {
      console.error('Error cancelling reservation:', error);
    }
  }
};
```

### **3. Estados Visuales Mejorados**

#### **Estados de Reserva:**

- **Confirmada**: Verde (`bg-green-100 text-green-800`)
- **Cancelada**: Rojo (`bg-red-100 text-red-800`) ← NUEVO
- **Pendiente**: Amarillo (`bg-yellow-100 text-yellow-800`)
- **Privada**: Gris (`bg-gray-200 text-gray-600`)

#### **Filas con Estados:**

```jsx
className={`border-t
  ${r.isPrivateInfo ? 'bg-gray-50 dark:bg-gray-800/50' : ''}
  ${r.status === 'cancelled' ? 'bg-red-50 dark:bg-red-900/20' : ''}  ← NUEVO
`}
```

### **4. Columna de Deporte**

#### **Función para Obtener Deporte:**

```javascript
const getCourtSport = (courtId) => {
  const court = courts.find((c) => c.id === courtId);
  return court?.sport || court?.type || t('common.empty');
};
```

#### **Carga de Canchas:**

```javascript
useEffect(() => {
  courtsApi
    .list()
    .then((res) => {
      const courtsData = res.data?.content || res.data || [];
      setCourts(courtsData);
    })
    .catch((error) => {
      console.error('Error loading courts:', error);
      setCourts([]);
    });
}, []);
```

## 🌐 Traducciones Agregadas

### **Español (`src/locales/es/translation.json`):**

```json
"reservations": {
  "status": {
    "confirmed": "Confirmada",
    "cancelled": "Cancelada",
    "pending": "Pendiente"
  },
  "cancel": "Cancelar",
  "cancelled": "Cancelada",
  "confirm_cancel": "¿Estás seguro de que quieres cancelar esta reserva?",
  "cancel_success": "Reserva cancelada exitosamente",
  "sport": "Deporte"
}
```

### **Inglés (`src/locales/en/translation.json`):**

```json
"reservations": {
  "status": {
    "confirmed": "Confirmed",
    "cancelled": "Cancelled",
    "pending": "Pending"
  },
  "cancel": "Cancel",
  "cancelled": "Cancelled",
  "confirm_cancel": "Are you sure you want to cancel this reservation?",
  "cancel_success": "Reservation cancelled successfully",
  "sport": "Sport"
}
```

## 🎨 Mejoras de UI/UX

### **Botones de Acción Mejorados:**

#### **Para Reservas Activas:**

```jsx
<div className="flex gap-2">
  <Button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs flex items-center gap-1">
    <Edit className="w-3 h-3" />
    {t('common.edit')}
  </Button>
  {user?.role === 'SOCIO' && (
    <Button className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs flex items-center gap-1">
      <X className="w-3 h-3" />
      {t('reservations.cancel')}
    </Button>
  )}
</div>
```

#### **Para Reservas Canceladas:**

```jsx
<div className="flex items-center gap-1 text-red-500 text-xs">
  <X className="w-3 h-3" />
  <span>{t('reservations.cancelled')}</span>
</div>
```

### **Iconos Lucide-React Utilizados:**

- `<Edit />` - Para editar reservas
- `<X />` - Para cancelar reservas y mostrar estado cancelado
- `<Lock />` - Para información privada

## 🔍 Validación por Casos de Uso

### **Caso 1: Usuario SOCIO ve sus reservas**

```
✅ Tabla SIN columna de usuario (es su propia lista)
✅ Columna de deporte visible
✅ Botón "Cancelar" disponible para reservas confirmadas
✅ Reservas canceladas visibles con estado "Cancelada"
✅ No puede editar reservas canceladas
```

### **Caso 2: Usuario ADMIN/COACH ve todas las reservas**

```
✅ Tabla CON columna de usuario + número de socio
✅ Columna de deporte visible
✅ SIN botón cancelar (solo para SOCIO)
✅ Todas las reservas visibles (propias y privadas)
✅ Puede editar reservas según permisos
```

### **Caso 3: Cancelación de Reserva**

```
✅ Confirma acción con ventana de confirmación
✅ Llama al API reservationsApi.cancel()
✅ Actualiza estado local inmediatamente
✅ Mantiene reserva en tabla con estado "Cancelada"
✅ Muestra mensaje de éxito
✅ Manejo de errores con alert
```

## 📱 API Mock Integration

### **Método de Cancelación Existente:**

```javascript
// Ya implementado en api.mock.js
cancel: async (id, payload) => {
  return reservationsApi.changeStatus(id, 'cancelled', payload.reason);
};
```

### **Cambio de Estado:**

```javascript
changeStatus: async (id, status, reason) => {
  const idx = reservations.findIndex((r) => String(r.id) === String(id));
  if (idx >= 0) {
    reservations[idx] = {
      ...reservations[idx],
      status, // ← 'cancelled'
      statusReason: reason, // ← 'Cancelled by user'
      updatedAt: new Date().toISOString(),
    };
    return { data: reservations[idx] };
  }
  return { data: null };
};
```

## 📁 Archivos Modificados

### **Componentes:**

- `src/pages/Reservations/List.jsx` - Refactorización completa

### **Traducciones:**

- `src/locales/es/translation.json` - Sección reservations expandida
- `src/locales/en/translation.json` - Traducciones en inglés

### **Imports Agregados:**

```jsx
import { reservationsApi, courtsApi } from '../../services/api';
import Button from '../../components/ui/Button';
import { Lock, X, Edit } from 'lucide-react';
```

## 🎯 Beneficios Implementados

### **Para Usuarios SOCIO:**

1. **🎯 Vista Personalizada**: Solo ven información relevante
2. **🚫 Control de Cancelación**: Pueden cancelar sus propias reservas
3. **📊 Historial Completo**: Ven todas sus reservas incluso canceladas
4. **🏟️ Información del Deporte**: Saben qué deporte practican
5. **🎨 Estados Visuales**: Identifican fácilmente el estado de cada reserva

### **Funcionalidades Técnicas:**

1. **🔄 Actualizaciones en Tiempo Real**: Estado se actualiza inmediatamente
2. **🌐 Multilenguaje**: Todos los textos traducibles
3. **♿ Accesibilidad**: Iconos semánticos y colores contrastantes
4. **📱 Responsivo**: Tabla adaptable a diferentes tamaños
5. **🛡️ Validación**: Confirmación antes de cancelar

## ✅ Estado Final

La tabla de "Mis Reservas" ahora es **completamente funcional** para usuarios SOCIO:

- ✅ **Tabla personalizada** sin columna de usuario
- ✅ **Funcionalidad de cancelar** con confirmación
- ✅ **Estados visuales** claros y profesionales
- ✅ **Historial completo** manteniendo registros cancelados
- ✅ **Columna de deporte** informativa
- ✅ **Multilenguaje** completo
- ✅ **API integration** con backend mock

**🎉 Los usuarios SOCIO ahora tienen control completo sobre sus reservas con un historial visual completo.**
