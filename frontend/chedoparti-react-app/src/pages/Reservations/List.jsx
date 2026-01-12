// Utilidad para obtener Date real combinando fecha y hora de reserva
const getReservationDateTime = (reservation) => {
  if (!reservation?.date) return null;
  // Si la hora está en formato HH:mm, combinar con la fecha
  let dateStr = reservation.date;
  let timeStr = reservation.time || '00:00';
  // Si dateStr ya incluye la hora, usar directamente
  if (dateStr.length > 10) {
    return new Date(dateStr);
  }
  // Combinar fecha y hora en formato ISO
  const isoString = `${dateStr}T${timeStr}`;
  return new Date(isoString);
};
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  FiCalendar,
  FiFilter,
  FiSearch,
  FiEye,
  FiEdit2,
  FiTrash2,
  FiPlus,
  FiClock,
  FiUser,
  FiMapPin,
  FiActivity,
  FiCheckCircle,
  FiXCircle,
  FiAlertCircle,
  FiPlay,
  FiDollarSign,
} from 'react-icons/fi';
import { courtsApi, reservationsApi, historyApi, usersApi } from '../../services/api';
import useAuth from '../../hooks/useAuth';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import ViewButton from '../../components/ui/ViewButton';
import EditButton from '../../components/ui/EditButton';
import ReservationFormModalNew from '../../components/ui/ReservationFormModalNew';
import ReservationInfoModalNew from '../../components/ui/ReservationInfoModalNew';
import { useReservationsSync, useCreateReservation, useCancelReservation, useUpdateReservation } from '../../hooks/useReservationSync';
import { useReservationWebSocket } from '../../hooks/useReservationWebSocket';
import { useAppNotifications } from '../../hooks/useAppNotifications';
import usePermissions from '../../hooks/usePermissions';
import { processTimelineEvents } from '../../utils/timelineUtils';

