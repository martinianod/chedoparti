import React from 'react';
import { motion } from 'framer-motion';
import { LayoutGrid, CalendarDays } from 'lucide-react';
import { useSocioViewMode, useSocioActions } from '../../store/socioDashboardStore';

/**
 * View Toggle Component
 * Switches between cards and calendar views
 */
export default function ViewToggle() {
  const viewMode = useSocioViewMode();
  const { setViewMode } = useSocioActions();

  return (
    <div className="flex gap-2 w-full md:w-auto" role="group" aria-label="Selector de vista">
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={() => setViewMode('cards')}
        className={`btn flex-1 md:flex-none justify-center ${
          viewMode === 'cards' ? 'btn-primary' : 'btn-outline'
        } flex items-center gap-2`}
        aria-pressed={viewMode === 'cards'}
        aria-label="Vista de tarjetas"
      >
        <LayoutGrid className="w-4 h-4" aria-hidden="true" />
        <span>Cards</span>
      </motion.button>
      
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={() => setViewMode('calendar')}
        className={`btn flex-1 md:flex-none justify-center ${
          viewMode === 'calendar' ? 'btn-primary' : 'btn-outline'
        } flex items-center gap-2`}
        aria-pressed={viewMode === 'calendar'}
        aria-label="Vista de calendario"
      >
        <CalendarDays className="w-4 h-4" aria-hidden="true" />
        <span>Calendario</span>
      </motion.button>
    </div>
  );
}
