import { io } from 'socket.io-client';
import { useEffect, useRef, useCallback, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useReservationActions, RESERVATION_STATES } from '../store/reservationStore';
import { invalidateReservations, reservationKeys } from '../store/queryClient';

// 🌐 Cliente WebSocket para actualizaciones en tiempo real
class ReservationWebSocketClient {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.listeners = new Map();
  }

  // Conectar al servidor WebSocket
  connect(url, options = {}) {
    if (this.socket?.connected) {
      return this.socket;
    }

    const defaultOptions = {
      transports: ['websocket', 'polling'],
      timeout: 20000,
      forceNew: false,
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: 1000,
      ...options,
    };

    this.socket = io(url, defaultOptions);
    this.setupEventHandlers();

    return this.socket;
  }

  // Configurar manejadores de eventos del socket
  setupEventHandlers() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      this.isConnected = true;
      this.reconnectAttempts = 0;

      // Notificar a listeners
      this.emit('connection', { status: 'connected' });
    });

    this.socket.on('disconnect', (reason) => {
      this.isConnected = false;

      this.emit('connection', { status: 'disconnected', reason });
    });

    this.socket.on('connect_error', (error) => {
      console.error('🔌 WebSocket connection error:', error);
      this.reconnectAttempts++;

      this.emit('connection', {
        status: 'error',
        error: error.message,
        attempts: this.reconnectAttempts,
      });
    });

    // 📡 Eventos específicos de reservas
    this.socket.on('reservation:created', (data) => {
      this.emit('reservationCreated', data);
    });

    this.socket.on('reservation:updated', (data) => {
      this.emit('reservationUpdated', data);
    });

    this.socket.on('reservation:cancelled', (data) => {
      this.emit('reservationCancelled', data);
    });

    this.socket.on('reservation:confirmed', (data) => {
      this.emit('reservationConfirmed', data);
    });

    this.socket.on('reservation:status_changed', (data) => {
      this.emit('reservationStatusChanged', data);
    });

    // 🏟️ Eventos de disponibilidad de canchas
    this.socket.on('court:availability_changed', (data) => {
      this.emit('courtAvailabilityChanged', data);
    });

    // 💰 Eventos de precios
    this.socket.on('pricing:updated', (data) => {
      this.emit('pricingUpdated', data);
    });
  }

  // Unirse a salas específicas
  joinRoom(roomName) {
    if (this.socket?.connected) {
      this.socket.emit('join', roomName);
    }
  }

  leaveRoom(roomName) {
    if (this.socket?.connected) {
      this.socket.emit('leave', roomName);
    }
  }

  // Sistema de eventos interno
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);
  }

  off(event, callback) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).delete(callback);
    }
  }

  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach((callback) => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in WebSocket event handler for ${event}:`, error);
        }
      });
    }
  }

  // Desconectar
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
    this.listeners.clear();
  }

  // Verificar estado de conexión
  get connected() {
    return this.socket?.connected || false;
  }

  // Obtener ID del socket
  get socketId() {
    return this.socket?.id || null;
  }
}

// Instancia global del cliente
const wsClient = new ReservationWebSocketClient();

// 🎯 Hook principal para WebSocket de reservas
export const useReservationWebSocket = (options = {}) => {
  const queryClient = useQueryClient();
  const actions = useReservationActions();
  const connectionRef = useRef(false);

  const {
    autoConnect = true,
    institutionId,
    userId,
    courtIds = [],
    onReservationUpdate,
    onConnectionChange,
    enableRooms = true,
  } = options;

  // Configurar URL del WebSocket
  const wsUrl =
    import.meta.env.VITE_WS_URL ||
    (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8989').replace('http', 'ws');

  // Manejador de actualizaciones de reservas
  const handleReservationUpdate = useCallback(
    (data) => {
      const { reservation, action, oldReservation } = data;

      switch (action) {
        case 'created':
          actions.addReservation(reservation);

          // Invalidar queries relacionadas
          invalidateReservations.byDate(reservation.date);
          invalidateReservations.byCourt(reservation.courtId);
          invalidateReservations.lists();
          break;

        case 'updated':
          actions.updateReservation(reservation.id, reservation);

          // Invalidar queries específicas
          queryClient.setQueryData(reservationKeys.detail(reservation.id), reservation);

          invalidateReservations.byId(reservation.id);
          if (oldReservation?.date !== reservation.date) {
            invalidateReservations.byDate(oldReservation.date);
            invalidateReservations.byDate(reservation.date);
          }
          break;

        case 'cancelled':
          actions.changeReservationStatus(reservation.id, RESERVATION_STATES.CANCELLED, {
            cancelledAt: new Date().toISOString(),
          });

          invalidateReservations.byId(reservation.id);
          invalidateReservations.stats();
          break;

        case 'confirmed':
          actions.changeReservationStatus(reservation.id, RESERVATION_STATES.CONFIRMED, {
            confirmedAt: new Date().toISOString(),
          });
          break;

        case 'status_changed':
          actions.changeReservationStatus(reservation.id, reservation.status, reservation);
          break;
      }

      // Callback personalizado del usuario
      onReservationUpdate?.(data);
    },
    [actions, queryClient, onReservationUpdate]
  );

  // Manejador de cambios de disponibilidad de canchas
  const handleCourtAvailabilityChange = useCallback((data) => {
    const { courtId, date, availability } = data;

    // Invalidar queries de disponibilidad
    invalidateReservations.byDate(date);
    invalidateReservations.byCourt(courtId);

    // Actualizar disponibilidad en el store si es necesario
    // (esto podría requerir un store separado para disponibilidad)
  }, []);

  // Manejador de cambios de conexión
  const handleConnectionChange = useCallback(
    (data) => {
      onConnectionChange?.(data);
    },
    [onConnectionChange]
  );

  // Efecto para conectar/desconectar WebSocket
  useEffect(() => {
    if (!autoConnect || connectionRef.current) return;

    // Conectar WebSocket
    wsClient.connect(wsUrl, {
      query: {
        institutionId,
        userId,
        type: 'reservations',
      },
    });

    // Registrar listeners
    wsClient.on('reservationCreated', (data) =>
      handleReservationUpdate({ ...data, action: 'created' })
    );

    wsClient.on('reservationUpdated', (data) =>
      handleReservationUpdate({ ...data, action: 'updated' })
    );

    wsClient.on('reservationCancelled', (data) =>
      handleReservationUpdate({ ...data, action: 'cancelled' })
    );

    wsClient.on('reservationConfirmed', (data) =>
      handleReservationUpdate({ ...data, action: 'confirmed' })
    );

    wsClient.on('reservationStatusChanged', (data) =>
      handleReservationUpdate({ ...data, action: 'status_changed' })
    );

    wsClient.on('courtAvailabilityChanged', handleCourtAvailabilityChange);
    wsClient.on('connection', handleConnectionChange);

    connectionRef.current = true;

    // Cleanup
    return () => {
      wsClient.off('reservationCreated');
      wsClient.off('reservationUpdated');
      wsClient.off('reservationCancelled');
      wsClient.off('reservationConfirmed');
      wsClient.off('reservationStatusChanged');
      wsClient.off('courtAvailabilityChanged');
      wsClient.off('connection');

      connectionRef.current = false;
    };
  }, [
    autoConnect,
    wsUrl,
    institutionId,
    userId,
    handleReservationUpdate,
    handleCourtAvailabilityChange,
    handleConnectionChange,
  ]);

  // Efecto para unirse a salas específicas
  useEffect(() => {
    if (!enableRooms || !wsClient.connected) return;

    const rooms = [];

    // Sala general de la institución
    if (institutionId) {
      const institutionRoom = `institution:${institutionId}`;
      wsClient.joinRoom(institutionRoom);
      rooms.push(institutionRoom);
    }

    // Salas específicas por cancha
    courtIds.forEach((courtId) => {
      const courtRoom = `court:${courtId}`;
      wsClient.joinRoom(courtRoom);
      rooms.push(courtRoom);
    });

    // Sala personal del usuario
    if (userId) {
      const userRoom = `user:${userId}`;
      wsClient.joinRoom(userRoom);
      rooms.push(userRoom);
    }

    return () => {
      rooms.forEach((room) => wsClient.leaveRoom(room));
    };
  }, [enableRooms, institutionId, courtIds, userId, wsClient.connected]);

  return {
    isConnected: wsClient.connected,
    socketId: wsClient.socketId,

    // Métodos de control
    connect: () => wsClient.connect(wsUrl),
    disconnect: () => wsClient.disconnect(),

    // Métodos de salas
    joinRoom: (room) => wsClient.joinRoom(room),
    leaveRoom: (room) => wsClient.leaveRoom(room),

    // Estado del cliente
    client: wsClient,
  };
};

// 🔔 Hook simplificado para notificaciones en tiempo real
export const useRealtimeNotifications = (userId) => {
  const [notifications, setNotifications] = useState([]);

  const { isConnected } = useReservationWebSocket({
    userId,
    onReservationUpdate: (data) => {
      const { reservation, action } = data;

      // Solo notificar si afecta al usuario actual
      if (reservation.userId === userId || reservation.createdBy === userId) {
        const notification = {
          id: `${reservation.id}_${action}_${Date.now()}`,
          type: 'reservation',
          action,
          reservation,
          timestamp: new Date().toISOString(),
          read: false,
        };

        setNotifications((prev) => [notification, ...prev].slice(0, 50)); // Máximo 50 notificaciones
      }
    },
    onConnectionChange: (data) => {
      if (data.status === 'connected') {
        // Limpiar notificaciones al reconectar (podrían estar desactualizadas)
        setNotifications([]);
      }
    },
  });

  const markAsRead = useCallback((notificationId) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
    );
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  return {
    notifications,
    unreadCount: notifications.filter((n) => !n.read).length,
    isConnected,
    markAsRead,
    clearAll,
  };
};

// 📡 Hook para sincronización de estado en tiempo real
export const useRealtimeSync = (options = {}) => {
  const { autoSync = true, syncInterval = 30000 } = options; // 30 segundos por defecto

  const { isConnected, client } = useReservationWebSocket({
    autoConnect: autoSync,
    ...options,
  });

  const lastSyncRef = useRef(null);

  // Sincronización automática cuando se reconecta
  useEffect(() => {
    if (isConnected && autoSync) {
      const now = Date.now();

      // Si no hemos sincronizado en el último intervalo, forzar sync
      if (!lastSyncRef.current || now - lastSyncRef.current > syncInterval) {
        invalidateReservations.all();
        lastSyncRef.current = now;
      }
    }
  }, [isConnected, autoSync, syncInterval]);

  return {
    isConnected,
    lastSync: lastSyncRef.current,
    client,
  };
};

export { wsClient };
export default {
  useReservationWebSocket,
  useRealtimeNotifications,
  useRealtimeSync,
  wsClient,
};
