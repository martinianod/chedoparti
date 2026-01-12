import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FiUsers, FiPlus, FiEdit2, FiTrash2, FiFilter, FiSearch } from 'react-icons/fi';
import { usersApi } from '../../services/api';
import useAuth from '../../hooks/useAuth';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import AddButton from '../../components/ui/AddButton';
import EditButton from '../../components/ui/EditButton';
import DeleteButton from '../../components/ui/DeleteButton';
import UserFormModal from '../../components/ui/UserFormModal';
import { useAppNotifications } from '../../hooks/useAppNotifications';

export default function UsersList() {
  const { t } = useTranslation();
  const { user: currentUser } = useAuth();
  const { showSuccess, showError } = useAppNotifications();
  
  // Helper for compatibility if needed, or just use showSuccess/showError directly
  const showNotification = (msg, type) => {
    if (type === 'error') showError(msg);
    else if (type === 'success') showSuccess(msg);
    else if (type === 'warning') showWarning(msg);
    else showInfo(msg);
  };

  // Estados principales
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estados del modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  // Estados de filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Verificar permisos
  const hasAdminRole =
    currentUser?.role === 'INSTITUTION_ADMIN' || (currentUser?.roles && currentUser.roles.includes('INSTITUTION_ADMIN'));
  if (!hasAdminRole) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            {t('users.access_denied', 'Acceso Denegado')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {t('users.admin_required', 'Solo los administradores pueden gestionar usuarios')}
          </p>
        </Card>
      </div>
    );
  }

  // Cargar usuarios
  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await usersApi.list();

      setUsers(response.data || []);
    } catch (error) {
      console.error('❌ UsersList - Error loading users:', error);
      setError(error.message || 'Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  // Filtrar usuarios
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.membershipNumber &&
        user.membershipNumber.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesRole =
      roleFilter === 'all' ||
      (user.roles && user.roles.includes(roleFilter)) ||
      user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  // Manejar creación de usuario
  const handleCreate = () => {
    setEditingUser(null);
    setIsModalOpen(true);
  };

  // Manejar edición de usuario
  const handleEdit = (user) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  // Manejar eliminación de usuario
  const handleDelete = async (userId) => {
    if (!confirm(t('users.confirm_delete', '¿Estás seguro de que deseas eliminar este usuario?'))) {
      return;
    }

    try {
      await usersApi.remove(userId);

      // Actualizar lista
      await loadUsers();
      showNotification(t('users.delete_success', 'Usuario eliminado correctamente'), 'success');
    } catch (error) {
      console.error('❌ UsersList - Error deleting user:', error);
      // Check if it's a specific business logic error (like deleting a socio)
      const errorMessage = error.message || t('users.delete_error', 'Error al eliminar el usuario');
      
      // Use the correct notification method from useAppNotifications
      // The hook returns showSuccess, showError, etc., not showNotification directly
      // But we can use showError which is aliased as 'error' in the hook or directly destructured
      showNotification(errorMessage, 'error');
    }
  };

  // Manejar submit del modal
  const handleModalSubmit = async (userData) => {
    try {
      if (editingUser) {
        await usersApi.update(editingUser.id, userData);
      } else {
        await usersApi.create(userData);
      }

      setIsModalOpen(false);
      setEditingUser(null);
      await loadUsers();
    } catch (error) {
      console.error('❌ UsersList - Error in user operation:', error);
      throw error; // Re-lanzar para que el modal lo maneje
    }
  };

  // Obtener rol en español
  const getRoleDisplay = (role) => {
    const roleMap = {
      INSTITUTION_ADMIN: t('roles.ADMIN', 'Administrador'),
      SOCIO: t('roles.SOCIO', 'Socio'),
      COACH: t('roles.COACH', 'Entrenador'),
    };
    return roleMap[role] || role;
  };

  // Obtener color del badge de rol
  const getRoleBadgeColor = (role) => {
    const colorMap = {
      INSTITUTION_ADMIN: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300',
      SOCIO: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
      COACH: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
    };
    return colorMap[role] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
  };

  const renderUserRoles = (user) => {
    // Soporte para usuarios con múltiples roles (nuevo formato)
    if (user.roles && Array.isArray(user.roles)) {
      return (
        <div className="flex flex-wrap gap-1">
          {user.roles.map((role, index) => (
            <span
              key={index}
              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(role)} ${
                user.primaryRole === role ? 'ring-2 ring-offset-1 ring-current' : ''
              }`}
              title={user.primaryRole === role ? t('users.primary_role', 'Rol Primario') : ''}
            >
              {getRoleDisplay(role)}
            </span>
          ))}
        </div>
      );
    }

    // Fallback para usuarios con rol único (formato anterior)
    return (
      <span
        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(user.role)}`}
      >
        {getRoleDisplay(user.role)}
      </span>
    );
  };

  // Renderizar estado del usuario
  const renderUserStatus = (user) => {
    const getStatusInfo = (status, membershipStatus, penaltyInfo) => {
      // Verificar si está penalizado
      if (penaltyInfo && penaltyInfo.penaltyUntil) {
        const penaltyEnd = new Date(penaltyInfo.penaltyUntil);
        const now = new Date();
        if (now <= penaltyEnd) {
          return {
            text: 'Penalizado',
            color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300',
            icon: '🚫',
          };
        }
      }

      // Estados específicos de membresía para socios
      if (user.roles?.includes('SOCIO') || user.role === 'SOCIO') {
        switch (membershipStatus) {
          case 'suspended':
            return {
              text: 'Suspendido',
              color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300',
              icon: '⏸️',
            };
          case 'penalized':
            return {
              text: 'Penalizado',
              color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300',
              icon: '🚫',
            };
          case 'expired':
            return {
              text: 'Vencido',
              color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300',
              icon: '⏰',
            };
        }
      }

      // Estados generales
      switch (status) {
        case 'active':
          return {
            text: 'Activo',
            color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
            icon: '✅',
          };
        case 'suspended':
          return {
            text: 'Suspendido',
            color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300',
            icon: '⏸️',
          };
        case 'inactive':
          return {
            text: 'Inactivo',
            color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300',
            icon: '⭕',
          };
        default:
          return {
            text: 'Desconocido',
            color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300',
            icon: '❓',
          };
      }
    };

    const statusInfo = getStatusInfo(user.status, user.membershipStatus, user.penaltyInfo);

    return (
      <div className="flex items-center space-x-2">
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}
        >
          <span className="mr-1">{statusInfo.icon}</span>
          {statusInfo.text}
        </span>
        {user.penaltyInfo && user.penaltyInfo.penaltyUntil && (
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Hasta: {new Date(user.penaltyInfo.penaltyUntil).toLocaleDateString('es-ES')}
          </div>
        )}
      </div>
    );
  };

  // Formatear fecha
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Cargar datos al montar
  useEffect(() => {
    loadUsers();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">
            {t('users.loading', 'Cargando usuarios...')}
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">{t('common.error', 'Error')}</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <Button onClick={loadUsers} variant="outline">
            {t('common.retry', 'Reintentar')}
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FiUsers className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {t('users.title', 'Gestión de Usuarios')}
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  {t('users.subtitle', 'Administra los usuarios del sistema')}
                </p>
              </div>
            </div>
            <AddButton onClick={handleCreate} label={t('users.add_user', 'Agregar Usuario')} />
          </div>
        </div>

        {/* Filtros */}
        <Card className="p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Búsqueda */}
            <div className="flex-1">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder={t(
                    'users.search_placeholder',
                    'Buscar por nombre, email o número de socio...'
                  )}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            {/* Filtro por rol */}
            <div className="lg:w-48">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              >
                <option value="all">{t('users.all_roles', 'Todos los roles')}</option>
                <option value="INSTITUTION_ADMIN">{t('roles.ADMIN', 'Administrador')}</option>
                <option value="SOCIO">{t('roles.SOCIO', 'Socio')}</option>
                <option value="COACH">{t('roles.COACH', 'Entrenador')}</option>
              </select>
            </div>

            {/* Filtro por estado */}
            <div className="lg:w-48">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              >
                <option value="all">{t('users.all_statuses', 'Todos los estados')}</option>
                <option value="active">{t('users.active', 'Activo')}</option>
                <option value="inactive">{t('users.inactive', 'Inactivo')}</option>
              </select>
            </div>
          </div>

          {/* Estadísticas */}
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
              <span>
                <strong>{filteredUsers.length}</strong>{' '}
                {t('users.total_filtered', 'usuarios encontrados')}
              </span>
              <span>
                <strong>{users.filter((u) => u.role === 'INSTITUTION_ADMIN').length}</strong>{' '}
                {t('roles.ADMIN', 'Administradores').toLowerCase()}
              </span>
              <span>
                <strong>{users.filter((u) => u.role === 'SOCIO').length}</strong>{' '}
                {t('roles.SOCIO', 'Socios').toLowerCase()}
              </span>
              <span>
                <strong>{users.filter((u) => u.role === 'COACH').length}</strong>{' '}
                {t('roles.COACH', 'Entrenadores').toLowerCase()}
              </span>
            </div>
          </div>
        </Card>

        {/* Tabla de usuarios */}
        <Card className="overflow-hidden">
          {filteredUsers.length === 0 ? (
            <div className="p-8 text-center">
              <FiUsers className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                {t('users.no_users', 'No se encontraron usuarios')}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {searchTerm || roleFilter !== 'all' || statusFilter !== 'all'
                  ? t('users.no_matches', 'Intenta ajustar los filtros de búsqueda')
                  : t('users.empty_state', 'Comienza agregando el primer usuario al sistema')}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {t('users.table.user', 'Usuario')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {t('users.table.role', 'Rol')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {t('users.table.membership', 'N° Socio')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {t('users.table.reservations', 'Reservas')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {t('users.table.status', 'Estado')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {t('users.table.created', 'Creado')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {t('users.table.actions', 'Acciones')}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredUsers.map((user) => (
                    <tr
                      key={user.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      {/* Usuario */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            {user.avatar ? (
                              <img
                                className="h-10 w-10 rounded-full"
                                src={user.avatar}
                                alt={user.name}
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                  {user.name
                                    ?.split(' ')
                                    .map((n) => n[0])
                                    .join('')
                                    .substring(0, 2)
                                    .toUpperCase()}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {user.name}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Rol */}
                      <td className="px-6 py-4">{renderUserRoles(user)}</td>

                      {/* Número de socio */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {user.membershipNumber || '-'}
                      </td>

                      {/* Reservas */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        <span className="font-medium">{user.totalReservations || 0}</span>
                      </td>

                      {/* Estado */}
                      <td className="px-6 py-4 whitespace-nowrap">{renderUserStatus(user)}</td>

                      {/* Fecha de creación */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(user.createdAt)}
                      </td>

                      {/* Acciones */}
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex space-x-2">
                          <EditButton
                            onClick={() => handleEdit(user)}
                            tooltip={t('users.edit', 'Editar usuario')}
                          />
                          <DeleteButton
                            onClick={() => handleDelete(user.id)}
                            tooltip={t('users.delete', 'Eliminar usuario')}
                            disabled={user.email === 'admin@chedoparti.com'}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Modal de usuario */}
        <UserFormModal
          open={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingUser(null);
          }}
          onSubmit={handleModalSubmit}
          user={editingUser}
        />
      </div>
    </div>
  );
}
