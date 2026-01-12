import React, { useState } from 'react';
import { useCoachStore } from '../../../store/coachStore';

/**
 * Student Filters Component
 * Search and filter controls for students list
 */
export default function StudentFilters({ onFiltersChange }) {
  const { studentFilters, setStudentFilters, clearStudentFilters } = useCoachStore();
  const [localSearch, setLocalSearch] = useState(studentFilters.search || '');

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setLocalSearch(value);
    // Debounce search
    clearTimeout(window.searchTimeout);
    window.searchTimeout = setTimeout(() => {
      setStudentFilters({ search: value });
      onFiltersChange?.();
    }, 300);
  };

  const handleLevelChange = (e) => {
    const value = e.target.value || null;
    setStudentFilters({ level: value });
    onFiltersChange?.();
  };

  const handleSportChange = (e) => {
    const value = e.target.value || null;
    setStudentFilters({ sport: value });
    onFiltersChange?.();
  };

  const handleMemberChange = (e) => {
    const value = e.target.value;
    const isMember = value === '' ? null : value === 'true';
    setStudentFilters({ isMember });
    onFiltersChange?.();
  };

  const handleClearFilters = () => {
    setLocalSearch('');
    clearStudentFilters();
    onFiltersChange?.();
  };

  const hasActiveFilters =
    studentFilters.search ||
    studentFilters.level ||
    studentFilters.sport ||
    studentFilters.isMember !== null;

  return (
    <div className="bg-white dark:bg-navy-light rounded-lg border border-gray-200 dark:border-gray-700 p-4 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Search */}
        <div className="lg:col-span-2">
          <label htmlFor="search" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Buscar
          </label>
          <div className="relative">
            <input
              type="text"
              id="search"
              value={localSearch}
              onChange={handleSearchChange}
              placeholder="Nombre, email o teléfono..."
              className="input pl-10"
            />
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>

        {/* Level Filter */}
        <div>
          <label htmlFor="level" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Nivel
          </label>
          <select
            id="level"
            value={studentFilters.level || ''}
            onChange={handleLevelChange}
            className="input"
          >
            <option value="">Todos los niveles</option>
            <option value="Beginner">Principiante</option>
            <option value="Intermediate">Intermedio</option>
            <option value="Advanced">Avanzado</option>
            <option value="Pro">Profesional</option>
          </select>
        </div>

        {/* Sport Filter */}
        <div>
          <label htmlFor="sport" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Deporte
          </label>
          <select
            id="sport"
            value={studentFilters.sport || ''}
            onChange={handleSportChange}
            className="input"
          >
            <option value="">Todos los deportes</option>
            <option value="Padel">Padel</option>
            <option value="Tenis">Tenis</option>
            <option value="Fútbol">Fútbol</option>
            <option value="Basquet">Basquet</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
        {/* Member Status Filter */}
        <div>
          <label htmlFor="member" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Estado de socio
          </label>
          <select
            id="member"
            value={studentFilters.isMember === null ? '' : String(studentFilters.isMember)}
            onChange={handleMemberChange}
            className="input"
          >
            <option value="">Todos</option>
            <option value="true">Solo socios</option>
            <option value="false">Solo no socios</option>
          </select>
        </div>

        {/* Clear Filters Button */}
        <div className="flex items-end">
          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleClearFilters}
              className="btn btn-outline w-full"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
              Limpiar filtros
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
