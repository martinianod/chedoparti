import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Calendar } from 'lucide-react';
import ReservationCard from './ReservationCard';
import { formatGroupHeader } from '../../utils/reservationGrouping';
import { useSocioExpandedSections, useSocioActions } from '../../store/socioDashboardStore';

/**
 * Reservation List Component
 * Groups reservations by date with collapsible sections
 */
export default function ReservationList({ groupedReservations, onCancel, onDetailClick }) {
  const expandedSections = useSocioExpandedSections();
  const { toggleSection } = useSocioActions();

  if (!groupedReservations || groupedReservations.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {groupedReservations.map(([dateKey, data]) => {
        const reservations = data.reservations || data;
        const isExpanded = expandedSections.has(dateKey);
        const formattedDate = formatGroupHeader(dateKey);

        return (
          <motion.div
            key={dateKey}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
          >
            {/* Section Header */}
            <button
              onClick={() => toggleSection(dateKey)}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              aria-expanded={isExpanded}
              aria-controls={`reservations-${dateKey}`}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-50 dark:bg-green-900/20">
                  <Calendar className="w-5 h-5 text-green-600 dark:text-green-400" aria-hidden="true" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-gray-900 dark:text-white capitalize">
                    {formattedDate}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {reservations.length} {reservations.length === 1 ? 'reserva' : 'reservas'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {isExpanded ? (
                  <ChevronUp className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                )}
              </div>
            </button>

            {/* Section Content */}
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  id={`reservations-${dateKey}`}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="border-t border-gray-200 dark:border-gray-700"
                >
                  <div className="p-4 space-y-3">
                    {reservations.map((reservation, index) => (
                      <motion.div
                        key={reservation.id || index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <ReservationCard
                          reservation={reservation}
                          onCancel={onCancel}
                          onDetailClick={onDetailClick}
                        />
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </div>
  );
}
