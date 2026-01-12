// ...existing code...
export default CalendarGrid;

import React, { useState, useCallback, useMemo } from 'react';
import ReservationInfoModal from './ReservationInfoModalNew';
import { FiUser, FiRefreshCw, FiAward, FiBook, FiUserPlus, FiLock } from 'react-icons/fi';
import { useUpdateReservation, useCancelReservation } from '../../hooks/useReservationSync';
import { reservationSync } from '../../utils/reservationSync';
import { getUserDisplayText } from '../../utils/userDisplay';
import { useAppNotifications } from '../../hooks/useAppNotifications';
import { handleApiError } from '../../utils/errorHandler';
// No MUI imports

/**
 * CalendarGrid
 * Props:
 * - courts: array of court objects { id, name }
 * - slots: array of time slots ['08:00', '09:00', ...]
 * - reservations: array of reservation objects { id, courtId, date, time, user, sport }
 * - selectedDate: string (YYYY-MM-DD)
 * - onSlotClick: function(courtId, time)
 */
function CalendarGrid({
  // Detectar overflow y scroll horizontal para mostrar flechas
  courts,
  slots,
  reservations,
  selectedDate,
  onSlotClick,
  onRefresh,
  onDeleteReservation,
  currentUser,
}) {
  const { showNotification } = useAppNotifications();
  const [dragStart, setDragStart] = useState(null);
  const [dragEnd, setDragEnd] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [infoModalOpen, setInfoModalOpen] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState(null);

  // 🔄 Hooks para sincronización de reservas
  const updateReservationMutation = useUpdateReservation();
  const cancelReservationMutation = useCancelReservation();

  // ✅ Optimización: Memoizar mapa de iconos para evitar recrearlo en cada render
  const iconMap = useMemo(() => ({
    FiUser,
    FiRefreshCw,
    FiAward,
    FiBook,
    FiUserPlus,
    FiLock,
  }), []);

  // Helper para renderizar iconos de tipo de reserva
  const getReservationIcon = useCallback((iconName) => {
    const IconComponent = iconMap[iconName] || FiLock;
    return <IconComponent className="w-2.5 h-2.5 inline-block mr-1 opacity-70" />;
  }, [iconMap]);

  // ✅ Optimización: Memoizar mapa de colores de borde
  const borderColorMap = useMemo(() => ({
    Normal: 'border-l-4 border-l-gray-400',
    Fijo: 'border-l-4 border-l-blue-500',
    Torneo: 'border-l-4 border-l-yellow-500',
    Academia: 'border-l-4 border-l-green-500',
    Invitado: 'border-l-4 border-l-purple-500',
    Clase: 'border-l-4 border-l-teal-500',
    Escuela: 'border-l-4 border-l-indigo-500',
    Cumpleaños: 'border-l-4 border-l-pink-500',
    Abono: 'border-l-4 border-l-cyan-500',
  }), []);

  // Helper para obtener clases de borde según el tipo de reserva
  const getBorderColorClass = useCallback((type) => {
    return borderColorMap[type] || 'border-l-4 border-l-gray-500';
  }, [borderColorMap]);
  // Estado para mostrar flechas de scroll en mobile
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);
  const [arrowTop, setArrowTop] = useState('50%');
  const tableContainerRef = React.useRef(null);
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;

  // Detectar overflow y scroll horizontal para mostrar flechas y centrar verticalmente
  React.useEffect(() => {
    function updateArrowsAndPosition() {
      const el = tableContainerRef.current;
      if (!el) return;
      setShowLeftArrow(el.scrollLeft > 10);
      setShowRightArrow(el.scrollLeft + el.offsetWidth < el.scrollWidth - 10);
      // Calcular posición vertical centrada en el área visible de la tabla
      const parentRect = el.getBoundingClientRect();
      const visibleTop = Math.max(parentRect.top, 0);
      const visibleBottom = Math.min(parentRect.bottom, window.innerHeight);
      const center = (visibleTop + visibleBottom) / 2;
      setArrowTop(center - parentRect.top + 'px');
    }
    updateArrowsAndPosition();
    const el = tableContainerRef.current;
    if (el) {
      el.addEventListener('scroll', updateArrowsAndPosition);
    }
    window.addEventListener('resize', updateArrowsAndPosition);
    window.addEventListener('scroll', updateArrowsAndPosition);
    return () => {
      if (el) el.removeEventListener('scroll', updateArrowsAndPosition);
      window.removeEventListener('resize', updateArrowsAndPosition);
      window.removeEventListener('scroll', updateArrowsAndPosition);
    };
  }, []);
  // Notificación con autocierre
  React.useEffect(() => {
    if (successMsg) {
      const timer = setTimeout(() => setSuccessMsg(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMsg]);

  // 🎯 Limpiar selección de drag cuando el mouse se suelta fuera de los slots
  React.useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (dragStart) {
        setDragStart(null);
        setDragEnd(null);
      }
    };

    // Solo agregar listener si hay un drag activo
    if (dragStart) {
      document.addEventListener('mouseup', handleGlobalMouseUp);
      return () => {
        document.removeEventListener('mouseup', handleGlobalMouseUp);
      };
    }
  }, [dragStart]);
  // Removed stray window.addEventListener('scroll', handleScroll); not needed
  // 🔄 Handler para actualizar reserva usando hooks de sincronización
  const handleUpdateReservation = async (updatedReservation) => {
    try {

      
      // ✅ Pasar el objeto completo directamente al hook
      // El hook se encarga de construir el payload correcto
      await updateReservationMutation.mutateAsync({
        id: updatedReservation.id,
        updates: updatedReservation // ✅ Pasar el objeto completo, no un payload personalizado
      });



      setSuccessMsg('Reserva actualizada correctamente');

      // Cerrar modal
      setInfoModalOpen(false);
      setSelectedReservation(null);
      
      // ✅ NO es necesario llamar onRefresh ni notifyReservationUpdated
      // El hook ya invalida el cache automáticamente
    } catch (error) {
      console.error('❌ Error in handleUpdateReservation:', error);
      // ✅ Usar sistema centralizado de manejo de errores
      handleApiError(error, { showNotification }, { showNotification: true });
    }
  };

  // 🚫 Handler para cancelar/eliminar reserva usando hook de sincronización
  const handleDeleteReservation = async (reservation) => {
    try {
      // ✅ Usar el hook de cancelación con optimistic updates
      await cancelReservationMutation.mutateAsync({ 
        id: reservation.id,
        reason: 'Cancelada desde el calendario'
      });

      // ✅ El hook maneja automáticamente:
      // - Optimistic update (actualización inmediata de UI)
      // - Invalidación de cache (refetch automático)
      // - Liberación de slots en todos los dashboards
      // - Sincronización en tiempo real

      setSuccessMsg('Reserva cancelada correctamente');
      
      // Cerrar modal
      setInfoModalOpen(false);
      setSelectedReservation(null);
      
      // ✅ NO es necesario llamar onRefresh ni onDeleteReservation
      // El hook ya invalida el cache automáticamente
    } catch (error) {
      // ✅ Usar sistema centralizado de manejo de errores
      handleApiError(error, { showNotification }, { showNotification: true });
    }
  };

  // 🚀 Función optimizada para validar acceso - memoizada para mejor performance
  const canAccessReservation = useCallback(
    (reservation) => {
      // ADMIN puede acceder a todas las reservas
      const isAdmin = currentUser?.role === 'INSTITUTION_ADMIN' || 
                      currentUser?.roles?.includes('INSTITUTION_ADMIN');
      if (isAdmin) {
        return true;
      }

      // Para SOCIO y COACH: verificar propiedad PRIMERO
      // Si es dueño, puede acceder sin importar isPrivateInfo
      const isOwnerByUserId =
        reservation.userId &&
        currentUser?.id &&
        String(reservation.userId) === String(currentUser.id);
      const isOwnerByMembership =
        reservation.membershipNumber &&
        currentUser?.membershipNumber &&
        String(reservation.membershipNumber) === String(currentUser.membershipNumber);
      
      const isOwner = isOwnerByUserId || isOwnerByMembership;
      
      // Si es el dueño, puede acceder
      if (isOwner) {
        return true;
      }

      // Si NO es el dueño y la reserva es privada, NO puede acceder
      if (reservation.isPrivateInfo) {
        return false;
      }

      // Para otros casos (coaches viendo reservas públicas, etc.)
      return false;
    },
    [currentUser?.role, currentUser?.roles, currentUser?.id, currentUser?.membershipNumber]
  );

  // 🚀 Mostrar modal de info al hacer click en reserva - optimizado
  const handleReservationClick = useCallback(
    async (reservation) => {
      // Verificar si el usuario puede acceder a esta reserva
      const hasAccess = canAccessReservation(reservation);

      if (!hasAccess) {
        return; // No hacer nada si no tiene acceso
      } // Si es ADMIN y la reserva tiene información privada, obtener datos reales
      const isAdmin = currentUser?.roles?.includes('INSTITUTION_ADMIN') || currentUser?.role === 'INSTITUTION_ADMIN';
      if (isAdmin && reservation.isPrivateInfo) {
        try {
          const { reservationsApi } = await import('../../services/api');
          const response = await reservationsApi.getById(reservation.id);
          const realReservation = response.data;
          setSelectedReservation(realReservation);
        } catch (error) {
          // Fallback a la reserva filtrada
          setSelectedReservation(reservation);
        }
      } else {
        setSelectedReservation(reservation);
      }

      setInfoModalOpen(true);
    },
    [canAccessReservation]
  );

  // Helpers
  const getReservationsForCourt = (courtId) =>
    reservations.filter((r) => r.courtId === courtId && r.date === selectedDate);

  // 🚀 Optimized reservation lookup - memoizado para mejor performance
  const reservationSlotMap = useMemo(() => {
    const map = new Map();

    reservations.forEach((r) => {
      // Ignorar reservas canceladas
      if (r.status === 'cancelled') return;

      if (r.date === selectedDate) {
        if (r.time && r.duration) {
          const [h, m] = r.time.split(':').map(Number);
          const startMinutes = h * 60 + m;
          const [dh, dm] = r.duration.split(':').map(Number);
          const endMinutes = startMinutes + dh * 60 + dm;

          // Mapear todos los slots ocupados por esta reserva
          for (let i = 0; i < slots.length; i++) {
            const [sh, sm] = slots[i].split(':').map(Number);
            const slotMinutes = sh * 60 + sm;
            if (slotMinutes >= startMinutes && slotMinutes < endMinutes) {
              map.set(`${r.courtId}-${slots[i]}`, r);
            }
          }
        } else {
          // Fallback para reservas sin duración
          map.set(`${r.courtId}-${r.time}`, r);
        }
      }
    });

    return map;
  }, [reservations, selectedDate, slots]);

  const getReservationAtSlot = useCallback(
    (courtId, slot) => {
      return reservationSlotMap.get(`${courtId}-${slot}`);
    },
    [reservationSlotMap]
  );

  // Saber si el slot es el inicio de la reserva
  const isReservationStartSlot = (reservation, slot) => {
    if (!reservation) return false;
    if (reservation.time && reservation.duration) {
      return reservation.time === slot;
    }
    return reservation.time === slot;
  };

  // ...existing code...

  return (
    <div className="relative w-full" style={{ minHeight: 100 }}>
      {/* Flechas absolutas dentro del área de la tabla */}
      {isMobile && showLeftArrow && (
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: arrowTop,
            transform: 'translateY(-50%)',
            zIndex: 20,
            pointerEvents: 'none',
          }}
        >
          <div className="bg-navy/80 text-gold rounded-full p-1 shadow-lg animate-bounce-l">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </div>
        </div>
      )}
      {isMobile && showRightArrow && (
        <div
          style={{
            position: 'absolute',
            right: 0,
            top: arrowTop,
            transform: 'translateY(-50%)',
            zIndex: 20,
            pointerEvents: 'none',
          }}
        >
          <div className="bg-navy/80 text-gold rounded-full p-1 shadow-lg animate-bounce-r">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </div>
        </div>
      )}
      {/* ...existing code... */}
      <div
        ref={tableContainerRef}
        className="overflow-x-auto w-full"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        {successMsg && (
          <div className="mb-2 px-4 py-2 bg-background-secondary text-navy rounded text-center shadow-lg flex items-center justify-center gap-2 relative animate-fade-in">
            <span>{successMsg}</span>
            <button
              className="absolute right-2 top-1/2 -translate-y-1/2 text-navy hover:text-gold p-1 rounded"
              onClick={() => setSuccessMsg('')}
              aria-label="Cerrar notificación"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        )}
        <table 
          className="border rounded-lg bg-background-secondary dark:bg-navy-light text-xs md:text-sm responsive-calendar-table select-none"
          onMouseLeave={() => {
            setDragStart(null);
            setDragEnd(null);
          }}
        >
          <thead>
            <tr>
              <th
                className="bg-background-secondary dark:bg-navy-light border whitespace-nowrap"
                style={{ minWidth: 70, width: 70 }}
              ></th>
              {courts.map((court) => (
                <th key={court.id} className="p-2 border whitespace-nowrap text-center">
                  {court.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {slots.map((slot) => (
              <tr key={slot} className="bg-background-secondary dark:bg-navy-light">
                <td
                  className="bg-background-secondary dark:bg-navy-light text-navy dark:text-gold font-semibold px-4 py-3 border-b border-navy dark:border-gold text-center align-middle"
                  style={{ minWidth: 70, width: 70 }}
                >
                  <span className="block w-full text-center">{slot}</span>
                </td>
                {courts.map((court) => {
                  // Buscar si hay reserva en este slot para esta cancha
                  const reservation = getReservationAtSlot(court.id, slot);
                  if (reservation) {
                    const isStart = isReservationStartSlot(reservation, slot);
                    // Si es el slot de inicio, mostrar la celda ocupada
                    if (isStart) {
                      // Calcular cuántos slots ocupa la reserva
                      const [h, m] = reservation.time.split(':').map(Number);
                      const startMinutes = h * 60 + m;
                      const [dh, dm] = reservation.duration.split(':').map(Number);
                      const endMinutes = startMinutes + dh * 60 + dm;
                      // Buscar los slots que cubre
                      const coveredSlots = slots.filter((s) => {
                        const [sh, sm] = s.split(':').map(Number);
                        const slotMinutes = sh * 60 + sm;
                        return slotMinutes >= startMinutes && slotMinutes < endMinutes;
                      });
                      const canAccess = canAccessReservation(reservation);
                      return (
                        <td
                          key={court.id + '-' + slot + '-reserved'}
                          className={`p-1 border text-center font-bold ${
                            canAccess
                              ? 'bg-gold dark:bg-gold text-navy cursor-pointer hover:bg-gold/80'
                              : 'bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-300 cursor-not-allowed'
                          } ${
                            !canAccess && reservation.isPrivateInfo
                              ? getBorderColorClass(reservation.type)
                              : ''
                          }`}
                          title={
                            canAccess
                              ? `Ocupado por ${getUserDisplayText(reservation.user, reservation.customerName, reservation.userPhone, reservation.userEmail)}`
                              : 'Reserva no disponible'
                          }
                          rowSpan={coveredSlots.length}
                          onClick={() => handleReservationClick(reservation)}
                        >
                          <span className="block">
                            {canAccess ? 'Ocupado' : 'No disponible'}{' '}
                            <div className="flex flex-wrap gap-1 mt-1 justify-center">
                              <span
                                className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                  canAccess
                                    ? 'bg-navy text-gold dark:bg-navy-light dark:text-gold'
                                    : 'bg-gray-500 text-gray-200 dark:bg-gray-700 dark:text-gray-400'
                                }`}
                                style={
                                  canAccess
                                    ? {
                                        backgroundColor:
                                          reservation.type === 'Normal'
                                            ? '#1e293b'
                                            : reservation.type === 'Fijo'
                                              ? '#2563eb'
                                              : reservation.type === 'Torneo'
                                                ? '#be185d'
                                                : reservation.type === 'Invitado'
                                                  ? '#f59e42'
                                                  : reservation.type === 'Clase'
                                                    ? '#0d9488'
                                                    : reservation.type === 'Escuela'
                                                      ? '#4f46e5'
                                                      : reservation.type === 'Cumpleaños'
                                                        ? '#db2777'
                                                        : reservation.type === 'Abono'
                                                          ? '#0891b2'
                                                          : '#1e293b',
                                        color:
                                          reservation.type === 'Invitado' ? '#1e293b' : '#ffffff',
                                      }
                                    : {}
                                }
                              >
                                {canAccess ? reservation.type : 'Privada'}
                              </span>
                              
                              {/* Etiqueta separada para Turno Fijo */}
                              {canAccess && reservation.fixed && reservation.type !== 'Fijo' && (
                                <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-600 text-white">
                                  Fijo
                                </span>
                              )}
                            </div>
                          </span>
                          <span className="text-xs font-semibold flex items-center justify-center">
                            {reservation.isPrivateInfo &&
                              reservation.displayIcon &&
                              getReservationIcon(reservation.displayIcon)}
                            {getUserDisplayText(
                              reservation.user,
                              reservation.customerName,
                              reservation.userPhone,
                              reservation.userEmail
                            )}
                          </span>
                        </td>
                      );
                    } else {
                      // Si el slot está cubierto por la reserva pero no es el inicio, no renderizar celda (queda unificado por rowSpan)
                      return null;
                    }
                  } else {
                    // Slot libre con drag
                    let isSelected = false;
                    if (
                      dragStart &&
                      dragEnd &&
                      dragStart.courtId === court.id &&
                      dragEnd.courtId === court.id
                    ) {
                      const startIdx = slots.indexOf(dragStart.slot);
                      const endIdx = slots.indexOf(dragEnd.slot);
                      if (startIdx !== -1 && endIdx !== -1) {
                        const [from, to] =
                          startIdx < endIdx ? [startIdx, endIdx] : [endIdx, startIdx];
                        isSelected = slots.indexOf(slot) >= from && slots.indexOf(slot) <= to;
                      }
                    }
                    // Verificar si el rango incluye slots ocupados
                    const isRangeOccupied = (() => {
                      if (
                        dragStart &&
                        dragEnd &&
                        dragStart.courtId === court.id &&
                        dragEnd.courtId === court.id
                      ) {
                        const startIdx = slots.indexOf(dragStart.slot);
                        const endIdx = slots.indexOf(dragEnd.slot);
                        if (startIdx !== -1 && endIdx !== -1 && startIdx !== endIdx) {
                          const [from, to] =
                            startIdx < endIdx ? [startIdx, endIdx] : [endIdx, startIdx];
                          for (let idx = from; idx <= to; idx++) {
                            if (getReservationAtSlot(court.id, slots[idx])) return true;
                          }
                        }
                      }
                      return false;
                    })();
                    return (
                      <td
                        key={court.id + '-' + slot + '-free'}
                        className={`p-1 border text-center cursor-pointer bg-green-50 dark:bg-green-900 hover:bg-green-100 ${isSelected ? (isRangeOccupied ? '!bg-red-200 !border-red-600' : '!bg-gold !border-gold text-navy font-bold') : ''}`}
                        onMouseDown={() => {
                          setDragStart({ courtId: court.id, slot });
                          setDragEnd(null);
                        }}
                        onMouseEnter={() =>
                          dragStart &&
                          dragStart.courtId === court.id &&
                          setDragEnd({ courtId: court.id, slot })
                        }
                        onMouseUp={() => {
                          if (
                            dragStart &&
                            dragEnd &&
                            dragStart.courtId === court.id &&
                            dragEnd.courtId === court.id
                          ) {
                            const startIdx = slots.indexOf(dragStart.slot);
                            const endIdx = slots.indexOf(slot);
                            if (startIdx !== -1 && endIdx !== -1 && startIdx !== endIdx) {
                              const [from, to] =
                                startIdx < endIdx ? [startIdx, endIdx] : [endIdx, startIdx];
                              // Si el rango NO tiene ocupados, permitir crear
                              const hasOccupied = slots
                                .slice(from, to + 1)
                                .some((s) => getReservationAtSlot(court.id, s));
                              if (!hasOccupied) {
                                const range = slots.slice(from, to + 1);
                                onSlotClick(court.id, range, selectedDate, court.sport);
                              }
                            }
                          }
                          setDragStart(null);
                          setDragEnd(null);
                        }}
                        onClick={() =>
                          !dragStart && onSlotClick(court.id, slot, selectedDate, court.sport)
                        }
                      >
                        Libre
                      </td>
                    );
                  }
                })}
              </tr>
            ))}
          </tbody>
        </table>
        
        <ReservationInfoModal
          open={infoModalOpen}
          onClose={() => setInfoModalOpen(false)}
          reservation={selectedReservation}
          onUpdate={handleUpdateReservation}
          onDelete={handleDeleteReservation}
          courts={courts}
          currentUser={currentUser}
          reservations={reservations}
        />
      </div>
    </div>
  );
}
