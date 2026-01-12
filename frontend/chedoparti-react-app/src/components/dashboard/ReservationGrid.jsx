import React, { useMemo, useCallback } from 'react';
import { DndContext, DragOverlay, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, User, Edit, Trash2 } from 'lucide-react';
import useAuth from '../../hooks/useAuth';

/**
 * ReservationGrid - Grid mejorado con drag & drop
 * Reemplaza/mejora CalendarGrid.jsx con funcionalidad de arrastrar y soltar
 */
export default function ReservationGrid({
  courts = [],
  slots = [],
  reservations = [],
  selectedDate,
  onSlotClick,
  onReservationUpdate,
  onReservationDelete,
  onRefresh,
  enableDragDrop = true,
}) {
  const { user } = useAuth();
  const [activeId, setActiveId] = React.useState(null);
  const [draggedReservation, setDraggedReservation] = React.useState(null);

  const isAdmin = user?.role === 'INSTITUTION_ADMIN';

  // Configurar sensores para drag & drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px de movimiento antes de activar drag
      },
    })
  );

  // Crear mapa de reservas por slot
  const reservationSlotMap = useMemo(() => {
    const map = new Map();
    
    reservations.forEach((reservation) => {
      if (!reservation.time || !reservation.courtId) return;
      
      const [h, m] = reservation.time.split(':').map(Number);
      const startMinutes = h * 60 + m;
      
      const [dh, dm] = (reservation.duration || '01:00').split(':').map(Number);
      const durationMinutes = dh * 60 + dm;
      const endMinutes = startMinutes + durationMinutes;
      
      // Marcar todos los slots que ocupa esta reserva
      slots.forEach((slot) => {
        const [sh, sm] = slot.split(':').map(Number);
        const slotMinutes = sh * 60 + sm;
        
        if (slotMinutes >= startMinutes && slotMinutes < endMinutes) {
          const key = `${reservation.courtId}-${slot}`;
          
          // Solo guardar la primera aparición (slot de inicio)
          if (slotMinutes === startMinutes) {
            map.set(key, { ...reservation, isStart: true, spanSlots: Math.ceil(durationMinutes / 30) });
          } else {
            map.set(key, { ...reservation, isStart: false, spanSlots: 0 });
          }
        }
      });
    });
    
    return map;
  }, [reservations, slots]);

  // Obtener color según tipo de reserva
  const getReservationColor = useCallback((reservation) => {
    if (!reservation) return 'bg-green-100 hover:bg-green-200 border-green-300 text-green-800';
    
    const type = reservation.type || reservation.reservationType;
    const status = reservation.status;
    
    // Estados especiales
    if (status === 'cancelled') return 'bg-gray-100 border-gray-300 text-gray-500 opacity-50';
    if (status === 'pending') return 'bg-yellow-100 border-yellow-300 text-yellow-800';
    
    // Por tipo
    switch (type) {
      case 'Clase':
      case 'CLASS':
        return 'bg-purple-100 hover:bg-purple-200 border-purple-300 text-purple-800';
      case 'Mantenimiento':
      case 'MAINTENANCE':
        return 'bg-orange-100 hover:bg-orange-200 border-orange-300 text-orange-800';
      case 'Torneo':
      case 'TOURNAMENT':
        return 'bg-yellow-100 hover:bg-yellow-200 border-yellow-300 text-yellow-800';
      case 'Evento':
      case 'EVENT':
        return 'bg-pink-100 hover:bg-pink-200 border-pink-300 text-pink-800';
      default:
        return 'bg-blue-100 hover:bg-blue-200 border-blue-300 text-blue-800';
    }
  }, []);

  // Handlers de drag & drop
  const handleDragStart = useCallback((event) => {
    const { active } = event;
    const reservation = reservations.find(r => r.id === active.id);
    
    if (reservation) {
      setActiveId(active.id);
      setDraggedReservation(reservation);
    }
  }, [reservations]);

  const handleDragEnd = useCallback((event) => {
    const { active, over } = event;
    
    setActiveId(null);
    setDraggedReservation(null);
    
    if (!over || !onReservationUpdate) return;
    
    // Parsear el ID del slot destino: "courtId-time"
    const [newCourtId, newTime] = over.id.split('-');
    const reservation = reservations.find(r => r.id === active.id);
    
    if (!reservation) return;
    
    // Si es el mismo slot, no hacer nada
    if (String(reservation.courtId) === newCourtId && reservation.time === newTime) {
      return;
    }
    
    // Actualizar reserva
    onReservationUpdate(reservation.id, {
      courtId: parseInt(newCourtId),
      time: newTime,
    });
  }, [reservations, onReservationUpdate]);

  const handleDragCancel = useCallback(() => {
    setActiveId(null);
    setDraggedReservation(null);
  }, []);

  // Renderizar celda de slot
  const renderSlot = useCallback((court, slot) => {
    const key = `${court.id}-${slot}`;
    const reservation = reservationSlotMap.get(key);
    
    // Slot ocupado (no es el inicio)
    if (reservation && !reservation.isStart) {
      return null; // Ya renderizado por el slot de inicio
    }
    
    // Slot ocupado (inicio de reserva)
    if (reservation && reservation.isStart) {
      const colorClass = getReservationColor(reservation);
      const canEdit = isAdmin || (reservation.userId && user?.id && String(reservation.userId) === String(user.id));
      
      return (
        <motion.div
          key={key}
          layoutId={enableDragDrop ? `reservation-${reservation.id}` : undefined}
          className={`
            relative p-2 border-2 rounded-lg cursor-pointer
            ${colorClass}
            ${activeId === reservation.id ? 'opacity-50' : ''}
          `}
          style={{
            gridRow: `span ${reservation.spanSlots || 1}`,
          }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onSlotClick && onSlotClick(court, slot, reservation)}
        >
          <div className="flex flex-col gap-1 text-xs">
            <div className="flex items-center gap-1 font-semibold">
              <User className="w-3 h-3" />
              <span className="truncate">{reservation.userName || reservation.user || 'Reservado'}</span>
            </div>
            <div className="flex items-center gap-1 text-xs opacity-75">
              <Clock className="w-3 h-3" />
              <span>{reservation.time} - {reservation.duration || '01:00'}</span>
            </div>
            {canEdit && (
              <div className="flex gap-1 mt-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSlotClick && onSlotClick(court, slot, reservation);
                  }}
                  className="p-1 bg-white/50 rounded hover:bg-white/80 transition-colors"
                  title="Editar"
                >
                  <Edit className="w-3 h-3" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onReservationDelete && onReservationDelete(reservation.id);
                  }}
                  className="p-1 bg-white/50 rounded hover:bg-white/80 transition-colors"
                  title="Eliminar"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
        </motion.div>
      );
    }
    
    // Slot libre
    return (
      <motion.div
        key={key}
        className="p-2 border border-gray-200 dark:border-gray-700 rounded hover:bg-green-50 dark:hover:bg-green-900/20 cursor-pointer transition-colors"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => onSlotClick && onSlotClick(court, slot, null)}
      >
        <span className="text-xs text-gray-400 dark:text-gray-500">Libre</span>
      </motion.div>
    );
  }, [reservationSlotMap, getReservationColor, isAdmin, user, activeId, enableDragDrop, onSlotClick, onReservationDelete]);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="w-full overflow-x-auto">
        <div className="min-w-max">
          {/* Header */}
          <div className="grid gap-2 mb-2" style={{ gridTemplateColumns: `120px repeat(${courts.length}, minmax(150px, 1fr))` }}>
            <div className="font-bold text-sm p-2 bg-gray-100 dark:bg-gray-800 rounded">Horario</div>
            {courts.map((court) => (
              <div key={court.id} className="font-bold text-sm p-2 bg-gray-100 dark:bg-gray-800 rounded text-center">
                {court.name}
              </div>
            ))}
          </div>

          {/* Grid */}
          <div className="space-y-2">
            {slots.map((slot) => (
              <div key={slot} className="grid gap-2" style={{ gridTemplateColumns: `120px repeat(${courts.length}, minmax(150px, 1fr))` }}>
                <div className="font-semibold text-sm p-2 bg-gray-50 dark:bg-gray-900 rounded flex items-center">
                  {slot}
                </div>
                {courts.map((court) => (
                  <div key={`${court.id}-${slot}`} id={`${court.id}-${slot}`}>
                    {renderSlot(court, slot)}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Drag Overlay */}
      <DragOverlay>
        {draggedReservation && (
          <div className={`p-2 border-2 rounded-lg ${getReservationColor(draggedReservation)} shadow-lg`}>
            <div className="flex flex-col gap-1 text-xs">
              <div className="flex items-center gap-1 font-semibold">
                <User className="w-3 h-3" />
                <span>{draggedReservation.userName || draggedReservation.user || 'Reservado'}</span>
              </div>
              <div className="flex items-center gap-1 text-xs opacity-75">
                <Clock className="w-3 h-3" />
                <span>{draggedReservation.time}</span>
              </div>
            </div>
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
