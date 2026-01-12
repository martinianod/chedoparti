import React from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  BarChart3, 
  Settings, 
  DollarSign, 
  Users, 
  Clock,
  TrendingUp,
  FileText
} from 'lucide-react';

/**
 * NavigationCards - Cards profesionales para navegación rápida
 * Diseño moderno con hover effects y animaciones
 */
export default function NavigationCards({ onNavigate, stats = {} }) {
  const cards = [
    {
      id: 'create-reservation',
      title: 'Nueva Reserva',
      description: 'Crear una nueva reserva rápidamente',
      icon: Calendar,
      color: 'from-blue-500 to-blue-600',
      hoverColor: 'hover:from-blue-600 hover:to-blue-700',
      action: () => onNavigate?.('create-reservation'),
      stat: stats.todayReservations,
      statLabel: 'hoy',
    },
    {
      id: 'statistics',
      title: 'Estadísticas',
      description: 'Ver métricas y reportes',
      icon: BarChart3,
      color: 'from-purple-500 to-purple-600',
      hoverColor: 'hover:from-purple-600 hover:to-purple-700',
      action: () => onNavigate?.('statistics'),
      stat: stats.occupancyRate,
      statLabel: 'ocupación',
    },
    {
      id: 'courts',
      title: 'Gestionar Canchas',
      description: 'Configurar canchas y horarios',
      icon: Settings,
      color: 'from-green-500 to-green-600',
      hoverColor: 'hover:from-green-600 hover:to-green-700',
      action: () => onNavigate?.('courts'),
      stat: stats.activeCourts,
      statLabel: 'activas',
    },
    {
      id: 'pricing',
      title: 'Configurar Precios',
      description: 'Gestionar tarifas y promociones',
      icon: DollarSign,
      color: 'from-amber-500 to-amber-600',
      hoverColor: 'hover:from-amber-600 hover:to-amber-700',
      action: () => onNavigate?.('pricing'),
      stat: stats.revenue,
      statLabel: 'ingresos',
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 15,
      },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
    >
      {cards.map((card) => {
        const Icon = card.icon;
        
        return (
          <motion.div
            key={card.id}
            variants={cardVariants}
            whileHover={{ scale: 1.03, y: -5 }}
            whileTap={{ scale: 0.98 }}
            className="cursor-pointer"
            onClick={card.action}
          >
            <div className={`
              relative overflow-hidden rounded-xl p-6
              bg-gradient-to-br ${card.color} ${card.hoverColor}
              text-white shadow-lg hover:shadow-xl
              transition-all duration-300
            `}>
              {/* Background pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute -right-8 -top-8 w-32 h-32 bg-white rounded-full" />
                <div className="absolute -left-4 -bottom-4 w-24 h-24 bg-white rounded-full" />
              </div>

              {/* Content */}
              <div className="relative z-10">
                {/* Icon */}
                <div className="mb-4">
                  <div className="inline-flex p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                    <Icon className="w-6 h-6" />
                  </div>
                </div>

                {/* Title & Description */}
                <h3 className="text-xl font-bold mb-1">{card.title}</h3>
                <p className="text-sm text-white/80 mb-4">{card.description}</p>

                {/* Stat */}
                {card.stat !== undefined && (
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold">{card.stat}</span>
                    <span className="text-sm text-white/80">{card.statLabel}</span>
                  </div>
                )}
              </div>

              {/* Hover indicator */}
              <motion.div
                className="absolute bottom-0 left-0 right-0 h-1 bg-white/30"
                initial={{ scaleX: 0 }}
                whileHover={{ scaleX: 1 }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}

/**
 * QuickActionCards - Variante compacta para acciones rápidas
 */
export function QuickActionCards({ actions = [] }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {actions.map((action, index) => {
        const Icon = action.icon;
        
        return (
          <motion.button
            key={action.id || index}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={action.onClick}
            className="p-4 bg-white dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-navy dark:hover:border-gold transition-all shadow-sm hover:shadow-md"
          >
            <div className="flex flex-col items-center gap-2 text-center">
              <div className="p-2 bg-navy/10 dark:bg-gold/10 rounded-lg">
                <Icon className="w-5 h-5 text-navy dark:text-gold" />
              </div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {action.label}
              </span>
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}

/**
 * StatCards - Cards para mostrar estadísticas
 */
export function StatCards({ stats = [] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon || TrendingUp;
        const isPositive = stat.trend > 0;
        
        return (
          <motion.div
            key={stat.id || index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                <Icon className="w-6 h-6 text-navy dark:text-gold" />
              </div>
              {stat.trend !== undefined && (
                <span className={`text-sm font-medium ${
                  isPositive ? 'text-green-600' : 'text-red-600'
                }`}>
                  {isPositive ? '+' : ''}{stat.trend}%
                </span>
              )}
            </div>
            
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                {stat.label}
              </p>
              <p className="text-3xl font-bold text-navy dark:text-gold">
                {stat.value}
              </p>
              {stat.subtitle && (
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  {stat.subtitle}
                </p>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
