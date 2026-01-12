import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, MapPin, User } from 'lucide-react';
import { formatArgentinaDateDisplay } from '../../utils/dateUtils';
import Card from '../ui/Card';

/**
 * AgendaView - Vista de lista cronológica estilo Google Calendar
 * Muestra reservas en orden temporal
 */
export default function AgendaView({
  reservations = [],
  courts = [],
  onReservationClick,
  groupByDate = true,
}) {
  // Agrupar reservas por fecha si está habilitado
  const groupedReservations = useMemo(() => {
    if (!groupByDate) {
      return { all: reservations };
    }

    const grouped = {};
    reservations.forEach((reservation) => {
      const date = reservation.date;
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(reservation);
    });

    // Ordenar por fecha
    return Object.keys(grouped)
      .sort()
      .reduce((acc, date) => {
        acc[date] = grouped[date].sort((a, b) => a.time.localeCompare(b.time));
        return acc;
      }, {});
  }, [reservations, groupByDate]);

  // Obtener nombre de cancha
  const getCourtName = (courtId) => {
    const court = courts.find(c => c.id === courtId);
    return court?.name || `Cancha ${courtId}`;
  };

  // Obtener color según tipo
  const getTypeColor = (type) => {
    switch (type) {
      case 'Clase':
      case 'CLASS':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'Mantenimiento':
      case 'MAINTENANCE':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'Torneo':
      case 'TOURNAMENT':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    }
  };

  if (reservations.length === 0) {
    return (
      <Card className="p-12 text-center">
        <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-400" />
        <p className="text-gray-500 dark:text-gray-400">No hay reservas para mostrar</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {Object.entries(groupedReservations).map(([date, dateReservations]) => (
        <div key={date}>
          {/* Header de fecha */}
          {groupByDate && (
            <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 py-2 mb-4">
              <h3 className="text-lg font-bold text-navy dark:text-gold capitalize">
                {formatArgentinaDateDisplay(date)}
              </h3>
              <div className="text-sm text-gray-500">
                {dateReservations.length} {dateReservations.length === 1 ? 'reserva' : 'reservas'}
              </div>
            </div>
          )}

          {/* Lista de reservas */}
          <div className="space-y-3">
            {dateReservations.map((reservation, index) => (
              <motion.div
                key={reservation.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card
                  className="p-4 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => onReservationClick && onReservationClick(reservation)}
                >
                  <div className="flex items-start gap-4">
                    {/* Hora */}
                    <div className="flex-shrink-0 w-20 text-center">
                      <div className="font-bold text-lg text-navy dark:text-gold">
                        {reservation.time}
                      </div>
                      <div className="text-xs text-gray-500">
                        {reservation.duration || '01:00'}
                      </div>
                    </div>

                    {/* Línea vertical */}
                    <div className="flex-shrink-0 w-1 bg-gray-200 dark:bg-gray-700 rounded-full" />

                    {/* Contenido */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <User className="w-4 h-4 text-gray-500" />
                            <span className="font-semibold text-navy dark:text-gold">
                              {reservation.userName || reservation.user || 'Reservado'}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <MapPin className="w-4 h-4" />
                            <span>{getCourtName(reservation.courtId)}</span>
                          </div>
                        </div>

                        {/* Tipo de reserva */}
                        {reservation.type && (
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getTypeColor(reservation.type)}`}>
                            {reservation.type}
                          </span>
                        )}
                      </div>

                      {/* Notas */}
                      {reservation.notes && (
                        <div className="mt-2 text-sm text-gray-600 dark:text-gray-400 italic">
                          {reservation.notes}
                        </div>
                      )}

                      {/* Estado */}
                      {reservation.status && reservation.status !== 'confirmed' && (
                        <div className="mt-2">
                          <span className={`text-xs px-2 py-1 rounded ${
                            reservation.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            reservation.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {reservation.status}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
