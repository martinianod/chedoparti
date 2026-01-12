# Sistema de Duraciones Dinámicas Disponibles

## 🎯 Funcionalidad Implementada

En lugar de mostrar todas las duraciones posibles y validar después, el sistema ahora **calcula y muestra únicamente las duraciones que están disponibles** sin causar superposiciones con otras reservas.

## ✨ Características Principales

### **🔍 Cálculo Inteligente de Disponibilidad**

```javascript
// Evalúa duraciones: 30min, 1h, 1.5h, 2h, 2.5h, 3h
const possibleDurations = [30, 60, 90, 120, 150, 180];

// Solo muestra las que NO generan conflictos
availableDurations = durationsWithoutConflicts;
```

### **📱 Interface Adaptativa**

- **Selector Dinámico**: Opciones cambian según disponibilidad real
- **Contador Visual**: "(X opciones disponibles)" en la etiqueta
- **Estados Informativos**:
  - ✅ "Calculando disponibilidad..." durante carga
  - ⚠️ "No hay duraciones disponibles" cuando aplique
  - 🔄 Auto-selección de primera opción válida

### **🧠 Lógica Preventiva**

- **Exclusión Inteligente**: No considera la reserva actual como conflicto
- **Validación Cruzada**: Considera cancha, fecha, hora y duraciones existentes
- **Auto-Ajuste**: Si duración actual se vuelve inválida, cambia automáticamente

## 🚀 Beneficios del Usuario

### **Antes (Sistema Reactivo)**

```
1. Usuario selecciona duración → 2 horas
2. Sistema valida → ❌ Error: "Se superpone con reserva"
3. Usuario prueba → 1.5 horas
4. Sistema valida → ❌ Error: "Se superpone con reserva"
5. Usuario prueba → 1 hora
6. Sistema valida → ✅ Disponible
```

### **Ahora (Sistema Proactivo)**

```
1. Usuario abre modal → Sistema calcula automáticamente
2. Selector muestra → "1 hora" (única opción disponible)
3. Usuario selecciona → ✅ Inmediatamente válido
4. Cambio de hora → Opciones se recalculan dinámicamente
```

## 🔧 Implementación Técnica

### **Función Principal: `getAvailableDurations`**

```javascript
const getAvailableDurations = (startTime, courtId, date, excludeReservationId) => {
  const possibleDurations = [30, 60, 90, 120, 150, 180];
  const availableDurations = [];

  for (const durationMins of possibleDurations) {
    const durationStr = minutesToTimeFormat(durationMins);

    if (isDurationAvailable(startTime, durationStr, courtId, date, excludeReservationId)) {
      availableDurations.push({
        value: durationStr, // "01:00"
        label: durationLabel, // "1 hora"
        minutes: durationMins, // 60
      });
    }
  }

  return availableDurations;
};
```

### **Estados y Efectos Reactivos**

```javascript
// Estado para duraciones disponibles
const [availableDurations, setAvailableDurations] = useState([]);

// Recalcular cuando cambien campos críticos
useEffect(() => {
  if (form.time && form.courtId && form.date && reservation?.id) {
    const available = getAvailableDurations(...);
    setAvailableDurations(available);

    // Auto-ajuste si duración actual no está disponible
    if (!currentDurationValid) {
      setForm(prev => ({ ...prev, duration: available[0]?.value }));
    }
  }
}, [form.time, form.courtId, form.date, reservation?.id, reservations]);
```

### **Selector Dinámico**

```jsx
<select name="duration" value={form.duration} onChange={handleChange}>
  {availableDurations.length === 0 ? (
    <option>Calculando disponibilidad...</option>
  ) : (
    availableDurations.map((duration) => (
      <option key={duration.value} value={duration.value}>
        {duration.label}
      </option>
    ))
  )}
</select>
```

## 📊 Casos de Uso Cubiertos

### **Caso 1: Horario Congestionado**

```
Reservas Existentes:
- 09:00-10:00 (Cancha 1)
- 10:30-12:00 (Cancha 1)
- 14:00-15:00 (Cancha 1)

Usuario edita reserva de 13:00:
Disponibles: ["1 hora"] ← Solo hasta 14:00
```

### **Caso 2: Horario Libre**

```
Sin reservas adyacentes

Usuario edita reserva de 16:00:
Disponibles: [
  "30 minutos", "1 hora", "1 hora 30 min",
  "2 horas", "2 horas 30 min", "3 horas"
]
```

### **Caso 3: Cambio de Hora**

```
Usuario cambia hora de 10:00 → 09:30:
- Sistema recalcula automáticamente
- Selector actualiza opciones disponibles
- Si duración actual (2h) no cabe, cambia a 1h automáticamente
```

### **Caso 4: Sin Opciones Disponibles**

```
Horario muy congestionado:
- Selector deshabilitado
- Mensaje: "⚠️ No hay duraciones disponibles"
- Sugerencia: "Prueba cambiar la hora de inicio"
```

## 🎨 Experiencia Visual

### **Estados del Selector**

#### **✅ Con Opciones Disponibles**

```
┌─────────────────────────────────────┐
│ Duración (3 opciones disponibles)  │
│ ┌─────────────────────────────────┐ │
│ │ 1 hora                      ▼ │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

#### **⚠️ Sin Opciones Disponibles**

```
┌─────────────────────────────────────┐
│ Duración                            │
│ ┌─────────────────────────────────┐ │
│ │ Calculando disponibilidad...   │ │ ← Deshabilitado
│ └─────────────────────────────────┘ │
│ ⚠️ No hay duraciones disponibles    │
│ Prueba cambiar la hora de inicio.   │
└─────────────────────────────────────┘
```

## 📈 Mejoras de UX

### **Antes vs Ahora**

| Aspecto        | Sistema Anterior         | Sistema Nuevo                |
| -------------- | ------------------------ | ---------------------------- |
| **Feedback**   | Reactivo (error después) | Proactivo (previene errores) |
| **Opciones**   | Todas mostradas          | Solo disponibles             |
| **Validación** | Manual por usuario       | Automática por sistema       |
| **Eficiencia** | Trial & error            | Selección directa            |
| **Confianza**  | Incertidumbre            | Opciones garantizadas        |

### **Logs de Debug Mejorados**

```javascript
// Información detallada para desarrollo
⏱️ Duraciones disponibles calculadas: {
  startTime: "10:00",
  courtId: "1",
  date: "2025-11-12",
  availableDurations: [
    { value: "01:00", label: "1 hora", minutes: 60 },
    { value: "01:30", label: "1 hora 30 min", minutes: 90 }
  ]
}

⚠️ Duración actual no disponible, cambiando a: "01:00"
```

## 🎯 Impacto en el Usuario

1. **Eliminación de Frustración**: No más prueba y error con duraciones
2. **Confianza Inmediata**: Todas las opciones mostradas son válidas
3. **Eficiencia**: Selección directa sin validaciones posteriores
4. **Transparencia**: Visibilidad clara de disponibilidad real
5. **Automatización**: El sistema maneja la complejidad por el usuario

---

**💡 Resultado**: Los usuarios ahora tienen una experiencia fluida e intuitiva donde solo pueden seleccionar duraciones que funcionarán, eliminando completamente los errores de superposición durante la edición de reservas.
