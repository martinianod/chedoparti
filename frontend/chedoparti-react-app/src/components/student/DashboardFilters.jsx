import React from 'react';
import { Calendar, CalendarDays, Filter } from 'lucide-react';
import { motion } from 'framer-motion';

/**
 * DashboardFilters Component
 * Controls for view mode, filter type, and date range
 */
export default function DashboardFilters({
  viewMode,
  onViewModeChange,
  filterType,
  onFilterTypeChange,
  dateRange,
  onDateRangeChange
}) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* View Mode Toggle */}
        <div>
          <label className="label mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
            Vista
          </label>
          <div className="flex gap-2">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => onViewModeChange('weekly')}
              className={`btn flex-1 ${
                viewMode === 'weekly' 
                  ? 'btn-primary' 
                  : 'btn-outline'
              }`}
            >
              <CalendarDays className="w-4 h-4 mr-2" />
              Semanal
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => onViewModeChange('daily')}
              className={`btn flex-1 ${
                viewMode === 'daily' 
                  ? 'btn-primary' 
                  : 'btn-outline'
              }`}
            >
              <Calendar className="w-4 h-4 mr-2" />
              Diaria
            </motion.button>
          </div>
        </div>

        {/* Type Filter */}
        <div>
          <label htmlFor="filter-type" className="label mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
            Mostrar
          </label>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              id="filter-type"
              value={filterType}
              onChange={(e) => onFilterTypeChange(e.target.value)}
              className="input w-full pl-10"
            >
              <option value="all">Todas</option>
              <option value="classes">Solo clases</option>
              <option value="reservations">Solo reservas</option>
            </select>
          </div>
        </div>

        {/* Date Range */}
        <div>
          <label className="label mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
            Período
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => onDateRangeChange({ ...dateRange, start: e.target.value })}
              className="input flex-1 text-sm w-full"
            />
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => onDateRangeChange({ ...dateRange, end: e.target.value })}
              className="input flex-1 text-sm w-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
