import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, MapPin, X, Eye, Trophy, Repeat } from 'lucide-react';
import { getTypeColor, getTypeIcon, getSportEmoji } from '../../utils/reservationTypes';
import { formatTime, formatDuration, formatShortDate } from '../../utils/dateFormatters';

/**
 * Enhanced Reservation Card Component (Playtomic-style)
 * Displays reservation with visual hierarchy and actions
 */
export default function ReservationCard({ reservation, onCancel, onDetailClick }) {
  const typeColors = getTypeColor(reservation.type || 'Normal');
  const TypeIcon = getTypeIcon(reservation.type || 'Normal');
  const sportEmoji = getSportEmoji(reservation.sport);

  const handleCancel = (e) => {
    e.stopPropagation();
    if (onCancel && window.confirm('¿Estás seguro de cancelar esta reserva?')) {
      onCancel(reservation);
    }
  };

  const handleDetail = () => {
    if (onDetailClick) {
      onDetailClick(reservation);
    }
  };

  // Format date and time
  const date = reservation.date || reservation.startAt?.split('T')[0];
  const time = formatTime(reservation.time || reservation.startAt);
  const duration = formatDuration(reservation.duration || '01:00');
  const formattedDate = formatShortDate(date);

  // Status badges
  const statusBadges = [];
  if (reservation.status === 'confirmed') {
    statusBadges.push({ label: 'Confirmado', color: 'green' });
  }
  if (reservation.isPaid) {
    statusBadges.push({ label: 'Pagado', color: 'blue' });
  }
  if (reservation.type === 'Fijo') {
    statusBadges.push({ label: 'Turno Fijo', color: 'purple' });
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border-l-4 ${typeColors.border} border-r border-t border-b border-gray-200 dark:border-gray-700 overflow-hidden cursor-pointer`}
      onClick={handleDetail}
    >
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            {/* Type Icon */}
            <div className={`p-2 rounded-lg ${typeColors.bg}`}>
              <TypeIcon className={`w-5 h-5 ${typeColors.text}`} aria-hidden="true" />
            </div>
            
            {/* Title */}
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <span>{sportEmoji}</span>
                <span>{reservation.sport || 'Pádel'}</span>
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {reservation.courtName || `Cancha ${reservation.courtId}`}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-1">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleDetail}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400"
              aria-label="Ver detalle"
              title="Ver detalle"
            >
              <Eye className="w-4 h-4" />
            </motion.button>
            
            {onCancel && (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleCancel}
                className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400"
                aria-label="Cancelar reserva"
                title="Cancelar"
              >
                <X className="w-4 h-4" />
              </motion.button>
            )}
          </div>
        </div>

        {/* Details */}
        <div className="space-y-2 mb-3">
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Calendar className="w-4 h-4" aria-hidden="true" />
            <span>{formattedDate}</span>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Clock className="w-4 h-4" aria-hidden="true" />
            <span>{time} • {duration}</span>
          </div>

          {reservation.location && (
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <MapPin className="w-4 h-4" aria-hidden="true" />
              <span>{reservation.location}</span>
            </div>
          )}
        </div>

        {/* Status Badges */}
        {statusBadges.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {statusBadges.map((badge, index) => (
              <span
                key={index}
                className={`px-2 py-1 text-xs font-medium rounded-full ${
                  badge.color === 'green'
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300'
                    : badge.color === 'blue'
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300'
                    : 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300'
                }`}
              >
                {badge.label}
              </span>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
