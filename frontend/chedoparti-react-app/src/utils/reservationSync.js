/**
 * Sistema de sincronización global para reservas
 * Permite que diferentes componentes se comuniquen cuando cambia el estado de las reservas
 */
import React from 'react';

class ReservationSyncManager extends EventTarget {
  constructor() {
    super();
    this.listeners = new Map();
  }

  /**
   * Notificar que se creó una reserva
   */
  notifyReservationCreated(reservation) {
    this.dispatchEvent(new CustomEvent('reservationCreated', { detail: reservation }));
  }

  /**
   * Notificar que se actualizó una reserva
   */
  notifyReservationUpdated(reservationId, updatedData) {
    this.dispatchEvent(
      new CustomEvent('reservationUpdated', { detail: { id: reservationId, data: updatedData } })
    );
  }

  /**
   * Notificar que se canceló una reserva
   */
  notifyReservationCancelled(reservationId) {
    this.dispatchEvent(new CustomEvent('reservationCancelled', { detail: { id: reservationId } }));
  }

  /**
   * Notificar que se eliminó una reserva
   */
  notifyReservationDeleted(reservationId) {
    this.dispatchEvent(new CustomEvent('reservationDeleted', { detail: { id: reservationId } }));
  }

  /**
   * Registrar un listener para todos los eventos de reservas
   */
  subscribeToReservationChanges(callback) {
    const events = [
      'reservationCreated',
      'reservationUpdated',
      'reservationCancelled',
      'reservationDeleted',
    ];

    events.forEach((eventType) => {
      this.addEventListener(eventType, callback);
    });

    // Retornar función de cleanup
    return () => {
      events.forEach((eventType) => {
        this.removeEventListener(eventType, callback);
      });
    };
  }
}

// Instancia global singleton
export const reservationSync = new ReservationSyncManager();

// Hook de React para usar el sistema de sincronización
export const useReservationSync = (onReservationChange) => {
  React.useEffect(() => {
    if (!onReservationChange) return;

    const unsubscribe = reservationSync.subscribeToReservationChanges((event) => {
      onReservationChange(event);
    });

    return () => {
      unsubscribe();
    };
  }, [onReservationChange]);
};

export default reservationSync;
