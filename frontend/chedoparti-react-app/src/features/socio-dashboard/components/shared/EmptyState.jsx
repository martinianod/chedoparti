import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, GraduationCap, Search, Inbox } from 'lucide-react';

/**
 * Empty State Component
 * Displays contextual empty states with illustrations and CTAs
 */
export default function EmptyState({ variant = 'no-data', onAction, actionLabel }) {
  const variants = {
    'no-reservations': {
      icon: Calendar,
      title: 'No tienes reservas',
      description: 'Aún no has realizado ninguna reserva. ¡Comienza a reservar tu cancha favorita!',
      emoji: '📅',
      actionLabel: actionLabel || 'Crear Reserva',
    },
    'no-classes': {
      icon: GraduationCap,
      title: 'No tienes clases',
      description: 'No estás inscrito en ninguna clase actualmente.',
      emoji: '🎓',
      actionLabel: actionLabel || 'Ver Clases Disponibles',
    },
    'no-results': {
      icon: Search,
      title: 'Sin resultados',
      description: 'No encontramos actividades que coincidan con tus filtros. Intenta ajustar los criterios de búsqueda.',
      emoji: '🔍',
      actionLabel: actionLabel || 'Limpiar Filtros',
    },
    'no-data': {
      icon: Inbox,
      title: 'No hay actividades programadas',
      description: 'No tienes clases ni reservas para este período.',
      emoji: '📭',
      actionLabel: actionLabel || null,
    },
  };

  const config = variants[variant] || variants['no-data'];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center justify-center py-16 px-4 text-center"
    >
      {/* Icon/Emoji */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
        className="mb-6"
      >
        <div className="w-24 h-24 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
          <span className="text-5xl" role="img" aria-label={config.title}>
            {config.emoji}
          </span>
        </div>
      </motion.div>

      {/* Title */}
      <h3 className="text-2xl font-bold text-navy dark:text-gold mb-3">
        {config.title}
      </h3>

      {/* Description */}
      <p className="text-gray-600 dark:text-gray-400 max-w-md mb-6">
        {config.description}
      </p>

      {/* Action Button */}
      {config.actionLabel && onAction && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onAction}
          className="btn btn-primary px-6 py-3 flex items-center gap-2"
        >
          <Icon className="w-5 h-5" />
          <span>{config.actionLabel}</span>
        </motion.button>
      )}
    </motion.div>
  );
}
