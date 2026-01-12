import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, X, ChevronDown, ChevronUp } from 'lucide-react';
import { useDashboardFilters, useDashboardActions, useDashboardSelectors } from '../../store/dashboardStore';
import Card from '../ui/Card';

/**
 * AdvancedFilters - Componente de filtros avanzados para el dashboard
 * Permite filtrar por cancha, estado, coach, usuario y rango de fechas
 */
export default function AdvancedFilters({ courts = [], coaches = [], onApply }) {
  const filters = useDashboardFilters();
  const { setFilters, clearFilters, toggleFilter } = useDashboardActions();
  const { hasActiveFilters, getActiveFilterCount } = useDashboardSelectors();
  
  const [isOpen, setIsOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    courts: true,
    states: true,
    coaches: false,
    dateRange: false,
  });

  const activeFilterCount = getActiveFilterCount();
  const hasFilters = hasActiveFilters();

  // Estados disponibles para filtrar
  const availableStates = [
    { value: 'Libre', label: 'Libre', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
    { value: 'Reservado', label: 'Reservado', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
    { value: 'Clase', label: 'Clase', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' },
    { value: 'Mantenimiento', label: 'Mantenimiento', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' },
    { value: 'Torneo', label: 'Torneo', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' },
    { value: 'Evento', label: 'Evento', color: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200' },
  ];

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleApply = () => {
    if (onApply) {
      onApply(filters);
    }
    setIsOpen(false);
  };

  const handleClear = () => {
    clearFilters();
    if (onApply) {
      onApply({
        courts: [],
        states: [],
        coach: null,
        user: null,
        dateRange: null,
      });
    }
  };

  return (
    <div className="relative">
      {/* Botón de filtros */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`btn ${hasFilters ? 'btn-primary' : 'btn-outline'} flex items-center gap-2 relative`}
      >
        <Filter className="w-4 h-4" />
        <span>Filtros</span>
        {activeFilterCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
            {activeFilterCount}
          </span>
        )}
      </button>

      {/* Panel de filtros */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Panel */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute right-0 top-full mt-2 w-80 z-50"
            >
              <Card className="shadow-xl">
                {/* Header */}
                <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-bold text-navy dark:text-gold">Filtros Avanzados</h3>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Filtros */}
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {/* Filtro por Canchas */}
                  <div>
                    <button
                      onClick={() => toggleSection('courts')}
                      className="w-full flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded"
                    >
                      <span className="font-semibold text-sm">Canchas</span>
                      {expandedSections.courts ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                    
                    <AnimatePresence>
                      {expandedSections.courts && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="mt-2 space-y-2"
                        >
                          {courts.map((court) => (
                            <label
                              key={court.id}
                              className="flex items-center gap-2 p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                checked={filters.courts.includes(court.id)}
                                onChange={() => toggleFilter('courts', court.id)}
                                className="rounded border-gray-300 text-navy focus:ring-navy"
                              />
                              <span className="text-sm">{court.name}</span>
                            </label>
                          ))}
                          {courts.length === 0 && (
                            <p className="text-sm text-gray-500 p-2">No hay canchas disponibles</p>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Filtro por Estados */}
                  <div>
                    <button
                      onClick={() => toggleSection('states')}
                      className="w-full flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded"
                    >
                      <span className="font-semibold text-sm">Estados</span>
                      {expandedSections.states ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                    
                    <AnimatePresence>
                      {expandedSections.states && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="mt-2 space-y-2"
                        >
                          {availableStates.map((state) => (
                            <label
                              key={state.value}
                              className="flex items-center gap-2 p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                checked={filters.states.includes(state.value)}
                                onChange={() => toggleFilter('states', state.value)}
                                className="rounded border-gray-300 text-navy focus:ring-navy"
                              />
                              <span className={`text-xs px-2 py-1 rounded ${state.color}`}>
                                {state.label}
                              </span>
                            </label>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Filtro por Coach */}
                  {coaches.length > 0 && (
                    <div>
                      <button
                        onClick={() => toggleSection('coaches')}
                        className="w-full flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded"
                      >
                        <span className="font-semibold text-sm">Entrenador</span>
                        {expandedSections.coaches ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </button>
                      
                      <AnimatePresence>
                        {expandedSections.coaches && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="mt-2"
                          >
                            <select
                              value={filters.coach || ''}
                              onChange={(e) => setFilters({ coach: e.target.value || null })}
                              className="input w-full text-sm"
                            >
                              <option value="">Todos los entrenadores</option>
                              {coaches.map((coach) => (
                                <option key={coach.id} value={coach.id}>
                                  {coach.name}
                                </option>
                              ))}
                            </select>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={handleClear}
                    className="btn btn-outline flex-1"
                    disabled={!hasFilters}
                  >
                    Limpiar
                  </button>
                  <button
                    onClick={handleApply}
                    className="btn btn-primary flex-1"
                  >
                    Aplicar
                  </button>
                </div>
              </Card>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
