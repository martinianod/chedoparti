import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, CalendarDays, List } from 'lucide-react';
import { useDashboardViewMode, useDashboardActions } from '../../store/dashboardStore';

/**
 * ViewSwitcher - Componente para cambiar entre vistas del dashboard
 * Soporta: Día, Semana, Agenda
 */
export default function ViewSwitcher() {
  const viewMode = useDashboardViewMode();
  const { setViewMode } = useDashboardActions();

  const views = [
    {
      id: 'day',
      label: 'Día',
      icon: Calendar,
      description: 'Vista de un solo día con grilla de horarios',
    },
    {
      id: 'week',
      label: 'Semana',
      icon: CalendarDays,
      description: 'Vista de 7 días con grilla horizontal',
    },
    {
      id: 'agenda',
      label: 'Agenda',
      icon: List,
      description: 'Lista cronológica estilo Google Calendar',
    },
  ];

  return (
    <div className="flex gap-2 bg-white dark:bg-gray-800 p-1 rounded-lg border border-gray-200 dark:border-gray-700">
      {views.map((view) => {
        const Icon = view.icon;
        const isActive = viewMode === view.id;

        return (
          <motion.button
            key={view.id}
            onClick={() => setViewMode(view.id)}
            className={`
              relative px-4 py-2 rounded-md text-sm font-medium transition-colors
              flex items-center gap-2
              ${
                isActive
                  ? 'text-white dark:text-navy'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }
            `}
            whileTap={{ scale: 0.95 }}
            title={view.description}
          >
            {isActive && (
              <motion.div
                layoutId="activeView"
                className="absolute inset-0 bg-navy dark:bg-gold rounded-md"
                initial={false}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            )}
            <Icon className="w-4 h-4 relative z-10" />
            <span className="relative z-10">{view.label}</span>
          </motion.button>
        );
      })}
    </div>
  );
}

/**
 * CompactViewSwitcher - Versión compacta solo con iconos
 */
export function CompactViewSwitcher() {
  const viewMode = useDashboardViewMode();
  const { setViewMode } = useDashboardActions();

  const views = [
    { id: 'day', icon: Calendar, label: 'Día' },
    { id: 'week', icon: CalendarDays, label: 'Semana' },
    { id: 'agenda', icon: List, label: 'Agenda' },
  ];

  return (
    <div className="flex gap-1 bg-white dark:bg-gray-800 p-1 rounded-lg border border-gray-200 dark:border-gray-700">
      {views.map((view) => {
        const Icon = view.icon;
        const isActive = viewMode === view.id;

        return (
          <motion.button
            key={view.id}
            onClick={() => setViewMode(view.id)}
            className={`
              relative p-2 rounded-md transition-colors
              ${
                isActive
                  ? 'bg-navy dark:bg-gold text-white dark:text-navy'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }
            `}
            whileTap={{ scale: 0.95 }}
            title={view.label}
          >
            <Icon className="w-5 h-5" />
          </motion.button>
        );
      })}
    </div>
  );
}
