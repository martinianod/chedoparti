/**
 * Sistema de notificaciones para el club
 * Proporciona feedback elegante al usuario sin usar alert()
 */

import { useState, useEffect, createContext, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCheck, FiX, FiAlertCircle, FiInfo, FiTrash2 } from 'react-icons/fi';

// Context para manejar las notificaciones globalmente
const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

// Tipos de notificaciones disponibles
export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
};

// Provider del sistema de notificaciones
export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);

  const addNotification = (message, type = NOTIFICATION_TYPES.INFO, duration = 5000) => {
    const id = Date.now() + Math.random();
    const notification = { id, message, type, duration };

    setNotifications((prev) => [...prev, notification]);

    // Auto-remover después del tiempo especificado
    if (duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, duration);
    }

    return id;
  };

  const removeNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  // Funciones de conveniencia
  const showSuccess = (message, duration) =>
    addNotification(message, NOTIFICATION_TYPES.SUCCESS, duration);
  const showError = (message, duration) =>
    addNotification(message, NOTIFICATION_TYPES.ERROR, duration);
  const showWarning = (message, duration) =>
    addNotification(message, NOTIFICATION_TYPES.WARNING, duration);
  const showInfo = (message, duration) =>
    addNotification(message, NOTIFICATION_TYPES.INFO, duration);

  const value = {
    notifications,
    addNotification,
    removeNotification,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <NotificationContainer />
    </NotificationContext.Provider>
  );
}

// Contenedor que muestra las notificaciones
function NotificationContainer() {
  const { notifications, removeNotification } = useNotifications();

  return (
    <div className="fixed top-4 right-4 z-[9999] space-y-2 max-w-sm">
      <AnimatePresence>
        {notifications.map((notification) => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            onRemove={() => removeNotification(notification.id)}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

// Componente individual de notificación
function NotificationItem({ notification, onRemove }) {
  const { message, type } = notification;

  // Configuración de estilos por tipo
  const typeConfig = {
    [NOTIFICATION_TYPES.SUCCESS]: {
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      borderColor: 'border-green-200 dark:border-green-800',
      textColor: 'text-green-800 dark:text-green-200',
      iconColor: 'text-green-600 dark:text-green-400',
      icon: FiCheck,
    },
    [NOTIFICATION_TYPES.ERROR]: {
      bgColor: 'bg-red-50 dark:bg-red-900/20',
      borderColor: 'border-red-200 dark:border-red-800',
      textColor: 'text-red-800 dark:text-red-200',
      iconColor: 'text-red-600 dark:text-red-400',
      icon: FiX,
    },
    [NOTIFICATION_TYPES.WARNING]: {
      bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
      borderColor: 'border-yellow-200 dark:border-yellow-800',
      textColor: 'text-yellow-800 dark:text-yellow-200',
      iconColor: 'text-yellow-600 dark:text-yellow-400',
      icon: FiAlertCircle,
    },
    [NOTIFICATION_TYPES.INFO]: {
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      borderColor: 'border-blue-200 dark:border-blue-800',
      textColor: 'text-blue-800 dark:text-blue-200',
      iconColor: 'text-blue-600 dark:text-blue-400',
      icon: FiInfo,
    },
  };

  const config = typeConfig[type] || typeConfig[NOTIFICATION_TYPES.INFO];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: 100, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.95 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className={`
        relative rounded-lg border p-4 shadow-lg backdrop-blur-sm
        ${config.bgColor} ${config.borderColor}
      `}
    >
      <div className="flex items-start gap-3">
        <Icon className={`h-5 w-5 flex-shrink-0 mt-0.5 ${config.iconColor}`} />
        <div className="flex-1">
          <p className={`text-sm font-medium ${config.textColor}`}>{message}</p>
        </div>
        <button
          onClick={onRemove}
          className={`
            flex-shrink-0 rounded-full p-1 hover:bg-black/10 dark:hover:bg-white/10 
            transition-colors ${config.iconColor}
          `}
        >
          <FiX className="h-4 w-4" />
        </button>
      </div>
    </motion.div>
  );
}

// Hook para notificaciones específicas del contexto de horarios
export function useScheduleNotifications() {
  const { showSuccess, showError, showWarning, showInfo } = useNotifications();

  return {
    notifyScheduleSaved: () =>
      showSuccess('✅ Configuración de horarios guardada exitosamente', 4000),
    notifyScheduleError: (error) => showError(`❌ Error al guardar horarios: ${error}`, 6000),
    notifyGroupAutoDeleted: () =>
      showWarning('📅 Grupo eliminado automáticamente por no tener días asignados', 4000),
    notifyNoDaysAvailable: () =>
      showWarning('⚠️ No hay días disponibles. Libera algunos días de otros grupos primero.', 5000),
    notifyHolidayAdded: () => showInfo('📅 Feriado agregado correctamente', 3000),
    notifyValidationError: (message) => showError(`⚠️ ${message}`, 5000),
  };
}
