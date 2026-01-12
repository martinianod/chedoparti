import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Filter, ChevronDown, ChevronUp } from 'lucide-react';
import { useSocioFilters, useSocioActions, useSocioSelectors, useSocioShowFilters } from '../../store/socioDashboardStore';

/**
 * Dashboard Filters Component
 * Advanced filtering system with chips - Collapsible
 */
export default function DashboardFilters() {
  const filters = useSocioFilters();
  const actions = useSocioActions();
  const selectors = useSocioSelectors();
  const showFilters = useSocioShowFilters();
  
  const hasActiveFilters = selectors.hasActiveFilters();

  const timeRangeOptions = [
    { value: 'day', label: 'Hoy' },
    { value: 'week', label: 'Semana' },
    { value: 'upcoming', label: 'Próximas' },
    { value: 'history', label: 'Historial' },
  ];

  const typeOptions = [
    { value: 'all', label: 'Todas' },
    { value: 'reservations', label: 'Reservas' },
    { value: 'classes', label: 'Clases' },
    { value: 'tournaments', label: 'Torneos' },
    { value: 'fixed', label: 'Fijos' },
  ];

  const sportOptions = [
    { value: 'all', label: 'Todos' },
    { value: 'Padel', label: '🎾 Pádel' },
    { value: 'Tenis', label: '🎾 Tenis' },
    { value: 'Futbol', label: '⚽ Fútbol' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 mb-6 overflow-hidden"
    >
      {/* Header - Always Visible */}
      <button
        onClick={actions.toggleFilters}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-600 dark:text-gray-400" aria-hidden="true" />
          <h3 className="font-semibold text-gray-900 dark:text-white">
            Filtros
          </h3>
          {hasActiveFilters && (
            <span className="px-2 py-0.5 text-xs font-medium bg-navy dark:bg-gold text-white dark:text-navy rounded-full">
              {selectors.getActiveFilterCount()}
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={(e) => {
                e.stopPropagation();
                actions.resetFilters();
              }}
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-navy dark:hover:text-gold flex items-center gap-1 mr-2"
            >
              <X className="w-4 h-4" />
              <span>Limpiar</span>
            </motion.button>
          )}
          
          {showFilters ? (
            <ChevronUp className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          )}
        </div>
      </button>

      {/* Filters Grid - Collapsible */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="border-t border-gray-200 dark:border-gray-700"
          >
            <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Time Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Período
                </label>
                <div className="flex flex-wrap gap-2">
                  {timeRangeOptions.map((option) => (
                    <FilterChip
                      key={option.value}
                      label={option.label}
                      active={filters.timeRange === option.value}
                      onClick={() => actions.setTimeRange(option.value)}
                    />
                  ))}
                </div>
              </div>

              {/* Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tipo
                </label>
                <div className="flex flex-wrap gap-2">
                  {typeOptions.map((option) => (
                    <FilterChip
                      key={option.value}
                      label={option.label}
                      active={filters.type === option.value}
                      onClick={() => actions.setFilterType(option.value)}
                    />
                  ))}
                </div>
              </div>

              {/* Sport */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Deporte
                </label>
                <div className="flex flex-wrap gap-2">
                  {sportOptions.map((option) => (
                    <FilterChip
                      key={option.value}
                      label={option.label}
                      active={filters.sport === option.value}
                      onClick={() => actions.setFilterSport(option.value)}
                    />
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/**
 * Filter Chip Component
 */
function FilterChip({ label, active, onClick }) {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
        active
          ? 'bg-navy dark:bg-gold text-white dark:text-navy'
          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
      }`}
    >
      {label}
    </motion.button>
  );
}
