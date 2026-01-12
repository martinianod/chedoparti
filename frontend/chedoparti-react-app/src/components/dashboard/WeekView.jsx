import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { addDaysArgentina, getDayName, formatShortDate } from '../../utils/dateUtils';
import Card from '../ui/Card';

/**
 * WeekView - Vista de 7 días con grilla horizontal
 * Muestra una semana completa de reservas
 */
export default function WeekView({
  startDate,
  courts = [],
  reservations = [],
  onSlotClick,
  onDateChange,
}) {
  // Generar 7 días a partir de startDate
  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const date = addDaysArgentina(startDate, i);
      return {
        date,
        dayName: getDayName(date),
        shortDate: formatShortDate(date),
      };
    });
  }, [startDate]);

  // Agrupar reservas por fecha
  const reservationsByDate = useMemo(() => {
    const grouped = {};
    weekDays.forEach(day => {
      grouped[day.date] = reservations.filter(r => r.date === day.date);
    });
    return grouped;
  }, [weekDays, reservations]);

  return (
    <div className="w-full overflow-x-auto">
      <div className="min-w-max">
        {/* Header con días de la semana */}
        <div className="grid gap-2 mb-4" style={{ gridTemplateColumns: `repeat(7, minmax(200px, 1fr))` }}>
          {weekDays.map((day) => (
            <motion.div
              key={day.date}
              whileHover={{ scale: 1.02 }}
              className="cursor-pointer"
              onClick={() => onDateChange && onDateChange(day.date)}
            >
              <Card className="p-4 text-center">
                <div className="font-bold text-lg text-navy dark:text-gold capitalize">
                  {day.dayName}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {day.shortDate}
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  {reservationsByDate[day.date]?.length || 0} reservas
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Grid de reservas por cancha */}
        <div className="space-y-4">
          {courts.map((court) => (
            <Card key={court.id} className="p-4">
              <h3 className="font-bold mb-3 text-navy dark:text-gold">{court.name}</h3>
              <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(7, minmax(200px, 1fr))` }}>
                {weekDays.map((day) => {
                  const dayReservations = reservationsByDate[day.date]?.filter(r => r.courtId === court.id) || [];
                  
                  return (
                    <div key={`${court.id}-${day.date}`} className="space-y-2">
                      {dayReservations.length > 0 ? (
                        dayReservations.map((reservation) => (
                          <motion.div
                            key={reservation.id}
                            whileHover={{ scale: 1.02 }}
                            className="p-2 bg-blue-100 dark:bg-blue-900 border border-blue-300 dark:border-blue-700 rounded cursor-pointer"
                            onClick={() => onSlotClick && onSlotClick(court, reservation.time, reservation)}
                          >
                            <div className="text-xs font-semibold truncate">
                              {reservation.userName || reservation.user || 'Reservado'}
                            </div>
                            <div className="text-xs text-gray-600 dark:text-gray-400">
                              {reservation.time}
                            </div>
                          </motion.div>
                        ))
                      ) : (
                        <div className="p-2 text-xs text-gray-400 text-center">
                          Sin reservas
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
