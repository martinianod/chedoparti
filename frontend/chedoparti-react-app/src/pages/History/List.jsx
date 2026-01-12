import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FiClock, FiSearch, FiFilter, FiUser, FiCalendar, FiActivity, FiEye } from 'react-icons/fi';
import { historyApi, usersApi } from '../../services/api';
import useAuth from '../../hooks/useAuth';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

export default function HistoryList() {
  const { t } = useTranslation();
  const { user: currentUser } = useAuth();

  // Estados principales
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estados de filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [userFilter, setUserFilter] = useState('all');
  const [dateFromFilter, setDateFromFilter] = useState('');
  const [dateToFilter, setDateToFilter] = useState('');

  // Estados para usuarios (para filtro)
  const [users, setUsers] = useState([]);

  // Estados del modal de detalles
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);

  // Verificar permisos
  const hasAdminRole =
    currentUser?.role === 'INSTITUTION_ADMIN' || (currentUser?.roles && currentUser.roles.includes('INSTITUTION_ADMIN'));

  // Cargar historial
  const loadHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        search: searchTerm,
        action: actionFilter,
        userId: userFilter !== 'all' ? userFilter : null,
        dateFrom: dateFromFilter,
        dateTo: dateToFilter,
      };

      const response = await historyApi.list(params);
      setHistory(response.data || []);
    } catch (err) {
      console.error('Error loading history:', err);
      setError('Error al cargar el historial');
    } finally {
      setLoading(false);
    }
  };

  // Cargar usuarios para filtro
  const loadUsers = async () => {
    try {
      const response = await usersApi.list();
      setUsers(response.data || []);
    } catch (err) {
      console.error('Error loading users:', err);
    }
  };

  // Aplicar filtros
  const applyFilters = () => {
    loadHistory();
  };

  // Limpiar filtros
  const clearFilters = () => {
    setSearchTerm('');
    setActionFilter('all');
    setUserFilter('all');
    setDateFromFilter('');
    setDateToFilter('');
  };

  // Obtener color del badge de estado de reserva
  const getStatusBadgeColor = (status) => {
    const colorMap = {
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300',
      confirmed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
      active: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
      completed: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
      cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300',
      no_show: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300',
      deleted: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300',
    };
    return colorMap[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
  };

  // Obtener texto de estado
  const getStatusText = (status) => {
    const statusMap = {
      pending: 'Pendiente',
      confirmed: 'Confirmada',
      active: 'Activa',
      completed: 'Completada',
      cancelled: 'Cancelada',
      no_show: 'No Show',
      deleted: 'Eliminada',
    };
    return statusMap[status] || status;
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
      deleted: '🗑️',
    };
    return iconMap[status] || '📝';
  };

  // Obtener color del badge de acción (para el timeline en el modal)
  const getActionBadgeColor = (actionType) => {
    const colorMap = {
      CREATE: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
      UPDATE: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
      CANCEL: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300',
      COMPLETE: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300',
      NO_SHOW: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300',
      DELETE: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300',
    };
    return (
      colorMap[actionType] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300'
    );
  };

  // Obtener texto de acción
  const getActionText = (action) => {
    const actionMap = {
      reservation_created: 'Creada',
      reservation_modified: 'Modificada',
      reservation_cancelled: 'Cancelada',
      reservation_completed: 'Completada',
      reservation_no_show: 'No Show',
      reservation_deleted: 'Eliminada',
    };
    return actionMap[action] || action;
  };

  // Obtener icono de acción
  const getActionIcon = (actionType) => {
    const iconMap = {
      CREATE: '✅',
      UPDATE: '✏️',
      CANCEL: '❌',
      COMPLETE: '✔️',
      NO_SHOW: '👻',
      DELETE: '🗑️',
    };
    return iconMap[actionType] || '📝';
  };

  // Formatear fecha y hora
  const formatDateTime = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Formatear fecha para inputs
  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toISOString().split('T')[0];
  };

  // Renderizar cambios
  const renderChanges = (changes) => {
    if (!changes) return null;

    return (
      <div className="mt-2 space-y-1">
        {Object.entries(changes).map(([field, change]) => (
          <div key={field} className="text-xs bg-yellow-50 dark:bg-yellow-900/20 p-2 rounded">
            <span className="font-medium capitalize">{field}:</span>{' '}
            <span className="text-red-600 dark:text-red-400">{change.from || 'N/A'}</span> →{' '}
            <span className="text-green-600 dark:text-green-400">{change.to}</span>
          </div>
        ))}
      </div>
    );
  };

  // Renderizar timeline de eventos en el modal
  const renderTimeline = (events) => {
    if (!events || events.length === 0) return null;

    return (
      <div className="space-y-4">
        {events.map((event, index) => (
          <div key={event.id} className="relative">
            {/* Línea de conexión */}
            {index < events.length - 1 && (
              <div className="absolute left-6 top-12 w-0.5 h-8 bg-gray-300 dark:bg-gray-600"></div>
            )}

            {/* Punto del timeline */}
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-12 h-12 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-full flex items-center justify-center">
                <span className="text-lg">{getActionIcon(event.actionType)}</span>
              </div>

              <div className="flex-1 min-w-0">
                {/* Header del evento */}
                <div className="flex items-center space-x-3 mb-2">
                  <span
                    className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${getActionBadgeColor(event.actionType)}`}
                  >
                    {getActionText(event.action)}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                    {formatDateTime(event.timestamp)}
                  </span>
                </div>

                {/* Detalles del evento */}
                <p className="text-sm text-gray-900 dark:text-white mb-2">{event.details}</p>

                {/* Usuario que realizó la acción */}
                <div className="flex items-center space-x-2 mb-2">
                  <div className="flex-shrink-0 h-6 w-6">
                    <div className="h-6 w-6 rounded-full bg-navy/10 dark:bg-gold/20 flex items-center justify-center">
                      <span className="text-xs font-medium text-navy dark:text-gold">
                        {event.performedBy.name
                          ?.split(' ')
                          .map((n) => n[0])
                          .join('')
                          .substring(0, 2)
                          .toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-medium text-gray-900 dark:text-white">
                      {event.performedBy.name}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {event.performedBy.role}
                    </div>
                  </div>
                </div>

                {/* Cambios realizados */}
                {event.changes && renderChanges(event.changes)}

                {/* Información técnica (solo si está disponible) */}
                {(event.ipAddress || event.userAgent) && (
                  <div className="mt-2 text-xs text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-800 p-2 rounded">
                    {event.ipAddress && <div>IP: {event.ipAddress}</div>}
                    {event.userAgent && <div>Navegador: {event.userAgent}</div>}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Filtrar historial según permisos
  const filteredHistory = history.filter((entry) => {
    // Los ADMINs pueden ver todo
    if (hasAdminRole) return true;

    // Los usuarios regulares solo ven su propio historial
    return entry.performedBy.id === currentUser?.id;
  });

  // Cargar datos al montar
  useEffect(() => {
    loadHistory();
    if (hasAdminRole) {
      loadUsers();
    }
  }, []);

  // Recargar cuando cambian los filtros (después de un delay)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadHistory();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  // Manejar cierre del modal con Escape y click fuera
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape' && detailsModalOpen) {
        setDetailsModalOpen(false);
        setSelectedEntry(null);
      }
    };

    const handleClickOutside = (event) => {
      // Solo cerrar si se hace click en el backdrop (no en el contenido del modal)
      if (event.target.classList.contains('modal-backdrop')) {
        setDetailsModalOpen(false);
        setSelectedEntry(null);
      }
    };

    if (detailsModalOpen) {
      document.addEventListener('keydown', handleEscape);
      document.addEventListener('click', handleClickOutside);

      // Prevenir scroll del body cuando el modal está abierto
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('click', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [detailsModalOpen]);

  if (!hasAdminRole && !currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Acceso Denegado</h1>
          <p className="text-gray-600 dark:text-gray-400">
            No tienes permisos para ver el historial del sistema
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-3 mb-2">
          <FiClock className="text-2xl text-navy dark:text-gold" />
          <h1 className="text-2xl font-bold text-navy dark:text-gold">Historial de Reservas</h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          Seguimiento completo de todas las acciones realizadas en el sistema
        </p>
      </div>

      {/* Filtros */}
      <Card className="p-6">
        <div className="flex items-center space-x-3 mb-4">
          <FiFilter className="text-lg text-navy dark:text-gold" />
          <h2 className="text-lg font-semibold text-navy dark:text-gold">Filtros</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {/* Búsqueda */}
          <div className="lg:col-span-2">
            <Input
              label="Buscar"
              placeholder="Buscar por usuario, detalle, cancha..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={<FiSearch />}
            />
          </div>

          {/* Filtro de acción */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tipo de Acción
            </label>
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-navy dark:focus:ring-gold focus:border-navy dark:focus:border-gold"
            >
              <option value="all">Todas las acciones</option>
              <option value="CREATE">Creaciones</option>
              <option value="UPDATE">Modificaciones</option>
              <option value="CANCEL">Cancelaciones</option>
              <option value="COMPLETE">Completadas</option>
              <option value="DELETE">Eliminaciones</option>
            </select>
          </div>

          {/* Filtro de usuario (solo para ADMINs) */}
          {hasAdminRole && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Usuario
              </label>
              <select
                value={userFilter}
                onChange={(e) => setUserFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-navy dark:focus:ring-gold focus:border-navy dark:focus:border-gold"
              >
                <option value="all">Todos los usuarios</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Filtros de fecha */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Desde
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
              Hasta
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
              Aplicar Filtros
            </Button>
            <Button variant="outline" onClick={clearFilters}>
              Limpiar
            </Button>
          </div>
        </div>

        <div className="text-sm text-gray-500 dark:text-gray-400">
          {filteredHistory.length} entradas encontradas
        </div>
      </Card>

      {/* Tabla de historial */}
      <Card className="overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-navy dark:border-gold mx-auto mb-4"></div>
            <p className="text-gray-500 dark:text-gray-400">Cargando historial...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </div>
        ) : filteredHistory.length === 0 ? (
          <div className="p-8 text-center">
            <FiClock className="text-4xl text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-500 dark:text-gray-400 mb-2">
              No hay historial disponible
            </h3>
            <p className="text-gray-400 dark:text-gray-500">
              {searchTerm || actionFilter !== 'all' || userFilter !== 'all'
                ? 'Intenta ajustar los filtros de búsqueda'
                : 'El historial aparecerá aquí cuando se realicen acciones en el sistema'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    ID Reserva
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Estado Actual
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Detalles de Reserva
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actividad
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Última Modificación
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredHistory.map((reservation) => (
                  <tr
                    key={reservation.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    {/* ID de Reserva */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white font-mono">
                      #{reservation.id}
                    </td>

                    {/* Estado Actual */}
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
                        <div className="font-medium">
                          {reservation.court} - {reservation.sport}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {reservation.date} {reservation.time}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {reservation.customerName}
                        </div>
                      </div>
                    </td>

                    {/* Actividad */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        <div className="font-medium">{reservation.events.length} eventos</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Creada: {formatDateTime(reservation.createdAt)}
                        </div>
                      </div>
                    </td>

                    {/* Última Modificación */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white font-mono">
                      {formatDateTime(reservation.lastUpdate)}
                    </td>

                    {/* Acciones */}
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedEntry(reservation);
                          setDetailsModalOpen(true);
                        }}
                      >
                        <FiEye className="mr-1" />
                        Ver Timeline
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Modal de Timeline */}
      {detailsModalOpen && selectedEntry && (
        <div className="modal-backdrop fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 transition-opacity duration-300">
          <div
            className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[80vh] overflow-y-auto transform transition-all duration-300 scale-100 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-navy dark:text-gold">
                    Timeline de Reserva #{selectedEntry.id}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {selectedEntry.court} - {selectedEntry.sport} | {selectedEntry.date}{' '}
                    {selectedEntry.time}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    Presiona Esc o haz click fuera para cerrar
                  </p>
                </div>
                <button
                  onClick={() => {
                    setDetailsModalOpen(false);
                    setSelectedEntry(null);
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
                      <span className="text-lg">{getStatusIcon(selectedEntry.status)}</span>
                      <span
                        className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(selectedEntry.status)}`}
                      >
                        {getStatusText(selectedEntry.status)}
                      </span>
                    </div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Cliente
                    </h4>
                    <p className="text-sm text-gray-900 dark:text-white mt-1">
                      {selectedEntry.customerName}
                    </p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Total Eventos
                    </h4>
                    <p className="text-sm text-gray-900 dark:text-white mt-1">
                      {selectedEntry.events?.length || 0} eventos
                    </p>
                  </div>
                </div>

                {/* Timeline */}
                <div>
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    Timeline de Actividad
                  </h4>
                  {selectedEntry.events && renderTimeline(selectedEntry.events)}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
