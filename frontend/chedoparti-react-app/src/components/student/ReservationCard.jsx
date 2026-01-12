import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, MapPin, DollarSign, CheckCircle, XCircle } from 'lucide-react';

/**
 * ReservationCard Component
 * Displays a regular court reservation (non-class)
 */
export default function ReservationCard({ reservation, onCancel, onDetailClick }) {
  const isPaid = reservation.isPaid || reservation.paymentStatus === 'paid';
  const isCancelled = reservation.status === 'cancelled';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className={`bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-2 border-green-300 dark:border-green-700 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 ${
        isCancelled ? 'opacity-60' : ''
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-green-700 dark:text-green-300" />
          <span className="font-bold text-sm uppercase tracking-wide text-green-700 dark:text-green-300">
            {isCancelled ? 'Reserva Cancelada' : 'Reserva Confirmada'}
          </span>
        </div>
        {isPaid && !isCancelled && (
          <div className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
            <CheckCircle className="w-3 h-3" />
            <span>Pagado</span>
          </div>
        )}
        {isCancelled && (
          <div className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
            <XCircle className="w-3 h-3" />
            <span>Cancelada</span>
          </div>
        )}
      </div>

      {/* Reservation Info */}
      <div className="space-y-3 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>{formatDate(reservation.date || reservation.startAt)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span>{formatTime(reservation)}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            <span>{reservation.courtName || reservation.court?.name} • {reservation.sport}</span>
          </div>
          {reservation.price && (
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              <span>${reservation.price.toLocaleString('es-AR')}</span>
            </div>
          )}
        </div>

        {/* Type Badge */}
        {reservation.type && reservation.type !== 'Normal' && (
          <div className="inline-block px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full text-xs font-semibold">
            {reservation.type}
          </div>
        )}

        {/* Notes */}
        {reservation.notes && (
          <div className="text-sm text-gray-600 dark:text-gray-400 italic bg-white/50 dark:bg-navy-dark/50 p-2 rounded">
            💬 {reservation.notes}
          </div>
        )}
      </div>

      {/* Actions */}
      {!isCancelled && (
        <div className="flex gap-3">
          <button
            onClick={() => onCancel?.(reservation)}
            className="btn btn-outline flex-1"
          >
            Cancelar
          </button>
          <button
            onClick={() => onDetailClick?.(reservation)}
            className="btn btn-ghost"
          >
            Ver detalle
          </button>
        </div>
      )}
      {isCancelled && (
        <button
          onClick={() => onDetailClick?.(reservation)}
          className="btn btn-ghost w-full"
        >
          Ver detalle
        </button>
      )}
    </motion.div>
  );
}

/**
 * Format date for display
 */
function formatDate(dateStr) {
  if (!dateStr) return 'Fecha no disponible';
  const date = new Date(dateStr);
  return date.toLocaleDateString('es-AR', { 
    weekday: 'short', 
    day: 'numeric', 
    month: 'short' 
  });
}

/**
 * Format time range for display
 */
function formatTime(reservation) {
  if (reservation.startTime && reservation.endTime) {
    return `${reservation.startTime} - ${reservation.endTime}`;
  }
  
  if (reservation.startAt && reservation.endAt) {
    const start = new Date(reservation.startAt);
    const end = new Date(reservation.endAt);
    return `${start.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })} - ${end.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}`;
  }
  
  return 'Horario no disponible';
}