export default function ReservationsList() {
  const { t } = useTranslation();
  const { user: currentUser } = useAuth();
  const { showSuccess, showError, showWarning, reservation: notifications } = useAppNotifications();
  const { can, isAdmin, isStaff, isCoach, isSocio } = usePermissions();

  // Estados principales
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estados de filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [courtFilter, setCourtFilter] = useState('all');
  const [dateFromFilter, setDateFromFilter] = useState('');
  const [dateToFilter, setDateToFilter] = useState('');

  // Nuevos estados para UX mejorada
  const [showHistory, setShowHistory] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'asc' });

  // Estados para datos adicionales
  const [courts, setCourts] = useState([]);
  const [users, setUsers] = useState([]);

  // Estados de modales
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editModalData, setEditModalData] = useState(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState(null);

  // Estado para filtros colapsables
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Hook de sincronización (sin polling automático para evitar bucles infinitos)
  const {
    reservations: syncedReservations,
    isLoading: syncLoading,
    refetch,
  } = useReservationsSync();

  // Hook para crear reservas con optimistic updates
  const createReservationMutation = useCreateReservation();
  
  // Hook para cancelar reservas con optimistic updates
  const cancelReservationMutation = useCancelReservation();
  
  // ✅ Estado para timeline de actividad
  const [timelineEvents, setTimelineEvents] = useState([]);
  const [loadingTimeline, setLoadingTimeline] = useState(false);
  
  // Hook para actualizar reservas con optimistic updates
  const updateReservationMutation = useUpdateReservation();

  // WebSocket para tiempo real (DESHABILITADO EN MODO DEMO)
  const isDemoMode = import.meta.env.VITE_API_BASE_URL === '/api';

  const { isConnected: wsConnected } = useReservationWebSocket({
    autoConnect: !isDemoMode, // No conectar automáticamente en modo demo
    onReservationUpdate: () => refetch(),
    onReservationCreate: () => refetch(),
    onReservationCancel: () => refetch(),
  }); 

  // Filtrar reservaciones con useMemo para evitar re-renders innecesarios
  // Filtrar reservaciones con useMemo para evitar re-renders innecesarios
  const filteredReservations = useMemo(() => {
    let filtered = reservations;

    // Si no es admin ni staff, filtrar por propiedad (Coach o Socio)
    if (!isAdmin() && !isStaff()) {
      filtered = filtered.filter((reservation) => {
        // Match by userId, email, or membershipNumber if available
        return (
          reservation.userId === currentUser.email ||
          reservation.userId === currentUser.id ||
          reservation.customerName === currentUser.name ||
          (reservation.membershipNumber &&
            currentUser.membershipNumber &&
            reservation.membershipNumber === currentUser.membershipNumber)
        );
      });
    }

    // Filtros básicos
    filtered = filtered.filter((reservation) => {
      const matchesSearch =
        !searchTerm ||
        reservation.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reservation.court?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reservation.id?.toString().includes(searchTerm);

      const matchesStatus = statusFilter === 'all' || reservation.status === statusFilter;
      const matchesCourt = courtFilter === 'all' || reservation.courtId?.toString() === courtFilter;

      let matchesDateRange = true;
      if (dateFromFilter) {
        matchesDateRange =
          matchesDateRange && new Date(reservation.date) >= new Date(dateFromFilter);
      }
      if (dateToFilter) {
        matchesDateRange = matchesDateRange && new Date(reservation.date) <= new Date(dateToFilter);
      }

      return matchesSearch && matchesStatus && matchesCourt && matchesDateRange;
    });

    // Filtro de Historial (Futuras vs Pasadas)
    if (!dateFromFilter && !dateToFilter) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      filtered = filtered.filter(reservation => {
        const resDate = getReservationDateTime(reservation);
        if (!resDate) return true;
        
        if (showHistory) {
          return true; // Mostrar todo
        } else {
          // Solo futuras (desde hoy en adelante)
          return resDate >= today;
        }
      });
    }

    // Ordenamiento
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        let aValue, bValue;

        switch (sortConfig.key) {
          case 'date':
            aValue = getReservationDateTime(a);
            bValue = getReservationDateTime(b);
            break;
          case 'status':
            aValue = a.status;
            bValue = b.status;
            break;
          case 'court':
            // Necesitamos acceder a courts, pero está en el scope superior
            // Para simplificar, usamos el ID o nombre si está disponible en el objeto
            aValue = a.courtId; 
            bValue = b.courtId;
            break;
          case 'price':
            aValue = a.finalPrice ?? a.price;
            bValue = b.finalPrice ?? b.price;
            break;
          default:
            aValue = a[sortConfig.key];
            bValue = b[sortConfig.key];
        }

        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    return filtered;
  }, [
    reservations,
    searchTerm,
    statusFilter,
    courtFilter,
    dateFromFilter,
    dateToFilter,
    currentUser,
    isAdmin,
    isStaff,
    showHistory,
    sortConfig
  ]);

  // Handler para cambiar ordenamiento
  const handleSort = (key) => {
    setSortConfig((current) => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  // Obtener icono de ordenamiento
  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return <div className="w-4 h-4" />; // Espacio vacío para alineación
    return sortConfig.direction === 'asc' ? '↑' : '↓';
  };

  // Obtener color del badge de estado
  const getStatusBadgeColor = (status) => {
    const colorMap = {
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300',
      confirmed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
      active: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
      completed: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300',
      cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300',
      no_show: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300',
    };
    return colorMap[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
  };

  // Obtener texto de estado (traducido)
  const getStatusText = (status) => {
    return t(`reservations.status.${status}`, status);
  };

  // Obtener icono de estado
  const getStatusIcon = (status) => {
    const iconMap = {
      pending: '⏳',
      confirmed: '✅',
      active: '🔵',
      completed: '🏆',
      cancelled: '❌',
      no_show: '👻',
    };
    return iconMap[status] || '📝';
  };

  // Formatear fecha y hora
  const formatDateTime = (dateString) => {
    if (!dateString) return '-';
    // dateString can be a Date or string
    const dateObj = typeof dateString === 'string' ? new Date(dateString) : dateString;
    return dateObj.toLocaleString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Formatear solo fecha
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const dateObj = typeof dateString === 'string' ? new Date(dateString) : dateString;
    return dateObj.toLocaleDateString('es-ES');
  };

  // Formatear moneda (evita duplicar signos $ y asegura número)
  const formatCurrency = (value) => {
    if (value === undefined || value === null) return '-';
    const number = Number(value) || 0;
    // Formato sin símbolo (añadimos $ manualmente para mantener consistencia)
    return `$${number.toLocaleString('es-ES')}`;
  };

  // Obtener nombre a mostrar del cliente (para ADMIN siempre mostrar nombre de persona, no tipo)
  // Obtener nombre a mostrar del cliente (para ADMIN siempre mostrar nombre de persona, no tipo)
  const getCustomerName = (reservation) => {
    if (!reservation) return '-';

    // Helper para obtener string seguro
    const getSafeString = (val) => {
      if (!val) return null;
      if (typeof val === 'string') return val;
      if (typeof val === 'object') {
        return val.name || val.email || val.phone || JSON.stringify(val);
      }
      return String(val);
    };

    // Si es ADMIN, priorizar mostrar el nombre de la persona real que creó la reserva
    if (isAdmin) {
      // Buscar por userId primero (más confiable)
      if (reservation.userId && users && users.length > 0) {
        const u = users.find((x) => x.email === reservation.userId || x.id === reservation.userId);
        if (u) return u.name || `${u.firstName || ''} ${u.lastName || ''}`.trim();
      }
      // Si no se encuentra por userId, usar user (campo mock) o customerName
      const safeUser = getSafeString(reservation.user);
      if (
        safeUser &&
        safeUser !== 'Club Torneo' &&
        safeUser !== 'Club Elite'
      ) {
        return safeUser;
      }
      
      const safeCustomerName = getSafeString(reservation.customerName);
      if (
        safeCustomerName &&
        safeCustomerName !== 'Club Torneo' &&
        safeCustomerName !== 'Club Elite'
      ) {
        return safeCustomerName;
      }
      // Para reservas institucionales, mostrar que es del club pero con el tipo
      if (reservation.type === 'Torneo') {
        return `${t('reservations.type.tournament')} (${safeUser || 'Club'})`;
      }
    } else {
      // Para no-admin, comportamiento original
      const safeCustomerName = getSafeString(reservation.customerName);
      if (safeCustomerName) return safeCustomerName;
      
      const safeUser = getSafeString(reservation.user);
      if (safeUser) return safeUser;
      
      if (reservation.userId && users && users.length > 0) {
        const u = users.find((x) => x.email === reservation.userId || x.id === reservation.userId);
        if (u) return u.name || `${u.firstName || ''} ${u.lastName || ''}`.trim();
      }
    }

    // Fallback a número de socio si existe
    if (reservation.membershipNumber) {
      return t('reservations.member_prefix') + ` ${reservation.membershipNumber}`;
    }
    return t('common.empty');
  };

  // Obtener nombre de cancha
  const getCourtName = (courtId) => {
    const court = courts.find((c) => c.id === courtId);
    return court?.name || t('reservations.court_name_fallback', { id: courtId });
  };

  // Obtener deporte de cancha
  const getCourtSport = (courtId) => {
    const court = courts.find((c) => c.id === courtId);
    return court?.sport || court?.type || t('reservations.default_sport');
  };

  // Renderizar timeline de una reserva
  const renderTimeline = (events) => {
    if (!events || events.length === 0) {
      return (
        <p className="text-gray-500 dark:text-gray-400 text-center py-4">
          {t('reservations.modal.no_events')}
        </p>
      );
    }

    return (
      <div className="space-y-4">
        {processTimelineEvents(events).map((event, index) => (
          <div key={index} className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-navy dark:bg-gold rounded-full flex items-center justify-center">
                <span className="text-white dark:text-gray-900 text-sm">
                  {getActionIcon(event.action)}
                </span>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <span
                  className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${getActionBadgeColor(event.action)}`}
                >
                  {getActionText(event.action)}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {formatDateTime(event.timestamp)}
                </span>
              </div>
              <p className="text-sm text-gray-900 dark:text-white mt-1">{event.description}</p>
              {event.user && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {t('reservations.timeline.by_user', { user: event.user })}
                </p>
              )}
              {event.changes && renderChanges(event.changes)}
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Obtener color del badge de acción
  const getActionBadgeColor = (actionType) => {
    const colorMap = {
      CREATE: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
      UPDATE: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
      CANCEL: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300',
      COMPLETE: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300',
      NO_SHOW: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300',
    };
    return (
      colorMap[actionType] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300'
    );
  };

  // Obtener texto de acción (traducido)
  const getActionText = (action) => {
    return t(`reservations.timeline.actions.${action}`, action);
  };

  // Obtener icono de acción
  const getActionIcon = (actionType) => {
    const iconMap = {
      CREATE: '✅',
      UPDATE: '✏️',
      CANCEL: '❌',
      COMPLETE: '✔️',
      NO_SHOW: '👻',
    };
    return iconMap[actionType] || '📝';
  };

  // Renderizar cambios
  const renderChanges = (changes) => {
    if (!changes) return null;

    return (
      <div className="mt-2 space-y-1">
        {Object.entries(changes).map(([field, change]) => (
          <div key={field} className="text-xs bg-yellow-50 dark:bg-yellow-900/20 p-2 rounded">
            {t('reservations.timeline.field_change', {
              field: field,
              from: change.from || 'N/A',
              to: change.to,
            })}
          </div>
        ))}
      </div>
    );
  };

  // Contar filtros activos
  const activeFiltersCount = [
    searchTerm && searchTerm.trim() !== '',
    statusFilter !== 'all',
    courtFilter !== 'all',
    dateFromFilter !== '',
    dateToFilter !== '',
  ].filter(Boolean).length;

  // Aplicar filtros
  const applyFilters = () => {
    loadReservations();
  };

  // Limpiar filtros
  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setCourtFilter('all');
    setDateFromFilter('');
    setDateToFilter('');
  };

  // Cargar reservaciones desde API
  const loadReservations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await reservationsApi.list();
      setReservations(response.data || []);
    } catch (err) {
      console.error('Error loading reservations:', err);
      setError('Error al cargar las reservaciones');
    } finally {
      setLoading(false);
    }
  }, []);

  // Cargar datos adicionales
  const loadAdditionalData = useCallback(async () => {
    try {
      const [courtsData, usersData] = await Promise.all([
        courtsApi.list(),
        isAdmin ? usersApi.list() : Promise.resolve({ data: [] }),
      ]);

      setCourts(courtsData.data || []);
      setUsers(usersData.data || []);
    } catch (err) {
      console.error('Error loading additional data:', err);
    }
  }, [isAdmin]);

  // Manejar nueva reserva
  const handleNewReservation = useCallback(() => {
    setCreateModalOpen(true);
  }, []);

  // Helper para verificar si el usuario puede editar una reserva
  const canEditReservation = useCallback((reservation) => {
    if (!reservation) return false;
    if (reservation.status === 'cancelled' || reservation.status === 'completed' || reservation.status === 'finalizado') return false;
    
    // Admin y Staff siempre pueden editar
    if (isAdmin() || isStaff()) return true;
    
    // Socios pueden editar sus propias reservas
    if (isSocio()) {
      return (
        reservation.userId === currentUser.email ||
        reservation.userId === currentUser.id ||
        reservation.customerName === currentUser.name ||
        (reservation.membershipNumber &&
          currentUser.membershipNumber &&
          reservation.membershipNumber === currentUser.membershipNumber)
      );
    }
    
    return false;
  }, [isAdmin, isStaff, isSocio, currentUser]);

  // Manejar edición de reserva
  const handleEditReservation = useCallback(
    (reservation) => {
      if (!canEditReservation(reservation)) return;
      setEditModalData(reservation);
      setEditModalOpen(true);
    },
    [canEditReservation]
  );

  // Manejar ver detalles/timeline
  const handleViewDetails = useCallback((reservation) => {
    setSelectedReservation(reservation);
    setDetailsModalOpen(true);
    
    // ✅ Cargar timeline automáticamente
    loadTimelineEvents(reservation.id);
  }, []);

  // Función para crear nueva reserva (solo crear)
  const handleCreateReservation = async (reservationData) => {
    try {
      const response = await createReservationMutation.mutateAsync(reservationData);

      // Notificación de éxito
      showSuccess('Reserva creada exitosamente');

      setCreateModalOpen(false);
      
      // ✅ NO es necesario llamar refetch()
      // El hook ya invalida el cache automáticamente
    } catch (error) {
      console.error('❌ Error creating reservation:', error);

      // Notificación de error
      showError(error.message || 'Error al crear la reserva');
    }
  };

  // Función para actualizar reserva existente (solo editar)
  const handleUpdateReservation = async (updatedReservation) => {
    try {
      // ✅ Usar el hook de actualización con optimistic updates
      await updateReservationMutation.mutateAsync({
        id: updatedReservation.id,
        updates: updatedReservation
      });

      // ✅ El hook maneja automáticamente:
      // - Optimistic update (actualización inmediata de UI)
      // - Invalidación de cache (refetch automático)
      // - Actualización en Dashboard y Lista
      // - Sincronización en tiempo real

      // Notificación de éxito
      showSuccess('Reserva actualizada exitosamente');

      setEditModalOpen(false);
      setEditModalData(null);
      
      // ✅ NO es necesario llamar refetch() ni setReservations()
      // El hook ya invalida el cache automáticamente
    } catch (error) {
      console.error('❌ Error updating reservation:', error);

      // Notificación de error
      showError(error.message || 'Error al actualizar la reserva');
    }
  };

  // ✅ Función para cargar timeline de eventos
  const loadTimelineEvents = async (reservationId) => {
    if (!reservationId) return;
    
    setLoadingTimeline(true);
    try {
      const response = await historyApi.getByReservation(reservationId);
      setTimelineEvents(response.data || []);
    } catch (error) {
      console.error('Error loading timeline:', error);
      setTimelineEvents([]);
    } finally {
      setLoadingTimeline(false);
    }
  };

  // Función para cancelar reserva
  const handleCancelReservation = async (reservation) => {
    try {
      // ✅ Usar el hook de cancelación con optimistic updates
      await cancelReservationMutation.mutateAsync({ 
        id: reservation.id,
        reason: 'Cancelada desde el listado'
      });

      // ✅ El hook maneja automáticamente:
      // - Optimistic update (actualización inmediata de UI)
      // - Invalidación de cache (refetch automático)
      // - Liberación de slots en todos los dashboards
      // - Sincronización en tiempo real

      showSuccess('Reserva cancelada exitosamente');

      // Cerrar modales si están abiertos
      setEditModalOpen(false);
      setEditModalData(null);
      
      // ✅ NO es necesario llamar refetch() ni setReservations()
      // El hook ya invalida el cache automáticamente
    } catch (error) {
      console.error('❌ Error cancelling reservation:', error);
      showError(error.message || 'Error al cancelar la reserva');
    }
  };

  // Efectos
  useEffect(() => {
    loadReservations();
    loadAdditionalData();
  }, [loadReservations, loadAdditionalData]);

  // Sincronización de reservas (TEMPORALMENTE DESHABILITADO - causa loop infinito)
  // TODO: Revisar lógica de sincronización con syncedReservations
  /* useEffect(() => {
    if (syncedReservations && Array.isArray(syncedReservations)) {
      setReservations((prev) => {
        // Solo actualizar si la longitud cambia o si el primer/último elemento es diferente (heurística simple)
        // O si prev está vacío
        if (prev.length !== syncedReservations.length || prev.length === 0) {
          return syncedReservations;
        }
        // Verificación más profunda si es necesario, pero evitar JSON.stringify en cada render si es posible
        // Por ahora, confiamos en que si la longitud es la misma, no necesitamos forzar update masivo
        // a menos que useReservationsSync garantice referencia estable si no hay cambios.
        // Si useReservationsSync devuelve nueva referencia siempre, esto evita el bucle.
        
        // Mejor aproximación: comparar IDs o timestamps de modificación si existen
        const isDifferent = prev.some((r, i) => r.id !== syncedReservations[i]?.id || r.updatedAt !== syncedReservations[i]?.updatedAt);
        if (isDifferent) {
          return syncedReservations;
        }
        return prev;
      });
    }
  }, [syncedReservations]); // Depender del array completo para detectar cambios de contenido
  */

  useEffect(() => {
    setLoading(syncLoading);
  }, [syncLoading]);

  // Manejar búsqueda con debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      // La búsqueda se maneja en filteredReservations
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  // Manejar cierre del modal con Escape
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape' && detailsModalOpen) {
        setDetailsModalOpen(false);
        setSelectedReservation(null);
      }
    };

    const handleClickOutside = (event) => {
      if (event.target.classList.contains('modal-backdrop')) {
        setDetailsModalOpen(false);
        setSelectedReservation(null);
      }
    };

    if (detailsModalOpen) {
      document.addEventListener('keydown', handleEscape);
      document.addEventListener('click', handleClickOutside);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('click', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [detailsModalOpen]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-3">
            <FiCalendar className="text-2xl text-navy dark:text-gold" />
            <h1 className="text-2xl font-bold text-navy dark:text-gold">
              {t('reservations.title')}
            </h1>
          </div>
          <Button
            onClick={handleNewReservation}
            className="bg-navy hover:bg-navy/90 text-white dark:bg-gold dark:text-gray-900 dark:hover:bg-gold/90 flex items-center space-x-2"
          >
            <FiPlus />
            <span>{t('reservations.new')}</span>
          </Button>
        </div>
        <p className="text-gray-600 dark:text-gray-400">{t('reservations.subtitle')}</p>
      </div>

      {/* Filtros */}
      <Card className="p-6">
        {/* Header de Filtros */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setFiltersOpen(!filtersOpen)}
            className="bg-navy hover:bg-navy/90 text-white dark:bg-gold dark:text-gray-900 dark:hover:bg-gold/90 font-semibold rounded-lg px-4 py-2 shadow flex items-center gap-2 text-sm transition-colors duration-150"
            aria-expanded={filtersOpen}
            aria-controls="filter-panel"
          >
            <motion.svg
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
              className="w-5 h-5"
              animate={{ rotate: filtersOpen ? 180 : 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
              <path d="M2.628 1.601C5.028 1.206 7.49 1 10 1s4.973.206 7.372.601a.75.75 0 0 1 .628.74v2.288a2.25 2.25 0 0 1-.659 1.59l-4.682 4.683a2.25 2.25 0 0 0-.659 1.59v3.037c0 .684-.31 1.33-.844 1.757l-1.937 1.55A.75.75 0 0 1 8 18.25v-5.757a2.25 2.25 0 0 0-.659-1.591L2.659 6.22A2.25 2.25 0 0 1 2 4.629V2.34a.75.75 0 0 1 .628-.74Z" />
            </motion.svg>
            {activeFiltersCount > 0
              ? `${activeFiltersCount} ${t('reservations.filters.title')}`
              : t('reservations.filters.title')}
          </button>

          {activeFiltersCount > 0 && (
            <Button variant="outline" size="sm" onClick={clearFilters}>
              {t('reservations.filters.clear')}
            </Button>
          )}
        </div>

        {/* Toggle de Historial */}
        <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg mb-4">
            <button
            onClick={() => setShowHistory(false)}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
              !showHistory 
                ? 'bg-white dark:bg-gray-700 text-navy dark:text-gold shadow-sm' 
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            Próximas
          </button>
          <button
            onClick={() => setShowHistory(true)}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
              showHistory 
                ? 'bg-white dark:bg-gray-700 text-navy dark:text-gold shadow-sm' 
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            Historial Completo
          </button>
        </div>

        {/* Panel de Filtros Colapsable */}
        {filtersOpen && (
          <div
            id="filter-panel"
            className="space-y-4 border-t border-gray-200 dark:border-gray-700 pt-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Búsqueda */}
              <div className="lg:col-span-2">
                <Input
                  label={t('reservations.filters.search')}
                  placeholder={t('reservations.search_placeholder')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  icon={<FiSearch />}
                />
              </div>

              {/* Filtro de estado */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('reservations.filters.status')}
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-navy dark:focus:ring-gold focus:border-navy dark:focus:border-gold"
                >
                  <option value="all">{t('reservations.all_statuses')}</option>
                  <option value="pending">{t('reservations.status.pending')}</option>
                  <option value="confirmed">{t('reservations.status.confirmed')}</option>
                  <option value="active">{t('reservations.status.active')}</option>
                  <option value="completed">{t('reservations.status.completed')}</option>
                  <option value="cancelled">{t('reservations.status.cancelled')}</option>
                  <option value="no_show">{t('reservations.status.no_show')}</option>
                </select>
              </div>

              {/* Filtro de cancha */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('reservations.filters.court')}
                </label>
                <select
                  value={courtFilter}
                  onChange={(e) => setCourtFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-navy dark:focus:ring-gold focus:border-navy dark:focus:border-gold"
                >
                  <option value="all">{t('reservations.all_courts')}</option>
                  {courts.map((court) => (
                    <option key={court.id} value={court.id}>
                      {court.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Filtros de fecha */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('reservations.filters.date_from')}
                </label>
                <input
                  type="date"
                  value={dateFromFilter}
                  onChange={(e) => setDateFromFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-navy dark:focus:ring-gold focus:border-navy dark:focus:border-gold"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('reservations.filters.date_to')}
                </label>
                <input
                  type="date"
                  value={dateToFilter}
                  onChange={(e) => setDateToFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-navy dark:focus:ring-gold focus:border-navy dark:focus:border-gold"
                />
              </div>

              <div className="flex items-end space-x-2">
                <Button onClick={applyFilters} className="flex-1">
                  {t('reservations.filters.apply')}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Chips de Filtros Activos */}
        {activeFiltersCount > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {searchTerm && searchTerm.trim() !== '' && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-navy/10 text-navy dark:bg-gold/10 dark:text-gold">
                {t('reservations.filters.search_label', { term: searchTerm })}
                <button
                  onClick={() => setSearchTerm('')}
                  className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full hover:bg-navy/20 dark:hover:bg-gold/20"
                >
                  ×
                </button>
              </span>
            )}
            {statusFilter !== 'all' && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300">
                {t('reservations.filters.status_label', { status: getStatusText(statusFilter) })}
                <button
                  onClick={() => setStatusFilter('all')}
                  className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full hover:bg-blue-200 dark:hover:bg-blue-800"
                >
                  ×
                </button>
              </span>
            )}
            {courtFilter !== 'all' && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">
                {t('reservations.filters.court_label', {
                  court: getCourtName(parseInt(courtFilter)),
                })}
                <button
                  onClick={() => setCourtFilter('all')}
                  className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full hover:bg-green-200 dark:hover:bg-green-800"
                >
                  ×
                </button>
              </span>
            )}
            {dateFromFilter && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300">
                {t('reservations.filters.date_from_label', { date: formatDate(dateFromFilter) })}
                <button
                  onClick={() => setDateFromFilter('')}
                  className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full hover:bg-purple-200 dark:hover:bg-purple-800"
                >
                  ×
                </button>
              </span>
            )}
            {dateToFilter && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300">
                {t('reservations.filters.date_to_label', { date: formatDate(dateToFilter) })}
                <button
                  onClick={() => setDateToFilter('')}
                  className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full hover:bg-orange-200 dark:hover:bg-orange-800"
                >
                  ×
                </button>
              </span>
            )}
          </div>
        )}

        {/* Contador de resultados */}
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {t('reservations.filters.results_count', { count: filteredReservations.length })}
          </div>
        </div>
      </Card>

      {/* Tabla de reservas */}
      <Card className="overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-navy dark:border-gold mx-auto mb-4"></div>
            <p className="text-gray-500 dark:text-gray-400">{t('reservations.loading')}</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </div>
        ) : filteredReservations.length === 0 ? (
          <div className="p-8 text-center">
            <FiCalendar className="text-4xl text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-500 dark:text-gray-400 mb-2">
              {t('reservations.no_reservations')}
            </h3>
            <p className="text-gray-400 dark:text-gray-500">
              {searchTerm || statusFilter !== 'all' || courtFilter !== 'all'
                ? t('reservations.no_matches')
                : t('reservations.empty_state')}
            </p>
          </div>
        ) : (
          <>
            {/* Vista Desktop - Tabla */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {t('reservations.table.id')}
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => handleSort('status')}
                    >
                      <div className="flex items-center gap-1">
                        {t('reservations.table.status')}
                        {getSortIcon('status')}
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => handleSort('date')}
                    >
                      <div className="flex items-center gap-1">
                        {t('reservations.table.details')}
                        {getSortIcon('date')}
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {t('reservations.table.client')}
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => handleSort('price')}
                    >
                      <div className="flex items-center gap-1">
                        {t('reservations.table.price')}
                        {getSortIcon('price')}
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {t('reservations.table.actions')}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredReservations.map((reservation) => (
                    <tr
                      key={reservation.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      {/* ID de Reserva */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white font-mono">
                        #{reservation.id}
                      </td>

                      {/* Estado */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <span className="text-lg">{getStatusIcon(reservation.status)}</span>
                          <span
                            className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(reservation.status)}`}
                          >
                            {getStatusText(reservation.status)}
                          </span>
                        </div>
                      </td>

                      {/* Detalles de Reserva */}
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 dark:text-white">
                          <div className="font-medium flex items-center space-x-2">
                            <FiMapPin className="text-gray-400" />
                            <span>
                              {getCourtName(reservation.courtId)} -{' '}
                              {getCourtSport(reservation.courtId)}
                            </span>
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center space-x-2 mt-1">
                            <FiCalendar className="text-gray-400" />
                            <span>{formatDateTime(getReservationDateTime(reservation))}</span>
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {t('reservations.duration')}: {reservation.duration || '1:00'}{' '}
                            {t('reservations.hours_short')}
                          </div>
                        </div>
                      </td>

                      {/* Cliente */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          <div className="font-medium flex items-center space-x-2">
                            <FiUser className="text-gray-400" />
                            <span>{getCustomerName(reservation)}</span>
                          </div>
                          {isAdmin && reservation.type && (
                            <div className="text-xs text-blue-600 dark:text-blue-400">
                              {t('reservations.type_label', { type: reservation.type })}
                            </div>
                          )}
                          {reservation.membershipNumber && (
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {t('reservations.member_number', {
                                number: reservation.membershipNumber,
                              })}
                            </div>
                          )}
                          {reservation.phone && (
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {typeof reservation.phone === 'object'
                                ? reservation.phone.phone || ''
                                : reservation.phone}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Precio */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          <div className="font-medium flex items-center space-x-1">
                            <FiDollarSign className="text-green-500" />
                            <span>
                              {formatCurrency(reservation.finalPrice ?? reservation.price)}
                            </span>
                          </div>
                          {reservation.finalPrice !== undefined &&
                            reservation.finalPrice !== reservation.price && (
                              <div className="text-xs text-gray-500 dark:text-gray-400 line-through">
                                {formatCurrency(reservation.price)}
                              </div>
                            )}
                        </div>
                      </td>

                      {/* Acciones */}
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <ViewButton onClick={() => handleViewDetails(reservation)}>
                            {t('reservations.actions.view_timeline')}
                          </ViewButton>
                          {canEditReservation(reservation) && (
                            <EditButton onClick={() => handleEditReservation(reservation)} />
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Vista Móvil - Cards */}
            <div className="md:hidden space-y-4 p-4">
              {filteredReservations.map((reservation) => (
                <div
                  key={reservation.id}
                  className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 shadow-sm"
                >
                  {/* Header de la card */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{getStatusIcon(reservation.status)}</span>
                      <span
                        className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(reservation.status)}`}
                      >
                        {getStatusText(reservation.status)}
                      </span>
                    </div>
                    <span className="text-sm font-mono text-gray-500 dark:text-gray-400">
                      #{reservation.id}
                    </span>
                  </div>

                  {/* Información principal */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center space-x-2">
                      <FiMapPin className="text-gray-400 flex-shrink-0" />
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {getCourtName(reservation.courtId)} - {getCourtSport(reservation.courtId)}
                      </span>
                    </div>

                    <div className="flex items-center space-x-1">
                      <FiCalendar className="text-gray-400" />
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        {formatDateTime(getReservationDateTime(reservation))}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <FiUser className="text-gray-400 flex-shrink-0" />
                      <div className="flex-1">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {getCustomerName(reservation)}
                        </span>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {isAdmin && reservation.type && (
                            <span className="text-xs text-blue-600 dark:text-blue-400">
                              {t('reservations.type_label', { type: reservation.type })}
                            </span>
                          )}
                          {reservation.membershipNumber && (
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {t('reservations.member_number', {
                                number: reservation.membershipNumber,
                              })}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1">
                        <FiDollarSign className="text-green-500" />
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {formatCurrency(reservation.finalPrice ?? reservation.price)}
                        </span>
                        {reservation.finalPrice !== undefined &&
                          reservation.finalPrice !== reservation.price && (
                            <span className="text-xs text-gray-500 dark:text-gray-400 line-through ml-1">
                              {formatCurrency(reservation.price)}
                            </span>
                          )}
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {reservation.duration || '1:00'} hrs
                      </span>
                    </div>
                  </div>

                  {/* Acciones */}
                  <div className="flex space-x-2 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <ViewButton
                      onClick={() => handleViewDetails(reservation)}
                      className="flex-1 flex items-center justify-center"
                    >
                      Timeline
                    </ViewButton>
                    {canEditReservation(reservation) && (
                      <EditButton
                        onClick={() => handleEditReservation(reservation)}
                        className="flex-1 flex items-center justify-center"
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </Card>

      {/* Modal de nueva reserva */}
      {createModalOpen && (
        <>
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
              <h2 className="text-xl font-bold mb-4">🧪 Test Modal - Crear Reserva</h2>
              <p className="mb-4">Si puedes ver este modal, los estados funcionan correctamente.</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setCreateModalOpen(false)}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
                >
                  Cerrar Test
                </button>
                <button
                  onClick={() => {
                    setCreateModalOpen(false);
                    showSuccess('🧪 Modal de crear funcionando correctamente!');
                  }}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                >
                  Confirmar Test
                </button>
              </div>
            </div>
          </div>
          <ReservationFormModalNew
            open={createModalOpen}
            onClose={() => setCreateModalOpen(false)}
            onSubmit={handleCreateReservation}
            courts={courts}
            users={users}
            reservations={reservations}
            currentUser={currentUser}
          />
        </>
      )}

      {/* Modal de editar reserva */}
      {editModalOpen && editModalData && (
        <>
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
              <h2 className="text-xl font-bold mb-4">🧪 Test Modal - Editar Reserva</h2>
              <p className="mb-4">
                Editando reserva #{editModalData?.id} - {editModalData?.customerName}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setEditModalOpen(false);
                    setEditModalData(null);
                  }}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
                >
                  Cerrar Test
                </button>
                <button
                  onClick={() => {
                    setEditModalOpen(false);
                    setEditModalData(null);
                    showSuccess('🧪 Modal de edición funcionando correctamente!');
                  }}
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
                >
                  Confirmar Test
                </button>
              </div>
            </div>
          </div>
          <ReservationFormModalNew
            open={editModalOpen}
            onClose={() => {
              setEditModalOpen(false);
              setEditModalData(null);
            }}
            onSubmit={handleUpdateReservation}
            onCancel={handleCancelReservation}
            initialData={editModalData}
            reservations={reservations}
            courts={courts}
            users={users}
            currentUser={currentUser}
          />
        </>
      )}

      {/* Modal de Timeline de Reserva */}
      {detailsModalOpen && selectedReservation && (
        <div className="modal-backdrop fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 transition-opacity duration-300">
          <div
            className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[80vh] overflow-y-auto transform transition-all duration-300 scale-100 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-navy dark:text-gold">
                    Timeline de Reserva #{selectedReservation.id}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {getCourtName(selectedReservation.courtId)} -{' '}
                    {getCourtSport(selectedReservation.courtId)} |{' '}
                    {formatDateTime(getReservationDateTime(selectedReservation))}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    Presiona Esc o haz click fuera para cerrar
                  </p>
                </div>
                <button
                  onClick={() => {
                    setDetailsModalOpen(false);
                    setSelectedReservation(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl leading-none p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  aria-label="Cerrar modal"
                  title="Cerrar (Esc)"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Estado Actual
                    </h4>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-lg">{getStatusIcon(selectedReservation.status)}</span>
                      <span
                        className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(selectedReservation.status)}`}
                      >
                        {getStatusText(selectedReservation.status)}
                      </span>
                    </div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Cliente
                    </h4>
                    <p className="text-sm text-gray-900 dark:text-white mt-1">
                      {getCustomerName(selectedReservation)}
                    </p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Precio Final
                    </h4>
                    <p className="text-sm text-gray-900 dark:text-white mt-1">
                      {formatCurrency(selectedReservation.finalPrice ?? selectedReservation.price)}
                    </p>
                  </div>
                </div>

                {/* Timeline */}
                <div>
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    Timeline de Actividad
                  </h4>
                  {loadingTimeline ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                      <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">
                        Cargando historial...
                      </p>
                    </div>
                  ) : timelineEvents && timelineEvents.length > 0 ? (
                    <div className="space-y-3">
                      {processTimelineEvents(timelineEvents).map((event, index) => (
                        <div
                          key={event.id || index}
                          className="flex items-start space-x-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                        >
                          <div className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 dark:text-blue-400 text-xs font-medium">
                              {event.actionType === 'CREATE' ? '✚'
                                : event.actionType === 'UPDATE' ? '✏️'
                                : event.actionType === 'CANCEL' ? '✖'
                                : event.actionType === 'COMPLETE' ? '✓'
                                : '•'}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${
                                event.actionType === 'CREATE' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                                  : event.actionType === 'UPDATE' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300'
                                  : event.actionType === 'CANCEL' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
                                  : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300'
                              }`}>
                                {event.actionType === 'CREATE' ? 'Creada'
                                  : event.actionType === 'UPDATE' ? 'Modificada'
                                  : event.actionType === 'CANCEL' ? 'Cancelada'
                                  : event.actionType === 'COMPLETE' ? 'Completada'
                                  : event.actionType}
                              </span>
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {formatDateTime(event.timestamp)}
                              </span>
                            </div>
                            <p className="text-sm text-gray-900 dark:text-gray-100 mb-1">
                              {event.details}
                            </p>
                            {event.performedBy && (
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                Por: {event.performedBy.name} ({event.performedBy.role})
                              </p>
                            )}
                            {event.changes && Object.keys(event.changes).length > 0 && (
                              <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                                <strong>Cambios:</strong>
                                {Object.entries(event.changes).map(([key, value]) => (
                                  <div key={key} className="ml-2">
                                    • {key}: {value.from} → {value.to}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <FiActivity className="text-4xl text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500 dark:text-gray-400">
                        No hay eventos registrados para esta reserva
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
