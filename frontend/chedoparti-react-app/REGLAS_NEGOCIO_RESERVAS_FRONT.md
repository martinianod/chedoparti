# Lógica de Negocio del Front de Chedoparti: Gestión de Reservas

Este documento define las reglas de negocio, flujos y comportamientos esperados en el Frontend para la creación, edición y eliminación de reservas.

## 1. Roles y Permisos (Solo UI)

Definición de capacidades por rol desde la interfaz de usuario.

### Rol USER (Cliente / Jugador)
*   **Ver:** Disponibilidad de canchas.
*   **Crear:** Puede crear reservas propias.
*   **Editar:** Solo sus propias reservas, con límite de tiempo (ej. hasta 2 horas antes del inicio).
*   **Cancelar:** Solo sus propias reservas.
*   **Restricciones:**
    *   NO puede editar precios.
    *   NO puede editar horarios ni canchas arbitrariamente (debe respetar disponibilidad).
    *   NO puede gestionar reservas de terceros.

### Rol INSTITUTION-ADMIN
*   **Ver:** Calendario completo de su institución, vista de "gestión".
*   **Crear:** Reservas para cualquier cliente.
*   **Editar:**
    *   Mover horarios.
    *   Modificar duración.
    *   Cambiar cancha.
    *   Editar notas internas (fines administrativos).
*   **Cancelar:** Cualquier reserva de su institución.
*   **Restricciones:** Limitado a las canchas de su institución.

### Rol COACH / ENTRENADOR
*   **Ver:** Calendario general de la institución donde trabaja.
*   **Crear:** Reservas propias o para alumnos adheridos.
*   **Editar:** Sus reservas y las de sus alumnos.
*   **Restricciones:**
    *   NO puede modificar precios (solo visualizarlos).

### Rol SOCIO (De Institución)
*   **Ver:** Disponibilidad (incluyendo exclusiva si corresponde).
*   **Crear:** Reservas con reglas especiales (precio preferencial, prioridad, cupos).
*   **Editar/Cancelar:** Sus propias reservas.

---

## 2. Flujo Completo: "Crear Reserva"

### 2.1. Selección Inicial
1.  **Institución:** Selección del club/complejo.
2.  **Deporte:** Pádel, Tenis, Fútbol, etc.
3.  **Cancha:** Selección específica o automática.
4.  **Fecha y Hora:** Selección de slot temporal.
5.  **Duración:** 60, 90, 120 min (según configuración).
6.  **Tipo de Reserva:** Normal, Socio, Entrenador, Invitación (según permisos).

### 2.2. Validaciones FRONT (Previas al Backend)
*   **Fecha:** No puede ser en el pasado.
*   **Horario:** Debe estar dentro del rango de apertura/cierre de la institución.
*   **Estado Cancha:** La cancha debe estar habilitada.
*   **Permisos:** El usuario debe tener rol suficiente para el tipo de reserva seleccionado.
*   **Superposición Local:** Verificar contra el store/cache local si ya existe una reserva en ese slot (feedback inmediato).
*   **Duración:** Válida según reglas de la institución (ej. múltiplos de 30 min).
*   **Cupos (Socios):** Validar si supera el límite diario/semanal permitido (si la data está disponible en front).

### 2.3. Llamada al Backend
*   **Endpoint:** `POST /api/reservation/create`
*   **Headers:** Incluir JWT (Authorization: Bearer ...).
*   **UI:** Mostrar loader/spinner en el botón de confirmación.
*   **Manejo de Errores:**
    *   *Superposición:* Mostrar modal con horarios/canchas alternativas.
    *   *Cancha Bloqueada:* Alerta visual.
    *   *Horario Inválido:* Solicitar nueva selección.
    *   *Token Expirado:* Redirigir a Login.

### 2.4. Respuesta Exitosa
1.  **Store:** Actualizar el store global (Zustand) agregando la nueva reserva.
2.  **Modal:** Cerrar el modal de creación.
3.  **Feedback:** Mostrar Toast de éxito ("Reserva creada correctamente").
4.  **Vista:** Refrescar el calendario/lista visible para asegurar consistencia.

---

## 3. Flujo: "Editar Reserva"

### 3.1. Campos Editables (Según Rol)
*   **Horario:** Todos (con restricciones de tiempo).
*   **Duración:** Todos (sujeto a disponibilidad).
*   **Cancha:** Todos (sujeto a disponibilidad).
*   **Tipo de Reserva:** Admin/Coach (User restringido).
*   **Notas Internas:** Solo Admin/Institution-Admin.
*   **Usuario Asignado:** Solo Admin/Institution-Admin.

### 3.2. Validaciones FRONT Previas
*   **Permiso:** Verificar si el rol actual puede editar esta reserva específica.
*   **Tiempo Límite:**
    *   *User:* Ej. > 2 horas antes del inicio.
    *   *Coach:* Ej. > 1 hora antes.
    *   *Admin:* Sin límite.
*   **Disponibilidad:** Verificar si el nuevo horario/cancha está libre (validación local preliminar).
*   **Consistencia de Tipo:** Validar cambios de tipo de reserva (ej. Coach no debería poder cambiar a Socio si no aplica).

### 3.3. Llamada Backend
*   **Endpoint:** `PUT /api/reservation/{id}`
*   **Conflictos (409):** Si el nuevo horario está ocupado, mostrar modal con alternativas.

### 3.4. Estado UI
*   **Botón Guardar:** Deshabilitado (disabled) hasta que se detecten cambios reales en el formulario (dirty check).
*   **Loading:** Spinner en el botón durante la petición.
*   **Optimización:** Actualizar solo la reserva editada en el store (optimistic update o merge) sin recargar toda la página completa si no es necesario.

---

