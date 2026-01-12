import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, MapPin, Eye, X, Calendar } from 'lucide-react';
import { getSportEmoji } from '../../utils/reservationTypes';
import { formatTime, formatCountdown, formatShortDate } from '../../utils/dateFormatters';

/**
 * Next Reservation Component
 * Highlights the upcoming reservation with countdown
 */
export default function NextReservation({ reservation, onCancel, onDetailClick }) {
  const [countdown, setCountdown] = useState('');

  useEffect(() => {
    if (!reservation) return;

    const updateCountdown = () => {
      const date = reservation.date || reservation.startAt?.split('T')[0];
      const time = reservation.time || reservation.startAt?.split('T')[1]?.substring(0, 5);
      setCountdown(formatCountdown(date, time));
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [reservation]);

  if (!reservation) return null;

  const sportEmoji = getSportEmoji(reservation.sport);
  const date = reservation.date || reservation.startAt?.split('T')[0];
  const time = formatTime(reservation.time || reservation.startAt);
  const formattedDate = formatShortDate(date);

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

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-gradient-to-br from-navy to-navy/90 dark:from-gold dark:to-gold/90 rounded-xl shadow-lg overflow-hidden cursor-pointer"
      onClick={handleDetail}
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-white/80 dark:text-navy/80 text-sm font-medium mb-1">
              Próxima Reserva
            </p>
            <h3 className="text-2xl font-bold text-white dark:text-navy flex items-center gap-2">
              <span>{sportEmoji}</span>
              <span>{reservation.sport || 'Pádel'}</span>
            </h3>
          </div>

          {/* Countdown Badge */}
          <div className="bg-white/20 dark:bg-navy/20 backdrop-blur-sm rounded-lg px-3 py-2">
            <div className="flex items-center gap-2 text-white dark:text-navy">
              <Clock className="w-4 h-4" aria-hidden="true" />
              <span className="font-semibold">{countdown}</span>
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="space-y-3 mb-4">
          <div className="flex items-center gap-3 text-white/90 dark:text-navy/90">
            <Calendar className="w-5 h-5" aria-hidden="true" />
            <span className="font-medium">{formattedDate} • {time}</span>
          </div>

          <div className="flex items-center gap-3 text-white/90 dark:text-navy/90">
            <MapPin className="w-5 h-5" aria-hidden="true" />
            <span className="font-medium">
              {reservation.courtName || `Cancha ${reservation.courtId}`}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleDetail}
            className="flex-1 bg-white dark:bg-navy text-navy dark:text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2 hover:bg-white/90 dark:hover:bg-navy/90 transition-colors"
          >
            <Eye className="w-4 h-4" />
            <span>Ver Detalle</span>
          </motion.button>

          {onCancel && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleCancel}
              className="bg-white/20 dark:bg-navy/20 backdrop-blur-sm text-white dark:text-navy font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2 hover:bg-white/30 dark:hover:bg-navy/30 transition-colors"
            >
              <X className="w-4 h-4" />
              <span>Cancelar</span>
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
