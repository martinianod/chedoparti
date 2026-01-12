/**
 * Procesa los eventos del timeline para mejorar la visualización.
 * Principalmente agrupa eventos de cancelación consecutivos o redundantes.
 * 
 * @param {Array} events - Lista de eventos del historial
 * @returns {Array} - Lista de eventos procesada
 */
export const processTimelineEvents = (events) => {
  if (!events || events.length === 0) return [];

  // Ordenar por fecha descendente (más reciente primero) si no lo están
  const sortedEvents = [...events].sort((a, b) => 
    new Date(b.timestamp) - new Date(a.timestamp)
  );

  const processedEvents = [];
  let skipNext = false;

  for (let i = 0; i < sortedEvents.length; i++) {
    if (skipNext) {
      skipNext = false;
      continue;
    }

    const currentEvent = sortedEvents[i];
    const nextEvent = sortedEvents[i + 1];

    // Verificar si podemos agrupar este evento con el siguiente
    // Criterios:
    // 1. Ambos son eventos de cancelación o relacionados con cancelación
    // 2. Ocurrieron en un lapso muy corto (ej. 1 minuto)
    // 3. El usuario es el mismo (opcional, pero recomendable)
    
    const isCancelEvent = (e) => 
      e.actionType === 'CANCEL' || 
      (e.changes && e.changes.status && e.changes.status.to === 'cancelled');

    if (nextEvent && isCancelEvent(currentEvent) && isCancelEvent(nextEvent)) {
      const timeDiff = Math.abs(new Date(currentEvent.timestamp) - new Date(nextEvent.timestamp));
      const isCloseInTime = timeDiff < 60000; // Menos de 1 minuto

      if (isCloseInTime) {
        // Fusionar eventos
        // Priorizamos el evento que tenga el cambio de estado real (confirmed -> cancelled)
        // vs el que sea redundante (cancelled -> cancelled)
        
        let primaryEvent = currentEvent;
        let secondaryEvent = nextEvent;

        const currentHasStatusChange = currentEvent.changes?.status?.from !== 'cancelled';
        const nextHasStatusChange = nextEvent.changes?.status?.from !== 'cancelled';

        if (!currentHasStatusChange && nextHasStatusChange) {
          primaryEvent = nextEvent;
          secondaryEvent = currentEvent;
        }

        // Combinar cambios
        const mergedChanges = {
          ...secondaryEvent.changes,
          ...primaryEvent.changes
        };

        // Crear evento fusionado
        const mergedEvent = {
          ...primaryEvent,
          changes: mergedChanges,
          // Si los detalles son diferentes, podríamos querer combinarlos, 
          // pero generalmente queremos el del evento principal o el más descriptivo.
          details: primaryEvent.details.includes('Cancelada') ? primaryEvent.details : secondaryEvent.details
        };

        processedEvents.push(mergedEvent);
        skipNext = true; // Saltar el siguiente evento ya que lo hemos fusionado
        continue;
      }
    }

    processedEvents.push(currentEvent);
  }

  return processedEvents;
};