## 4. Flujo: "Eliminar / Cancelar Reserva"

### 4.1. Diferenciación
*   **Cancelar (User/Socio):** Marca la reserva como cancelada, libera el cupo, puede aplicar penalización.
*   **Eliminar (Admin):** Soft-delete (visible en backend/auditoría, desaparece del calendario público).

### 4.2. UI
*   **Acción:** Click en icono/botón "Cancelar".
*   **Confirmación:** Modal obligatorio "¿Estás seguro...?".
    *   *Mostrar penalización:* Si aplica (ej. "Se cobrará el 50%").
*   **Estado:** Deshabilitar botón durante el proceso.

### 4.3. Validaciones Previas
*   **Pasado:** No permitir cancelar reservas ya pasadas (históricas).
*   **Tiempo Límite:** Advertir o bloquear si es muy próximo al inicio (ej. < 1 hora).

### 4.4. Llamada Backend
*   **Endpoint:** `DELETE /api/reservation/{id}` (o endpoint específico de cancelación si la lógica difiere).
*   **Errores:**
    *   *Ya cancelada:* Feedback informativo.
    *   *No autorizado (403):* Alerta de error.

### 4.5. Respuesta
1.  **Store:** Remover la reserva de la lista activa o cambiar su estado a `CANCELLED`.
2.  **Vista:** Refrescar la vista actual.
3.  **Feedback:** Toast ("Reserva cancelada").

---

## 5. Estados de la Reserva y Reglas de UI

| Estado | Descripción | Comportamiento UI |
| :--- | :--- | :--- |
| **PENDING** | Creada, pago pendiente o confirmación manual. | Editable por todos (según rol). |
| **CONFIRMED** | Confirmada/Pagada. | Editable con restricciones. Color Verde. |
| **ONGOING** | En curso (hora actual). | Solo Admins pueden modificar. Color Azul. |
| **FINISHED** | Finalizada. | Histórico, no editable (salvo notas admin). |
| **CANCELLED** | Cancelada por usuario o admin. | Solo Admins pueden reactivar/borrar. Color Rojo Opaco. |
| **NO-SHOW** | Usuario no se presentó. | Visible para admin (estadísticas). |
| **BLOCKED** | Bloqueo administrativo (mantenimiento, etc). | Visible admin, no reservable. Color Gris Oscuro. |
| **OVERDUE** | Pasó la hora y no se confirmó uso. | Tratamiento similar a Finished/No-Show. |

---

## 6. Manejo de Store Global (Zustand)

### 6.1. Qué Guardar
*   **Reservas:** Lista del rango de fechas actual (día/semana).
*   **Detalle:** Datos completos de la reserva seleccionada (para el modal).
*   **Configuración:** Canchas, horarios de apertura, lista de precios.
*   **Usuario:** Datos del usuario actual y sus permisos.
*   **UI State:** `isLoading` (global), `isSubmitting` (form), `modals` (abiertos/cerrados).

### 6.2. Optimización
*   **Cache:** Almacenar reservas por rango de fechas para evitar re-fetching al navegar días cercanos y volver.
*   **Merge Inteligente:** Al editar, actualizar el objeto en el array del store en lugar de invalidar todo el query, si es posible.
*   **Invalidación:** Forzar refresco tras acciones críticas (Crear/Eliminar) para asegurar consistencia con backend.

---

## 7. Manejo de UI / Modales

### Modales Necesarios
1.  **Crear Reserva:** Formulario completo.
2.  **Editar Reserva:** Mismo formulario, pre-cargado.
3.  **Ver Detalle:** Vista de lectura rápida.
4.  **Confirmar Cancelación:** Alerta con consecuencias.
5.  **Resolución de Conflictos:** "El horario X está ocupado, sugerencias: Y, Z".

### Reglas Documentadas
*   **Validación Inicial:** El botón "Continuar/Crear" en el modal de creación debe estar deshabilitado hasta completar campos obligatorios (Cancha, Hora, Tipo).
*   **Sincronización:** El modal de edición **SIEMPRE** debe inicializarse con los datos del store/backend, nunca con un estado vacío o desactualizado.
*   **Consistencia de Errores:** Usar un componente estándar para mostrar errores (Toasts para éxito/info, Alertas en línea para validaciones de formulario).

---

## 8. Reglas Visuales

### Visibilidad por Rol
*   **Admin:** Ve todas las reservas, bloqueos y detalles internos.
*   **User:** Ve sus propias reservas resaltadas. Las de terceros aparecen como "Ocupado" (sin detalles personales).
*   **Coach:** Ve sus clases y las de sus alumnos detalladas. Resto "Ocupado".
*   **Socio:** Similar a User, pero puede ver disponibilidad exclusiva si existe.

### Código de Colores (Referencia)
*   🟢 **Confirmada:** Verde
*   🟡 **Pendiente:** Amarillo
*   🔴 **Cancelada:** Rojo (baja opacidad)
*   🔵 **En Curso (Ongoing):** Azul
*   ⚫ **Bloqueada:** Gris Oscuro

---

## 9. Manejo de Errores Típicos

| Código HTTP | Significado | Acción Frontend |
| :--- | :--- | :--- |
| **409 Conflict** | Superposición de horario. | Mostrar modal con horarios alternativos disponibles. |
| **403 Forbidden** | Sin permisos. | Alerta "No tienes permiso para realizar esta acción". |
| **401 Unauthorized** | Sesión expirada. | Redirigir a Login / Logout automático. |
| **422 Unprocessable** | Error de validación de negocio. | Mostrar mensaje de error específico que devuelve el backend. |
| **500 Internal** | Error del servidor. | Mensaje genérico "Ocurrió un error, intenta más tarde" + opción de reintentar. |
