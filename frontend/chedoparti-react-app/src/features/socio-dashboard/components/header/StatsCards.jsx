import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, GraduationCap, Clock, TrendingUp } from 'lucide-react';

/**
 * Stats Cards Component
 * Displays dashboard statistics in colored cards
 */
export default function StatsCards({ stats }) {
  const cards = [
    {
      label: 'Próximas Reservas',
      value: stats?.upcomingReservationsCount || 0,
      icon: Calendar,
      color: 'green',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      iconColor: 'text-green-600 dark:text-green-400',
      textColor: 'text-green-700 dark:text-green-300',
    },
    {
      label: 'Próximas Clases',
      value: stats?.upcomingClassesCount || 0,
      icon: GraduationCap,
      color: 'purple',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      iconColor: 'text-purple-600 dark:text-purple-400',
      textColor: 'text-purple-700 dark:text-purple-300',
    },
    {
      label: 'Siguiente Actividad',
      value: stats?.nextReservation ? 'Hoy' : 'Sin actividad',
      icon: Clock,
      color: 'blue',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      iconColor: 'text-blue-600 dark:text-blue-400',
      textColor: 'text-blue-700 dark:text-blue-300',
      isText: true,
    },
    {
      label: 'Asistencia',
      value: `${stats?.attendanceRate || 0}%`,
      icon: TrendingUp,
      color: 'yellow',
      bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
      iconColor: 'text-yellow-600 dark:text-yellow-400',
      textColor: 'text-yellow-700 dark:text-yellow-300',
      isText: true,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => {
        const Icon = card.icon;
        
        return (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`${card.bgColor} rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className={`p-2 rounded-lg ${card.bgColor}`}>
                <Icon className={`w-5 h-5 ${card.iconColor}`} aria-hidden="true" />
              </div>
            </div>
            
            <div>
              <motion.div
                key={card.value}
                initial={{ scale: 1.2, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className={`text-3xl font-bold ${card.textColor} mb-1`}
              >
                {card.value}
              </motion.div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {card.label}
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
