# Test: Validación de Superposición de Horarios en Edición de Reservas

## 🧪 Objetivo

Validar que al editar una reserva, el sistema detecte y prevenga superposiciones de horarios con otras reservas existentes en la misma cancha y fecha.

## 📋 Escenarios de Prueba

### **Escenario 1: Extensión que causa conflicto**

```
Reserva Original: Cancha 1, 10:00-11:00
Reserva Existente: Cancha 1, 11:00-12:00
Acción: Extender duración a 2 horas (10:00-12:00)
Resultado Esperado: ❌ Error de conflicto
```

### **Escenario 2: Cambio de hora que causa conflicto**

```
Reserva Original: Cancha 1, 10:00-11:00
Reserva Existente: Cancha 1, 09:00-10:00
Acción: Cambiar hora a 09:30
Resultado Esperado: ❌ Error de conflicto
```

### **Escenario 3: Extensión sin conflicto**

```
Reserva Original: Cancha 1, 10:00-11:00
Reserva Existente: Cancha 1, 12:00-13:00
Acción: Extender duración a 1.5 horas (10:00-11:30)
Resultado Esperado: ✅ Sin errores
```

### **Escenario 4: Cambio de cancha sin conflicto**

```
Reserva Original: Cancha 1, 10:00-11:00
Reserva Existente: Cancha 1, 11:00-12:00
Acción: Cambiar a Cancha 2 y extender a 2 horas
Resultado Esperado: ✅ Sin errores
```

## 🔧 Pasos de Testing Manual

### 1. **Preparación**

```bash
# Asegurarse que el servidor esté corriendo
http://localhost:5177

# Login como SOCIO
Email: socio@chedoparti.com
Password: socio123
```

### 2. **Crear reservas de prueba**

```
Ir a Dashboard → Crear las siguientes reservas:
- Reserva A: Cancha Padel 1, Hoy, 09:00-10:00
- Reserva B: Cancha Padel 1, Hoy, 11:00-12:00
- Reserva C: Cancha Padel 2, Hoy, 10:00-11:00
```

### 3. **Test de Conflicto por Extensión**

```
1. Hacer clic en Reserva A (09:00-10:00)
2. Cambiar duración de 1:00 a 2:00
3. Verificar que aparece:
   - ⚠️ Alerta roja: "Conflicto de Horario Detectado"
   - Error en campo duración: "Este horario se superpone con otra reserva existente"
   - Botón "Guardar Cambios" debería estar deshabilitado o mostrar error
```

### 4. **Test de Conflicto por Cambio de Hora**

```
1. Hacer clic en Reserva B (11:00-12:00)
2. Cambiar hora de 11:00 a 10:30
3. Verificar que aparece:
   - ⚠️ Alerta roja de conflicto
   - Error en campo tiempo: "Conflicto de horario detectado"
```

### 5. **Test sin Conflicto - Extensión Válida**

```
1. Hacer clic en Reserva A (09:00-10:00)
2. Cambiar duración de 1:00 a 1:30 (09:00-10:30)
3. Verificar que:
   - ✅ No aparecen alertas de conflicto
   - Campos sin errores rojos
   - Ajuste de precio se calcula correctamente
```

### 6. **Test sin Conflicto - Cambio de Cancha**

```
1. Hacer clic en Reserva A (09:00-10:00, Cancha 1)
2. Cambiar cancha a Padel 2
3. Cambiar duración a 2:00
4. Verificar que:
   - ✅ Sin conflictos (diferente cancha)
   - Ajuste de precio correcto
```

## 💻 Verificaciones en Consola del Navegador

### **Logs Esperados para Conflictos**

```javascript
⚠️ Conflicto de horario detectado: {
  newReservation: { start: 540, end: 660, startTime: "09:00", duration: "02:00" },
  existingReservation: { id: "123", start: 660, end: 720, time: "11:00", duration: "01:00" }
}
```

### **Logs Esperados sin Conflictos**

```javascript
// No debería aparecer el log de conflicto
// Solo logs normales de cálculo de precio y ajuste
```

## 🎯 Criterios de Éxito

### ✅ **Funcionalidad Correcta**

- [ ] Detecta superposiciones al extender duración
- [ ] Detecta superposiciones al cambiar hora de inicio
- [ ] Permite cambios que no generan conflictos
- [ ] Excluye correctamente la reserva actual del cálculo
- [ ] Funciona correctamente entre diferentes canchas

### ✅ **UX/UI Apropiada**

- [ ] Alerta visual clara para conflictos (fondo rojo)
- [ ] Mensajes de error específicos y útiles
- [ ] Validación en tiempo real (sin necesidad de submit)
- [ ] Errores se limpian cuando se resuelve el conflicto
- [ ] Botón de guardar respeta validaciones

### ✅ **Edge Cases Manejados**

- [ ] Reservas con duraciones en diferentes formatos ("01:00" vs "60")
- [ ] Reservas sin campos de tiempo/duración (no rompe validación)
- [ ] Cambios múltiples (hora + duración) en secuencia
- [ ] Reservas en fechas diferentes no interfieren

## 🚨 Casos Problemáticos a Verificar

### **Caso 1: Reserva Adyacente Exacta**

```
Reserva A: 10:00-11:00
Reserva B: 11:00-12:00
Extensión: 10:00-11:01
Expectativa: ❌ Debería detectar conflicto (inclusive de 1 minuto)
```

### **Caso 2: Múltiples Reservas Conflictivas**

```
Reserva A: 10:00-11:00
Reserva B: 11:30-12:30
Reserva C: 13:00-14:00
Extensión: 10:00-13:30
Expectativa: ❌ Debería detectar conflicto con B y C
```

### **Caso 3: Auto-Edición No Debe Generar Conflicto**

```
Reserva A: 10:00-11:00
Acción: Cambiar de 10:00-11:00 a 10:00-11:00 (sin cambios)
Expectativa: ✅ No debería mostrar conflicto consigo misma
```

## 📊 Métricas de Rendimiento

- **Validación rápida**: < 100ms después de cambiar campo
- **Sin bloqueos**: UI responde durante validaciones
- **Logs informativos**: Información suficiente para debug
- **Memoria**: No memory leaks en validaciones repetidas

---

**🎯 Objetivo Final**: Asegurar que los usuarios no puedan crear conflictos de horarios al editar reservas, manteniendo la integridad del sistema de reservaciones.
